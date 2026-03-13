package de.portalcore.service;

import de.portalcore.entity.OtpCode;
import de.portalcore.repository.OtpCodeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);

    private final OtpCodeRepository otpCodeRepository;
    private final EmailConfigService emailConfigService;
    private final JavaMailSender fallbackMailSender;

    @Value("${portal.otp.length:6}")
    private int otpLengthDefault;

    @Value("${portal.otp.expiration-minutes:10}")
    private int expirationMinutesDefault;

    @Value("${portal.otp.max-attempts:5}")
    private int maxAttemptsDefault;

    @Value("${portal.otp.rate-limit-per-hour:5}")
    private int rateLimitPerHourDefault;

    @Value("${portal.otp.send-mail:true}")
    private boolean sendMailDefault;

    private final SecureRandom secureRandom = new SecureRandom();

    public OtpService(OtpCodeRepository otpCodeRepository,
                      EmailConfigService emailConfigService,
                      Optional<JavaMailSender> mailSender) {
        this.otpCodeRepository = otpCodeRepository;
        this.emailConfigService = emailConfigService;
        this.fallbackMailSender = mailSender.orElse(null);
    }

    private int getOtpLength() {
        return emailConfigService.getIntParam("portal.auth.otp.length", otpLengthDefault);
    }

    private int getExpirationMinutes() {
        return emailConfigService.getIntParam("portal.auth.otp.expiration-minutes", expirationMinutesDefault);
    }

    private int getMaxAttempts() {
        return emailConfigService.getIntParam("portal.auth.otp.max-attempts", maxAttemptsDefault);
    }

    private int getRateLimitPerHour() {
        return emailConfigService.getIntParam("portal.auth.otp.rate-limit", rateLimitPerHourDefault);
    }

    private boolean isSendMailEnabled() {
        return emailConfigService.isEmailAuthEnabled() && emailConfigService.isSmtpConfigured();
    }

    public String generateAndSendOtp(String email, String ipAdresse) {
        // Rate Limiting
        long recentCount = otpCodeRepository.countRecentByEmail(email, LocalDateTime.now().minusHours(1));
        if (recentCount >= getRateLimitPerHour()) {
            throw new IllegalStateException("Zu viele Anmeldeversuche. Bitte versuchen Sie es spaeter erneut.");
        }

        int expMinutes = getExpirationMinutes();

        // Code generieren
        String code = generateCode();

        OtpCode otpCode = OtpCode.builder()
                .id(UUID.randomUUID().toString())
                .email(email)
                .code(code)
                .erstelltAm(LocalDateTime.now())
                .gueltigBis(LocalDateTime.now().plusMinutes(expMinutes))
                .verwendet(false)
                .ipAdresse(ipAdresse)
                .versuche(0)
                .build();

        otpCodeRepository.save(otpCode);

        // E-Mail senden
        if (isSendMailEnabled()) {
            sendOtpEmail(email, code, expMinutes);
        } else {
            log.info("OTP fuer {}: {} (E-Mail-Versand deaktiviert)", email, code);
        }

        return otpCode.getId();
    }

    public boolean verifyOtp(String email, String code) {
        Optional<OtpCode> otpOpt = otpCodeRepository
                .findTopByEmailAndVerwendetFalseAndGueltigBisAfterOrderByErstelltAmDesc(
                        email, LocalDateTime.now());

        if (otpOpt.isEmpty()) {
            return false;
        }

        OtpCode otp = otpOpt.get();

        // Max Versuche pruefen
        if (otp.getVersuche() >= getMaxAttempts()) {
            otp.setVerwendet(true);
            otpCodeRepository.save(otp);
            return false;
        }

        otp.setVersuche(otp.getVersuche() + 1);

        if (otp.getCode().equals(code)) {
            otp.setVerwendet(true);
            otpCodeRepository.save(otp);
            return true;
        }

        otpCodeRepository.save(otp);
        return false;
    }

    public void cleanupExpired() {
        otpCodeRepository.deleteExpired(LocalDateTime.now().minusDays(1));
    }

    private String generateCode() {
        int length = getOtpLength();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(secureRandom.nextInt(10));
        }
        return sb.toString();
    }

    private void sendOtpEmail(String to, String code, int expMinutes) {
        try {
            JavaMailSender sender = emailConfigService.isSmtpConfigured()
                    ? emailConfigService.createMailSender()
                    : fallbackMailSender;

            if (sender == null) {
                log.warn("Kein Mail-Sender verfuegbar. OTP fuer {} (Fallback): {}", to, code);
                return;
            }

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(emailConfigService.getFromAddress());
            message.setTo(to);
            message.setSubject("Health Portal - Ihr Anmeldecode");
            message.setText(String.format(
                    "Guten Tag,\n\n" +
                    "Ihr Einmal-Code fuer die Anmeldung am Health Portal lautet:\n\n" +
                    "    %s\n\n" +
                    "Dieser Code ist %d Minuten gueltig.\n\n" +
                    "Falls Sie diese Anmeldung nicht angefordert haben, " +
                    "ignorieren Sie bitte diese E-Mail.\n\n" +
                    "Mit freundlichen Gruessen\n" +
                    "Ihr Health Portal Team",
                    code, expMinutes));
            sender.send(message);
            log.info("OTP-Email an {} gesendet", to);
        } catch (Exception e) {
            log.error("Fehler beim Senden der OTP-Email an {}: {}", to, e.getMessage());
            log.info("OTP fuer {} (Fallback): {}", to, code);
        }
    }
}

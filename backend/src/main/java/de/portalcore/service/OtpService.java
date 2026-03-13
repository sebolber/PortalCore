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
    private final JavaMailSender mailSender;

    @Value("${portal.otp.length:6}")
    private int otpLength;

    @Value("${portal.otp.expiration-minutes:10}")
    private int expirationMinutes;

    @Value("${portal.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${portal.otp.rate-limit-per-hour:5}")
    private int rateLimitPerHour;

    @Value("${portal.email.from:noreply@health-portal.de}")
    private String fromEmail;

    @Value("${portal.otp.send-mail:true}")
    private boolean sendMail;

    private final SecureRandom secureRandom = new SecureRandom();

    public OtpService(OtpCodeRepository otpCodeRepository,
                      Optional<JavaMailSender> mailSender) {
        this.otpCodeRepository = otpCodeRepository;
        this.mailSender = mailSender.orElse(null);
    }

    public String generateAndSendOtp(String email, String ipAdresse) {
        // Rate Limiting
        long recentCount = otpCodeRepository.countRecentByEmail(email, LocalDateTime.now().minusHours(1));
        if (recentCount >= rateLimitPerHour) {
            throw new IllegalStateException("Zu viele Anmeldeversuche. Bitte versuchen Sie es spaeter erneut.");
        }

        // Code generieren
        String code = generateCode();

        OtpCode otpCode = OtpCode.builder()
                .id(UUID.randomUUID().toString())
                .email(email)
                .code(code)
                .erstelltAm(LocalDateTime.now())
                .gueltigBis(LocalDateTime.now().plusMinutes(expirationMinutes))
                .verwendet(false)
                .ipAdresse(ipAdresse)
                .versuche(0)
                .build();

        otpCodeRepository.save(otpCode);

        // E-Mail senden
        if (sendMail && mailSender != null) {
            sendOtpEmail(email, code);
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
        if (otp.getVersuche() >= maxAttempts) {
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
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            sb.append(secureRandom.nextInt(10));
        }
        return sb.toString();
    }

    private void sendOtpEmail(String to, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
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
                    code, expirationMinutes));
            mailSender.send(message);
            log.info("OTP-Email an {} gesendet", to);
        } catch (Exception e) {
            log.error("Fehler beim Senden der OTP-Email an {}: {}", to, e.getMessage());
            log.info("OTP fuer {} (Fallback): {}", to, code);
        }
    }
}

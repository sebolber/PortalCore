package de.portalcore.service;

import de.portalcore.entity.PortalParameter;
import de.portalcore.repository.PortalParameterRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

/**
 * Liest E-Mail-Konfiguration dynamisch aus der PortalParameter-Tabelle.
 * Erstellt bei Bedarf einen frischen JavaMailSender basierend auf den aktuellen Parametern.
 */
@Service
@Transactional(readOnly = true)
public class EmailConfigService {

    private static final Logger log = LoggerFactory.getLogger(EmailConfigService.class);

    private final PortalParameterRepository parameterRepository;

    public EmailConfigService(PortalParameterRepository parameterRepository) {
        this.parameterRepository = parameterRepository;
    }

    /**
     * Liefert den aktuellen Wert eines E-Mail-Parameters.
     */
    public String getParam(String key) {
        return parameterRepository.findGlobalByKey(key)
                .map(PortalParameter::getValue)
                .orElse("");
    }

    public String getParam(String key, String defaultValue) {
        return parameterRepository.findGlobalByKey(key)
                .map(p -> p.getValue() != null && !p.getValue().isBlank() ? p.getValue() : defaultValue)
                .orElse(defaultValue);
    }

    public boolean getBoolParam(String key, boolean defaultValue) {
        return parameterRepository.findGlobalByKey(key)
                .map(p -> "true".equalsIgnoreCase(p.getValue()))
                .orElse(defaultValue);
    }

    public int getIntParam(String key, int defaultValue) {
        return parameterRepository.findGlobalByKey(key)
                .map(p -> {
                    try {
                        return Integer.parseInt(p.getValue());
                    } catch (NumberFormatException e) {
                        return defaultValue;
                    }
                })
                .orElse(defaultValue);
    }

    /**
     * Erstellt einen JavaMailSender basierend auf den aktuellen SMTP-Parametern aus der DB.
     */
    public JavaMailSender createMailSender() {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(getParam("portal.email.smtp.host", "localhost"));
        sender.setPort(getIntParam("portal.email.smtp.port", 25));
        sender.setUsername(getParam("portal.email.smtp.username"));
        sender.setPassword(getParam("portal.email.smtp.password"));

        int port = sender.getPort();
        boolean isSslEnabled = getBoolParam("portal.email.smtp.ssl", false);
        boolean isStarttlsEnabled = getBoolParam("portal.email.smtp.starttls", false);

        // Port 587 erfordert immer STARTTLS, Port 465 erfordert direktes SSL
        if (port == 587) {
            isSslEnabled = false;
            isStarttlsEnabled = true;
        } else if (port == 465) {
            isSslEnabled = true;
            isStarttlsEnabled = false;
        }

        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", String.valueOf(getBoolParam("portal.email.smtp.auth", false)));
        props.put("mail.smtp.ssl.enable", String.valueOf(isSslEnabled));
        props.put("mail.smtp.starttls.enable", String.valueOf(isStarttlsEnabled));

        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");

        return sender;
    }

    /**
     * Liefert die Absender-E-Mail aus der DB.
     */
    public String getFromAddress() {
        return getParam("portal.email.from", "noreply@health-portal.de");
    }

    /**
     * Prueft ob E-Mail-Authentifizierung (OTP per Mail) aktiviert ist.
     */
    public boolean isEmailAuthEnabled() {
        return getBoolParam("portal.auth.email.enabled", true);
    }

    /**
     * Prueft ob SMTP korrekt konfiguriert ist (Host nicht leer).
     */
    public boolean isSmtpConfigured() {
        String host = getParam("portal.email.smtp.host");
        return host != null && !host.isBlank();
    }

    /**
     * Liefert alle E-Mail-Parameter als Map (fuer Export/Frontend).
     */
    public Map<String, String> getAllEmailParams() {
        return parameterRepository.findGlobalByKeyStartingWith("portal.email.%")
                .stream()
                .collect(Collectors.toMap(
                        PortalParameter::getKey,
                        p -> p.isSensitive() ? "***" : (p.getValue() != null ? p.getValue() : "")
                ));
    }
}

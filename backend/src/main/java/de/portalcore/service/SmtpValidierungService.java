package de.portalcore.service;

import de.portalcore.dto.SmtpKonfigurationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Properties;

import jakarta.mail.Session;
import jakarta.mail.Transport;

/**
 * Validiert SMTP-Verbindungsparameter durch einen echten Verbindungstest.
 */
@Service
public class SmtpValidierungService {

    private static final Logger log = LoggerFactory.getLogger(SmtpValidierungService.class);
    private static final int VERBINDUNGS_TIMEOUT_MS = 10_000;

    public void validateSmtpVerbindung(SmtpKonfigurationRequest request) {
        Properties props = buildMailProperties(request);
        Session session = Session.getInstance(props);

        try {
            Transport transport = session.getTransport("smtp");
            try {
                if (request.authentifizierungAktiv() && request.benutzername() != null) {
                    transport.connect(request.host(), request.port(),
                            request.benutzername(), request.passwort());
                } else {
                    transport.connect(request.host(), request.port(), null, null);
                }
                log.info("SMTP-Verbindungstest erfolgreich: host={}, port={}", request.host(), request.port());
            } finally {
                transport.close();
            }
        } catch (Exception e) {
            log.warn("SMTP-Verbindungstest fehlgeschlagen: host={}, port={}, fehler={}",
                    request.host(), request.port(), e.getMessage());
            throw new IllegalArgumentException(
                    "SMTP-Verbindung fehlgeschlagen: " + e.getMessage());
        }
    }

    private Properties buildMailProperties(SmtpKonfigurationRequest request) {
        Properties props = new Properties();
        props.put("mail.smtp.host", request.host());
        props.put("mail.smtp.port", String.valueOf(request.port()));
        props.put("mail.smtp.connectiontimeout", String.valueOf(VERBINDUNGS_TIMEOUT_MS));
        props.put("mail.smtp.timeout", String.valueOf(VERBINDUNGS_TIMEOUT_MS));

        if (request.authentifizierungAktiv()) {
            props.put("mail.smtp.auth", "true");
        }

        switch (request.verschluesselung()) {
            case "TLS" -> props.put("mail.smtp.starttls.enable", "true");
            case "SSL" -> {
                props.put("mail.smtp.ssl.enable", "true");
                props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
            }
            default -> { /* NONE: keine Verschluesselung */ }
        }

        return props;
    }
}

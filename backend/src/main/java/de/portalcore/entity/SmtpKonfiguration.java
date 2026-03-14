package de.portalcore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "smtp_konfiguration")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SmtpKonfiguration {

    public static final String DEFAULT_ID = "DEFAULT";

    @Id
    private String id;

    @Column(nullable = false)
    private String host;

    @Column(nullable = false)
    private int port;

    private String benutzername;

    @Column(name = "passwort_verschluesselt")
    private String passwortVerschluesselt;

    @Column(nullable = false)
    @Builder.Default
    private String verschluesselung = "TLS";

    @Column(name = "absender_name", nullable = false)
    private String absenderName;

    @Column(name = "absender_email", nullable = false)
    private String absenderEmail;

    @Column(name = "authentifizierung_aktiv", nullable = false)
    @Builder.Default
    private boolean authentifizierungAktiv = true;

    @Column(name = "erstellt_am", nullable = false)
    @Builder.Default
    private LocalDateTime erstelltAm = LocalDateTime.now();

    @Column(name = "aktualisiert_am")
    private LocalDateTime aktualisiertAm;
}

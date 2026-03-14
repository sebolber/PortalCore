package de.portalcore.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import de.portalcore.enums.UserStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "portal_users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PortalUser {

    @Id
    private String id;

    @NotBlank(message = "Vorname ist erforderlich")
    @Column(nullable = false)
    private String vorname;

    @NotBlank(message = "Nachname ist erforderlich")
    @Column(nullable = false)
    private String nachname;

    @NotBlank(message = "E-Mail ist erforderlich")
    @Email(message = "E-Mail-Adresse muss gueltig sein")
    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(name = "iam_id")
    private String iamId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Tenant tenant;

    @Transient
    private String mandantId;

    @NotNull(message = "Status ist erforderlich")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    @JsonIgnoreProperties({"berechtigungen"})
    private Set<PortalRolle> rollen = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_gruppen",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "gruppe_id")
    )
    @Builder.Default
    @JsonIgnoreProperties({"benutzer", "berechtigungen"})
    private Set<Gruppe> gruppen = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnoreProperties("user")
    private List<UserAdresse> adressen = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnoreProperties("user")
    private List<DashboardWidget> dashboardWidgets = new ArrayList<>();

    @Column(name = "letzter_login")
    private LocalDateTime letzterLogin;

    @Column(name = "erstellt_am")
    private LocalDateTime erstelltAm;

    @Column(name = "iam_sync")
    private boolean iamSync;

    @Column(nullable = false)
    private String initialen;

    // Erweiterte Personendaten
    private String anrede;
    private String titel;
    private String telefon;
    private String mobil;
    private String abteilung;

    @Column(name = "position_titel")
    private String positionTitel;

    @Column(name = "geburtsdatum")
    private LocalDate geburtsdatum;

    @Column(name = "super_admin")
    private boolean superAdmin;

    // Neue Felder

    @Column(name = "fehlgeschlagene_logins")
    @Builder.Default
    private int fehlgeschlageneLogins = 0;

    @Column(name = "letzte_login_ip")
    private String letzteLoginIp;

    @Builder.Default
    private String sprache = "de";

    @Builder.Default
    private String zeitzone = "Europe/Berlin";

    @Column(name = "dark_mode")
    private boolean darkMode;

    @Column(name = "standard_dashboard")
    private String standardDashboard;

    @Column(name = "email_benachrichtigungen")
    @Builder.Default
    private boolean emailBenachrichtigungen = true;

    @Column(name = "push_benachrichtigungen")
    private boolean pushBenachrichtigungen;

    @Column(name = "sms_benachrichtigungen")
    private boolean smsBenachrichtigungen;

    @Column(name = "newsletter_einwilligung")
    private boolean newsletterEinwilligung;

    @Column(name = "letzte_aenderung_am")
    private LocalDateTime letzteAenderungAm;

    @Column(name = "erstellt_von")
    private String erstelltVon;

    @Column(name = "zuletzt_geaendert_von")
    private String zuletztGeaendertVon;

    @Column(name = "audit_trail_id")
    private String auditTrailId;

    @Column(name = "delegationsrechte")
    private boolean delegationsrechte;

    // Stellvertretung / Vertreterregelung
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_stellvertreter",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "stellvertreter_id")
    )
    @Builder.Default
    @JsonIgnoreProperties({"stellvertreter", "rollen", "gruppen", "adressen", "tenant"})
    private Set<PortalUser> stellvertreter = new HashSet<>();

    @PrePersist
    void prePersist() {
        if (erstelltAm == null) erstelltAm = LocalDateTime.now();
        if (letzteAenderungAm == null) letzteAenderungAm = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        letzteAenderungAm = LocalDateTime.now();
    }
}

package de.portalcore.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import de.portalcore.enums.UserStatus;
import jakarta.persistence.*;
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

    @Column(nullable = false)
    private String vorname;

    @Column(nullable = false)
    private String nachname;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "iam_id")
    private String iamId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Tenant tenant;

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
}

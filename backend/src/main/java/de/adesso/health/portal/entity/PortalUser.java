package de.adesso.health.portal.entity;

import de.adesso.health.portal.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
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
    private Set<PortalRolle> rollen = new HashSet<>();

    @Column(name = "letzter_login")
    private LocalDateTime letzterLogin;

    @Column(name = "erstellt_am")
    private LocalDateTime erstelltAm;

    @Column(name = "iam_sync")
    private boolean iamSync;

    @Column(nullable = false)
    private String initialen;

    @Column(name = "password_hash")
    private String passwordHash;
}

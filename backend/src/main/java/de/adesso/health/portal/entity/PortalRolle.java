package de.adesso.health.portal.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "portal_rollen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PortalRolle {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String beschreibung;

    private int hierarchie;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    @Builder.Default
    private Set<Berechtigung> berechtigungen = new HashSet<>();

    @Column(nullable = false)
    private String scope;

    @Column(name = "benutzer_anzahl")
    private int benutzerAnzahl;

    @Column(name = "system_rolle")
    private boolean systemRolle;

    private String farbe;
}

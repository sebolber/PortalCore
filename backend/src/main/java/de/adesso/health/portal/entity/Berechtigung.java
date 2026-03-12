package de.adesso.health.portal.entity;

import de.adesso.health.portal.enums.BerechtigungTyp;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "berechtigungen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Berechtigung {

    @Id
    private String id;

    @Column(name = "permission_key", nullable = false, unique = true)
    private String key;

    @Column(nullable = false)
    private String label;

    private String beschreibung;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BerechtigungTyp typ;

    @Column(name = "app_id")
    private String appId;

    @Column(name = "app_name")
    private String appName;

    private String gruppe;
}

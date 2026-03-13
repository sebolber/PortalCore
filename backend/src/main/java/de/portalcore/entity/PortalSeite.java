package de.portalcore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "portal_seiten")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PortalSeite {

    @Id
    private String id;

    @Column(name = "seiten_key", nullable = false, unique = true)
    private String seitenKey;

    @Column(nullable = false)
    private String titel;

    @Column(columnDefinition = "TEXT")
    private String beschreibung;

    @Column(nullable = false)
    private String route;

    @Column(name = "icon_path")
    private String iconPath;

    @Column(nullable = false)
    private String kategorie;

    @Column(name = "app_id")
    private String appId;

    @Column(nullable = false)
    private boolean aktiv;
}

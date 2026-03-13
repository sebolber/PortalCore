package de.portalcore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "widget_definitionen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WidgetDefinition {

    @Id
    private String id;

    @Column(name = "widget_key", nullable = false, unique = true)
    private String widgetKey;

    @Column(nullable = false)
    private String titel;

    @Column(columnDefinition = "TEXT")
    private String beschreibung;

    @Column(nullable = false)
    private String kategorie;

    @Column(name = "widget_typ", nullable = false)
    private String widgetTyp;

    @Column(name = "app_id")
    private String appId;

    @Column(name = "app_name")
    private String appName;

    @Column(name = "icon_path")
    private String iconPath;

    @Column(name = "standard_breite", nullable = false)
    private int standardBreite;

    @Column(name = "standard_hoehe", nullable = false)
    private int standardHoehe;

    @Column(name = "min_breite", nullable = false)
    private int minBreite;

    @Column(name = "min_hoehe", nullable = false)
    private int minHoehe;

    @Column(name = "max_breite", nullable = false)
    private int maxBreite;

    @Column(name = "max_hoehe", nullable = false)
    private int maxHoehe;

    @Column(name = "daten_endpunkt")
    private String datenEndpunkt;

    @Column(name = "link_ziel")
    private String linkZiel;

    @Column(nullable = false)
    private boolean konfigurierbar;

    @Column(name = "konfig_schema", columnDefinition = "TEXT")
    private String konfigSchema;

    @Column(nullable = false)
    private boolean aktiv;

    @Column(name = "erstellt_am", nullable = false)
    private LocalDateTime erstelltAm;

    @PrePersist
    protected void onCreate() {
        if (erstelltAm == null) erstelltAm = LocalDateTime.now();
    }
}

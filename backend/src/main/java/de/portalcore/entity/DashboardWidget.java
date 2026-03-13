package de.portalcore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dashboard_widgets",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "tenant_id", "widget_definition_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardWidget {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private PortalUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "widget_definition_id", nullable = false)
    private WidgetDefinition widgetDefinition;

    @Column(name = "position_x", nullable = false)
    private int positionX;

    @Column(name = "position_y", nullable = false)
    private int positionY;

    @Column(nullable = false)
    private int breite;

    @Column(nullable = false)
    private int hoehe;

    @Column(columnDefinition = "TEXT")
    private String konfiguration;

    @Column(nullable = false)
    private boolean sichtbar;

    @Column(nullable = false)
    private int sortierung;

    @Column(name = "erstellt_am", nullable = false)
    private LocalDateTime erstelltAm;

    @Column(name = "aktualisiert_am", nullable = false)
    private LocalDateTime aktualisiertAm;

    @PrePersist
    protected void onCreate() {
        if (erstelltAm == null) erstelltAm = LocalDateTime.now();
        if (aktualisiertAm == null) aktualisiertAm = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        aktualisiertAm = LocalDateTime.now();
    }
}

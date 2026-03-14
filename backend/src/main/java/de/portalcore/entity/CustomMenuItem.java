package de.portalcore.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "custom_menu_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CustomMenuItem {

    @Id
    private String id;

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(name = "parent_id")
    private String parentId;

    @NotBlank(message = "Label ist erforderlich")
    @Column(nullable = false)
    private String label;

    private String icon;

    @Column(name = "menu_type", nullable = false)
    private String menuType;

    @Column(columnDefinition = "TEXT")
    private String url;

    @Column(name = "sort_order")
    private int sortOrder;

    private boolean visible;

    @Column(name = "erstellt_am")
    private LocalDateTime erstelltAm;

    @Column(name = "erstellt_von")
    private String erstelltVon;

    @PrePersist
    void prePersist() {
        if (erstelltAm == null) erstelltAm = LocalDateTime.now();
        if (menuType == null) menuType = "IFRAME";
        visible = true;
    }
}

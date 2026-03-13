package de.portalcore.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "menu_order_config")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MenuOrderConfig {

    @Id
    private String id;

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(name = "menu_item_key", nullable = false)
    private String menuItemKey;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    private boolean visible;
}

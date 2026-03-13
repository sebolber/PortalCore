package de.portalcore.entity;

import de.portalcore.enums.ParameterType;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "portal_parameters")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PortalParameter {

    @Id
    private String id;

    @Column(name = "param_key", nullable = false)
    private String key;

    @Column(nullable = false)
    private String label;

    private String description;

    @Column(name = "app_id")
    private String appId;

    @Column(name = "app_name")
    private String appName;

    @Column(name = "param_group")
    private String group;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParameterType type;

    @Column(columnDefinition = "TEXT")
    private String value;

    @Column(name = "default_value")
    private String defaultValue;

    private boolean required;

    @Column(name = "validation_rules", columnDefinition = "TEXT")
    private String validationRules;

    private String options;

    private String unit;

    private boolean sensitive;

    @Column(name = "hot_reload")
    private boolean hotReload;

    @Column(name = "last_modified")
    private LocalDateTime lastModified;

    @Column(name = "last_modified_by")
    private String lastModifiedBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "gueltig_von")
    private LocalDateTime gueltigVon;

    @Column(name = "gueltig_bis")
    private LocalDateTime gueltigBis;

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(name = "admin_only")
    private boolean adminOnly;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (gueltigVon == null) gueltigVon = LocalDateTime.of(1970, 1, 1, 0, 0);
        if (gueltigBis == null) gueltigBis = LocalDateTime.of(9999, 12, 31, 23, 59, 59);
    }
}

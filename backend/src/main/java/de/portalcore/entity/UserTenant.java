package de.portalcore.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_tenants")
@IdClass(UserTenantId.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserTenant {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Id
    @Column(name = "tenant_id")
    private String tenantId;

    @Column(name = "ist_standard")
    private boolean istStandard;

    @Builder.Default
    private boolean aktiv = true;

    @Column(name = "zugeordnet_am")
    private LocalDateTime zugeordnetAm;

    @Column(name = "zugeordnet_von")
    private String zugeordnetVon;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tenant_id", insertable = false, updatable = false)
    private Tenant tenant;

    @PrePersist
    void prePersist() {
        if (zugeordnetAm == null) zugeordnetAm = LocalDateTime.now();
    }
}

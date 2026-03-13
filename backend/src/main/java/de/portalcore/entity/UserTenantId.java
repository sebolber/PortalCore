package de.portalcore.entity;

import lombok.*;

import java.io.Serializable;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode
public class UserTenantId implements Serializable {
    private String userId;
    private String tenantId;
}

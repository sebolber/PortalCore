package de.portalcore.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {

    @Id
    private String id;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(nullable = false)
    private String aktion;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "ip_adresse")
    private String ipAdresse;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(nullable = false)
    private LocalDateTime zeitstempel;

    @PrePersist
    void prePersist() {
        if (zeitstempel == null) zeitstempel = LocalDateTime.now();
    }
}

package de.portalcore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "parameter_audit_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ParameterAuditLog {

    @Id
    private String id;

    @Column(name = "parameter_id", nullable = false)
    private String parameterId;

    @Column(name = "param_key", nullable = false)
    private String paramKey;

    @Column(name = "app_id")
    private String appId;

    @Column(name = "app_name")
    private String appName;

    @Column(name = "alter_wert", columnDefinition = "TEXT")
    private String alterWert;

    @Column(name = "neuer_wert", columnDefinition = "TEXT")
    private String neuerWert;

    @Column(name = "geaendert_von", nullable = false)
    private String geaendertVon;

    @Column(name = "geaendert_am", nullable = false)
    private LocalDateTime geaendertAm;

    @Column(columnDefinition = "TEXT")
    private String grund;

    @PrePersist
    void prePersist() {
        if (geaendertAm == null) geaendertAm = LocalDateTime.now();
    }
}

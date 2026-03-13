package de.portalcore.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "auth_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthSession {

    @Id
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "erstellt_am")
    private LocalDateTime erstelltAm;

    @Column(name = "gueltig_bis", nullable = false)
    private LocalDateTime gueltigBis;

    @Column(name = "ip_adresse")
    private String ipAdresse;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Builder.Default
    private boolean aktiv = true;
}

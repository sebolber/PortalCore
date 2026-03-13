package de.portalcore.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "installed_apps")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InstalledApp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "app_id", nullable = false)
    private PortalApp app;

    @Column(name = "installed_at")
    private LocalDateTime installedAt;

    @Column(name = "installed_by")
    private String installedBy;

    private String status;

    @Column(name = "container_id")
    private String containerId;

    @Column(name = "container_name")
    private String containerName;

    @Column(name = "container_port")
    private Integer containerPort;

    @Column(name = "deploy_status")
    private String deployStatus;

    @Column(name = "deploy_log", columnDefinition = "TEXT")
    private String deployLog;

    @Column(name = "deployed_at")
    private LocalDateTime deployedAt;
}

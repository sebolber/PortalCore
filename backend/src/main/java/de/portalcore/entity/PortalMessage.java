package de.portalcore.entity;

import de.portalcore.enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "portal_messages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PortalMessage {

    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MessageCategory category;

    private String sender;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "is_read")
    private boolean read;

    @Column(name = "app_id")
    private String appId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;
}

package de.portalcore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "nachricht_empfaenger",
       uniqueConstraints = @UniqueConstraint(columnNames = {"nachricht_id", "empfaenger_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NachrichtEmpfaenger {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nachricht_id", nullable = false)
    private NachrichtItem nachricht;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empfaenger_id", nullable = false)
    private PortalUser empfaenger;

    @Column(nullable = false)
    private boolean gelesen;

    @Column(name = "gelesen_am")
    private LocalDateTime gelesenAm;

    @Column(nullable = false)
    private boolean archiviert;

    @Column(name = "archiviert_am")
    private LocalDateTime archiviertAm;

    @Column(nullable = false)
    private boolean erledigt;

    @Column(name = "erledigt_am")
    private LocalDateTime erledigtAm;
}

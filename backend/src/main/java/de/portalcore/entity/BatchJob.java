package de.portalcore.entity;

import de.portalcore.enums.BatchStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "batch_jobs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BatchJob {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String beschreibung;

    @Column(name = "produkt_id")
    private String produktId;

    private String schedule;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BatchStatus status;

    @Column(name = "gestartet_um")
    private LocalDateTime gestartetUm;

    @Column(name = "beendet_um")
    private LocalDateTime beendetUm;

    @Column(name = "naechster_lauf")
    private LocalDateTime naechsterLauf;

    private String dauer;

    private Integer fortschritt;

    @Column(columnDefinition = "TEXT")
    private String protokoll;
}

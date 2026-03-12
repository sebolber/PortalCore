package de.portalcore.entity;

import de.portalcore.enums.RechnungStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "offene_rechnungen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OffeneRechnung {

    @Id
    private String id;

    @Column(name = "rechnungs_nr", nullable = false)
    private String rechnungsNr;

    @Column(nullable = false)
    private String krankenhaus;

    @Column(nullable = false)
    private String patient;

    @Column(name = "rechnungs_datum")
    private LocalDate rechnungsDatum;

    @Column(name = "faelligkeits_datum")
    private LocalDate faelligkeitsDatum;

    private BigDecimal betrag;

    private BigDecimal bezahlt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RechnungStatus status;

    @Column(name = "tage_offen")
    private int tageOffen;

    private String bemerkung;
}

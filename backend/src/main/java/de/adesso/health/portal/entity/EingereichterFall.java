package de.adesso.health.portal.entity;

import de.adesso.health.portal.enums.AmpelStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "eingereichte_faelle")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EingereichterFall {

    @Id
    private String id;

    @Column(name = "fall_nr", nullable = false)
    private String fallNr;

    @Column(nullable = false)
    private String patient;

    @Column(nullable = false)
    private String krankenhaus;

    @Column(name = "drg_code")
    private String drgCode;

    @Column(name = "einreichungs_datum")
    private LocalDate einreichungsDatum;

    private BigDecimal betrag;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AmpelStatus ampel;

    @Column(name = "ampel_grund")
    private String ampelGrund;
}

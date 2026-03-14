package de.portalcore.entity;

import de.portalcore.enums.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "aufgaben_zuweisungen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AufgabenZuweisung {

    @Id
    private String id;

    @NotBlank(message = "Bezeichnung ist erforderlich")
    @Column(nullable = false)
    private String bezeichnung;

    @NotNull(message = "Kriterium ist erforderlich")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KriteriumTyp kriterium;

    @Column(name = "kriterium_wert", nullable = false)
    private String kriteriumWert;

    @Column(name = "zuweisung_typ", nullable = false)
    private String zuweisungTyp;

    @Column(name = "mitarbeiter_id")
    private String mitarbeiterId;

    @Column(name = "gruppe_id")
    private String gruppeId;

    @Column(name = "produkt_id", nullable = false)
    private String produktId;

    @Column(name = "gueltig_von")
    private LocalDate gueltigVon;

    @Column(name = "gueltig_bis")
    private LocalDate gueltigBis;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Prioritaet prioritaet;

    @Column(name = "erstellt_am")
    private LocalDateTime erstelltAm;

    @Column(name = "erstellt_von")
    private String erstelltVon;

    private String beschreibung;
}

package de.adesso.health.portal.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "aufgaben_gruppen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AufgabenGruppe {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private String beschreibung;

    @Column(name = "mitglieder_ids")
    private String mitgliederIds;
}

package de.portalcore.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "system_initialisierung")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SystemInitialisierung {

    public static final String SYSTEM_ID = "SYSTEM";

    @Id
    private String id;

    @Column(name = "ist_initialisiert", nullable = false)
    private boolean istInitialisiert;

    @Column(name = "initialisiert_am")
    private LocalDateTime initialisiertAm;

    @Column(name = "initialisiert_von")
    private String initialisiertVon;
}

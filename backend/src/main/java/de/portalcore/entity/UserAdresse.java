package de.portalcore.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_adressen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserAdresse {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"adressen", "gruppen", "rollen", "tenant"})
    private PortalUser user;

    @Column(nullable = false)
    private String typ;

    private String bezeichnung;
    private String strasse;
    private String hausnummer;
    private String plz;
    private String ort;

    @Builder.Default
    private String land = "Deutschland";

    private String zusatz;

    @Column(name = "ist_hauptadresse")
    private boolean istHauptadresse;

    @Column(name = "erstellt_am")
    private LocalDateTime erstelltAm;

    @PrePersist
    void prePersist() {
        if (erstelltAm == null) erstelltAm = LocalDateTime.now();
    }
}

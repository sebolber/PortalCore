package de.portalcore.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "gruppen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Gruppe {

    @Id
    private String id;

    @NotBlank(message = "Gruppenname ist erforderlich")
    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String beschreibung;

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(name = "system_gruppe")
    private boolean systemGruppe;

    private String farbe;

    @Column(name = "erstellt_am")
    private LocalDateTime erstelltAm;

    @Column(name = "erstellt_von")
    private String erstelltVon;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "gruppe", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonIgnoreProperties("gruppe")
    @Builder.Default
    private List<GruppenBerechtigung> berechtigungen = new ArrayList<>();

    @ManyToMany(mappedBy = "gruppen")
    @JsonIgnoreProperties({"gruppen", "rollen", "tenant"})
    @Builder.Default
    private List<PortalUser> benutzer = new ArrayList<>();

    @PrePersist
    void prePersist() {
        if (erstelltAm == null) erstelltAm = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

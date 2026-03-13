package de.portalcore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Tenant {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "short_name", nullable = false)
    private String shortName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // Adresse
    private String strasse;
    private String hausnummer;
    private String plz;
    private String ort;

    @Builder.Default
    private String land = "Deutschland";

    // Kontakt
    private String telefon;
    private String email;
    private String webseite;
    private String ansprechpartner;

    @Builder.Default
    private boolean aktiv = true;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

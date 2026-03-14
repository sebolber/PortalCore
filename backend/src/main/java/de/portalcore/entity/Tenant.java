package de.portalcore.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tenants")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Tenant {

    @Id
    private String id;

    @NotBlank(message = "Name ist erforderlich")
    @Size(max = 255, message = "Name darf maximal 255 Zeichen lang sein")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Kurzname ist erforderlich")
    @Size(max = 50, message = "Kurzname darf maximal 50 Zeichen lang sein")
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

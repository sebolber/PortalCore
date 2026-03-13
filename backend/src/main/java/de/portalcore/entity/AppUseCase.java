package de.portalcore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_use_cases", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"app_id", "use_case"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppUseCase {

    @Id
    private String id;

    @Column(name = "app_id", nullable = false)
    private String appId;

    @Column(name = "use_case", nullable = false)
    private String useCase;

    @Column(name = "use_case_label", nullable = false)
    private String useCaseLabel;

    @Column(columnDefinition = "TEXT")
    private String beschreibung;

    @Column(name = "erstellt_am")
    private LocalDateTime erstelltAm;

    @PrePersist
    void prePersist() {
        if (erstelltAm == null) erstelltAm = LocalDateTime.now();
    }
}

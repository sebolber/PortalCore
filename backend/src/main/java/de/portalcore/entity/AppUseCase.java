package de.portalcore.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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

    @NotBlank(message = "Use-Case ist erforderlich")
    @Column(name = "use_case", nullable = false)
    private String useCase;

    @NotBlank(message = "Use-Case-Label ist erforderlich")
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

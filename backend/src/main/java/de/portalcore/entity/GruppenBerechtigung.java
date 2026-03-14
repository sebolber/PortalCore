package de.portalcore.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "gruppen_berechtigungen", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"gruppe_id", "use_case"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GruppenBerechtigung {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gruppe_id", nullable = false)
    @JsonIgnoreProperties({"berechtigungen", "benutzer"})
    private Gruppe gruppe;

    @NotBlank(message = "Use-Case ist erforderlich")
    @Column(name = "use_case", nullable = false)
    private String useCase;

    @NotBlank(message = "Use-Case-Label ist erforderlich")
    @Column(name = "use_case_label", nullable = false)
    private String useCaseLabel;

    @Column(nullable = false)
    private boolean anzeigen;

    @Column(nullable = false)
    private boolean lesen;

    @Column(nullable = false)
    private boolean schreiben;

    @Column(nullable = false)
    private boolean loeschen;

    @Column(name = "app_id")
    private String appId;
}

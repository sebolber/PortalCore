package de.portalcore.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "nachricht_anhaenge")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NachrichtAnhang {

    @Id
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nachricht_id", nullable = false)
    private NachrichtItem nachricht;

    @Column(nullable = false, length = 500)
    private String dateiname;

    @Column(length = 100)
    private String dateityp;

    private Long dateigroesse;

    @Lob
    @Column(columnDefinition = "BYTEA")
    private byte[] daten;

    @Column(name = "erstellt_am", nullable = false)
    private LocalDateTime erstelltAm;

    @PrePersist
    protected void onCreate() {
        if (erstelltAm == null) erstelltAm = LocalDateTime.now();
    }
}

package de.portalcore.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "otp_codes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OtpCode {

    @Id
    private String id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String code;

    @Column(name = "erstellt_am", nullable = false)
    private LocalDateTime erstelltAm;

    @Column(name = "gueltig_bis", nullable = false)
    private LocalDateTime gueltigBis;

    @Column(nullable = false)
    private boolean verwendet;

    @Column(name = "ip_adresse")
    private String ipAdresse;

    @Column(nullable = false)
    @Builder.Default
    private int versuche = 0;
}

package de.portalcore.entity;

import de.portalcore.enums.*;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "nachricht_items")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NachrichtItem {

    @Id
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NachrichtTyp typ;

    @Column(nullable = false, length = 500)
    private String betreff;

    @Column(columnDefinition = "TEXT")
    private String inhalt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ersteller_id", nullable = false)
    private PortalUser ersteller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NachrichtPrioritaet prioritaet;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NachrichtStatus status;

    private LocalDateTime frist;

    @Column(name = "erinnerung_am")
    private LocalDateTime erinnerungAm;

    @Column(name = "erstellt_am", nullable = false)
    private LocalDateTime erstelltAm;

    @Column(name = "aktualisiert_am", nullable = false)
    private LocalDateTime aktualisiertAm;

    @Column(name = "system_generiert", nullable = false)
    private boolean systemGeneriert;

    @Column(name = "referenz_typ")
    private String referenzTyp;

    @Column(name = "referenz_id")
    private String referenzId;

    @Builder.Default
    @OneToMany(mappedBy = "nachricht", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NachrichtEmpfaenger> empfaenger = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "nachricht", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<NachrichtAnhang> anhaenge = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (erstelltAm == null) erstelltAm = LocalDateTime.now();
        if (aktualisiertAm == null) aktualisiertAm = LocalDateTime.now();
        if (prioritaet == null) prioritaet = NachrichtPrioritaet.NORMAL;
        if (status == null) status = NachrichtStatus.OFFEN;
        if (typ == null) typ = NachrichtTyp.NACHRICHT;
    }

    @PreUpdate
    protected void onUpdate() {
        aktualisiertAm = LocalDateTime.now();
    }
}

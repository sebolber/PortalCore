package de.portalcore.service;

import de.portalcore.entity.*;
import de.portalcore.enums.*;
import de.portalcore.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class NachrichtService {

    private final NachrichtItemRepository nachrichtRepo;
    private final NachrichtEmpfaengerRepository empfaengerRepo;
    private final NachrichtAnhangRepository anhangRepo;
    private final PortalUserRepository userRepo;
    private final TenantRepository tenantRepo;

    public NachrichtService(NachrichtItemRepository nachrichtRepo,
                            NachrichtEmpfaengerRepository empfaengerRepo,
                            NachrichtAnhangRepository anhangRepo,
                            PortalUserRepository userRepo,
                            TenantRepository tenantRepo) {
        this.nachrichtRepo = nachrichtRepo;
        this.empfaengerRepo = empfaengerRepo;
        this.anhangRepo = anhangRepo;
        this.userRepo = userRepo;
        this.tenantRepo = tenantRepo;
    }

    // ===== Posteingang (inbox for a user) =====

    public List<NachrichtItem> getPosteingang(String userId) {
        return nachrichtRepo.findPosteingang(userId);
    }

    public List<NachrichtItem> getUngelesene(String userId) {
        return nachrichtRepo.findUngelesene(userId);
    }

    public List<NachrichtItem> getArchiv(String userId) {
        return nachrichtRepo.findArchiviert(userId);
    }

    public List<NachrichtItem> getGesendet(String userId) {
        return nachrichtRepo.findGesendet(userId);
    }

    public List<NachrichtItem> getByTyp(String userId, NachrichtTyp typ) {
        return nachrichtRepo.findByTypForUser(userId, typ);
    }

    public long getUngeleseneAnzahl(String userId) {
        return nachrichtRepo.countUngelesen(userId);
    }

    public NachrichtItem findById(String id) {
        return nachrichtRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("NachrichtItem not found: " + id));
    }

    // ===== Erstellen =====

    @Transactional
    public NachrichtItem erstellen(String erstellerId, String tenantId, NachrichtTyp typ,
                                    String betreff, String inhalt, NachrichtPrioritaet prioritaet,
                                    LocalDateTime frist, LocalDateTime erinnerungAm,
                                    List<String> empfaengerIds, boolean systemGeneriert,
                                    String referenzTyp, String referenzId) {

        PortalUser ersteller = userRepo.findById(erstellerId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + erstellerId));
        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found: " + tenantId));

        NachrichtItem nachricht = NachrichtItem.builder()
                .id(UUID.randomUUID().toString())
                .typ(typ)
                .betreff(betreff)
                .inhalt(inhalt)
                .ersteller(ersteller)
                .tenant(tenant)
                .prioritaet(prioritaet != null ? prioritaet : NachrichtPrioritaet.NORMAL)
                .status(NachrichtStatus.OFFEN)
                .frist(frist)
                .erinnerungAm(erinnerungAm)
                .erstelltAm(LocalDateTime.now())
                .aktualisiertAm(LocalDateTime.now())
                .systemGeneriert(systemGeneriert)
                .referenzTyp(referenzTyp)
                .referenzId(referenzId)
                .build();

        nachricht = nachrichtRepo.save(nachricht);

        for (String empfId : empfaengerIds) {
            PortalUser empf = userRepo.findById(empfId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found: " + empfId));
            NachrichtEmpfaenger ne = NachrichtEmpfaenger.builder()
                    .id(UUID.randomUUID().toString())
                    .nachricht(nachricht)
                    .empfaenger(empf)
                    .gelesen(false)
                    .archiviert(false)
                    .erledigt(false)
                    .build();
            empfaengerRepo.save(ne);
        }

        return nachricht;
    }

    // ===== Aktionen =====

    @Transactional
    public void alsGelesenMarkieren(String nachrichtId, String userId) {
        NachrichtEmpfaenger ne = empfaengerRepo.findByNachrichtIdAndEmpfaengerId(nachrichtId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Empfaenger-Zuordnung not found"));
        ne.setGelesen(true);
        ne.setGelesenAm(LocalDateTime.now());
        empfaengerRepo.save(ne);
    }

    @Transactional
    public void alsUngelesenMarkieren(String nachrichtId, String userId) {
        NachrichtEmpfaenger ne = empfaengerRepo.findByNachrichtIdAndEmpfaengerId(nachrichtId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Empfaenger-Zuordnung not found"));
        ne.setGelesen(false);
        ne.setGelesenAm(null);
        empfaengerRepo.save(ne);
    }

    @Transactional
    public void archivieren(String nachrichtId, String userId) {
        NachrichtEmpfaenger ne = empfaengerRepo.findByNachrichtIdAndEmpfaengerId(nachrichtId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Empfaenger-Zuordnung not found"));
        ne.setArchiviert(true);
        ne.setArchiviertAm(LocalDateTime.now());
        empfaengerRepo.save(ne);
    }

    @Transactional
    public void alsErledigtMarkieren(String nachrichtId, String userId) {
        NachrichtEmpfaenger ne = empfaengerRepo.findByNachrichtIdAndEmpfaengerId(nachrichtId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Empfaenger-Zuordnung not found"));
        ne.setErledigt(true);
        ne.setErledigtAm(LocalDateTime.now());
        // Auto-archive when marked as done
        ne.setArchiviert(true);
        ne.setArchiviertAm(LocalDateTime.now());
        empfaengerRepo.save(ne);

        // Update item status if all recipients have completed it
        NachrichtItem nachricht = findById(nachrichtId);
        boolean alleErledigt = nachricht.getEmpfaenger().stream().allMatch(NachrichtEmpfaenger::isErledigt);
        if (alleErledigt) {
            nachricht.setStatus(NachrichtStatus.ERLEDIGT);
            nachrichtRepo.save(nachricht);
        }
    }

    @Transactional
    public int alleAlsGelesenMarkieren(String userId) {
        return empfaengerRepo.markAlleAlsGelesen(userId);
    }

    // ===== Anhänge =====

    @Transactional
    public NachrichtAnhang anhangHinzufuegen(String nachrichtId, String dateiname, String dateityp,
                                              long dateigroesse, byte[] daten) {
        NachrichtItem nachricht = findById(nachrichtId);
        NachrichtAnhang anhang = NachrichtAnhang.builder()
                .id(UUID.randomUUID().toString())
                .nachricht(nachricht)
                .dateiname(dateiname)
                .dateityp(dateityp)
                .dateigroesse(dateigroesse)
                .daten(daten)
                .erstelltAm(LocalDateTime.now())
                .build();
        return anhangRepo.save(anhang);
    }

    public NachrichtAnhang getAnhang(String anhangId) {
        return anhangRepo.findById(anhangId)
                .orElseThrow(() -> new EntityNotFoundException("Anhang not found: " + anhangId));
    }

    public List<NachrichtAnhang> getAnhaenge(String nachrichtId) {
        return anhangRepo.findByNachrichtId(nachrichtId);
    }

    // ===== System-Nachricht erstellen =====

    @Transactional
    public NachrichtItem systemNachrichtErstellen(String tenantId, String betreff, String inhalt,
                                                   List<String> empfaengerIds, NachrichtTyp typ,
                                                   String referenzTyp, String referenzId,
                                                   LocalDateTime frist) {
        // Use "SYSTEM" as creator - find first super admin or use a system user
        PortalUser systemUser = userRepo.findAll().stream()
                .filter(PortalUser::isSuperAdmin)
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("No system user found"));

        return erstellen(systemUser.getId(), tenantId, typ, betreff, inhalt,
                NachrichtPrioritaet.NORMAL, frist, null, empfaengerIds, true,
                referenzTyp, referenzId);
    }

    // ===== Unteraufgaben =====

    @Transactional
    public NachrichtItem unteraufgabeErstellen(String parentId, String erstellerId, String tenantId,
                                                String betreff, String inhalt,
                                                NachrichtPrioritaet prioritaet, LocalDateTime frist,
                                                List<String> empfaengerIds) {
        NachrichtItem parent = findById(parentId);
        if (parent.getTyp() != NachrichtTyp.AUFGABE) {
            throw new IllegalArgumentException("Unteraufgaben koennen nur fuer Aufgaben erstellt werden");
        }

        PortalUser ersteller = userRepo.findById(erstellerId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + erstellerId));
        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found: " + tenantId));

        NachrichtItem unteraufgabe = NachrichtItem.builder()
                .id(UUID.randomUUID().toString())
                .typ(NachrichtTyp.AUFGABE)
                .betreff(betreff)
                .inhalt(inhalt)
                .ersteller(ersteller)
                .tenant(tenant)
                .prioritaet(prioritaet != null ? prioritaet : NachrichtPrioritaet.NORMAL)
                .status(NachrichtStatus.OFFEN)
                .frist(frist)
                .erstelltAm(LocalDateTime.now())
                .aktualisiertAm(LocalDateTime.now())
                .systemGeneriert(false)
                .parent(parent)
                .build();

        unteraufgabe = nachrichtRepo.save(unteraufgabe);

        for (String empfId : empfaengerIds) {
            PortalUser empf = userRepo.findById(empfId)
                    .orElseThrow(() -> new EntityNotFoundException("User not found: " + empfId));
            NachrichtEmpfaenger ne = NachrichtEmpfaenger.builder()
                    .id(UUID.randomUUID().toString())
                    .nachricht(unteraufgabe)
                    .empfaenger(empf)
                    .gelesen(false)
                    .archiviert(false)
                    .erledigt(false)
                    .build();
            empfaengerRepo.save(ne);
        }

        return unteraufgabe;
    }

    public List<NachrichtItem> getUnteraufgaben(String parentId) {
        return nachrichtRepo.findByParentIdOrderByErstelltAmAsc(parentId);
    }

    public long countUnteraufgaben(String parentId) {
        return nachrichtRepo.countUnteraufgaben(parentId);
    }

    public long countErledigteUnteraufgaben(String parentId) {
        return nachrichtRepo.countErledigteUnteraufgaben(parentId);
    }

    // ===== Empfänger-Status für UI =====

    public NachrichtEmpfaenger getEmpfaengerStatus(String nachrichtId, String userId) {
        return empfaengerRepo.findByNachrichtIdAndEmpfaengerId(nachrichtId, userId).orElse(null);
    }
}

package de.portalcore.service;

import de.portalcore.entity.Gruppe;
import de.portalcore.entity.GruppenBerechtigung;
import de.portalcore.entity.PortalUser;
import de.portalcore.repository.GruppeRepository;
import de.portalcore.repository.GruppenBerechtigungRepository;
import de.portalcore.repository.PortalUserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class GruppenService {

    private final GruppeRepository gruppeRepository;
    private final GruppenBerechtigungRepository berechtigungRepository;
    private final PortalUserRepository userRepository;
    private final AuditService auditService;

    public GruppenService(GruppeRepository gruppeRepository,
                          GruppenBerechtigungRepository berechtigungRepository,
                          PortalUserRepository userRepository,
                          AuditService auditService) {
        this.gruppeRepository = gruppeRepository;
        this.berechtigungRepository = berechtigungRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<Gruppe> findAll() {
        return gruppeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Gruppe> findByTenantId(String tenantId) {
        return gruppeRepository.findByTenantIdOrTenantIdIsNull(tenantId);
    }

    @Transactional(readOnly = true)
    public Gruppe findById(String id) {
        return gruppeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Gruppe nicht gefunden: " + id));
    }

    public Gruppe create(Gruppe gruppe, String userId) {
        if (gruppe.getId() == null) {
            gruppe.setId("g-" + UUID.randomUUID().toString().substring(0, 8));
        }
        gruppe.setErstelltAm(LocalDateTime.now());
        gruppe.setErstelltVon(userId);
        Gruppe saved = gruppeRepository.save(gruppe);
        auditService.log(userId, gruppe.getTenantId(), "GRUPPE_ERSTELLT",
                "Gruppe erstellt: " + gruppe.getName());
        return saved;
    }

    public Gruppe update(String id, Gruppe updated, String userId) {
        Gruppe existing = findById(id);
        existing.setName(updated.getName());
        existing.setBeschreibung(updated.getBeschreibung());
        existing.setFarbe(updated.getFarbe());
        existing.setTenantId(updated.getTenantId());
        Gruppe saved = gruppeRepository.save(existing);
        auditService.log(userId, existing.getTenantId(), "GRUPPE_AKTUALISIERT",
                "Gruppe aktualisiert: " + existing.getName());
        return saved;
    }

    public void delete(String id, String userId) {
        Gruppe gruppe = findById(id);
        if (gruppe.isSystemGruppe()) {
            throw new IllegalStateException("Systemgruppen koennen nicht geloescht werden.");
        }
        auditService.log(userId, gruppe.getTenantId(), "GRUPPE_GELOESCHT",
                "Gruppe geloescht: " + gruppe.getName());
        gruppeRepository.delete(gruppe);
    }

    // ---- Berechtigungen pro Use Case ----

    public GruppenBerechtigung addBerechtigung(String gruppeId, GruppenBerechtigung berechtigung, String userId) {
        Gruppe gruppe = findById(gruppeId);
        berechtigung.setGruppe(gruppe);
        if (berechtigung.getId() == null) {
            berechtigung.setId("gb-" + UUID.randomUUID().toString().substring(0, 8));
        }
        GruppenBerechtigung saved = berechtigungRepository.save(berechtigung);
        auditService.log(userId, gruppe.getTenantId(), "BERECHTIGUNG_HINZUGEFUEGT",
                "Berechtigung fuer Use Case '" + berechtigung.getUseCaseLabel() +
                "' zu Gruppe '" + gruppe.getName() + "' hinzugefuegt");
        return saved;
    }

    public GruppenBerechtigung updateBerechtigung(String berechtigungId, GruppenBerechtigung updated, String userId) {
        GruppenBerechtigung existing = berechtigungRepository.findById(berechtigungId)
                .orElseThrow(() -> new EntityNotFoundException("Berechtigung nicht gefunden: " + berechtigungId));
        existing.setAnzeigen(updated.isAnzeigen());
        existing.setLesen(updated.isLesen());
        existing.setSchreiben(updated.isSchreiben());
        existing.setLoeschen(updated.isLoeschen());
        existing.setUseCaseLabel(updated.getUseCaseLabel());
        GruppenBerechtigung saved = berechtigungRepository.save(existing);
        auditService.log(userId, null, "BERECHTIGUNG_AKTUALISIERT",
                "Berechtigung aktualisiert: " + existing.getUseCaseLabel());
        return saved;
    }

    public void removeBerechtigung(String berechtigungId, String userId) {
        GruppenBerechtigung b = berechtigungRepository.findById(berechtigungId)
                .orElseThrow(() -> new EntityNotFoundException("Berechtigung nicht gefunden: " + berechtigungId));
        auditService.log(userId, null, "BERECHTIGUNG_ENTFERNT",
                "Berechtigung entfernt: " + b.getUseCaseLabel());
        berechtigungRepository.delete(b);
    }

    @Transactional(readOnly = true)
    public List<GruppenBerechtigung> getBerechtigungen(String gruppeId) {
        return berechtigungRepository.findByGruppeId(gruppeId);
    }

    // ---- Benutzer zu Gruppen zuordnen ----

    public void addUserToGroup(String gruppeId, String userId, String performedBy) {
        Gruppe gruppe = findById(gruppeId);
        PortalUser user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Benutzer nicht gefunden: " + userId));
        user.getGruppen().add(gruppe);
        userRepository.save(user);
        auditService.log(performedBy, gruppe.getTenantId(), "BENUTZER_GRUPPE_ZUGEORDNET",
                "Benutzer " + user.getEmail() + " zu Gruppe '" + gruppe.getName() + "' zugeordnet");
    }

    public void removeUserFromGroup(String gruppeId, String userId, String performedBy) {
        Gruppe gruppe = findById(gruppeId);
        PortalUser user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Benutzer nicht gefunden: " + userId));
        user.getGruppen().removeIf(g -> g.getId().equals(gruppeId));
        userRepository.save(user);
        auditService.log(performedBy, gruppe.getTenantId(), "BENUTZER_GRUPPE_ENTFERNT",
                "Benutzer " + user.getEmail() + " aus Gruppe '" + gruppe.getName() + "' entfernt");
    }

    @Transactional(readOnly = true)
    public List<Gruppe> findByUserId(String userId) {
        return gruppeRepository.findByUserId(userId);
    }
}

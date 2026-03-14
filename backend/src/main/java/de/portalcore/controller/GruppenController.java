package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.Gruppe;
import de.portalcore.entity.GruppenBerechtigung;
import de.portalcore.service.AuditService;
import de.portalcore.service.GruppenService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/gruppen")
public class GruppenController {

    private final GruppenService gruppenService;
    private final SecurityHelper securityHelper;
    private final AuditService auditService;

    public GruppenController(GruppenService gruppenService, SecurityHelper securityHelper,
                             AuditService auditService) {
        this.gruppenService = gruppenService;
        this.securityHelper = securityHelper;
        this.auditService = auditService;
    }

    @GetMapping
    public List<Gruppe> getAll(@RequestParam(required = false) String tenantId) {
        securityHelper.requireBerechtigung("gruppenverwaltung", "lesen");
        String effectiveTenantId = tenantId != null ? tenantId : securityHelper.getCurrentTenantId();
        securityHelper.requireTenantAccess(effectiveTenantId);
        return gruppenService.findByTenantId(effectiveTenantId);
    }

    @GetMapping("/{id}")
    public Gruppe getById(@PathVariable String id) {
        securityHelper.requireBerechtigung("gruppenverwaltung", "lesen");
        return gruppenService.findById(id);
    }

    @PostMapping
    public Gruppe create(@Valid @RequestBody Gruppe gruppe) {
        securityHelper.requireBerechtigung("gruppenverwaltung", "schreiben");
        if (gruppe.getTenantId() == null) {
            gruppe.setTenantId(securityHelper.getCurrentTenantId());
        }
        securityHelper.requireTenantAccess(gruppe.getTenantId());
        Gruppe created = gruppenService.create(gruppe, securityHelper.getCurrentUserId());
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "GRUPPE_ERSTELLT", "Gruppe erstellt: " + created.getName());
        return created;
    }

    @PutMapping("/{id}")
    public Gruppe update(@PathVariable String id, @Valid @RequestBody Gruppe gruppe) {
        securityHelper.requireBerechtigung("gruppenverwaltung", "schreiben");
        Gruppe updated = gruppenService.update(id, gruppe, securityHelper.getCurrentUserId());
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "GRUPPE_AKTUALISIERT", "Gruppe aktualisiert: " + id);
        return updated;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        securityHelper.requireBerechtigung("gruppenverwaltung", "loeschen");
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "GRUPPE_GELOESCHT", "Gruppe geloescht: " + id);
        gruppenService.delete(id, securityHelper.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/berechtigungen")
    public List<GruppenBerechtigung> getBerechtigungen(@PathVariable String id) {
        securityHelper.requireBerechtigung("gruppenverwaltung", "lesen");
        return gruppenService.getBerechtigungen(id);
    }

    @PostMapping("/{id}/berechtigungen")
    public GruppenBerechtigung addBerechtigung(@PathVariable String id,
                                                @Valid @RequestBody GruppenBerechtigung berechtigung) {
        securityHelper.requireBerechtigung("gruppenverwaltung", "schreiben");
        GruppenBerechtigung created = gruppenService.addBerechtigung(id, berechtigung, securityHelper.getCurrentUserId());
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "BERECHTIGUNG_HINZUGEFUEGT", "Berechtigung " + berechtigung.getUseCase() + " zu Gruppe " + id);
        return created;
    }

    @PutMapping("/{gruppeId}/berechtigungen/{berechtigungId}")
    public GruppenBerechtigung updateBerechtigung(@PathVariable String gruppeId,
                                                   @PathVariable String berechtigungId,
                                                   @Valid @RequestBody GruppenBerechtigung berechtigung) {
        securityHelper.requireBerechtigung("gruppenverwaltung", "schreiben");
        GruppenBerechtigung updated = gruppenService.updateBerechtigung(berechtigungId, berechtigung, securityHelper.getCurrentUserId());
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "BERECHTIGUNG_AKTUALISIERT", "Berechtigung " + berechtigungId + " aktualisiert");
        return updated;
    }

    @DeleteMapping("/{gruppeId}/berechtigungen/{berechtigungId}")
    public ResponseEntity<Void> removeBerechtigung(@PathVariable String gruppeId,
                                                    @PathVariable String berechtigungId) {
        securityHelper.requireBerechtigung("gruppenverwaltung", "loeschen");
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "BERECHTIGUNG_ENTFERNT", "Berechtigung " + berechtigungId + " aus Gruppe " + gruppeId);
        gruppenService.removeBerechtigung(berechtigungId, securityHelper.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/benutzer/{userId}")
    public ResponseEntity<Map<String, String>> addUser(@PathVariable String id, @PathVariable String userId) {
        securityHelper.requireBerechtigung("gruppenverwaltung", "schreiben");
        gruppenService.addUserToGroup(id, userId, securityHelper.getCurrentUserId());
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "BENUTZER_GRUPPE_ZUGEORDNET", "Benutzer " + userId + " zu Gruppe " + id);
        return ResponseEntity.ok(Map.of("message", "Benutzer zugeordnet."));
    }

    @DeleteMapping("/{id}/benutzer/{userId}")
    public ResponseEntity<Map<String, String>> removeUser(@PathVariable String id, @PathVariable String userId) {
        securityHelper.requireBerechtigung("gruppenverwaltung", "loeschen");
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "BENUTZER_GRUPPE_ENTFERNT", "Benutzer " + userId + " aus Gruppe " + id);
        gruppenService.removeUserFromGroup(id, userId, securityHelper.getCurrentUserId());
        return ResponseEntity.ok(Map.of("message", "Benutzer entfernt."));
    }
}

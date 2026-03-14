package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.AufgabenGruppe;
import de.portalcore.entity.AufgabenZuweisung;
import de.portalcore.service.AuditService;
import de.portalcore.service.AufgabenService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aufgaben")
public class AufgabenController {

    private final AufgabenService aufgabenService;
    private final SecurityHelper securityHelper;
    private final AuditService auditService;

    public AufgabenController(AufgabenService aufgabenService, SecurityHelper securityHelper,
                              AuditService auditService) {
        this.aufgabenService = aufgabenService;
        this.securityHelper = securityHelper;
        this.auditService = auditService;
    }

    @GetMapping("/zuweisungen")
    public ResponseEntity<List<AufgabenZuweisung>> listZuweisungen(
            @RequestParam(required = false) String mitarbeiterId,
            @RequestParam(required = false) String gruppeId,
            @RequestParam(required = false) String produktId) {
        securityHelper.requireBerechtigung("aufgabenverwaltung", "lesen");
        return ResponseEntity.ok(aufgabenService.listZuweisungen(mitarbeiterId, gruppeId, produktId));
    }

    @PostMapping("/zuweisungen")
    public ResponseEntity<AufgabenZuweisung> createZuweisung(@Valid @RequestBody AufgabenZuweisung zuweisung) {
        securityHelper.requireBerechtigung("aufgabenverwaltung", "schreiben");
        AufgabenZuweisung created = aufgabenService.createZuweisung(zuweisung);
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "ZUWEISUNG_ERSTELLT", "Aufgaben-Zuweisung erstellt: " + created.getBezeichnung());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/zuweisungen/{id}")
    public ResponseEntity<AufgabenZuweisung> updateZuweisung(
            @PathVariable String id,
            @Valid @RequestBody AufgabenZuweisung zuweisung) {
        securityHelper.requireBerechtigung("aufgabenverwaltung", "schreiben");
        AufgabenZuweisung updated = aufgabenService.updateZuweisung(id, zuweisung);
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "ZUWEISUNG_AKTUALISIERT", "Aufgaben-Zuweisung aktualisiert: " + id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/zuweisungen/{id}")
    public ResponseEntity<Void> deleteZuweisung(@PathVariable String id) {
        securityHelper.requireBerechtigung("aufgabenverwaltung", "loeschen");
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "ZUWEISUNG_GELOESCHT", "Aufgaben-Zuweisung geloescht: " + id);
        aufgabenService.deleteZuweisung(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/gruppen")
    public ResponseEntity<List<AufgabenGruppe>> listGruppen() {
        securityHelper.requireBerechtigung("aufgabenverwaltung", "lesen");
        return ResponseEntity.ok(aufgabenService.listGruppen());
    }
}

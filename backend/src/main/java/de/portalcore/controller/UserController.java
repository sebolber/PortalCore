package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.PortalUser;
import de.portalcore.entity.UserAdresse;
import de.portalcore.enums.UserStatus;
import de.portalcore.service.AuditService;
import de.portalcore.service.GruppenService;
import de.portalcore.service.UserAdresseService;
import de.portalcore.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final UserAdresseService adresseService;
    private final GruppenService gruppenService;
    private final SecurityHelper securityHelper;
    private final AuditService auditService;

    public UserController(UserService userService, UserAdresseService adresseService,
                           GruppenService gruppenService, SecurityHelper securityHelper,
                           AuditService auditService) {
        this.userService = userService;
        this.adresseService = adresseService;
        this.gruppenService = gruppenService;
        this.securityHelper = securityHelper;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<PortalUser>> listUsers(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String search) {
        securityHelper.requireBerechtigung("benutzerverwaltung", "lesen");
        String effectiveTenantId = tenantId != null ? tenantId : securityHelper.getCurrentTenantId();
        securityHelper.requireTenantAccess(effectiveTenantId);
        return ResponseEntity.ok(userService.listUsers(effectiveTenantId, status, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortalUser> getUserById(@PathVariable String id) {
        securityHelper.requireBerechtigung("benutzerverwaltung", "lesen");
        return ResponseEntity.ok(userService.findById(id));
    }

    @PostMapping
    public ResponseEntity<PortalUser> createUser(@Valid @RequestBody PortalUser user) {
        securityHelper.requireBerechtigung("benutzerverwaltung", "schreiben");
        PortalUser created = userService.create(user);
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "BENUTZER_ERSTELLT", "Benutzer erstellt: " + created.getEmail());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PortalUser> updateUser(@PathVariable String id, @Valid @RequestBody PortalUser user) {
        securityHelper.requireBerechtigung("benutzerverwaltung", "schreiben");
        PortalUser updated = userService.update(id, user);
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "BENUTZER_AKTUALISIERT", "Benutzer aktualisiert: " + id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        securityHelper.requireBerechtigung("benutzerverwaltung", "loeschen");
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "BENUTZER_GELOESCHT", "Benutzer geloescht: " + id);
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}/adressen")
    public ResponseEntity<List<UserAdresse>> getAdressen(@PathVariable String userId) {
        securityHelper.requireBerechtigung("benutzerverwaltung", "lesen");
        return ResponseEntity.ok(adresseService.findByUserId(userId));
    }

    @PostMapping("/{userId}/adressen")
    public ResponseEntity<UserAdresse> addAdresse(@PathVariable String userId,
                                                   @Valid @RequestBody UserAdresse adresse) {
        securityHelper.requireBerechtigung("benutzerverwaltung", "schreiben");
        return ResponseEntity.ok(adresseService.create(userId, adresse));
    }

    @PutMapping("/{userId}/adressen/{adresseId}")
    public ResponseEntity<UserAdresse> updateAdresse(@PathVariable String userId,
                                                      @PathVariable String adresseId,
                                                      @Valid @RequestBody UserAdresse adresse) {
        securityHelper.requireBerechtigung("benutzerverwaltung", "schreiben");
        return ResponseEntity.ok(adresseService.update(adresseId, adresse));
    }

    @DeleteMapping("/{userId}/adressen/{adresseId}")
    public ResponseEntity<Void> deleteAdresse(@PathVariable String userId, @PathVariable String adresseId) {
        securityHelper.requireBerechtigung("benutzerverwaltung", "loeschen");
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "ADRESSE_GELOESCHT", "Adresse geloescht: " + adresseId + " fuer Benutzer " + userId);
        adresseService.delete(adresseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}/gruppen")
    public ResponseEntity<?> getUserGruppen(@PathVariable String userId) {
        securityHelper.requireBerechtigung("benutzerverwaltung", "lesen");
        return ResponseEntity.ok(gruppenService.findByUserId(userId));
    }
}

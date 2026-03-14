package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.Tenant;
import de.portalcore.entity.UserTenant;
import de.portalcore.repository.UserTenantRepository;
import de.portalcore.service.AuditService;
import de.portalcore.service.TenantService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tenants")
public class TenantController {

    private final TenantService tenantService;
    private final UserTenantRepository userTenantRepository;
    private final SecurityHelper securityHelper;
    private final AuditService auditService;

    public TenantController(TenantService tenantService, UserTenantRepository userTenantRepository,
                            SecurityHelper securityHelper, AuditService auditService) {
        this.tenantService = tenantService;
        this.userTenantRepository = userTenantRepository;
        this.securityHelper = securityHelper;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<Tenant>> listTenants() {
        securityHelper.requireSuperAdmin();
        return ResponseEntity.ok(tenantService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tenant> getTenantById(@PathVariable String id) {
        securityHelper.requireTenantAccess(id);
        return ResponseEntity.ok(tenantService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Tenant> createTenant(@Valid @RequestBody Tenant tenant) {
        securityHelper.requireSuperAdmin();
        Tenant created = tenantService.create(tenant, securityHelper.getCurrentUserId());
        auditService.log(securityHelper.getCurrentUserId(), null, "MANDANT_ERSTELLT",
                "Mandant erstellt: " + created.getName());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tenant> updateTenant(@PathVariable String id, @Valid @RequestBody Tenant tenant) {
        securityHelper.requireSuperAdmin();
        Tenant updated = tenantService.update(id, tenant, securityHelper.getCurrentUserId());
        auditService.log(securityHelper.getCurrentUserId(), id, "MANDANT_AKTUALISIERT",
                "Mandant aktualisiert: " + updated.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTenant(@PathVariable String id) {
        securityHelper.requireSuperAdmin();
        auditService.log(securityHelper.getCurrentUserId(), id, "MANDANT_GELOESCHT",
                "Mandant geloescht: " + id);
        tenantService.delete(id, securityHelper.getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{tenantId}/users")
    public ResponseEntity<List<UserTenant>> getTenantUsers(@PathVariable String tenantId) {
        securityHelper.requireTenantAccess(tenantId);
        return ResponseEntity.ok(userTenantRepository.findByTenantId(tenantId));
    }

    @PostMapping("/{tenantId}/users/{userId}")
    public ResponseEntity<Map<String, String>> addUserToTenant(
            @PathVariable String tenantId,
            @PathVariable String userId,
            @RequestParam(defaultValue = "false") boolean istStandard) {
        securityHelper.requireSuperAdmin();
        if (userTenantRepository.existsByUserIdAndTenantId(userId, tenantId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Benutzer ist bereits zugeordnet."));
        }
        UserTenant ut = UserTenant.builder()
                .userId(userId)
                .tenantId(tenantId)
                .istStandard(istStandard)
                .aktiv(true)
                .zugeordnetVon(securityHelper.getCurrentUserId())
                .build();
        userTenantRepository.save(ut);
        auditService.log(securityHelper.getCurrentUserId(), tenantId, "BENUTZER_MANDANT_ZUGEORDNET",
                "Benutzer " + userId + " dem Mandant " + tenantId + " zugeordnet");
        return ResponseEntity.ok(Map.of("message", "Benutzer dem Mandanten zugeordnet."));
    }

    @DeleteMapping("/{tenantId}/users/{userId}")
    public ResponseEntity<Map<String, String>> removeUserFromTenant(
            @PathVariable String tenantId,
            @PathVariable String userId) {
        securityHelper.requireSuperAdmin();
        auditService.log(securityHelper.getCurrentUserId(), tenantId, "BENUTZER_MANDANT_ENTFERNT",
                "Benutzer " + userId + " vom Mandant " + tenantId + " entfernt");
        userTenantRepository.deleteById(new de.portalcore.entity.UserTenantId(userId, tenantId));
        return ResponseEntity.ok(Map.of("message", "Zuordnung entfernt."));
    }
}

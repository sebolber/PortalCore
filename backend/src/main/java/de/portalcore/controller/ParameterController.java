package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.ParameterAuditLog;
import de.portalcore.entity.PortalParameter;
import de.portalcore.service.AuditService;
import de.portalcore.service.ParameterService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/parameters")
public class ParameterController {

    private final ParameterService parameterService;
    private final SecurityHelper securityHelper;
    private final AuditService auditService;

    public ParameterController(ParameterService parameterService, SecurityHelper securityHelper,
                               AuditService auditService) {
        this.parameterService = parameterService;
        this.securityHelper = securityHelper;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<PortalParameter>> listParameters(
            @RequestParam(required = false) String appId) {
        String tenantId = securityHelper.getCurrentTenantId();
        boolean isSuperAdmin = securityHelper.isSuperAdmin();
        return ResponseEntity.ok(parameterService.listParameters(appId, tenantId, isSuperAdmin));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        PortalParameter parameter = parameterService.findById(id);
        if (!parameterService.hasAccess(parameter, securityHelper.getCurrentTenantId(), securityHelper.isSuperAdmin())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Kein Zugriff auf diesen Parameter."));
        }
        return ResponseEntity.ok(parameter);
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody PortalParameter parameter) {
        securityHelper.requireSuperAdmin();
        PortalParameter created = parameterService.create(parameter);
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "PARAMETER_ERSTELLT", "Parameter erstellt: " + created.getKey());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateParameter(@PathVariable String id,
                                              @Valid @RequestBody PortalParameter parameter) {
        PortalParameter existing = parameterService.findById(id);
        if (!parameterService.hasAccess(existing, securityHelper.getCurrentTenantId(), securityHelper.isSuperAdmin())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Kein Zugriff auf diesen Parameter."));
        }
        if (existing.isAdminOnly() && !securityHelper.isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Dieser Parameter darf nur von Administratoren geaendert werden."));
        }
        PortalParameter updated = parameterService.update(id, parameter);
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "PARAMETER_AKTUALISIERT", "Parameter aktualisiert: " + id);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/value")
    public ResponseEntity<?> updateValue(@PathVariable String id,
                                          @RequestBody Map<String, String> body) {
        PortalParameter existing = parameterService.findById(id);
        if (!parameterService.hasAccess(existing, securityHelper.getCurrentTenantId(), securityHelper.isSuperAdmin())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Kein Zugriff auf diesen Parameter."));
        }
        if (existing.isAdminOnly() && !securityHelper.isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Dieser Parameter darf nur von Administratoren geaendert werden."));
        }
        String value = body.get("value");
        String grund = body.getOrDefault("grund", "");
        try {
            PortalParameter updated = parameterService.updateValue(id, value, securityHelper.getCurrentUserId(), grund);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/reset")
    public ResponseEntity<?> resetToDefault(@PathVariable String id) {
        PortalParameter parameter = parameterService.findById(id);
        if (!parameterService.hasAccess(parameter, securityHelper.getCurrentTenantId(), securityHelper.isSuperAdmin())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Kein Zugriff auf diesen Parameter."));
        }
        if (parameter.isAdminOnly() && !securityHelper.isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Dieser Parameter darf nur von Administratoren zurueckgesetzt werden."));
        }
        PortalParameter updated = parameterService.updateValue(
                id, parameter.getDefaultValue(), securityHelper.getCurrentUserId(), "Auf Standardwert zurueckgesetzt");
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        PortalParameter parameter = parameterService.findById(id);
        if (!parameterService.hasAccess(parameter, securityHelper.getCurrentTenantId(), securityHelper.isSuperAdmin())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Kein Zugriff auf diesen Parameter."));
        }
        if (parameter.isAdminOnly() && !securityHelper.isSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Dieser Parameter darf nur von Administratoren geloescht werden."));
        }
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "PARAMETER_GELOESCHT", "Parameter geloescht: " + parameter.getKey());
        parameterService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/audit-log")
    public ResponseEntity<List<ParameterAuditLog>> getAuditLog(
            @RequestParam(required = false) String appId,
            @RequestParam(required = false) String parameterId) {
        String tenantId = securityHelper.getCurrentTenantId();
        boolean isSuperAdmin = securityHelper.isSuperAdmin();
        return ResponseEntity.ok(parameterService.getAuditLog(appId, parameterId, tenantId, isSuperAdmin));
    }
}

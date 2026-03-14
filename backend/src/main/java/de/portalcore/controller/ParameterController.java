package de.portalcore.controller;

import de.portalcore.config.JwtAuthenticationFilter.AuthDetails;
import de.portalcore.entity.ParameterAuditLog;
import de.portalcore.entity.PortalParameter;
import de.portalcore.entity.PortalUser;
import de.portalcore.repository.PortalUserRepository;
import de.portalcore.service.ParameterService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/parameters")
public class ParameterController {

    private final ParameterService parameterService;
    private final PortalUserRepository portalUserRepository;

    public ParameterController(ParameterService parameterService,
                               PortalUserRepository portalUserRepository) {
        this.parameterService = parameterService;
        this.portalUserRepository = portalUserRepository;
    }

    @GetMapping
    public ResponseEntity<List<PortalParameter>> listParameters(
            @RequestParam(required = false) String appId) {
        String tenantId = getCurrentTenantId();
        boolean superAdmin = isCurrentUserSuperAdmin();
        List<PortalParameter> parameters = parameterService.listParameters(appId, tenantId, superAdmin);
        return ResponseEntity.ok(parameters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        PortalParameter parameter = parameterService.findById(id);
        if (!parameterService.hasAccess(parameter, getCurrentTenantId(), isCurrentUserSuperAdmin())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Kein Zugriff auf diesen Parameter."));
        }
        return ResponseEntity.ok(parameter);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody PortalParameter parameter) {
        if (!isCurrentUserSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Nur Administratoren duerfen Parameter erstellen."));
        }
        return ResponseEntity.ok(parameterService.create(parameter));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateParameter(
            @PathVariable String id,
            @RequestBody PortalParameter parameter) {
        PortalParameter existing = parameterService.findById(id);
        if (!parameterService.hasAccess(existing, getCurrentTenantId(), isCurrentUserSuperAdmin())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Kein Zugriff auf diesen Parameter."));
        }
        if (existing.isAdminOnly() && !isCurrentUserSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Dieser Parameter darf nur von Administratoren geaendert werden."));
        }
        PortalParameter updated = parameterService.update(id, parameter);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/value")
    public ResponseEntity<?> updateValue(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        PortalParameter existing = parameterService.findById(id);
        if (!parameterService.hasAccess(existing, getCurrentTenantId(), isCurrentUserSuperAdmin())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Kein Zugriff auf diesen Parameter."));
        }
        if (existing.isAdminOnly() && !isCurrentUserSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Dieser Parameter darf nur von Administratoren geaendert werden."));
        }
        String value = body.get("value");
        String grund = body.getOrDefault("grund", "");
        String modifiedBy = getCurrentUserName();
        try {
            PortalParameter updated = parameterService.updateValue(id, value, modifiedBy, grund);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/reset")
    public ResponseEntity<?> resetToDefault(@PathVariable String id) {
        PortalParameter parameter = parameterService.findById(id);
        if (!parameterService.hasAccess(parameter, getCurrentTenantId(), isCurrentUserSuperAdmin())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Kein Zugriff auf diesen Parameter."));
        }
        if (parameter.isAdminOnly() && !isCurrentUserSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Dieser Parameter darf nur von Administratoren zurueckgesetzt werden."));
        }
        String modifiedBy = getCurrentUserName();
        PortalParameter updated = parameterService.updateValue(
                id, parameter.getDefaultValue(), modifiedBy, "Auf Standardwert zurueckgesetzt");
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        PortalParameter parameter = parameterService.findById(id);
        if (!parameterService.hasAccess(parameter, getCurrentTenantId(), isCurrentUserSuperAdmin())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Kein Zugriff auf diesen Parameter."));
        }
        if (parameter.isAdminOnly() && !isCurrentUserSuperAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Dieser Parameter darf nur von Administratoren geloescht werden."));
        }
        parameterService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/audit-log")
    public ResponseEntity<List<ParameterAuditLog>> getAuditLog(
            @RequestParam(required = false) String appId,
            @RequestParam(required = false) String parameterId) {
        String tenantId = getCurrentTenantId();
        boolean superAdmin = isCurrentUserSuperAdmin();
        List<ParameterAuditLog> log = parameterService.getAuditLog(appId, parameterId, tenantId, superAdmin);
        return ResponseEntity.ok(log);
    }

    private String getCurrentUserName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof AuthDetails details) {
            return details.email() != null ? details.email() : details.userId();
        }
        return auth != null ? String.valueOf(auth.getPrincipal()) : "system";
    }

    private String getCurrentTenantId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof AuthDetails details) {
            return details.tenantId();
        }
        return null;
    }

    private boolean isCurrentUserSuperAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof AuthDetails details) {
            return portalUserRepository.findById(details.userId())
                    .map(PortalUser::isSuperAdmin)
                    .orElse(false);
        }
        return false;
    }
}

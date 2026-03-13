package de.portalcore.controller;

import de.portalcore.config.JwtAuthenticationFilter.AuthDetails;
import de.portalcore.entity.ParameterAuditLog;
import de.portalcore.entity.PortalParameter;
import de.portalcore.service.ParameterService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/parameters")
@CrossOrigin(origins = "*")
public class ParameterController {

    private final ParameterService parameterService;

    public ParameterController(ParameterService parameterService) {
        this.parameterService = parameterService;
    }

    @GetMapping
    public ResponseEntity<List<PortalParameter>> listParameters(
            @RequestParam(required = false) String appId) {
        List<PortalParameter> parameters = parameterService.listParameters(appId);
        return ResponseEntity.ok(parameters);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortalParameter> getById(@PathVariable String id) {
        return ResponseEntity.ok(parameterService.findById(id));
    }

    @PostMapping
    public ResponseEntity<PortalParameter> create(@RequestBody PortalParameter parameter) {
        return ResponseEntity.ok(parameterService.create(parameter));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PortalParameter> updateParameter(
            @PathVariable String id,
            @RequestBody PortalParameter parameter) {
        PortalParameter updated = parameterService.updateParameter(id, parameter);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/value")
    public ResponseEntity<?> updateValue(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
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
    public ResponseEntity<PortalParameter> resetToDefault(@PathVariable String id) {
        PortalParameter parameter = parameterService.findById(id);
        String modifiedBy = getCurrentUserName();
        PortalParameter updated = parameterService.updateValue(
                id, parameter.getDefaultValue(), modifiedBy, "Auf Standardwert zurueckgesetzt");
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        parameterService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/audit-log")
    public ResponseEntity<List<ParameterAuditLog>> getAuditLog(
            @RequestParam(required = false) String appId,
            @RequestParam(required = false) String parameterId) {
        if (parameterId != null) {
            return ResponseEntity.ok(parameterService.getAuditLogByParameter(parameterId));
        }
        if (appId != null) {
            return ResponseEntity.ok(parameterService.getAuditLogByApp(appId));
        }
        return ResponseEntity.ok(parameterService.getFullAuditLog());
    }

    private String getCurrentUserName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof AuthDetails details) {
            return details.email() != null ? details.email() : details.userId();
        }
        return auth != null ? String.valueOf(auth.getPrincipal()) : "system";
    }
}

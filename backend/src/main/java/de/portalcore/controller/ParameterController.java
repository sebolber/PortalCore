package de.portalcore.controller;

import de.portalcore.entity.PortalParameter;
import de.portalcore.service.ParameterService;
import org.springframework.http.ResponseEntity;
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

    @PutMapping("/{id}")
    public ResponseEntity<PortalParameter> updateParameter(
            @PathVariable String id,
            @RequestBody PortalParameter parameter) {
        PortalParameter updated = parameterService.updateParameter(id, parameter);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/audit-log")
    public ResponseEntity<List<Map<String, Object>>> getAuditLog() {
        List<Map<String, Object>> auditLog = parameterService.getAuditLog();
        return ResponseEntity.ok(auditLog);
    }
}

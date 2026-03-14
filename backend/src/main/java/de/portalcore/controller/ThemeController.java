package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.PortalTheme;
import de.portalcore.service.AuditService;
import de.portalcore.service.ThemeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/theme")
public class ThemeController {

    private final ThemeService themeService;
    private final SecurityHelper securityHelper;
    private final AuditService auditService;

    public ThemeController(ThemeService themeService, SecurityHelper securityHelper,
                           AuditService auditService) {
        this.themeService = themeService;
        this.securityHelper = securityHelper;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<PortalTheme> getTheme(@RequestParam(required = false) String tenantId) {
        String effectiveTenantId = tenantId != null ? tenantId : securityHelper.getCurrentTenantId();
        securityHelper.requireTenantAccess(effectiveTenantId);
        return ResponseEntity.ok(themeService.getTheme(effectiveTenantId));
    }

    @PutMapping
    public ResponseEntity<PortalTheme> updateTheme(
            @RequestParam(required = false) String tenantId,
            @RequestBody PortalTheme theme) {
        securityHelper.requireBerechtigung("themenverwaltung", "schreiben");
        String effectiveTenantId = tenantId != null ? tenantId : securityHelper.getCurrentTenantId();
        securityHelper.requireTenantAccess(effectiveTenantId);
        PortalTheme updated = themeService.updateTheme(effectiveTenantId, theme, securityHelper.getCurrentUserId());
        auditService.log(securityHelper.getCurrentUserId(), effectiveTenantId,
                "THEME_AKTUALISIERT", "Portal-Theme aktualisiert");
        return ResponseEntity.ok(updated);
    }
}

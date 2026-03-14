package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.MenuOrderConfig;
import de.portalcore.service.AuditService;
import de.portalcore.service.MenuOrderConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/menu-order")
public class MenuOrderConfigController {

    private final MenuOrderConfigService configService;
    private final SecurityHelper securityHelper;
    private final AuditService auditService;

    public MenuOrderConfigController(MenuOrderConfigService configService, SecurityHelper securityHelper,
                                     AuditService auditService) {
        this.configService = configService;
        this.securityHelper = securityHelper;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<MenuOrderConfig>> getConfig(@RequestParam String tenantId) {
        securityHelper.requireTenantAccess(tenantId);
        return ResponseEntity.ok(configService.getConfig(tenantId));
    }

    @PutMapping
    public ResponseEntity<List<MenuOrderConfig>> saveConfig(
            @RequestParam String tenantId,
            @RequestBody List<MenuOrderConfig> configs) {
        securityHelper.requireBerechtigung("menuverwaltung", "schreiben");
        securityHelper.requireTenantAccess(tenantId);
        List<MenuOrderConfig> saved = configService.saveConfig(tenantId, configs);
        auditService.log(securityHelper.getCurrentUserId(), tenantId,
                "MENU_REIHENFOLGE_AKTUALISIERT", "Menu-Reihenfolge aktualisiert fuer Mandant " + tenantId);
        return ResponseEntity.ok(saved);
    }
}

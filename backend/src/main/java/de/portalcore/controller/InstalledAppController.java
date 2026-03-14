package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.InstalledApp;
import de.portalcore.service.AuditService;
import de.portalcore.service.AuthService;
import de.portalcore.service.InstalledAppService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tenants/{tenantId}/installed-apps")
public class InstalledAppController {

    private final InstalledAppService installedAppService;
    private final SecurityHelper securityHelper;
    private final AuditService auditService;

    public InstalledAppController(InstalledAppService installedAppService,
                                   SecurityHelper securityHelper, AuditService auditService) {
        this.installedAppService = installedAppService;
        this.securityHelper = securityHelper;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<InstalledApp>> listInstalledApps(@PathVariable String tenantId) {
        securityHelper.requireTenantAccess(tenantId);
        return ResponseEntity.ok(installedAppService.getInstalledApps(tenantId));
    }

    @PostMapping
    public ResponseEntity<InstalledApp> installApp(
            @PathVariable String tenantId,
            @RequestBody Map<String, String> body) {
        securityHelper.requireBerechtigung("appstore-admin", "schreiben");
        securityHelper.requireTenantAccess(tenantId);
        String appId = body.get("appId");
        if (appId == null || appId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "appId ist erforderlich.");
        }
        InstalledApp installedApp = installedAppService.installApp(tenantId, appId, securityHelper.getCurrentUserId());
        auditService.log(securityHelper.getCurrentUserId(), tenantId,
                "APP_INSTALLIERT", "App " + appId + " in Mandant " + tenantId + " installiert");
        return ResponseEntity.ok(installedApp);
    }

    @DeleteMapping("/{appId}")
    public ResponseEntity<Void> uninstallApp(
            @PathVariable String tenantId,
            @PathVariable String appId) {
        securityHelper.requireBerechtigung("appstore-admin", "loeschen");
        securityHelper.requireTenantAccess(tenantId);
        auditService.log(securityHelper.getCurrentUserId(), tenantId,
                "APP_DEINSTALLIERT", "App " + appId + " aus Mandant " + tenantId + " deinstalliert");
        installedAppService.uninstallApp(tenantId, appId);
        return ResponseEntity.noContent().build();
    }
}

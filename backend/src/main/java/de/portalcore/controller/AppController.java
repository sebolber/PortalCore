package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.PortalApp;
import de.portalcore.enums.AppCategory;
import de.portalcore.enums.AppType;
import de.portalcore.enums.AppVendor;
import de.portalcore.enums.MarketSegment;
import de.portalcore.service.AppService;
import de.portalcore.service.AuditService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/apps")
public class AppController {

    private final AppService appService;
    private final SecurityHelper securityHelper;
    private final AuditService auditService;

    public AppController(AppService appService, SecurityHelper securityHelper, AuditService auditService) {
        this.appService = appService;
        this.securityHelper = securityHelper;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<PortalApp>> listApps(
            @RequestParam(required = false) AppCategory category,
            @RequestParam(required = false) MarketSegment marketSegment,
            @RequestParam(required = false) AppVendor vendor,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AppType appType) {
        List<PortalApp> apps = appService.listApps(category, marketSegment, vendor, search, appType);
        return ResponseEntity.ok(apps);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortalApp> getAppById(@PathVariable String id) {
        return ResponseEntity.ok(appService.findById(id));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<PortalApp>> getFeaturedApps() {
        return ResponseEntity.ok(appService.findFeatured());
    }

    @GetMapping("/segments")
    public ResponseEntity<Map<MarketSegment, Long>> getAppCountPerSegment() {
        return ResponseEntity.ok(appService.getAppCountPerSegment());
    }

    @PostMapping
    public ResponseEntity<PortalApp> createApp(@Valid @RequestBody PortalApp app) {
        securityHelper.requireSuperAdmin();
        PortalApp created = appService.create(app);
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "APP_ERSTELLT", "App erstellt: " + created.getName());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PortalApp> updateApp(@PathVariable String id, @Valid @RequestBody PortalApp app) {
        securityHelper.requireSuperAdmin();
        PortalApp updated = appService.update(id, app);
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "APP_AKTUALISIERT", "App aktualisiert: " + id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApp(@PathVariable String id) {
        securityHelper.requireSuperAdmin();
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "APP_GELOESCHT", "App geloescht: " + id);
        appService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

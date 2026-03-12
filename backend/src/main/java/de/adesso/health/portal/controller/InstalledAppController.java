package de.adesso.health.portal.controller;

import de.adesso.health.portal.entity.InstalledApp;
import de.adesso.health.portal.service.InstalledAppService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tenants/{tenantId}/installed-apps")
@CrossOrigin(origins = "*")
public class InstalledAppController {

    private final InstalledAppService installedAppService;

    public InstalledAppController(InstalledAppService installedAppService) {
        this.installedAppService = installedAppService;
    }

    @GetMapping
    public ResponseEntity<List<InstalledApp>> listInstalledApps(@PathVariable String tenantId) {
        List<InstalledApp> apps = installedAppService.listInstalledApps(tenantId);
        return ResponseEntity.ok(apps);
    }

    @PostMapping
    public ResponseEntity<InstalledApp> installApp(
            @PathVariable String tenantId,
            @RequestBody Map<String, String> body) {
        String appId = body.get("appId");
        InstalledApp installedApp = installedAppService.installApp(tenantId, appId);
        return ResponseEntity.ok(installedApp);
    }

    @DeleteMapping("/{appId}")
    public ResponseEntity<Void> uninstallApp(
            @PathVariable String tenantId,
            @PathVariable String appId) {
        installedAppService.uninstallApp(tenantId, appId);
        return ResponseEntity.noContent().build();
    }
}

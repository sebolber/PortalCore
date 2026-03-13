package de.portalcore.controller;

import de.portalcore.config.JwtAuthenticationFilter.AuthDetails;
import de.portalcore.entity.InstalledApp;
import de.portalcore.service.AuthService;
import de.portalcore.service.InstalledAppService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tenants/{tenantId}/installed-apps")
public class InstalledAppController {

    private final InstalledAppService installedAppService;
    private final AuthService authService;

    public InstalledAppController(InstalledAppService installedAppService,
                                   AuthService authService) {
        this.installedAppService = installedAppService;
        this.authService = authService;
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
        requireAppstoreAdmin();
        String userId = getCurrentUserId();
        String appId = body.get("appId");
        InstalledApp installedApp = installedAppService.installApp(tenantId, appId, userId);
        return ResponseEntity.ok(installedApp);
    }

    @DeleteMapping("/{appId}")
    public ResponseEntity<Void> uninstallApp(
            @PathVariable String tenantId,
            @PathVariable String appId) {
        requireAppstoreAdmin();
        installedAppService.uninstallApp(tenantId, appId);
        return ResponseEntity.noContent().build();
    }

    private void requireAppstoreAdmin() {
        String userId = getCurrentUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nicht authentifiziert");
        }
        boolean canInstall = authService.hatBerechtigung(userId, "appstore-admin", "schreiben");
        if (!canInstall) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Nur Administratoren duerfen Apps installieren oder deinstallieren.");
        }
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof AuthDetails details) {
            return details.userId();
        }
        return auth != null ? (String) auth.getPrincipal() : null;
    }
}

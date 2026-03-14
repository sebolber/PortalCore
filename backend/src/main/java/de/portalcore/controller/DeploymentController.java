package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.InstalledApp;
import de.portalcore.service.AuditService;
import de.portalcore.service.DeploymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/deployments")
public class DeploymentController {

    private final DeploymentService deploymentService;
    private final SecurityHelper securityHelper;
    private final AuditService auditService;

    public DeploymentController(DeploymentService deploymentService, SecurityHelper securityHelper,
                                AuditService auditService) {
        this.deploymentService = deploymentService;
        this.securityHelper = securityHelper;
        this.auditService = auditService;
    }

    @PostMapping("/{installedAppId}/deploy")
    public ResponseEntity<InstalledApp> deploy(@PathVariable String installedAppId) {
        securityHelper.requireSuperAdmin();
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "DEPLOYMENT_GESTARTET", "Deployment gestartet fuer: " + installedAppId);
        deploymentService.deployAsync(installedAppId);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/{installedAppId}/deploy-sync")
    public ResponseEntity<InstalledApp> deploySync(@PathVariable String installedAppId) {
        securityHelper.requireSuperAdmin();
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "DEPLOYMENT_SYNC_GESTARTET", "Sync-Deployment gestartet fuer: " + installedAppId);
        InstalledApp result = deploymentService.deploy(installedAppId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{installedAppId}/undeploy")
    public ResponseEntity<InstalledApp> undeploy(@PathVariable String installedAppId) {
        securityHelper.requireSuperAdmin();
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "UNDEPLOYMENT_GESTARTET", "Undeployment gestartet fuer: " + installedAppId);
        InstalledApp result = deploymentService.undeploy(installedAppId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{installedAppId}/status")
    public ResponseEntity<Map<String, Object>> getStatus(@PathVariable String installedAppId) {
        securityHelper.requireBerechtigung("appstore-admin", "lesen");
        return ResponseEntity.ok(deploymentService.getDeploymentStatus(installedAppId));
    }
}

package de.portalcore.controller;

import de.portalcore.entity.InstalledApp;
import de.portalcore.service.DeploymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/deployments")
public class DeploymentController {

    private final DeploymentService deploymentService;

    public DeploymentController(DeploymentService deploymentService) {
        this.deploymentService = deploymentService;
    }

    @PostMapping("/{installedAppId}/deploy")
    public ResponseEntity<InstalledApp> deploy(@PathVariable String installedAppId) {
        deploymentService.deployAsync(installedAppId);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/{installedAppId}/deploy-sync")
    public ResponseEntity<InstalledApp> deploySync(@PathVariable String installedAppId) {
        InstalledApp result = deploymentService.deploy(installedAppId);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{installedAppId}/undeploy")
    public ResponseEntity<InstalledApp> undeploy(@PathVariable String installedAppId) {
        InstalledApp result = deploymentService.undeploy(installedAppId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{installedAppId}/status")
    public ResponseEntity<Map<String, Object>> getStatus(@PathVariable String installedAppId) {
        Map<String, Object> status = deploymentService.getDeploymentStatus(installedAppId);
        return ResponseEntity.ok(status);
    }
}

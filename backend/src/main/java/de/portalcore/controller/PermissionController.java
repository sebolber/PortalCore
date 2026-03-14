package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.Berechtigung;
import de.portalcore.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permissions")
public class PermissionController {

    private final PermissionService permissionService;
    private final SecurityHelper securityHelper;

    public PermissionController(PermissionService permissionService, SecurityHelper securityHelper) {
        this.permissionService = permissionService;
        this.securityHelper = securityHelper;
    }

    @GetMapping
    public ResponseEntity<List<Berechtigung>> listPermissions(
            @RequestParam(required = false) String appId) {
        securityHelper.requireBerechtigung("gruppenverwaltung", "lesen");
        return ResponseEntity.ok(permissionService.listPermissions(appId));
    }
}

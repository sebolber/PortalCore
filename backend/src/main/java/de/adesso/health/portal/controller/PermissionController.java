package de.adesso.health.portal.controller;

import de.adesso.health.portal.entity.Berechtigung;
import de.adesso.health.portal.service.PermissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/permissions")
@CrossOrigin(origins = "*")
public class PermissionController {

    private final PermissionService permissionService;

    public PermissionController(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    @GetMapping
    public ResponseEntity<List<Berechtigung>> listPermissions(
            @RequestParam(required = false) String appId) {
        List<Berechtigung> permissions = permissionService.listPermissions(appId);
        return ResponseEntity.ok(permissions);
    }
}

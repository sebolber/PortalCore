package de.adesso.health.portal.controller;

import de.adesso.health.portal.entity.PortalRolle;
import de.adesso.health.portal.service.RoleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@CrossOrigin(origins = "*")
public class RoleController {

    private final RoleService roleService;

    public RoleController(RoleService roleService) {
        this.roleService = roleService;
    }

    @GetMapping
    public ResponseEntity<List<PortalRolle>> listRoles() {
        List<PortalRolle> roles = roleService.listRoles();
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortalRolle> getRoleWithPermissions(@PathVariable String id) {
        PortalRolle role = roleService.getRoleWithPermissions(id);
        return ResponseEntity.ok(role);
    }
}

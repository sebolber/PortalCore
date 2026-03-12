package de.adesso.health.portal.controller;

import de.adesso.health.portal.entity.PortalUser;
import de.adesso.health.portal.enums.UserStatus;
import de.adesso.health.portal.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<PortalUser>> listUsers(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String search) {
        List<PortalUser> users = userService.listUsers(tenantId, status, search);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortalUser> getUserById(@PathVariable String id) {
        PortalUser user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<PortalUser> createUser(@RequestBody PortalUser user) {
        PortalUser created = userService.createUser(user);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PortalUser> updateUser(
            @PathVariable String id,
            @RequestBody PortalUser user) {
        PortalUser updated = userService.updateUser(id, user);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}

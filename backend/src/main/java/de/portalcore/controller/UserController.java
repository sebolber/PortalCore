package de.portalcore.controller;

import de.portalcore.entity.PortalUser;
import de.portalcore.entity.UserAdresse;
import de.portalcore.enums.UserStatus;
import de.portalcore.service.GruppenService;
import de.portalcore.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final GruppenService gruppenService;

    public UserController(UserService userService, GruppenService gruppenService) {
        this.userService = userService;
        this.gruppenService = gruppenService;
    }

    @GetMapping
    public ResponseEntity<List<PortalUser>> listUsers(
            @RequestParam(required = false) String tenantId,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(userService.listUsers(tenantId, status, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortalUser> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    public ResponseEntity<PortalUser> createUser(@RequestBody PortalUser user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PortalUser> updateUser(@PathVariable String id, @RequestBody PortalUser user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}/adressen")
    public ResponseEntity<List<UserAdresse>> getAdressen(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getAdressen(userId));
    }

    @PostMapping("/{userId}/adressen")
    public ResponseEntity<UserAdresse> addAdresse(@PathVariable String userId, @RequestBody UserAdresse adresse) {
        return ResponseEntity.ok(userService.addAdresse(userId, adresse));
    }

    @PutMapping("/{userId}/adressen/{adresseId}")
    public ResponseEntity<UserAdresse> updateAdresse(@PathVariable String userId,
                                                      @PathVariable String adresseId,
                                                      @RequestBody UserAdresse adresse) {
        return ResponseEntity.ok(userService.updateAdresse(adresseId, adresse));
    }

    @DeleteMapping("/{userId}/adressen/{adresseId}")
    public ResponseEntity<Void> deleteAdresse(@PathVariable String userId, @PathVariable String adresseId) {
        userService.deleteAdresse(adresseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}/gruppen")
    public ResponseEntity<?> getUserGruppen(@PathVariable String userId) {
        return ResponseEntity.ok(gruppenService.findByUserId(userId));
    }
}

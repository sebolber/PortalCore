package de.portalcore.controller;

import de.portalcore.config.JwtAuthenticationFilter;
import de.portalcore.entity.Gruppe;
import de.portalcore.entity.GruppenBerechtigung;
import de.portalcore.service.GruppenService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/gruppen")
public class GruppenController {

    private final GruppenService gruppenService;

    public GruppenController(GruppenService gruppenService) {
        this.gruppenService = gruppenService;
    }

    @GetMapping
    public List<Gruppe> getAll(@RequestParam(required = false) String tenantId) {
        if (tenantId != null) {
            return gruppenService.findByTenantId(tenantId);
        }
        return gruppenService.findAll();
    }

    @GetMapping("/{id}")
    public Gruppe getById(@PathVariable String id) {
        return gruppenService.findById(id);
    }

    @PostMapping
    public Gruppe create(@RequestBody Gruppe gruppe) {
        return gruppenService.create(gruppe, getCurrentUserId());
    }

    @PutMapping("/{id}")
    public Gruppe update(@PathVariable String id, @RequestBody Gruppe gruppe) {
        return gruppenService.update(id, gruppe, getCurrentUserId());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        gruppenService.delete(id, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    // ---- Berechtigungen ----

    @GetMapping("/{id}/berechtigungen")
    public List<GruppenBerechtigung> getBerechtigungen(@PathVariable String id) {
        return gruppenService.getBerechtigungen(id);
    }

    @PostMapping("/{id}/berechtigungen")
    public GruppenBerechtigung addBerechtigung(@PathVariable String id,
                                                @RequestBody GruppenBerechtigung berechtigung) {
        return gruppenService.addBerechtigung(id, berechtigung, getCurrentUserId());
    }

    @PutMapping("/{gruppeId}/berechtigungen/{berechtigungId}")
    public GruppenBerechtigung updateBerechtigung(@PathVariable String gruppeId,
                                                   @PathVariable String berechtigungId,
                                                   @RequestBody GruppenBerechtigung berechtigung) {
        return gruppenService.updateBerechtigung(berechtigungId, berechtigung, getCurrentUserId());
    }

    @DeleteMapping("/{gruppeId}/berechtigungen/{berechtigungId}")
    public ResponseEntity<Void> removeBerechtigung(@PathVariable String gruppeId,
                                                    @PathVariable String berechtigungId) {
        gruppenService.removeBerechtigung(berechtigungId, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    // ---- Benutzer-Zuordnung ----

    @PostMapping("/{id}/benutzer/{userId}")
    public ResponseEntity<Map<String, String>> addUser(@PathVariable String id, @PathVariable String userId) {
        gruppenService.addUserToGroup(id, userId, getCurrentUserId());
        return ResponseEntity.ok(Map.of("message", "Benutzer zugeordnet."));
    }

    @DeleteMapping("/{id}/benutzer/{userId}")
    public ResponseEntity<Map<String, String>> removeUser(@PathVariable String id, @PathVariable String userId) {
        gruppenService.removeUserFromGroup(id, userId, getCurrentUserId());
        return ResponseEntity.ok(Map.of("message", "Benutzer entfernt."));
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof JwtAuthenticationFilter.AuthDetails details) {
            return details.userId();
        }
        return "system";
    }
}

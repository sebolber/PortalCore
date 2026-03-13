package de.portalcore.controller;

import de.portalcore.config.JwtAuthenticationFilter;
import de.portalcore.entity.Tenant;
import de.portalcore.entity.UserTenant;
import de.portalcore.repository.UserTenantRepository;
import de.portalcore.service.TenantService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tenants")
@CrossOrigin(origins = "*")
public class TenantController {

    private final TenantService tenantService;
    private final UserTenantRepository userTenantRepository;

    public TenantController(TenantService tenantService, UserTenantRepository userTenantRepository) {
        this.tenantService = tenantService;
        this.userTenantRepository = userTenantRepository;
    }

    @GetMapping
    public ResponseEntity<List<Tenant>> listTenants() {
        return ResponseEntity.ok(tenantService.listTenants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tenant> getTenantById(@PathVariable String id) {
        return ResponseEntity.ok(tenantService.getTenantById(id));
    }

    @PostMapping
    public ResponseEntity<Tenant> createTenant(@RequestBody Tenant tenant) {
        return ResponseEntity.ok(tenantService.create(tenant, getCurrentUserId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tenant> updateTenant(@PathVariable String id, @RequestBody Tenant tenant) {
        return ResponseEntity.ok(tenantService.update(id, tenant, getCurrentUserId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTenant(@PathVariable String id) {
        tenantService.delete(id, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{tenantId}/users")
    public ResponseEntity<List<UserTenant>> getTenantUsers(@PathVariable String tenantId) {
        return ResponseEntity.ok(userTenantRepository.findByTenantId(tenantId));
    }

    @PostMapping("/{tenantId}/users/{userId}")
    public ResponseEntity<Map<String, String>> addUserToTenant(
            @PathVariable String tenantId,
            @PathVariable String userId,
            @RequestParam(defaultValue = "false") boolean istStandard) {
        if (userTenantRepository.existsByUserIdAndTenantId(userId, tenantId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Benutzer ist bereits zugeordnet."));
        }
        UserTenant ut = UserTenant.builder()
                .userId(userId)
                .tenantId(tenantId)
                .istStandard(istStandard)
                .aktiv(true)
                .zugeordnetVon(getCurrentUserId())
                .build();
        userTenantRepository.save(ut);
        return ResponseEntity.ok(Map.of("message", "Benutzer dem Mandanten zugeordnet."));
    }

    @DeleteMapping("/{tenantId}/users/{userId}")
    public ResponseEntity<Map<String, String>> removeUserFromTenant(
            @PathVariable String tenantId,
            @PathVariable String userId) {
        userTenantRepository.deleteById(new de.portalcore.entity.UserTenantId(userId, tenantId));
        return ResponseEntity.ok(Map.of("message", "Zuordnung entfernt."));
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof JwtAuthenticationFilter.AuthDetails details) {
            return details.userId();
        }
        return "system";
    }
}

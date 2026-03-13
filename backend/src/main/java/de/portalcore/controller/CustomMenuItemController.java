package de.portalcore.controller;

import de.portalcore.config.JwtAuthenticationFilter;
import de.portalcore.entity.CustomMenuItem;
import de.portalcore.service.CustomMenuItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/custom-menu-items")
public class CustomMenuItemController {

    private final CustomMenuItemService menuItemService;

    public CustomMenuItemController(CustomMenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    @GetMapping
    public ResponseEntity<List<CustomMenuItem>> getAll(@RequestParam String tenantId) {
        return ResponseEntity.ok(menuItemService.findByTenant(tenantId));
    }

    @GetMapping("/top-level")
    public ResponseEntity<List<CustomMenuItem>> getTopLevel(@RequestParam String tenantId) {
        return ResponseEntity.ok(menuItemService.findTopLevel(tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomMenuItem> getById(@PathVariable String id) {
        return ResponseEntity.ok(menuItemService.findById(id));
    }

    @GetMapping("/{parentId}/children")
    public ResponseEntity<List<CustomMenuItem>> getChildren(@PathVariable String parentId) {
        return ResponseEntity.ok(menuItemService.findChildren(parentId));
    }

    @PostMapping
    public ResponseEntity<CustomMenuItem> create(@RequestBody CustomMenuItem item) {
        return ResponseEntity.ok(menuItemService.create(item, getCurrentUserId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomMenuItem> update(@PathVariable String id, @RequestBody CustomMenuItem item) {
        return ResponseEntity.ok(menuItemService.update(id, item, getCurrentUserId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        menuItemService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody List<CustomMenuItem> items) {
        menuItemService.updateOrder(items);
        return ResponseEntity.noContent().build();
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof JwtAuthenticationFilter.AuthDetails details) {
            return details.userId();
        }
        return "system";
    }
}

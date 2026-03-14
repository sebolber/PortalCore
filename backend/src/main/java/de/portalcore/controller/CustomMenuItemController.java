package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.CustomMenuItem;
import de.portalcore.service.AuditService;
import de.portalcore.service.CustomMenuItemService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/custom-menu-items")
public class CustomMenuItemController {

    private final CustomMenuItemService menuItemService;
    private final SecurityHelper securityHelper;
    private final AuditService auditService;

    public CustomMenuItemController(CustomMenuItemService menuItemService, SecurityHelper securityHelper,
                                    AuditService auditService) {
        this.menuItemService = menuItemService;
        this.securityHelper = securityHelper;
        this.auditService = auditService;
    }

    @GetMapping
    public ResponseEntity<List<CustomMenuItem>> getAll(@RequestParam String tenantId) {
        securityHelper.requireTenantAccess(tenantId);
        return ResponseEntity.ok(menuItemService.findByTenant(tenantId));
    }

    @GetMapping("/top-level")
    public ResponseEntity<List<CustomMenuItem>> getTopLevel(@RequestParam String tenantId) {
        securityHelper.requireTenantAccess(tenantId);
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
    public ResponseEntity<CustomMenuItem> create(@Valid @RequestBody CustomMenuItem item) {
        securityHelper.requireBerechtigung("menuverwaltung", "schreiben");
        if (item.getTenantId() == null) {
            item.setTenantId(securityHelper.getCurrentTenantId());
        }
        securityHelper.requireTenantAccess(item.getTenantId());
        CustomMenuItem created = menuItemService.create(item, securityHelper.getCurrentUserId());
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "MENU_ITEM_ERSTELLT", "Menu-Item erstellt: " + created.getLabel());
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomMenuItem> update(@PathVariable String id,
                                                  @Valid @RequestBody CustomMenuItem item) {
        securityHelper.requireBerechtigung("menuverwaltung", "schreiben");
        CustomMenuItem updated = menuItemService.update(id, item, securityHelper.getCurrentUserId());
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "MENU_ITEM_AKTUALISIERT", "Menu-Item aktualisiert: " + id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        securityHelper.requireBerechtigung("menuverwaltung", "loeschen");
        auditService.log(securityHelper.getCurrentUserId(), securityHelper.getCurrentTenantId(),
                "MENU_ITEM_GELOESCHT", "Menu-Item geloescht: " + id);
        menuItemService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/reorder")
    public ResponseEntity<Void> reorder(@RequestBody List<CustomMenuItem> items) {
        securityHelper.requireBerechtigung("menuverwaltung", "schreiben");
        menuItemService.updateOrder(items);
        return ResponseEntity.noContent().build();
    }
}

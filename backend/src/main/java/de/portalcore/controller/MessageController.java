package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.PortalMessage;
import de.portalcore.enums.MessageCategory;
import de.portalcore.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
public class MessageController {

    private final MessageService messageService;
    private final SecurityHelper securityHelper;

    public MessageController(MessageService messageService, SecurityHelper securityHelper) {
        this.messageService = messageService;
        this.securityHelper = securityHelper;
    }

    @GetMapping
    public ResponseEntity<List<PortalMessage>> listMessages(
            @RequestParam(required = false) MessageCategory category,
            @RequestParam(required = false) String tenantId) {
        String effectiveTenantId = tenantId != null ? tenantId : securityHelper.getCurrentTenantId();
        securityHelper.requireTenantAccess(effectiveTenantId);
        return ResponseEntity.ok(messageService.listMessages(category, effectiveTenantId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<PortalMessage> markAsRead(@PathVariable String id) {
        return ResponseEntity.ok(messageService.markAsRead(id));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestParam String tenantId) {
        securityHelper.requireTenantAccess(tenantId);
        messageService.markAllAsRead(tenantId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@RequestParam String tenantId) {
        securityHelper.requireTenantAccess(tenantId);
        return ResponseEntity.ok(messageService.getUnreadCount(tenantId));
    }
}

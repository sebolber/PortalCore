package de.adesso.health.portal.controller;

import de.adesso.health.portal.entity.PortalMessage;
import de.adesso.health.portal.enums.MessageCategory;
import de.adesso.health.portal.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    public ResponseEntity<List<PortalMessage>> listMessages(
            @RequestParam(required = false) MessageCategory category,
            @RequestParam(required = false) String tenantId) {
        List<PortalMessage> messages = messageService.listMessages(category, tenantId);
        return ResponseEntity.ok(messages);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<PortalMessage> markAsRead(@PathVariable String id) {
        PortalMessage message = messageService.markAsRead(id);
        return ResponseEntity.ok(message);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestParam String tenantId) {
        messageService.markAllAsRead(tenantId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@RequestParam String tenantId) {
        long count = messageService.getUnreadCount(tenantId);
        return ResponseEntity.ok(count);
    }
}

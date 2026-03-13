package de.portalcore.controller;

import de.portalcore.entity.MenuOrderConfig;
import de.portalcore.service.MenuOrderConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/menu-order")
public class MenuOrderConfigController {

    private final MenuOrderConfigService configService;

    public MenuOrderConfigController(MenuOrderConfigService configService) {
        this.configService = configService;
    }

    @GetMapping
    public ResponseEntity<List<MenuOrderConfig>> getConfig(@RequestParam String tenantId) {
        return ResponseEntity.ok(configService.getConfig(tenantId));
    }

    @PutMapping
    public ResponseEntity<List<MenuOrderConfig>> saveConfig(
            @RequestParam String tenantId,
            @RequestBody List<MenuOrderConfig> configs) {
        return ResponseEntity.ok(configService.saveConfig(tenantId, configs));
    }
}

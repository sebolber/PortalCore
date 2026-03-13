package de.portalcore.controller;

import de.portalcore.entity.PortalApp;
import de.portalcore.enums.AppCategory;
import de.portalcore.enums.AppType;
import de.portalcore.enums.AppVendor;
import de.portalcore.enums.MarketSegment;
import de.portalcore.service.AppService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/apps")
@CrossOrigin(origins = "*")
public class AppController {

    private final AppService appService;

    public AppController(AppService appService) {
        this.appService = appService;
    }

    @GetMapping
    public ResponseEntity<List<PortalApp>> listApps(
            @RequestParam(required = false) AppCategory category,
            @RequestParam(required = false) MarketSegment marketSegment,
            @RequestParam(required = false) AppVendor vendor,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AppType appType) {
        List<PortalApp> apps = appService.listApps(category, marketSegment, vendor, search, appType);
        return ResponseEntity.ok(apps);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PortalApp> getAppById(@PathVariable String id) {
        PortalApp app = appService.getAppById(id);
        return ResponseEntity.ok(app);
    }

    @GetMapping("/featured")
    public ResponseEntity<List<PortalApp>> getFeaturedApps() {
        List<PortalApp> apps = appService.getFeaturedApps();
        return ResponseEntity.ok(apps);
    }

    @GetMapping("/segments")
    public ResponseEntity<Map<MarketSegment, Long>> getAppCountPerSegment() {
        Map<MarketSegment, Long> counts = appService.getAppCountPerSegment();
        return ResponseEntity.ok(counts);
    }

    @PostMapping
    public ResponseEntity<PortalApp> createApp(@RequestBody PortalApp app) {
        PortalApp created = appService.create(app);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PortalApp> updateApp(@PathVariable String id, @RequestBody PortalApp app) {
        PortalApp updated = appService.update(id, app);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApp(@PathVariable String id) {
        appService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

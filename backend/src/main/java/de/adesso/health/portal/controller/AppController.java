package de.adesso.health.portal.controller;

import de.adesso.health.portal.entity.PortalApp;
import de.adesso.health.portal.enums.AppCategory;
import de.adesso.health.portal.enums.AppType;
import de.adesso.health.portal.enums.AppVendor;
import de.adesso.health.portal.enums.MarketSegment;
import de.adesso.health.portal.service.AppService;
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
}

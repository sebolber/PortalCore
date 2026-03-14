package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
import de.portalcore.entity.DashboardWidget;
import de.portalcore.entity.PortalSeite;
import de.portalcore.entity.WidgetDefinition;
import de.portalcore.service.AuditService;
import de.portalcore.service.DashboardService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;
    private final SecurityHelper securityHelper;
    private final AuditService auditService;

    public DashboardController(DashboardService dashboardService, SecurityHelper securityHelper,
                               AuditService auditService) {
        this.dashboardService = dashboardService;
        this.securityHelper = securityHelper;
        this.auditService = auditService;
    }

    @GetMapping("/widget-definitionen")
    public ResponseEntity<List<WidgetDefDto>> getWidgetDefinitionen(
            @RequestParam(required = false) String kategorie) {
        List<WidgetDefinition> defs;
        if (kategorie != null && !kategorie.isBlank()) {
            defs = dashboardService.getWidgetDefinitionenByKategorie(kategorie);
        } else {
            defs = dashboardService.getAlleWidgetDefinitionen();
        }
        return ResponseEntity.ok(defs.stream().map(this::toDefDto).toList());
    }

    @GetMapping("/widgets")
    public ResponseEntity<List<DashboardWidgetDto>> getUserWidgets() {
        String userId = securityHelper.getCurrentUserId();
        String tenantId = securityHelper.getCurrentTenantId();
        List<DashboardWidget> widgets = dashboardService.getUserDashboard(userId, tenantId);
        return ResponseEntity.ok(widgets.stream().map(this::toWidgetDto).toList());
    }

    @PostMapping("/widgets")
    public ResponseEntity<DashboardWidgetDto> widgetHinzufuegen(
            @Valid @RequestBody WidgetHinzufuegenRequest req) {
        String userId = securityHelper.getCurrentUserId();
        String tenantId = securityHelper.getCurrentTenantId();
        DashboardWidget widget = dashboardService.widgetHinzufuegen(
                userId, tenantId, req.widgetDefinitionId(),
                req.positionX(), req.positionY(), req.breite(), req.hoehe(),
                req.konfiguration());
        return ResponseEntity.status(HttpStatus.CREATED).body(toWidgetDto(widget));
    }

    @PutMapping("/widgets/{id}")
    public ResponseEntity<DashboardWidgetDto> widgetAktualisieren(
            @PathVariable String id, @RequestBody WidgetAktualisierenRequest req) {
        DashboardWidget widget = dashboardService.widgetAktualisieren(
                id, req.positionX(), req.positionY(), req.breite(), req.hoehe(), req.konfiguration());
        return ResponseEntity.ok(toWidgetDto(widget));
    }

    @DeleteMapping("/widgets/{id}")
    public ResponseEntity<Void> widgetEntfernen(@PathVariable String id) {
        dashboardService.widgetEntfernen(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/layout")
    public ResponseEntity<Void> layoutSpeichern(@RequestBody List<DashboardService.LayoutItem> items) {
        String userId = securityHelper.getCurrentUserId();
        String tenantId = securityHelper.getCurrentTenantId();
        dashboardService.layoutSpeichern(userId, tenantId, items);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/seiten")
    public ResponseEntity<List<SeiteDto>> getSeiten() {
        List<PortalSeite> seiten = dashboardService.getAlleSeiten();
        return ResponseEntity.ok(seiten.stream().map(this::toSeiteDto).toList());
    }

    private WidgetDefDto toDefDto(WidgetDefinition d) {
        return new WidgetDefDto(d.getId(), d.getWidgetKey(), d.getTitel(), d.getBeschreibung(),
                d.getKategorie(), d.getWidgetTyp(), d.getAppId(), d.getAppName(), d.getIconPath(),
                d.getStandardBreite(), d.getStandardHoehe(), d.getMinBreite(), d.getMinHoehe(),
                d.getMaxBreite(), d.getMaxHoehe(), d.getDatenEndpunkt(), d.getLinkZiel(),
                d.isKonfigurierbar());
    }

    private DashboardWidgetDto toWidgetDto(DashboardWidget w) {
        WidgetDefinition d = w.getWidgetDefinition();
        return new DashboardWidgetDto(w.getId(), toDefDto(d),
                w.getPositionX(), w.getPositionY(), w.getBreite(), w.getHoehe(),
                w.getKonfiguration(), w.isSichtbar(), w.getSortierung());
    }

    private SeiteDto toSeiteDto(PortalSeite s) {
        return new SeiteDto(s.getId(), s.getSeitenKey(), s.getTitel(), s.getBeschreibung(),
                s.getRoute(), s.getIconPath(), s.getKategorie(), s.getAppId());
    }

    record WidgetDefDto(String id, String widgetKey, String titel, String beschreibung,
                        String kategorie, String widgetTyp, String appId, String appName,
                        String iconPath, int standardBreite, int standardHoehe,
                        int minBreite, int minHoehe, int maxBreite, int maxHoehe,
                        String datenEndpunkt, String linkZiel, boolean konfigurierbar) {}

    record DashboardWidgetDto(String id, WidgetDefDto definition,
                              int positionX, int positionY, int breite, int hoehe,
                              String konfiguration, boolean sichtbar, int sortierung) {}

    record SeiteDto(String id, String seitenKey, String titel, String beschreibung,
                    String route, String iconPath, String kategorie, String appId) {}

    record WidgetHinzufuegenRequest(
            @NotBlank(message = "Widget-Definition-ID ist erforderlich")
            String widgetDefinitionId,
            int positionX, int positionY, int breite, int hoehe, String konfiguration) {}

    record WidgetAktualisierenRequest(int positionX, int positionY, int breite, int hoehe,
                                      String konfiguration) {}
}

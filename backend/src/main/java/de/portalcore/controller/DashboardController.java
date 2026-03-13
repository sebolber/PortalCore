package de.portalcore.controller;

import de.portalcore.config.JwtAuthenticationFilter.AuthDetails;
import de.portalcore.entity.*;
import de.portalcore.service.DashboardService;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // ===== Widget-Katalog =====

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

    // ===== User Dashboard =====

    @GetMapping("/widgets")
    public ResponseEntity<List<DashboardWidgetDto>> getUserWidgets() {
        AuthDetails auth = getAuth();
        List<DashboardWidget> widgets = dashboardService.getUserDashboard(auth.userId(), auth.tenantId());
        return ResponseEntity.ok(widgets.stream().map(this::toWidgetDto).toList());
    }

    @PostMapping("/widgets")
    public ResponseEntity<DashboardWidgetDto> widgetHinzufuegen(@RequestBody WidgetHinzufuegenRequest req) {
        AuthDetails auth = getAuth();
        DashboardWidget widget = dashboardService.widgetHinzufuegen(
                auth.userId(), auth.tenantId(), req.widgetDefinitionId(),
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
        AuthDetails auth = getAuth();
        dashboardService.layoutSpeichern(auth.userId(), auth.tenantId(), items);
        return ResponseEntity.noContent().build();
    }

    // ===== Portal-Seiten =====

    @GetMapping("/seiten")
    public ResponseEntity<List<SeiteDto>> getSeiten() {
        List<PortalSeite> seiten = dashboardService.getAlleSeiten();
        return ResponseEntity.ok(seiten.stream().map(this::toSeiteDto).toList());
    }

    // ===== Auth Helper =====

    private AuthDetails getAuth() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof AuthDetails details) {
            return details;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nicht authentifiziert");
    }

    // ===== DTO Mapping =====

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

    // ===== Records =====

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

    record WidgetHinzufuegenRequest(String widgetDefinitionId, int positionX, int positionY,
                                    int breite, int hoehe, String konfiguration) {}

    record WidgetAktualisierenRequest(int positionX, int positionY, int breite, int hoehe,
                                      String konfiguration) {}
}

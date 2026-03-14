package de.portalcore.service;

import de.portalcore.entity.DashboardWidget;
import de.portalcore.entity.PortalSeite;
import de.portalcore.entity.PortalUser;
import de.portalcore.entity.Tenant;
import de.portalcore.entity.WidgetDefinition;
import de.portalcore.repository.DashboardWidgetRepository;
import de.portalcore.repository.PortalSeiteRepository;
import de.portalcore.repository.PortalUserRepository;
import de.portalcore.repository.TenantRepository;
import de.portalcore.repository.WidgetDefinitionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final WidgetDefinitionRepository widgetDefRepo;
    private final DashboardWidgetRepository dashboardWidgetRepo;
    private final PortalSeiteRepository portalSeiteRepo;
    private final PortalUserRepository userRepo;
    private final TenantRepository tenantRepo;

    public DashboardService(WidgetDefinitionRepository widgetDefRepo,
                            DashboardWidgetRepository dashboardWidgetRepo,
                            PortalSeiteRepository portalSeiteRepo,
                            PortalUserRepository userRepo,
                            TenantRepository tenantRepo) {
        this.widgetDefRepo = widgetDefRepo;
        this.dashboardWidgetRepo = dashboardWidgetRepo;
        this.portalSeiteRepo = portalSeiteRepo;
        this.userRepo = userRepo;
        this.tenantRepo = tenantRepo;
    }

    public List<WidgetDefinition> getAlleWidgetDefinitionen() {
        return widgetDefRepo.findByAktivTrueOrderByKategorieAscTitelAsc();
    }

    public List<WidgetDefinition> getWidgetDefinitionenByKategorie(String kategorie) {
        return widgetDefRepo.findByKategorieAndAktivTrue(kategorie);
    }

    public List<WidgetDefinition> getWidgetDefinitionenByApp(String appId) {
        return widgetDefRepo.findByAppIdAndAktivTrue(appId);
    }

    @Transactional
    public WidgetDefinition widgetDefinitionRegistrieren(WidgetDefinition definition) {
        if (definition.getId() == null) definition.setId(UUID.randomUUID().toString());
        return widgetDefRepo.save(definition);
    }

    public List<DashboardWidget> getUserDashboard(String userId, String tenantId) {
        return dashboardWidgetRepo.findByUserIdAndTenantIdOrderBySortierungAsc(userId, tenantId);
    }

    @Transactional
    public DashboardWidget widgetHinzufuegen(String userId, String tenantId, String widgetDefId,
                                              int posX, int posY, int breite, int hoehe,
                                              String konfiguration) {
        PortalUser user = userRepo.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
        Tenant tenant = tenantRepo.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found: " + tenantId));
        WidgetDefinition def = widgetDefRepo.findById(widgetDefId)
                .orElseThrow(() -> new EntityNotFoundException("Widget definition not found: " + widgetDefId));

        DashboardWidget widget = DashboardWidget.builder()
                .id(UUID.randomUUID().toString())
                .user(user)
                .tenant(tenant)
                .widgetDefinition(def)
                .positionX(posX)
                .positionY(posY)
                .breite(breite > 0 ? breite : def.getStandardBreite())
                .hoehe(hoehe > 0 ? hoehe : def.getStandardHoehe())
                .konfiguration(konfiguration)
                .sichtbar(true)
                .sortierung(0)
                .erstelltAm(LocalDateTime.now())
                .aktualisiertAm(LocalDateTime.now())
                .build();

        return dashboardWidgetRepo.save(widget);
    }

    @Transactional
    public void widgetEntfernen(String widgetId) {
        if (!dashboardWidgetRepo.existsById(widgetId)) {
            throw new EntityNotFoundException("Dashboard widget not found: " + widgetId);
        }
        dashboardWidgetRepo.deleteById(widgetId);
    }

    @Transactional
    public DashboardWidget widgetAktualisieren(String widgetId, int posX, int posY,
                                                int breite, int hoehe, String konfiguration) {
        DashboardWidget widget = dashboardWidgetRepo.findById(widgetId)
                .orElseThrow(() -> new EntityNotFoundException("Dashboard widget not found: " + widgetId));
        widget.setPositionX(posX);
        widget.setPositionY(posY);
        widget.setBreite(breite);
        widget.setHoehe(hoehe);
        if (konfiguration != null) widget.setKonfiguration(konfiguration);
        return dashboardWidgetRepo.save(widget);
    }

    @Transactional
    public void layoutSpeichern(String userId, String tenantId, List<LayoutItem> items) {
        List<DashboardWidget> existing = dashboardWidgetRepo
                .findByUserIdAndTenantIdOrderBySortierungAsc(userId, tenantId);

        for (LayoutItem item : items) {
            existing.stream()
                    .filter(w -> w.getId().equals(item.id()))
                    .findFirst()
                    .ifPresent(w -> {
                        w.setPositionX(item.positionX());
                        w.setPositionY(item.positionY());
                        w.setBreite(item.breite());
                        w.setHoehe(item.hoehe());
                        w.setSortierung(item.sortierung());
                        dashboardWidgetRepo.save(w);
                    });
        }
    }

    public List<PortalSeite> getAlleSeiten() {
        return portalSeiteRepo.findByAktivTrueOrderByKategorieAscTitelAsc();
    }

    public record LayoutItem(String id, int positionX, int positionY, int breite, int hoehe, int sortierung) {}
}

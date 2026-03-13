package de.portalcore.service;

import de.portalcore.entity.*;
import de.portalcore.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class InstalledAppService {

    private static final Logger log = LoggerFactory.getLogger(InstalledAppService.class);

    private final InstalledAppRepository installedAppRepository;
    private final TenantRepository tenantRepository;
    private final PortalAppRepository portalAppRepository;
    private final AppUseCaseRepository appUseCaseRepository;
    private final GruppeRepository gruppeRepository;
    private final GruppenBerechtigungRepository berechtigungRepository;
    private final AuditService auditService;

    public InstalledAppService(InstalledAppRepository installedAppRepository,
                               TenantRepository tenantRepository,
                               PortalAppRepository portalAppRepository,
                               AppUseCaseRepository appUseCaseRepository,
                               GruppeRepository gruppeRepository,
                               GruppenBerechtigungRepository berechtigungRepository,
                               AuditService auditService) {
        this.installedAppRepository = installedAppRepository;
        this.tenantRepository = tenantRepository;
        this.portalAppRepository = portalAppRepository;
        this.appUseCaseRepository = appUseCaseRepository;
        this.gruppeRepository = gruppeRepository;
        this.berechtigungRepository = berechtigungRepository;
        this.auditService = auditService;
    }

    public List<InstalledApp> getInstalledApps(String tenantId) {
        return installedAppRepository.findByTenantId(tenantId);
    }

    @Transactional
    public InstalledApp installApp(String tenantId, String appId, String installedBy) {
        if (installedAppRepository.existsByTenantIdAndAppId(tenantId, appId)) {
            throw new IllegalStateException("App " + appId + " is already installed for tenant " + tenantId);
        }

        Tenant tenant = tenantRepository.findById(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with id: " + tenantId));
        PortalApp app = portalAppRepository.findById(appId)
                .orElseThrow(() -> new EntityNotFoundException("PortalApp not found with id: " + appId));

        InstalledApp installedApp = InstalledApp.builder()
                .tenant(tenant)
                .app(app)
                .installedAt(LocalDateTime.now())
                .installedBy(installedBy)
                .status("ACTIVE")
                .build();

        InstalledApp saved = installedAppRepository.save(installedApp);

        // App-Use-Cases in die Admin-Gruppe eintragen
        syncAppPermissionsOnInstall(appId);

        auditService.log(installedBy, tenantId, "APP_INSTALLIERT",
                "App '" + app.getName() + "' installiert");

        return saved;
    }

    @Transactional
    public void uninstallApp(String tenantId, String appId) {
        InstalledApp installedApp = installedAppRepository.findByTenantIdAndAppId(tenantId, appId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Installed app not found for tenant " + tenantId + " and app " + appId));

        // App-Berechtigungen aus allen Gruppen entfernen
        removeAppPermissions(appId);

        installedAppRepository.delete(installedApp);

        auditService.log(null, tenantId, "APP_DEINSTALLIERT",
                "App '" + appId + "' deinstalliert");
    }

    /**
     * Beim Installieren: Registrierte Use Cases der App in die Admin-Gruppe eintragen.
     * Admin bekommt automatisch volle Rechte auf alle App-Use-Cases.
     */
    private void syncAppPermissionsOnInstall(String appId) {
        List<AppUseCase> useCases = appUseCaseRepository.findByAppId(appId);
        if (useCases.isEmpty()) {
            log.info("App {} hat keine registrierten Use Cases", appId);
            return;
        }

        // Admin-Gruppe finden
        gruppeRepository.findById("g-admin").ifPresent(adminGruppe -> {
            for (AppUseCase uc : useCases) {
                // Pruefen ob Berechtigung schon existiert
                boolean exists = adminGruppe.getBerechtigungen().stream()
                        .anyMatch(b -> b.getUseCase().equals(uc.getUseCase()) && appId.equals(b.getAppId()));
                if (!exists) {
                    GruppenBerechtigung gb = GruppenBerechtigung.builder()
                            .id("gb-app-" + UUID.randomUUID().toString().substring(0, 8))
                            .gruppe(adminGruppe)
                            .useCase(uc.getUseCase())
                            .useCaseLabel(uc.getUseCaseLabel())
                            .anzeigen(true)
                            .lesen(true)
                            .schreiben(true)
                            .loeschen(true)
                            .appId(appId)
                            .build();
                    berechtigungRepository.save(gb);
                    log.info("Admin-Berechtigung fuer App-Use-Case '{}' ({}) erstellt", uc.getUseCaseLabel(), appId);
                }
            }
        });
    }

    /**
     * Beim Deinstallieren: Alle Berechtigungen dieser App aus allen Gruppen entfernen.
     */
    private void removeAppPermissions(String appId) {
        List<GruppenBerechtigung> appPerms = berechtigungRepository.findByAppId(appId);
        if (!appPerms.isEmpty()) {
            berechtigungRepository.deleteAll(appPerms);
            log.info("{} Berechtigungen fuer App {} entfernt", appPerms.size(), appId);
        }

        // Auch registrierte Use Cases entfernen
        appUseCaseRepository.deleteByAppId(appId);
    }

    public boolean isAppInstalled(String tenantId, String appId) {
        return installedAppRepository.existsByTenantIdAndAppId(tenantId, appId);
    }

    public List<InstalledApp> listInstalledApps(String tenantId) {
        return getInstalledApps(tenantId);
    }

    @Transactional
    public InstalledApp installApp(String tenantId, String appId) {
        return installApp(tenantId, appId, "system");
    }
}

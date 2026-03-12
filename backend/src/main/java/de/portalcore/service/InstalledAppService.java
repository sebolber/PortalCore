package de.portalcore.service;

import de.portalcore.entity.InstalledApp;
import de.portalcore.entity.PortalApp;
import de.portalcore.entity.Tenant;
import de.portalcore.repository.InstalledAppRepository;
import de.portalcore.repository.PortalAppRepository;
import de.portalcore.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class InstalledAppService {

    private final InstalledAppRepository installedAppRepository;
    private final TenantRepository tenantRepository;
    private final PortalAppRepository portalAppRepository;

    public InstalledAppService(InstalledAppRepository installedAppRepository,
                               TenantRepository tenantRepository,
                               PortalAppRepository portalAppRepository) {
        this.installedAppRepository = installedAppRepository;
        this.tenantRepository = tenantRepository;
        this.portalAppRepository = portalAppRepository;
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

        return installedAppRepository.save(installedApp);
    }

    @Transactional
    public void uninstallApp(String tenantId, String appId) {
        InstalledApp installedApp = installedAppRepository.findByTenantIdAndAppId(tenantId, appId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Installed app not found for tenant " + tenantId + " and app " + appId));
        installedAppRepository.delete(installedApp);
    }

    public boolean isAppInstalled(String tenantId, String appId) {
        return installedAppRepository.existsByTenantIdAndAppId(tenantId, appId);
    }
}

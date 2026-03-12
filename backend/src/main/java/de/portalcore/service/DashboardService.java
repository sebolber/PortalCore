package de.portalcore.service;

import de.portalcore.repository.InstalledAppRepository;
import de.portalcore.repository.PortalAppRepository;
import de.portalcore.repository.PortalUserRepository;
import de.portalcore.repository.TenantRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final PortalAppRepository portalAppRepository;
    private final PortalUserRepository portalUserRepository;
    private final TenantRepository tenantRepository;
    private final InstalledAppRepository installedAppRepository;

    public DashboardService(PortalAppRepository portalAppRepository,
                            PortalUserRepository portalUserRepository,
                            TenantRepository tenantRepository,
                            InstalledAppRepository installedAppRepository) {
        this.portalAppRepository = portalAppRepository;
        this.portalUserRepository = portalUserRepository;
        this.tenantRepository = tenantRepository;
        this.installedAppRepository = installedAppRepository;
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("appCount", portalAppRepository.count());
        stats.put("userCount", portalUserRepository.count());
        stats.put("tenantCount", tenantRepository.count());
        stats.put("installedAppCount", installedAppRepository.count());
        return stats;
    }
}

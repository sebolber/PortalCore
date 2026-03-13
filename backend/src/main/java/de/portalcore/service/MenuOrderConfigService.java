package de.portalcore.service;

import de.portalcore.entity.MenuOrderConfig;
import de.portalcore.repository.MenuOrderConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class MenuOrderConfigService {

    private final MenuOrderConfigRepository configRepository;

    public MenuOrderConfigService(MenuOrderConfigRepository configRepository) {
        this.configRepository = configRepository;
    }

    public List<MenuOrderConfig> getConfig(String tenantId) {
        return configRepository.findByTenantIdOrderBySortOrder(tenantId);
    }

    @Transactional
    public List<MenuOrderConfig> saveConfig(String tenantId, List<MenuOrderConfig> configs) {
        // Delete existing config for tenant
        List<MenuOrderConfig> existing = configRepository.findByTenantIdOrderBySortOrder(tenantId);
        configRepository.deleteAll(existing);

        // Save new config
        for (int i = 0; i < configs.size(); i++) {
            MenuOrderConfig c = configs.get(i);
            if (c.getId() == null || c.getId().isBlank()) {
                c.setId("moc-" + UUID.randomUUID().toString().substring(0, 8));
            }
            c.setTenantId(tenantId);
            c.setSortOrder(i);
        }
        return configRepository.saveAll(configs);
    }
}

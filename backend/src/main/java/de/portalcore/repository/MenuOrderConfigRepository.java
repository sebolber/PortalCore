package de.portalcore.repository;

import de.portalcore.entity.MenuOrderConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MenuOrderConfigRepository extends JpaRepository<MenuOrderConfig, String> {

    List<MenuOrderConfig> findByTenantIdOrderBySortOrder(String tenantId);

    Optional<MenuOrderConfig> findByTenantIdAndMenuItemKey(String tenantId, String menuItemKey);
}

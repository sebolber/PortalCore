package de.portalcore.repository;

import de.portalcore.entity.CustomMenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomMenuItemRepository extends JpaRepository<CustomMenuItem, String> {

    List<CustomMenuItem> findByTenantIdOrderBySortOrder(String tenantId);

    List<CustomMenuItem> findByTenantIdAndParentIdIsNullOrderBySortOrder(String tenantId);

    List<CustomMenuItem> findByParentIdOrderBySortOrder(String parentId);
}

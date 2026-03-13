package de.portalcore.repository;

import de.portalcore.entity.DashboardWidget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DashboardWidgetRepository extends JpaRepository<DashboardWidget, String> {

    List<DashboardWidget> findByUserIdAndTenantIdOrderBySortierungAsc(String userId, String tenantId);

    void deleteByUserIdAndTenantId(String userId, String tenantId);
}

package de.adesso.health.portal.repository;

import de.adesso.health.portal.entity.InstalledApp;
import de.adesso.health.portal.entity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InstalledAppRepository extends JpaRepository<InstalledApp, String> {

    List<InstalledApp> findByTenant(Tenant tenant);

    List<InstalledApp> findByTenantId(String tenantId);

    Optional<InstalledApp> findByTenantIdAndAppId(String tenantId, String appId);

    boolean existsByTenantIdAndAppId(String tenantId, String appId);
}

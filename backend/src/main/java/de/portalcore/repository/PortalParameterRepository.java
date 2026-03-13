package de.portalcore.repository;

import de.portalcore.entity.PortalParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortalParameterRepository extends JpaRepository<PortalParameter, String> {

    List<PortalParameter> findByAppId(String appId);

    List<PortalParameter> findByGroup(String group);

    List<PortalParameter> findByAppIdAndGroup(String appId, String group);

    // Mandantenspezifische Abfragen: eigene Parameter + globale (tenant_id IS NULL)
    @Query("SELECT p FROM PortalParameter p WHERE p.tenantId = :tenantId OR p.tenantId IS NULL")
    List<PortalParameter> findByTenantIdOrGlobal(@Param("tenantId") String tenantId);

    @Query("SELECT p FROM PortalParameter p WHERE (p.tenantId = :tenantId OR p.tenantId IS NULL) AND p.appId = :appId")
    List<PortalParameter> findByTenantIdOrGlobalAndAppId(@Param("tenantId") String tenantId, @Param("appId") String appId);
}

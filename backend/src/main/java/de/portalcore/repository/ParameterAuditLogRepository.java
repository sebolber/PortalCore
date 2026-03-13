package de.portalcore.repository;

import de.portalcore.entity.ParameterAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParameterAuditLogRepository extends JpaRepository<ParameterAuditLog, String> {

    List<ParameterAuditLog> findByParameterIdOrderByGeaendertAmDesc(String parameterId);

    List<ParameterAuditLog> findByAppIdOrderByGeaendertAmDesc(String appId);

    List<ParameterAuditLog> findAllByOrderByGeaendertAmDesc();

    // Mandantenspezifische Abfragen
    @Query("SELECT a FROM ParameterAuditLog a WHERE a.tenantId = :tenantId OR a.tenantId IS NULL ORDER BY a.geaendertAm DESC")
    List<ParameterAuditLog> findByTenantIdOrGlobalOrderByGeaendertAmDesc(@Param("tenantId") String tenantId);

    @Query("SELECT a FROM ParameterAuditLog a WHERE (a.tenantId = :tenantId OR a.tenantId IS NULL) AND a.appId = :appId ORDER BY a.geaendertAm DESC")
    List<ParameterAuditLog> findByTenantIdOrGlobalAndAppIdOrderByGeaendertAmDesc(@Param("tenantId") String tenantId, @Param("appId") String appId);

    @Query("SELECT a FROM ParameterAuditLog a WHERE (a.tenantId = :tenantId OR a.tenantId IS NULL) AND a.parameterId = :parameterId ORDER BY a.geaendertAm DESC")
    List<ParameterAuditLog> findByTenantIdOrGlobalAndParameterIdOrderByGeaendertAmDesc(@Param("tenantId") String tenantId, @Param("parameterId") String parameterId);
}

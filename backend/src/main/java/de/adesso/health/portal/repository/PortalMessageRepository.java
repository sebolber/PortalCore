package de.adesso.health.portal.repository;

import de.adesso.health.portal.entity.PortalMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortalMessageRepository extends JpaRepository<PortalMessage, String> {

    List<PortalMessage> findByTenantIdOrderByTimestampDesc(String tenantId);

    List<PortalMessage> findByTenantIdAndReadFalseOrderByTimestampDesc(String tenantId);

    long countByTenantIdAndReadFalse(String tenantId);

    @Modifying
    @Query("UPDATE PortalMessage m SET m.read = true WHERE m.tenant.id = :tenantId AND m.read = false")
    int markAllAsReadByTenantId(@Param("tenantId") String tenantId);
}

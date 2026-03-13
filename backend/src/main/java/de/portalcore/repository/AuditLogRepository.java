package de.portalcore.repository;

import de.portalcore.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {

    Page<AuditLog> findByTenantIdOrderByZeitstempelDesc(String tenantId, Pageable pageable);

    Page<AuditLog> findByUserIdOrderByZeitstempelDesc(String userId, Pageable pageable);

    Page<AuditLog> findAllByOrderByZeitstempelDesc(Pageable pageable);
}

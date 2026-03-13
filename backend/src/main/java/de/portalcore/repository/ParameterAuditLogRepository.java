package de.portalcore.repository;

import de.portalcore.entity.ParameterAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParameterAuditLogRepository extends JpaRepository<ParameterAuditLog, String> {

    List<ParameterAuditLog> findByParameterIdOrderByGeaendertAmDesc(String parameterId);

    List<ParameterAuditLog> findByAppIdOrderByGeaendertAmDesc(String appId);

    List<ParameterAuditLog> findAllByOrderByGeaendertAmDesc();
}

package de.portalcore.service;

import de.portalcore.entity.AuditLog;
import de.portalcore.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String userId, String tenantId, String aktion, String details,
                    String ipAdresse, String userAgent) {
        AuditLog entry = AuditLog.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .tenantId(tenantId)
                .aktion(aktion)
                .details(details)
                .ipAdresse(ipAdresse)
                .userAgent(userAgent)
                .build();
        auditLogRepository.save(entry);
    }

    public void log(String userId, String tenantId, String aktion, String details) {
        log(userId, tenantId, aktion, details, null, null);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> findByTenant(String tenantId, int page, int size) {
        return auditLogRepository.findByTenantIdOrderByZeitstempelDesc(tenantId, PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> findByUser(String userId, int page, int size) {
        return auditLogRepository.findByUserIdOrderByZeitstempelDesc(userId, PageRequest.of(page, size));
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> findAll(int page, int size) {
        return auditLogRepository.findAllByOrderByZeitstempelDesc(PageRequest.of(page, size));
    }
}

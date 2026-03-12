package de.portalcore.service;

import de.portalcore.entity.PortalMessage;
import de.portalcore.repository.PortalMessageRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class MessageService {

    private final PortalMessageRepository portalMessageRepository;

    public MessageService(PortalMessageRepository portalMessageRepository) {
        this.portalMessageRepository = portalMessageRepository;
    }

    public List<PortalMessage> findAll() {
        return portalMessageRepository.findAll();
    }

    public PortalMessage findById(String id) {
        return portalMessageRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PortalMessage not found with id: " + id));
    }

    @Transactional
    public PortalMessage create(PortalMessage message) {
        return portalMessageRepository.save(message);
    }

    @Transactional
    public PortalMessage update(String id, PortalMessage updatedMessage) {
        PortalMessage existing = findById(id);
        existing.setTitle(updatedMessage.getTitle());
        existing.setBody(updatedMessage.getBody());
        existing.setSeverity(updatedMessage.getSeverity());
        existing.setCategory(updatedMessage.getCategory());
        existing.setSender(updatedMessage.getSender());
        existing.setTimestamp(updatedMessage.getTimestamp());
        existing.setAppId(updatedMessage.getAppId());
        existing.setTenant(updatedMessage.getTenant());
        return portalMessageRepository.save(existing);
    }

    @Transactional
    public void delete(String id) {
        if (!portalMessageRepository.existsById(id)) {
            throw new EntityNotFoundException("PortalMessage not found with id: " + id);
        }
        portalMessageRepository.deleteById(id);
    }

    @Transactional
    public PortalMessage markAsRead(String id) {
        PortalMessage message = findById(id);
        message.setRead(true);
        return portalMessageRepository.save(message);
    }

    @Transactional
    public int markAllAsRead(String tenantId) {
        return portalMessageRepository.markAllAsReadByTenantId(tenantId);
    }

    public long getUnreadCount(String tenantId) {
        return portalMessageRepository.countByTenantIdAndReadFalse(tenantId);
    }

    public List<PortalMessage> findByTenant(String tenantId) {
        return portalMessageRepository.findByTenantIdOrderByTimestampDesc(tenantId);
    }

    public List<PortalMessage> findUnreadByTenant(String tenantId) {
        return portalMessageRepository.findByTenantIdAndReadFalseOrderByTimestampDesc(tenantId);
    }
}

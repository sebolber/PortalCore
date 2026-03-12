package de.adesso.health.portal.service;

import de.adesso.health.portal.entity.PortalParameter;
import de.adesso.health.portal.repository.PortalParameterRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ParameterService {

    private static final Logger log = LoggerFactory.getLogger(ParameterService.class);

    private final PortalParameterRepository portalParameterRepository;

    public ParameterService(PortalParameterRepository portalParameterRepository) {
        this.portalParameterRepository = portalParameterRepository;
    }

    public List<PortalParameter> findAll() {
        return portalParameterRepository.findAll();
    }

    public PortalParameter findById(String id) {
        return portalParameterRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PortalParameter not found with id: " + id));
    }

    @Transactional
    public PortalParameter create(PortalParameter parameter) {
        parameter.setCreatedAt(LocalDateTime.now());
        parameter.setLastModified(LocalDateTime.now());
        return portalParameterRepository.save(parameter);
    }

    @Transactional
    public PortalParameter update(String id, PortalParameter updatedParameter) {
        PortalParameter existing = findById(id);
        existing.setKey(updatedParameter.getKey());
        existing.setLabel(updatedParameter.getLabel());
        existing.setDescription(updatedParameter.getDescription());
        existing.setAppId(updatedParameter.getAppId());
        existing.setAppName(updatedParameter.getAppName());
        existing.setGroup(updatedParameter.getGroup());
        existing.setType(updatedParameter.getType());
        existing.setValue(updatedParameter.getValue());
        existing.setDefaultValue(updatedParameter.getDefaultValue());
        existing.setRequired(updatedParameter.isRequired());
        existing.setValidationRules(updatedParameter.getValidationRules());
        existing.setOptions(updatedParameter.getOptions());
        existing.setUnit(updatedParameter.getUnit());
        existing.setSensitive(updatedParameter.isSensitive());
        existing.setHotReload(updatedParameter.isHotReload());
        existing.setLastModified(LocalDateTime.now());
        existing.setLastModifiedBy(updatedParameter.getLastModifiedBy());
        return portalParameterRepository.save(existing);
    }

    @Transactional
    public void delete(String id) {
        if (!portalParameterRepository.existsById(id)) {
            throw new EntityNotFoundException("PortalParameter not found with id: " + id);
        }
        portalParameterRepository.deleteById(id);
    }

    @Transactional
    public PortalParameter updateValue(String id, String newValue, String modifiedBy) {
        PortalParameter parameter = findById(id);
        String oldValue = parameter.getValue();
        parameter.setValue(newValue);
        parameter.setLastModified(LocalDateTime.now());
        parameter.setLastModifiedBy(modifiedBy);
        log.info("Parameter '{}' (id={}) value changed from '{}' to '{}' by {}",
                parameter.getKey(), id, oldValue, newValue, modifiedBy);
        return portalParameterRepository.save(parameter);
    }

    public List<PortalParameter> getByApp(String appId) {
        return portalParameterRepository.findByAppId(appId);
    }

    public List<PortalParameter> getByGroup(String group) {
        return portalParameterRepository.findByGroup(group);
    }

    public List<PortalParameter> getByAppAndGroup(String appId, String group) {
        return portalParameterRepository.findByAppIdAndGroup(appId, group);
    }

    /**
     * Returns a simple audit log representation for a parameter.
     * The audit trail is derived from the parameter's last-modified metadata.
     * For a full audit log, integrate with a dedicated auditing framework (e.g., Hibernate Envers).
     */
    public String getAuditLog(String id) {
        PortalParameter parameter = findById(id);
        return String.format("Parameter: %s (id=%s), Last modified: %s by %s",
                parameter.getKey(), parameter.getId(),
                parameter.getLastModified(), parameter.getLastModifiedBy());
    }
}

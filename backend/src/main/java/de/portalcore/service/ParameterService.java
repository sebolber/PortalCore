package de.portalcore.service;

import de.portalcore.entity.ParameterAuditLog;
import de.portalcore.entity.PortalParameter;
import de.portalcore.enums.ParameterType;
import de.portalcore.repository.ParameterAuditLogRepository;
import de.portalcore.repository.PortalParameterRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ParameterService {

    private static final Logger log = LoggerFactory.getLogger(ParameterService.class);

    private final PortalParameterRepository portalParameterRepository;
    private final ParameterAuditLogRepository auditLogRepository;

    public ParameterService(PortalParameterRepository portalParameterRepository,
                            ParameterAuditLogRepository auditLogRepository) {
        this.portalParameterRepository = portalParameterRepository;
        this.auditLogRepository = auditLogRepository;
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
        if (parameter.getId() == null) {
            parameter.setId("par-" + UUID.randomUUID().toString().substring(0, 8));
        }
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
        existing.setGueltigVon(updatedParameter.getGueltigVon());
        existing.setGueltigBis(updatedParameter.getGueltigBis());
        existing.setTenantId(updatedParameter.getTenantId());
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
    public PortalParameter updateValue(String id, String newValue, String modifiedBy, String grund) {
        PortalParameter parameter = findById(id);

        // Validierung
        validateValue(parameter, newValue);

        String oldValue = parameter.getValue();
        parameter.setValue(newValue);
        parameter.setLastModified(LocalDateTime.now());
        parameter.setLastModifiedBy(modifiedBy);

        // Audit-Log schreiben
        ParameterAuditLog auditEntry = ParameterAuditLog.builder()
                .id("pal-" + UUID.randomUUID().toString().substring(0, 8))
                .parameterId(parameter.getId())
                .paramKey(parameter.getKey())
                .appId(parameter.getAppId())
                .appName(parameter.getAppName())
                .alterWert(parameter.isSensitive() ? "***" : oldValue)
                .neuerWert(parameter.isSensitive() ? "***" : newValue)
                .geaendertVon(modifiedBy)
                .geaendertAm(LocalDateTime.now())
                .grund(grund)
                .tenantId(parameter.getTenantId())
                .build();
        auditLogRepository.save(auditEntry);

        log.info("Parameter '{}' (id={}) geaendert von '{}' durch {}",
                parameter.getKey(), id,
                parameter.isSensitive() ? "***" : oldValue + " -> " + newValue,
                modifiedBy);

        return portalParameterRepository.save(parameter);
    }

    /**
     * Validiert den Wert anhand des Parameter-Typs.
     */
    private void validateValue(PortalParameter parameter, String newValue) {
        if (parameter.isRequired() && (newValue == null || newValue.isBlank())) {
            throw new IllegalArgumentException("Parameter '" + parameter.getKey() + "' ist ein Pflichtfeld.");
        }

        if (newValue == null || newValue.isBlank()) return;

        switch (parameter.getType()) {
            case NUMBER -> {
                try {
                    Double.parseDouble(newValue);
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException(
                            "Parameter '" + parameter.getKey() + "': Wert muss eine Zahl sein.");
                }
            }
            case BOOLEAN -> {
                if (!"true".equalsIgnoreCase(newValue) && !"false".equalsIgnoreCase(newValue)) {
                    throw new IllegalArgumentException(
                            "Parameter '" + parameter.getKey() + "': Wert muss 'true' oder 'false' sein.");
                }
            }
            case DATE -> {
                try {
                    java.time.LocalDate.parse(newValue);
                } catch (DateTimeParseException e) {
                    throw new IllegalArgumentException(
                            "Parameter '" + parameter.getKey() + "': Wert muss ein gueltiges Datum sein (YYYY-MM-DD).");
                }
            }
            case EMAIL -> {
                if (!newValue.matches("^[\\w.+-]+@[\\w.-]+\\.[a-zA-Z]{2,}$")) {
                    throw new IllegalArgumentException(
                            "Parameter '" + parameter.getKey() + "': Wert muss eine gueltige E-Mail-Adresse sein.");
                }
            }
            case URL -> {
                if (!newValue.matches("^https?://.*")) {
                    throw new IllegalArgumentException(
                            "Parameter '" + parameter.getKey() + "': Wert muss eine gueltige URL sein.");
                }
            }
            case SELECT -> {
                if (parameter.getOptions() != null && !parameter.getOptions().isBlank()) {
                    List<String> opts = Arrays.asList(parameter.getOptions().split(","));
                    if (!opts.contains(newValue)) {
                        throw new IllegalArgumentException(
                                "Parameter '" + parameter.getKey() + "': Wert muss einer der folgenden sein: " + parameter.getOptions());
                    }
                }
            }
            default -> {
                // STRING, PASSWORD, TEXTAREA: keine spezielle Validierung
            }
        }
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

    // ===== Mandantenspezifische Methoden =====

    /**
     * Listet Parameter fuer einen Mandanten (eigene + globale).
     * Super-Admins sehen alle Parameter.
     */
    public List<PortalParameter> listParameters(String appId, String tenantId, boolean isSuperAdmin) {
        if (isSuperAdmin) {
            // Super-Admin sieht alle Parameter
            if (appId != null && !appId.isBlank()) {
                return portalParameterRepository.findByAppId(appId);
            }
            return portalParameterRepository.findAll();
        }

        // Normaler Benutzer: nur eigener Mandant + globale Parameter
        if (appId != null && !appId.isBlank()) {
            return portalParameterRepository.findByTenantIdOrGlobalAndAppId(tenantId, appId);
        }
        return portalParameterRepository.findByTenantIdOrGlobal(tenantId);
    }


    /**
     * Prueft ob der Benutzer Zugriff auf den Parameter hat.
     * Super-Admins haben immer Zugriff.
     * Normale Benutzer nur auf globale Parameter oder Parameter ihres Mandanten.
     */
    public boolean hasAccess(PortalParameter parameter, String tenantId, boolean isSuperAdmin) {
        if (isSuperAdmin) return true;
        // Globaler Parameter (kein Mandant) oder Parameter des eigenen Mandanten
        return parameter.getTenantId() == null || parameter.getTenantId().equals(tenantId);
    }

    // Audit-Log abrufen
    public List<ParameterAuditLog> getFullAuditLog() {
        return auditLogRepository.findAllByOrderByGeaendertAmDesc();
    }

    public List<ParameterAuditLog> getAuditLogByApp(String appId) {
        return auditLogRepository.findByAppIdOrderByGeaendertAmDesc(appId);
    }

    public List<ParameterAuditLog> getAuditLogByParameter(String parameterId) {
        return auditLogRepository.findByParameterIdOrderByGeaendertAmDesc(parameterId);
    }

    // Mandantenspezifische Audit-Log Methoden
    public List<ParameterAuditLog> getAuditLog(String appId, String parameterId, String tenantId, boolean isSuperAdmin) {
        if (isSuperAdmin) {
            if (parameterId != null) return getAuditLogByParameter(parameterId);
            if (appId != null) return getAuditLogByApp(appId);
            return getFullAuditLog();
        }

        // Mandantenspezifisch
        if (parameterId != null) {
            return auditLogRepository.findByTenantIdOrGlobalAndParameterIdOrderByGeaendertAmDesc(tenantId, parameterId);
        }
        if (appId != null) {
            return auditLogRepository.findByTenantIdOrGlobalAndAppIdOrderByGeaendertAmDesc(tenantId, appId);
        }
        return auditLogRepository.findByTenantIdOrGlobalOrderByGeaendertAmDesc(tenantId);
    }
}

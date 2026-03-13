package de.portalcore.service;

import de.portalcore.entity.Tenant;
import de.portalcore.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class TenantService {

    private final TenantRepository tenantRepository;
    private final AuditService auditService;

    public TenantService(TenantRepository tenantRepository, AuditService auditService) {
        this.tenantRepository = tenantRepository;
        this.auditService = auditService;
    }

    public List<Tenant> findAll() {
        return tenantRepository.findAll();
    }

    public Tenant findById(String id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Mandant nicht gefunden: " + id));
    }

    @Transactional
    public Tenant create(Tenant tenant, String userId) {
        tenant.setCreatedAt(LocalDateTime.now());
        Tenant saved = tenantRepository.save(tenant);
        auditService.log(userId, tenant.getId(), "MANDANT_ERSTELLT",
                "Mandant erstellt: " + tenant.getName());
        return saved;
    }

    @Transactional
    public Tenant update(String id, Tenant updatedTenant, String userId) {
        Tenant existing = findById(id);
        existing.setName(updatedTenant.getName());
        existing.setShortName(updatedTenant.getShortName());
        existing.setStrasse(updatedTenant.getStrasse());
        existing.setHausnummer(updatedTenant.getHausnummer());
        existing.setPlz(updatedTenant.getPlz());
        existing.setOrt(updatedTenant.getOrt());
        existing.setLand(updatedTenant.getLand());
        existing.setTelefon(updatedTenant.getTelefon());
        existing.setEmail(updatedTenant.getEmail());
        existing.setWebseite(updatedTenant.getWebseite());
        existing.setAnsprechpartner(updatedTenant.getAnsprechpartner());
        existing.setAktiv(updatedTenant.isAktiv());
        Tenant saved = tenantRepository.save(existing);
        auditService.log(userId, id, "MANDANT_AKTUALISIERT",
                "Mandant aktualisiert: " + existing.getName());
        return saved;
    }

    @Transactional
    public void delete(String id, String userId) {
        Tenant tenant = findById(id);
        auditService.log(userId, id, "MANDANT_GELOESCHT",
                "Mandant geloescht: " + tenant.getName());
        tenantRepository.deleteById(id);
    }

    public Tenant findByShortName(String shortName) {
        return tenantRepository.findByShortName(shortName)
                .orElseThrow(() -> new EntityNotFoundException("Mandant nicht gefunden: " + shortName));
    }

    public List<Tenant> listTenants() {
        return findAll();
    }

    public Tenant getTenantById(String id) {
        return findById(id);
    }

    @Transactional
    public Tenant create(Tenant tenant) {
        return create(tenant, "system");
    }

    @Transactional
    public Tenant update(String id, Tenant updatedTenant) {
        return update(id, updatedTenant, "system");
    }

    @Transactional
    public void delete(String id) {
        delete(id, "system");
    }
}

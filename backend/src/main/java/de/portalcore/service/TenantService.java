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

    public TenantService(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    public List<Tenant> findAll() {
        return tenantRepository.findAll();
    }

    public Tenant findById(String id) {
        return tenantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with id: " + id));
    }

    @Transactional
    public Tenant create(Tenant tenant) {
        tenant.setCreatedAt(LocalDateTime.now());
        return tenantRepository.save(tenant);
    }

    @Transactional
    public Tenant update(String id, Tenant updatedTenant) {
        Tenant existing = findById(id);
        existing.setName(updatedTenant.getName());
        existing.setShortName(updatedTenant.getShortName());
        return tenantRepository.save(existing);
    }

    @Transactional
    public void delete(String id) {
        if (!tenantRepository.existsById(id)) {
            throw new EntityNotFoundException("Tenant not found with id: " + id);
        }
        tenantRepository.deleteById(id);
    }

    public Tenant findByShortName(String shortName) {
        return tenantRepository.findByShortName(shortName)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found with shortName: " + shortName));
    }

    public List<Tenant> listTenants() {
        return findAll();
    }

    public Tenant getTenantById(String id) {
        return findById(id);
    }
}

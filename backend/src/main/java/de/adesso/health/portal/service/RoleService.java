package de.adesso.health.portal.service;

import de.adesso.health.portal.entity.Berechtigung;
import de.adesso.health.portal.entity.PortalRolle;
import de.adesso.health.portal.repository.PortalRolleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class RoleService {

    private final PortalRolleRepository portalRolleRepository;

    public RoleService(PortalRolleRepository portalRolleRepository) {
        this.portalRolleRepository = portalRolleRepository;
    }

    public List<PortalRolle> findAll() {
        return portalRolleRepository.findAll();
    }

    public PortalRolle findById(String id) {
        return portalRolleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PortalRolle not found with id: " + id));
    }

    @Transactional
    public PortalRolle create(PortalRolle rolle) {
        return portalRolleRepository.save(rolle);
    }

    @Transactional
    public PortalRolle update(String id, PortalRolle updatedRolle) {
        PortalRolle existing = findById(id);
        existing.setName(updatedRolle.getName());
        existing.setBeschreibung(updatedRolle.getBeschreibung());
        existing.setHierarchie(updatedRolle.getHierarchie());
        existing.setBerechtigungen(updatedRolle.getBerechtigungen());
        existing.setScope(updatedRolle.getScope());
        existing.setBenutzerAnzahl(updatedRolle.getBenutzerAnzahl());
        existing.setSystemRolle(updatedRolle.isSystemRolle());
        existing.setFarbe(updatedRolle.getFarbe());
        return portalRolleRepository.save(existing);
    }

    @Transactional
    public void delete(String id) {
        if (!portalRolleRepository.existsById(id)) {
            throw new EntityNotFoundException("PortalRolle not found with id: " + id);
        }
        portalRolleRepository.deleteById(id);
    }

    public Set<Berechtigung> getPermissions(String roleId) {
        PortalRolle rolle = findById(roleId);
        return rolle.getBerechtigungen();
    }

    public List<PortalRolle> findSystemRollen() {
        return portalRolleRepository.findBySystemRolleTrue();
    }

    public List<PortalRolle> findByScope(String scope) {
        return portalRolleRepository.findByScope(scope);
    }
}

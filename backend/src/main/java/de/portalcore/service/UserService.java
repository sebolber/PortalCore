package de.portalcore.service;

import de.portalcore.entity.PortalUser;
import de.portalcore.enums.UserStatus;
import de.portalcore.repository.PortalUserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final PortalUserRepository portalUserRepository;

    public UserService(PortalUserRepository portalUserRepository) {
        this.portalUserRepository = portalUserRepository;
    }

    public List<PortalUser> findAll() {
        return portalUserRepository.findAll();
    }

    public PortalUser findById(String id) {
        return portalUserRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PortalUser not found with id: " + id));
    }

    @Transactional
    public PortalUser create(PortalUser user) {
        return portalUserRepository.save(user);
    }

    @Transactional
    public PortalUser update(String id, PortalUser updatedUser) {
        PortalUser existing = findById(id);
        existing.setVorname(updatedUser.getVorname());
        existing.setNachname(updatedUser.getNachname());
        existing.setEmail(updatedUser.getEmail());
        existing.setIamId(updatedUser.getIamId());
        existing.setTenant(updatedUser.getTenant());
        existing.setStatus(updatedUser.getStatus());
        existing.setRollen(updatedUser.getRollen());
        existing.setLetzterLogin(updatedUser.getLetzterLogin());
        existing.setIamSync(updatedUser.isIamSync());
        existing.setInitialen(updatedUser.getInitialen());
        return portalUserRepository.save(existing);
    }

    @Transactional
    public void delete(String id) {
        if (!portalUserRepository.existsById(id)) {
            throw new EntityNotFoundException("PortalUser not found with id: " + id);
        }
        portalUserRepository.deleteById(id);
    }

    public List<PortalUser> findByTenant(String tenantId) {
        return portalUserRepository.findByTenantId(tenantId);
    }

    public List<PortalUser> findByStatus(UserStatus status) {
        return portalUserRepository.findByStatus(status);
    }

    public PortalUser findByEmail(String email) {
        return portalUserRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("PortalUser not found with email: " + email));
    }

    public List<PortalUser> listUsers(String tenantId, UserStatus status, String search) {
        List<PortalUser> users;
        if (tenantId != null && !tenantId.isBlank()) {
            users = findByTenant(tenantId);
        } else {
            users = findAll();
        }
        return users.stream()
                .filter(u -> status == null || u.getStatus() == status)
                .filter(u -> search == null || search.isBlank()
                        || (u.getVorname() != null && u.getVorname().toLowerCase().contains(search.toLowerCase()))
                        || (u.getNachname() != null && u.getNachname().toLowerCase().contains(search.toLowerCase()))
                        || (u.getEmail() != null && u.getEmail().toLowerCase().contains(search.toLowerCase())))
                .collect(Collectors.toList());
    }

    public PortalUser getUserById(String id) {
        return findById(id);
    }

    @Transactional
    public PortalUser createUser(PortalUser user) {
        return create(user);
    }

    @Transactional
    public PortalUser updateUser(String id, PortalUser user) {
        return update(id, user);
    }

    @Transactional
    public void deleteUser(String id) {
        delete(id);
    }
}

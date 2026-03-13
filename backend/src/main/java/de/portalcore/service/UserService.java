package de.portalcore.service;

import de.portalcore.entity.PortalUser;
import de.portalcore.entity.UserAdresse;
import de.portalcore.enums.UserStatus;
import de.portalcore.repository.PortalUserRepository;
import de.portalcore.repository.UserAdresseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final PortalUserRepository portalUserRepository;
    private final UserAdresseRepository adresseRepository;
    private final AuditService auditService;

    public UserService(PortalUserRepository portalUserRepository,
                       UserAdresseRepository adresseRepository,
                       AuditService auditService) {
        this.portalUserRepository = portalUserRepository;
        this.adresseRepository = adresseRepository;
        this.auditService = auditService;
    }

    public List<PortalUser> findAll() {
        return portalUserRepository.findAll();
    }

    public PortalUser findById(String id) {
        return portalUserRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Benutzer nicht gefunden: " + id));
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
        // Erweiterte Personendaten
        existing.setAnrede(updatedUser.getAnrede());
        existing.setTitel(updatedUser.getTitel());
        existing.setTelefon(updatedUser.getTelefon());
        existing.setMobil(updatedUser.getMobil());
        existing.setAbteilung(updatedUser.getAbteilung());
        existing.setPositionTitel(updatedUser.getPositionTitel());
        existing.setGeburtsdatum(updatedUser.getGeburtsdatum());
        return portalUserRepository.save(existing);
    }

    @Transactional
    public void delete(String id) {
        if (!portalUserRepository.existsById(id)) {
            throw new EntityNotFoundException("Benutzer nicht gefunden: " + id);
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
                .orElseThrow(() -> new EntityNotFoundException("Benutzer nicht gefunden: " + email));
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

    // ---- Adressen ----

    public List<UserAdresse> getAdressen(String userId) {
        return adresseRepository.findByUserId(userId);
    }

    @Transactional
    public UserAdresse addAdresse(String userId, UserAdresse adresse) {
        PortalUser user = findById(userId);
        adresse.setUser(user);
        if (adresse.getId() == null) {
            adresse.setId("adr-" + UUID.randomUUID().toString().substring(0, 8));
        }

        // Wenn neue Hauptadresse, alte zuruecksetzen
        if (adresse.isIstHauptadresse()) {
            adresseRepository.findByUserIdAndIstHauptadresseTrue(userId)
                    .ifPresent(existing -> {
                        existing.setIstHauptadresse(false);
                        adresseRepository.save(existing);
                    });
        }

        return adresseRepository.save(adresse);
    }

    @Transactional
    public UserAdresse updateAdresse(String adresseId, UserAdresse updated) {
        UserAdresse existing = adresseRepository.findById(adresseId)
                .orElseThrow(() -> new EntityNotFoundException("Adresse nicht gefunden: " + adresseId));

        // Wenn als Hauptadresse gesetzt, alte zuruecksetzen
        if (updated.isIstHauptadresse() && !existing.isIstHauptadresse()) {
            adresseRepository.findByUserIdAndIstHauptadresseTrue(existing.getUser().getId())
                    .ifPresent(old -> {
                        old.setIstHauptadresse(false);
                        adresseRepository.save(old);
                    });
        }

        existing.setTyp(updated.getTyp());
        existing.setBezeichnung(updated.getBezeichnung());
        existing.setStrasse(updated.getStrasse());
        existing.setHausnummer(updated.getHausnummer());
        existing.setPlz(updated.getPlz());
        existing.setOrt(updated.getOrt());
        existing.setLand(updated.getLand());
        existing.setZusatz(updated.getZusatz());
        existing.setIstHauptadresse(updated.isIstHauptadresse());
        return adresseRepository.save(existing);
    }

    @Transactional
    public void deleteAdresse(String adresseId) {
        adresseRepository.deleteById(adresseId);
    }
}

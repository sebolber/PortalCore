package de.portalcore.service;

import de.portalcore.entity.PortalUser;
import de.portalcore.entity.UserAdresse;
import de.portalcore.repository.UserAdresseRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UserAdresseService {

    private final UserAdresseRepository adresseRepository;
    private final UserService userService;

    public UserAdresseService(UserAdresseRepository adresseRepository,
                               UserService userService) {
        this.adresseRepository = adresseRepository;
        this.userService = userService;
    }

    public List<UserAdresse> findByUserId(String userId) {
        return adresseRepository.findByUserId(userId);
    }

    @Transactional
    public UserAdresse create(String userId, UserAdresse adresse) {
        PortalUser user = userService.findById(userId);
        adresse.setUser(user);
        if (adresse.getId() == null) {
            adresse.setId("adr-" + UUID.randomUUID().toString().substring(0, 8));
        }

        if (adresse.isIstHauptadresse()) {
            resetHauptadresse(userId);
        }

        return adresseRepository.save(adresse);
    }

    @Transactional
    public UserAdresse update(String adresseId, UserAdresse updated) {
        UserAdresse existing = adresseRepository.findById(adresseId)
                .orElseThrow(() -> new EntityNotFoundException("Adresse nicht gefunden: " + adresseId));

        if (updated.isIstHauptadresse() && !existing.isIstHauptadresse()) {
            resetHauptadresse(existing.getUser().getId());
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
    public void delete(String adresseId) {
        adresseRepository.deleteById(adresseId);
    }

    private void resetHauptadresse(String userId) {
        adresseRepository.findByUserIdAndIstHauptadresseTrue(userId)
                .ifPresent(existing -> {
                    existing.setIstHauptadresse(false);
                    adresseRepository.save(existing);
                });
    }
}

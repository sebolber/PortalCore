package de.portalcore.service;

import de.portalcore.entity.AufgabenGruppe;
import de.portalcore.entity.AufgabenZuweisung;
import de.portalcore.enums.KriteriumTyp;
import de.portalcore.repository.AufgabenGruppeRepository;
import de.portalcore.repository.AufgabenZuweisungRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AufgabenService {

    private final AufgabenZuweisungRepository aufgabenZuweisungRepository;
    private final AufgabenGruppeRepository aufgabenGruppeRepository;

    public AufgabenService(AufgabenZuweisungRepository aufgabenZuweisungRepository,
                           AufgabenGruppeRepository aufgabenGruppeRepository) {
        this.aufgabenZuweisungRepository = aufgabenZuweisungRepository;
        this.aufgabenGruppeRepository = aufgabenGruppeRepository;
    }

    // --- AufgabenZuweisung CRUD ---

    public List<AufgabenZuweisung> findAllZuweisungen() {
        return aufgabenZuweisungRepository.findAll();
    }

    public AufgabenZuweisung findZuweisungById(String id) {
        return aufgabenZuweisungRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("AufgabenZuweisung not found with id: " + id));
    }

    @Transactional
    public AufgabenZuweisung createZuweisung(AufgabenZuweisung zuweisung) {
        return aufgabenZuweisungRepository.save(zuweisung);
    }

    @Transactional
    public AufgabenZuweisung updateZuweisung(String id, AufgabenZuweisung updated) {
        AufgabenZuweisung existing = findZuweisungById(id);
        existing.setBezeichnung(updated.getBezeichnung());
        existing.setKriterium(updated.getKriterium());
        existing.setKriteriumWert(updated.getKriteriumWert());
        existing.setZuweisungTyp(updated.getZuweisungTyp());
        existing.setMitarbeiterId(updated.getMitarbeiterId());
        existing.setGruppeId(updated.getGruppeId());
        existing.setProduktId(updated.getProduktId());
        existing.setGueltigVon(updated.getGueltigVon());
        existing.setGueltigBis(updated.getGueltigBis());
        existing.setPrioritaet(updated.getPrioritaet());
        existing.setBeschreibung(updated.getBeschreibung());
        return aufgabenZuweisungRepository.save(existing);
    }

    @Transactional
    public void deleteZuweisung(String id) {
        if (!aufgabenZuweisungRepository.existsById(id)) {
            throw new EntityNotFoundException("AufgabenZuweisung not found with id: " + id);
        }
        aufgabenZuweisungRepository.deleteById(id);
    }

    public List<AufgabenZuweisung> findByKriterium(KriteriumTyp kriterium) {
        return aufgabenZuweisungRepository.findByKriterium(kriterium);
    }

    // --- AufgabenGruppe CRUD ---

    public List<AufgabenGruppe> findAllGruppen() {
        return aufgabenGruppeRepository.findAll();
    }

    public AufgabenGruppe findGruppeById(String id) {
        return aufgabenGruppeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("AufgabenGruppe not found with id: " + id));
    }

    @Transactional
    public AufgabenGruppe createGruppe(AufgabenGruppe gruppe) {
        return aufgabenGruppeRepository.save(gruppe);
    }

    @Transactional
    public AufgabenGruppe updateGruppe(String id, AufgabenGruppe updated) {
        AufgabenGruppe existing = findGruppeById(id);
        existing.setName(updated.getName());
        existing.setBeschreibung(updated.getBeschreibung());
        existing.setMitgliederIds(updated.getMitgliederIds());
        return aufgabenGruppeRepository.save(existing);
    }

    @Transactional
    public void deleteGruppe(String id) {
        if (!aufgabenGruppeRepository.existsById(id)) {
            throw new EntityNotFoundException("AufgabenGruppe not found with id: " + id);
        }
        aufgabenGruppeRepository.deleteById(id);
    }
}

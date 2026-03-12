package de.portalcore.repository;

import de.portalcore.entity.AufgabenZuweisung;
import de.portalcore.enums.KriteriumTyp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AufgabenZuweisungRepository extends JpaRepository<AufgabenZuweisung, String> {

    List<AufgabenZuweisung> findByKriterium(KriteriumTyp kriterium);

    List<AufgabenZuweisung> findByMitarbeiterId(String mitarbeiterId);

    List<AufgabenZuweisung> findByGruppeId(String gruppeId);

    List<AufgabenZuweisung> findByProduktId(String produktId);
}

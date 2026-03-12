package de.portalcore.repository;

import de.portalcore.entity.AufgabenGruppe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AufgabenGruppeRepository extends JpaRepository<AufgabenGruppe, String> {

    Optional<AufgabenGruppe> findByName(String name);
}

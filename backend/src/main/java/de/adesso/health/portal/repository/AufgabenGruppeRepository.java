package de.adesso.health.portal.repository;

import de.adesso.health.portal.entity.AufgabenGruppe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AufgabenGruppeRepository extends JpaRepository<AufgabenGruppe, String> {

    Optional<AufgabenGruppe> findByName(String name);
}

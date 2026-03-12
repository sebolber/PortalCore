package de.adesso.health.portal.repository;

import de.adesso.health.portal.entity.Berechtigung;
import de.adesso.health.portal.enums.BerechtigungTyp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BerechtigungRepository extends JpaRepository<Berechtigung, String> {

    List<Berechtigung> findByTyp(BerechtigungTyp typ);

    List<Berechtigung> findByAppId(String appId);

    List<Berechtigung> findByGruppe(String gruppe);
}

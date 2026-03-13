package de.portalcore.repository;

import de.portalcore.entity.PortalSeite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortalSeiteRepository extends JpaRepository<PortalSeite, String> {

    List<PortalSeite> findByAktivTrueOrderByKategorieAscTitelAsc();

    List<PortalSeite> findByKategorieAndAktivTrue(String kategorie);
}

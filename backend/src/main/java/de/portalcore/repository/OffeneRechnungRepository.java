package de.portalcore.repository;

import de.portalcore.entity.OffeneRechnung;
import de.portalcore.enums.RechnungStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OffeneRechnungRepository extends JpaRepository<OffeneRechnung, String> {

    List<OffeneRechnung> findByStatus(RechnungStatus status);

    List<OffeneRechnung> findByKrankenhaus(String krankenhaus);
}

package de.adesso.health.portal.repository;

import de.adesso.health.portal.entity.OffeneRechnung;
import de.adesso.health.portal.enums.RechnungStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OffeneRechnungRepository extends JpaRepository<OffeneRechnung, String> {

    List<OffeneRechnung> findByStatus(RechnungStatus status);

    List<OffeneRechnung> findByKrankenhaus(String krankenhaus);
}

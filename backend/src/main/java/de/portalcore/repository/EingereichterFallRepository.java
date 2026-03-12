package de.portalcore.repository;

import de.portalcore.entity.EingereichterFall;
import de.portalcore.enums.AmpelStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EingereichterFallRepository extends JpaRepository<EingereichterFall, String> {

    List<EingereichterFall> findByAmpel(AmpelStatus ampel);

    long countByAmpel(AmpelStatus ampel);

    List<EingereichterFall> findByKrankenhaus(String krankenhaus);
}

package de.portalcore.service;

import de.portalcore.entity.EingereichterFall;
import de.portalcore.entity.OffeneRechnung;
import de.portalcore.enums.AmpelStatus;
import de.portalcore.repository.EingereichterFallRepository;
import de.portalcore.repository.OffeneRechnungRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class SmileKhService {

    private final EingereichterFallRepository eingereichterFallRepository;
    private final OffeneRechnungRepository offeneRechnungRepository;

    public SmileKhService(EingereichterFallRepository eingereichterFallRepository,
                          OffeneRechnungRepository offeneRechnungRepository) {
        this.eingereichterFallRepository = eingereichterFallRepository;
        this.offeneRechnungRepository = offeneRechnungRepository;
    }

    public List<EingereichterFall> getEingereichteFaelle() {
        return eingereichterFallRepository.findAll();
    }

    public List<EingereichterFall> getEingereichteFaelleByAmpel(AmpelStatus ampel) {
        return eingereichterFallRepository.findByAmpel(ampel);
    }

    public Map<AmpelStatus, Long> getAmpelStats() {
        Map<AmpelStatus, Long> stats = new EnumMap<>(AmpelStatus.class);
        for (AmpelStatus status : AmpelStatus.values()) {
            stats.put(status, eingereichterFallRepository.countByAmpel(status));
        }
        return stats;
    }

    public List<OffeneRechnung> getOffeneRechnungen() {
        return offeneRechnungRepository.findAll();
    }

    public List<OffeneRechnung> getOffeneRechnungenByKrankenhaus(String krankenhaus) {
        return offeneRechnungRepository.findByKrankenhaus(krankenhaus);
    }
}

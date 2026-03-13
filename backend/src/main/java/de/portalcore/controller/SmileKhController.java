package de.portalcore.controller;

import de.portalcore.entity.EingereichterFall;
import de.portalcore.entity.OffeneRechnung;
import de.portalcore.enums.AmpelStatus;
import de.portalcore.service.SmileKhService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/smile-kh")
public class SmileKhController {

    private final SmileKhService smileKhService;

    public SmileKhController(SmileKhService smileKhService) {
        this.smileKhService = smileKhService;
    }

    @GetMapping("/faelle")
    public ResponseEntity<List<EingereichterFall>> listFaelle() {
        List<EingereichterFall> faelle = smileKhService.listFaelle();
        return ResponseEntity.ok(faelle);
    }

    @GetMapping("/faelle/stats")
    public ResponseEntity<Map<AmpelStatus, Long>> getFaelleStats() {
        Map<AmpelStatus, Long> stats = smileKhService.getFaelleStatsByAmpel();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/rechnungen")
    public ResponseEntity<List<OffeneRechnung>> listRechnungen() {
        List<OffeneRechnung> rechnungen = smileKhService.listRechnungen();
        return ResponseEntity.ok(rechnungen);
    }
}

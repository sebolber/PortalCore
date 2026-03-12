package de.adesso.health.portal.controller;

import de.adesso.health.portal.entity.EingereichterFall;
import de.adesso.health.portal.entity.OffeneRechnung;
import de.adesso.health.portal.enums.AmpelStatus;
import de.adesso.health.portal.service.SmileKhService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/smile-kh")
@CrossOrigin(origins = "*")
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

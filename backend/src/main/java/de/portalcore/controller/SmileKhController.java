package de.portalcore.controller;

import de.portalcore.config.SecurityHelper;
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
    private final SecurityHelper securityHelper;

    public SmileKhController(SmileKhService smileKhService, SecurityHelper securityHelper) {
        this.smileKhService = smileKhService;
        this.securityHelper = securityHelper;
    }

    @GetMapping("/faelle")
    public ResponseEntity<List<EingereichterFall>> listFaelle() {
        securityHelper.requireBerechtigung("smile-kh", "lesen");
        return ResponseEntity.ok(smileKhService.getEingereichteFaelle());
    }

    @GetMapping("/faelle/stats")
    public ResponseEntity<Map<AmpelStatus, Long>> getFaelleStats() {
        securityHelper.requireBerechtigung("smile-kh", "lesen");
        return ResponseEntity.ok(smileKhService.getAmpelStats());
    }

    @GetMapping("/rechnungen")
    public ResponseEntity<List<OffeneRechnung>> listRechnungen() {
        securityHelper.requireBerechtigung("smile-kh", "lesen");
        return ResponseEntity.ok(smileKhService.getOffeneRechnungen());
    }
}

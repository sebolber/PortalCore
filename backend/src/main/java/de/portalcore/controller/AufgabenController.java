package de.portalcore.controller;

import de.portalcore.entity.AufgabenGruppe;
import de.portalcore.entity.AufgabenZuweisung;
import de.portalcore.service.AufgabenService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/aufgaben")
@CrossOrigin(origins = "*")
public class AufgabenController {

    private final AufgabenService aufgabenService;

    public AufgabenController(AufgabenService aufgabenService) {
        this.aufgabenService = aufgabenService;
    }

    @GetMapping("/zuweisungen")
    public ResponseEntity<List<AufgabenZuweisung>> listZuweisungen(
            @RequestParam(required = false) String mitarbeiterId,
            @RequestParam(required = false) String gruppeId,
            @RequestParam(required = false) String produktId) {
        List<AufgabenZuweisung> zuweisungen = aufgabenService.listZuweisungen(mitarbeiterId, gruppeId, produktId);
        return ResponseEntity.ok(zuweisungen);
    }

    @PostMapping("/zuweisungen")
    public ResponseEntity<AufgabenZuweisung> createZuweisung(@RequestBody AufgabenZuweisung zuweisung) {
        AufgabenZuweisung created = aufgabenService.createZuweisung(zuweisung);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/zuweisungen/{id}")
    public ResponseEntity<AufgabenZuweisung> updateZuweisung(
            @PathVariable String id,
            @RequestBody AufgabenZuweisung zuweisung) {
        AufgabenZuweisung updated = aufgabenService.updateZuweisung(id, zuweisung);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/zuweisungen/{id}")
    public ResponseEntity<Void> deleteZuweisung(@PathVariable String id) {
        aufgabenService.deleteZuweisung(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/gruppen")
    public ResponseEntity<List<AufgabenGruppe>> listGruppen() {
        List<AufgabenGruppe> gruppen = aufgabenService.listGruppen();
        return ResponseEntity.ok(gruppen);
    }
}

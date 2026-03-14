package de.portalcore.controller;

import de.portalcore.dto.SetupMandantRequest;
import de.portalcore.dto.SetupStatusResponse;
import de.portalcore.dto.SetupSuperuserRequest;
import de.portalcore.dto.SmtpKonfigurationRequest;
import de.portalcore.entity.Tenant;
import de.portalcore.service.SetupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/setup")
public class SetupController {

    private final SetupService setupService;

    public SetupController(SetupService setupService) {
        this.setupService = setupService;
    }

    @GetMapping("/status")
    public ResponseEntity<SetupStatusResponse> getStatus() {
        return ResponseEntity.ok(setupService.getSetupStatus());
    }

    @PostMapping("/smtp")
    public ResponseEntity<Map<String, String>> speichereSmtp(
            @Valid @RequestBody SmtpKonfigurationRequest request) {
        rejectWhenInitialized();
        setupService.speichereSmtpKonfiguration(request);
        return ResponseEntity.ok(Map.of("message", "SMTP-Konfiguration gespeichert"));
    }

    @PostMapping("/smtp/test")
    public ResponseEntity<Map<String, String>> testeSmtp(
            @Valid @RequestBody SmtpKonfigurationRequest request) {
        rejectWhenInitialized();
        setupService.testeSmtpVerbindung(request);
        return ResponseEntity.ok(Map.of("message", "SMTP-Verbindungstest erfolgreich"));
    }

    @PostMapping("/mandant")
    public ResponseEntity<Tenant> erstelleMandant(
            @Valid @RequestBody SetupMandantRequest request) {
        rejectWhenInitialized();
        Tenant tenant = setupService.erstelleDefaultMandant(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(tenant);
    }

    @PostMapping("/superuser")
    public ResponseEntity<Map<String, String>> erstelleSuperuser(
            @Valid @RequestBody SetupSuperuserRequest request) {
        rejectWhenInitialized();
        setupService.erstelleSuperuser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Superuser angelegt und System initialisiert"));
    }

    private void rejectWhenInitialized() {
        if (setupService.istInitialisiert()) {
            throw new IllegalStateException("System ist bereits initialisiert.");
        }
    }
}

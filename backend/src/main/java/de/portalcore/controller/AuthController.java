package de.portalcore.controller;

import de.portalcore.config.JwtAuthenticationFilter;
import de.portalcore.entity.PortalUser;
import de.portalcore.repository.GruppenBerechtigungRepository;
import de.portalcore.repository.PortalUserRepository;
import de.portalcore.repository.UserTenantRepository;
import de.portalcore.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final PortalUserRepository userRepository;
    private final UserTenantRepository userTenantRepository;
    private final GruppenBerechtigungRepository berechtigungRepository;

    public AuthController(AuthService authService,
                          PortalUserRepository userRepository,
                          UserTenantRepository userTenantRepository,
                          GruppenBerechtigungRepository berechtigungRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.userTenantRepository = userTenantRepository;
        this.berechtigungRepository = berechtigungRepository;
    }

    /**
     * Schritt 1: E-Mail eingeben, OTP anfordern
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body,
                                                      HttpServletRequest request) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "E-Mail-Adresse erforderlich."));
        }

        String ip = request.getRemoteAddr();
        Map<String, Object> result = authService.requestOtp(email.trim().toLowerCase(), ip);
        return ResponseEntity.ok(result);
    }

    /**
     * Schritt 2: OTP verifizieren, JWT erhalten
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody Map<String, String> body,
                                    HttpServletRequest request) {
        String email = body.get("email");
        String code = body.get("code");
        String tenantId = body.get("tenantId");

        if (email == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "E-Mail und Code erforderlich."));
        }

        try {
            String ip = request.getRemoteAddr();
            String ua = request.getHeader("User-Agent");
            Map<String, Object> result = authService.verifyOtp(
                    email.trim().toLowerCase(), code.trim(), tenantId, ip, ua);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Abmelden
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        var details = getAuthDetails();
        if (details != null) {
            authService.logout(details.sessionId(), details.userId(), details.tenantId());
        }
        return ResponseEntity.ok(Map.of("message", "Erfolgreich abgemeldet."));
    }

    /**
     * Aktuellen Benutzer abfragen
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        var details = getAuthDetails();
        if (details == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Nicht authentifiziert."));
        }

        Optional<PortalUser> userOpt = userRepository.findById(details.userId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Benutzer nicht gefunden."));
        }

        PortalUser user = userOpt.get();

        var berechtigungen = berechtigungRepository.findByUserId(user.getId())
                .stream()
                .map(gb -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("useCase", gb.getUseCase());
                    m.put("label", gb.getUseCaseLabel());
                    m.put("anzeigen", gb.isAnzeigen());
                    m.put("lesen", gb.isLesen());
                    m.put("schreiben", gb.isSchreiben());
                    m.put("loeschen", gb.isLoeschen());
                    return m;
                })
                .collect(Collectors.toList());

        var tenants = userTenantRepository.findByUserId(user.getId())
                .stream()
                .filter(ut -> ut.isAktiv())
                .map(ut -> Map.of(
                        "id", ut.getTenantId(),
                        "name", ut.getTenant() != null ? ut.getTenant().getName() : ut.getTenantId(),
                        "istStandard", String.valueOf(ut.isIstStandard())
                ))
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", user.getId());
        result.put("vorname", user.getVorname());
        result.put("nachname", user.getNachname());
        result.put("email", user.getEmail());
        result.put("initialen", user.getInitialen());
        result.put("anrede", user.getAnrede());
        result.put("titel", user.getTitel());
        result.put("telefon", user.getTelefon());
        result.put("mobil", user.getMobil());
        result.put("abteilung", user.getAbteilung());
        result.put("positionTitel", user.getPositionTitel());
        result.put("status", user.getStatus().name());
        result.put("superAdmin", user.isSuperAdmin());
        result.put("tenantId", details.tenantId());
        result.put("tenants", tenants);
        result.put("berechtigungen", berechtigungen);
        return ResponseEntity.ok(result);
    }

    /**
     * Mandant wechseln
     */
    @PostMapping("/switch-tenant")
    public ResponseEntity<?> switchTenant(@RequestBody Map<String, String> body,
                                          HttpServletRequest request) {
        var details = getAuthDetails();
        if (details == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Nicht authentifiziert."));
        }

        String newTenantId = body.get("tenantId");
        if (newTenantId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "tenantId erforderlich."));
        }

        try {
            String ip = request.getRemoteAddr();
            String ua = request.getHeader("User-Agent");
            Map<String, Object> result = authService.switchTenant(details.userId(), newTenantId, ip, ua);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    private JwtAuthenticationFilter.AuthDetails getAuthDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof JwtAuthenticationFilter.AuthDetails details) {
            return details;
        }
        return null;
    }
}

package de.portalcore.controller;

import de.portalcore.config.JwtAuthenticationFilter;
import de.portalcore.entity.PortalUser;
import de.portalcore.repository.PortalUserRepository;
import de.portalcore.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final PortalUserRepository userRepository;

    public AuthController(AuthService authService,
                          PortalUserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
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
        result.put("tenants", authService.buildTenantList(user.getId()));
        result.put("berechtigungen", authService.buildBerechtigungList(user.getId()));
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

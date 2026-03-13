package de.portalcore.service;

import de.portalcore.entity.*;
import de.portalcore.enums.UserStatus;
import de.portalcore.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthService {

    private final PortalUserRepository userRepository;
    private final UserTenantRepository userTenantRepository;
    private final GruppenBerechtigungRepository berechtigungRepository;
    private final AuthSessionRepository sessionRepository;
    private final OtpService otpService;
    private final JwtService jwtService;
    private final AuditService auditService;

    public AuthService(PortalUserRepository userRepository,
                       UserTenantRepository userTenantRepository,
                       GruppenBerechtigungRepository berechtigungRepository,
                       AuthSessionRepository sessionRepository,
                       OtpService otpService,
                       JwtService jwtService,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.userTenantRepository = userTenantRepository;
        this.berechtigungRepository = berechtigungRepository;
        this.sessionRepository = sessionRepository;
        this.otpService = otpService;
        this.jwtService = jwtService;
        this.auditService = auditService;
    }

    /**
     * Schritt 1: Benutzer gibt Email ein, OTP wird gesendet
     */
    public Map<String, Object> requestOtp(String email, String ipAdresse) {
        Optional<PortalUser> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // Keine Info preisgeben ob Email existiert (Security)
            return Map.of("message", "Falls ein Konto mit dieser E-Mail existiert, wurde ein Code gesendet.");
        }

        PortalUser user = userOpt.get();
        if (user.getStatus() == UserStatus.GESPERRT) {
            return Map.of("message", "Falls ein Konto mit dieser E-Mail existiert, wurde ein Code gesendet.");
        }

        otpService.generateAndSendOtp(email, ipAdresse);

        return Map.of("message", "Falls ein Konto mit dieser E-Mail existiert, wurde ein Code gesendet.");
    }

    /**
     * Schritt 2: OTP verifizieren, JWT zurueckgeben
     */
    public Map<String, Object> verifyOtp(String email, String code, String tenantId,
                                          String ipAdresse, String userAgent) {
        if (!otpService.verifyOtp(email, code)) {
            auditService.log(null, null, "LOGIN_FEHLGESCHLAGEN",
                    "Ungueltiger OTP-Code fuer " + email, ipAdresse, userAgent);
            throw new IllegalArgumentException("Ungueltiger oder abgelaufener Code.");
        }

        PortalUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Benutzer nicht gefunden."));

        if (user.getStatus() == UserStatus.GESPERRT) {
            throw new IllegalStateException("Ihr Konto ist gesperrt.");
        }

        // Tenant bestimmen
        String effectiveTenantId = tenantId;
        if (effectiveTenantId == null || effectiveTenantId.isEmpty()) {
            // Standard-Mandant des Benutzers
            Optional<UserTenant> defaultTenant = userTenantRepository.findByUserIdAndIstStandardTrue(user.getId());
            if (defaultTenant.isPresent()) {
                effectiveTenantId = defaultTenant.get().getTenantId();
            } else {
                effectiveTenantId = user.getTenant().getId();
            }
        } else {
            // Pruefen ob Benutzer dem Mandanten zugeordnet ist
            if (!userTenantRepository.existsByUserIdAndTenantId(user.getId(), effectiveTenantId)) {
                throw new IllegalArgumentException("Sie sind diesem Mandanten nicht zugeordnet.");
            }
        }

        // Session erstellen
        String sessionId = UUID.randomUUID().toString();
        String token = jwtService.generateToken(user.getId(), user.getEmail(),
                effectiveTenantId, sessionId);

        AuthSession session = AuthSession.builder()
                .id(sessionId)
                .userId(user.getId())
                .tenantId(effectiveTenantId)
                .erstelltAm(LocalDateTime.now())
                .gueltigBis(LocalDateTime.now().plusHours(jwtService.getExpirationHours()))
                .ipAdresse(ipAdresse)
                .userAgent(userAgent)
                .aktiv(true)
                .build();
        sessionRepository.save(session);

        // Login-Zeitstempel aktualisieren
        user.setLetzterLogin(LocalDateTime.now());
        userRepository.save(user);

        auditService.log(user.getId(), effectiveTenantId, "LOGIN_ERFOLGREICH",
                "Benutzer " + user.getEmail() + " angemeldet", ipAdresse, userAgent);

        // Berechtigungen sammeln
        List<GruppenBerechtigung> berechtigungen = berechtigungRepository.findByUserId(user.getId());
        List<Map<String, Object>> permList = berechtigungen.stream()
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

        // Verfuegbare Mandanten
        List<UserTenant> userTenants = userTenantRepository.findByUserId(user.getId());
        List<Map<String, String>> tenants = userTenants.stream()
                .filter(UserTenant::isAktiv)
                .map(ut -> Map.of(
                        "id", ut.getTenantId(),
                        "name", ut.getTenant() != null ? ut.getTenant().getName() : ut.getTenantId()
                ))
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("token", token);
        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("id", user.getId());
        userMap.put("vorname", user.getVorname());
        userMap.put("nachname", user.getNachname());
        userMap.put("email", user.getEmail());
        userMap.put("initialen", user.getInitialen());
        userMap.put("superAdmin", user.isSuperAdmin());
        result.put("user", userMap);
        result.put("tenantId", effectiveTenantId);
        result.put("tenants", tenants);
        result.put("berechtigungen", permList);
        return result;
    }

    /**
     * Abmelden: Session deaktivieren
     */
    public void logout(String sessionId, String userId, String tenantId) {
        sessionRepository.findById(sessionId).ifPresent(session -> {
            session.setAktiv(false);
            sessionRepository.save(session);
        });
        auditService.log(userId, tenantId, "LOGOUT", "Benutzer abgemeldet");
    }

    /**
     * Alle Sessions eines Benutzers deaktivieren
     */
    public void logoutAll(String userId) {
        sessionRepository.deactivateAllByUserId(userId);
        auditService.log(userId, null, "LOGOUT_ALLE", "Alle Sessions beendet");
    }

    /**
     * Aktuelle Berechtigungen eines Benutzers fuer einen Use Case pruefen
     */
    @Transactional(readOnly = true)
    public boolean hatBerechtigung(String userId, String useCase, String typ) {
        List<GruppenBerechtigung> berechtigungen =
                berechtigungRepository.findByUserIdAndUseCase(userId, useCase);

        return berechtigungen.stream().anyMatch(gb -> switch (typ) {
            case "anzeigen" -> gb.isAnzeigen();
            case "lesen" -> gb.isLesen();
            case "schreiben" -> gb.isSchreiben();
            case "loeschen" -> gb.isLoeschen();
            default -> false;
        });
    }

    /**
     * Session-Validierung
     */
    @Transactional(readOnly = true)
    public boolean isSessionActive(String sessionId) {
        return sessionRepository.findById(sessionId)
                .map(s -> s.isAktiv() && s.getGueltigBis().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    /**
     * Mandant wechseln (neuen Token ausstellen)
     */
    public Map<String, Object> switchTenant(String userId, String newTenantId,
                                             String ipAdresse, String userAgent) {
        PortalUser user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Benutzer nicht gefunden."));

        if (!userTenantRepository.existsByUserIdAndTenantId(userId, newTenantId)) {
            throw new IllegalArgumentException("Sie sind diesem Mandanten nicht zugeordnet.");
        }

        String sessionId = UUID.randomUUID().toString();
        String token = jwtService.generateToken(userId, user.getEmail(), newTenantId, sessionId);

        AuthSession session = AuthSession.builder()
                .id(sessionId)
                .userId(userId)
                .tenantId(newTenantId)
                .erstelltAm(LocalDateTime.now())
                .gueltigBis(LocalDateTime.now().plusHours(jwtService.getExpirationHours()))
                .ipAdresse(ipAdresse)
                .userAgent(userAgent)
                .aktiv(true)
                .build();
        sessionRepository.save(session);

        auditService.log(userId, newTenantId, "MANDANT_GEWECHSELT",
                "Gewechselt zu Mandant " + newTenantId, ipAdresse, userAgent);

        return Map.of("token", token, "tenantId", newTenantId);
    }
}

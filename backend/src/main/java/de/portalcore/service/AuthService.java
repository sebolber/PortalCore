package de.portalcore.service;

import de.portalcore.entity.AuthSession;
import de.portalcore.entity.GruppenBerechtigung;
import de.portalcore.entity.PortalUser;
import de.portalcore.entity.UserTenant;
import de.portalcore.enums.UserStatus;
import de.portalcore.repository.AuthSessionRepository;
import de.portalcore.repository.GruppenBerechtigungRepository;
import de.portalcore.repository.PortalUserRepository;
import de.portalcore.repository.UserTenantRepository;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

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
                    String.format("Ungueltiger OTP-Code fuer %s", email), ipAdresse, userAgent);
            throw new IllegalArgumentException("Ungueltiger oder abgelaufener Code.");
        }

        PortalUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Benutzer nicht gefunden."));

        if (user.getStatus() == UserStatus.GESPERRT) {
            throw new IllegalStateException("Ihr Konto ist gesperrt.");
        }

        String effectiveTenantId = resolveEffectiveTenantId(user, tenantId);
        String sessionId = UUID.randomUUID().toString();
        String token = jwtService.generateToken(user.getId(), user.getEmail(), effectiveTenantId, sessionId);

        createSession(sessionId, user.getId(), effectiveTenantId, ipAdresse, userAgent);
        updateLoginTimestamp(user);

        auditService.log(user.getId(), effectiveTenantId, "LOGIN_ERFOLGREICH",
                String.format("Benutzer %s angemeldet", user.getEmail()), ipAdresse, userAgent);

        return buildLoginResponse(token, user, effectiveTenantId);
    }

    private String resolveEffectiveTenantId(PortalUser user, String requestedTenantId) {
        if (requestedTenantId == null || requestedTenantId.isEmpty()) {
            return userTenantRepository.findByUserIdAndIstStandardTrue(user.getId())
                    .map(UserTenant::getTenantId)
                    .orElse(user.getTenant().getId());
        }

        if (!userTenantRepository.existsByUserIdAndTenantId(user.getId(), requestedTenantId)) {
            throw new IllegalArgumentException("Sie sind diesem Mandanten nicht zugeordnet.");
        }
        return requestedTenantId;
    }

    private void createSession(String sessionId, String userId, String tenantId,
                                String ipAdresse, String userAgent) {
        AuthSession session = AuthSession.builder()
                .id(sessionId)
                .userId(userId)
                .tenantId(tenantId)
                .erstelltAm(LocalDateTime.now())
                .gueltigBis(LocalDateTime.now().plusHours(jwtService.getExpirationHours()))
                .ipAdresse(ipAdresse)
                .userAgent(userAgent)
                .aktiv(true)
                .build();
        sessionRepository.save(session);
    }

    private void updateLoginTimestamp(PortalUser user) {
        user.setLetzterLogin(LocalDateTime.now());
        userRepository.save(user);
    }

    private Map<String, Object> buildLoginResponse(String token, PortalUser user, String tenantId) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("token", token);
        result.put("user", buildUserMap(user));
        result.put("tenantId", tenantId);
        result.put("tenants", buildTenantList(user.getId()));
        result.put("berechtigungen", buildBerechtigungList(user.getId()));
        return result;
    }

    private Map<String, Object> buildUserMap(PortalUser user) {
        Map<String, Object> userMap = new LinkedHashMap<>();
        userMap.put("id", user.getId());
        userMap.put("vorname", user.getVorname());
        userMap.put("nachname", user.getNachname());
        userMap.put("email", user.getEmail());
        userMap.put("initialen", user.getInitialen());
        userMap.put("superAdmin", user.isSuperAdmin());
        return userMap;
    }

    /**
     * Baut die Berechtigungsliste fuer einen Benutzer. Wird sowohl beim Login als auch bei /auth/me verwendet.
     */
    public List<Map<String, Object>> buildBerechtigungList(String userId) {
        return berechtigungRepository.findByUserId(userId).stream()
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
    }

    /**
     * Baut die Liste aktiver Mandanten fuer einen Benutzer.
     */
    public List<Map<String, String>> buildTenantList(String userId) {
        return userTenantRepository.findByUserId(userId).stream()
                .filter(UserTenant::isAktiv)
                .map(ut -> Map.of(
                        "id", ut.getTenantId(),
                        "name", ut.getTenant() != null ? ut.getTenant().getName() : ut.getTenantId()
                ))
                .collect(Collectors.toList());
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

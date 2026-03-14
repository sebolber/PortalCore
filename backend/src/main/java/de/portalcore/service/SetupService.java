package de.portalcore.service;

import de.portalcore.dto.SetupMandantRequest;
import de.portalcore.dto.SetupStatusResponse;
import de.portalcore.dto.SetupSuperuserRequest;
import de.portalcore.dto.SmtpKonfigurationRequest;
import de.portalcore.entity.PortalParameter;
import de.portalcore.entity.SmtpKonfiguration;
import de.portalcore.entity.SystemInitialisierung;
import de.portalcore.entity.Tenant;
import de.portalcore.entity.PortalUser;
import de.portalcore.enums.UserStatus;
import de.portalcore.entity.Gruppe;
import de.portalcore.entity.UserTenant;
import de.portalcore.repository.GruppeRepository;
import de.portalcore.repository.PortalParameterRepository;
import de.portalcore.repository.SmtpKonfigurationRepository;
import de.portalcore.repository.SystemInitialisierungRepository;
import de.portalcore.repository.PortalUserRepository;
import de.portalcore.repository.TenantRepository;
import de.portalcore.repository.UserTenantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.function.Consumer;

@Service
public class SetupService {

    private static final Logger log = LoggerFactory.getLogger(SetupService.class);

    private static final String ADMIN_GRUPPE_ID = "g-admin";

    private final SystemInitialisierungRepository systemRepo;
    private final SmtpKonfigurationRepository smtpRepo;
    private final TenantRepository tenantRepo;
    private final PortalUserRepository userRepo;
    private final PortalParameterRepository parameterRepo;
    private final GruppeRepository gruppeRepo;
    private final UserTenantRepository userTenantRepo;
    private final SmtpValidierungService smtpValidierung;
    private final PasswordEncoder passwordEncoder;

    public SetupService(SystemInitialisierungRepository systemRepo,
                        SmtpKonfigurationRepository smtpRepo,
                        TenantRepository tenantRepo,
                        PortalUserRepository userRepo,
                        PortalParameterRepository parameterRepo,
                        GruppeRepository gruppeRepo,
                        UserTenantRepository userTenantRepo,
                        SmtpValidierungService smtpValidierung,
                        PasswordEncoder passwordEncoder) {
        this.systemRepo = systemRepo;
        this.smtpRepo = smtpRepo;
        this.tenantRepo = tenantRepo;
        this.userRepo = userRepo;
        this.parameterRepo = parameterRepo;
        this.gruppeRepo = gruppeRepo;
        this.userTenantRepo = userTenantRepo;
        this.smtpValidierung = smtpValidierung;
        this.passwordEncoder = passwordEncoder;
    }

    public boolean istInitialisiert() {
        return systemRepo.findById(SystemInitialisierung.SYSTEM_ID)
                .map(SystemInitialisierung::isIstInitialisiert)
                .orElse(false);
    }

    public SetupStatusResponse getSetupStatus() {
        SystemInitialisierung system = findSystemRecord();
        boolean isInit = system.isIstInitialisiert();
        boolean hasSmtp = system.isSetupSmtpAbgeschlossen();
        boolean hasTenant = system.isSetupMandantAbgeschlossen();
        boolean hasSuperuser = system.isSetupSuperuserAbgeschlossen();
        return new SetupStatusResponse(isInit, hasSmtp, hasTenant, hasSuperuser);
    }

    @Transactional
    public void speichereSmtpKonfiguration(SmtpKonfigurationRequest request) {
        validateNichtInitialisiert();

        SmtpKonfiguration config = SmtpKonfiguration.builder()
                .id(SmtpKonfiguration.DEFAULT_ID)
                .host(request.host())
                .port(request.port())
                .benutzername(request.benutzername())
                .passwortVerschluesselt(verschluesselPasswort(request.passwort()))
                .verschluesselung(request.verschluesselung())
                .absenderName(request.absenderName())
                .absenderEmail(request.absenderEmail())
                .authentifizierungAktiv(request.authentifizierungAktiv())
                .erstelltAm(LocalDateTime.now())
                .build();

        smtpRepo.save(config);
        synchronisiereSmtpParameter(request);
        markiereSetupSchritt(s -> s.setSetupSmtpAbgeschlossen(true));
        log.info("SMTP-Konfiguration gespeichert: host={}, port={}", request.host(), request.port());
    }

    public void testeSmtpVerbindung(SmtpKonfigurationRequest request) {
        smtpValidierung.validateSmtpVerbindung(request);
    }

    @Transactional
    public Tenant erstelleDefaultMandant(SetupMandantRequest request) {
        validateNichtInitialisiert();
        validateSmtpVorhanden();

        Tenant tenant = tenantRepo.findAll().stream().findFirst().orElse(null);
        if (tenant != null) {
            tenant.setName(request.name());
            tenant.setShortName(request.kuerzel());
            tenant.setStrasse(request.strasse());
            tenant.setHausnummer(request.hausnummer());
            tenant.setPlz(request.plz());
            tenant.setOrt(request.ort());
            tenant.setTelefon(request.telefon());
            tenant.setEmail(request.email());
            log.info("Default-Mandant aktualisiert: id={}, name={}", tenant.getId(), tenant.getName());
        } else {
            tenant = Tenant.builder()
                    .id("t-" + UUID.randomUUID().toString().substring(0, 8))
                    .name(request.name())
                    .shortName(request.kuerzel())
                    .strasse(request.strasse())
                    .hausnummer(request.hausnummer())
                    .plz(request.plz())
                    .ort(request.ort())
                    .telefon(request.telefon())
                    .email(request.email())
                    .aktiv(true)
                    .build();
            log.info("Default-Mandant angelegt: id={}, name={}", tenant.getId(), tenant.getName());
        }

        tenant = tenantRepo.save(tenant);
        markiereSetupSchritt(s -> s.setSetupMandantAbgeschlossen(true));
        return tenant;
    }

    @Transactional
    public void erstelleSuperuser(SetupSuperuserRequest request) {
        validateNichtInitialisiert();
        validateSmtpVorhanden();
        validateMandantVorhanden();
        validatePasswoerterStimmenUeberein(request);
        validateEmailEindeutig(request.email());

        Tenant defaultTenant = findDefaultTenant();
        String passwordHash = passwordEncoder.encode(request.passwort());

        PortalUser superuser = PortalUser.builder()
                .id("u-" + UUID.randomUUID().toString().substring(0, 8))
                .vorname(request.vorname())
                .nachname(request.nachname())
                .email(request.email().toLowerCase().trim())
                .initialen(request.vorname().substring(0, 1) + request.nachname().substring(0, 1))
                .tenant(defaultTenant)
                .status(UserStatus.AKTIV)
                .superAdmin(true)
                .sprache(request.sprache() != null ? request.sprache() : "de")
                .zeitzone(request.zeitzone() != null ? request.zeitzone() : "Europe/Berlin")
                .iamId(passwordHash)
                .emailBenachrichtigungen(true)
                .build();

        userRepo.save(superuser);

        ordneAdminGruppeZu(superuser);
        erstelleUserTenant(superuser, defaultTenant);

        markiereSetupSchritt(s -> s.setSetupSuperuserAbgeschlossen(true));
        markiereAlsInitialisiert(request.email());
        log.info("Superuser angelegt, Gruppe Administration zugeordnet, System als initialisiert markiert");
    }

    private SystemInitialisierung findSystemRecord() {
        return systemRepo.findById(SystemInitialisierung.SYSTEM_ID)
                .orElseThrow(() -> new IllegalStateException("Systeminitialisierungs-Datensatz fehlt"));
    }

    private void markiereSetupSchritt(Consumer<SystemInitialisierung> updater) {
        SystemInitialisierung system = findSystemRecord();
        updater.accept(system);
        systemRepo.save(system);
    }

    private void markiereAlsInitialisiert(String initialisiertVon) {
        SystemInitialisierung system = findSystemRecord();
        system.setIstInitialisiert(true);
        system.setInitialisiertAm(LocalDateTime.now());
        system.setInitialisiertVon(initialisiertVon);
        systemRepo.save(system);
    }

    private void validateNichtInitialisiert() {
        if (istInitialisiert()) {
            throw new IllegalStateException("System ist bereits initialisiert. Setup kann nicht erneut ausgefuehrt werden.");
        }
    }

    private void validateSmtpVorhanden() {
        if (!findSystemRecord().isSetupSmtpAbgeschlossen()) {
            throw new IllegalStateException("SMTP-Konfiguration muss zuerst abgeschlossen werden.");
        }
    }

    private void validateMandantVorhanden() {
        if (!findSystemRecord().isSetupMandantAbgeschlossen()) {
            throw new IllegalStateException("Default-Mandant muss zuerst angelegt werden.");
        }
    }

    private void validatePasswoerterStimmenUeberein(SetupSuperuserRequest request) {
        if (!request.passwort().equals(request.passwortBestaetigung())) {
            throw new IllegalArgumentException("Passwort und Passwort-Bestaetigung stimmen nicht ueberein.");
        }
    }

    private void validateEmailEindeutig(String email) {
        if (userRepo.findByEmail(email.toLowerCase().trim()).isPresent()) {
            throw new IllegalArgumentException("Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.");
        }
    }

    private void ordneAdminGruppeZu(PortalUser superuser) {
        Gruppe adminGruppe = gruppeRepo.findById(ADMIN_GRUPPE_ID)
                .orElseThrow(() -> new IllegalStateException("Systemgruppe 'Administration' (g-admin) fehlt in der Datenbank."));
        superuser.getGruppen().add(adminGruppe);
        userRepo.save(superuser);
        log.info("Superuser '{}' der Gruppe '{}' zugeordnet.", superuser.getEmail(), adminGruppe.getName());
    }

    private void erstelleUserTenant(PortalUser superuser, Tenant tenant) {
        UserTenant userTenant = UserTenant.builder()
                .userId(superuser.getId())
                .tenantId(tenant.getId())
                .istStandard(true)
                .aktiv(true)
                .zugeordnetVon("setup-wizard")
                .build();
        userTenantRepo.save(userTenant);
    }

    private Tenant findDefaultTenant() {
        return tenantRepo.findAll().stream().findFirst()
                .orElseThrow(() -> new IllegalStateException("Kein Mandant vorhanden."));
    }

    private void synchronisiereSmtpParameter(SmtpKonfigurationRequest request) {
        boolean isSsl = "SSL".equals(request.verschluesselung());
        boolean isTls = "TLS".equals(request.verschluesselung());

        Map<String, String> params = Map.of(
                "portal.email.smtp.host", request.host(),
                "portal.email.smtp.port", String.valueOf(request.port()),
                "portal.email.smtp.username", request.benutzername() != null ? request.benutzername() : "",
                "portal.email.smtp.password", request.passwort() != null ? request.passwort() : "",
                "portal.email.smtp.auth", String.valueOf(request.authentifizierungAktiv()),
                "portal.email.smtp.starttls", String.valueOf(isTls),
                "portal.email.smtp.ssl", String.valueOf(isSsl),
                "portal.email.from", request.absenderEmail()
        );

        for (Map.Entry<String, String> entry : params.entrySet()) {
            parameterRepo.findGlobalByKey(entry.getKey()).ifPresent(param -> {
                param.setValue(entry.getValue());
                param.setLastModified(LocalDateTime.now());
                param.setLastModifiedBy("setup-wizard");
                parameterRepo.save(param);
            });
        }

        log.info("SMTP-Parameter in portal_parameters synchronisiert");
    }

    private String verschluesselPasswort(String passwort) {
        if (passwort == null || passwort.isBlank()) {
            return null;
        }
        return passwordEncoder.encode(passwort);
    }
}

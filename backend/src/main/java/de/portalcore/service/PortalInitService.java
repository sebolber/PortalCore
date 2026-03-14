package de.portalcore.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import de.portalcore.entity.PortalParameter;
import de.portalcore.entity.PortalUser;
import de.portalcore.entity.Tenant;
import de.portalcore.enums.ParameterType;
import de.portalcore.enums.UserStatus;
import de.portalcore.repository.PortalParameterRepository;
import de.portalcore.repository.PortalUserRepository;
import de.portalcore.repository.TenantRepository;
import de.portalcore.repository.UserTenantRepository;
import de.portalcore.entity.UserTenant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Laedt beim Start die portal-init.yml und fuehrt Erstinstallation durch:
 * - Super-User anlegen (falls noch nicht vorhanden)
 * - PortalParameter-Werte aus der Konfigurationsdatei setzen
 *
 * Die Datei wird in folgender Reihenfolge gesucht:
 * 1. /app/config/portal-init.yml (Docker-Volume / Mount)
 * 2. classpath:portal-init.yml (eingebaut im JAR)
 */
@Service
public class PortalInitService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PortalInitService.class);

    private final PortalUserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final UserTenantRepository userTenantRepository;
    private final PortalParameterRepository parameterRepository;

    public PortalInitService(PortalUserRepository userRepository,
                             TenantRepository tenantRepository,
                             UserTenantRepository userTenantRepository,
                             PortalParameterRepository parameterRepository) {
        this.userRepository = userRepository;
        this.tenantRepository = tenantRepository;
        this.userTenantRepository = userTenantRepository;
        this.parameterRepository = parameterRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        Resource configResource = findConfigFile();
        if (configResource == null || !configResource.exists()) {
            log.info("Keine portal-init.yml gefunden. Erstinstallation uebersprungen.");
            return;
        }

        try (InputStream is = configResource.getInputStream()) {
            ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());
            @SuppressWarnings("unchecked")
            Map<String, Object> config = yamlMapper.readValue(is, Map.class);

            initSuperUser(config);
            initParameters(config);

            log.info("Portal-Initialisierung aus {} abgeschlossen.", configResource.getDescription());
        } catch (Exception e) {
            log.warn("Fehler beim Lesen der portal-init.yml: {}. Erstinstallation uebersprungen.", e.getMessage());
        }
    }

    private Resource findConfigFile() {
        // 1. Externe Datei (Docker-Mount)
        FileSystemResource external = new FileSystemResource("/app/config/portal-init.yml");
        if (external.exists()) return external;

        // 2. Classpath (eingebaut)
        ClassPathResource classpath = new ClassPathResource("portal-init.yml");
        if (classpath.exists()) return classpath;

        return null;
    }

    @SuppressWarnings("unchecked")
    private void initSuperUser(Map<String, Object> config) {
        Map<String, Object> superUserConfig = (Map<String, Object>) config.get("superUser");
        if (superUserConfig == null) return;

        String email = (String) superUserConfig.get("email");
        if (email == null || email.isBlank()) return;

        // Nur anlegen wenn noch kein User mit dieser E-Mail existiert
        if (userRepository.findByEmail(email).isPresent()) {
            log.info("Super-User '{}' existiert bereits. Uebersprungen.", email);
            return;
        }

        String tenantId = (String) superUserConfig.getOrDefault("tenantId", "t-aok-nw");
        Tenant tenant = tenantRepository.findById(tenantId).orElse(null);
        if (tenant == null) {
            log.warn("Mandant '{}' nicht gefunden. Super-User wird nicht angelegt.", tenantId);
            return;
        }

        String vorname = (String) superUserConfig.getOrDefault("vorname", "Admin");
        String nachname = (String) superUserConfig.getOrDefault("nachname", "Portal");
        String initialen = calculateInitialen(vorname, nachname);

        String userId = "u-init-" + UUID.randomUUID().toString().substring(0, 8);
        PortalUser user = PortalUser.builder()
                .id(userId)
                .vorname(vorname)
                .nachname(nachname)
                .email(email)
                .tenant(tenant)
                .status(UserStatus.AKTIV)
                .erstelltAm(LocalDateTime.now())
                .initialen(initialen)
                .superAdmin(true)
                .build();

        userRepository.save(user);

        // UserTenant anlegen
        UserTenant ut = UserTenant.builder()
                .userId(userId)
                .tenantId(tenantId)
                .istStandard(true)
                .aktiv(true)
                .zugeordnetVon("portal-init")
                .build();
        userTenantRepository.save(ut);

        log.info("Super-User '{}' ({} {}) erfolgreich angelegt.", email, vorname, nachname);
    }

    private String calculateInitialen(String vorname, String nachname) {
        String v = (vorname != null && !vorname.isEmpty()) ? vorname.substring(0, 1).toUpperCase() : "";
        String n = (nachname != null && !nachname.isEmpty()) ? nachname.substring(0, 1).toUpperCase() : "";
        return v + n;
    }

    @SuppressWarnings("unchecked")
    private void initParameters(Map<String, Object> config) {
        Map<String, Object> params = (Map<String, Object>) config.get("parameters");
        if (params == null) return;

        int verarbeitet = 0;
        int aktualisiert = 0;
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            String key = entry.getKey();
            String value = String.valueOf(entry.getValue());
            verarbeitet++;

            var paramOpt = parameterRepository.findGlobalByKey(key);
            if (paramOpt.isEmpty()) {
                log.warn("Parameter '{}' aus portal-init.yml existiert nicht in der Datenbank.", key);
                continue;
            }

            var param = paramOpt.get();
            if (param.getValue() == null || param.getValue().isBlank()) {
                param.setValue(value);
                param.setLastModified(LocalDateTime.now());
                param.setLastModifiedBy("portal-init");
                parameterRepository.save(param);
                aktualisiert++;
                log.debug("Parameter '{}' auf '{}' gesetzt.", key,
                        param.isSensitive() ? "***" : value);
            }
        }

        log.info("{} Parameter verarbeitet, davon {} aktualisiert.", verarbeitet, aktualisiert);
    }
}

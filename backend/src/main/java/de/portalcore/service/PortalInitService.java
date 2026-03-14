package de.portalcore.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import de.portalcore.entity.SystemInitialisierung;
import de.portalcore.repository.PortalParameterRepository;
import de.portalcore.repository.SystemInitialisierungRepository;
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
import java.util.Map;

/**
 * Laedt beim Start die portal-init.yml und fuehrt Parameter-Initialisierung durch.
 * Super-User und Mandant werden ausschliesslich ueber den Setup-Wizard angelegt.
 *
 * Die Datei wird in folgender Reihenfolge gesucht:
 * 1. /app/config/portal-init.yml (Docker-Volume / Mount)
 * 2. classpath:portal-init.yml (eingebaut im JAR)
 */
@Service
public class PortalInitService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(PortalInitService.class);

    private final PortalParameterRepository parameterRepository;
    private final SystemInitialisierungRepository systemRepo;

    public PortalInitService(PortalParameterRepository parameterRepository,
                             SystemInitialisierungRepository systemRepo) {
        this.parameterRepository = parameterRepository;
        this.systemRepo = systemRepo;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!isSystemInitialisiert()) {
            log.info("System noch nicht ueber Setup-Wizard initialisiert. Portal-Init uebersprungen.");
            return;
        }

        Resource configResource = findConfigFile();
        if (configResource == null || !configResource.exists()) {
            log.info("Keine portal-init.yml gefunden. Parameter-Init uebersprungen.");
            return;
        }

        try (InputStream is = configResource.getInputStream()) {
            ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());
            @SuppressWarnings("unchecked")
            Map<String, Object> config = yamlMapper.readValue(is, Map.class);

            initParameters(config);

            log.info("Portal-Initialisierung aus {} abgeschlossen.", configResource.getDescription());
        } catch (Exception e) {
            log.warn("Fehler beim Lesen der portal-init.yml: {}. Parameter-Init uebersprungen.", e.getMessage());
        }
    }

    private boolean isSystemInitialisiert() {
        return systemRepo.findById(SystemInitialisierung.SYSTEM_ID)
                .map(SystemInitialisierung::isIstInitialisiert)
                .orElse(false);
    }

    private Resource findConfigFile() {
        FileSystemResource external = new FileSystemResource("/app/config/portal-init.yml");
        if (external.exists()) return external;

        ClassPathResource classpath = new ClassPathResource("portal-init.yml");
        if (classpath.exists()) return classpath;

        return null;
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

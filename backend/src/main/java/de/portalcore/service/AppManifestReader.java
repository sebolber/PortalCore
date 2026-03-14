package de.portalcore.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import de.portalcore.entity.AppUseCase;
import de.portalcore.entity.PortalApp;
import de.portalcore.repository.AppUseCaseRepository;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Liest und verarbeitet portal-app.yaml Manifeste fuer App-Deployments.
 */
@Component
public class AppManifestReader {

    private final AppUseCaseRepository appUseCaseRepository;

    public AppManifestReader(AppUseCaseRepository appUseCaseRepository) {
        this.appUseCaseRepository = appUseCaseRepository;
    }

    @SuppressWarnings("unchecked")
    public void readAndApplyManifest(PortalApp app, Path manifestPath) throws IOException {
        ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());
        Map<String, Object> manifest = yamlMapper.readValue(manifestPath.toFile(), Map.class);

        applyBasicFields(app, manifest);
        applyUseCases(app, manifest);
    }

    @SuppressWarnings("unchecked")
    private void applyBasicFields(PortalApp app, Map<String, Object> manifest) {
        if (manifest.containsKey("image")) {
            app.setManifestImage((String) manifest.get("image"));
        }
        if (manifest.containsKey("port")) {
            app.setManifestPort((Integer) manifest.get("port"));
        }
        if (manifest.containsKey("dockerfile")) {
            app.setManifestDockerfile((String) manifest.get("dockerfile"));
        }
        if (manifest.containsKey("healthCheck")) {
            app.setManifestHealthCheck((String) manifest.get("healthCheck"));
        }
        if (manifest.containsKey("env")) {
            Object env = manifest.get("env");
            if (env instanceof Map) {
                StringBuilder envStr = new StringBuilder();
                ((Map<String, String>) env).forEach((k, v) ->
                        envStr.append(envStr.isEmpty() ? "" : ",").append(k).append("=").append(v));
                app.setManifestEnv(envStr.toString());
            }
        }
        if (manifest.containsKey("name") && (app.getName() == null || app.getName().isBlank())) {
            app.setName((String) manifest.get("name"));
        }
        if (manifest.containsKey("version")) {
            app.setVersion((String) manifest.get("version"));
        }
    }

    @SuppressWarnings("unchecked")
    private void applyUseCases(PortalApp app, Map<String, Object> manifest) {
        if (!manifest.containsKey("useCases")) {
            return;
        }

        Object useCasesObj = manifest.get("useCases");
        if (!(useCasesObj instanceof List)) {
            return;
        }

        appUseCaseRepository.deleteByAppId(app.getId());

        for (Object ucObj : (List<?>) useCasesObj) {
            if (!(ucObj instanceof Map)) {
                continue;
            }
            Map<String, Object> ucMap = (Map<String, Object>) ucObj;
            String key = (String) ucMap.get("key");
            String label = (String) ucMap.get("label");
            if (key == null || label == null) {
                continue;
            }
            String beschreibung = (String) ucMap.getOrDefault("beschreibung", "");
            AppUseCase auc = AppUseCase.builder()
                    .id("auc-" + UUID.randomUUID().toString().substring(0, 8))
                    .appId(app.getId())
                    .useCase(key)
                    .useCaseLabel(label)
                    .beschreibung(beschreibung)
                    .build();
            appUseCaseRepository.save(auc);
        }
    }
}

package de.portalcore.service;

import de.portalcore.entity.InstalledApp;
import de.portalcore.entity.PortalApp;
import de.portalcore.repository.InstalledAppRepository;
import de.portalcore.repository.PortalAppRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class DeploymentService {

    private static final Logger log = LoggerFactory.getLogger(DeploymentService.class);
    private static final String WORKSPACE_DIR = "/tmp/portal-deployments";
    private static final String CONTAINER_PREFIX = "portal-app-";
    private static final String DEFAULT_NETWORK = "portalcore_default";

    private final InstalledAppRepository installedAppRepository;
    private final PortalAppRepository portalAppRepository;
    private final DockerContainerService dockerService;
    private final AppManifestReader manifestReader;

    public DeploymentService(InstalledAppRepository installedAppRepository,
                             PortalAppRepository portalAppRepository,
                             DockerContainerService dockerService,
                             AppManifestReader manifestReader) {
        this.installedAppRepository = installedAppRepository;
        this.portalAppRepository = portalAppRepository;
        this.dockerService = dockerService;
        this.manifestReader = manifestReader;
    }

    public CompletableFuture<InstalledApp> deployAsync(String installedAppId) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return deploy(installedAppId);
            } catch (Exception e) {
                log.error("Deployment failed for {}", installedAppId, e);
                updateDeployStatus(installedAppId, "FAILED", e.getMessage());
                throw new RuntimeException("Deployment failed: " + e.getMessage(), e);
            }
        });
    }

    @Transactional
    public InstalledApp deploy(String installedAppId) {
        InstalledApp installed = findInstalledApp(installedAppId);
        PortalApp app = resolvePortalApp(installed);

        String containerName = CONTAINER_PREFIX + app.getId();
        installed.setContainerName(containerName);
        installed.setDeployStatus("DEPLOYING");
        installed.setDeployLog("");
        installedAppRepository.save(installed);

        StringBuilder deployLog = new StringBuilder();

        try {
            String imageName = resolveAndPrepareImage(app, containerName, deployLog);
            dockerService.stopAndRemove(containerName);

            int hostPort = dockerService.findAvailablePort(
                    app.getManifestPort() != null ? app.getManifestPort() : 8100);
            int containerPort = app.getManifestPort() != null ? app.getManifestPort() : 80;

            appendLog(deployLog, "Starting container on port " + hostPort);
            String containerId = dockerService.startContainer(
                    containerName, imageName, hostPort, containerPort,
                    DEFAULT_NETWORK, app.getManifestEnv());
            appendLog(deployLog, "Container started: " + containerId.substring(0, Math.min(12, containerId.length())));

            updateInstalledAppAfterDeploy(installed, containerId, hostPort, deployLog);

            app.setApplicationUrl("http://localhost:" + hostPort);
            portalAppRepository.save(app);

            return installedAppRepository.save(installed);
        } catch (Exception e) {
            installed.setDeployStatus("FAILED");
            appendLog(deployLog, "ERROR: " + e.getMessage());
            installed.setDeployLog(deployLog.toString());
            installedAppRepository.save(installed);
            throw new RuntimeException("Deployment failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public InstalledApp undeploy(String installedAppId) {
        InstalledApp installed = findInstalledApp(installedAppId);

        if (installed.getContainerName() != null) {
            try {
                dockerService.stopAndRemove(installed.getContainerName());
            } catch (Exception e) {
                log.warn("Error stopping container {}: {}", installed.getContainerName(), e.getMessage());
            }
        }

        installed.setContainerId(null);
        installed.setContainerPort(null);
        installed.setDeployStatus("STOPPED");
        installed.setDeployLog(null);

        return installedAppRepository.save(installed);
    }

    public Map<String, Object> getDeploymentStatus(String installedAppId) {
        InstalledApp installed = findInstalledApp(installedAppId);

        boolean containerRunning = installed.getContainerName() != null
                && dockerService.isContainerRunning(installed.getContainerName());

        return Map.of(
                "id", installed.getId(),
                "deployStatus", installed.getDeployStatus() != null ? installed.getDeployStatus() : "PENDING",
                "containerRunning", containerRunning,
                "containerName", installed.getContainerName() != null ? installed.getContainerName() : "",
                "containerPort", installed.getContainerPort() != null ? installed.getContainerPort() : 0,
                "deployLog", installed.getDeployLog() != null ? installed.getDeployLog() : ""
        );
    }

    private String resolveAndPrepareImage(PortalApp app, String containerName,
                                           StringBuilder deployLog) throws Exception {
        if (app.getManifestImage() != null && !app.getManifestImage().isBlank()) {
            return pullPrebuiltImage(app, deployLog);
        }
        if (app.getRepositoryUrl() != null && !app.getRepositoryUrl().isBlank()) {
            return buildFromRepository(app, containerName, deployLog);
        }
        throw new RuntimeException("App has neither manifest_image nor repository_url");
    }

    private String pullPrebuiltImage(PortalApp app, StringBuilder deployLog) {
        String imageName = app.getManifestImage();
        appendLog(deployLog, "Pulling image: " + imageName);
        dockerService.pullImage(imageName);
        appendLog(deployLog, "Image pulled successfully");
        return imageName;
    }

    private String buildFromRepository(PortalApp app, String containerName,
                                        StringBuilder deployLog) throws Exception {
        String imageName = containerName + ":latest";
        appendLog(deployLog, "Cloning repository: " + app.getRepositoryUrl());

        Path workDir = Path.of(WORKSPACE_DIR, app.getId());
        if (Files.exists(workDir)) {
            dockerService.removeDirectory(workDir.toString());
        }
        Files.createDirectories(workDir.getParent());
        dockerService.cloneRepository(app.getRepositoryUrl(), workDir.toString());
        appendLog(deployLog, "Repository cloned");

        Path manifestPath = workDir.resolve("portal-app.yaml");
        if (Files.exists(manifestPath)) {
            appendLog(deployLog, "Reading portal-app.yaml manifest");
            manifestReader.readAndApplyManifest(app, manifestPath);
            portalAppRepository.save(app);
        }

        String dockerfile = app.getManifestDockerfile() != null
                ? app.getManifestDockerfile() : "Dockerfile";
        appendLog(deployLog, "Building image: " + imageName);
        dockerService.buildImage(imageName, workDir.resolve(dockerfile).toString(), workDir.toString());
        appendLog(deployLog, "Image built successfully");

        return imageName;
    }

    private InstalledApp findInstalledApp(String installedAppId) {
        return installedAppRepository.findById(installedAppId)
                .orElseThrow(() -> new RuntimeException("InstalledApp not found: " + installedAppId));
    }

    private PortalApp resolvePortalApp(InstalledApp installed) {
        PortalApp app = installed.getApp();
        if (app == null) {
            throw new RuntimeException("No PortalApp linked to installation " + installed.getId());
        }
        return app;
    }

    private void updateInstalledAppAfterDeploy(InstalledApp installed, String containerId,
                                                int hostPort, StringBuilder deployLog) {
        installed.setContainerId(containerId.length() > 12 ? containerId.substring(0, 12) : containerId);
        installed.setContainerPort(hostPort);
        installed.setDeployStatus("RUNNING");
        installed.setDeployLog(deployLog.toString());
        installed.setDeployedAt(LocalDateTime.now());
    }

    private void updateDeployStatus(String installedAppId, String status, String logMessage) {
        installedAppRepository.findById(installedAppId).ifPresent(installed -> {
            installed.setDeployStatus(status);
            installed.setDeployLog(logMessage);
            installedAppRepository.save(installed);
        });
    }

    private void appendLog(StringBuilder sb, String message) {
        sb.append("[").append(LocalDateTime.now().toString().substring(0, 19)).append("] ").append(message).append("\n");
        log.info("Deploy: {}", message);
    }
}

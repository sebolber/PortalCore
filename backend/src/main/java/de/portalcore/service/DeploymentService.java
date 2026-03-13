package de.portalcore.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import de.portalcore.entity.InstalledApp;
import de.portalcore.entity.PortalApp;
import de.portalcore.repository.InstalledAppRepository;
import de.portalcore.repository.PortalAppRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
public class DeploymentService {

    private static final Logger log = LoggerFactory.getLogger(DeploymentService.class);
    private static final String WORKSPACE_DIR = "/tmp/portal-deployments";
    private static final String CONTAINER_PREFIX = "portal-app-";

    private final InstalledAppRepository installedAppRepository;
    private final PortalAppRepository portalAppRepository;

    public DeploymentService(InstalledAppRepository installedAppRepository,
                             PortalAppRepository portalAppRepository) {
        this.installedAppRepository = installedAppRepository;
        this.portalAppRepository = portalAppRepository;
    }

    /**
     * Deploy an installed app asynchronously.
     * Clones repo, reads manifest, builds/pulls image, starts container.
     */
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
        InstalledApp installed = installedAppRepository.findById(installedAppId)
                .orElseThrow(() -> new RuntimeException("InstalledApp not found: " + installedAppId));

        PortalApp app = installed.getApp();
        if (app == null) {
            throw new RuntimeException("No PortalApp linked to installation " + installedAppId);
        }

        String containerName = CONTAINER_PREFIX + app.getId();
        installed.setContainerName(containerName);
        installed.setDeployStatus("DEPLOYING");
        installed.setDeployLog("");
        installedAppRepository.save(installed);

        StringBuilder deployLog = new StringBuilder();

        try {
            // Step 1: Determine image source
            String imageName;
            if (app.getManifestImage() != null && !app.getManifestImage().isBlank()) {
                // Pre-built image: pull from registry
                imageName = app.getManifestImage();
                appendLog(deployLog, "Pulling image: " + imageName);
                execCommand("docker", "pull", imageName);
                appendLog(deployLog, "Image pulled successfully");
            } else if (app.getRepositoryUrl() != null && !app.getRepositoryUrl().isBlank()) {
                // Build from repo
                imageName = containerName + ":latest";
                appendLog(deployLog, "Cloning repository: " + app.getRepositoryUrl());

                Path workDir = Path.of(WORKSPACE_DIR, app.getId());
                if (Files.exists(workDir)) {
                    execCommand("rm", "-rf", workDir.toString());
                }
                Files.createDirectories(workDir.getParent());

                execCommand("git", "clone", "--depth", "1", app.getRepositoryUrl(), workDir.toString());
                appendLog(deployLog, "Repository cloned");

                // Read manifest if exists
                Path manifestPath = workDir.resolve("portal-app.yaml");
                if (Files.exists(manifestPath)) {
                    appendLog(deployLog, "Reading portal-app.yaml manifest");
                    readAndApplyManifest(app, manifestPath);
                    portalAppRepository.save(app);
                }

                // Build Docker image
                String dockerfile = app.getManifestDockerfile() != null
                        ? app.getManifestDockerfile() : "Dockerfile";
                appendLog(deployLog, "Building image: " + imageName);
                execCommand("docker", "build", "-t", imageName,
                        "-f", workDir.resolve(dockerfile).toString(),
                        workDir.toString());
                appendLog(deployLog, "Image built successfully");
            } else {
                throw new RuntimeException("App has neither manifest_image nor repository_url");
            }

            // Step 2: Stop existing container if running
            stopContainerIfExists(containerName);

            // Step 3: Find available port
            int hostPort = app.getManifestPort() != null ? findAvailablePort(app.getManifestPort()) : findAvailablePort(8100);
            int containerPort = app.getManifestPort() != null ? app.getManifestPort() : 80;

            // Step 4: Start container
            appendLog(deployLog, "Starting container on port " + hostPort);

            String[] runCmd;
            if (app.getManifestEnv() != null && !app.getManifestEnv().isBlank()) {
                // Parse env vars
                String[] envPairs = app.getManifestEnv().split(",");
                String[] baseCmd = {"docker", "run", "-d",
                        "--name", containerName,
                        "--network", "portalcore_default",
                        "-p", hostPort + ":" + containerPort};
                String[] envArgs = new String[envPairs.length * 2];
                for (int i = 0; i < envPairs.length; i++) {
                    envArgs[i * 2] = "-e";
                    envArgs[i * 2 + 1] = envPairs[i].trim();
                }
                runCmd = new String[baseCmd.length + envArgs.length + 1];
                System.arraycopy(baseCmd, 0, runCmd, 0, baseCmd.length);
                System.arraycopy(envArgs, 0, runCmd, baseCmd.length, envArgs.length);
                runCmd[runCmd.length - 1] = imageName;
            } else {
                runCmd = new String[]{"docker", "run", "-d",
                        "--name", containerName,
                        "--network", "portalcore_default",
                        "-p", hostPort + ":" + containerPort,
                        imageName};
            }

            String containerId = execCommand(runCmd).trim();
            appendLog(deployLog, "Container started: " + containerId.substring(0, Math.min(12, containerId.length())));

            // Step 5: Update records
            installed.setContainerId(containerId.length() > 12 ? containerId.substring(0, 12) : containerId);
            installed.setContainerPort(hostPort);
            installed.setDeployStatus("RUNNING");
            installed.setDeployLog(deployLog.toString());
            installed.setDeployedAt(LocalDateTime.now());

            // Update application URL
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
        InstalledApp installed = installedAppRepository.findById(installedAppId)
                .orElseThrow(() -> new RuntimeException("InstalledApp not found: " + installedAppId));

        if (installed.getContainerName() != null) {
            try {
                stopContainerIfExists(installed.getContainerName());
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
        InstalledApp installed = installedAppRepository.findById(installedAppId)
                .orElseThrow(() -> new RuntimeException("InstalledApp not found: " + installedAppId));

        boolean containerRunning = false;
        if (installed.getContainerName() != null) {
            try {
                String status = execCommand("docker", "inspect", "-f", "{{.State.Running}}", installed.getContainerName());
                containerRunning = "true".equals(status.trim());
            } catch (Exception e) {
                containerRunning = false;
            }
        }

        return Map.of(
                "id", installed.getId(),
                "deployStatus", installed.getDeployStatus() != null ? installed.getDeployStatus() : "PENDING",
                "containerRunning", containerRunning,
                "containerName", installed.getContainerName() != null ? installed.getContainerName() : "",
                "containerPort", installed.getContainerPort() != null ? installed.getContainerPort() : 0,
                "deployLog", installed.getDeployLog() != null ? installed.getDeployLog() : ""
        );
    }

    @SuppressWarnings("unchecked")
    private void readAndApplyManifest(PortalApp app, Path manifestPath) throws IOException {
        ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());
        Map<String, Object> manifest = yamlMapper.readValue(manifestPath.toFile(), Map.class);

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
        // Also update basic fields if present
        if (manifest.containsKey("name") && (app.getName() == null || app.getName().isBlank())) {
            app.setName((String) manifest.get("name"));
        }
        if (manifest.containsKey("version")) {
            app.setVersion((String) manifest.get("version"));
        }
    }

    private void stopContainerIfExists(String containerName) {
        try {
            execCommand("docker", "stop", containerName);
        } catch (Exception ignored) {}
        try {
            execCommand("docker", "rm", "-f", containerName);
        } catch (Exception ignored) {}
    }

    private int findAvailablePort(int startPort) {
        // Simple approach: try ports starting from startPort
        for (int port = startPort; port < startPort + 100; port++) {
            try {
                var socket = new java.net.ServerSocket(port);
                socket.close();
                return port;
            } catch (Exception ignored) {}
        }
        return startPort;
    }

    private String execCommand(String... command) {
        try {
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            String output = new String(process.getInputStream().readAllBytes());
            boolean finished = process.waitFor(300, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new RuntimeException("Command timed out: " + String.join(" ", command));
            }
            if (process.exitValue() != 0) {
                throw new RuntimeException("Command failed (exit " + process.exitValue() + "): " + output);
            }
            return output;
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Command execution failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    private void updateDeployStatus(String installedAppId, String status, String log) {
        installedAppRepository.findById(installedAppId).ifPresent(installed -> {
            installed.setDeployStatus(status);
            installed.setDeployLog(log);
            installedAppRepository.save(installed);
        });
    }

    private void appendLog(StringBuilder sb, String message) {
        sb.append("[").append(LocalDateTime.now().toString().substring(0, 19)).append("] ").append(message).append("\n");
        log.info("Deploy: {}", message);
    }
}

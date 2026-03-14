package de.portalcore.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

/**
 * Kapselt Docker-CLI-Operationen: Pull, Build, Run, Stop, Status-Abfrage.
 */
@Service
public class DockerContainerService {

    private static final Logger log = LoggerFactory.getLogger(DockerContainerService.class);
    private static final int COMMAND_TIMEOUT_SECONDS = 300;
    private static final Pattern SAFE_ENV_KEY = Pattern.compile("^[A-Za-z_][A-Za-z0-9_]*$");
    private static final Pattern SAFE_NAME = Pattern.compile("^[a-zA-Z0-9][a-zA-Z0-9._-]*$");

    public void pullImage(String imageName) {
        executeCommand("docker", "pull", imageName);
    }

    public void buildImage(String imageName, String dockerfilePath, String contextPath) {
        executeCommand("docker", "build", "-t", imageName, "-f", dockerfilePath, contextPath);
    }

    public String startContainer(String containerName, String imageName, int hostPort,
                                  int containerPort, String network, String envVars) {
        List<String> cmd = new ArrayList<>(Arrays.asList(
                "docker", "run", "-d",
                "--name", containerName,
                "--network", network,
                "-p", hostPort + ":" + containerPort));

        if (envVars != null && !envVars.isBlank()) {
            for (String envPair : envVars.split(",")) {
                String trimmed = envPair.trim();
                validateEnvVar(trimmed);
                cmd.add("-e");
                cmd.add(trimmed);
            }
        }
        cmd.add(imageName);

        return executeCommand(cmd.toArray(String[]::new)).trim();
    }

    public void stopAndRemove(String containerName) {
        try {
            executeCommand("docker", "stop", containerName);
        } catch (Exception e) {
            log.debug("Container '{}' konnte nicht gestoppt werden: {}", containerName, e.getMessage());
        }
        try {
            executeCommand("docker", "rm", "-f", containerName);
        } catch (Exception e) {
            log.debug("Container '{}' konnte nicht entfernt werden: {}", containerName, e.getMessage());
        }
    }

    public boolean isContainerRunning(String containerName) {
        try {
            String status = executeCommand("docker", "inspect", "-f", "{{.State.Running}}", containerName);
            return "true".equals(status.trim());
        } catch (Exception e) {
            return false;
        }
    }

    public int findAvailablePort(int startPort) {
        for (int port = startPort; port < startPort + 100; port++) {
            try (var socket = new java.net.ServerSocket(port)) {
                return port;
            } catch (Exception e) {
                log.debug("Port {} nicht verfuegbar: {}", port, e.getMessage());
            }
        }
        throw new IllegalStateException(
                "Kein freier Port im Bereich " + startPort + "-" + (startPort + 99) + " gefunden");
    }

    public void cloneRepository(String repositoryUrl, String targetDir) {
        validateRepositoryUrl(repositoryUrl);
        executeCommand("git", "clone", "--depth", "1", repositoryUrl, targetDir);
    }

    public void removeDirectory(String path) {
        validatePathWithinWorkspace(path);
        executeCommand("rm", "-rf", path);
    }

    private void validateEnvVar(String envPair) {
        int eqIdx = envPair.indexOf('=');
        if (eqIdx <= 0) {
            throw new IllegalArgumentException("Ungueltige Umgebungsvariable: " + envPair);
        }
        String key = envPair.substring(0, eqIdx);
        if (!SAFE_ENV_KEY.matcher(key).matches()) {
            throw new IllegalArgumentException("Ungueltiger Variablenname: " + key);
        }
    }

    private void validateRepositoryUrl(String url) {
        if (url == null || url.isBlank()) {
            throw new IllegalArgumentException("Repository-URL darf nicht leer sein");
        }
        boolean isAllowed = url.startsWith("https://") || url.startsWith("http://")
                || url.startsWith("git@") || url.startsWith("ssh://");
        if (!isAllowed) {
            throw new IllegalArgumentException("Nicht unterstuetztes URL-Schema: " + url);
        }
    }

    private void validatePathWithinWorkspace(String path) {
        Path resolved = Path.of(path).toAbsolutePath().normalize();
        Path workspace = Path.of("/tmp/portal-deployments").toAbsolutePath().normalize();
        if (!resolved.startsWith(workspace)) {
            throw new SecurityException("Pfad-Zugriff ausserhalb des Arbeitsverzeichnisses: " + path);
        }
    }

    private String executeCommand(String... command) {
        try {
            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);
            Process process = pb.start();
            String output = new String(process.getInputStream().readAllBytes());
            boolean finished = process.waitFor(COMMAND_TIMEOUT_SECONDS, TimeUnit.SECONDS);
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
}

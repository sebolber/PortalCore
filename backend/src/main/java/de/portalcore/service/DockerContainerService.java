package de.portalcore.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Kapselt Docker-CLI-Operationen: Pull, Build, Run, Stop, Status-Abfrage.
 */
@Service
public class DockerContainerService {

    private static final Logger log = LoggerFactory.getLogger(DockerContainerService.class);
    private static final int COMMAND_TIMEOUT_SECONDS = 300;

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
                cmd.add("-e");
                cmd.add(envPair.trim());
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
        executeCommand("git", "clone", "--depth", "1", repositoryUrl, targetDir);
    }

    public void removeDirectory(String path) {
        executeCommand("rm", "-rf", path);
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

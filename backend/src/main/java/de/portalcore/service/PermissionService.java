package de.portalcore.service;

import de.portalcore.entity.Berechtigung;
import de.portalcore.repository.BerechtigungRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class PermissionService {

    private final BerechtigungRepository berechtigungRepository;

    public PermissionService(BerechtigungRepository berechtigungRepository) {
        this.berechtigungRepository = berechtigungRepository;
    }

    public List<Berechtigung> listPermissions(String appId) {
        if (appId != null && !appId.isBlank()) {
            return berechtigungRepository.findByAppId(appId);
        }
        return berechtigungRepository.findAll();
    }
}

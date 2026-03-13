package de.portalcore.service;

import de.portalcore.entity.PortalTheme;
import de.portalcore.repository.PortalThemeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class ThemeService {

    private final PortalThemeRepository themeRepository;

    public ThemeService(PortalThemeRepository themeRepository) {
        this.themeRepository = themeRepository;
    }

    public PortalTheme getTheme(String tenantId) {
        if (tenantId != null && !tenantId.isBlank()) {
            return themeRepository.findByTenantId(tenantId)
                    .orElseGet(this::getGlobalTheme);
        }
        return getGlobalTheme();
    }

    public PortalTheme getGlobalTheme() {
        return themeRepository.findByTenantIdIsNull()
                .orElseThrow(() -> new EntityNotFoundException("Kein globales Theme gefunden"));
    }

    @Transactional
    public PortalTheme updateTheme(String tenantId, PortalTheme updated, String userId) {
        PortalTheme existing;
        if (tenantId != null && !tenantId.isBlank()) {
            existing = themeRepository.findByTenantId(tenantId).orElse(null);
            if (existing == null) {
                updated.setId("theme-" + UUID.randomUUID().toString().substring(0, 8));
                updated.setTenantId(tenantId);
                updated.setLastModifiedBy(userId);
                return themeRepository.save(updated);
            }
        } else {
            existing = getGlobalTheme();
        }

        existing.setPortalTitle(updated.getPortalTitle());
        existing.setPortalIconInitials(updated.getPortalIconInitials());
        existing.setPortalIconUrl(updated.getPortalIconUrl());
        existing.setPrimaryColor(updated.getPrimaryColor());
        existing.setPrimaryDark(updated.getPrimaryDark());
        existing.setPrimaryLight(updated.getPrimaryLight());
        existing.setPrimaryContrast(updated.getPrimaryContrast());
        existing.setSecondaryColor(updated.getSecondaryColor());
        existing.setSecondaryDark(updated.getSecondaryDark());
        existing.setSecondaryLight(updated.getSecondaryLight());
        existing.setSecondaryContrast(updated.getSecondaryContrast());
        existing.setFontFamily(updated.getFontFamily());
        existing.setFontFamilyHeading(updated.getFontFamilyHeading());
        existing.setFontColor(updated.getFontColor());
        existing.setFontColorLight(updated.getFontColorLight());
        existing.setLastModifiedBy(userId);

        return themeRepository.save(existing);
    }
}

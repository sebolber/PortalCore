package de.portalcore.config;

import de.portalcore.entity.PortalUser;
import de.portalcore.repository.PortalUserRepository;
import de.portalcore.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class SecurityHelper {

    private final PortalUserRepository portalUserRepository;
    private final AuthService authService;

    public SecurityHelper(PortalUserRepository portalUserRepository, AuthService authService) {
        this.portalUserRepository = portalUserRepository;
        this.authService = authService;
    }

    public JwtAuthenticationFilter.AuthDetails getAuthDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof JwtAuthenticationFilter.AuthDetails details) {
            return details;
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Nicht authentifiziert");
    }

    public String getCurrentUserId() {
        return getAuthDetails().userId();
    }

    public String getCurrentTenantId() {
        return getAuthDetails().tenantId();
    }

    public boolean isSuperAdmin() {
        String userId = getCurrentUserId();
        return portalUserRepository.findById(userId)
                .map(PortalUser::isSuperAdmin)
                .orElse(false);
    }

    public void requireSuperAdmin() {
        if (!isSuperAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Diese Aktion erfordert Administratorrechte.");
        }
    }

    public void requireBerechtigung(String useCase, String typ) {
        String userId = getCurrentUserId();
        if (isSuperAdmin()) {
            return;
        }
        if (!authService.hatBerechtigung(userId, useCase, typ)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Keine Berechtigung fuer diese Aktion.");
        }
    }

    public void requireTenantAccess(String tenantId) {
        if (tenantId == null) {
            return;
        }
        String currentTenantId = getCurrentTenantId();
        if (isSuperAdmin()) {
            return;
        }
        if (!tenantId.equals(currentTenantId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Kein Zugriff auf diesen Mandanten.");
        }
    }
}

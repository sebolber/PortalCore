package de.portalcore.controller;

import de.portalcore.config.JwtAuthenticationFilter;
import de.portalcore.entity.PortalTheme;
import de.portalcore.service.ThemeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/theme")
public class ThemeController {

    private final ThemeService themeService;

    public ThemeController(ThemeService themeService) {
        this.themeService = themeService;
    }

    @GetMapping
    public ResponseEntity<PortalTheme> getTheme(@RequestParam(required = false) String tenantId) {
        return ResponseEntity.ok(themeService.getTheme(tenantId));
    }

    @PutMapping
    public ResponseEntity<PortalTheme> updateTheme(
            @RequestParam(required = false) String tenantId,
            @RequestBody PortalTheme theme) {
        return ResponseEntity.ok(themeService.updateTheme(tenantId, theme, getCurrentUserId()));
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getDetails() instanceof JwtAuthenticationFilter.AuthDetails details) {
            return details.userId();
        }
        return "system";
    }
}

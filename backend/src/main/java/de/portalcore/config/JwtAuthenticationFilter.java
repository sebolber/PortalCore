package de.portalcore.config;

import de.portalcore.service.AuthService;
import de.portalcore.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;
    private final AuthService authService;

    public JwtAuthenticationFilter(JwtService jwtService, AuthService authService) {
        this.jwtService = jwtService;
        this.authService = authService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            if (!jwtService.isTokenValid(token)) {
                log.debug("Token ungueltig oder abgelaufen - lasse SecurityFilterChain entscheiden");
                filterChain.doFilter(request, response);
                return;
            }

            Claims claims = jwtService.parseToken(token);
            String sessionId = claims.getId();

            // Session-Validierung: ungueltige Session ablehnen
            if (sessionId != null && !authService.isSessionActive(sessionId)) {
                log.debug("Session ungueltig oder abgelaufen - lasse SecurityFilterChain entscheiden");
                filterChain.doFilter(request, response);
                return;
            }

            String userId = claims.getSubject();
            String tenantId = claims.get("tenantId", String.class);

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    userId,
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_USER"))
            );
            auth.setDetails(new AuthDetails(userId, tenantId, sessionId, claims.get("email", String.class)));
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (JwtException e) {
            log.warn("JWT-Validierung fehlgeschlagen: {}, remoteAddr={}", e.getClass().getSimpleName(), request.getRemoteAddr());
        } catch (Exception e) {
            log.warn("JWT-Authentifizierung fehlgeschlagen: {}", e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
    public record AuthDetails(String userId, String tenantId, String sessionId, String email) {}
}

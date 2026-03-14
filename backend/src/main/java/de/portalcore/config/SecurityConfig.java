package de.portalcore.config;

import de.portalcore.service.SetupService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final SetupService setupService;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter, @Lazy SetupService setupService) {
        this.jwtFilter = jwtFilter;
        this.setupService = setupService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF deaktiviert: stateless JWT-Auth ueber Authorization-Header (kein Cookie)
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> {})
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers
                .contentTypeOptions(ct -> {})
                .frameOptions(fo -> fo.deny())
                .xssProtection(xss -> {})
                .referrerPolicy(rp -> rp.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                .permissionsPolicy(pp -> pp.policy("camera=(), microphone=(), geolocation=()"))
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) -> {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\":\"Nicht authentifiziert\",\"status\":401}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Auth-Endpunkte: oeffentlich
                .requestMatchers("/auth/login", "/auth/verify").permitAll()
                // Setup-Endpunkte: nur vor der Initialisierung erreichbar
                .requestMatchers("/setup/**").access((authentication, context) ->
                        new org.springframework.security.authorization.AuthorizationDecision(
                                !setupService.istInitialisiert()))
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Actuator: nur Health-Endpunkt oeffentlich
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/actuator/**").denyAll()
                // Fehlerseite muss erreichbar sein
                .requestMatchers("/error").permitAll()
                // Alle anderen Endpunkte: authentifiziert
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}

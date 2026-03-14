package de.portalcore.service;

import de.portalcore.entity.GruppenBerechtigung;
import de.portalcore.entity.PortalUser;
import de.portalcore.entity.Tenant;
import de.portalcore.entity.UserTenant;
import de.portalcore.enums.UserStatus;
import de.portalcore.repository.AuthSessionRepository;
import de.portalcore.repository.GruppenBerechtigungRepository;
import de.portalcore.repository.PortalUserRepository;
import de.portalcore.repository.UserTenantRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private PortalUserRepository userRepository;
    @Mock
    private UserTenantRepository userTenantRepository;
    @Mock
    private GruppenBerechtigungRepository berechtigungRepository;
    @Mock
    private AuthSessionRepository sessionRepository;
    @Mock
    private OtpService otpService;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuditService auditService;

    private AuthService authService;

    private PortalUser testUser;
    private Tenant testTenant;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, userTenantRepository,
                berechtigungRepository, sessionRepository, otpService, jwtService, auditService);

        testTenant = Tenant.builder().id("tenant-1").name("Test Mandant").shortName("TM").build();
        testUser = PortalUser.builder()
                .id("user-1")
                .vorname("Max")
                .nachname("Mustermann")
                .email("max@example.com")
                .initialen("MM")
                .status(UserStatus.AKTIV)
                .tenant(testTenant)
                .superAdmin(false)
                .build();
    }

    // --- requestOtp ---

    @Test
    void should_SendOtp_When_UserExists() {
        when(userRepository.findByEmail("max@example.com")).thenReturn(Optional.of(testUser));

        Map<String, Object> result = authService.requestOtp("max@example.com", "127.0.0.1");

        verify(otpService).generateAndSendOtp("max@example.com", "127.0.0.1");
        assertThat(result).containsKey("message");
    }

    @Test
    void should_NotRevealNonExistence_When_UserNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        Map<String, Object> result = authService.requestOtp("unknown@example.com", "127.0.0.1");

        verify(otpService, never()).generateAndSendOtp(any(), any());
        assertThat(result.get("message").toString()).contains("Falls ein Konto");
    }

    @Test
    void should_NotSendOtp_When_UserIsGesperrt() {
        testUser.setStatus(UserStatus.GESPERRT);
        when(userRepository.findByEmail("max@example.com")).thenReturn(Optional.of(testUser));

        Map<String, Object> result = authService.requestOtp("max@example.com", "127.0.0.1");

        verify(otpService, never()).generateAndSendOtp(any(), any());
        assertThat(result.get("message").toString()).contains("Falls ein Konto");
    }

    // --- verifyOtp ---

    @Test
    void should_ReturnToken_When_OtpIsValid() {
        when(otpService.verifyOtp("max@example.com", "123456")).thenReturn(true);
        when(userRepository.findByEmail("max@example.com")).thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(eq("user-1"), eq("max@example.com"), eq("tenant-1"), any()))
                .thenReturn("jwt-token-123");
        when(jwtService.getExpirationHours()).thenReturn(8);

        UserTenant defaultTenant = UserTenant.builder()
                .userId("user-1").tenantId("tenant-1").istStandard(true).aktiv(true)
                .tenant(testTenant).build();
        when(userTenantRepository.findByUserIdAndIstStandardTrue("user-1"))
                .thenReturn(Optional.of(defaultTenant));
        when(userTenantRepository.findByUserId("user-1")).thenReturn(List.of(defaultTenant));
        when(berechtigungRepository.findByUserId("user-1")).thenReturn(List.of());

        Map<String, Object> result = authService.verifyOtp("max@example.com", "123456", null,
                "127.0.0.1", "TestAgent");

        assertThat(result).containsEntry("token", "jwt-token-123");
        assertThat(result).containsKey("user");
        assertThat(result).containsEntry("tenantId", "tenant-1");
        verify(sessionRepository).save(any());
        verify(userRepository).save(testUser);
    }

    @Test
    void should_ThrowException_When_OtpIsInvalid() {
        when(otpService.verifyOtp("max@example.com", "wrong")).thenReturn(false);

        assertThatThrownBy(() -> authService.verifyOtp("max@example.com", "wrong", null,
                "127.0.0.1", "TestAgent"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Ungueltiger");
    }

    @Test
    void should_ThrowException_When_UserGesperrtDuringVerify() {
        testUser.setStatus(UserStatus.GESPERRT);
        when(otpService.verifyOtp("max@example.com", "123456")).thenReturn(true);
        when(userRepository.findByEmail("max@example.com")).thenReturn(Optional.of(testUser));

        assertThatThrownBy(() -> authService.verifyOtp("max@example.com", "123456", null,
                "127.0.0.1", "TestAgent"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("gesperrt");
    }

    @Test
    void should_UseRequestedTenant_When_ProvidedAndAuthorized() {
        when(otpService.verifyOtp("max@example.com", "123456")).thenReturn(true);
        when(userRepository.findByEmail("max@example.com")).thenReturn(Optional.of(testUser));
        when(userTenantRepository.existsByUserIdAndTenantId("user-1", "tenant-2")).thenReturn(true);
        when(jwtService.generateToken(eq("user-1"), eq("max@example.com"), eq("tenant-2"), any()))
                .thenReturn("jwt-token-t2");
        when(jwtService.getExpirationHours()).thenReturn(8);
        when(userTenantRepository.findByUserId("user-1")).thenReturn(List.of());
        when(berechtigungRepository.findByUserId("user-1")).thenReturn(List.of());

        Map<String, Object> result = authService.verifyOtp("max@example.com", "123456", "tenant-2",
                "127.0.0.1", "TestAgent");

        assertThat(result).containsEntry("tenantId", "tenant-2");
    }

    @Test
    void should_RejectTenant_When_UserNotAssigned() {
        when(otpService.verifyOtp("max@example.com", "123456")).thenReturn(true);
        when(userRepository.findByEmail("max@example.com")).thenReturn(Optional.of(testUser));
        when(userTenantRepository.existsByUserIdAndTenantId("user-1", "tenant-999")).thenReturn(false);

        assertThatThrownBy(() -> authService.verifyOtp("max@example.com", "123456", "tenant-999",
                "127.0.0.1", "TestAgent"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Mandanten nicht zugeordnet");
    }

    // --- hatBerechtigung ---

    @Test
    void should_ReturnTrue_When_UserHasSchreibenPermission() {
        GruppenBerechtigung gb = GruppenBerechtigung.builder()
                .id("gb-1").useCase("appstore-admin").useCaseLabel("Appstore Admin")
                .anzeigen(true).lesen(true).schreiben(true).loeschen(false)
                .build();
        when(berechtigungRepository.findByUserIdAndUseCase("user-1", "appstore-admin"))
                .thenReturn(List.of(gb));

        assertThat(authService.hatBerechtigung("user-1", "appstore-admin", "schreiben")).isTrue();
    }

    @Test
    void should_ReturnFalse_When_UserLacksPermission() {
        GruppenBerechtigung gb = GruppenBerechtigung.builder()
                .id("gb-1").useCase("appstore-admin").useCaseLabel("Appstore Admin")
                .anzeigen(true).lesen(true).schreiben(false).loeschen(false)
                .build();
        when(berechtigungRepository.findByUserIdAndUseCase("user-1", "appstore-admin"))
                .thenReturn(List.of(gb));

        assertThat(authService.hatBerechtigung("user-1", "appstore-admin", "schreiben")).isFalse();
    }

    @Test
    void should_ReturnFalse_When_NoPermissionsExist() {
        when(berechtigungRepository.findByUserIdAndUseCase("user-1", "nonexistent"))
                .thenReturn(List.of());

        assertThat(authService.hatBerechtigung("user-1", "nonexistent", "lesen")).isFalse();
    }

    @Test
    void should_ReturnFalse_When_UnknownPermissionType() {
        GruppenBerechtigung gb = GruppenBerechtigung.builder()
                .id("gb-1").useCase("test").useCaseLabel("Test")
                .anzeigen(true).lesen(true).schreiben(true).loeschen(true)
                .build();
        when(berechtigungRepository.findByUserIdAndUseCase("user-1", "test"))
                .thenReturn(List.of(gb));

        assertThat(authService.hatBerechtigung("user-1", "test", "unknown-type")).isFalse();
    }

    // --- buildBerechtigungList ---

    @Test
    void should_MapPermissionsCorrectly_When_BerechtigungenExist() {
        GruppenBerechtigung gb = GruppenBerechtigung.builder()
                .id("gb-1").useCase("benutzerverwaltung").useCaseLabel("Benutzerverwaltung")
                .anzeigen(true).lesen(true).schreiben(false).loeschen(false)
                .build();
        when(berechtigungRepository.findByUserId("user-1")).thenReturn(List.of(gb));

        List<Map<String, Object>> result = authService.buildBerechtigungList("user-1");

        assertThat(result).hasSize(1);
        Map<String, Object> perm = result.get(0);
        assertThat(perm).containsEntry("useCase", "benutzerverwaltung");
        assertThat(perm).containsEntry("label", "Benutzerverwaltung");
        assertThat(perm).containsEntry("lesen", true);
        assertThat(perm).containsEntry("schreiben", false);
    }

    // --- buildTenantList ---

    @Test
    void should_FilterInactiveTenants_When_BuildingTenantList() {
        UserTenant active = UserTenant.builder()
                .userId("user-1").tenantId("t-1").aktiv(true)
                .tenant(Tenant.builder().id("t-1").name("Aktiv").shortName("A").build())
                .build();
        UserTenant inactive = UserTenant.builder()
                .userId("user-1").tenantId("t-2").aktiv(false)
                .tenant(Tenant.builder().id("t-2").name("Inaktiv").shortName("I").build())
                .build();

        when(userTenantRepository.findByUserId("user-1")).thenReturn(List.of(active, inactive));

        List<Map<String, String>> result = authService.buildTenantList("user-1");

        assertThat(result).hasSize(1);
        assertThat(result.get(0)).containsEntry("name", "Aktiv");
    }

    // --- logout ---

    @Test
    void should_DeactivateSession_When_LoggingOut() {
        var session = de.portalcore.entity.AuthSession.builder()
                .id("session-1").userId("user-1").tenantId("tenant-1")
                .aktiv(true).gueltigBis(java.time.LocalDateTime.now().plusHours(8))
                .build();
        when(sessionRepository.findById("session-1")).thenReturn(Optional.of(session));

        authService.logout("session-1", "user-1", "tenant-1");

        assertThat(session.isAktiv()).isFalse();
        verify(sessionRepository).save(session);
    }

    // --- switchTenant ---

    @Test
    void should_IssueNewToken_When_SwitchingTenant() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(testUser));
        when(userTenantRepository.existsByUserIdAndTenantId("user-1", "tenant-2")).thenReturn(true);
        when(jwtService.generateToken(eq("user-1"), eq("max@example.com"), eq("tenant-2"), any()))
                .thenReturn("new-token");
        when(jwtService.getExpirationHours()).thenReturn(8);

        Map<String, Object> result = authService.switchTenant("user-1", "tenant-2",
                "127.0.0.1", "TestAgent");

        assertThat(result).containsEntry("token", "new-token");
        assertThat(result).containsEntry("tenantId", "tenant-2");
        verify(sessionRepository).save(any());
    }

    @Test
    void should_RejectSwitch_When_UserNotAssignedToTenant() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(testUser));
        when(userTenantRepository.existsByUserIdAndTenantId("user-1", "tenant-999")).thenReturn(false);

        assertThatThrownBy(() -> authService.switchTenant("user-1", "tenant-999",
                "127.0.0.1", "TestAgent"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void should_ThrowException_When_UserNotFoundOnSwitch() {
        when(userRepository.findById("user-999")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.switchTenant("user-999", "tenant-1",
                "127.0.0.1", "TestAgent"))
                .isInstanceOf(EntityNotFoundException.class);
    }
}

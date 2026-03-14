package de.portalcore.service;

import de.portalcore.entity.OtpCode;
import de.portalcore.repository.OtpCodeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock
    private OtpCodeRepository otpCodeRepository;

    @Mock
    private EmailConfigService emailConfigService;

    private OtpService otpService;

    @BeforeEach
    void setUp() throws Exception {
        otpService = new OtpService(otpCodeRepository, emailConfigService, Optional.empty());
        setField(otpService, "otpLengthDefault", 6);
        setField(otpService, "expirationMinutesDefault", 10);
        setField(otpService, "maxAttemptsDefault", 5);
        setField(otpService, "rateLimitPerHourDefault", 5);
        setField(otpService, "sendMailDefault", true);
    }

    @Test
    void should_GenerateOtp_When_WithinRateLimit() {
        when(otpCodeRepository.countRecentByEmail(eq("test@example.com"), any())).thenReturn(0L);
        when(emailConfigService.getIntParam(eq("portal.auth.otp.length"), eq(6))).thenReturn(6);
        when(emailConfigService.getIntParam(eq("portal.auth.otp.expiration-minutes"), eq(10))).thenReturn(10);
        when(emailConfigService.getIntParam(eq("portal.auth.otp.rate-limit"), eq(5))).thenReturn(5);
        when(emailConfigService.isEmailAuthEnabled()).thenReturn(false);

        String otpId = otpService.generateAndSendOtp("test@example.com", "127.0.0.1");

        assertThat(otpId).isNotBlank();

        ArgumentCaptor<OtpCode> captor = ArgumentCaptor.forClass(OtpCode.class);
        verify(otpCodeRepository).save(captor.capture());

        OtpCode saved = captor.getValue();
        assertThat(saved.getEmail()).isEqualTo("test@example.com");
        assertThat(saved.getCode()).hasSize(6);
        assertThat(saved.getCode()).matches("\\d{6}");
        assertThat(saved.isVerwendet()).isFalse();
        assertThat(saved.getVersuche()).isZero();
    }

    @Test
    void should_ThrowException_When_RateLimitExceeded() {
        when(otpCodeRepository.countRecentByEmail(eq("test@example.com"), any())).thenReturn(5L);
        when(emailConfigService.getIntParam(eq("portal.auth.otp.rate-limit"), eq(5))).thenReturn(5);

        assertThatThrownBy(() -> otpService.generateAndSendOtp("test@example.com", "127.0.0.1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Zu viele Anmeldeversuche");
    }

    @Test
    void should_VerifyOtp_When_CodeIsCorrect() {
        OtpCode otpCode = OtpCode.builder()
                .id("otp-1")
                .email("test@example.com")
                .code("123456")
                .erstelltAm(LocalDateTime.now())
                .gueltigBis(LocalDateTime.now().plusMinutes(10))
                .verwendet(false)
                .versuche(0)
                .build();

        when(otpCodeRepository.findTopByEmailAndVerwendetFalseAndGueltigBisAfterOrderByErstelltAmDesc(
                eq("test@example.com"), any())).thenReturn(Optional.of(otpCode));
        when(emailConfigService.getIntParam(eq("portal.auth.otp.max-attempts"), eq(5))).thenReturn(5);

        boolean result = otpService.verifyOtp("test@example.com", "123456");

        assertThat(result).isTrue();
        assertThat(otpCode.isVerwendet()).isTrue();
        verify(otpCodeRepository).save(otpCode);
    }

    @Test
    void should_RejectOtp_When_CodeIsWrong() {
        OtpCode otpCode = OtpCode.builder()
                .id("otp-1")
                .email("test@example.com")
                .code("123456")
                .erstelltAm(LocalDateTime.now())
                .gueltigBis(LocalDateTime.now().plusMinutes(10))
                .verwendet(false)
                .versuche(0)
                .build();

        when(otpCodeRepository.findTopByEmailAndVerwendetFalseAndGueltigBisAfterOrderByErstelltAmDesc(
                eq("test@example.com"), any())).thenReturn(Optional.of(otpCode));
        when(emailConfigService.getIntParam(eq("portal.auth.otp.max-attempts"), eq(5))).thenReturn(5);

        boolean result = otpService.verifyOtp("test@example.com", "999999");

        assertThat(result).isFalse();
        assertThat(otpCode.getVersuche()).isEqualTo(1);
        assertThat(otpCode.isVerwendet()).isFalse();
    }

    @Test
    void should_RejectOtp_When_MaxAttemptsReached() {
        OtpCode otpCode = OtpCode.builder()
                .id("otp-1")
                .email("test@example.com")
                .code("123456")
                .erstelltAm(LocalDateTime.now())
                .gueltigBis(LocalDateTime.now().plusMinutes(10))
                .verwendet(false)
                .versuche(5)
                .build();

        when(otpCodeRepository.findTopByEmailAndVerwendetFalseAndGueltigBisAfterOrderByErstelltAmDesc(
                eq("test@example.com"), any())).thenReturn(Optional.of(otpCode));
        when(emailConfigService.getIntParam(eq("portal.auth.otp.max-attempts"), eq(5))).thenReturn(5);

        boolean result = otpService.verifyOtp("test@example.com", "123456");

        assertThat(result).isFalse();
        assertThat(otpCode.isVerwendet()).isTrue();
    }

    @Test
    void should_ReturnFalse_When_NoOtpExists() {
        when(otpCodeRepository.findTopByEmailAndVerwendetFalseAndGueltigBisAfterOrderByErstelltAmDesc(
                eq("test@example.com"), any())).thenReturn(Optional.empty());

        boolean result = otpService.verifyOtp("test@example.com", "123456");

        assertThat(result).isFalse();
    }

    @Test
    void should_CleanupExpiredCodes() {
        otpService.cleanupExpired();

        verify(otpCodeRepository).deleteExpired(any(LocalDateTime.class));
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}

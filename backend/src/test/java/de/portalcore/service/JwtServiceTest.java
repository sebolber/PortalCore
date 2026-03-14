package de.portalcore.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() throws Exception {
        jwtService = new JwtService();
        setField(jwtService, "secret", "TestSecretKeyThatIsLongEnoughForHmacSha256!!");
        setField(jwtService, "expirationHours", 8);
    }

    @Test
    void should_GenerateValidToken_When_ValidInputProvided() {
        String token = jwtService.generateToken("user-1", "test@example.com", "tenant-1", "session-1");

        assertThat(token).isNotBlank();
        assertThat(jwtService.isTokenValid(token)).isTrue();
    }

    @Test
    void should_ExtractUserId_When_TokenParsed() {
        String token = jwtService.generateToken("user-1", "test@example.com", "tenant-1", "session-1");

        assertThat(jwtService.getUserId(token)).isEqualTo("user-1");
    }

    @Test
    void should_ExtractEmail_When_TokenParsed() {
        String token = jwtService.generateToken("user-1", "test@example.com", "tenant-1", "session-1");

        assertThat(jwtService.getEmail(token)).isEqualTo("test@example.com");
    }

    @Test
    void should_ExtractTenantId_When_TokenParsed() {
        String token = jwtService.generateToken("user-1", "test@example.com", "tenant-1", "session-1");

        assertThat(jwtService.getTenantId(token)).isEqualTo("tenant-1");
    }

    @Test
    void should_ExtractSessionId_When_TokenParsed() {
        String token = jwtService.generateToken("user-1", "test@example.com", "tenant-1", "session-1");

        assertThat(jwtService.getSessionId(token)).isEqualTo("session-1");
    }

    @Test
    void should_ReturnFalse_When_TokenTampered() {
        String token = jwtService.generateToken("user-1", "test@example.com", "tenant-1", "session-1");
        String tampered = token.substring(0, token.length() - 5) + "XXXXX";

        assertThat(jwtService.isTokenValid(tampered)).isFalse();
    }

    @Test
    void should_ReturnFalse_When_TokenSignedWithDifferentKey() throws Exception {
        String token = jwtService.generateToken("user-1", "test@example.com", "tenant-1", "session-1");

        JwtService otherService = new JwtService();
        setField(otherService, "secret", "CompletelyDifferentSecretKeyForTesting!!");
        setField(otherService, "expirationHours", 8);

        assertThat(otherService.isTokenValid(token)).isFalse();
    }

    @Test
    void should_ReturnFalse_When_TokenExpired() throws Exception {
        JwtService expiredService = new JwtService();
        setField(expiredService, "secret", "TestSecretKeyThatIsLongEnoughForHmacSha256!!");
        setField(expiredService, "expirationHours", 0);

        String token = expiredService.generateToken("user-1", "test@example.com", "tenant-1", "session-1");

        assertThat(expiredService.isTokenValid(token)).isFalse();
    }

    @Test
    void should_ReturnFalse_When_TokenIsNull() {
        assertThat(jwtService.isTokenValid(null)).isFalse();
    }

    @Test
    void should_ReturnFalse_When_TokenIsEmpty() {
        assertThat(jwtService.isTokenValid("")).isFalse();
    }

    @Test
    void should_ReturnFalse_When_TokenIsGarbage() {
        assertThat(jwtService.isTokenValid("not.a.jwt.token")).isFalse();
    }

    @Test
    void should_ThrowException_When_ParsingInvalidToken() {
        assertThatThrownBy(() -> jwtService.parseToken("invalid-token"))
                .isInstanceOf(JwtException.class);
    }

    @Test
    void should_ReturnExpirationHours_When_Configured() {
        assertThat(jwtService.getExpirationHours()).isEqualTo(8);
    }

    private void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}

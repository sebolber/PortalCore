package de.portalcore.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    @Value("${portal.jwt.secret}")
    private String secret;

    @Value("${portal.jwt.expiration-hours:8}")
    private int expirationHours;

    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, Math.min(keyBytes.length, 32));
            return Keys.hmacShaKeyFor(padded);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String userId, String email, String tenantId, String sessionId) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + (long) expirationHours * 3600 * 1000);

        return Jwts.builder()
                .id(sessionId)
                .subject(userId)
                .claims(Map.of(
                        "email", email,
                        "tenantId", tenantId
                ))
                .issuedAt(now)
                .expiration(expiration)
                .signWith(getSigningKey())
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseToken(token);
            return claims.getExpiration().after(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUserId(String token) {
        return parseToken(token).getSubject();
    }

    public String getEmail(String token) {
        return parseToken(token).get("email", String.class);
    }

    public String getTenantId(String token) {
        return parseToken(token).get("tenantId", String.class);
    }

    public String getSessionId(String token) {
        return parseToken(token).getId();
    }

    public int getExpirationHours() {
        return expirationHours;
    }
}

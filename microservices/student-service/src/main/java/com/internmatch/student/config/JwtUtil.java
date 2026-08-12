package com.internmatch.student.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret:InternMatchSuperSecretKeyForJWTTokenGeneration2026SecureKeyWith256BitsLength}")
    private String secret;

    private SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, Math.min(keyBytes.length, 32));
            return Keys.hmacShaKeyFor(padded);
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public Claims extractClaims(String token) {
        if (token == null) return null;
        String cleanToken = token.trim();
        if (cleanToken.startsWith("Bearer ")) {
            cleanToken = cleanToken.substring(7).trim();
        }
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(cleanToken)
                    .getBody();
        } catch (Exception e) {
            return null;
        }
    }

    public boolean validateToken(String token) {
        Claims claims = extractClaims(token);
        return claims != null && claims.getExpiration() != null && claims.getExpiration().after(new Date());
    }

    public Integer extractUserId(String token) {
        Claims claims = extractClaims(token);
        if (claims == null) return null;
        Object userIdObj = claims.get("userId");
        if (userIdObj == null) userIdObj = claims.get("user_id");
        if (userIdObj instanceof Number) {
            return ((Number) userIdObj).intValue();
        }
        return null;
    }

    public String extractRole(String token) {
        Claims claims = extractClaims(token);
        return claims != null ? (String) claims.get("role") : null;
    }

    public String extractUsername(String token) {
        Claims claims = extractClaims(token);
        return claims != null ? claims.getSubject() : null;
    }
}

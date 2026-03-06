package br.umc.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    @Value("${app.jwt.reset-password-expiration-ms}")
    private long resetPasswordExpirationMs;

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String gerarToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", userDetails.getAuthorities()
                .stream()
                .map(Object::toString)
                .toList());
        return buildToken(claims, userDetails.getUsername(), expirationMs);
    }

    public String gerarTokenResetSenha() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    private String buildToken(Map<String, Object> extraClaims, String subject, long expirationTime) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(subject)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public String extrairEmail(String token) {
        return extrairClaim(token, Claims::getSubject);
    }

    public Date extrairExpiracao(String token) {
        return extrairClaim(token, Claims::getExpiration);
    }

    public <T> T extrairClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extrairTodosClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extrairTodosClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValido(String token, UserDetails userDetails) {
        try {
            final String email = extrairEmail(token);
            return email.equals(userDetails.getUsername()) && !isTokenExpirado(token);
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean isTokenExpirado(String token) {
        try {
            return extrairExpiracao(token).before(new Date());
        } catch (JwtException | IllegalArgumentException e) {
            return true;
        }
    }

    public boolean isTokenAssinadoValido(String token) {
        try {
            extrairTodosClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}

package br.umc.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    private static final int MAX_REQUESTS = 5;
    private static final long WINDOW_MS = 60_000; // 1 minuto

    private final ConcurrentHashMap<String, RateLimitBucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        String method = request.getMethod();
        return !("POST".equalsIgnoreCase(method) && "/auth/login".equals(path));
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String clientIp = getClientIp(request);
        RateLimitBucket bucket = buckets.compute(clientIp, (key, existing) -> {
            if (existing == null || existing.isExpired()) {
                return new RateLimitBucket();
            }
            return existing;
        });

        if (bucket.incrementAndCheck() > MAX_REQUESTS) {
            long retryAfterSeconds = (bucket.getExpirationTime() - Instant.now().toEpochMilli()) / 1000 + 1;
            log.warn("[RATE-LIMIT] Limite excedido: ip={} | tentativas={}", clientIp, bucket.getCount());

            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setHeader("Retry-After", String.valueOf(Math.max(1, retryAfterSeconds)));
            response.getWriter().write(
                    "{\"erro\":\"Muitas tentativas de login. Tente novamente em " + Math.max(1, retryAfterSeconds) + " segundos.\"}"
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class RateLimitBucket {
        private final long windowStart;
        private final AtomicInteger count;

        RateLimitBucket() {
            this.windowStart = Instant.now().toEpochMilli();
            this.count = new AtomicInteger(0);
        }

        int incrementAndCheck() {
            return count.incrementAndGet();
        }

        int getCount() {
            return count.get();
        }

        boolean isExpired() {
            return Instant.now().toEpochMilli() - windowStart > WINDOW_MS;
        }

        long getExpirationTime() {
            return windowStart + WINDOW_MS;
        }
    }
}

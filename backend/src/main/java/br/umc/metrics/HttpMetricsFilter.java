package br.umc.metrics;

import br.umc.audit.AuditContext;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Filtro que:
 *  1. Gera um requestId único por requisição para rastreabilidade nos logs
 *  2. Propaga IP e usuário autenticado para o AuditContext
 *  3. Registra métricas HTTP no MetricsService
 *  4. Popula o MDC do Logback com campos estruturados
 */
@Component
@Order(1)
public class HttpMetricsFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(HttpMetricsFilter.class);

    private final MetricsService metricsService;

    public HttpMetricsFilter(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String requestId = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        long inicio = System.currentTimeMillis();

        String ip = resolverIp(request);
        String uri = request.getRequestURI();
        String metodo = request.getMethod();

        MDC.put("requestId", requestId);
        MDC.put("ip", ip);
        MDC.put("uri", uri);
        MDC.put("metodo", metodo);

        AuditContext.setIp(ip);

        log.info("[HTTP-IN] requestId={} | metodo={} | uri={} | ip={} | queryString={}",
                requestId, metodo, uri, ip,
                request.getQueryString() != null ? request.getQueryString() : "-");

        try {
            filterChain.doFilter(request, response);
        } finally {
            long duracaoMs = System.currentTimeMillis() - inicio;
            int status = response.getStatus();

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String email = auth.getName();
                String perfil = auth.getAuthorities().stream()
                        .map(Object::toString)
                        .findFirst()
                        .orElse(null);
                AuditContext.setUsuarioEmail(email);
                AuditContext.setUsuarioPerfil(perfil);
                MDC.put("usuario", email);
            }

            metricsService.registrarRequisicaoHttp(metodo, uri, status, duracaoMs);

            log.info("[HTTP-OUT] requestId={} | metodo={} | uri={} | status={} | duracao={}ms | usuario={}",
                    requestId, metodo, uri, status, duracaoMs,
                    MDC.get("usuario") != null ? MDC.get("usuario") : "anonimo");

            MDC.clear();
            AuditContext.clear();
        }
    }

    private String resolverIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr();
    }
}

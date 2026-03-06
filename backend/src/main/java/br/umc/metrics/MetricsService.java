package br.umc.metrics;

import io.micrometer.core.instrument.*;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Serviço de métricas customizadas para exposição via Prometheus/Grafana.
 *
 * Métricas disponíveis:
 *  - app_operacoes_total{entidade, acao}          → contador por tipo de operação
 *  - app_erros_total{entidade, acao}              → contador de erros por operação
 *  - app_duracao_ms{entidade, acao}               → timer de duração de operações
 *  - app_logins_total                             → total de logins
 *  - app_logins_falhos_total                      → logins com credenciais inválidas
 *  - app_usuarios_ativos                          → gauge: usuários ativos (estimativa)
 *  - app_requisicoes_http_total{metodo, uri, status} → contador HTTP
 *  - app_requisicoes_http_duracao{metodo, uri}    → timer HTTP
 */
@Service
public class MetricsService {

    private final MeterRegistry registry;

    private final Counter loginsTotais;
    private final Counter loginsFalhos;
    private final AtomicLong usuariosAtivos = new AtomicLong(0);

    private final ConcurrentHashMap<String, Counter> contadoresOperacao = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Counter> contadoresErro = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Timer> timersOperacao = new ConcurrentHashMap<>();

    public MetricsService(MeterRegistry registry) {
        this.registry = registry;

        this.loginsTotais = Counter.builder("app_logins_total")
                .description("Total de tentativas de login")
                .register(registry);

        this.loginsFalhos = Counter.builder("app_logins_falhos_total")
                .description("Total de logins com credenciais inválidas")
                .register(registry);

        Gauge.builder("app_usuarios_ativos", usuariosAtivos, AtomicLong::doubleValue)
                .description("Estimativa de usuários ativos na sessão atual")
                .register(registry);
    }

    public void registrarOperacao(String entidade, String acao, long duracaoMs) {
        String chave = entidade + "." + acao;

        contadoresOperacao.computeIfAbsent(chave, k ->
                Counter.builder("app_operacoes_total")
                        .description("Total de operações realizadas por entidade e ação")
                        .tag("entidade", entidade)
                        .tag("acao", acao)
                        .register(registry)
        ).increment();

        timersOperacao.computeIfAbsent(chave, k ->
                Timer.builder("app_duracao_operacao")
                        .description("Duração das operações em milissegundos")
                        .tag("entidade", entidade)
                        .tag("acao", acao)
                        .register(registry)
        ).record(duracaoMs, TimeUnit.MILLISECONDS);
    }

    public void registrarErro(String entidade, String acao) {
        String chave = entidade + "." + acao;

        contadoresErro.computeIfAbsent(chave, k ->
                Counter.builder("app_erros_total")
                        .description("Total de erros por entidade e ação")
                        .tag("entidade", entidade)
                        .tag("acao", acao)
                        .register(registry)
        ).increment();
    }

    public void registrarLoginSucesso() {
        loginsTotais.increment();
        usuariosAtivos.incrementAndGet();
    }

    public void registrarLoginFalha() {
        loginsTotais.increment();
        loginsFalhos.increment();
    }

    public void registrarLogout() {
        long atual = usuariosAtivos.get();
        if (atual > 0) usuariosAtivos.decrementAndGet();
    }

    public void registrarRequisicaoHttp(String metodo, String uri, int statusCode, long duracaoMs) {
        String chaveContador = metodo + "." + uri + "." + statusCode;
        contadoresOperacao.computeIfAbsent("http." + chaveContador, k ->
                Counter.builder("app_requisicoes_http_total")
                        .description("Total de requisições HTTP por método, URI e status")
                        .tag("metodo", metodo)
                        .tag("uri", normalizarUri(uri))
                        .tag("status", String.valueOf(statusCode))
                        .register(registry)
        ).increment();

        String chaveTimer = metodo + "." + uri;
        timersOperacao.computeIfAbsent("http." + chaveTimer, k ->
                Timer.builder("app_requisicoes_http_duracao")
                        .description("Duração das requisições HTTP")
                        .tag("metodo", metodo)
                        .tag("uri", normalizarUri(uri))
                        .register(registry)
        ).record(duracaoMs, TimeUnit.MILLISECONDS);
    }

    private String normalizarUri(String uri) {
        if (uri == null) return "unknown";
        return uri.replaceAll("/\\d+", "/{id}");
    }
}

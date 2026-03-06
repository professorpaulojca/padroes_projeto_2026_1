package br.umc.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Configuração do executor assíncrono dedicado para auditoria.
 * Separa a thread pool de auditoria da thread pool geral para não
 * impactar a performance das operações principais.
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {

    private static final Logger log = LoggerFactory.getLogger(AsyncConfig.class);

    @Bean(name = "auditExecutor")
    public Executor auditExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("audit-");
        executor.setRejectedExecutionHandler((r, exec) ->
            log.error("[AUDIT] Fila de auditoria cheia! Registro descartado. Considere aumentar o pool.")
        );
        executor.initialize();
        return executor;
    }
}

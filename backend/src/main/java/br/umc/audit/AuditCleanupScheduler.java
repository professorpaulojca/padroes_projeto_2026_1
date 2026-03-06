package br.umc.audit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduler de limpeza automática dos logs de auditoria.
 * Executa toda noite à meia-noite e remove registros mais antigos
 * que app.audit.retencao-dias (padrão: 90 dias).
 */
@Component
public class AuditCleanupScheduler {

    private static final Logger log = LoggerFactory.getLogger(AuditCleanupScheduler.class);

    private final AuditLogService auditLogService;

    @Value("${app.audit.retencao-dias:90}")
    private int retencaoDias;

    public AuditCleanupScheduler(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void limparLogsAntigos() {
        log.info("[AUDIT-CLEANUP] Iniciando limpeza de logs com retencao={} dias", retencaoDias);
        int removidos = auditLogService.limparLogsAntigos(retencaoDias);
        log.info("[AUDIT-CLEANUP] Limpeza concluída. Registros removidos: {}", removidos);
    }
}

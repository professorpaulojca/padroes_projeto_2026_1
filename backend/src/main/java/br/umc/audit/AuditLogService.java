package br.umc.audit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss.SSS");

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    /**
     * Grava o log de auditoria de forma assíncrona numa transação separada
     * para não interferir com a transação principal da operação.
     */
    @Async("auditExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(AuditLogBuilder builder) {
        try {
            AuditLogEntity entity = builder.build();
            auditLogRepository.save(entity);

            emitirLogEstruturado(entity);
        } catch (Exception ex) {
            log.error("[AUDIT] Falha ao persistir log de auditoria: {}", ex.getMessage(), ex);
        }
    }

    /**
     * Converte qualquer objeto para JSON para armazenar como dado anterior/novo.
     */
    public String toJson(Object objeto) {
        if (objeto == null) return null;
        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(objeto);
        } catch (Exception e) {
            return objeto.toString();
        }
    }

    private void emitirLogEstruturado(AuditLogEntity entity) {
        String quando = entity.getCriadoEm() != null ? entity.getCriadoEm().format(FMT) : "?";
        String usuario = entity.getUsuarioEmail() != null ? entity.getUsuarioEmail() : "anonimo";
        String perfil = entity.getUsuarioPerfil() != null ? "[" + entity.getUsuarioPerfil() + "]" : "";
        String ip = entity.getIpOrigem() != null ? entity.getIpOrigem() : "?";
        String classe = entity.getClasseOrigem() != null ? entity.getClasseOrigem() : "?";
        String metodo = entity.getMetodoOrigem() != null ? entity.getMetodoOrigem() : "?";
        String entidade = entity.getEntidade();
        String entidadeId = entity.getEntidadeId() != null ? "#" + entity.getEntidadeId() : "";
        String duracao = entity.getDuracaoMs() != null ? entity.getDuracaoMs() + "ms" : "?ms";

        if (entity.isSucesso()) {
            log.info(
                "[AUDIT] ACAO={} | ENTIDADE={}{} | USUARIO={}{} | IP={} | QUANDO={} | CLASSE={} | METODO={} | DURACAO={} | DETALHE={}",
                entity.getAcao(), entidade, entidadeId,
                usuario, perfil, ip, quando,
                classe, metodo, duracao,
                entity.getDetalhe()
            );

            if (entity.getDadoAnterior() != null || entity.getDadoNovo() != null) {
                log.info(
                    "[AUDIT-DIFF] ACAO={} | ENTIDADE={}{} | USUARIO={} | ANTES={} | DEPOIS={}",
                    entity.getAcao(), entidade, entidadeId,
                    usuario,
                    entity.getDadoAnterior(),
                    entity.getDadoNovo()
                );
            }
        } else {
            log.warn(
                "[AUDIT-FALHA] ACAO={} | ENTIDADE={}{} | USUARIO={}{} | IP={} | QUANDO={} | CLASSE={} | METODO={} | DURACAO={} | ERRO={}",
                entity.getAcao(), entidade, entidadeId,
                usuario, perfil, ip, quando,
                classe, metodo, duracao,
                entity.getMensagemErro()
            );
        }
    }

    /**
     * Limpeza periódica de logs — chamado pelo scheduler de retenção.
     */
    @Transactional
    public int limparLogsAntigos(int diasRetencao) {
        LocalDateTime limite = LocalDateTime.now().minusDays(diasRetencao);
        int removidos = auditLogRepository.deletarLogsAntigos(limite);
        log.info("[AUDIT-CLEANUP] Removidos {} registros de audit_logs anteriores a {}", removidos, limite.format(FMT));
        return removidos;
    }
}

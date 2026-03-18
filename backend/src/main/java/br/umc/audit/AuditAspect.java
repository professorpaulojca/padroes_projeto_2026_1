package br.umc.audit;

import br.umc.metrics.MetricsService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Aspecto AOP que intercepta automaticamente todos os métodos públicos
 * de controllers e services para registrar auditoria detalhada.
 */
@Aspect
@Component
public class AuditAspect {

    private static final Logger log = LoggerFactory.getLogger(AuditAspect.class);

    private final AuditLogService auditLogService;
    private final MetricsService metricsService;

    public AuditAspect(AuditLogService auditLogService, MetricsService metricsService) {
        this.auditLogService = auditLogService;
        this.metricsService = metricsService;
    }

    @Around("execution(public * br.umc.controllers..*(..))" +
            " || execution(public * br.umc.services..*(..))")
    public Object interceptar(ProceedingJoinPoint pjp) throws Throwable {

        MethodSignature signature = (MethodSignature) pjp.getSignature();
        String classeSimples = signature.getDeclaringType().getSimpleName();
        String metodo = signature.getName();
        String classeCompleta = signature.getDeclaringTypeName();
        String[] parametros = signature.getParameterNames();
        Object[] args = pjp.getArgs();

        String acao = resolverAcao(classeSimples, metodo);
        String entidade = resolverEntidade(classeSimples);

        long inicio = System.currentTimeMillis();
        Object resultado = null;
        Throwable erro = null;

        log.debug("[AUDIT-CALL] CLASSE={} | METODO={} | PARAMETROS={} | VALORES={}",
                classeSimples, metodo,
                Arrays.toString(parametros),
                sanitizarArgs(args));

        try {
            resultado = pjp.proceed();
            return resultado;
        } catch (Throwable ex) {
            erro = ex;
            throw ex;
        } finally {
            long duracaoMs = System.currentTimeMillis() - inicio;

            AuditLogBuilder builder = AuditLogBuilder.novo()
                    .fromContext()
                    .acao(acao)
                    .entidade(entidade)
                    .origem(classeCompleta, metodo)
                    .duracao(duracaoMs)
                    .detalhe(String.format("Chamada de %s.%s(%s)",
                            classeSimples, metodo,
                            resumirParametros(parametros, args)));

            if (erro != null) {
                builder.falha(erro.getClass().getSimpleName() + ": " + erro.getMessage());
                metricsService.registrarErro(entidade, acao);
            } else {
                builder.sucesso();
                metricsService.registrarOperacao(entidade, acao, duracaoMs);
            }

            auditLogService.registrar(builder);
        }
    }

    private String resolverAcao(String classe, String metodo) {
        String m = metodo.toLowerCase();
        String c = classe.toLowerCase();

        if (m.contains("login")) return AuditAction.LOGIN.name();
        if (m.contains("cadastrar") || m.contains("criar") || m.contains("salvar")) {
            if (c.contains("usuario")) return AuditAction.CADASTRO_USUARIO.name();
            if (c.contains("pessoa")) return AuditAction.CADASTRAR_PESSOA.name();
            if (c.contains("endereco")) return AuditAction.CADASTRAR_ENDERECO.name();
        }
        if (m.contains("atualizar") || m.contains("editar") || m.contains("update")) {
            if (c.contains("usuario")) return AuditAction.ATUALIZAR_PERFIL_USUARIO.name();
            if (c.contains("pessoa")) return AuditAction.ATUALIZAR_PESSOA.name();
            if (c.contains("endereco")) return AuditAction.ATUALIZAR_ENDERECO.name();
        }
        if (m.contains("excluir") || m.contains("deletar") || m.contains("remover") || m.contains("delete")) {
            if (c.contains("pessoa")) return AuditAction.EXCLUIR_PESSOA.name();
            if (c.contains("endereco")) return AuditAction.EXCLUIR_ENDERECO.name();
        }
        if (m.contains("listar") || m.contains("buscar") || m.contains("consultar") || m.contains("findall")) {
            if (c.contains("usuario")) return AuditAction.LISTAR_USUARIOS.name();
            if (c.contains("pessoa")) return AuditAction.LISTAR_PESSOAS.name();
            if (c.contains("endereco")) return AuditAction.LISTAR_ENDERECOS.name();
        }
        if (m.contains("esqueci") || m.contains("forgot")) return AuditAction.ESQUECI_SENHA.name();
        if (m.contains("redefinir") || m.contains("reset")) return AuditAction.REDEFINIR_SENHA.name();
        if (m.contains("alterarsenha") || m.contains("changepassword")) return AuditAction.ALTERAR_SENHA.name();
        if (m.contains("vincular")) return AuditAction.VINCULAR_ENDERECO.name();
        if (m.contains("desvincular")) return AuditAction.DESVINCULAR_ENDERECO.name();
        if (m.contains("desativar")) return AuditAction.DESATIVAR_USUARIO.name();

        return (classe + "." + metodo).toUpperCase();
    }

    private String resolverEntidade(String classe) {
        String c = classe.toLowerCase();
        if (c.contains("usuario")) return "Usuario";
        if (c.contains("pessoa")) return "Pessoa";
        if (c.contains("endereco")) return "Endereco";
        if (c.contains("auth")) return "Auth";
        return classe;
    }

    private String sanitizarArgs(Object[] args) {
        if (args == null || args.length == 0) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < args.length; i++) {
            if (i > 0) sb.append(", ");
            if (args[i] == null) {
                sb.append("null");
            } else {
                String tipo = args[i].getClass().getSimpleName();
                String valor = args[i].toString();
                if (valor.toLowerCase().contains("senha") || valor.toLowerCase().contains("password")) {
                    sb.append(tipo).append("=***REDACTED***");
                } else if (valor.length() > 200) {
                    sb.append(tipo).append("=").append(valor, 0, 200).append("...");
                } else {
                    sb.append(tipo).append("=").append(valor);
                }
            }
        }
        return sb.append("]").toString();
    }

    private String resumirParametros(String[] nomes, Object[] valores) {
        if (nomes == null || nomes.length == 0) return "";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < nomes.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(nomes[i]).append("=");
            if (valores[i] == null) {
                sb.append("null");
            } else {
                String v = valores[i].toString();
                if (nomes[i].toLowerCase().contains("senha") || nomes[i].toLowerCase().contains("password")) {
                    sb.append("***");
                } else if (v.length() > 100) {
                    sb.append(v, 0, 100).append("...");
                } else {
                    sb.append(v);
                }
            }
        }
        return sb.toString();
    }
}

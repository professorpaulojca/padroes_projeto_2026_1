package br.umc.controllers;

import br.umc.audit.AuditAction;
import br.umc.audit.AuditLogEntity;
import br.umc.audit.AuditLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
@Tag(name = "Auditoria", description = "Consulta de logs de auditoria — requer perfil ADMIN")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    @Operation(summary = "Listar todos os logs de auditoria (paginado via Spring Data)")
    @ApiResponse(responseCode = "200", description = "Lista de logs")
    public ResponseEntity<List<AuditLogEntity>> listarTodos() {
        return ResponseEntity.ok(auditLogRepository.findAll());
    }

    @GetMapping("/usuario/{email}")
    @Operation(summary = "Histórico de ações de um usuário específico")
    public ResponseEntity<List<AuditLogEntity>> porUsuario(
            @Parameter(description = "E-mail do usuário") @PathVariable String email,
            @Parameter(description = "Limite de registros", example = "100")
            @RequestParam(defaultValue = "100") int limite) {
        return ResponseEntity.ok(auditLogRepository.findByUsuarioEmail(email, limite));
    }

    @GetMapping("/acao/{acao}")
    @Operation(summary = "Logs por tipo de ação",
            description = "Valores: LOGIN, CADASTRO_USUARIO, CADASTRAR_PESSOA, ATUALIZAR_PESSOA, EXCLUIR_PESSOA, etc.")
    public ResponseEntity<List<AuditLogEntity>> porAcao(
            @Parameter(description = "Código da ação (ex: LOGIN)") @PathVariable String acao,
            @RequestParam(defaultValue = "100") int limite) {
        return ResponseEntity.ok(auditLogRepository.findByAcao(acao, limite));
    }

    @GetMapping("/entidade/{entidade}/{id}")
    @Operation(summary = "Histórico completo de uma entidade específica",
            description = "Ex: GET /api/auditoria/entidade/Pessoa/42")
    public ResponseEntity<List<AuditLogEntity>> historicoEntidade(
            @Parameter(description = "Nome da entidade (Usuario, Pessoa, Endereco)") @PathVariable String entidade,
            @Parameter(description = "ID da entidade") @PathVariable String id) {
        return ResponseEntity.ok(auditLogRepository.findHistoricoEntidade(entidade, id));
    }

    @GetMapping("/periodo")
    @Operation(summary = "Logs por período de data/hora")
    public ResponseEntity<List<AuditLogEntity>> porPeriodo(
            @Parameter(description = "Data/hora início (ISO)", example = "2026-01-01T00:00:00")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @Parameter(description = "Data/hora fim (ISO)", example = "2026-12-31T23:59:59")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fim) {
        return ResponseEntity.ok(auditLogRepository.findByPeriodo(inicio, fim));
    }

    @GetMapping("/falhas")
    @Operation(summary = "Logs de operações que falharam")
    public ResponseEntity<List<AuditLogEntity>> falhas(
            @RequestParam(defaultValue = "100") int limite) {
        return ResponseEntity.ok(auditLogRepository.findFalhas(limite));
    }

    @GetMapping("/acoes")
    @Operation(summary = "Lista todas as ações disponíveis para filtro")
    public ResponseEntity<AuditAction[]> acoes() {
        return ResponseEntity.ok(AuditAction.values());
    }
}

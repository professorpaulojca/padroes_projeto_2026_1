package br.umc.controllers;

import br.umc.dto.endereco.EnderecoJpaRequestDTO;
import br.umc.dto.endereco.EnderecoJpaResponseDTO;
import br.umc.dto.pessoa.PessoaJpaResponseDTO;
import br.umc.dto.pessoa.PessoaRequestDTO;
import br.umc.services.PessoaJpaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pessoas")
@Tag(name = "Pessoas", description = "Administração de pessoas")
@SecurityRequirement(name = "bearerAuth")
public class PessoaJpaController {

    private final PessoaJpaService pessoaJpaService;

    public PessoaJpaController(PessoaJpaService pessoaJpaService) {
        this.pessoaJpaService = pessoaJpaService;
    }

    @PostMapping
    @Operation(summary = "Cadastrar nova pessoa", description = "Cadastra uma pessoa com nome e data de nascimento")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pessoa cadastrada com sucesso",
                    content = @Content(schema = @Schema(implementation = PessoaJpaResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<?> cadastrar(@Valid @RequestBody PessoaRequestDTO dto) {
        try {
            PessoaJpaResponseDTO response = pessoaJpaService.cadastrar(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping
    @Operation(summary = "Listar todas as pessoas", description = "Retorna lista de todas as pessoas cadastradas, ordenadas por nome")
    @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = PessoaJpaResponseDTO.class))))
    public ResponseEntity<List<PessoaJpaResponseDTO>> listarTodas() {
        return ResponseEntity.ok(pessoaJpaService.listarTodas());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar pessoa por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pessoa encontrada",
                    content = @Content(schema = @Schema(implementation = PessoaJpaResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Pessoa não encontrada")
    })
    public ResponseEntity<?> buscarPorId(
            @Parameter(description = "ID da pessoa") @PathVariable Long id) {
        try {
            return ResponseEntity.ok(pessoaJpaService.buscarPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar pessoas por nome (parcial, case-insensitive)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resultado da busca")
    })
    public ResponseEntity<List<PessoaJpaResponseDTO>> buscarPorNome(
            @Parameter(description = "Trecho do nome a buscar", example = "João")
            @RequestParam String nome) {
        return ResponseEntity.ok(pessoaJpaService.buscarPorNome(nome));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar dados de uma pessoa")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pessoa atualizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Pessoa não encontrada")
    })
    public ResponseEntity<?> atualizar(
            @Parameter(description = "ID da pessoa") @PathVariable Long id,
            @Valid @RequestBody PessoaRequestDTO dto) {
        try {
            return ResponseEntity.ok(pessoaJpaService.atualizar(id, dto));
        } catch (IllegalArgumentException e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("não encontrada")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", msg));
            }
            return ResponseEntity.badRequest().body(Map.of("erro", msg));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir uma pessoa")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pessoa excluída com sucesso"),
            @ApiResponse(responseCode = "404", description = "Pessoa não encontrada")
    })
    public ResponseEntity<?> excluir(
            @Parameter(description = "ID da pessoa") @PathVariable Long id) {
        try {
            pessoaJpaService.excluir(id);
            return ResponseEntity.ok(Map.of("mensagem", "Pessoa excluída com sucesso"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/{id}/enderecos")
    @Operation(summary = "Listar endereços de uma pessoa")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de endereços",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = EnderecoJpaResponseDTO.class)))),
            @ApiResponse(responseCode = "404", description = "Pessoa não encontrada")
    })
    public ResponseEntity<?> listarEnderecos(
            @Parameter(description = "ID da pessoa") @PathVariable Long id) {
        try {
            return ResponseEntity.ok(pessoaJpaService.listarEnderecos(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/{id}/enderecos")
    @Operation(summary = "Adicionar endereços a uma pessoa",
            description = "Valida o(s) CEP(s) via ViaCEP, busca coordenadas via Nominatim e vincula os endereços à pessoa.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Endereço(s) adicionado(s) com sucesso",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = EnderecoJpaResponseDTO.class)))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou CEP não encontrado"),
            @ApiResponse(responseCode = "404", description = "Pessoa não encontrada")
    })
    public ResponseEntity<?> adicionarEnderecos(
            @Parameter(description = "ID da pessoa") @PathVariable Long id,
            @Valid @RequestBody List<@Valid EnderecoJpaRequestDTO> enderecos) {
        try {
            List<EnderecoJpaResponseDTO> response = pessoaJpaService.adicionarEnderecos(id, enderecos);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("não encontrada")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", msg));
            }
            return ResponseEntity.badRequest().body(Map.of("erro", msg));
        }
    }

    @DeleteMapping("/{pessoaId}/enderecos/{enderecoId}")
    @Operation(summary = "Desvincular endereço de uma pessoa",
            description = "Remove a associação entre pessoa e endereço (não exclui o endereço)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Endereço desvinculado"),
            @ApiResponse(responseCode = "404", description = "Pessoa ou endereço não encontrado")
    })
    public ResponseEntity<?> desvincularEndereco(
            @Parameter(description = "ID da pessoa") @PathVariable Long pessoaId,
            @Parameter(description = "ID do endereço") @PathVariable Long enderecoId) {
        try {
            pessoaJpaService.desvincularEndereco(pessoaId, enderecoId);
            return ResponseEntity.ok(Map.of("mensagem", "Endereço desvinculado com sucesso"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }
}

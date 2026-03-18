package br.umc.controllers;

import br.umc.dto.endereco.EnderecoJpaRequestDTO;
import br.umc.dto.endereco.EnderecoJpaResponseDTO;
import br.umc.services.EnderecoJpaService;
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
@RequestMapping("/api/enderecos")
@Tag(name = "Endereços", description = "Administração de endereços")
@SecurityRequirement(name = "bearerAuth")
public class EnderecoJpaController {

    private final EnderecoJpaService enderecoJpaService;

    public EnderecoJpaController(EnderecoJpaService enderecoJpaService) {
        this.enderecoJpaService = enderecoJpaService;
    }

    @GetMapping
    @Operation(summary = "Listar todos os endereços", description = "Retorna todos os endereços ordenados por logradouro")
    @ApiResponse(responseCode = "200", description = "Lista de endereços",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = EnderecoJpaResponseDTO.class))))
    public ResponseEntity<List<EnderecoJpaResponseDTO>> listarTodos() {
        return ResponseEntity.ok(enderecoJpaService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar endereço por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Endereço encontrado",
                    content = @Content(schema = @Schema(implementation = EnderecoJpaResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Endereço não encontrado")
    })
    public ResponseEntity<?> buscarPorId(
            @Parameter(description = "ID do endereço") @PathVariable Long id) {
        try {
            return ResponseEntity.ok(enderecoJpaService.buscarPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar endereços por CEP")
    @ApiResponse(responseCode = "200", description = "Endereços encontrados")
    public ResponseEntity<List<EnderecoJpaResponseDTO>> buscarPorCep(
            @Parameter(description = "CEP a buscar", example = "01310-100")
            @RequestParam String cep) {
        return ResponseEntity.ok(enderecoJpaService.buscarPorCep(cep));
    }

    @PostMapping
    @Operation(summary = "Cadastrar novo endereço",
            description = "Valida o CEP via ViaCEP, busca coordenadas via Nominatim e persiste o endereço. " +
                    "Se o endereço (CEP + número + complemento) já existir, reutiliza o registro.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Endereço cadastrado com sucesso",
                    content = @Content(schema = @Schema(implementation = EnderecoJpaResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou CEP não encontrado")
    })
    public ResponseEntity<?> cadastrar(@Valid @RequestBody EnderecoJpaRequestDTO dto) {
        try {
            EnderecoJpaResponseDTO response = EnderecoJpaResponseDTO.fromEntity(
                    enderecoJpaService.construirEPersistirEndereco(dto));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar endereço",
            description = "Revalida o CEP via ViaCEP e atualiza os dados do endereço")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Endereço atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Endereço não encontrado")
    })
    public ResponseEntity<?> atualizar(
            @Parameter(description = "ID do endereço") @PathVariable Long id,
            @Valid @RequestBody EnderecoJpaRequestDTO dto) {
        try {
            return ResponseEntity.ok(enderecoJpaService.atualizar(id, dto));
        } catch (IllegalArgumentException e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("não encontrado")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", msg));
            }
            return ResponseEntity.badRequest().body(Map.of("erro", msg));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir endereço",
            description = "Exclui o endereço e remove automaticamente todas as associações com pessoas")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Endereço excluído com sucesso"),
            @ApiResponse(responseCode = "404", description = "Endereço não encontrado")
    })
    public ResponseEntity<?> excluir(
            @Parameter(description = "ID do endereço") @PathVariable Long id) {
        try {
            enderecoJpaService.excluir(id);
            return ResponseEntity.ok(Map.of("mensagem", "Endereço excluído com sucesso"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("erro", e.getMessage()));
        }
    }
}

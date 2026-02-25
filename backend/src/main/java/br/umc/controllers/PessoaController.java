package br.umc.controllers;

import br.umc.dto.PessoaDTO;
import br.umc.dto.PessoaResponseDTO;
import br.umc.services.PessoaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/pessoas")
@Tag(name = "Pessoas", description = "API para gerenciamento de pessoas")
public class PessoaController {

    private final PessoaService pessoaService;

    public PessoaController(PessoaService pessoaService) {
        this.pessoaService = pessoaService;
    }

    @PostMapping
    @Operation(
            summary = "Cadastrar uma nova pessoa",
            description = "Cadastra uma nova pessoa no sistema com nome e data de nascimento"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Pessoa cadastrada com sucesso",
                    content = @Content(schema = @Schema(implementation = PessoaResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dados inválidos fornecidos"
            )
    })
    public ResponseEntity<?> cadastrarPessoa(
            @Valid @RequestBody PessoaDTO pessoaDTO) {
        try {
            PessoaResponseDTO response = pessoaService.cadastrarPessoa(pessoaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(criarMensagemErro(e.getMessage()));
        }
    }

    @GetMapping
    @Operation(
            summary = "Listar todas as pessoas",
            description = "Retorna uma lista com todas as pessoas cadastradas no sistema"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de pessoas retornada com sucesso"
            )
    })
    public ResponseEntity<List<PessoaResponseDTO>> listarTodas() {
        List<PessoaResponseDTO> pessoas = pessoaService.listarTodas();
        return ResponseEntity.ok(pessoas);
    }

    @GetMapping("/buscar")
    @Operation(
            summary = "Buscar pessoa por nome",
            description = "Busca uma pessoa específica pelo nome completo"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Pessoa encontrada",
                    content = @Content(schema = @Schema(implementation = PessoaResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Pessoa não encontrada"
            )
    })
    public ResponseEntity<?> buscarPorNome(
            @Parameter(description = "Nome completo da pessoa", example = "João da Silva")
            @RequestParam String nome) {
        Optional<PessoaResponseDTO> pessoa = pessoaService.buscarPorNome(nome);
        
        if (pessoa.isPresent()) {
            return ResponseEntity.ok(pessoa.get());
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(criarMensagemErro("Pessoa não encontrada com o nome: " + nome));
        }
    }

    private Map<String, String> criarMensagemErro(String mensagem) {
        Map<String, String> erro = new HashMap<>();
        erro.put("erro", mensagem);
        return erro;
    }
}

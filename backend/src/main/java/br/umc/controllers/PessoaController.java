package br.umc.controllers;

import br.umc.dto.EnderecoDTO;
import br.umc.dto.EnderecoResponseDTO;
import br.umc.dto.PessoaDTO;
import br.umc.dto.PessoaResponseDTO;
import br.umc.services.PessoaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/pessoas")
@Tag(name = "Pessoas", description = "API para gerenciamento de pessoas")
@Validated
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

    @PostMapping("/{nome}/enderecos")
    @Operation(
            summary = "Adicionar endereços a uma pessoa",
            description = "Valida o(s) CEP(s) informado(s) via ViaCEP, busca as coordenadas geográficas (latitude/longitude) " +
                    "via Nominatim/OpenStreetMap e associa o(s) endereço(s) à pessoa. " +
                    "O cliente deve enviar apenas: cep, numero, complemento (opcional), tipoEndereco e enderecoPrincipal."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Endereço(s) adicionado(s) com sucesso",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = EnderecoResponseDTO.class)))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Dados inválidos ou CEP não encontrado no ViaCEP"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Pessoa não encontrada"
            )
    })
    public ResponseEntity<?> adicionarEnderecos(
            @Parameter(description = "Nome completo da pessoa", example = "João da Silva")
            @PathVariable String nome,
            @Valid @RequestBody @NotEmpty(message = "A lista de endereços não pode ser vazia")
            List<@Valid EnderecoDTO> enderecos) {
        try {
            List<EnderecoResponseDTO> response = pessoaService.adicionarEnderecos(nome, enderecos);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            String mensagem = e.getMessage();
            if (mensagem != null && mensagem.contains("não encontrada")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(criarMensagemErro(mensagem));
            }
            return ResponseEntity.badRequest().body(criarMensagemErro(mensagem));
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

package br.umc.controllers;

import br.umc.dto.auth.*;
import br.umc.services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@Tag(name = "Autenticação", description = "Endpoints de login, cadastro e recuperação de senha")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar usuário", description = "Realiza o login e retorna o token JWT")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login realizado com sucesso",
                    content = @Content(schema = @Schema(implementation = LoginResponseDTO.class))),
            @ApiResponse(responseCode = "401", description = "Credenciais inválidas"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos")
    })
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO dto) {
        try {
            LoginResponseDTO response = authService.login(dto);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/cadastro")
    @Operation(summary = "Cadastrar novo usuário", description = "Cria uma nova conta de usuário e retorna o token JWT")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso",
                    content = @Content(schema = @Schema(implementation = LoginResponseDTO.class))),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou e-mail já cadastrado")
    })
    public ResponseEntity<?> cadastrar(@Valid @RequestBody CadastroRequestDTO dto) {
        try {
            LoginResponseDTO response = authService.cadastrar(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/esqueci-senha")
    @Operation(
            summary = "Solicitar redefinição de senha",
            description = "Gera um token de redefinição de senha. Em produção, o token seria enviado por e-mail. " +
                    "Neste ambiente, o token é retornado diretamente na resposta para fins de teste."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token gerado com sucesso"),
            @ApiResponse(responseCode = "400", description = "E-mail não encontrado")
    })
    public ResponseEntity<?> esqueciSenha(@Valid @RequestBody EsqueciSenhaRequestDTO dto) {
        try {
            String token = authService.esqueciSenha(dto);
            return ResponseEntity.ok(Map.of(
                    "mensagem", "Token de redefinição gerado. Em produção seria enviado por e-mail.",
                    "token", token
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/redefinir-senha")
    @Operation(summary = "Redefinir senha via token", description = "Redefine a senha do usuário usando o token recebido")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Senha redefinida com sucesso"),
            @ApiResponse(responseCode = "400", description = "Token inválido, expirado ou dados incorretos")
    })
    public ResponseEntity<?> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequestDTO dto) {
        try {
            authService.redefinirSenha(dto);
            return ResponseEntity.ok(Map.of("mensagem", "Senha redefinida com sucesso"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }
}

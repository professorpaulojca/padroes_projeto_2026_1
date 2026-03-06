package br.umc.controllers;

import br.umc.dto.usuario.AlterarSenhaRequestDTO;
import br.umc.dto.usuario.AtualizarPerfilRequestDTO;
import br.umc.dto.usuario.UsuarioResponseDTO;
import br.umc.services.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@Tag(name = "Usuários", description = "Administração de usuários e perfis")
@SecurityRequirement(name = "bearerAuth")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping
    @Operation(summary = "Listar todos os usuários ativos", description = "Requer perfil ADMIN")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar usuário por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário encontrado",
                    content = @Content(schema = @Schema(implementation = UsuarioResponseDTO.class))),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<?> buscarPorId(
            @Parameter(description = "ID do usuário") @PathVariable Long id) {
        try {
            return ResponseEntity.ok(usuarioService.buscarPorId(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Obter dados do usuário autenticado")
    @ApiResponse(responseCode = "200", description = "Dados do usuário autenticado")
    public ResponseEntity<UsuarioResponseDTO> me(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(usuarioService.buscarPorEmail(userDetails.getUsername()));
    }

    @PutMapping("/{id}/perfil")
    @Operation(summary = "Atualizar perfil do usuário",
            description = "O próprio usuário pode editar seu perfil. ADMIN pode editar qualquer usuário.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Perfil atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso negado"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<?> atualizarPerfil(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarPerfilRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            UsuarioResponseDTO response = usuarioService.atualizarPerfil(id, dto, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body(Map.of("erro", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @PutMapping("/{id}/senha")
    @Operation(summary = "Alterar senha do usuário autenticado",
            description = "O próprio usuário informa a senha atual e a nova senha")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Senha alterada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Senha atual incorreta ou dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Acesso negado")
    })
    public ResponseEntity<?> alterarSenha(
            @PathVariable Long id,
            @Valid @RequestBody AlterarSenhaRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            usuarioService.alterarSenha(id, dto, userDetails.getUsername());
            return ResponseEntity.ok(Map.of("mensagem", "Senha alterada com sucesso"));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body(Map.of("erro", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desativar usuário",
            description = "Desativa (soft delete) o usuário. O próprio usuário pode desativar sua conta ou um ADMIN pode fazer isso.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário desativado com sucesso"),
            @ApiResponse(responseCode = "403", description = "Acesso negado"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado")
    })
    public ResponseEntity<?> desativarUsuario(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            usuarioService.desativarUsuario(id, userDetails.getUsername());
            return ResponseEntity.ok(Map.of("mensagem", "Usuário desativado com sucesso"));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(403).body(Map.of("erro", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }
}

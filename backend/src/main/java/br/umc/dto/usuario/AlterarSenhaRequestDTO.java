package br.umc.dto.usuario;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para alteração de senha do usuário autenticado")
public class AlterarSenhaRequestDTO {

    @Schema(description = "Senha atual do usuário")
    @NotBlank(message = "Senha atual é obrigatória")
    private String senhaAtual;

    @Schema(description = "Nova senha (mínimo 8 caracteres)", example = "NovaSenha@456")
    @NotBlank(message = "Nova senha é obrigatória")
    @Size(min = 8, message = "Nova senha deve ter no mínimo 8 caracteres")
    private String novaSenha;

    public AlterarSenhaRequestDTO() {
    }

    public AlterarSenhaRequestDTO(String senhaAtual, String novaSenha) {
        this.senhaAtual = senhaAtual;
        this.novaSenha = novaSenha;
    }

    public String getSenhaAtual() { return senhaAtual; }
    public void setSenhaAtual(String senhaAtual) { this.senhaAtual = senhaAtual; }

    public String getNovaSenha() { return novaSenha; }
    public void setNovaSenha(String novaSenha) { this.novaSenha = novaSenha; }
}

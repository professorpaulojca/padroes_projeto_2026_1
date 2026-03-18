package br.umc.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para redefinição de senha via token")
public class RedefinirSenhaRequestDTO {

    @Schema(description = "Token de redefinição recebido por e-mail")
    @NotBlank(message = "Token é obrigatório")
    private String token;

    @Schema(description = "Nova senha (mínimo 8 caracteres)", example = "NovaSenha@456")
    @NotBlank(message = "Nova senha é obrigatória")
    @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
    private String novaSenha;

    public RedefinirSenhaRequestDTO() {
    }

    public RedefinirSenhaRequestDTO(String token, String novaSenha) {
        this.token = token;
        this.novaSenha = novaSenha;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getNovaSenha() {
        return novaSenha;
    }

    public void setNovaSenha(String novaSenha) {
        this.novaSenha = novaSenha;
    }
}

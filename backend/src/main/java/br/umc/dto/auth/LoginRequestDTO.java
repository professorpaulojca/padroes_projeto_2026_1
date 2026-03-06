package br.umc.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Dados para autenticação")
public class LoginRequestDTO {

    @Schema(description = "E-mail do usuário", example = "joao@email.com")
    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    private String email;

    @Schema(description = "Senha do usuário", example = "Senha@123")
    @NotBlank(message = "Senha é obrigatória")
    private String senha;

    public LoginRequestDTO() {
    }

    public LoginRequestDTO(String email, String senha) {
        this.email = email;
        this.senha = senha;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }
}

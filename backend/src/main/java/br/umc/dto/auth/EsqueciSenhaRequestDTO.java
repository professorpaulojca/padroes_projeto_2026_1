package br.umc.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Requisição para recuperação de senha")
public class EsqueciSenhaRequestDTO {

    @Schema(description = "E-mail do usuário cadastrado", example = "joao@email.com")
    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    private String email;

    public EsqueciSenhaRequestDTO() {
    }

    public EsqueciSenhaRequestDTO(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}

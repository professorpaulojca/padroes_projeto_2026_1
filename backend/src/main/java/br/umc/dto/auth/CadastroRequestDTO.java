package br.umc.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para cadastro de novo usuário")
public class CadastroRequestDTO {

    @Schema(description = "E-mail do usuário", example = "joao@email.com")
    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    private String email;

    @Schema(description = "Senha do usuário (mínimo 8 caracteres)", example = "Senha@123")
    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 8, message = "Senha deve ter no mínimo 8 caracteres")
    private String senha;

    @Schema(description = "Nome de exibição do usuário", example = "João da Silva")
    @NotBlank(message = "Nome de exibição é obrigatório")
    @Size(max = 100, message = "Nome de exibição deve ter no máximo 100 caracteres")
    private String nomeExibicao;

    public CadastroRequestDTO() {
    }

    public CadastroRequestDTO(String email, String senha, String nomeExibicao) {
        this.email = email;
        this.senha = senha;
        this.nomeExibicao = nomeExibicao;
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

    public String getNomeExibicao() {
        return nomeExibicao;
    }

    public void setNomeExibicao(String nomeExibicao) {
        this.nomeExibicao = nomeExibicao;
    }
}

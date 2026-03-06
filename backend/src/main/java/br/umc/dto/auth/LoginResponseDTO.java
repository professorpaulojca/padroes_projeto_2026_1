package br.umc.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Resposta da autenticação com token JWT")
public class LoginResponseDTO {

    @Schema(description = "Token JWT de acesso")
    private String token;

    @Schema(description = "Tipo do token", example = "Bearer")
    private String tipo;

    @Schema(description = "E-mail do usuário autenticado")
    private String email;

    @Schema(description = "Nome de exibição do usuário")
    private String nomeExibicao;

    @Schema(description = "Perfil do usuário", example = "USUARIO")
    private String perfil;

    public LoginResponseDTO() {
    }

    public LoginResponseDTO(String token, String email, String nomeExibicao, String perfil) {
        this.token = token;
        this.tipo = "Bearer";
        this.email = email;
        this.nomeExibicao = nomeExibicao;
        this.perfil = perfil;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNomeExibicao() {
        return nomeExibicao;
    }

    public void setNomeExibicao(String nomeExibicao) {
        this.nomeExibicao = nomeExibicao;
    }

    public String getPerfil() {
        return perfil;
    }

    public void setPerfil(String perfil) {
        this.perfil = perfil;
    }
}

package br.umc.dto.usuario;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para atualização do perfil do usuário")
public class AtualizarPerfilRequestDTO {

    @Schema(description = "Nome de exibição", example = "João da Silva")
    @NotBlank(message = "Nome de exibição é obrigatório")
    @Size(max = 100, message = "Nome de exibição deve ter no máximo 100 caracteres")
    private String nomeExibicao;

    @Schema(description = "ID da pessoa a vincular ao usuário (opcional)")
    private Long pessoaId;

    public AtualizarPerfilRequestDTO() {
    }

    public AtualizarPerfilRequestDTO(String nomeExibicao, Long pessoaId) {
        this.nomeExibicao = nomeExibicao;
        this.pessoaId = pessoaId;
    }

    public String getNomeExibicao() { return nomeExibicao; }
    public void setNomeExibicao(String nomeExibicao) { this.nomeExibicao = nomeExibicao; }

    public Long getPessoaId() { return pessoaId; }
    public void setPessoaId(Long pessoaId) { this.pessoaId = pessoaId; }
}

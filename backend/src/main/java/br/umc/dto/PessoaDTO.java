package br.umc.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(description = "Dados para cadastro de uma pessoa")
public class PessoaDTO {

    @Schema(description = "Nome completo da pessoa", example = "João da Silva")
    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @Schema(description = "Data de nascimento no formato dd/MM/yyyy", example = "15/03/1990")
    @NotBlank(message = "Data de nascimento é obrigatória")
    @Pattern(regexp = "\\d{2}/\\d{2}/\\d{4}", message = "Data deve estar no formato dd/MM/yyyy")
    private String dataNascimento;

    public PessoaDTO() {
    }

    public PessoaDTO(String nome, String dataNascimento) {
        this.nome = nome;
        this.dataNascimento = dataNascimento;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(String dataNascimento) {
        this.dataNascimento = dataNascimento;
    }
}

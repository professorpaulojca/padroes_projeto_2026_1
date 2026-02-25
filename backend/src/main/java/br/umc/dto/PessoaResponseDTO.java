package br.umc.dto;

import br.umc.models.valueObjects.Pessoa;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados de resposta de uma pessoa cadastrada")
public class PessoaResponseDTO {

    @Schema(description = "Nome completo da pessoa", example = "João da Silva")
    private String nome;

    @Schema(description = "Data de nascimento formatada", example = "15/03/1990")
    private String dataNascimento;

    @Schema(description = "Idade calculada em anos", example = "34")
    private int idade;

    public PessoaResponseDTO() {
    }

    public PessoaResponseDTO(String nome, String dataNascimento, int idade) {
        this.nome = nome;
        this.dataNascimento = dataNascimento;
        this.idade = idade;
    }

    public static PessoaResponseDTO fromPessoa(Pessoa pessoa) {
        return new PessoaResponseDTO(
                pessoa.getNome().getValor(),
                pessoa.getDataNascimento().getFormatado(),
                pessoa.getIdade()
        );
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

    public int getIdade() {
        return idade;
    }

    public void setIdade(int idade) {
        this.idade = idade;
    }
}

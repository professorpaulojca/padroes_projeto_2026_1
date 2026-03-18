package br.umc.dto;

import br.umc.models.Pessoa;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.stream.Collectors;

@Schema(description = "Dados de resposta de uma pessoa cadastrada")
public class PessoaResponseDTO {

    @Schema(description = "Nome completo da pessoa", example = "João da Silva")
    private String nome;

    @Schema(description = "Data de nascimento formatada", example = "15/03/1990")
    private String dataNascimento;

    @Schema(description = "Idade calculada em anos", example = "34")
    private int idade;

    @Schema(description = "Lista de endereços da pessoa")
    private List<EnderecoResponseDTO> enderecos;

    public PessoaResponseDTO() {
    }

    public static PessoaResponseDTO fromPessoa(Pessoa pessoa) {
        PessoaResponseDTO dto = new PessoaResponseDTO();
        dto.nome = pessoa.getNome().getValor();
        dto.dataNascimento = pessoa.getDataNascimento().getFormatado();
        dto.idade = pessoa.getIdade();
        dto.enderecos = pessoa.getEnderecos().stream()
                .map(EnderecoResponseDTO::fromEndereco)
                .collect(Collectors.toList());
        return dto;
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

    public List<EnderecoResponseDTO> getEnderecos() {
        return enderecos;
    }

    public void setEnderecos(List<EnderecoResponseDTO> enderecos) {
        this.enderecos = enderecos;
    }
}

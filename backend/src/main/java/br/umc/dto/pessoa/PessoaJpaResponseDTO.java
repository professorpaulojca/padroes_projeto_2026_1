package br.umc.dto.pessoa;

import br.umc.dto.endereco.EnderecoJpaResponseDTO;
import br.umc.models.PessoaEntity;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Schema(description = "Dados de resposta de uma pessoa")
public class PessoaJpaResponseDTO {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    @Schema(description = "ID da pessoa", example = "1")
    private Long id;

    @Schema(description = "Nome completo da pessoa", example = "João da Silva")
    private String nome;

    @Schema(description = "Data de nascimento formatada", example = "15/03/1990")
    private String dataNascimento;

    @Schema(description = "Idade calculada em anos", example = "34")
    private int idade;

    @Schema(description = "Lista de endereços da pessoa")
    private List<EnderecoJpaResponseDTO> enderecos;

    public PessoaJpaResponseDTO() {
    }

    public static PessoaJpaResponseDTO fromEntity(PessoaEntity entity) {
        PessoaJpaResponseDTO dto = new PessoaJpaResponseDTO();
        dto.id = entity.getId();
        dto.nome = entity.getNome();
        dto.dataNascimento = entity.getDataNascimento() != null
                ? entity.getDataNascimento().format(FORMATTER) : null;
        dto.idade = entity.getIdade();
        dto.enderecos = entity.getEnderecos() != null
                ? entity.getEnderecos().stream()
                    .map(EnderecoJpaResponseDTO::fromEntity)
                    .collect(Collectors.toList())
                : List.of();
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(String dataNascimento) { this.dataNascimento = dataNascimento; }

    public int getIdade() { return idade; }
    public void setIdade(int idade) { this.idade = idade; }

    public List<EnderecoJpaResponseDTO> getEnderecos() { return enderecos; }
    public void setEnderecos(List<EnderecoJpaResponseDTO> enderecos) { this.enderecos = enderecos; }
}

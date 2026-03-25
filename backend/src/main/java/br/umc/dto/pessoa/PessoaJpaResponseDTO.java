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

    @Schema(description = "Nome da pessoa", example = "Maria Eduarda")
    private String nome;

    private String sobrenome;
    private String cpf;
    private String rg;

    @Schema(description = "Data de nascimento formatada", example = "15/03/1990")
    private String dataNascimento;

    @Schema(description = "Idade calculada em anos", example = "34")
    private int idade;

    private String sexo;
    private String email;
    private String telefone;
    private String celular;
    private String observacoes;
    private String tipoSanguineo;
    private String estadoCivil;
    private String nacionalidade;
    private String naturalidade;
    private String profissao;
    private String empresa;

    @Schema(description = "Lista de endereços da pessoa")
    private List<EnderecoJpaResponseDTO> enderecos;

    @Schema(description = "Situação da pessoa: 1=Ativo, 2=Inativo, 3=Excluído", example = "Ativo")
    private String situacao;

    public PessoaJpaResponseDTO() {
    }

    private static String resolverSituacao(Integer idSituacao) {
        if (idSituacao == null) return "Ativo";
        return switch (idSituacao) {
            case 2 -> "Inativo";
            case 3 -> "Excluído";
            default -> "Ativo";
        };
    }

    public static PessoaJpaResponseDTO fromEntity(PessoaEntity entity) {
        PessoaJpaResponseDTO dto = new PessoaJpaResponseDTO();
        dto.id = entity.getId();
        dto.nome = entity.getNome();
        dto.sobrenome = entity.getSobrenome();
        dto.cpf = entity.getCpf();
        dto.rg = entity.getRg();
        dto.dataNascimento = entity.getDataNascimento() != null
                ? entity.getDataNascimento().format(FORMATTER) : null;
        dto.idade = entity.getIdade();
        dto.sexo = entity.getSexo();
        dto.email = entity.getEmail();
        dto.telefone = entity.getTelefone();
        dto.celular = entity.getCelular();
        dto.observacoes = entity.getObservacoes();
        dto.tipoSanguineo = entity.getTipoSanguineo();
        dto.estadoCivil = entity.getEstadoCivil();
        dto.nacionalidade = entity.getNacionalidade();
        dto.naturalidade = entity.getNaturalidade();
        dto.profissao = entity.getProfissao();
        dto.empresa = entity.getEmpresa();
        dto.situacao = resolverSituacao(entity.getIdSituacao());
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

    public String getSobrenome() { return sobrenome; }
    public void setSobrenome(String sobrenome) { this.sobrenome = sobrenome; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getRg() { return rg; }
    public void setRg(String rg) { this.rg = rg; }

    public String getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(String dataNascimento) { this.dataNascimento = dataNascimento; }

    public int getIdade() { return idade; }
    public void setIdade(int idade) { this.idade = idade; }

    public String getSexo() { return sexo; }
    public void setSexo(String sexo) { this.sexo = sexo; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public String getCelular() { return celular; }
    public void setCelular(String celular) { this.celular = celular; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public String getTipoSanguineo() { return tipoSanguineo; }
    public void setTipoSanguineo(String tipoSanguineo) { this.tipoSanguineo = tipoSanguineo; }

    public String getEstadoCivil() { return estadoCivil; }
    public void setEstadoCivil(String estadoCivil) { this.estadoCivil = estadoCivil; }

    public String getNacionalidade() { return nacionalidade; }
    public void setNacionalidade(String nacionalidade) { this.nacionalidade = nacionalidade; }

    public String getNaturalidade() { return naturalidade; }
    public void setNaturalidade(String naturalidade) { this.naturalidade = naturalidade; }

    public String getProfissao() { return profissao; }
    public void setProfissao(String profissao) { this.profissao = profissao; }

    public String getEmpresa() { return empresa; }
    public void setEmpresa(String empresa) { this.empresa = empresa; }

    public List<EnderecoJpaResponseDTO> getEnderecos() { return enderecos; }
    public void setEnderecos(List<EnderecoJpaResponseDTO> enderecos) { this.enderecos = enderecos; }

    public String getSituacao() { return situacao; }
    public void setSituacao(String situacao) { this.situacao = situacao; }
}

package br.umc.dto.pessoa;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(description = "Dados para cadastro ou atualização de pessoa")
public class PessoaRequestDTO {

    @Schema(description = "Nome da pessoa", example = "Maria Eduarda")
    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @Schema(description = "Sobrenome da pessoa", example = "Santos")
    private String sobrenome;

    @Schema(description = "CPF da pessoa", example = "123.456.789-00")
    @Size(max = 14)
    private String cpf;

    @Schema(description = "RG da pessoa", example = "12.345.678-9")
    @Size(max = 20)
    private String rg;

    @Schema(description = "Data de nascimento no formato dd/MM/yyyy", example = "15/03/1990")
    @NotBlank(message = "Data de nascimento é obrigatória")
    @Pattern(regexp = "\\d{2}/\\d{2}/\\d{4}", message = "Data deve estar no formato dd/MM/yyyy")
    private String dataNascimento;

    @Schema(description = "Sexo", example = "Feminino")
    private String sexo;

    @Schema(description = "E-mail de contato", example = "maria@email.com")
    @Size(max = 150)
    private String email;

    @Schema(description = "Telefone fixo", example = "(11) 98765-4321")
    @Size(max = 20)
    private String telefone;

    @Schema(description = "Celular", example = "(11) 99999-8888")
    @Size(max = 20)
    private String celular;

    @Schema(description = "Observações opcionais", example = "Observação qualquer")
    @Size(max = 500)
    private String observacoes;

    @Schema(description = "Tipo sanguíneo", example = "AB+")
    @Size(max = 5)
    private String tipoSanguineo;

    @Schema(description = "Estado civil", example = "Casado(a)")
    @Size(max = 20)
    private String estadoCivil;

    @Schema(description = "Nacionalidade", example = "Brasileira")
    @Size(max = 100)
    private String nacionalidade;

    @Schema(description = "Naturalidade", example = "São Paulo - SP")
    @Size(max = 100)
    private String naturalidade;

    @Schema(description = "Profissão", example = "Engenheira de Software")
    @Size(max = 100)
    private String profissao;

    @Schema(description = "Empresa ou organização", example = "TechCorp Ltda.")
    @Size(max = 150)
    private String empresa;

    public PessoaRequestDTO() {}

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
}

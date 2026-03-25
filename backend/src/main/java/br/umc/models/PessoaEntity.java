package br.umc.models;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "pessoas")
public class PessoaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nome", nullable = false, length = 150)
    private String nome;

    @Column(name = "sobrenome", length = 150)
    private String sobrenome;

    @Column(name = "cpf", length = 14)
    private String cpf;

    @Column(name = "rg", length = 20)
    private String rg;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @Column(name = "sexo", length = 20)
    private String sexo;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "telefone", length = 20)
    private String telefone;

    @Column(name = "celular", length = 20)
    private String celular;

    @Column(name = "observacoes", length = 500)
    private String observacoes;

    @Column(name = "tipo_sanguineo", length = 5)
    private String tipoSanguineo;

    @Column(name = "estado_civil", length = 20)
    private String estadoCivil;

    @Column(name = "nacionalidade", length = 100)
    private String nacionalidade;

    @Column(name = "naturalidade", length = 100)
    private String naturalidade;

    @Column(name = "profissao", length = 100)
    private String profissao;

    @Column(name = "empresa", length = 150)
    private String empresa;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
            name = "pessoas_enderecos",
            joinColumns = @JoinColumn(name = "pessoa_id"),
            inverseJoinColumns = @JoinColumn(name = "endereco_id")
    )
    private Set<EnderecoEntity> enderecos = new HashSet<>();

    @OneToMany(mappedBy = "pessoa", fetch = FetchType.LAZY)
    private Set<UsuarioEntity> usuarios = new HashSet<>();

    @Column(name = "id_situacao", nullable = false)
    private Integer idSituacao;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    public PessoaEntity() {
    }

    @PrePersist
    protected void onCreate() {
        this.criadoEm = LocalDateTime.now();
        this.atualizadoEm = LocalDateTime.now();
        if (this.idSituacao == null) {
            this.idSituacao = 1;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }

    public int getIdade() {
        if (dataNascimento == null) return 0;
        return Period.between(dataNascimento, LocalDate.now()).getYears();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getSobrenome() { return sobrenome; }
    public void setSobrenome(String sobrenome) { this.sobrenome = sobrenome; }

    public String getCpf() { return cpf; }
    public void setCpf(String cpf) { this.cpf = cpf; }

    public String getRg() { return rg; }
    public void setRg(String rg) { this.rg = rg; }

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

    public LocalDate getDataNascimento() {
        return dataNascimento;
    }

    public void setDataNascimento(LocalDate dataNascimento) {
        this.dataNascimento = dataNascimento;
    }

    public Set<EnderecoEntity> getEnderecos() {
        return enderecos;
    }

    public void setEnderecos(Set<EnderecoEntity> enderecos) {
        this.enderecos = enderecos;
    }

    public void adicionarEndereco(EnderecoEntity endereco) {
        this.enderecos.add(endereco);
        endereco.getPessoas().add(this);
    }

    public void removerEndereco(EnderecoEntity endereco) {
        this.enderecos.remove(endereco);
        endereco.getPessoas().remove(this);
    }

    public Set<UsuarioEntity> getUsuarios() {
        return usuarios;
    }

    public Integer getIdSituacao() {
        return idSituacao;
    }

    public void setIdSituacao(Integer idSituacao) {
        this.idSituacao = idSituacao;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public LocalDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PessoaEntity that = (PessoaEntity) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

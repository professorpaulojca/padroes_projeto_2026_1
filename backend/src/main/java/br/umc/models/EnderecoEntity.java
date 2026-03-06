package br.umc.models;

import br.umc.models.enums.EnderecoPrincipal;
import br.umc.models.enums.TipoEndereco;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "enderecos")
public class EnderecoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cep", nullable = false, length = 9)
    private String cep;

    @Column(name = "logradouro", nullable = false, length = 200)
    private String logradouro;

    @Column(name = "numero", nullable = false, length = 20)
    private String numero;

    @Column(name = "complemento", length = 100)
    private String complemento;

    @Column(name = "bairro", length = 100)
    private String bairro;

    @Column(name = "cidade", nullable = false, length = 100)
    private String cidade;

    @Column(name = "estado", nullable = false, length = 2)
    private String estado;

    @Column(name = "pais", nullable = false, length = 50)
    private String pais;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_endereco", nullable = false, length = 20)
    private TipoEndereco tipoEndereco;

    @Enumerated(EnumType.STRING)
    @Column(name = "endereco_principal", nullable = false, length = 3)
    private EnderecoPrincipal enderecoPrincipal;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @ManyToMany(mappedBy = "enderecos", fetch = FetchType.LAZY)
    private Set<PessoaEntity> pessoas = new HashSet<>();

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;

    public EnderecoEntity() {
    }

    @PrePersist
    protected void onCreate() {
        this.criadoEm = LocalDateTime.now();
        this.atualizadoEm = LocalDateTime.now();
        if (this.pais == null || this.pais.isBlank()) {
            this.pais = "Brasil";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.atualizadoEm = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getLogradouro() {
        return logradouro;
    }

    public void setLogradouro(String logradouro) {
        this.logradouro = logradouro;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getPais() {
        return pais;
    }

    public void setPais(String pais) {
        this.pais = pais;
    }

    public TipoEndereco getTipoEndereco() {
        return tipoEndereco;
    }

    public void setTipoEndereco(TipoEndereco tipoEndereco) {
        this.tipoEndereco = tipoEndereco;
    }

    public EnderecoPrincipal getEnderecoPrincipal() {
        return enderecoPrincipal;
    }

    public void setEnderecoPrincipal(EnderecoPrincipal enderecoPrincipal) {
        this.enderecoPrincipal = enderecoPrincipal;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Set<PessoaEntity> getPessoas() {
        return pessoas;
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
        EnderecoEntity that = (EnderecoEntity) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

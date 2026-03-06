package br.umc.audit;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_usuario", columnList = "usuario_email"),
        @Index(name = "idx_audit_acao", columnList = "acao"),
        @Index(name = "idx_audit_entidade", columnList = "entidade"),
        @Index(name = "idx_audit_criado_em", columnList = "criado_em")
})
public class AuditLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_email", length = 150)
    private String usuarioEmail;

    @Column(name = "usuario_perfil", length = 20)
    private String usuarioPerfil;

    @Column(name = "acao", nullable = false, length = 50)
    private String acao;

    @Column(name = "entidade", nullable = false, length = 100)
    private String entidade;

    @Column(name = "entidade_id", length = 100)
    private String entidadeId;

    @Column(name = "classe_origem", length = 200)
    private String classeOrigem;

    @Column(name = "metodo_origem", length = 200)
    private String metodoOrigem;

    @Column(name = "ip_origem", length = 50)
    private String ipOrigem;

    @Column(name = "dado_anterior", columnDefinition = "TEXT")
    private String dadoAnterior;

    @Column(name = "dado_novo", columnDefinition = "TEXT")
    private String dadoNovo;

    @Column(name = "detalhe", columnDefinition = "TEXT")
    private String detalhe;

    @Column(name = "sucesso", nullable = false)
    private boolean sucesso;

    @Column(name = "mensagem_erro", columnDefinition = "TEXT")
    private String mensagemErro;

    @Column(name = "duracao_ms")
    private Long duracaoMs;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    public AuditLogEntity() {
    }

    @PrePersist
    protected void onCreate() {
        this.criadoEm = LocalDateTime.now();
    }

    public Long getId() { return id; }

    public String getUsuarioEmail() { return usuarioEmail; }
    public void setUsuarioEmail(String usuarioEmail) { this.usuarioEmail = usuarioEmail; }

    public String getUsuarioPerfil() { return usuarioPerfil; }
    public void setUsuarioPerfil(String usuarioPerfil) { this.usuarioPerfil = usuarioPerfil; }

    public String getAcao() { return acao; }
    public void setAcao(String acao) { this.acao = acao; }

    public String getEntidade() { return entidade; }
    public void setEntidade(String entidade) { this.entidade = entidade; }

    public String getEntidadeId() { return entidadeId; }
    public void setEntidadeId(String entidadeId) { this.entidadeId = entidadeId; }

    public String getClasseOrigem() { return classeOrigem; }
    public void setClasseOrigem(String classeOrigem) { this.classeOrigem = classeOrigem; }

    public String getMetodoOrigem() { return metodoOrigem; }
    public void setMetodoOrigem(String metodoOrigem) { this.metodoOrigem = metodoOrigem; }

    public String getIpOrigem() { return ipOrigem; }
    public void setIpOrigem(String ipOrigem) { this.ipOrigem = ipOrigem; }

    public String getDadoAnterior() { return dadoAnterior; }
    public void setDadoAnterior(String dadoAnterior) { this.dadoAnterior = dadoAnterior; }

    public String getDadoNovo() { return dadoNovo; }
    public void setDadoNovo(String dadoNovo) { this.dadoNovo = dadoNovo; }

    public String getDetalhe() { return detalhe; }
    public void setDetalhe(String detalhe) { this.detalhe = detalhe; }

    public boolean isSucesso() { return sucesso; }
    public void setSucesso(boolean sucesso) { this.sucesso = sucesso; }

    public String getMensagemErro() { return mensagemErro; }
    public void setMensagemErro(String mensagemErro) { this.mensagemErro = mensagemErro; }

    public Long getDuracaoMs() { return duracaoMs; }
    public void setDuracaoMs(Long duracaoMs) { this.duracaoMs = duracaoMs; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
}

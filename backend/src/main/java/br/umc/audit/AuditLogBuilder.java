package br.umc.audit;

/**
 * Builder fluente para construção de registros de auditoria.
 * Usado pelo AuditAspect e pelos serviços diretamente.
 */
public class AuditLogBuilder {

    private String usuarioEmail;
    private String usuarioPerfil;
    private String acao;
    private String entidade;
    private String entidadeId;
    private String classeOrigem;
    private String metodoOrigem;
    private String ipOrigem;
    private String dadoAnterior;
    private String dadoNovo;
    private String detalhe;
    private boolean sucesso = true;
    private String mensagemErro;
    private Long duracaoMs;

    private AuditLogBuilder() {
    }

    public static AuditLogBuilder novo() {
        return new AuditLogBuilder();
    }

    public AuditLogBuilder usuario(String email, String perfil) {
        this.usuarioEmail = email;
        this.usuarioPerfil = perfil;
        return this;
    }

    public AuditLogBuilder acao(AuditAction acao) {
        this.acao = acao.name();
        return this;
    }

    public AuditLogBuilder acao(String acao) {
        this.acao = acao;
        return this;
    }

    public AuditLogBuilder entidade(String entidade) {
        this.entidade = entidade;
        return this;
    }

    public AuditLogBuilder entidadeId(Object id) {
        this.entidadeId = id != null ? id.toString() : null;
        return this;
    }

    public AuditLogBuilder origem(String classe, String metodo) {
        this.classeOrigem = classe;
        this.metodoOrigem = metodo;
        return this;
    }

    public AuditLogBuilder ip(String ip) {
        this.ipOrigem = ip;
        return this;
    }

    public AuditLogBuilder dadoAnterior(String json) {
        this.dadoAnterior = json;
        return this;
    }

    public AuditLogBuilder dadoNovo(String json) {
        this.dadoNovo = json;
        return this;
    }

    public AuditLogBuilder detalhe(String detalhe) {
        this.detalhe = detalhe;
        return this;
    }

    public AuditLogBuilder sucesso() {
        this.sucesso = true;
        this.mensagemErro = null;
        return this;
    }

    public AuditLogBuilder falha(String mensagemErro) {
        this.sucesso = false;
        this.mensagemErro = mensagemErro;
        return this;
    }

    public AuditLogBuilder duracao(long ms) {
        this.duracaoMs = ms;
        return this;
    }

    public AuditLogBuilder fromContext() {
        this.usuarioEmail = AuditContext.getUsuarioEmail();
        this.usuarioPerfil = AuditContext.getUsuarioPerfil();
        this.ipOrigem = AuditContext.getIp();
        return this;
    }

    public AuditLogEntity build() {
        AuditLogEntity entity = new AuditLogEntity();
        entity.setUsuarioEmail(usuarioEmail != null ? usuarioEmail : "anonimo");
        entity.setUsuarioPerfil(usuarioPerfil);
        entity.setAcao(acao != null ? acao : "DESCONHECIDO");
        entity.setEntidade(entidade != null ? entidade : "DESCONHECIDA");
        entity.setEntidadeId(entidadeId);
        entity.setClasseOrigem(classeOrigem);
        entity.setMetodoOrigem(metodoOrigem);
        entity.setIpOrigem(ipOrigem);
        entity.setDadoAnterior(dadoAnterior);
        entity.setDadoNovo(dadoNovo);
        entity.setDetalhe(detalhe);
        entity.setSucesso(sucesso);
        entity.setMensagemErro(mensagemErro);
        entity.setDuracaoMs(duracaoMs);
        return entity;
    }
}

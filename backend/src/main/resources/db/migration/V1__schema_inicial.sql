-- V1: Schema inicial completo
-- Criacao de todas as tabelas do sistema

CREATE TABLE IF NOT EXISTS pessoas (
    id               BIGSERIAL PRIMARY KEY,
    nome             VARCHAR(150)  NOT NULL,
    data_nascimento  DATE          NOT NULL,
    id_situacao      INTEGER       NOT NULL DEFAULT 1,
    criado_em        TIMESTAMP     NOT NULL,
    atualizado_em    TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enderecos (
    id                  BIGSERIAL PRIMARY KEY,
    cep                 VARCHAR(9)   NOT NULL,
    logradouro          VARCHAR(200) NOT NULL,
    numero              VARCHAR(20)  NOT NULL,
    complemento         VARCHAR(100),
    bairro              VARCHAR(100),
    cidade              VARCHAR(100) NOT NULL,
    estado              VARCHAR(2)   NOT NULL,
    pais                VARCHAR(50)  NOT NULL,
    tipo_endereco       VARCHAR(20)  NOT NULL,
    endereco_principal  VARCHAR(3)   NOT NULL,
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,
    id_situacao         INTEGER      NOT NULL DEFAULT 1,
    criado_em           TIMESTAMP    NOT NULL,
    atualizado_em       TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pessoas_enderecos (
    pessoa_id    BIGINT  NOT NULL REFERENCES pessoas(id),
    endereco_id  BIGINT  NOT NULL REFERENCES enderecos(id),
    ativo        BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT uk_pessoas_enderecos UNIQUE (pessoa_id, endereco_id)
);

CREATE TABLE IF NOT EXISTS usuarios (
    id                       BIGSERIAL    PRIMARY KEY,
    email                    VARCHAR(150) NOT NULL UNIQUE,
    senha                    VARCHAR(255) NOT NULL,
    nome_exibicao            VARCHAR(100),
    perfil                   VARCHAR(20)  NOT NULL,
    ativo                    BOOLEAN      NOT NULL,
    id_situacao              INTEGER      NOT NULL DEFAULT 1,
    token_reset_senha        VARCHAR(255),
    token_reset_expiracao    TIMESTAMP,
    pessoa_id                BIGINT REFERENCES pessoas(id),
    criado_em                TIMESTAMP    NOT NULL,
    atualizado_em            TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    usuario_email   VARCHAR(150),
    usuario_perfil  VARCHAR(20),
    acao            VARCHAR(50)  NOT NULL,
    entidade        VARCHAR(100) NOT NULL,
    entidade_id     VARCHAR(100),
    classe_origem   VARCHAR(200),
    metodo_origem   VARCHAR(200),
    ip_origem       VARCHAR(50),
    dado_anterior   TEXT,
    dado_novo       TEXT,
    detalhe         TEXT,
    sucesso         BOOLEAN      NOT NULL,
    mensagem_erro   TEXT,
    duracao_ms      BIGINT,
    criado_em       TIMESTAMP    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_usuario   ON audit_logs(usuario_email);
CREATE INDEX IF NOT EXISTS idx_audit_acao      ON audit_logs(acao);
CREATE INDEX IF NOT EXISTS idx_audit_entidade  ON audit_logs(entidade);
CREATE INDEX IF NOT EXISTS idx_audit_criado_em ON audit_logs(criado_em);

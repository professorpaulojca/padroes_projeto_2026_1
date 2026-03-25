-- V5: Adiciona campos extras à tabela de pessoas conforme protótipos

ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS sobrenome        VARCHAR(150);
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS cpf              VARCHAR(14);
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS rg               VARCHAR(20);
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS sexo             VARCHAR(20);
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS email            VARCHAR(150);
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS telefone         VARCHAR(20);
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS celular          VARCHAR(20);
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS observacoes      VARCHAR(500);
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS tipo_sanguineo   VARCHAR(5);
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS estado_civil     VARCHAR(20);
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS nacionalidade    VARCHAR(100);
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS naturalidade     VARCHAR(100);
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS profissao        VARCHAR(100);
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS empresa          VARCHAR(150);

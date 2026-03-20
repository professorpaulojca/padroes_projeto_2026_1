-- V2: Soft delete - adiciona id_situacao nas tabelas de negocio
-- e coluna ativo na tabela de associacao pessoas_enderecos
-- Idempotente: usa ADD COLUMN IF NOT EXISTS
-- 1 = Ativo, 2 = Inativo, 3 = Excluido

-- pessoas
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS id_situacao INTEGER;
UPDATE pessoas SET id_situacao = 1 WHERE id_situacao IS NULL;
ALTER TABLE pessoas ALTER COLUMN id_situacao SET NOT NULL;
ALTER TABLE pessoas ALTER COLUMN id_situacao SET DEFAULT 1;

-- enderecos
ALTER TABLE enderecos ADD COLUMN IF NOT EXISTS id_situacao INTEGER;
UPDATE enderecos SET id_situacao = 1 WHERE id_situacao IS NULL;
ALTER TABLE enderecos ALTER COLUMN id_situacao SET NOT NULL;
ALTER TABLE enderecos ALTER COLUMN id_situacao SET DEFAULT 1;

-- usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS id_situacao INTEGER;
UPDATE usuarios SET id_situacao = CASE WHEN ativo = true THEN 1 ELSE 2 END WHERE id_situacao IS NULL;
ALTER TABLE usuarios ALTER COLUMN id_situacao SET NOT NULL;
ALTER TABLE usuarios ALTER COLUMN id_situacao SET DEFAULT 1;

-- pessoas_enderecos: soft delete do vinculo + unique constraint para ON CONFLICT upsert
ALTER TABLE pessoas_enderecos ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE pessoas_enderecos DROP CONSTRAINT IF EXISTS uk_pessoas_enderecos;
ALTER TABLE pessoas_enderecos ADD CONSTRAINT uk_pessoas_enderecos UNIQUE (pessoa_id, endereco_id);

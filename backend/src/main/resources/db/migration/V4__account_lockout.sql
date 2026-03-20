-- Adiciona campos para controle de bloqueio de conta (Account Lockout)
ALTER TABLE usuarios ADD COLUMN tentativas_falhas INTEGER NOT NULL DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN bloqueado_ate TIMESTAMP;

-- Índice para consultas de desbloqueio automático
CREATE INDEX idx_usuarios_bloqueado_ate ON usuarios(bloqueado_ate) WHERE bloqueado_ate IS NOT NULL;

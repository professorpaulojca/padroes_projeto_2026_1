-- V3: Indices de performance em id_situacao
-- Otimiza queries com filtro id_situacao != 3 (soft delete)

CREATE INDEX IF NOT EXISTS idx_pessoas_situacao    ON pessoas(id_situacao);
CREATE INDEX IF NOT EXISTS idx_enderecos_situacao  ON enderecos(id_situacao);
CREATE INDEX IF NOT EXISTS idx_usuarios_situacao   ON usuarios(id_situacao);
CREATE INDEX IF NOT EXISTS idx_pessoas_enderecos_ativo ON pessoas_enderecos(ativo);

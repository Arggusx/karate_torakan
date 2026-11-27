-- =============================================================================
-- 013 — Log de auditoria: quem fez o quê, quando.
--
-- Uma linha por ação que importa: login, logout, troca de senha, cadastro e
-- desativação de conta, mudança de faixa ou turma, redefinição de senha,
-- baixa e estorno de pagamento, chamada, programa, provas.
--
-- `ator_id` é quem fez; `alvo_id`, a conta afetada (quando houver). O IP não é
-- guardado em claro, só um hash com SESSION_SECRET (dado mínimo, LGPD).
-- `detalhes` guarda só o necessário para entender a ação (ex.: faixa nova),
-- nunca senha.
--
-- Linhas com mais de 1 ano são apagadas pelo próprio app (src/server/auditoria.ts).
-- Quem lê: só o admin, por GET /api/academia/auditoria.
--
-- Aditiva e idempotente.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS auditoria (
  id         BIGSERIAL   PRIMARY KEY,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now(),
  ator_id    INTEGER     REFERENCES users(id) ON DELETE SET NULL,
  acao       TEXT        NOT NULL,
  alvo_id    INTEGER     REFERENCES users(id) ON DELETE SET NULL,
  detalhes   JSONB,
  ip_hash    TEXT
);

CREATE INDEX IF NOT EXISTS auditoria_criado_em_idx ON auditoria (criado_em DESC);
CREATE INDEX IF NOT EXISTS auditoria_ator_idx ON auditoria (ator_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS auditoria_alvo_idx ON auditoria (alvo_id, criado_em DESC);

COMMIT;

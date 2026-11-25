-- =============================================================================
-- 010 — Limite de tentativas de login.
--
-- Cada linha é um erro de senha. `chave` é "u:<usuário>" ou "ip:<hash>": o
-- IP nunca é guardado em claro, só um hash com SESSION_SECRET.
-- A regra (5 erros por usuário ou 20 por IP em 15 minutos) está em
-- src/server/tentativas.ts; login certo apaga as linhas do usuário, e linhas
-- com mais de um dia são limpas no caminho.
--
-- Aditiva e idempotente.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS login_tentativas (
  id         BIGSERIAL   PRIMARY KEY,
  chave      TEXT        NOT NULL,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS login_tentativas_chave_criado_em_idx
  ON login_tentativas (chave, criado_em);

COMMIT;

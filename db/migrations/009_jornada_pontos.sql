-- =============================================================================
-- 009 — Pontos da Jornada e ranking semanal e mensal.
--
-- Cada linha é um evento pontuado (uma rodada de perguntas, um nível de faixa
-- vencido numa ilha, um trecho de kata na ordem...). O ranking soma as linhas
-- da semana (segunda a domingo) ou do mês, no horário de Brasília.
--
-- `chave` impede contar duas vezes o mesmo evento: as de "primeira vez"
-- (faixa:kihon:3, aula:katas...) só entram uma vez por pessoa; as rodadas
-- que podem repetir chegam com uma chave aleatória.
--
-- Os pontos de cada evento e o teto diário são calculados no servidor
-- (src/services/pontuacao.ts); o CHECK abaixo é só uma rede de segurança.
--
-- Aditiva e idempotente.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS jornada_pontos (
  id          BIGSERIAL   PRIMARY KEY,
  usuario_id  INTEGER     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo        TEXT        NOT NULL,
  chave       TEXT        NOT NULL,
  pontos      INTEGER     NOT NULL CHECK (pontos > 0 AND pontos <= 300),
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (usuario_id, chave)
);

CREATE INDEX IF NOT EXISTS jornada_pontos_criado_em_idx
  ON jornada_pontos (criado_em);

CREATE INDEX IF NOT EXISTS jornada_pontos_usuario_idx
  ON jornada_pontos (usuario_id, criado_em);

COMMIT;

-- =============================================================================
-- 007 — Provas teóricas da faixa (portal do aluno).
--
-- Cada tentativa guarda as perguntas COM o gabarito. O navegador recebe as
-- perguntas sem a resposta certa; a correção acontece no servidor, a partir
-- desta linha. Assim ninguém aprova mandando "acertei 12" pela rede.
--
-- `faixa` é a faixa do aluno no momento da prova: se ele graduar depois, o
-- histórico continua dizendo de qual programa aquela prova era.
--
-- Aditiva e idempotente.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS provas (
  id            SERIAL PRIMARY KEY,
  aluno_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  faixa         VARCHAR(60) NOT NULL,
  perguntas     JSONB NOT NULL,
  respostas     JSONB,
  acertos       SMALLINT,
  total         SMALLINT NOT NULL,
  aprovado      BOOLEAN,
  iniciada_em   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  concluida_em  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS provas_aluno_idx ON provas (aluno_id, iniciada_em DESC);

COMMIT;

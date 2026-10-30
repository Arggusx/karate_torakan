-- =============================================================================
-- 007 — Provas liberadas pelo professor (portal do aluno).
--
-- provas_modelo: a prova que o professor monta (gerada pela faixa ou feita à
-- mão) e edita à vontade antes de liberar. Guarda as perguntas COM gabarito.
--
-- provas: uma prova liberada para UM aluno. Na liberação, as perguntas do
-- modelo são copiadas para cá: editar o modelo depois não mexe na prova que o
-- aluno já recebeu. O navegador recebe as perguntas sem a resposta certa; a
-- correção acontece no servidor, a partir desta linha.
--
-- `faixa` é a faixa do aluno no momento da liberação: se ele graduar depois,
-- o histórico continua dizendo de qual programa aquela prova era.
--
-- Aditiva e idempotente.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS provas_modelo (
  id             SERIAL PRIMARY KEY,
  titulo         VARCHAR(120) NOT NULL,
  -- Faixa para a qual a prova foi pensada (vazio = livre).
  faixa          VARCHAR(60) NOT NULL DEFAULT '',
  perguntas      JSONB NOT NULL,
  -- Acertos para aprovar.
  minimo         SMALLINT NOT NULL,
  criada_por     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  criada_em      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  atualizada_em  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS provas (
  id            SERIAL PRIMARY KEY,
  aluno_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  modelo_id     INTEGER REFERENCES provas_modelo(id) ON DELETE SET NULL,
  titulo        VARCHAR(120) NOT NULL,
  faixa         VARCHAR(60) NOT NULL,
  perguntas     JSONB NOT NULL,
  respostas     JSONB,
  acertos       SMALLINT,
  total         SMALLINT NOT NULL,
  minimo        SMALLINT NOT NULL,
  aprovado      BOOLEAN,
  liberada_por  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  liberada_em   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  iniciada_em   TIMESTAMPTZ,
  concluida_em  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS provas_aluno_idx ON provas (aluno_id, liberada_em DESC);
CREATE INDEX IF NOT EXISTS provas_modelo_idx ON provas (modelo_id);

COMMIT;

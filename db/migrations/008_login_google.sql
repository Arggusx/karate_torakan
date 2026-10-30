-- =============================================================================
-- 008 — Login com Google (por vínculo) e senha própria.
--
-- O Google NÃO cria conta: só entra numa conta que já existe e que o próprio
-- dono vinculou depois de entrar com usuário e senha. Por isso o elo é o
-- `google_sub` (o identificador fixo da conta Google), e não o e-mail — o
-- cadastro aceita "e-mail do aluno ou do responsável", e um pai com dois
-- filhos no dojo teria o mesmo e-mail em duas contas.
--
-- `tem_senha` = false quando a pessoa vinculou o Google no primeiro acesso:
-- a senha temporária que o professor entregou é descartada (vira um hash
-- aleatório) e a conta passa a entrar só pelo Google até ela criar uma senha.
--
-- Aditiva e idempotente.
-- =============================================================================

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub   TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tem_senha    BOOLEAN NOT NULL DEFAULT true;

CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub_key
  ON users (google_sub) WHERE google_sub IS NOT NULL;

COMMIT;

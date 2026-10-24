-- =============================================================================
-- 006 — Foto de perfil e autoatendimento da conta.
--
-- O aluno passa a poder, depois do primeiro acesso, trocar o próprio usuário e
-- a própria senha, e enviar uma foto de perfil. A foto é guardada como data URL
-- (imagem já reduzida a um quadrado pequeno no navegador antes de subir), o que
-- evita depender de armazenamento de blobs para uma academia com poucas contas.
--
-- Aditiva e idempotente.
-- =============================================================================

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMIT;

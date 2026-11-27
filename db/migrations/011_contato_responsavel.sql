-- 011 — Contato do responsável e registro do aceite de WhatsApp.
--
-- Alunos menores de idade (a turma infantil é de 7 a 12 anos) precisam de um
-- adulto como contato: é para ele que vão os avisos de mensalidade e é ele
-- quem consente com o WhatsApp (LGPD, art. 14). Para maiores de idade estes
-- campos ficam vazios e o contato é o próprio `telefone`.
--
-- `whatsapp_optin_por` guarda quem deu o aceite ('titular' ou 'responsavel'),
-- junto da data que já existe em `whatsapp_optin_em`.
--
-- Rodar antes de publicar o código que usa estas colunas. Idempotente.

ALTER TABLE users ADD COLUMN IF NOT EXISTS responsavel_nome VARCHAR(120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS responsavel_parentesco VARCHAR(40);
ALTER TABLE users ADD COLUMN IF NOT EXISTS responsavel_telefone VARCHAR(30);
ALTER TABLE users ADD COLUMN IF NOT EXISTS responsavel_email VARCHAR(160);
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_optin_por VARCHAR(12);

-- 012 — Versão da sessão.
--
-- O cookie de sessão leva a versão da conta. Sair, trocar a senha ou ter a
-- senha redefinida pela equipe soma 1 aqui, e todo cookie emitido antes deixa
-- de valer, em qualquer aparelho.
--
-- Os cookies já emitidos não têm versão e valem como 0: ninguém é deslogado
-- ao rodar esta migração. O código funciona sem ela (só não revoga sessões),
-- então a ordem migração/deploy não importa.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS sessao_versao integer NOT NULL DEFAULT 0;

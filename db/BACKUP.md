# Backup do banco

O plano grátis do Neon guarda só **6 horas** de histórico: um erro percebido
no dia seguinte não tem volta pelo painel. Por isso existe um backup próprio,
fora do Neon, feito pelo GitHub Actions
([`.github/workflows/backup-banco.yml`](../.github/workflows/backup-banco.yml)).

| Quando | O quê |
|---|---|
| Todo dia, 03:00 (Brasília) | `pg_dump` da produção, criptografado (AES-256), guardado 30 dias como artefato do Actions |
| Toda segunda, 04:00 | O mesmo, e também restaura o dump na branch `restauracao-teste` do Neon e confere tabela por tabela |
| À mão | Actions › **Backup do banco** › Run workflow (marque "Também restaurar" para testar) |

O arquivo sai criptografado porque o artefato fica no GitHub e tem dados de
alunos, inclusive menores. Sem a `BACKUP_SENHA` ninguém lê.

## Configurar (uma vez)

No GitHub: **Settings › Secrets and variables › Actions › New repository secret**.

| Segredo | O que colocar |
|---|---|
| `DATABASE_URL` | A connection string da branch **production** do Neon. |
| `BACKUP_SENHA` | Uma senha longa, só para os backups. **Guarde também fora do GitHub** (gerenciador de senhas): sem ela o backup não abre. |
| `BACKUP_TESTE_URL` | A connection string da branch **restauracao-teste** do Neon. Nunca a da produção: a restauração apaga e recria tudo no destino (o workflow recusa se as duas forem iguais). |

Depois, rode o workflow à mão uma vez, com "Também restaurar" marcado, e veja
se termina verde.

## Restaurar de verdade

1. Em Actions › Backup do banco, abra a execução do dia desejado e baixe o
   artefato `backup-torakan-AAAA-MM-DD.dump`.
2. Descriptografe:

   ```bash
   gpg --decrypt torakan-AAAA-MM-DD.dump.gpg > torakan.dump
   ```

3. **Restaure primeiro numa branch nova do Neon**, nunca direto na produção, e
   confira os dados:

   ```bash
   pg_restore --clean --if-exists --no-owner --no-privileges --dbname "<url da branch nova>" torakan.dump
   ```

4. Se estiver tudo certo, no painel do Neon troque a branch padrão para a
   restaurada (ou restaure por cima da produção, com o site em manutenção).

O `pg_restore` precisa ser da versão 18 (a do Neon) ou mais nova. Sem ele
instalado, use o Docker: `docker run --rm -v "$PWD:/b" postgres:18 pg_restore ...`.

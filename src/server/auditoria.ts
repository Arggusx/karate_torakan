import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { sql } from "@/lib/db";

/**
 * Log de auditoria (migração 013): quem fez o quê, quando.
 *
 * Gravar nunca derruba a ação principal: se a tabela não existir ou o banco
 * falhar, o erro vai para o log da Vercel e a rota segue. Ninguém deixa de
 * conseguir dar baixa numa mensalidade por causa do log.
 *
 * Não guarde senha nem dado sensível em `detalhes`: o necessário para entender
 * a ação (faixa nova, turma, valor) e só.
 */

export type AcaoAuditoria =
  | "login"
  | "login.google"
  | "logout"
  | "conta.senha"
  | "conta.usuario"
  | "conta.contato"
  | "conta.google.vincular"
  | "conta.google.desvincular"
  | "aluno.criar"
  | "aluno.alterar"
  | "aluno.desmatricular"
  | "professor.criar"
  | "professor.desativar"
  | "senha.redefinir"
  | "pagamento.baixa"
  | "pagamento.estorno"
  | "chamada.salvar"
  | "programa.marcar"
  | "prova.liberar"
  | "prova.cancelar";

/** Linhas guardadas por 1 ano; o resto é apagado de vez em quando. */
const DIAS_DE_GUARDA = 365;

async function ipHash(): Promise<string | null> {
  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
    if (!ip) return null;
    return createHash("sha256")
      .update(`${process.env.SESSION_SECRET ?? ""}:${ip}`)
      .digest("hex")
      .slice(0, 32);
  } catch {
    return null; // fora de uma requisição (cron, script)
  }
}

export async function registrarAuditoria(
  acao: AcaoAuditoria,
  dados: { atorId: number | null; alvoId?: number | null; detalhes?: Record<string, unknown> },
): Promise<void> {
  try {
    await sql`
      INSERT INTO auditoria (ator_id, acao, alvo_id, detalhes, ip_hash)
      VALUES (${dados.atorId}, ${acao}, ${dados.alvoId ?? null},
              ${dados.detalhes ? JSON.stringify(dados.detalhes) : null}::jsonb, ${await ipHash()})`;
    // Limpeza preguiçosa: em ~1% das gravações, apaga o que passou do prazo.
    if (Math.random() < 0.01) {
      await sql`DELETE FROM auditoria WHERE criado_em < now() - make_interval(days => ${DIAS_DE_GUARDA})`;
    }
  } catch (erro) {
    console.error("[auditoria]", acao, erro instanceof Error ? erro.message : erro);
  }
}

export interface LinhaAuditoria {
  id: number;
  criado_em: string;
  acao: string;
  ator: string | null;
  alvo: string | null;
  detalhes: Record<string, unknown> | null;
}

/** As últimas ações, com filtro opcional por conta (como autor ou como alvo). */
export async function lerAuditoria(filtro: { contaId?: number; limite?: number }): Promise<LinhaAuditoria[]> {
  const limite = Math.min(Math.max(filtro.limite ?? 100, 1), 500);
  const conta = filtro.contaId ?? null;
  return (await sql`
    SELECT a.id, a.criado_em::text, a.acao,
           ator.usuario AS ator, alvo.usuario AS alvo, a.detalhes
      FROM auditoria a
      LEFT JOIN users ator ON ator.id = a.ator_id
      LEFT JOIN users alvo ON alvo.id = a.alvo_id
     WHERE ${conta}::int IS NULL OR a.ator_id = ${conta} OR a.alvo_id = ${conta}
     ORDER BY a.criado_em DESC
     LIMIT ${limite}`) as LinhaAuditoria[];
}

export function semTabelaDeAuditoria(erro: unknown) {
  return erro instanceof Error && /relation "auditoria" does not exist/i.test(erro.message);
}

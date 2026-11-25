import "server-only";
import { createHash } from "node:crypto";
import { sql } from "@/lib/db";

/**
 * Limite de tentativas de login (migration 010).
 *
 * Conta os erros de senha dos últimos 15 minutos por dois caminhos:
 *  - por usuário: 5 erros travam aquele usuário (protege a conta);
 *  - por IP: 20 erros travam aquele IP (protege contra quem testa vários
 *    usuários de uma vez).
 * Login certo zera o contador do usuário.
 *
 * O IP não é guardado: vira um hash com SESSION_SECRET, que só serve para
 * comparar tentativas (LGPD: dado mínimo).
 *
 * Sem a tabela (migration ainda não aplicada), o limite fica desligado e o
 * login segue funcionando.
 */

const JANELA_MINUTOS = 15;
const MAX_POR_USUARIO = 5;
const MAX_POR_IP = 20;

const chaveUsuario = (usuario: string) => `u:${usuario.trim().toLowerCase()}`;

function chaveIp(ip: string | null): string | null {
  if (!ip) return null;
  const sal = process.env.SESSION_SECRET ?? "";
  return `ip:${createHash("sha256").update(`${sal}:${ip}`).digest("hex").slice(0, 32)}`;
}

function semTabela(erro: unknown) {
  return erro instanceof Error && /relation .*login_tentativas.* does not exist/i.test(erro.message);
}

/** Minutos de espera, ou 0 se pode tentar. */
export async function esperaParaTentar(usuario: string, ip: string | null): Promise<number> {
  const ipHash = chaveIp(ip);
  try {
    const linhas = (await sql`
      SELECT chave, count(*)::int AS erros, min(criado_em) AS primeiro
        FROM login_tentativas
       WHERE criado_em > now() - make_interval(mins => ${JANELA_MINUTOS})
         AND chave IN (${chaveUsuario(usuario)}, ${ipHash ?? ""})
       GROUP BY chave`) as { chave: string; erros: number; primeiro: string }[];

    for (const linha of linhas) {
      const limite = linha.chave.startsWith("ip:") ? MAX_POR_IP : MAX_POR_USUARIO;
      if (linha.erros >= limite) {
        const libera = new Date(linha.primeiro).getTime() + JANELA_MINUTOS * 60_000;
        return Math.max(1, Math.ceil((libera - Date.now()) / 60_000));
      }
    }
    return 0;
  } catch (erro) {
    if (!semTabela(erro)) console.error("[tentativas]", erro);
    return 0;
  }
}

export async function registrarErro(usuario: string, ip: string | null): Promise<void> {
  const ipHash = chaveIp(ip);
  try {
    await sql`INSERT INTO login_tentativas (chave) VALUES (${chaveUsuario(usuario)})`;
    if (ipHash) await sql`INSERT INTO login_tentativas (chave) VALUES (${ipHash})`;
  } catch (erro) {
    if (!semTabela(erro)) console.error("[tentativas]", erro);
  }
}

/** Login certo: zera o usuário e aproveita para limpar registros velhos. */
export async function registrarAcerto(usuario: string): Promise<void> {
  try {
    await sql`DELETE FROM login_tentativas WHERE chave = ${chaveUsuario(usuario)}`;
    await sql`DELETE FROM login_tentativas WHERE criado_em < now() - interval '1 day'`;
  } catch (erro) {
    if (!semTabela(erro)) console.error("[tentativas]", erro);
  }
}

import "server-only";
import { createHash } from "node:crypto";
import { sql } from "@/lib/db";

/**
 * Limite de tentativas de login (migration 010).
 *
 * Conta os erros de senha dos últimos 15 minutos por três caminhos:
 *  - por usuário + IP: 5 erros travam aquele usuário só naquele IP. Assim
 *    um estranho não tranca a conta de ninguém: ele só se tranca;
 *  - por usuário, de qualquer IP: 30 erros travam o usuário (protege contra
 *    quem tenta a mesma conta de vários IPs; o captcha já encarece isso);
 *  - por IP: 20 erros travam aquele IP (protege contra quem testa vários
 *    usuários de uma vez).
 * Login certo zera os contadores do usuário.
 *
 * A mesma regra vale para a "senha atual" na troca de senha (chaves "s:").
 *
 * O IP não é guardado: vira um hash com SESSION_SECRET, que só serve para
 * comparar tentativas (LGPD: dado mínimo).
 *
 * Sem a tabela (migration ainda não aplicada), o limite fica desligado e o
 * login segue funcionando.
 */

const JANELA_MINUTOS = 15;
const MAX_POR_USUARIO_E_IP = 5;
const MAX_POR_USUARIO = 30;
const MAX_POR_IP = 20;

const nomeDe = (usuario: string) => usuario.trim().toLowerCase().slice(0, 80);
const chaveUsuario = (usuario: string, prefixo = "u") => `${prefixo}:${nomeDe(usuario)}`;

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const sal = process.env.SESSION_SECRET ?? "";
  return createHash("sha256").update(`${sal}:${ip}`).digest("hex").slice(0, 32);
}

const chaveIp = (ip: string | null) => {
  const h = hashIp(ip);
  return h ? `ip:${h}` : null;
};

const chaveUsuarioIp = (usuario: string, ip: string | null, prefixo = "u") => {
  const h = hashIp(ip);
  return h ? `${prefixo}ip:${h}:${nomeDe(usuario)}` : null;
};

/** Limite de cada tipo de chave. */
function limiteDa(chave: string) {
  if (chave.startsWith("ip:")) return MAX_POR_IP;
  if (/^[us]ip:/.test(chave)) return MAX_POR_USUARIO_E_IP;
  return MAX_POR_USUARIO;
}

function semTabela(erro: unknown) {
  return erro instanceof Error && /relation .*login_tentativas.* does not exist/i.test(erro.message);
}

/** Minutos de espera, ou 0 se pode tentar. */
export async function esperaParaTentar(
  usuario: string,
  ip: string | null,
  prefixo: "u" | "s" = "u",
): Promise<number> {
  const chaves = [
    chaveUsuario(usuario, prefixo),
    chaveUsuarioIp(usuario, ip, prefixo) ?? "",
    prefixo === "u" ? (chaveIp(ip) ?? "") : "",
  ];
  try {
    const linhas = (await sql`
      SELECT chave, count(*)::int AS erros, min(criado_em) AS primeiro
        FROM login_tentativas
       WHERE criado_em > now() - make_interval(mins => ${JANELA_MINUTOS})
         AND chave = ANY(${chaves})
       GROUP BY chave`) as { chave: string; erros: number; primeiro: string }[];

    for (const linha of linhas) {
      const limite = limiteDa(linha.chave);
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

export async function registrarErro(
  usuario: string,
  ip: string | null,
  prefixo: "u" | "s" = "u",
): Promise<void> {
  const chaves = [
    chaveUsuario(usuario, prefixo),
    chaveUsuarioIp(usuario, ip, prefixo),
    prefixo === "u" ? chaveIp(ip) : null,
  ].filter((c): c is string => Boolean(c));
  try {
    await sql`INSERT INTO login_tentativas (chave) SELECT unnest(${chaves}::text[])`;
  } catch (erro) {
    if (!semTabela(erro)) console.error("[tentativas]", erro);
  }
}

/** Login certo: zera o usuário e aproveita para limpar registros velhos. */
export async function registrarAcerto(usuario: string, prefixo: "u" | "s" = "u"): Promise<void> {
  try {
    await sql`
      DELETE FROM login_tentativas
       WHERE chave = ${chaveUsuario(usuario, prefixo)}
          OR (left(chave, ${prefixo.length + 3}) = ${prefixo + "ip:"}
              AND right(chave, ${nomeDe(usuario).length + 1}) = ${":" + nomeDe(usuario)})`;
    await sql`DELETE FROM login_tentativas WHERE criado_em < now() - interval '1 day'`;
  } catch (erro) {
    if (!semTabela(erro)) console.error("[tentativas]", erro);
  }
}

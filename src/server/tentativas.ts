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
 * Bloqueio crescente: no mesmo dia, quem chega a 2x o limite (IP ou
 * usuário + IP) espera 1 hora a cada novo erro; a 4x, 6 horas.
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
      SELECT chave,
             count(*) FILTER (WHERE criado_em > now() - make_interval(mins => ${JANELA_MINUTOS}))::int AS erros,
             min(criado_em) FILTER (WHERE criado_em > now() - make_interval(mins => ${JANELA_MINUTOS})) AS primeiro,
             count(*)::int AS erros_dia,
             max(criado_em) AS ultimo
        FROM login_tentativas
       WHERE criado_em > now() - interval '1 day'
         AND chave = ANY(${chaves})
       GROUP BY chave`) as {
      chave: string;
      erros: number;
      primeiro: string | null;
      erros_dia: number;
      ultimo: string;
    }[];

    let espera = 0;
    for (const linha of linhas) {
      const limite = limiteDa(linha.chave);
      const minutos = (ms: number) => Math.max(1, Math.ceil((ms - Date.now()) / 60_000));

      // Bloqueio crescente: quem insiste depois de ser travado espera cada vez
      // mais (1 hora a partir de 2x o limite no dia, 6 horas a partir de 4x).
      // Só vale para o IP e para usuário+IP: o limite do usuário de qualquer
      // IP fica em 15 minutos, para um estranho não trancar a conta do dono
      // por horas.
      const escalavel = /^(ip|uip|sip):/.test(linha.chave);
      const horasExtras = !escalavel ? 0 : linha.erros_dia >= limite * 4 ? 6 : linha.erros_dia >= limite * 2 ? 1 : 0;
      if (horasExtras > 0) {
        const libera = new Date(linha.ultimo).getTime() + horasExtras * 60 * 60_000;
        if (libera > Date.now()) espera = Math.max(espera, minutos(libera));
        continue;
      }

      if (linha.erros >= limite && linha.primeiro) {
        const libera = new Date(linha.primeiro).getTime() + JANELA_MINUTOS * 60_000;
        espera = Math.max(espera, minutos(libera));
      }
    }
    return espera;
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

/**
 * Login certo: zera o contador do usuário e o dele neste IP, e aproveita
 * para limpar registros velhos. Os erros do mesmo usuário vindos de OUTROS
 * IPs ficam: se o dono entra enquanto alguém tenta adivinhar a senha dele de
 * outro lugar, o bloqueio crescente desse outro lugar continua valendo.
 */
export async function registrarAcerto(
  usuario: string,
  ip: string | null,
  prefixo: "u" | "s" = "u",
): Promise<void> {
  try {
    await sql`
      DELETE FROM login_tentativas
       WHERE chave = ANY(${[chaveUsuario(usuario, prefixo), chaveUsuarioIp(usuario, ip, prefixo) ?? ""]})`;
    await sql`DELETE FROM login_tentativas WHERE criado_em < now() - interval '1 day'`;
  } catch (erro) {
    if (!semTabela(erro)) console.error("[tentativas]", erro);
  }
}

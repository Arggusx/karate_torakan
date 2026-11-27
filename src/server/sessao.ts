import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { sql } from "@/lib/db";
import type { Perfil } from "@/server/usuarios";

/**
 * Sessão assinada em cookie httpOnly.
 *
 * O conteúdo é legível (base64url), mas vem acompanhado de um HMAC-SHA256
 * calculado com SESSION_SECRET: qualquer alteração no payload invalida a
 * assinatura. O cookie é httpOnly, então JavaScript da página não o lê, e
 * `sameSite=lax` corta CSRF vindo de outro site.
 *
 * É isto que as rotas sensíveis usam para saber quem está chamando — o
 * cliente não decide mais o próprio papel.
 */

const NOME_COOKIE = "shotokan_sessao";
const DURACAO_SEGUNDOS = 60 * 60 * 12; // 12 horas

/**
 * Domínio do cookie. Com COOKIE_DOMAIN="torakandojo.com", a mesma sessão vale em
 * portal.torakandojo.com e academy.torakandojo.com (quem entra no portal
 * continua logado no academy). Sem a variável, o cookie fica só no endereço atual.
 *
 * O domínio só é aplicado quando a requisição vem dele mesmo: nos endereços
 * *.vercel.app (homologação, previews) o navegador recusaria um cookie de
 * outro domínio, e o login quebraria.
 */
async function dominioDoCookie(): Promise<string | undefined> {
  const dominio = process.env.COOKIE_DOMAIN?.trim().toLowerCase();
  if (!dominio) return undefined;
  const host = ((await headers()).get("host") ?? "").split(":")[0].toLowerCase();
  return host === dominio || host.endsWith(`.${dominio}`) ? dominio : undefined;
}

export interface SessaoServidor {
  id: number;
  nome: string;
  usuario: string;
  perfil: Perfil;
  /** Epoch em segundos. */
  exp: number;
  /**
   * Versão da sessão na conta (users.sessao_versao). Sair, trocar a senha ou
   * ter a senha redefinida aumenta a versão no banco, e todo cookie emitido
   * antes deixa de valer.
   */
  v?: number;
}

// ------------------------------------------------------ conferência no banco

/** O banco ainda não tem a coluna (migração 012 não rodou)? */
function semColunaVersao(erro: unknown) {
  return (
    erro instanceof Error &&
    /column .*sessao_versao.* does not exist/i.test(erro.message)
  );
}

interface ContaDaSessao {
  nome: string;
  usuario: string;
  role: Perfil;
  ativo: boolean;
  sessao_versao: number | null;
}

/**
 * Lê a conta dona da sessão. Sem a coluna de versão (banco ainda sem a
 * migração 012), confere só conta ativa e perfil — melhor do que derrubar
 * todo mundo durante o deploy.
 */
async function contaDaSessao(id: number): Promise<ContaDaSessao | null> {
  try {
    const linhas = await sql`
      SELECT nome, usuario, role, ativo, sessao_versao
        FROM users WHERE id = ${id} LIMIT 1`;
    return (linhas[0] as ContaDaSessao) ?? null;
  } catch (erro) {
    if (!semColunaVersao(erro)) throw erro;
    const linhas = await sql`
      SELECT nome, usuario, role, ativo, NULL::int AS sessao_versao
        FROM users WHERE id = ${id} LIMIT 1`;
    return (linhas[0] as ContaDaSessao) ?? null;
  }
}

/**
 * Invalida todas as sessões abertas da conta, em qualquer aparelho. Usado no
 * logout, na troca e na redefinição de senha.
 */
export async function encerrarSessoes(id: number): Promise<void> {
  try {
    await sql`
      UPDATE users SET sessao_versao = sessao_versao + 1 WHERE id = ${id}`;
  } catch (erro) {
    if (!semColunaVersao(erro)) throw erro;
  }
}

function segredo(): string {
  const valor = process.env.SESSION_SECRET;
  if (!valor || valor.length < 32) {
    throw new Error(
      "SESSION_SECRET ausente ou curto demais (mínimo 32 caracteres).",
    );
  }
  return valor;
}

function assinar(payload: string): string {
  return createHmac("sha256", segredo()).update(payload).digest("base64url");
}

export function criarToken(
  dados: Omit<SessaoServidor, "exp">,
  duracao = DURACAO_SEGUNDOS,
): string {
  const sessao: SessaoServidor = {
    ...dados,
    exp: Math.floor(Date.now() / 1000) + duracao,
  };
  const payload = Buffer.from(JSON.stringify(sessao)).toString("base64url");
  return `${payload}.${assinar(payload)}`;
}

export function lerToken(token: string | undefined): SessaoServidor | null {
  if (!token) return null;

  const [payload, assinatura] = token.split(".");
  if (!payload || !assinatura) return null;

  // Comparação em tempo constante evita vazar informação por timing.
  const esperada = Buffer.from(assinar(payload));
  const recebida = Buffer.from(assinatura);
  if (
    esperada.length !== recebida.length ||
    !timingSafeEqual(esperada, recebida)
  ) {
    return null;
  }

  try {
    const sessao = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as SessaoServidor;

    if (!sessao.exp || sessao.exp * 1000 < Date.now()) return null;
    return sessao;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------- cookie

export async function gravarCookieSessao(
  dados: Omit<SessaoServidor, "exp" | "v">,
): Promise<void> {
  const conta = await contaDaSessao(dados.id);
  const v = conta?.sessao_versao ?? undefined;
  const jarra = await cookies();
  jarra.set(NOME_COOKIE, criarToken({ ...dados, v }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    domain: await dominioDoCookie(),
    maxAge: DURACAO_SEGUNDOS,
  });
}

export async function limparCookieSessao(): Promise<void> {
  const jarra = await cookies();
  jarra.delete({ name: NOME_COOKIE, path: "/", domain: await dominioDoCookie() });
}

/**
 * Quem está chamando. Além da assinatura do cookie, confere no banco a cada
 * pedido: a conta precisa existir e estar ativa, e a versão da sessão precisa
 * bater. Nome, usuário e perfil vêm do banco — uma mudança de perfil vale na
 * hora, sem esperar o cookie expirar.
 */
export async function sessaoAtual(): Promise<SessaoServidor | null> {
  const jarra = await cookies();
  const token = lerToken(jarra.get(NOME_COOKIE)?.value);
  if (!token) return null;

  const conta = await contaDaSessao(token.id);
  if (!conta || !conta.ativo) return null;
  if (conta.sessao_versao !== null && (token.v ?? 0) !== conta.sessao_versao) {
    return null;
  }

  return {
    ...token,
    nome: conta.nome,
    usuario: conta.usuario,
    perfil: conta.role,
  };
}

// ---------------------------------------------------------- guardas

export class SemPermissao extends Error {
  constructor(
    message: string,
    readonly status: 401 | 403,
  ) {
    super(message);
  }
}

/** Exige uma sessão válida com um dos perfis informados. */
export async function exigirPerfil(
  perfis: Perfil[],
): Promise<SessaoServidor> {
  const sessao = await sessaoAtual();

  if (!sessao) {
    throw new SemPermissao("Faça login para continuar.", 401);
  }
  if (!perfis.includes(sessao.perfil)) {
    throw new SemPermissao(
      "Sua conta não tem permissão para esta ação.",
      403,
    );
  }
  return sessao;
}

/** Converte a exceção em resposta JSON; devolve null se não for de permissão. */
export function respostaDeErro(erro: unknown) {
  if (erro instanceof SemPermissao) {
    return { erro: erro.message, status: erro.status };
  }
  return null;
}

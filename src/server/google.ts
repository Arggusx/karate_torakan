import "server-only";
import { randomBytes } from "node:crypto";

/**
 * Login com Google (OAuth 2.0 / OpenID Connect, fluxo "authorization code").
 *
 * Feito à mão, sem biblioteca de autenticação: o Torakan já tem sessão
 * própria (cookie assinado em sessao.ts), e o Google aqui só responde "esta
 * pessoa é a conta X". Quem decide se ela entra é o vínculo guardado no banco.
 *
 * Variáveis de ambiente: GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET. Sem elas, o
 * botão some e as rotas respondem "indisponível".
 */

const AUTORIZAR = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN = "https://oauth2.googleapis.com/token";
const EMISSORES = ["https://accounts.google.com", "accounts.google.com"];

export const COOKIE_ESTADO = "torakan_google";

export function googleConfigurado() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/** O endereço de retorno precisa estar cadastrado no Google Cloud, igualzinho. */
export const enderecoDeRetorno = (origem: string) => `${origem}/api/auth/google/callback`;

export type ModoGoogle = "entrar" | "vincular";

export interface EstadoGoogle {
  estado: string;
  modo: ModoGoogle;
  /** Para onde voltar depois (só caminho relativo do próprio site). */
  volta: string;
}

/** Só aceita caminho interno ("/portal/aluno"), nunca outro site. */
export function voltaSegura(valor: string | null | undefined, padrao: string) {
  if (!valor || !valor.startsWith("/") || valor.startsWith("//") || valor.includes("\\")) {
    return padrao;
  }
  return valor;
}

export function novoEstado(modo: ModoGoogle, volta: string): EstadoGoogle {
  return { estado: randomBytes(24).toString("base64url"), modo, volta };
}

export function urlDeAutorizacao(origem: string, estado: string) {
  const parametros = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID ?? "",
    redirect_uri: enderecoDeRetorno(origem),
    response_type: "code",
    scope: "openid email profile",
    state: estado,
    // Deixa escolher a conta: num celular de família costuma haver várias.
    prompt: "select_account",
    access_type: "online",
  });
  return `${AUTORIZAR}?${parametros}`;
}

export interface IdentidadeGoogle {
  sub: string;
  email: string;
  nome: string;
}

/**
 * Troca o código pelo id_token e confere o que importa nele.
 *
 * A assinatura do token não é verificada aqui de propósito: ele chega direto
 * do endpoint de token do Google, numa conexão TLS autenticada com o nosso
 * client secret. O OpenID Connect (Core, 3.1.3.7) aceita a validação do
 * servidor TLS no lugar da assinatura nesse caso. O resto é conferido:
 * emissor, destinatário (aud), validade e e-mail verificado.
 */
export async function identidadeDoCodigo(
  origem: string,
  codigo: string,
): Promise<IdentidadeGoogle> {
  const resposta = await fetch(TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: codigo,
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      redirect_uri: enderecoDeRetorno(origem),
      grant_type: "authorization_code",
    }),
  });
  if (!resposta.ok) throw new Error(`Google recusou o código (${resposta.status}).`);

  const { id_token: idToken } = (await resposta.json()) as { id_token?: string };
  const corpo = idToken?.split(".")[1];
  if (!corpo) throw new Error("Resposta do Google sem id_token.");

  const dados = JSON.parse(Buffer.from(corpo, "base64url").toString("utf8")) as {
    iss?: string;
    aud?: string;
    exp?: number;
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };

  if (!dados.iss || !EMISSORES.includes(dados.iss)) throw new Error("Emissor inesperado.");
  if (dados.aud !== process.env.GOOGLE_CLIENT_ID) throw new Error("Token de outro aplicativo.");
  if (!dados.exp || dados.exp * 1000 < Date.now()) throw new Error("Token expirado.");
  if (!dados.sub || !dados.email || dados.email_verified !== true) {
    throw new Error("Conta Google sem e-mail verificado.");
  }

  return { sub: dados.sub, email: dados.email, nome: dados.name ?? "" };
}

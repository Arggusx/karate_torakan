import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { gravarCookieSessao, sessaoAtual } from "@/server/sessao";
import {
  COOKIE_ESTADO,
  identidadeDoCodigo,
  type EstadoGoogle,
} from "@/server/google";
import {
  acharPorGoogle,
  fotoDoGoogleSeVazia,
  semColunasGoogle,
  vincularGoogle,
} from "@/server/usuarios";
import { DESTINO_POR_PERFIL } from "@/services/dataService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Acrescenta ?chave=valor a um caminho que pode já ter query. */
function com(caminho: string, parametros: Record<string, string>) {
  const [base, query = ""] = caminho.split("?");
  const busca = new URLSearchParams(query);
  for (const [k, v] of Object.entries(parametros)) busca.set(k, v);
  return `${base}?${busca}`;
}

/**
 * GET /api/auth/google/callback — o Google devolve a pessoa aqui.
 *
 * Entrar: só entra quem já vinculou esta conta Google. Não existe cadastro
 * pelo Google — as contas são criadas pela equipe do dojo.
 * Vincular: grava o Google na conta da sessão atual.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const ir = (caminho: string) => NextResponse.redirect(new URL(caminho, url.origin));

  const jarra = await cookies();
  const bruto = jarra.get(COOKIE_ESTADO)?.value;
  jarra.delete({ name: COOKIE_ESTADO, path: "/api/auth/google" });

  let estado: EstadoGoogle | null = null;
  try {
    estado = bruto ? (JSON.parse(bruto) as EstadoGoogle) : null;
  } catch {
    estado = null;
  }

  const codigo = url.searchParams.get("code");
  if (!estado || !codigo || url.searchParams.get("state") !== estado.estado) {
    // Cancelou no Google, voltou por um link velho ou alguém tentou forjar.
    return ir(estado?.modo === "vincular" ? com(estado.volta, { google: "cancelado" }) : "/login?erro=google-cancelado");
  }

  try {
    const google = await identidadeDoCodigo(url.origin, codigo);

    if (estado.modo === "vincular") {
      const sessao = await sessaoAtual();
      if (!sessao) return ir("/login?erro=sessao");
      const resultado = await vincularGoogle(sessao.id, { sub: google.sub, email: google.email });
      if (resultado.ok) await fotoDoGoogleSeVazia(sessao.id, google.foto);
      return ir(com(estado.volta, { google: resultado.ok ? "vinculado" : "ja-vinculado" }));
    }

    const conta = await acharPorGoogle(google.sub);
    if (!conta) return ir("/login?erro=google-sem-vinculo");
    await fotoDoGoogleSeVazia(conta.id, google.foto);

    await gravarCookieSessao({
      id: conta.id,
      nome: conta.nome,
      usuario: conta.usuario,
      perfil: conta.role,
    });
    return ir(conta.precisa_trocar_senha ? "/primeiro-acesso" : DESTINO_POR_PERFIL[conta.role]);
  } catch (erro) {
    const indisponivel = semColunasGoogle(erro);
    if (!indisponivel) console.error("[auth/google/callback]", erro);
    if (estado.modo === "vincular") {
      return ir(com(estado.volta, { google: indisponivel ? "indisponivel" : "falhou" }));
    }
    return ir(`/login?erro=${indisponivel ? "google-indisponivel" : "google-falhou"}`);
  }
}

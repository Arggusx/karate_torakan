import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sessaoAtual } from "@/server/sessao";
import {
  COOKIE_ESTADO,
  googleConfigurado,
  novoEstado,
  urlDeAutorizacao,
  voltaSegura,
  type ModoGoogle,
} from "@/server/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/google?modo=entrar|vincular&volta=/caminho
 *
 * Manda a pessoa ao Google. O `state` aleatório vai num cookie httpOnly e é
 * conferido na volta — sem ele, um site terceiro poderia forjar o retorno e
 * vincular a conta Google dele à sessão de outra pessoa.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const modo: ModoGoogle = url.searchParams.get("modo") === "vincular" ? "vincular" : "entrar";

  if (!googleConfigurado()) {
    const destino = modo === "entrar" ? "/login?erro=google-indisponivel" : "/primeiro-acesso?google=indisponivel";
    return NextResponse.redirect(new URL(destino, url.origin));
  }

  // Vincular exige estar logado: é a sessão que diz de quem é a conta.
  if (modo === "vincular" && !(await sessaoAtual())) {
    return NextResponse.redirect(new URL("/login?erro=sessao", url.origin));
  }

  const volta = voltaSegura(url.searchParams.get("volta"), modo === "vincular" ? "/primeiro-acesso" : "/login");
  const estado = novoEstado(modo, volta);

  const jarra = await cookies();
  jarra.set(COOKIE_ESTADO, JSON.stringify(estado), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/google",
    maxAge: 600,
  });

  return NextResponse.redirect(urlDeAutorizacao(url.origin, estado.estado));
}

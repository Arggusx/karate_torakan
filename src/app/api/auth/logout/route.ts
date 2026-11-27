import { NextResponse } from "next/server";
import { encerrarSessoes, limparCookieSessao, sessaoAtual } from "@/server/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/logout — encerra a sessão.
 *
 * Além de apagar o cookie, aumenta a versão da sessão no banco: uma cópia do
 * cookie (outro aparelho, um computador emprestado) deixa de valer também.
 */
export async function POST() {
  const sessao = await sessaoAtual();
  if (sessao) await encerrarSessoes(sessao.id);
  await limparCookieSessao();
  return NextResponse.json({ ok: true });
}

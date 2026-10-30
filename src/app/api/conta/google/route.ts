import { NextResponse } from "next/server";
import { sessaoAtual } from "@/server/sessao";
import { desvincularGoogle, lerConta, semColunasGoogle } from "@/server/usuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** DELETE /api/conta/google — desvincula a conta Google da própria conta. */
export async function DELETE() {
  const sessao = await sessaoAtual();
  if (!sessao) return NextResponse.json({ erro: "Faça login." }, { status: 401 });

  try {
    const resultado = await desvincularGoogle(sessao.id);
    if (!resultado.ok) return NextResponse.json({ erro: resultado.erro }, { status: 409 });
    return NextResponse.json({ ok: true, conta: await lerConta(sessao.id) });
  } catch (erro) {
    if (semColunasGoogle(erro)) {
      return NextResponse.json({ erro: "Login com Google ainda não está ativado (migração 008)." }, { status: 503 });
    }
    console.error("[api/conta/google DELETE]", erro);
    return NextResponse.json({ erro: "Não foi possível desvincular." }, { status: 500 });
  }
}

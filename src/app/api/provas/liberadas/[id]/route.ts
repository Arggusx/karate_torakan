import { NextResponse } from "next/server";
import { exigirPerfil } from "@/server/sessao";
import { cancelarLiberada } from "@/server/provas";
import { idDaRota, respostaDeErroProva } from "@/server/provasRota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** DELETE /api/provas/liberadas/:id — cancela uma liberação ainda não entregue. */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await exigirPerfil(["professor", "admin"]);
    const id = idDaRota((await params).id);
    if (!id) return NextResponse.json({ erro: "Prova inválida." }, { status: 400 });
    await cancelarLiberada(id);
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return respostaDeErroProva(erro, "api/provas/liberadas/:id DELETE", "Falha ao cancelar.");
  }
}

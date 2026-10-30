import { NextResponse } from "next/server";
import { exigirPerfil } from "@/server/sessao";
import { liberarModelo } from "@/server/provas";
import { corpoJson, idDaRota, respostaDeErroProva } from "@/server/provasRota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/provas/modelos/:id/liberar — corpo { alunoIds: number[] }. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessao = await exigirPerfil(["professor", "admin"]);
    const id = idDaRota((await params).id);
    if (!id) return NextResponse.json({ erro: "Prova inválida." }, { status: 400 });
    const corpo = await corpoJson<{ alunoIds?: unknown }>(request);
    if (!corpo || !Array.isArray(corpo.alunoIds)) {
      return NextResponse.json({ erro: "Escolha os alunos." }, { status: 400 });
    }
    const resultado = await liberarModelo(id, corpo.alunoIds.map(Number), sessao.id);
    return NextResponse.json(resultado);
  } catch (erro) {
    return respostaDeErroProva(erro, "api/provas/modelos/:id/liberar", "Falha ao liberar a prova.");
  }
}

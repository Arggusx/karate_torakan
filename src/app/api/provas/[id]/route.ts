import { NextResponse } from "next/server";
import { exigirPerfil } from "@/server/sessao";
import { abrirProva, entregarProva } from "@/server/provas";
import { corpoJson, idDaRota, respostaDeErroProva } from "@/server/provasRota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/provas/:id — o aluno abre uma prova liberada para ele (sem gabarito). */
export async function GET(_request: Request, { params }: Params) {
  try {
    const sessao = await exigirPerfil(["aluno"]);
    const id = idDaRota((await params).id);
    if (!id) return NextResponse.json({ erro: "Prova inválida." }, { status: 400 });
    return NextResponse.json({ prova: await abrirProva(sessao.id, id) });
  } catch (erro) {
    return respostaDeErroProva(erro, "api/provas/:id GET", "Falha ao abrir a prova.");
  }
}

/**
 * POST /api/provas/:id — entrega a prova. Corpo: { respostas: (number|null)[] }.
 * Devolve o resultado com a correção de cada pergunta.
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const sessao = await exigirPerfil(["aluno"]);
    const id = idDaRota((await params).id);
    if (!id) return NextResponse.json({ erro: "Prova inválida." }, { status: 400 });
    const corpo = await corpoJson<{ respostas?: unknown }>(request);
    if (!corpo || !Array.isArray(corpo.respostas)) {
      return NextResponse.json({ erro: "Envie as respostas." }, { status: 400 });
    }
    const resultado = await entregarProva(sessao.id, id, corpo.respostas as (number | null)[]);
    return NextResponse.json({ resultado });
  } catch (erro) {
    return respostaDeErroProva(erro, "api/provas/:id POST", "Falha ao entregar a prova.");
  }
}

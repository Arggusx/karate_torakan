import { NextResponse } from "next/server";
import { sessaoAtual } from "@/server/sessao";
import { ErroProva, entregarProva, semTabelaDeProvas } from "@/server/provas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/provas/:id — entrega a prova. Corpo: { respostas: (number|null)[] }.
 * Devolve o resultado com a correção de cada pergunta.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const sessao = await sessaoAtual();
  if (!sessao) return NextResponse.json({ erro: "Faça login." }, { status: 401 });
  if (sessao.perfil !== "aluno") {
    return NextResponse.json({ erro: "A prova é feita pelo aluno." }, { status: 403 });
  }

  const { id } = await params;
  const provaId = Number(id);
  if (!Number.isInteger(provaId)) {
    return NextResponse.json({ erro: "Prova inválida." }, { status: 400 });
  }

  let corpo: { respostas?: unknown };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }
  if (!Array.isArray(corpo.respostas)) {
    return NextResponse.json({ erro: "Envie as respostas." }, { status: 400 });
  }

  try {
    const resultado = await entregarProva(
      sessao.id,
      provaId,
      corpo.respostas as (number | null)[],
    );
    return NextResponse.json({ resultado });
  } catch (erro) {
    if (erro instanceof ErroProva) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    if (semTabelaDeProvas(erro)) {
      return NextResponse.json({ erro: "Provas indisponíveis (migração 007 pendente)." }, { status: 503 });
    }
    console.error("[api/provas/:id POST]", erro);
    return NextResponse.json({ erro: "Falha ao entregar a prova." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { sessaoAtual } from "@/server/sessao";
import {
  ErroProva,
  historicoProvas,
  iniciarProva,
  semTabelaDeProvas,
} from "@/server/provas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const indisponivel = () =>
  NextResponse.json(
  {
    erro:
      "As provas ainda não estão ativadas no banco (migração 007 pendente). Avise a administração.",
  },
  { status: 503 },
);

/**
 * GET /api/provas — histórico de provas entregues.
 * Aluno: o próprio. Professor e admin: de qualquer aluno, com ?alunoId=.
 */
export async function GET(request: Request) {
  const sessao = await sessaoAtual();
  if (!sessao) return NextResponse.json({ erro: "Faça login." }, { status: 401 });

  let alunoId = sessao.id;
  if (sessao.perfil !== "aluno") {
    const pedido = Number(new URL(request.url).searchParams.get("alunoId"));
    if (!Number.isInteger(pedido) || pedido <= 0) {
      return NextResponse.json({ erro: "Informe ?alunoId=." }, { status: 400 });
    }
    alunoId = pedido;
  }

  try {
    return NextResponse.json({ historico: await historicoProvas(alunoId) });
  } catch (erro) {
    if (semTabelaDeProvas(erro)) return indisponivel();
    console.error("[api/provas GET]", erro);
    return NextResponse.json({ erro: "Falha ao ler as provas." }, { status: 500 });
  }
}

/** POST /api/provas — começa (ou retoma) a prova da faixa atual. Só aluno. */
export async function POST() {
  const sessao = await sessaoAtual();
  if (!sessao) return NextResponse.json({ erro: "Faça login." }, { status: 401 });
  if (sessao.perfil !== "aluno") {
    return NextResponse.json({ erro: "A prova é feita pelo aluno." }, { status: 403 });
  }

  try {
    return NextResponse.json({ prova: await iniciarProva(sessao.id) });
  } catch (erro) {
    if (erro instanceof ErroProva) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    if (semTabelaDeProvas(erro)) return indisponivel();
    console.error("[api/provas POST]", erro);
    return NextResponse.json({ erro: "Falha ao montar a prova." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { exigirPerfil } from "@/server/sessao";
import { historicoProvas, provasDoAluno } from "@/server/provas";
import { respostaDeErroProva } from "@/server/provasRota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/provas
 * Aluno: as provas liberadas para ele (pendentes) e as que já entregou.
 * Professor e admin: o histórico de um aluno, com ?alunoId=.
 *
 * Não existe "começar prova" pelo aluno: só faz prova quem recebeu uma
 * liberada pelo professor (ver /api/provas/modelos/:id/liberar).
 */
export async function GET(request: Request) {
  try {
    const sessao = await exigirPerfil(["aluno", "professor", "admin"]);
    if (sessao.perfil === "aluno") {
      return NextResponse.json(await provasDoAluno(sessao.id));
    }
    const pedido = Number(new URL(request.url).searchParams.get("alunoId"));
    if (!Number.isInteger(pedido) || pedido <= 0) {
      return NextResponse.json({ erro: "Informe ?alunoId=." }, { status: 400 });
    }
    return NextResponse.json({ historico: await historicoProvas(pedido) });
  } catch (erro) {
    return respostaDeErroProva(erro, "api/provas GET", "Falha ao ler as provas.");
  }
}

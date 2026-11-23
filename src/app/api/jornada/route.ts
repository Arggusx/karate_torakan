import { NextResponse } from "next/server";
import { sessaoAtual } from "@/server/sessao";
import { meusPontos, ranking, semTabelaDaJornada } from "@/server/jornada";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/jornada — os pontos de quem está logado e os rankings da semana
 * e do mês. Sem login devolve { logado: false }: a Jornada continua aberta,
 * só não entra no ranking.
 */
export async function GET() {
  const sessao = await sessaoAtual();
  if (!sessao) return NextResponse.json({ logado: false });

  try {
    const [eu, semana, mes] = await Promise.all([
      meusPontos(sessao.id),
      ranking("semana", sessao.id),
      ranking("mes", sessao.id),
    ]);
    return NextResponse.json({ logado: true, eu, semana, mes });
  } catch (erro) {
    if (semTabelaDaJornada(erro)) {
      return NextResponse.json({ logado: true, indisponivel: true });
    }
    console.error("[api/jornada GET]", erro);
    return NextResponse.json({ erro: "Falha ao ler o ranking." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { sessaoAtual } from "@/server/sessao";
import { registrarPontos, semTabelaDaJornada } from "@/server/jornada";
import { corpoJson } from "@/server/provasRota";
import { lerEvento } from "@/services/pontuacao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/jornada/pontos — registra um evento da Jornada para quem está
 * logado. O corpo diz o que aconteceu; os pontos são recalculados aqui.
 */
export async function POST(request: Request) {
  const sessao = await sessaoAtual();
  if (!sessao) return NextResponse.json({ erro: "Entre no portal para pontuar no ranking." }, { status: 401 });

  const evento = lerEvento(await corpoJson(request));
  if (!evento) return NextResponse.json({ erro: "Evento inválido." }, { status: 400 });

  try {
    const pontos = await registrarPontos(sessao.id, evento);
    return NextResponse.json({ pontos });
  } catch (erro) {
    if (semTabelaDaJornada(erro)) {
      return NextResponse.json({ pontos: 0, indisponivel: true }, { status: 503 });
    }
    console.error("[api/jornada/pontos POST]", erro);
    return NextResponse.json({ erro: "Falha ao registrar os pontos." }, { status: 500 });
  }
}

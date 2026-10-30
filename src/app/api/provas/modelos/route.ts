import { NextResponse } from "next/server";
import { exigirPerfil } from "@/server/sessao";
import { criarModelo, listarModelos, type DadosModelo } from "@/server/provas";
import { corpoJson, respostaDeErroProva } from "@/server/provasRota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/provas/modelos — as provas montadas pela equipe. */
export async function GET() {
  try {
    await exigirPerfil(["professor", "admin"]);
    return NextResponse.json({ modelos: await listarModelos() });
  } catch (erro) {
    return respostaDeErroProva(erro, "api/provas/modelos GET", "Falha ao ler as provas.");
  }
}

/** POST /api/provas/modelos — cria uma prova. Corpo: { titulo, faixa, perguntas, minimo? }. */
export async function POST(request: Request) {
  try {
    const sessao = await exigirPerfil(["professor", "admin"]);
    const corpo = await corpoJson<Partial<DadosModelo>>(request);
    if (!corpo) return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
    return NextResponse.json({ modelo: await criarModelo(sessao.id, corpo) }, { status: 201 });
  } catch (erro) {
    return respostaDeErroProva(erro, "api/provas/modelos POST", "Falha ao criar a prova.");
  }
}

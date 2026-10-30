import { NextResponse } from "next/server";
import { exigirPerfil } from "@/server/sessao";
import { listarLiberadas } from "@/server/provas";
import { idDaRota, respostaDeErroProva } from "@/server/provasRota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/provas/liberadas[?modeloId=] — quem recebeu, quem entregou e a nota. */
export async function GET(request: Request) {
  try {
    await exigirPerfil(["professor", "admin"]);
    const bruto = new URL(request.url).searchParams.get("modeloId");
    const modeloId = bruto ? idDaRota(bruto) : null;
    if (bruto && !modeloId) return NextResponse.json({ erro: "Prova inválida." }, { status: 400 });
    return NextResponse.json({ liberadas: await listarLiberadas(modeloId ?? undefined) });
  } catch (erro) {
    return respostaDeErroProva(erro, "api/provas/liberadas GET", "Falha ao ler as provas liberadas.");
  }
}

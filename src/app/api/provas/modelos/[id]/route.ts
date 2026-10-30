import { NextResponse } from "next/server";
import { exigirPerfil } from "@/server/sessao";
import { apagarModelo, lerModelo, salvarModelo, type DadosModelo } from "@/server/provas";
import { corpoJson, idDaRota, respostaDeErroProva } from "@/server/provasRota";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** GET /api/provas/modelos/:id — a prova completa, com gabarito, para editar. */
export async function GET(_request: Request, { params }: Params) {
  try {
    await exigirPerfil(["professor", "admin"]);
    const id = idDaRota((await params).id);
    if (!id) return NextResponse.json({ erro: "Prova inválida." }, { status: 400 });
    return NextResponse.json({ modelo: await lerModelo(id) });
  } catch (erro) {
    return respostaDeErroProva(erro, "api/provas/modelos/:id GET", "Falha ao ler a prova.");
  }
}

/** PUT /api/provas/modelos/:id — salva as edições. */
export async function PUT(request: Request, { params }: Params) {
  try {
    await exigirPerfil(["professor", "admin"]);
    const id = idDaRota((await params).id);
    if (!id) return NextResponse.json({ erro: "Prova inválida." }, { status: 400 });
    const corpo = await corpoJson<Partial<DadosModelo>>(request);
    if (!corpo) return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
    return NextResponse.json({ modelo: await salvarModelo(id, corpo) });
  } catch (erro) {
    return respostaDeErroProva(erro, "api/provas/modelos/:id PUT", "Falha ao salvar a prova.");
  }
}

/** DELETE /api/provas/modelos/:id — apaga o modelo (as liberadas continuam). */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    await exigirPerfil(["professor", "admin"]);
    const id = idDaRota((await params).id);
    if (!id) return NextResponse.json({ erro: "Prova inválida." }, { status: 400 });
    await apagarModelo(id);
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return respostaDeErroProva(erro, "api/provas/modelos/:id DELETE", "Falha ao apagar a prova.");
  }
}

import { NextResponse } from "next/server";
import { lerAuditoria, semTabelaDeAuditoria } from "@/server/auditoria";
import { SemPermissao, exigirPerfil } from "@/server/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/academia/auditoria — as últimas ações registradas (só o admin).
 * ?conta=<id> filtra pelo que a conta fez ou sofreu; ?limite= até 500.
 */
export async function GET(request: Request) {
  try {
    await exigirPerfil(["admin"]);
    const busca = new URL(request.url).searchParams;
    const conta = Number(busca.get("conta"));
    const limite = Number(busca.get("limite"));
    const linhas = await lerAuditoria({
      contaId: Number.isInteger(conta) && conta > 0 ? conta : undefined,
      limite: Number.isInteger(limite) && limite > 0 ? limite : undefined,
    });
    return NextResponse.json({ linhas });
  } catch (erro) {
    if (erro instanceof SemPermissao) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    if (semTabelaDeAuditoria(erro)) {
      return NextResponse.json({ linhas: [], semTabela: true });
    }
    console.error("[academia/auditoria]", erro);
    return NextResponse.json({ erro: "Falha ao ler o log." }, { status: 500 });
  }
}

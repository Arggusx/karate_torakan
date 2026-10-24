import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sessaoAtual } from "@/server/sessao";
import { listarHistoricoPrograma } from "@/server/progresso";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/conta/curriculo — a análise curricular do próprio aluno.
 *
 * Devolve a faixa atual, desde quando está nela, e o histórico de itens
 * validados por faixa. O cruzamento com o programa exigido de cada graduação
 * é feito na interface, que já tem esses dados do acervo.
 */
export async function GET() {
  const sessao = await sessaoAtual();
  if (!sessao) {
    return NextResponse.json({ erro: "Faça login." }, { status: 401 });
  }
  if (sessao.perfil !== "aluno") {
    return NextResponse.json(
      { erro: "A análise curricular é do aluno." },
      { status: 403 },
    );
  }

  try {
    const [historico, perfil] = await Promise.all([
      listarHistoricoPrograma(sessao.id),
      sql`
        SELECT faixa_atual, data_graduacao::text AS data_graduacao
          FROM alunos_perfil WHERE user_id = ${sessao.id} LIMIT 1`,
    ]);

    const linha = perfil[0] as
      | { faixa_atual: string; data_graduacao: string | null }
      | undefined;

    return NextResponse.json({
      faixaAtual: linha?.faixa_atual ?? null,
      desde: linha?.data_graduacao ?? null,
      historico,
    });
  } catch (erro) {
    console.error("[api/conta/curriculo]", erro);
    return NextResponse.json(
      { erro: "Falha ao carregar a análise curricular." },
      { status: 500 },
    );
  }
}

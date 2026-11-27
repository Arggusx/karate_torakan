import { NextResponse } from "next/server";
import { listarAlunos, listarProfessores, listarTurmas } from "@/server/usuarios";
import { VALOR_MENSALIDADE_CENTAVOS } from "@/server/pagamentos";
import { calcularProgresso } from "@/server/progresso";
import { SemPermissao, exigirPerfil } from "@/server/sessao";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/academia — turmas, alunos e professores do banco.
 * Fonte única dos portais; substitui o estado que ficava no localStorage.
 *
 * Exige login. A equipe (professor e admin) recebe tudo; o aluno recebe as
 * turmas, só o próprio cadastro e, dos professores, apenas nome e foto.
 */
export async function GET() {
  try {
    const sessao = await exigirPerfil(["aluno", "professor", "admin"]);

    const [turmas, alunosBase, professores, progresso] = await Promise.all([
      listarTurmas(),
      listarAlunos(),
      listarProfessores(),
      calcularProgresso(),
    ]);

    const ehAluno = sessao.perfil === "aluno";

    // Progresso e frequência são calculados a partir das presenças e do
    // programa validado — as colunas de mesmo nome em alunos_perfil viraram
    // resquício e não são mais a fonte da verdade.
    const alunos = alunosBase
      .filter((aluno) => !ehAluno || aluno.id === sessao.id)
      .map((aluno) => {
        const dados = progresso.get(aluno.id);
        return {
          ...aluno,
          progresso: dados?.total ?? 0,
          frequencia: dados?.frequencia ?? 0,
          apto_exame: dados?.aptoParaExame ?? false,
          criterios: dados?.criterios ?? null,
        };
      });

    const professoresVisiveis = ehAluno
      ? professores.map((professor) => ({
          id: professor.id,
          nome: professor.nome,
          usuario: "",
          email: "",
          role: professor.role,
          criado_em: null,
          avatar_url: professor.avatar_url,
          data_nascimento: null,
          idade: null,
        }))
      : professores;

    // O valor da mensalidade vem daqui — e não de env no navegador — porque
    // só variáveis com prefixo NEXT_PUBLIC_ chegam ao bundle do cliente.
    return NextResponse.json({
      turmas,
      alunos,
      professores: professoresVisiveis,
      mensalidade_centavos: VALOR_MENSALIDADE_CENTAVOS,
    });
  } catch (erro) {
    if (erro instanceof SemPermissao) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error("[academia]", erro);
    return NextResponse.json(
      { erro: "Falha ao carregar os dados da academia." },
      { status: 500 },
    );
  }
}

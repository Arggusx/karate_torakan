import { NextResponse } from "next/server";
import {
  ErroContato,
  normalizarTelefone,
  salvarContato,
  type DadosContato,
} from "@/server/contato";
import { SemPermissao, exigirPerfil } from "@/server/sessao";
import { criarAluno, usuarioEmUso, usuarioReservado } from "@/server/usuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/academia/alunos — cadastra um aluno com credenciais próprias.
 * Exige sessão de professor ou admin.
 */
export async function POST(request: Request) {
  let corpo: {
    nome?: string;
    usuario?: string;
    senha?: string;
    email?: string;
    idade?: number;
    dataNascimento?: string | null;
    turmaId?: number;
    faixa?: string;
    /** O aceite de WhatsApp nunca vem daqui: é do titular ou do responsável. */
    contato?: Omit<DadosContato, "aceitaWhatsapp">;
  };

  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  if (
    typeof corpo.nome !== "string" ||
    typeof corpo.usuario !== "string" ||
    typeof corpo.senha !== "string"
  ) {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }
  if (!corpo.nome.trim()) {
    return NextResponse.json({ erro: "Informe o nome." }, { status: 400 });
  }
  if (!corpo.usuario || !corpo.senha || corpo.senha.length < 8) {
    return NextResponse.json(
      { erro: "Usuário e senha (mínimo 8 caracteres) são obrigatórios." },
      { status: 400 },
    );
  }

  try {
    await exigirPerfil(["professor", "admin"]);

    // Confere os telefones antes de criar a conta, para um número errado não
    // deixar um aluno cadastrado pela metade.
    try {
      normalizarTelefone(corpo.contato?.telefone);
      normalizarTelefone(corpo.contato?.responsavelTelefone);
    } catch (erro) {
      if (erro instanceof ErroContato) {
        return NextResponse.json({ erro: erro.message }, { status: 400 });
      }
      throw erro;
    }

    if (usuarioReservado(corpo.usuario)) {
      return NextResponse.json(
        { erro: `O usuário "${corpo.usuario}" é reservado para a equipe. Escolha outro.` },
        { status: 400 },
      );
    }

    if (await usuarioEmUso(corpo.usuario)) {
      return NextResponse.json(
        { erro: `O usuário "${corpo.usuario}" já está em uso.` },
        { status: 409 },
      );
    }

    const { id } = await criarAluno({
      nome: corpo.nome.trim(),
      usuario: corpo.usuario,
      senha: corpo.senha,
      email: corpo.email?.trim() || `${corpo.usuario}@shotokan.local`,
      idade: corpo.idade ?? null,
      dataNascimento: corpo.dataNascimento ?? null,
      turmaId: corpo.turmaId ?? null,
      faixa: corpo.faixa ?? "7º Kyu - Faixa Branca",
    });

    // Contato e responsável. Se a migração 011 ainda não rodou, o aluno fica
    // cadastrado sem eles e o aviso vai para o log.
    if (corpo.contato) {
      const { telefone, responsavelNome, responsavelParentesco, responsavelTelefone, responsavelEmail } =
        corpo.contato;
      try {
        await salvarContato(id, {
          telefone,
          responsavelNome,
          responsavelParentesco,
          responsavelTelefone,
          responsavelEmail,
        });
      } catch (erro) {
        if (!(erro instanceof ErroContato)) throw erro;
        console.warn("[academia/alunos] contato não salvo:", erro.message);
        return NextResponse.json(
          { ok: true, id, aviso: `Aluno cadastrado, mas o contato não foi salvo: ${erro.message}` },
          { status: 201 },
        );
      }
    }

    return NextResponse.json({ ok: true, id }, { status: 201 });
  } catch (erro) {
    if (erro instanceof SemPermissao) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    // Turma que não existe: nada foi gravado (conta e perfil vão juntos).
    if ((erro as { code?: string })?.code === "23503") {
      return NextResponse.json({ erro: "Turma não encontrada." }, { status: 400 });
    }
    console.error("[academia/alunos]", erro);
    return NextResponse.json(
      { erro: "Falha ao cadastrar o aluno." },
      { status: 500 },
    );
  }
}

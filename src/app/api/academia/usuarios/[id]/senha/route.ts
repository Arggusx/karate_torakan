import { NextResponse } from "next/server";
import { SemPermissao, exigirPerfil } from "@/server/sessao";
import { lerPapel, redefinirSenha } from "@/server/usuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/academia/usuarios/:id/senha — a equipe redefine a senha de alguém.
 *
 * Professor redefine senha de aluno. Admin redefine de aluno e de professor.
 * Ninguém redefine a de um admin por aqui (nem a própria): para a própria
 * conta existe a troca de senha em "Minha conta".
 *
 * Devolve a senha temporária uma única vez — ela não fica guardada em texto em
 * lugar nenhum, só o hash.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const alvoId = Number(id);
  if (!Number.isInteger(alvoId)) {
    return NextResponse.json({ erro: "Conta inválida." }, { status: 400 });
  }

  try {
    const sessao = await exigirPerfil(["professor", "admin"]);
    const alvo = await lerPapel(alvoId);
    if (!alvo || !alvo.ativo) {
      return NextResponse.json({ erro: "Conta não encontrada." }, { status: 404 });
    }

    const pode =
      alvo.role === "aluno" || (alvo.role === "professor" && sessao.perfil === "admin");
    if (!pode || alvoId === sessao.id) {
      return NextResponse.json(
        { erro: "Você não pode redefinir a senha desta conta." },
        { status: 403 },
      );
    }

    return NextResponse.json({ senha: await redefinirSenha(alvoId) });
  } catch (erro) {
    if (erro instanceof SemPermissao) {
      return NextResponse.json({ erro: erro.message }, { status: erro.status });
    }
    console.error("[usuarios/senha POST]", erro);
    return NextResponse.json({ erro: "Não foi possível redefinir a senha." }, { status: 500 });
  }
}

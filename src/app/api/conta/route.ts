import { NextResponse } from "next/server";
import { gravarCookieSessao, sessaoAtual } from "@/server/sessao";
import {
  lerConta,
  salvarAvatar,
  trocarSenha,
  trocarUsuario,
} from "@/server/usuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Conta do próprio usuário logado.
 *
 * Qualquer perfil pode olhar e mexer na sua conta — a autorização é "ser você
 * mesmo", garantida pelo cookie assinado: o id vem de lá, nunca do corpo. Por
 * isso não há `exigirPerfil` com lista: basta haver sessão.
 *
 * Limite da foto: o navegador já reduz a imagem a um quadrado pequeno antes de
 * subir; aqui só barramos o abuso de mandar algo gigante por fora da tela.
 */

const LIMITE_AVATAR = 400_000; // ~400 KB de data URL, folgado para 256px JPEG.

export async function GET() {
  const sessao = await sessaoAtual();
  if (!sessao) {
    return NextResponse.json({ erro: "Faça login." }, { status: 401 });
  }
  const conta = await lerConta(sessao.id);
  if (!conta) {
    return NextResponse.json({ erro: "Conta não encontrada." }, { status: 404 });
  }
  return NextResponse.json({ conta });
}

export async function PATCH(request: Request) {
  const sessao = await sessaoAtual();
  if (!sessao) {
    return NextResponse.json({ erro: "Faça login." }, { status: 401 });
  }

  let corpo: {
    usuario?: string;
    senhaAtual?: string;
    novaSenha?: string;
    avatarUrl?: string | null;
  };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  try {
    // 1. Foto de perfil.
    if (corpo.avatarUrl !== undefined) {
      const valor = corpo.avatarUrl;
      if (valor !== null) {
        if (!valor.startsWith("data:image/")) {
          return NextResponse.json(
            { erro: "Formato de imagem inválido." },
            { status: 400 },
          );
        }
        if (valor.length > LIMITE_AVATAR) {
          return NextResponse.json(
            { erro: "A imagem ficou grande demais. Tente outra." },
            { status: 413 },
          );
        }
      }
      await salvarAvatar(sessao.id, valor);
    }

    // 2. Troca de usuário — regrava o cookie para o novo nome aparecer já.
    let novoUsuario: string | undefined;
    if (corpo.usuario !== undefined && corpo.usuario.trim() !== "") {
      const resultado = await trocarUsuario(sessao.id, corpo.usuario);
      if (!resultado.ok) {
        return NextResponse.json({ erro: resultado.erro }, { status: 409 });
      }
      novoUsuario = resultado.usuario;
    }

    // 3. Troca de senha — exige a senha atual.
    if (corpo.novaSenha !== undefined && corpo.novaSenha !== "") {
      const resultado = await trocarSenha(
        sessao.id,
        corpo.senhaAtual ?? "",
        corpo.novaSenha,
      );
      if (!resultado.ok) {
        return NextResponse.json({ erro: resultado.erro }, { status: 400 });
      }
    }

    if (novoUsuario) {
      await gravarCookieSessao({
        id: sessao.id,
        nome: sessao.nome,
        usuario: novoUsuario,
        perfil: sessao.perfil,
      });
    }

    const conta = await lerConta(sessao.id);
    return NextResponse.json({ ok: true, conta });
  } catch (erro) {
    console.error("[api/conta]", erro);
    return NextResponse.json(
      { erro: "Não foi possível salvar as alterações." },
      { status: 500 },
    );
  }
}

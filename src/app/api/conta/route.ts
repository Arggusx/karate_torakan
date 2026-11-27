import { NextResponse } from "next/server";
import { ErroContato, lerContato, salvarContato, type DadosContato } from "@/server/contato";
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

/**
 * Aceita só PNG, JPEG ou WebP em base64 e confere os primeiros bytes do
 * arquivo: o tipo declarado no "data:image/..." não basta, e SVG (que pode
 * levar script) fica de fora.
 */
function avatarValido(valor: string): boolean {
  const partes = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(valor);
  if (!partes) return false;
  const bytes = Buffer.from(partes[2], "base64");
  if (bytes.length < 12) return false;
  const tipo = partes[1];
  if (tipo === "png") {
    return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  if (tipo === "jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  return (
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

export async function GET() {
  const sessao = await sessaoAtual();
  if (!sessao) {
    return NextResponse.json({ erro: "Faça login." }, { status: 401 });
  }
  const conta = await lerConta(sessao.id);
  if (!conta) {
    return NextResponse.json({ erro: "Conta não encontrada." }, { status: 404 });
  }
  const contato = await lerContato(sessao.id);
  return NextResponse.json({ conta, contato });
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
    contato?: DadosContato;
  };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  try {
    // 0. Telefone, responsável e aceite de WhatsApp. Responde sozinho: é um
    //    formulário à parte na tela.
    if (corpo.contato !== undefined) {
      try {
        const contato = await salvarContato(sessao.id, corpo.contato);
        return NextResponse.json({ ok: true, contato });
      } catch (erro) {
        if (erro instanceof ErroContato) {
          return NextResponse.json({ erro: erro.message }, { status: 400 });
        }
        throw erro;
      }
    }

    // 1. Foto de perfil.
    if (corpo.avatarUrl !== undefined) {
      const valor = corpo.avatarUrl;
      if (valor !== null) {
        if (valor.length > LIMITE_AVATAR) {
          return NextResponse.json(
            { erro: "A imagem ficou grande demais. Tente outra." },
            { status: 413 },
          );
        }
        if (!avatarValido(valor)) {
          return NextResponse.json(
            { erro: "Formato de imagem inválido. Use PNG, JPEG ou WebP." },
            { status: 400 },
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

    // 3. Troca de senha — exige a senha atual. Derruba as outras sessões e
    // regrava o cookie deste aparelho com a versão nova.
    let trocouSenha = false;
    if (corpo.novaSenha !== undefined && corpo.novaSenha !== "") {
      const resultado = await trocarSenha(
        sessao.id,
        corpo.senhaAtual ?? "",
        corpo.novaSenha,
      );
      if (!resultado.ok) {
        return NextResponse.json({ erro: resultado.erro }, { status: 400 });
      }
      trocouSenha = true;
    }

    if (novoUsuario || trocouSenha) {
      await gravarCookieSessao({
        id: sessao.id,
        nome: sessao.nome,
        usuario: novoUsuario ?? sessao.usuario,
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

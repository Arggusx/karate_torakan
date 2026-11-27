import { NextResponse } from "next/server";
import { gravarCookieSessao } from "@/server/sessao";
import { esperaParaTentar, registrarAcerto, registrarErro } from "@/server/tentativas";
import { captchaValido, ipDaRequisicao } from "@/server/turnstile";
import { autenticar } from "@/server/usuarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/auth/login — { usuario, senha, captcha }
 *
 * Ordem das checagens:
 *  1. limite de tentativas (usuário e IP), antes de gastar a Cloudflare;
 *  2. captcha (Turnstile), conferido com a Cloudflare;
 *  3. senha (bcrypt) contra a tabela `users`.
 * Só erro de senha conta como tentativa: captcha recusado não trava ninguém.
 *
 * A sessão vai num cookie httpOnly assinado (HMAC-SHA256). O corpo devolvido
 * serve só para a interface saber quem entrou.
 */
export async function POST(request: Request) {
  let corpo: { usuario?: string; senha?: string; captcha?: string };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  if (
    typeof corpo.usuario !== "string" ||
    typeof corpo.senha !== "string" ||
    !corpo.usuario ||
    !corpo.senha ||
    corpo.usuario.length > 120 ||
    corpo.senha.length > 200
  ) {
    return NextResponse.json(
      { erro: "Informe usuário e senha." },
      { status: 400 },
    );
  }

  const ip = ipDaRequisicao(request);

  try {
    const espera = await esperaParaTentar(corpo.usuario, ip);
    if (espera > 0) {
      return NextResponse.json(
        {
          erro: `Muitas tentativas erradas. Espere ${espera} ${espera === 1 ? "minuto" : "minutos"} e tente de novo.`,
        },
        { status: 429, headers: { "Retry-After": String(espera * 60) } },
      );
    }

    if (!(await captchaValido(corpo.captcha, ip))) {
      return NextResponse.json(
        { erro: "Não foi possível confirmar que você não é um robô. Tente de novo." },
        { status: 400 },
      );
    }

    const conta = await autenticar(corpo.usuario, corpo.senha);
    if (!conta) {
      await registrarErro(corpo.usuario, ip);
      return NextResponse.json(
        { erro: "Usuário ou senha inválidos." },
        { status: 401 },
      );
    }

    await registrarAcerto(corpo.usuario);
    await gravarCookieSessao({
      id: conta.id,
      nome: conta.nome,
      usuario: conta.usuario,
      perfil: conta.role,
    });

    return NextResponse.json({ conta });
  } catch (erro) {
    console.error("[auth/login]", erro);
    return NextResponse.json(
      { erro: "Falha ao entrar. Tente novamente." },
      { status: 500 },
    );
  }
}

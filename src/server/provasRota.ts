import "server-only";
import { NextResponse } from "next/server";
import { SemPermissao } from "@/server/sessao";
import { ErroProva, semTabelaDeProvas } from "@/server/provas";

/** Converte os erros das rotas de prova em resposta JSON. */
export function respostaDeErroProva(erro: unknown, contexto: string, padrao: string) {
  if (erro instanceof SemPermissao || erro instanceof ErroProva) {
    return NextResponse.json({ erro: erro.message }, { status: erro.status });
  }
  if (semTabelaDeProvas(erro)) {
    return NextResponse.json(
      {
        erro: "As provas ainda não estão ativadas no banco (migração 007 pendente). Avise a administração.",
        semTabela: true,
      },
      { status: 503 },
    );
  }
  console.error(`[${contexto}]`, erro);
  return NextResponse.json({ erro: padrao }, { status: 500 });
}

/** Lê o corpo JSON; devolve null se não for JSON. */
export async function corpoJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/** Id numérico de rota, ou null. */
export function idDaRota(valor: string) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

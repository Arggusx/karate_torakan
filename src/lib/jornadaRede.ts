"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { EventoPontos } from "@/services/pontuacao";

/**
 * A parte da Jornada que fala com o servidor: enviar pontos e ler o ranking.
 * Só funciona para quem está logado no portal; para os outros, os pontos
 * ficam só no aparelho e nada quebra.
 *
 * Os dados do ranking ficam num cache único da página: o medalhão, o painel
 * e a tela do ranking leem o mesmo resultado, com uma requisição só.
 */

export interface LinhaRanking {
  posicao: number;
  nome: string;
  avatarUrl: string | null;
  pontos: number;
  eu: boolean;
}

export interface DadosRanking {
  logado: boolean;
  indisponivel?: boolean;
  eu?: {
    total: number;
    hoje: number;
    semana: number;
    mes: number;
    posicaoSemana: number | null;
    posicaoMes: number | null;
    podio: boolean;
    campeao: boolean;
  };
  semana?: LinhaRanking[];
  mes?: LinhaRanking[];
}

type Estado = { dados: DadosRanking | null; erro: boolean };

let estado: Estado = { dados: null, erro: false };
const ouvintes = new Set<() => void>();
let pedido: Promise<void> | null = null;
/** Sem login, não adianta mandar cada evento: espera um pouco antes de tentar de novo. */
let semLoginAte = 0;

function publicar(proximo: Estado) {
  estado = proximo;
  ouvintes.forEach((o) => o());
}

function carregar() {
  if (pedido) return pedido;
  pedido = (async () => {
    try {
      const resposta = await fetch("/api/jornada", { cache: "no-store" });
      if (!resposta.ok) throw new Error(String(resposta.status));
      const dados = (await resposta.json()) as DadosRanking;
      if (dados.logado) semLoginAte = 0;
      publicar({ dados, erro: false });
    } catch {
      publicar({ ...estado, erro: true });
    } finally {
      pedido = null;
    }
  })();
  return pedido;
}

/** Envia um evento. Sem login (401) ou sem banco (503), apenas ignora. */
export async function enviarPontos(evento: EventoPontos) {
  if (Date.now() < semLoginAte) return;
  try {
    const resposta = await fetch("/api/jornada/pontos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(evento),
    });
    if (resposta.status === 401) semLoginAte = Date.now() + 60_000;
    if (resposta.ok) void carregar();
  } catch {
    // sem rede: vale só neste aparelho
  }
}

const SEM_DADOS: Estado = { dados: null, erro: false };

/** Pontos da conta e rankings; recarrega quando um evento é aceito. */
export function useRanking() {
  const atual = useSyncExternalStore(
    (ouvinte) => {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
    () => estado,
    () => SEM_DADOS,
  );
  useEffect(() => {
    if (!estado.dados) void carregar();
  }, []);
  return { ...atual, recarregar: carregar };
}

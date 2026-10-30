"use client";

import { useSyncExternalStore } from "react";

/**
 * Progresso da Jornada (minigames do portal de estudos), guardado só neste
 * aparelho. Nada vai para o servidor — o portal de estudos é aberto, sem
 * login, e o que a pessoa joga é dela. Mesmo molde do journeyStore do Oratio.
 *
 * Princípios que este estado respeita (skill oratio-gamificacao):
 *  - não há pontos, ranking nem sequência que zera;
 *  - recompensa só por concluir algo com começo, meio e fim (um caminho, um
 *    kata inteiro, um baralho de karuta);
 *  - errar nunca tira nada: é só tentar de novo.
 */

const CHAVE = "torakan:jornada";

export interface EstadoJornada {
  /** Caminhos: lições lidas (índices) e níveis de quiz vencidos (1..4). */
  caminhos: Record<string, { inicio: string; lidas: number[]; niveis: number[] }>;
  /** Sequência do kata: trechos ordenados, por kata. */
  sequencias: Record<string, number[]>;
  /** Rodadas de karuta vencidas, por baralho. */
  rodadasKaruta: Record<string, number[]>;
  /** Baralhos de karuta com todas as rodadas vencidas. */
  karuta: string[];
  /** Explicações "Como funciona" já vistas. */
  introsVistas: string[];
  /** Revelações de recompensa já mostradas (uma vez só). */
  recompensasVistas: string[];
  perfil: { nome: string; faixa: string; moldura: string };
}

const VAZIO: EstadoJornada = {
  caminhos: {},
  sequencias: {},
  rodadasKaruta: {},
  karuta: [],
  introsVistas: [],
  recompensasVistas: [],
  perfil: { nome: "", faixa: "", moldura: "simples" },
};

function ler(): EstadoJornada {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return VAZIO;
    const salvo = JSON.parse(bruto) as Partial<EstadoJornada>;
    return { ...VAZIO, ...salvo, perfil: { ...VAZIO.perfil, ...salvo.perfil } };
  } catch {
    return VAZIO; // modo privado ou bloqueio: vale só nesta visita
  }
}

let estado: EstadoJornada = VAZIO;
let carregado = false;
const ouvintes = new Set<() => void>();

function atual() {
  if (!carregado && typeof window !== "undefined") {
    estado = ler();
    carregado = true;
  }
  return estado;
}

function gravar(proximo: EstadoJornada) {
  estado = proximo;
  try {
    localStorage.setItem(CHAVE, JSON.stringify(proximo));
  } catch {
    // sem armazenamento: fica só em memória
  }
  ouvintes.forEach((o) => o());
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  // Outra aba mexeu: atualiza esta também.
  const aoMudar = (e: StorageEvent) => {
    if (e.key === CHAVE) {
      estado = ler();
      ouvinte();
    }
  };
  window.addEventListener("storage", aoMudar);
  return () => {
    ouvintes.delete(ouvinte);
    window.removeEventListener("storage", aoMudar);
  };
}

export function useJornada() {
  return useSyncExternalStore(assinar, atual, () => VAZIO);
}

const hoje = () => new Date().toISOString().slice(0, 10);
const comItem = <T,>(lista: T[], item: T) => (lista.includes(item) ? lista : [...lista, item]);

export const jornada = {
  lerLicao(caminho: string, indice: number) {
    const s = atual();
    const c = s.caminhos[caminho] ?? { inicio: hoje(), lidas: [], niveis: [] };
    gravar({ ...s, caminhos: { ...s.caminhos, [caminho]: { ...c, lidas: comItem(c.lidas, indice) } } });
  },
  vencerNivel(caminho: string, nivel: number) {
    const s = atual();
    const c = s.caminhos[caminho] ?? { inicio: hoje(), lidas: [], niveis: [] };
    gravar({ ...s, caminhos: { ...s.caminhos, [caminho]: { ...c, niveis: comItem(c.niveis, nivel) } } });
  },
  ordenarTrecho(kata: string, trecho: number) {
    const s = atual();
    gravar({ ...s, sequencias: { ...s.sequencias, [kata]: comItem(s.sequencias[kata] ?? [], trecho) } });
  },
  /** Vence uma rodada; quando todas estão vencidas, o baralho entra na coleção. */
  vencerRodadaKaruta(baralho: string, rodada: number, totalRodadas: number) {
    const s = atual();
    const rodadas = comItem(s.rodadasKaruta[baralho] ?? [], rodada);
    gravar({
      ...s,
      rodadasKaruta: { ...s.rodadasKaruta, [baralho]: rodadas },
      karuta: rodadas.length >= totalRodadas ? comItem(s.karuta, baralho) : s.karuta,
    });
  },
  verIntro(jogo: string) {
    const s = atual();
    if (!s.introsVistas.includes(jogo)) gravar({ ...s, introsVistas: [...s.introsVistas, jogo] });
  },
  verRecompensa(id: string) {
    const s = atual();
    if (!s.recompensasVistas.includes(id)) gravar({ ...s, recompensasVistas: [...s.recompensasVistas, id] });
  },
  definirPerfil(mudancas: Partial<EstadoJornada["perfil"]>) {
    const s = atual();
    gravar({ ...s, perfil: { ...s.perfil, ...mudancas } });
  },
  apagarTudo() {
    gravar(VAZIO);
  },
};

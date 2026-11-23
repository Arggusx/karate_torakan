"use client";

import { useSyncExternalStore } from "react";
import { enviarPontos } from "@/lib/jornadaRede";
import { LIMITE_DIA, chaveNova, pontosDo, type EventoPontos } from "@/services/pontuacao";

/**
 * Progresso da Jornada (minigames do portal de estudos), guardado neste
 * aparelho. Mesmo molde do journeyStore do Oratio.
 *
 * Os pontos ficam aqui também, para quem joga sem login. Quem está logado no
 * portal tem cada evento enviado ao servidor, que é quem decide o que vale
 * no ranking (ver jornadaRede.ts e services/pontuacao.ts).
 *
 * Errar nunca tira nada: pontos só sobem.
 */

const CHAVE = "torakan:jornada";

export interface EstadoJornada {
  /** Ilhas: mini aula lida e níveis de faixa vencidos (0 = Branca … 7 = Preta). */
  ilhas: Record<string, { inicio: string; aula: boolean; faixas: number[] }>;
  /** Ordem do kata: trechos ordenados, por kata. */
  sequencias: Record<string, number[]>;
  /** Monte a técnica: rodadas vencidas por família. */
  montagem: Record<string, number[]>;
  /** Famílias do Monte a técnica com todas as rodadas vencidas. */
  familias: string[];
  /** Pontos somados neste aparelho, desde sempre. */
  pontos: number;
  /** Pontos de hoje, para respeitar o mesmo teto diário do servidor. */
  hoje: { dia: string; pontos: number };
  /** Dias em que a pessoa jogou (AAAA-MM-DD). */
  dias: string[];
  /** Rodadas perfeitas com 8 perguntas ou mais. */
  perfeitos: number;
  /** Explicações "Como funciona" já vistas. */
  introsVistas: string[];
  /** Revelações de recompensa já mostradas (uma vez só). */
  recompensasVistas: string[];
  perfil: { nome: string; faixa: string; moldura: string };
}

const VAZIO: EstadoJornada = {
  ilhas: {},
  sequencias: {},
  montagem: {},
  familias: [],
  pontos: 0,
  hoje: { dia: "", pontos: 0 },
  dias: [],
  perfeitos: 0,
  introsVistas: [],
  recompensasVistas: [],
  perfil: { nome: "", faixa: "", moldura: "simples" },
};

/** Versão antiga: "caminhos" com lições lidas e quatro níveis de quiz. */
type CaminhoAntigo = { inicio: string; lidas: number[]; niveis: number[] };

function ler(): EstadoJornada {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return VAZIO;
    const salvo = JSON.parse(bruto) as Partial<EstadoJornada> & { caminhos?: Record<string, CaminhoAntigo> };
    const estado: EstadoJornada = {
      ...VAZIO,
      ...salvo,
      hoje: { ...VAZIO.hoje, ...salvo.hoje },
      perfil: { ...VAZIO.perfil, ...salvo.perfil },
    };
    // Quem concluiu um caminho antigo fica com a ilha concluída (e o selo).
    if (salvo.caminhos && !salvo.ilhas) {
      estado.ilhas = Object.fromEntries(
        Object.entries(salvo.caminhos).map(([id, c]) => [
          id,
          {
            inicio: c.inicio,
            aula: c.lidas.length > 0,
            faixas: c.niveis.includes(4) ? [0, 1, 2, 3, 4, 5, 6, 7] : [],
          },
        ]),
      );
    }
    delete (estado as { caminhos?: unknown }).caminhos;
    return estado;
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

/** Data local (não UTC): quem joga às 23h conta o dia certo. */
const hoje = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const comItem = <T,>(lista: T[], item: T) => (lista.includes(item) ? lista : [...lista, item]);

/**
 * Soma os pontos de um evento ao estado `s` (e envia ao servidor). Devolve o
 * estado novo e quantos pontos valeram aqui.
 */
function comPontos(s: EstadoJornada, evento: EventoPontos): [EstadoJornada, number] {
  const dia = hoje();
  const jaHoje = s.hoje.dia === dia ? s.hoje.pontos : 0;
  const pontos = Math.max(0, Math.min(pontosDo(evento), LIMITE_DIA - jaHoje));
  void enviarPontos(evento);
  return [
    {
      ...s,
      pontos: s.pontos + pontos,
      hoje: { dia, pontos: jaHoje + pontos },
      dias: comItem(s.dias, dia).slice(-400),
    },
    pontos,
  ];
}

const ilhaDe = (s: EstadoJornada, ilha: string) => s.ilhas[ilha] ?? { inicio: hoje(), aula: false, faixas: [] };

export const jornada = {
  /** Mini aula lida. Pontua só na primeira vez. */
  lerAula(ilha: string) {
    const s = atual();
    const i = ilhaDe(s, ilha);
    if (i.aula) return 0;
    const [comAula, pontos] = comPontos(s, { tipo: "aula", chave: `aula:${ilha}` });
    gravar({ ...comAula, ilhas: { ...s.ilhas, [ilha]: { ...i, aula: true } } });
    return pontos;
  },
  /** Nível de faixa vencido numa ilha. O bônus vale só na primeira vez. */
  vencerFaixa(ilha: string, indice: number) {
    const s = atual();
    const i = ilhaDe(s, ilha);
    if (i.faixas.includes(indice)) return 0;
    const [novo, pontos] = comPontos(s, { tipo: "faixa", chave: `faixa:${ilha}:${indice}` });
    gravar({ ...novo, ilhas: { ...s.ilhas, [ilha]: { ...i, faixas: [...i.faixas, indice] } } });
    return pontos;
  },
  /** Uma rodada de perguntas terminada (ilha ou treino livre). */
  terminarRodada(evento: Extract<EventoPontos, { tipo: "quiz" }>) {
    const s = atual();
    const [novo, pontos] = comPontos(s, evento);
    const perfeita = evento.acertos === evento.total && evento.total >= 8;
    gravar({ ...novo, perfeitos: novo.perfeitos + (perfeita ? 1 : 0) });
    return pontos;
  },
  ordenarTrecho(kata: string, trecho: number) {
    const s = atual();
    const feitos = s.sequencias[kata] ?? [];
    if (feitos.includes(trecho)) return 0;
    const [novo, pontos] = comPontos(s, { tipo: "trecho", chave: `trecho:${kata}:${trecho}` });
    gravar({ ...novo, sequencias: { ...s.sequencias, [kata]: [...feitos, trecho] } });
    return pontos;
  },
  /**
   * Rodada do Monte a técnica. Pontua pelos acertos; ao vencer todas as
   * rodadas da família pela primeira vez, ganha o bônus da família.
   */
  terminarMontagem(familia: string, rodada: number, totalRodadas: number, acertos: number, total: number, venceu: boolean) {
    let s = atual();
    let ganhos = 0;
    let pontos: number;
    [s, pontos] = comPontos(s, { tipo: "montagem", chave: chaveNova("m"), acertos, total });
    ganhos += pontos;
    if (venceu) {
      const rodadas = comItem(s.montagem[familia] ?? [], rodada);
      const completou = rodadas.length >= totalRodadas && !s.familias.includes(familia);
      s = { ...s, montagem: { ...s.montagem, [familia]: rodadas } };
      if (completou) {
        [s, pontos] = comPontos(s, { tipo: "familia", chave: `familia:${familia}` });
        ganhos += pontos;
        s = { ...s, familias: [...s.familias, familia] };
      }
    }
    gravar(s);
    return ganhos;
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

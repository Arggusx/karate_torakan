import { CAMINHOS, progressoDo, trechosDo, BARALHOS } from "@/services/jornada";
import { getKatas } from "@/services/dataService";
import type { EstadoJornada } from "@/lib/jornadaStore";

/** Os jogos da Jornada, cada um com cor própria (--game) e um kanji de ícone. */
export const JOGOS = [
  { slug: "caminhos", nome: "Caminhos", kanji: "道", cor: "#5E8C63", resumo: "Seis caminhos de estudo, com leituras e quizzes." },
  { slug: "randori", nome: "Randori", kanji: "乱", cor: "#D98B2B", resumo: "Perguntas livres, de todos os temas." },
  { slug: "karuta", nome: "Karuta", kanji: "札", cor: "#C2486A", resumo: "Jogo da memória: o termo e o seu significado." },
  { slug: "sequencia", nome: "Sequência do kata", kanji: "順", cor: "#2E6E8E", resumo: "Ponha os movimentos na ordem certa." },
  { slug: "colecao", nome: "Livro de selos", kanji: "印", cor: "#8C6A3F", resumo: "Os selos, os katas e os baralhos que você concluiu." },
] as const;

export type SlugJogo = (typeof JOGOS)[number]["slug"];

export const jogo = (slug: string) => JOGOS.find((j) => j.slug === slug);

/** Os números do medalhão — informativos, nunca uma cobrança. */
export function resumoDa(estado: EstadoJornada) {
  const caminhosFeitos = CAMINHOS.filter((c) => progressoDo(c, estado.caminhos[c.id]).concluido);
  const katasDominados = getKatas().filter(
    (k) => (estado.sequencias[k.id]?.length ?? 0) >= trechosDo(k.movimentosDetalhados.length),
  );
  return {
    caminhosFeitos,
    katasDominados,
    baralhos: BARALHOS.filter((b) => estado.karuta.includes(b.id)),
  };
}

/** Iniciais para o medalhão: primeira e última palavra do nome. */
export function iniciaisDe(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "虎";
  return ((partes[0][0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

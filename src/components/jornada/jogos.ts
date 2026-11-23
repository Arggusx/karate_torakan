import { getKatas } from "@/services/dataService";
import {
  FAMILIAS,
  ILHAS,
  MOLDURAS_CONQUISTA,
  MOLDURAS_GRAU,
  MOLDURAS_RANKING,
  MOLDURA_SIMPLES,
  progressoDa,
  trechosDo,
  type Moldura,
} from "@/services/jornada";
import { grauDe } from "@/services/pontuacao";
import type { EstadoJornada } from "@/lib/jornadaStore";

/**
 * Os jogos da Jornada, cada um com cor própria (--game) e ícone em SVG.
 * O nome é em português; o termo japonês, quando há, vai como subtítulo.
 */
export const JOGOS = [
  { slug: "ilhas", nome: "Ilhas", jp: "", cor: "#2E7D6B", resumo: "Seis ilhas de estudo: mini aula e perguntas faixa a faixa." },
  { slug: "treino", nome: "Treino livre", jp: "Randori", cor: "#D98B2B", resumo: "Perguntas dos temas que você escolher, sem tradução." },
  { slug: "montar", nome: "Monte a técnica", jp: "", cor: "#C2486A", resumo: "Junte as palavras e forme o nome japonês do golpe." },
  { slug: "sequencia", nome: "Ordem do kata", jp: "", cor: "#2E6E8E", resumo: "Ponha os movimentos de cada kata na ordem certa." },
  { slug: "ranking", nome: "Ranking", jp: "", cor: "#B3261E", resumo: "Os pontos da semana e do mês, com todos do dojo." },
  { slug: "colecao", nome: "Livro de selos", jp: "", cor: "#8C6A3F", resumo: "Selos das ilhas, molduras e o que você concluiu." },
] as const;

export type SlugJogo = (typeof JOGOS)[number]["slug"];

export const jogo = (slug: string) => JOGOS.find((j) => j.slug === slug);

/** Endereços antigos que continuam funcionando. */
export const ENDERECOS_ANTIGOS: Record<string, string> = {
  caminhos: "ilhas",
  randori: "treino",
  karuta: "montar",
};

/** Os números do medalhão — informativos, nunca uma cobrança. */
export function resumoDa(estado: EstadoJornada) {
  const ilhasFeitas = ILHAS.filter((i) => progressoDa(i, estado.ilhas[i.id]).concluido);
  const katasDominados = getKatas().filter(
    (k) => (estado.sequencias[k.id]?.length ?? 0) >= trechosDo(k.movimentosDetalhados.length),
  );
  return {
    ilhasFeitas,
    katasDominados,
    familias: FAMILIAS.filter((f) => estado.familias.includes(f.id)),
  };
}

/** O que o servidor sabe da conta (quem está logado). */
export interface ContaJornada {
  total: number;
  podio: boolean;
  campeao: boolean;
}

/** Pontos que valem para o grau: os da conta, se maiores que os do aparelho. */
export const pontosDoGrau = (estado: EstadoJornada, conta?: ContaJornada | null) =>
  Math.max(estado.pontos, conta?.total ?? 0);

/** As molduras que a pessoa já ganhou. */
export function moldurasGanhas(estado: EstadoJornada, conta?: ContaJornada | null): Moldura[] {
  const { ilhasFeitas } = resumoDa(estado);
  const pontos = pontosDoGrau(estado, conta);
  const { indice } = grauDe(pontos);
  const [giro, kime, semana, lua] = MOLDURAS_CONQUISTA;
  const [podio, campeao] = MOLDURAS_RANKING;
  return [
    MOLDURA_SIMPLES,
    ...(pontos > 0 ? [giro] : []),
    ...(estado.perfeitos > 0 ? [kime] : []),
    ...(estado.dias.length >= 7 ? [semana] : []),
    ...(estado.dias.length >= 30 ? [lua] : []),
    ...ilhasFeitas.map((i) => i.moldura),
    ...MOLDURAS_GRAU.slice(0, indice),
    ...(conta?.podio ? [podio] : []),
    ...(conta?.campeao ? [campeao] : []),
  ];
}

/** Iniciais para o medalhão: primeira e última palavra do nome. */
export function iniciaisDe(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "虎";
  return ((partes[0][0] ?? "") + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
}

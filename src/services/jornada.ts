import {
  dados,
  getCategoriasTecnicas,
  getDicionario,
  getDojoKun,
  getEtiquetaDojo,
  getKatas,
  getMestres,
  getPilares,
  getPrincipiosTecnicos,
  getTecnicas,
  getTimeline,
} from "@/services/dataService";
import type { Tema } from "@/services/perguntas";

/**
 * Conteúdo da Jornada: os caminhos, os níveis de quiz e as recompensas.
 *
 * Toda lição sai do acervo do dojo (o mesmo JSON das páginas de estudo). O
 * que é escrito aqui à mão são só os títulos, a ordem e as recompensas.
 */

// ------------------------------------------------------------- lições

export interface Licao {
  titulo: string;
  kanji?: string;
  texto?: string;
  /** Lista curta: termo à esquerda, explicação à direita. */
  itens?: { termo: string; sub?: string; texto: string }[];
}

export interface Caminho {
  id: string;
  tema: Tema;
  nome: string;
  kanji: string;
  /** Cor do jogo (--game): ícone, contas, botão. */
  cor: string;
  resumo: string;
  licoes: Licao[];
  selo: { titulo: string; lemaJp: string; lemaPt: string };
  moldura: Moldura;
}

export interface Moldura {
  id: string;
  nome: string;
  cor: string;
  realce: string;
  /** Desenho em volta do avatar — ver Medalhao.tsx. */
  motivo: "nenhum" | "pincel" | "enso" | "tatame" | "bambu" | "sakura" | "ondas";
}

const pilar = (nome: string) => getPilares().find((p) => p.nome === nome);
const tecnicasDa = (cat: string, n = 7) =>
  getTecnicas()
    .filter((t) => t.cat === cat)
    .slice(0, n)
    .map((t) => ({ termo: t.nome, sub: t.kanji, texto: t.pt }));
const kata = (nome: string) => getKatas().find((k) => k.nome === nome);
const fichaKata = (nome: string) => {
  const k = kata(nome);
  return k
    ? { termo: k.nome, sub: k.kanji, texto: `${k.significadoNome} · ${k.quantidadeMovimentos} movimentos` }
    : null;
};
const fichas = (nomes: string[]) =>
  nomes.map(fichaKata).filter((f): f is NonNullable<typeof f> => Boolean(f));

const categoria = (id: string) => getCategoriasTecnicas().find((c) => c.id === id);
const timeline = getTimeline();
const mestres = getMestres();
const principios = getPrincipiosTecnicos();

export const CAMINHOS: Caminho[] = [
  {
    id: "kihon",
    tema: "kihon",
    nome: "Caminho do Kihon",
    kanji: "基本",
    cor: "#C0392B",
    resumo: "As técnicas fundamentais: bases, socos, defesas e chutes.",
    licoes: [
      { titulo: "O que é kihon", kanji: "基本", texto: `${pilar("Kihon")?.oque_e ?? ""} ${pilar("Kihon")?.para_que_serve ?? ""}` },
      { titulo: categoria("Bases")?.label ?? "Bases", kanji: categoria("Bases")?.kanji, itens: tecnicasDa("Bases") },
      { titulo: categoria("Socos")?.label ?? "Socos", kanji: categoria("Socos")?.kanji, itens: tecnicasDa("Socos") },
      { titulo: categoria("Defesas")?.label ?? "Defesas", kanji: categoria("Defesas")?.kanji, itens: tecnicasDa("Defesas") },
      { titulo: categoria("Chutes")?.label ?? "Chutes", kanji: categoria("Chutes")?.kanji, itens: tecnicasDa("Chutes") },
      { titulo: categoria("Kamae")?.label ?? "Guardas", kanji: categoria("Kamae")?.kanji, itens: tecnicasDa("Kamae") },
    ],
    selo: { titulo: "Raiz firme", lemaJp: "継続は力なり", lemaPt: "A persistência é força." },
    moldura: { id: "kihon", nome: "Moldura do Pincel", cor: "#C0392B", realce: "#F3C4BC", motivo: "pincel" },
  },
  {
    id: "katas",
    tema: "kata",
    nome: "Caminho dos Katas",
    kanji: "型",
    cor: "#2E6E8E",
    resumo: "As formas: de onde vêm, o que significam e como se contam.",
    licoes: [
      { titulo: "O que é kata", kanji: "型", texto: `${pilar("Kata")?.oque_e ?? ""} ${pilar("Kata")?.para_que_serve ?? ""}` },
      { titulo: "De onde vem cada kata", kanji: "源", texto: dados.origemDosKatas.nota },
      { titulo: "Os cinco Heian", kanji: "平安", itens: fichas(["Heian Shodan", "Heian Nidan", "Heian Sandan", "Heian Yondan", "Heian Godan"]) },
      { titulo: "Os três Tekki", kanji: "鉄騎", itens: fichas(["Tekki Shodan", "Tekki Nidan", "Tekki Sandan"]) },
      { titulo: "Katas de faixa preta", kanji: "黒帯", itens: fichas(["Bassai Dai", "Kanku Dai", "Jion", "Empi", "Hangetsu"]) },
      {
        titulo: "Kiai e contagem",
        kanji: "気合",
        texto: `${principios.find((p) => p.n === "Kiai")?.oque_e ?? ""} A contagem de movimentos e a posição do kiai seguem o acervo do dojo; outras escolas às vezes contam diferente.`,
      },
    ],
    selo: { titulo: "Guardião das formas", lemaJp: "守破離", lemaPt: "Proteger, romper, transcender." },
    moldura: { id: "katas", nome: "Moldura do Ensō", cor: "#2E6E8E", realce: "#BFDCE8", motivo: "enso" },
  },
  {
    id: "dojo",
    tema: "dojo",
    nome: "Caminho do Dojo",
    kanji: "道場",
    cor: "#8C6A3F",
    resumo: "Dojo Kun, etiqueta e os preceitos de Funakoshi.",
    licoes: [
      { titulo: "Dojo Kun", kanji: "道場訓", itens: getDojoKun().map((l) => ({ termo: l.pt, sub: l.romaji, texto: l.text })) },
      ...getEtiquetaDojo().map((e) => ({ titulo: `${e.nome} — ${e.traducao}`, kanji: e.kanji, texto: `${e.oque_e} ${e.para_que_serve}` })),
      {
        titulo: "Niju Kun",
        kanji: "二十訓",
        itens: dados.preceitosNijuKun.map((p) => {
          const [, n, resto] = p.match(/^(\d+)\.\s*(.*)$/) ?? [null, "", p];
          return { termo: n ? `${n}º` : "", texto: resto };
        }),
      },
    ],
    selo: { titulo: "Dentro do dojo", lemaJp: "礼に始まり礼に終わる", lemaPt: "Começa e termina com o cumprimento." },
    moldura: { id: "dojo", nome: "Moldura do Tatame", cor: "#8C6A3F", realce: "#E8D3AE", motivo: "tatame" },
  },
  {
    id: "historia",
    tema: "historia",
    nome: "Caminho da Linhagem",
    kanji: "歴史",
    cor: "#5E8C63",
    resumo: "De Okinawa ao Brasil, e os mestres que levaram o karatê adiante.",
    licoes: [
      { titulo: "Okinawa", kanji: "沖縄", itens: timeline.slice(0, 4).map((t) => ({ termo: t.year, sub: t.kanji, texto: `${t.title}. ${t.text}` })) },
      { titulo: "O Japão", kanji: "日本", itens: timeline.slice(4, 9).map((t) => ({ termo: t.year, sub: t.kanji, texto: `${t.title}. ${t.text}` })) },
      { titulo: "O mundo", kanji: "世界", itens: timeline.slice(9).map((t) => ({ termo: t.year, sub: t.kanji, texto: `${t.title}. ${t.text}` })) },
      { titulo: "Os primeiros mestres", kanji: "師", itens: mestres.slice(0, 4).map((m) => ({ termo: m.nome, sub: m.anos, texto: m.text })) },
      { titulo: "A geração que espalhou o Shotokan", kanji: "伝", itens: mestres.slice(4).map((m) => ({ termo: m.nome, sub: m.anos, texto: m.text })) },
    ],
    selo: { titulo: "Herdeiro da linhagem", lemaJp: "温故知新", lemaPt: "Rever o antigo para entender o novo." },
    moldura: { id: "historia", nome: "Moldura do Bambu", cor: "#5E8C63", realce: "#CDE4C2", motivo: "bambu" },
  },
  {
    id: "vocabulario",
    tema: "vocabulario",
    nome: "Caminho das Palavras",
    kanji: "言葉",
    cor: "#7A5A9E",
    resumo: "O japonês que se ouve no tatame.",
    licoes: [
      { titulo: "Dicionário do dojo", kanji: "辞書", itens: getDicionario().map((d) => ({ termo: d.romaji, sub: d.jp, texto: d.pt })) },
      {
        titulo: "Como se lê o nome de uma técnica",
        kanji: "読",
        itens: getCategoriasTecnicas()
          .filter((c) => c.id !== "Katas")
          .map((c) => {
            // "Chutes (Keri)" → "Keri": o sufixo que aparece no nome da técnica.
            const sufixo = c.label.match(/\(([^)]*)\)/)?.[1] ?? c.id;
            return {
              termo: c.id,
              sub: c.kanji,
              texto: `O nome termina em ${sufixo} — e o som muda quando vem colado a outra palavra: tsuki vira zuki, keri vira geri.`,
            };
          }),
      },
      {
        titulo: "Kanji das técnicas",
        kanji: "漢字",
        itens: getTecnicas()
          .filter((_, i) => i % 9 === 0)
          .slice(0, 8)
          .map((t) => ({ termo: t.kanji, sub: t.nome, texto: t.pt })),
      },
    ],
    selo: { titulo: "Ouvido do dojo", lemaJp: "一期一会", lemaPt: "Cada encontro acontece uma única vez." },
    moldura: { id: "vocabulario", nome: "Moldura da Sakura", cor: "#7A5A9E", realce: "#F2CFE0", motivo: "sakura" },
  },
  {
    id: "filosofia",
    tema: "filosofia",
    nome: "Caminho da Mente",
    kanji: "心",
    cor: "#C8963E",
    resumo: "Kime, zanshin, maai: os princípios por trás do movimento.",
    licoes: [
      { titulo: "Foco, grito e alerta", kanji: "決", itens: principios.slice(0, 3).map((p) => ({ termo: p.n, sub: p.k, texto: `${p.traducao}. ${p.oque_e}` })) },
      { titulo: "Distância, ritmo e quadril", kanji: "間", itens: principios.slice(3, 6).map((p) => ({ termo: p.n, sub: p.k, texto: `${p.traducao}. ${p.oque_e}` })) },
      { titulo: "A mente do praticante", kanji: "心", itens: principios.slice(6).map((p) => ({ termo: p.n, sub: p.k, texto: `${p.traducao}. ${p.oque_e}` })) },
    ],
    selo: { titulo: "Mente de principiante", lemaJp: "七転び八起き", lemaPt: "Cair sete vezes, levantar oito." },
    moldura: { id: "filosofia", nome: "Moldura das Ondas", cor: "#C8963E", realce: "#F2DFA9", motivo: "ondas" },
  },
];

/** Moldura de quem ainda não concluiu nenhum caminho. */
export const MOLDURA_SIMPLES: Moldura = {
  id: "simples",
  nome: "Moldura simples",
  cor: "#B9A47E",
  realce: "#EFE6D2",
  motivo: "nenhum",
};

export const TODAS_MOLDURAS = [MOLDURA_SIMPLES, ...CAMINHOS.map((c) => c.moldura)];

// ------------------------------------------------------------- paradas

/** Os níveis de quiz de cada caminho, como no Oratio. */
export const NIVEIS = [
  { id: 1, titulo: "Quiz fácil", tamanho: 4, passa: 3 },
  { id: 2, titulo: "Quiz médio", tamanho: 4, passa: 3 },
  { id: 3, titulo: "Quiz difícil", tamanho: 4, passa: 3 },
  { id: 4, titulo: "Desafio final", tamanho: 6, passa: 5 },
] as const;

export type Parada =
  | { tipo: "licao"; indice: number; licao: Licao }
  | { tipo: "quiz"; nivel: (typeof NIVEIS)[number] };

/**
 * A ordem do caminho: as lições divididas em três partes, cada parte fechada
 * por um quiz (fácil, médio, difícil), e o desafio final no fim.
 */
export function paradasDo(caminho: Caminho): Parada[] {
  const n = caminho.licoes.length;
  const cortes = [Math.ceil(n / 3), Math.ceil((2 * n) / 3), n];
  const paradas: Parada[] = [];
  caminho.licoes.forEach((licao, i) => {
    paradas.push({ tipo: "licao", indice: i, licao });
    cortes.forEach((corte, nivel) => {
      if (corte === i + 1 && !paradas.some((p) => p.tipo === "quiz" && p.nivel.id === nivel + 1)) {
        paradas.push({ tipo: "quiz", nivel: NIVEIS[nivel] });
      }
    });
  });
  paradas.push({ tipo: "quiz", nivel: NIVEIS[3] });
  return paradas;
}

/** Onde a pessoa está num caminho, a partir do estado guardado. */
export function progressoDo(
  caminho: Caminho,
  salvo: { lidas: number[]; niveis: number[] } | undefined,
) {
  const paradas = paradasDo(caminho);
  const feita = (p: Parada) =>
    p.tipo === "licao" ? Boolean(salvo?.lidas.includes(p.indice)) : Boolean(salvo?.niveis.includes(p.nivel.id));
  const proxima = paradas.findIndex((p) => !feita(p));
  return {
    paradas,
    feita,
    proxima,
    feitas: paradas.filter(feita).length,
    total: paradas.length,
    comecou: Boolean(salvo),
    concluido: proxima === -1,
  };
}

// ------------------------------------------------------------- sequência

/** Tamanho do trecho no jogo da sequência: 6 movimentos por rodada. */
export const TRECHO = 6;

export const trechosDo = (movimentos: number) => Math.ceil(movimentos / TRECHO);

// ------------------------------------------------------------- karuta

export interface Baralho {
  id: string;
  nome: string;
  kanji: string;
  cartas: { termo: string; significado: string }[];
}

export const BARALHOS: Baralho[] = [
  ...getCategoriasTecnicas()
    .filter((c) => c.id !== "Katas")
    .map((c) => ({
      id: c.id.toLowerCase(),
      nome: c.label,
      kanji: c.kanji,
      cartas: getTecnicas()
        .filter((t) => t.cat === c.id)
        .map((t) => ({ termo: t.nome, significado: t.pt })),
    })),
  {
    id: "principios",
    nome: "Princípios",
    kanji: "心",
    cartas: principios.map((p) => ({ termo: p.n, significado: p.traducao })),
  },
  {
    id: "dicionario",
    nome: "Palavras do dojo",
    kanji: "言葉",
    cartas: [
      ...getDicionario().map((d) => ({ termo: d.romaji, significado: d.pt.replace(/\s*—.*$/, "") })),
      ...getEtiquetaDojo().map((e) => ({ termo: e.nome, significado: e.traducao })),
    ],
  },
];

/** Pares por rodada de karuta. */
export const PARES = 6;

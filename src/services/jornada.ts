import {
  dados,
  getCategoriasTecnicas,
  getGraduacoes,
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
import type { IlhaId } from "@/services/pontuacao";

/**
 * Conteúdo da Jornada: as ilhas, as molduras e o Monte a técnica.
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

export interface Ilha {
  id: IlhaId;
  tema: Tema;
  nome: string;
  /** Só no carimbo do Livro de selos — o hanko leva kanji de verdade. */
  kanji: string;
  /** Cor da ilha (--game): contas, botão, faixa do cartão. */
  cor: string;
  resumo: string;
  /** A mini aula: lida ao chegar na ilha, antes das perguntas. */
  aula: Licao[];
  selo: { titulo: string; lemaJp: string; lemaPt: string };
  moldura: Moldura;
}

export interface Moldura {
  id: string;
  nome: string;
  cor: string;
  realce: string;
  /** Desenho estático em volta do avatar (molduras das ilhas). */
  motivo?: "nenhum" | "pincel" | "enso" | "tatame" | "bambu" | "sakura" | "ondas";
  /** Borda animada em SVG (ver camadasSvg.ts). */
  borda?: string;
  /** Como se ganha, em uma frase. */
  como: string;
  grupo: "inicio" | "ilha" | "grau" | "conquista" | "ranking";
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

export const ILHAS: Ilha[] = [
  {
    id: "kihon",
    tema: "kihon",
    nome: "Ilha do Kihon",
    kanji: "基本",
    cor: "#C0392B",
    resumo: "As técnicas fundamentais: bases, socos, defesas e chutes.",
    aula: [
      { titulo: "O que é kihon", kanji: "基本", texto: `${pilar("Kihon")?.oque_e ?? ""} ${pilar("Kihon")?.para_que_serve ?? ""}` },
      { titulo: categoria("Bases")?.label ?? "Bases", kanji: categoria("Bases")?.kanji, itens: tecnicasDa("Bases") },
      { titulo: categoria("Socos")?.label ?? "Socos", kanji: categoria("Socos")?.kanji, itens: tecnicasDa("Socos") },
      { titulo: categoria("Defesas")?.label ?? "Defesas", kanji: categoria("Defesas")?.kanji, itens: tecnicasDa("Defesas") },
      { titulo: categoria("Chutes")?.label ?? "Chutes", kanji: categoria("Chutes")?.kanji, itens: tecnicasDa("Chutes") },
      { titulo: categoria("Kamae")?.label ?? "Guardas", kanji: categoria("Kamae")?.kanji, itens: tecnicasDa("Kamae") },
    ],
    selo: { titulo: "Raiz firme", lemaJp: "継続は力なり", lemaPt: "A persistência é força." },
    moldura: { id: "kihon", nome: "Moldura do Pincel", cor: "#C0392B", realce: "#F3C4BC", motivo: "pincel", como: "Conclua a Ilha do Kihon.", grupo: "ilha" },
  },
  {
    id: "katas",
    tema: "kata",
    nome: "Ilha dos Katas",
    kanji: "型",
    cor: "#2E6E8E",
    resumo: "As formas: de onde vêm, o que significam e como se contam.",
    aula: [
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
    moldura: { id: "katas", nome: "Moldura do Ensō", cor: "#2E6E8E", realce: "#BFDCE8", motivo: "enso", como: "Conclua a Ilha dos Katas.", grupo: "ilha" },
  },
  {
    id: "dojo",
    tema: "dojo",
    nome: "Ilha do Dojo",
    kanji: "道場",
    cor: "#8C6A3F",
    resumo: "Dojo Kun, etiqueta e os preceitos de Funakoshi.",
    aula: [
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
    moldura: { id: "dojo", nome: "Moldura do Tatame", cor: "#8C6A3F", realce: "#E8D3AE", motivo: "tatame", como: "Conclua a Ilha do Dojo.", grupo: "ilha" },
  },
  {
    id: "historia",
    tema: "historia",
    nome: "Ilha da Linhagem",
    kanji: "歴史",
    cor: "#5E8C63",
    resumo: "De Okinawa ao Brasil, e os mestres que levaram o karatê adiante.",
    aula: [
      { titulo: "Okinawa", kanji: "沖縄", itens: timeline.slice(0, 4).map((t) => ({ termo: t.year, sub: t.kanji, texto: `${t.title}. ${t.text}` })) },
      { titulo: "O Japão", kanji: "日本", itens: timeline.slice(4, 9).map((t) => ({ termo: t.year, sub: t.kanji, texto: `${t.title}. ${t.text}` })) },
      { titulo: "O mundo", kanji: "世界", itens: timeline.slice(9).map((t) => ({ termo: t.year, sub: t.kanji, texto: `${t.title}. ${t.text}` })) },
      { titulo: "Os primeiros mestres", kanji: "師", itens: mestres.slice(0, 4).map((m) => ({ termo: m.nome, sub: m.anos, texto: m.text })) },
      { titulo: "A geração que espalhou o Shotokan", kanji: "伝", itens: mestres.slice(4).map((m) => ({ termo: m.nome, sub: m.anos, texto: m.text })) },
    ],
    selo: { titulo: "Herdeiro da linhagem", lemaJp: "温故知新", lemaPt: "Rever o antigo para entender o novo." },
    moldura: { id: "historia", nome: "Moldura do Bambu", cor: "#5E8C63", realce: "#CDE4C2", motivo: "bambu", como: "Conclua a Ilha da Linhagem.", grupo: "ilha" },
  },
  {
    id: "vocabulario",
    tema: "vocabulario",
    nome: "Ilha das Palavras",
    kanji: "言葉",
    cor: "#7A5A9E",
    resumo: "O japonês que se ouve no tatame.",
    aula: [
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
    moldura: { id: "vocabulario", nome: "Moldura da Sakura", cor: "#7A5A9E", realce: "#F2CFE0", motivo: "sakura", como: "Conclua a Ilha das Palavras.", grupo: "ilha" },
  },
  {
    id: "filosofia",
    tema: "filosofia",
    nome: "Ilha da Mente",
    kanji: "心",
    cor: "#C8963E",
    resumo: "Kime, zanshin, maai: os princípios por trás do movimento.",
    aula: [
      { titulo: "Foco, grito e alerta", kanji: "決", itens: principios.slice(0, 3).map((p) => ({ termo: p.n, sub: p.k, texto: `${p.traducao}. ${p.oque_e}` })) },
      { titulo: "Distância, ritmo e quadril", kanji: "間", itens: principios.slice(3, 6).map((p) => ({ termo: p.n, sub: p.k, texto: `${p.traducao}. ${p.oque_e}` })) },
      { titulo: "A mente do praticante", kanji: "心", itens: principios.slice(6).map((p) => ({ termo: p.n, sub: p.k, texto: `${p.traducao}. ${p.oque_e}` })) },
    ],
    selo: { titulo: "Mente de principiante", lemaJp: "七転び八起き", lemaPt: "Cair sete vezes, levantar oito." },
    moldura: { id: "filosofia", nome: "Moldura das Ondas", cor: "#C8963E", realce: "#F2DFA9", motivo: "ondas", como: "Conclua a Ilha da Mente.", grupo: "ilha" },
  },
];

/** A moldura de quem está começando. */
export const MOLDURA_SIMPLES: Moldura = {
  id: "simples",
  nome: "Moldura simples",
  cor: "#B9A47E",
  realce: "#EFE6D2",
  motivo: "nenhum",
  como: "A de todo mundo, desde o primeiro dia.",
  grupo: "inicio",
};

/**
 * Molduras animadas (SVG com SMIL, desenhadas em camadasSvg.ts). As dos
 * graus vêm com os pontos; as de conquista, com um feito; as do ranking,
 * com a posição numa semana ou num mês já encerrados.
 */
export const MOLDURAS_GRAU: Moldura[] = [
  { id: "b-bambu", nome: "Bambu que cresce", cor: "#4E8A4A", realce: "#D7EBCF", borda: "bambu", como: "Chegue ao grau Aprendiz (200 pontos).", grupo: "grau" },
  { id: "b-enso", nome: "Ensō de tinta", cor: "#2B2B2B", realce: "#E9E3D8", borda: "enso", como: "Chegue ao grau Discípulo (600 pontos).", grupo: "grau" },
  { id: "b-sakura", nome: "Chuva de sakura", cor: "#C2486A", realce: "#F7D9E4", borda: "sakura", como: "Chegue ao grau Praticante dedicado (1.500 pontos).", grupo: "grau" },
  { id: "b-kiai", nome: "Relâmpago do kiai", cor: "#E0A400", realce: "#FFF1BF", borda: "kiai", como: "Chegue ao grau Especialista (3.500 pontos).", grupo: "grau" },
  { id: "b-tora", nome: "Tigre dourado", cor: "#C8963E", realce: "#F6E3B4", borda: "tora", como: "Chegue ao grau Mestre da Jornada (7.000 pontos).", grupo: "grau" },
];

export const MOLDURAS_CONQUISTA: Moldura[] = [
  { id: "b-giro", nome: "Primeiro passo", cor: "#3B82C4", realce: "#D6E8F7", borda: "giro", como: "Ganhe os primeiros pontos na Jornada.", grupo: "conquista" },
  { id: "b-kime", nome: "Kime perfeito", cor: "#5C7A6B", realce: "#DCE7E1", borda: "kime", como: "Acerte todas de uma rodada com 8 perguntas ou mais.", grupo: "conquista" },
  { id: "b-semana", nome: "Sete treinos", cor: "#D14B7C", realce: "#F8D5E2", borda: "semana", como: "Jogue em 7 dias diferentes.", grupo: "conquista" },
  { id: "b-lua", nome: "Lua do dojo", cor: "#4B4FA8", realce: "#DCDDF5", borda: "lua", como: "Jogue em 30 dias diferentes.", grupo: "conquista" },
];

export const MOLDURAS_RANKING: Moldura[] = [
  { id: "b-podio", nome: "Pódio da semana", cor: "#B87333", realce: "#F3DCC4", borda: "podio", como: "Fique entre os 3 primeiros de uma semana do ranking.", grupo: "ranking" },
  { id: "b-campeao", nome: "Campeão do mês", cor: "#B3261E", realce: "#F7D6C9", borda: "campeao", como: "Termine um mês em 1º lugar no ranking.", grupo: "ranking" },
];

export const TODAS_MOLDURAS: Moldura[] = [
  MOLDURA_SIMPLES,
  ...ILHAS.map((i) => i.moldura),
  ...MOLDURAS_CONQUISTA,
  ...MOLDURAS_GRAU,
  ...MOLDURAS_RANKING,
];

// ------------------------------------------------------------- paradas

/** As oito faixas viram os oito níveis de cada ilha. */
export const FAIXAS = getGraduacoes();

export type Parada = { tipo: "aula" } | { tipo: "faixa"; indice: number };

/** A ordem da ilha: a mini aula e, depois, uma parada por faixa. */
export function paradasDa(_ilha: Ilha): Parada[] {
  return [{ tipo: "aula" }, ...FAIXAS.map((_, indice) => ({ tipo: "faixa" as const, indice }))];
}

/** Onde a pessoa está numa ilha, a partir do estado guardado. */
export function progressoDa(ilha: Ilha, salvo: { aula: boolean; faixas: number[] } | undefined) {
  const paradas = paradasDa(ilha);
  const feita = (p: Parada) => (p.tipo === "aula" ? Boolean(salvo?.aula) : Boolean(salvo?.faixas.includes(p.indice)));
  const proxima = paradas.findIndex((p) => !feita(p));
  return {
    paradas,
    feita,
    proxima,
    feitas: paradas.filter(feita).length,
    total: paradas.length,
    comecou: Boolean(salvo?.aula),
    concluido: proxima === -1,
  };
}

// ------------------------------------------------------------- sequência

/** Tamanho do trecho no jogo da ordem do kata: 6 movimentos por rodada. */
export const TRECHO = 6;

export const trechosDo = (movimentos: number) => Math.ceil(movimentos / TRECHO);

// ------------------------------------------------------------- monte a técnica

/** "Gedan Barai" → ["Gedan", "Barai"]; "Yoko-Geri Keage" → ["Yoko", "Geri", "Keage"]. */
export const pecasDe = (nome: string) => nome.split(/[\s-]+/).filter(Boolean);

export interface Familia {
  id: string;
  nome: string;
  /** Rótulo curto da família (o que vai no ícone). */
  curto: string;
  tecnicas: { nome: string; pt: string; desc: string }[];
}

/**
 * As famílias do Monte a técnica: só entram técnicas com duas palavras ou
 * mais — com uma só não há o que montar.
 */
export const FAMILIAS: Familia[] = getCategoriasTecnicas()
  .filter((c) => c.id !== "Katas")
  .map((c) => ({
    id: c.id.toLowerCase(),
    nome: c.label,
    curto: c.id,
    tecnicas: getTecnicas()
      .filter((t) => t.cat === c.id && pecasDe(t.nome).length >= 2)
      .map((t) => ({ nome: t.nome, pt: t.pt, desc: t.desc })),
  }))
  .filter((f) => f.tecnicas.length >= 4);

/** Técnicas por rodada do Monte a técnica. */
export const POR_RODADA = 6;

export const rodadasDa = (f: Familia) => Math.ceil(f.tecnicas.length / POR_RODADA);

/**
 * O que cada palavra quer dizer, para a explicação depois da montagem.
 * Sai do dicionário quando a palavra está lá; o resto é o vocabulário básico
 * dos nomes de técnica.
 */
const PALAVRAS: Record<string, string> = {
  zuki: "soco (tsuki)", tsuki: "soco", geri: "chute (keri)", keri: "chute", uke: "defesa", uchi: "golpe / de dentro",
  dachi: "base (tachi)", tachi: "base", gedan: "nível baixo", chudan: "nível médio", jodan: "nível alto",
  oi: "avançando", gyaku: "inverso", mae: "frente", yoko: "lateral", ushiro: "trás", mawashi: "circular",
  age: "subindo", soto: "de fora", shuto: "mão em faca", empi: "cotovelo", hiza: "joelho", kiba: "cavaleiro",
  zenkutsu: "peso à frente", kokutsu: "peso atrás", kizami: "curto, com a mão da frente", barai: "varrer",
  keage: "chicoteado", kekomi: "penetrante", ura: "invertido", tate: "vertical", morote: "duas mãos",
  kakiwake: "separando", manji: "em forma de manji (símbolo budista)", mikazuki: "lua crescente", nukite: "mão em lança",
  haito: "costas da mão em faca", haishu: "dorso da mão", teisho: "base da palma", nagashi: "desviando",
  kake: "enganchando", sukui: "colhendo", morote_uke: "defesa reforçada", heisoku: "pés juntos", musubi: "pés em V",
  hachiji: "pés afastados", neko: "gato", sanchin: "três batalhas", fudo: "inabalável", kosa: "cruzada",
  tsuru: "garça", sagi: "garça", ashi: "pé / perna", gamae: "guarda (kamae)", kamae: "guarda", hidari: "esquerda", migi: "direita", choku: "direto", kage: "gancho", yama: "montanha", awase: "unidos", uraken: "dorso do punho", tettsui: "punho-martelo", kin: "virilha", fumikomi: "pisando", tobi: "saltando", nidan: "em dois níveis", juji: "em cruz", osae: "pressionando", heiko: "paralelos", shiko: "base do sumô", renoji: "em L", hangetsu: "meia-lua", shizentai: "postura natural", haiwan: "costas do antebraço", keito: "cabeça de galo", tsukami: "agarrando", sokumen: "de lado", jun: "à frente", otoshi: "descendo", koshi: "quadril", ryoken: "dois punhos", ryowan: "dois braços", koko: "boca de tigre", nami: "onda", gaeshi: "voltando", hasami: "tesoura", ren: "em sequência", nakadaka: "nó do dedo médio", ippon: "um", ken: "punho", sankaku: "triângulo",
};

export const significadoDaPeca = (peca: string) => {
  const chave = peca.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return PALAVRAS[chave];
};

/**
 * Pontos da Jornada: as mesmas regras no navegador (para mostrar na hora) e
 * no servidor (que é quem decide o que vale no ranking).
 *
 * O navegador só conta o que aconteceu ("acertei 6 de 8 no nível 2"); quem
 * transforma isso em pontos é `pontosDo`, e o servidor recalcula com a mesma
 * função. Assim ninguém manda "ganhei 5000" pela rede: o máximo por evento
 * e por dia está aqui.
 */

export const ILHA_IDS = ["kihon", "katas", "dojo", "historia", "vocabulario", "filosofia"] as const;
export type IlhaId = (typeof ILHA_IDS)[number];

export type EventoPontos =
  /** Uma rodada de perguntas (ilha ou treino livre). Pode repetir. */
  | { tipo: "quiz"; chave: string; acertos: number; total: number; nivel: 1 | 2 | 3; alternativas: 4 | 5 }
  /** Mini aula de uma ilha lida pela primeira vez. */
  | { tipo: "aula"; chave: string }
  /** Nível de faixa vencido numa ilha, pela primeira vez. */
  | { tipo: "faixa"; chave: string }
  /** Trecho de kata posto na ordem, pela primeira vez. */
  | { tipo: "trecho"; chave: string }
  /** Uma rodada do Monte a técnica. Pode repetir. */
  | { tipo: "montagem"; chave: string; acertos: number; total: number }
  /** Família inteira do Monte a técnica concluída, pela primeira vez. */
  | { tipo: "familia"; chave: string };

/** Teto por evento e por dia: estudar muito vale, maratonar para subir no ranking não. */
export const LIMITE_EVENTO = 300;
export const LIMITE_DIA = 800;

/** Máximo de perguntas que uma rodada pode declarar. */
const MAX_PERGUNTAS = 12;

const inteiro = (n: unknown, min: number, max: number) =>
  typeof n === "number" && Number.isInteger(n) && n >= min && n <= max;

/** Pontos de um evento; 0 se ele não fizer sentido. */
export function pontosDo(e: EventoPontos): number {
  switch (e.tipo) {
    case "quiz": {
      if (!inteiro(e.total, 1, MAX_PERGUNTAS) || !inteiro(e.acertos, 0, e.total)) return 0;
      if (![1, 2, 3].includes(e.nivel) || ![4, 5].includes(e.alternativas)) return 0;
      const porAcerto = 5 + 5 * e.nivel + (e.alternativas === 5 ? 3 : 0);
      const perfeito = e.acertos === e.total && e.total >= 5 ? 20 : 0;
      return Math.min(LIMITE_EVENTO, e.acertos * porAcerto + perfeito);
    }
    case "aula":
      return 15;
    case "faixa": {
      const indice = Number(e.chave.split(":")[2]);
      return 40 + 10 * (Number.isInteger(indice) ? indice : 0);
    }
    case "trecho":
      return 15;
    case "montagem":
      if (!inteiro(e.total, 1, 8) || !inteiro(e.acertos, 0, e.total)) return 0;
      return e.acertos * 8;
    case "familia":
      return 60;
    default:
      return 0;
  }
}

/** Formato da chave de cada tipo: as de "primeira vez" só valem uma vez por pessoa. */
const CHAVES: Record<EventoPontos["tipo"], RegExp> = {
  quiz: /^q:[a-z0-9]{6,32}$/,
  montagem: /^m:[a-z0-9]{6,32}$/,
  aula: new RegExp(`^aula:(${ILHA_IDS.join("|")})$`),
  faixa: new RegExp(`^faixa:(${ILHA_IDS.join("|")}):[0-7]$`),
  trecho: /^trecho:[a-z0-9-]{2,40}:\d{1,2}$/,
  familia: /^familia:[a-z0-9-]{2,30}$/,
};

/** Confere o formato vindo da rede. Devolve o evento limpo ou null. */
export function lerEvento(bruto: unknown): EventoPontos | null {
  if (!bruto || typeof bruto !== "object") return null;
  const b = bruto as Record<string, unknown>;
  const tipo = b.tipo as EventoPontos["tipo"];
  const chave = typeof b.chave === "string" ? b.chave : "";
  if (!(tipo in CHAVES) || !CHAVES[tipo].test(chave)) return null;
  const n = (v: unknown) => (typeof v === "number" ? v : NaN);
  switch (tipo) {
    case "quiz":
      return {
        tipo, chave,
        acertos: n(b.acertos), total: n(b.total),
        nivel: n(b.nivel) as 1 | 2 | 3, alternativas: n(b.alternativas) as 4 | 5,
      };
    case "montagem":
      return { tipo, chave, acertos: n(b.acertos), total: n(b.total) };
    default:
      return { tipo, chave } as EventoPontos;
  }
}

/** Chave aleatória para eventos que podem repetir (cada rodada é uma). */
export const chaveNova = (prefixo: "q" | "m") =>
  `${prefixo}:${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

// ------------------------------------------------------------- graus

/**
 * Graus da Jornada, pelos pontos somados desde sempre. Não são faixas (faixa
 * se ganha no tatame): são os nomes que o dojo dá a quem está no caminho.
 */
export const GRAUS = [
  { id: "shoshin", nome: "Iniciante", jp: "Shoshin", kanji: "初心", min: 0, sobre: "Mente de principiante: tudo é novo." },
  { id: "monjin", nome: "Aprendiz", jp: "Monjin", kanji: "門人", min: 200, sobre: "Quem já passou pelo portão do dojo." },
  { id: "deshi", nome: "Discípulo", jp: "Deshi", kanji: "弟子", min: 600, sobre: "Treina com um mestre e segue o programa." },
  { id: "shugyosha", nome: "Praticante dedicado", jp: "Shugyōsha", kanji: "修行者", min: 1500, sobre: "Faz do treino um hábito." },
  { id: "tatsujin", nome: "Especialista", jp: "Tatsujin", kanji: "達人", min: 3500, sobre: "Conhece o caminho por dentro." },
  { id: "meijin", nome: "Mestre da Jornada", jp: "Meijin", kanji: "名人", min: 7000, sobre: "Estudou tudo o que o acervo tem." },
] as const;

export type Grau = (typeof GRAUS)[number];

/** O grau de quem tem `pontos`, e quanto falta para o próximo. */
export function grauDe(pontos: number) {
  let indice = 0;
  GRAUS.forEach((g, i) => {
    if (pontos >= g.min) indice = i;
  });
  const atual = GRAUS[indice];
  const proximo = GRAUS[indice + 1];
  return {
    atual,
    indice,
    proximo,
    falta: proximo ? proximo.min - pontos : 0,
    /** 0..1 dentro do grau atual. */
    fracao: proximo ? (pontos - atual.min) / (proximo.min - atual.min) : 1,
  };
}

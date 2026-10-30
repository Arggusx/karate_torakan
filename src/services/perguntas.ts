import {
  acharTecnica,
  dados,
  getCategoriasTecnicas,
  getGraduacoes,
  getDicionario,
  getDojoKun,
  getEtiquetaDojo,
  getKatas,
  getMestres,
  getPrincipiosTecnicos,
  getTecnicas,
  getTimeline,
} from "@/services/dataService";
import type { GraduacaoCompleta, KataCompleto, Tecnica } from "@/types";

/**
 * Banco de perguntas gerado a partir do acervo.
 *
 * Nenhuma pergunta é escrita à mão: cada gerador lê um pedaço do JSON do
 * dojo (técnicas, katas, Dojo Kun, princípios, linhagem) e monta enunciado,
 * alternativas e a explicação. Assim o banco cresce sozinho quando o acervo
 * cresce, e nunca diz algo que o próprio site não diga.
 *
 * O sorteio é reproduzível (semente numérica): o servidor monta a prova com
 * uma semente e guarda o gabarito; os minigames usam uma semente nova a cada
 * rodada. O módulo não depende de navegador nem de servidor — serve aos dois.
 */

export type Tema =
  | "kihon"
  | "kata"
  | "dojo"
  | "historia"
  | "vocabulario"
  | "filosofia";

export type Nivel = 1 | 2 | 3;

export interface Pergunta {
  id: string;
  tema: Tema;
  /** "pratica" fala de técnica e kata; "teoria", do resto. */
  tipo: "pratica" | "teoria";
  nivel: Nivel;
  enunciado: string;
  alternativas: string[];
  /** Índice da alternativa certa em `alternativas`. */
  correta: number;
  /** O "por quê", mostrado depois da resposta — acertando ou não. */
  porque: string;
  /** De quem a pergunta fala (técnica, kata, preceito): limita repetição. */
  sujeito: string;
}

/** A mesma pergunta sem o gabarito: é o que vai ao navegador durante a prova. */
export type PerguntaPublica = Omit<Pergunta, "correta" | "porque" | "sujeito">;

export const TEMAS: { id: Tema; label: string; kanji: string }[] = [
  { id: "kihon", label: "Kihon", kanji: "基本" },
  { id: "kata", label: "Katas", kanji: "型" },
  { id: "dojo", label: "Dojo", kanji: "道場" },
  { id: "historia", label: "História", kanji: "歴史" },
  { id: "vocabulario", label: "Vocabulário", kanji: "言葉" },
  { id: "filosofia", label: "Filosofia", kanji: "心" },
];

// ------------------------------------------------------------- sorteio

/** Gerador pseudoaleatório pequeno e reproduzível (mulberry32). */
export function criarSorteio(semente: number) {
  let a = semente >>> 0;
  const proximo = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    numero: proximo,
    inteiro: (max: number) => Math.floor(proximo() * max),
    um<T>(lista: readonly T[]): T {
      return lista[Math.floor(proximo() * lista.length)];
    },
    embaralhar<T>(lista: readonly T[]): T[] {
      const copia = [...lista];
      for (let i = copia.length - 1; i > 0; i -= 1) {
        const j = Math.floor(proximo() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
      }
      return copia;
    },
  };
}

export type Sorteio = ReturnType<typeof criarSorteio>;

export const novaSemente = () => Math.floor(Math.random() * 2 ** 31);

// ------------------------------------------------------------- utilidades

const normal = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "");

/**
 * Monta as quatro alternativas: a certa e três erradas sorteadas do conjunto
 * de candidatas, sem repetir texto (ignorando acento e caixa). Devolve null
 * se não houver erradas suficientes — o gerador então desiste da pergunta.
 */
function montar(
  s: Sorteio,
  certa: string,
  candidatas: string[],
  quantas = 3,
): { alternativas: string[]; correta: number } | null {
  const vistos = new Set([normal(certa)]);
  const erradas: string[] = [];
  for (const opcao of s.embaralhar(candidatas)) {
    const chave = normal(opcao);
    if (!opcao.trim() || vistos.has(chave)) continue;
    vistos.add(chave);
    erradas.push(opcao);
    if (erradas.length === quantas) break;
  }
  if (erradas.length < quantas) return null;
  const alternativas = s.embaralhar([certa, ...erradas]);
  return { alternativas, correta: alternativas.indexOf(certa) };
}

/** Primeira frase de um texto, para explicações curtas. */
const primeiraFrase = (texto: string) => {
  const fim = texto.search(/[.!?](\s|$)/);
  return fim === -1 ? texto : texto.slice(0, fim + 1);
};

/** Troca o nome da técnica por lacuna, para a descrição não entregar a resposta. */
function esconder(texto: string, nome: string) {
  const partes = nome.split(/[\s-]+/).filter((p) => p.length > 3);
  let saida = texto;
  for (const parte of partes) {
    saida = saida.replace(new RegExp(parte, "gi"), "____");
  }
  return saida;
}

const NOME_CATEGORIA: Record<string, string> = Object.fromEntries(
  getCategoriasTecnicas().map((c) => [c.id, c.label]),
);

const AVISO_CONTAGEM =
  "Contagem adotada no acervo do dojo; outras escolas podem contar diferente.";

let contador = 0;
const id = (prefixo: string) => `${prefixo}-${(contador += 1)}`;

// ------------------------------------------------------------- geradores

type Gerador = (s: Sorteio) => Pergunta | null;

/** Perguntas sobre uma técnica de kihon. */
function geradoresTecnica(t: Tecnica): Gerador[] {
  const tecnicas = getTecnicas();
  const mesmaFamilia = tecnicas.filter((o) => o.cat === t.cat && o.nome !== t.nome);
  const porque = `${t.nome} (${t.kanji}) — ${t.pt}. ${primeiraFrase(t.desc)}`;

  return [
    (s) => {
      const m = montar(s, t.pt, mesmaFamilia.map((o) => o.pt));
      return m && {
        id: id("tec-pt"), tema: "kihon", tipo: "pratica", nivel: 1, sujeito: t.nome,
        enunciado: `O que é ${t.nome} (${t.kanji})?`, ...m, porque,
      };
    },
    (s) => {
      const m = montar(s, t.nome, mesmaFamilia.map((o) => o.nome));
      return m && {
        id: id("tec-nome"), tema: "kihon", tipo: "pratica", nivel: 2, sujeito: t.nome,
        enunciado: `Qual é o nome desta técnica: “${t.pt}”?`, ...m, porque,
      };
    },
    (s) => {
      const certa = NOME_CATEGORIA[t.cat];
      if (!certa) return null;
      const outras = Object.entries(NOME_CATEGORIA)
        .filter(([cat]) => cat !== t.cat && cat !== "Katas")
        .map(([, label]) => label);
      const m = montar(s, certa, outras);
      return m && {
        id: id("tec-cat"), tema: "kihon", tipo: "pratica", nivel: 1, sujeito: t.nome,
        enunciado: `${t.nome} pertence a qual família de técnicas?`, ...m, porque,
      };
    },
    (s) => {
      const descricao = esconder(primeiraFrase(t.desc), t.nome);
      if (descricao.length < 25) return null;
      const m = montar(s, t.nome, mesmaFamilia.map((o) => o.nome));
      return m && {
        id: id("tec-desc"), tema: "kihon", tipo: "pratica", nivel: 3, sujeito: t.nome,
        enunciado: `Qual técnica é descrita assim: “${descricao}”`, ...m, porque,
      };
    },
  ];
}

/** Perguntas sobre um kata: movimentos, deslocamentos, kiai e nome. */
function geradoresKata(k: KataCompleto): Gerador[] {
  const katas = getKatas();
  const movs = k.movimentosDetalhados;

  const movimento: Gerador = (s) => {
    const m = s.um(movs);
    const outras = movs.filter((o) => o.numero !== m.numero).map((o) => o.tecnica);
    const alt = montar(s, m.tecnica, outras);
    return alt && {
      id: id("kata-mov"), tema: "kata", tipo: "pratica", nivel: m.numero <= 3 ? 2 : 3, sujeito: k.id,
      enunciado: `No ${k.nome}, qual é a técnica do movimento ${m.numero}?`,
      ...alt,
      porque: `Movimento ${m.numero} do ${k.nome}: ${m.tecnica} — ${m.traducao}.${m.direcao ? ` ${m.direcao}.` : ""}`,
    };
  };

  const deslocamento: Gerador = (s) => {
    const comDirecao = movs.filter((m) => m.direcao);
    if (comDirecao.length < 4) return null;
    const m = s.um(comDirecao);
    const outras = comDirecao.filter((o) => o.numero !== m.numero).map((o) => o.direcao!);
    const alt = montar(s, m.direcao!, outras);
    return alt && {
      id: id("kata-base"), tema: "kata", tipo: "pratica", nivel: 3, sujeito: k.id,
      enunciado: `No ${k.nome}, como você se desloca no movimento ${m.numero} (${m.tecnica})?`,
      ...alt,
      porque: `Movimento ${m.numero} do ${k.nome}: ${m.tecnica}. ${m.direcao}.`,
    };
  };

  const contagem: Gerador = (s) => {
    const n = k.quantidadeMovimentos;
    const vizinhos = [-6, -4, -3, -2, 2, 3, 4, 6].map((d) => String(n + d)).filter((v) => Number(v) > 0);
    const alt = montar(s, String(n), vizinhos);
    return alt && {
      id: id("kata-n"), tema: "kata", tipo: "pratica", nivel: 1, sujeito: k.id,
      enunciado: `Quantos movimentos tem o ${k.nome}?`,
      ...alt,
      porque: `O ${k.nome} tem ${n} movimentos. ${AVISO_CONTAGEM}`,
    };
  };

  const kiai: Gerador = (s) => {
    if (!k.posicoesKiai) return null;
    const outras = katas.filter((o) => o.id !== k.id).map((o) => o.posicoesKiai);
    const alt = montar(s, k.posicoesKiai, outras);
    return alt && {
      id: id("kata-kiai"), tema: "kata", tipo: "pratica", nivel: 2, sujeito: k.id,
      enunciado: `Em quais movimentos há kiai no ${k.nome}?`,
      ...alt,
      porque: `No ${k.nome}, o kiai acontece nos ${k.posicoesKiai.toLowerCase()}. ${AVISO_CONTAGEM}`,
    };
  };

  const significado: Gerador = (s) => {
    // Exclui a mesma série ("Paz e Tranquilidade 1, 2, 3…"): seria pegadinha.
    const raiz = k.significadoNome.replace(/\s*\d+$/, "");
    const outras = katas
      .filter((o) => !o.significadoNome.startsWith(raiz))
      .map((o) => o.significadoNome);
    const alt = montar(s, k.significadoNome, outras);
    return alt && {
      id: id("kata-nome"), tema: "kata", tipo: "teoria", nivel: 1, sujeito: k.id,
      enunciado: `O que significa o nome ${k.nome}${k.kanji ? ` (${k.kanji})` : ""}?`,
      ...alt,
      porque: `${k.nome} significa “${k.significadoNome}”.${k.significadoLiteral ? ` ${k.significadoLiteral}` : ""}`,
    };
  };

  return [movimento, movimento, deslocamento, contagem, kiai, significado];
}

/** Dojo Kun, Niju Kun e etiqueta. */
function geradoresDojo(): Gerador[] {
  const dojoKun = getDojoKun();
  const etiqueta = getEtiquetaDojo();
  const principios = getPrincipiosTecnicos();
  const niju = dados.preceitosNijuKun.map((p) => p.replace(/^\d+\.\s*/, ""));
  const ordinal = ["primeiro", "segundo", "terceiro", "quarto", "quinto"];

  const lema: Gerador = (s) => {
    const i = s.inteiro(dojoKun.length);
    const l = dojoKun[i];
    const alt = montar(s, l.pt, dojoKun.filter((_, j) => j !== i).map((o) => o.pt));
    return alt && {
      id: id("dojokun"), tema: "dojo", tipo: "teoria", nivel: 1, sujeito: `dojokun:${i}`,
      enunciado: `No Dojo Kun, o que quer dizer “${l.romaji}”?`,
      ...alt, porque: `${l.romaji} (${l.jp}) — ${l.pt} ${primeiraFrase(l.text)}`,
    };
  };

  const ordem: Gerador = (s) => {
    const i = s.inteiro(Math.min(5, dojoKun.length));
    const l = dojoKun[i];
    const alt = montar(s, l.pt, dojoKun.filter((_, j) => j !== i).map((o) => o.pt));
    return alt && {
      id: id("dojokun-ordem"), tema: "dojo", tipo: "teoria", nivel: 2, sujeito: `dojokun:${i}`,
      enunciado: `Qual é o ${ordinal[i]} preceito do Dojo Kun?`,
      ...alt, porque: `O ${ordinal[i]} preceito é “${l.pt}” (${l.romaji}).`,
    };
  };

  const cortesia: Gerador = (s) => {
    const e = s.um(etiqueta);
    const outras = [
      ...etiqueta.filter((o) => o.nome !== e.nome).map((o) => o.traducao),
      ...principios.map((p) => p.traducao),
    ];
    const alt = montar(s, e.traducao, outras);
    return alt && {
      id: id("etiqueta"), tema: "dojo", tipo: "teoria", nivel: 1, sujeito: `etiqueta:${e.nome}`,
      enunciado: `No dojo, o que é “${e.nome}” (${e.kanji})?`,
      ...alt, porque: `${e.nome}: ${e.traducao}. ${primeiraFrase(e.oque_e)}`,
    };
  };

  const nijuKun: Gerador = (s) => {
    if (niju.length < 4) return null;
    const certa = s.um(niju);
    const distratores = [
      "No karatê, vence quem ataca primeiro.",
      "O treino de kata substitui o kihon.",
      "O cumprimento só é necessário diante do sensei.",
      "O karatê se pratica apenas dentro do dojo.",
    ];
    const alt = montar(s, certa, distratores);
    return alt && {
      id: id("niju"), tema: "dojo", tipo: "teoria", nivel: 2, sujeito: "niju",
      enunciado: "Qual destas frases é um dos preceitos de Funakoshi (Niju Kun)?",
      ...alt, porque: `“${certa}” — um dos vinte preceitos que Gichin Funakoshi deixou.`,
    };
  };

  return [lema, ordem, cortesia, cortesia, nijuKun];
}

/** Princípios técnicos (kime, zanshin, maai…). */
function geradoresFilosofia(): Gerador[] {
  const principios = getPrincipiosTecnicos();
  return [
    (s) => {
      const p = s.um(principios);
      const alt = montar(s, p.traducao, principios.filter((o) => o.n !== p.n).map((o) => o.traducao));
      return alt && {
        id: id("princ"), tema: "filosofia", tipo: "teoria", nivel: 1, sujeito: `principio:${p.n}`,
        enunciado: `O que significa “${p.n}” (${p.k})?`,
        ...alt, porque: `${p.n} — ${p.traducao}. ${primeiraFrase(p.oque_e)}`,
      };
    },
    (s) => {
      const p = s.um(principios);
      const alt = montar(s, p.n, principios.filter((o) => o.n !== p.n).map((o) => o.n));
      return alt && {
        id: id("princ-rev"), tema: "filosofia", tipo: "teoria", nivel: 2, sujeito: `principio:${p.n}`,
        enunciado: `Qual princípio é este: “${esconder(primeiraFrase(p.para_que_serve), p.n)}”`,
        ...alt, porque: `${p.n} (${p.traducao}). ${primeiraFrase(p.oque_e)}`,
      };
    },
  ];
}

/** Japonês do dojo: dicionário e kanji das técnicas. */
function geradoresVocabulario(): Gerador[] {
  const dicionario = getDicionario();
  const tecnicas = getTecnicas();
  return [
    (s) => {
      const d = s.um(dicionario);
      const alt = montar(s, d.pt, dicionario.filter((o) => o.romaji !== d.romaji).map((o) => o.pt));
      return alt && {
        id: id("dic"), tema: "vocabulario", tipo: "teoria", nivel: 1, sujeito: `dic:${d.romaji}`,
        enunciado: `O que significa “${d.romaji}” (${d.jp})?`,
        ...alt, porque: `${d.romaji} (${d.jp}): ${d.pt}`,
      };
    },
    (s) => {
      const t = s.um(tecnicas);
      const alt = montar(s, t.nome, tecnicas.filter((o) => o.cat === t.cat && o.nome !== t.nome).map((o) => o.nome));
      return alt && {
        id: id("kanji"), tema: "vocabulario", tipo: "teoria", nivel: 3, sujeito: t.nome,
        enunciado: `Qual técnica se escreve ${t.kanji}?`,
        ...alt, porque: `${t.kanji} se lê ${t.nome}: ${t.pt}.`,
      };
    },
  ];
}

/** Linha do tempo e mestres. */
function geradoresHistoria(): Gerador[] {
  const timeline = getTimeline();
  const mestres = getMestres();
  return [
    (s) => {
      const t = s.um(timeline);
      const alt = montar(s, t.year, timeline.filter((o) => o.year !== t.year).map((o) => o.year));
      return alt && {
        id: id("ano"), tema: "historia", tipo: "teoria", nivel: 2, sujeito: `ano:${t.year}`,
        enunciado: `Quando aconteceu: “${t.title}”?`,
        ...alt, porque: `${t.year} — ${t.title}. ${primeiraFrase(t.text)}`,
      };
    },
    (s) => {
      const m = s.um(mestres);
      const alt = montar(s, m.anos, mestres.filter((o) => o.nome !== m.nome).map((o) => o.anos));
      return alt && {
        id: id("mestre-anos"), tema: "historia", tipo: "teoria", nivel: 2, sujeito: m.nome,
        enunciado: `Em que período viveu ${m.nome}?`,
        ...alt, porque: `${m.nome} (${m.anos}). ${primeiraFrase(m.text)}`,
      };
    },
    (s) => {
      const m = s.um(mestres);
      const pista = esconder(primeiraFrase(m.text), m.nome);
      const alt = montar(s, m.nome, mestres.filter((o) => o.nome !== m.nome).map((o) => o.nome));
      return alt && {
        id: id("mestre"), tema: "historia", tipo: "teoria", nivel: 3, sujeito: m.nome,
        enunciado: `De qual mestre estamos falando: “${pista}”`,
        ...alt, porque: `${m.nome} (${m.anos}). ${primeiraFrase(m.text)}`,
      };
    },
  ];
}

// ------------------------------------------------------------- montagem

interface Filtro {
  /** Nível preferido: aceita outro só se faltar pergunta. */
  nivel?: Nivel;
  /** Regra dura: o que não passar aqui nunca entra. */
  aceita?: (p: Pergunta) => boolean;
  /** No máximo N perguntas sobre a mesma técnica, kata ou preceito. */
  porSujeito?: number;
  /** Perguntas já escolhidas, que contam para a repetição. */
  ja?: Pergunta[];
}

/** Roda geradores até juntar `quantas` perguntas sem repetir enunciado. */
function colher(s: Sorteio, geradores: Gerador[], quantas: number, filtro: Filtro = {}) {
  const saida: Pergunta[] = [];
  const ja = filtro.ja ?? [];
  const enunciados = new Set(ja.map((p) => p.enunciado));
  const usos = new Map<string, number>();
  for (const p of ja) usos.set(p.sujeito, (usos.get(p.sujeito) ?? 0) + 1);

  let tentativas = 0;
  while (saida.length < quantas && tentativas < quantas * 40 && geradores.length) {
    tentativas += 1;
    const p = s.um(geradores)(s);
    if (!p || enunciados.has(p.enunciado)) continue;
    if (filtro.aceita && !filtro.aceita(p)) continue;
    if (filtro.porSujeito && (usos.get(p.sujeito) ?? 0) >= filtro.porSujeito) continue;
    if (filtro.nivel && p.nivel !== filtro.nivel && tentativas < quantas * 20) continue;
    enunciados.add(p.enunciado);
    usos.set(p.sujeito, (usos.get(p.sujeito) ?? 0) + 1);
    saida.push(p);
  }
  return saida;
}

function geradoresDoTema(tema: Tema): Gerador[] {
  switch (tema) {
    case "kihon":
      return getTecnicas().flatMap(geradoresTecnica);
    case "kata":
      return getKatas().flatMap(geradoresKata);
    case "dojo":
      return geradoresDojo();
    case "historia":
      return geradoresHistoria();
    case "vocabulario":
      return geradoresVocabulario();
    case "filosofia":
      return geradoresFilosofia();
  }
}

/** Perguntas de um tema (minigames). `nivel` é preferência, não filtro rígido. */
export function perguntasDoTema(tema: Tema, quantas: number, semente: number, nivel?: Nivel) {
  return colher(criarSorteio(semente), geradoresDoTema(tema), quantas, { nivel, porSujeito: 2 });
}

/** Perguntas misturando todos os temas (o Randori e o Desafio final). */
export function perguntasMisturadas(quantas: number, semente: number, nivel?: Nivel) {
  const s = criarSorteio(semente);
  const todos = TEMAS.flatMap((t) => geradoresDoTema(t.id));
  return s.embaralhar(colher(s, todos, quantas, { nivel, porSujeito: 1 }));
}

// ------------------------------------------------------------- a prova

export const PROVA = {
  /** Perguntas sobre a prática (kihon e katas da faixa). */
  pratica: 8,
  /** Perguntas de teoria (dojo, filosofia, vocabulário, história). */
  teoria: 4,
  /** Acertos para aprovar: 9 de 12 (75%). */
  minimo: 9,
} as const;

/**
 * A prova da faixa: o programa que o aluno precisa dominar para graduar.
 *
 * A parte prática sai do kihon e dos katas exigidos na faixa atual dele. Se
 * o programa da faixa for curto demais para 8 perguntas (o 1º Dan, por
 * exemplo, pede "Bunkai completo", que não vira pergunta de múltipla
 * escolha), completa com técnicas e katas do acervo inteiro.
 */
export function montarProva(graduacao: GraduacaoCompleta | undefined, semente: number) {
  const s = criarSorteio(semente);

  const tecnicasDaFaixa = (graduacao?.kihonExigido ?? [])
    .map((nome) => acharTecnica(nome))
    .filter((t): t is Tecnica => Boolean(t));
  const katasDaFaixa = getKatas().filter((k) =>
    (graduacao?.katasExigidos ?? []).some((nome) => normal(nome) === normal(k.nome)),
  );

  // Prática é só prática: "o que significa o nome do kata" sai do gerador de
  // kata, mas é teoria — sem este filtro, ocupava vaga de prática.
  const soPratica = { aceita: (p: Pergunta) => p.tipo === "pratica", porSujeito: 2 };

  const pratica = colher(
    s,
    [...tecnicasDaFaixa.flatMap(geradoresTecnica), ...katasDaFaixa.flatMap(geradoresKata)],
    PROVA.pratica,
    soPratica,
  );
  if (pratica.length < PROVA.pratica) {
    // Programa curto (o 1º Dan pede "Bunkai completo", que não vira múltipla
    // escolha): completa com o acervo inteiro.
    pratica.push(
      ...colher(
        s,
        [...getTecnicas().flatMap(geradoresTecnica), ...getKatas().flatMap(geradoresKata)],
        PROVA.pratica - pratica.length,
        { ...soPratica, ja: pratica },
      ),
    );
  }

  // Nas faixas de iniciante (até a Laranja), a teoria fica no fácil e no
  // médio: perguntar kanji de técnica a uma faixa amarela é pegadinha.
  const indice = getGraduacoes().findIndex((g) => g.faixa === graduacao?.faixa);
  const iniciante = indice !== -1 && indice < 4;

  const teoria = colher(
    s,
    [...geradoresDojo(), ...geradoresFilosofia(), ...geradoresVocabulario(), ...geradoresHistoria()],
    PROVA.teoria,
    {
      porSujeito: 1,
      ja: pratica,
      aceita: (p) => p.tipo === "teoria" && (!iniciante || p.nivel <= 2),
    },
  );

  return s.embaralhar([...pratica, ...teoria]);
}

/** Tira o gabarito e a explicação antes de mandar ao navegador. */
export const semGabarito = (p: Pergunta): PerguntaPublica => ({
  id: p.id,
  tema: p.tema,
  tipo: p.tipo,
  nivel: p.nivel,
  enunciado: p.enunciado,
  alternativas: p.alternativas,
});

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
import { ORIGEM_KATAS } from "@/data/origemKatas";
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
  /** Pergunta de tradução ("o que significa…"): o Treino livre não usa. */
  traducao?: boolean;
}

/** A mesma pergunta sem o gabarito: é o que vai ao navegador durante a prova. */
export type PerguntaPublica = Omit<Pergunta, "correta" | "porque" | "sujeito" | "traducao">;

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
 * Monta as alternativas: a certa e até quatro erradas sorteadas do conjunto
 * de candidatas, sem repetir texto (ignorando acento e caixa). Com menos de
 * três erradas devolve null — o gerador então desiste da pergunta. Quem usa
 * corta para 4 ou 5 alternativas depois (ver `comAlternativas`).
 */
function montar(
  s: Sorteio,
  certa: string,
  candidatas: string[],
  quantas = 4,
  minimo = 3,
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
  if (erradas.length < minimo) return null;
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
        id: id("tec-pt"), tema: "kihon", tipo: "pratica", nivel: 1, sujeito: t.nome, traducao: true,
        enunciado: `O que é ${t.nome} (${t.kanji})?`, ...m, porque,
      };
    },
    (s) => {
      const m = montar(s, t.nome, mesmaFamilia.map((o) => o.nome));
      return m && {
        id: id("tec-nome"), tema: "kihon", tipo: "pratica", nivel: 2, sujeito: t.nome, traducao: true,
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
      id: id("kata-nome"), tema: "kata", tipo: "teoria", nivel: 1, sujeito: k.id, traducao: true,
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
      id: id("dojokun"), tema: "dojo", tipo: "teoria", nivel: 1, sujeito: `dojokun:${i}`, traducao: true,
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
      id: id("etiqueta"), tema: "dojo", tipo: "teoria", nivel: 1, sujeito: `etiqueta:${e.nome}`, traducao: true,
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

  const nijuIntruso: Gerador = (s) => {
    if (niju.length < 4) return null;
    const intruso = s.um([
      "Quem domina o kata não precisa mais do kihon.",
      "No dojo, o mais forte decide quem treina primeiro.",
      "Vença sempre, mesmo que seja preciso atacar primeiro.",
      "O karatê termina quando você recebe a faixa preta.",
    ]);
    const alt = montar(s, intruso, niju);
    return alt && {
      id: id("niju-nao"), tema: "dojo", tipo: "teoria", nivel: 3, sujeito: "niju-nao",
      enunciado: "Qual destas frases NÃO está entre os preceitos de Funakoshi (Niju Kun)?",
      ...alt, porque: `“${intruso}” não é um preceito: vai contra o espírito do Niju Kun, que começa e termina no respeito.`,
    };
  };

  const dojoKunIntruso: Gerador = (s) => {
    const intruso = s.um([
      "Vencer sempre, a qualquer custo.",
      "Obedecer ao mais forte do dojo.",
      "Treinar apenas antes das competições.",
      "Mostrar a técnica fora do dojo.",
    ]);
    const alt = montar(s, intruso, dojoKun.map((l) => l.pt));
    return alt && {
      id: id("dojokun-nao"), tema: "dojo", tipo: "teoria", nivel: 3, sujeito: "dojokun-nao",
      enunciado: "Qual destas frases NÃO faz parte do Dojo Kun?",
      ...alt, porque: `“${intruso}” não está no Dojo Kun. Os cinco lemas falam de caráter, sinceridade, esforço, respeito e autocontrole.`,
    };
  };

  const paraQueServe: Gerador = (s) => {
    const e = s.um(etiqueta);
    const certa = primeiraFrase(e.para_que_serve);
    const outras = [
      ...etiqueta.filter((o) => o.nome !== e.nome).map((o) => primeiraFrase(o.para_que_serve)),
      ...principios.map((p) => primeiraFrase(p.para_que_serve)),
    ];
    const alt = montar(s, certa, outras);
    return alt && {
      id: id("etiqueta-uso"), tema: "dojo", tipo: "teoria", nivel: 3, sujeito: `etiqueta-uso:${e.nome}`,
      enunciado: `No dojo, para que serve o ${e.nome}?`,
      ...alt, porque: `${e.nome} (${e.traducao}): ${e.para_que_serve}`,
    };
  };

  return [lema, ordem, cortesia, cortesia, nijuKun, nijuIntruso, dojoKunIntruso, paraQueServe, paraQueServe];
}

/** O programa de exame: que kata cai em cada faixa. */
function geradoresPrograma(): Gerador[] {
  const graduacoes = getGraduacoes();
  const katas = getKatas();
  return [
    (s) => {
      const g = s.um(graduacoes.filter((x) => x.katasExigidos.length));
      const certa = s.um(g.katasExigidos);
      const outras = katas.map((k) => k.nome).filter((n) => !g.katasExigidos.includes(n));
      const alt = montar(s, certa, outras);
      return alt && {
        id: id("prog-kata"), tema: "kata", tipo: "teoria", nivel: 2, sujeito: `prog:${g.faixa}`,
        enunciado: `Qual kata faz parte do exame da faixa ${g.faixa} (${g.grau})?`,
        ...alt, porque: `No programa do dojo, a faixa ${g.faixa} pede: ${g.katasExigidos.join(", ")}.`,
      };
    },
  ];
}

/** Princípios técnicos (kime, zanshin, maai…). */
function geradoresFilosofia(): Gerador[] {
  const principios = getPrincipiosTecnicos();
  return [
    (s) => {
      const p = s.um(principios);
      const alt = montar(s, p.traducao, principios.filter((o) => o.n !== p.n).map((o) => o.traducao));
      return alt && {
        id: id("princ"), tema: "filosofia", tipo: "teoria", nivel: 1, sujeito: `principio:${p.n}`, traducao: true,
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
    (s) => {
      const p = s.um(principios);
      const certa = esconder(primeiraFrase(p.para_que_serve), p.n);
      const outras = principios.filter((o) => o.n !== p.n).map((o) => esconder(primeiraFrase(o.para_que_serve), o.n));
      const alt = montar(s, certa, outras);
      return alt && {
        id: id("princ-uso"), tema: "filosofia", tipo: "teoria", nivel: 3, sujeito: `principio:${p.n}`,
        enunciado: `Para que serve o ${p.n} no treino?`,
        ...alt, porque: `${p.n} (${p.traducao}): ${primeiraFrase(p.para_que_serve)}`,
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
        id: id("dic"), tema: "vocabulario", tipo: "teoria", nivel: 1, sujeito: `dic:${d.romaji}`, traducao: true,
        enunciado: `O que significa “${d.romaji}” (${d.jp})?`,
        ...alt, porque: `${d.romaji} (${d.jp}): ${d.pt}`,
      };
    },
    (s) => {
      const t = s.um(tecnicas);
      const alt = montar(s, t.nome, tecnicas.filter((o) => o.cat === t.cat && o.nome !== t.nome).map((o) => o.nome));
      return alt && {
        id: id("kanji"), tema: "vocabulario", tipo: "teoria", nivel: 3, sujeito: t.nome, traducao: true,
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
    (s) => {
      const o = s.um(ORIGEM_KATAS.filter((x) => nomeDoKata(x.id) && x.nomeOriginal !== nomeDoKata(x.id)));
      if (!o) return null;
      const outras = ORIGEM_KATAS.filter((x) => x.id !== o.id).map((x) => x.nomeOriginal);
      const alt = montar(s, o.nomeOriginal, outras);
      return alt && {
        id: id("kata-original"), tema: "historia", tipo: "teoria", nivel: 3, sujeito: `origem:${o.id}`,
        enunciado: `Antes de Funakoshi renomear, como se chamava o ${nomeDoKata(o.id)} em Okinawa?`,
        ...alt, porque: `O ${nomeDoKata(o.id)} era o ${o.nomeOriginal}. ${primeiraFrase(o.historia)}`,
      };
    },
    (s) => {
      const o = s.um(ORIGEM_KATAS.filter((x) => nomeDoKata(x.id)));
      if (!o) return null;
      const alt = montar(s, o.linhagem, ["Shuri-te", "Tomari-te", "Naha-te", "Japão"]);
      return alt && {
        id: id("kata-escola"), tema: "historia", tipo: "teoria", nivel: 2, sujeito: `origem:${o.id}`,
        enunciado: `De onde vem o ${nomeDoKata(o.id)}?`,
        ...alt, porque: `${nomeDoKata(o.id)}: ${o.linhagem}. ${o.quem} (${o.epoca}).`,
      };
    },
  ];
}

const nomeDoKata = (id: string) => getKatas().find((k) => k.id === id)?.nome;

// ------------------------------------------------------------- montagem

interface Filtro {
  /** Nível preferido: aceita outro só se faltar pergunta. */
  nivel?: Nivel;
  /** Regra dura: o que não passar aqui nunca entra. */
  aceita?: (p: Pergunta) => boolean;
  /** No máximo N perguntas sobre a mesma técnica, kata ou preceito. */
  porSujeito?: number;
  /** No máximo N perguntas do mesmo modelo ("De onde vem o…", "Quantos movimentos…"). */
  porModelo?: number;
  /** Perguntas já escolhidas, que contam para a repetição. */
  ja?: Pergunta[];
}

/** Roda geradores até juntar `quantas` perguntas sem repetir enunciado. */
function colher(s: Sorteio, geradores: Gerador[], quantas: number, filtro: Filtro = {}) {
  const saida: Pergunta[] = [];
  const ja = filtro.ja ?? [];
  const enunciados = new Set(ja.map((p) => p.enunciado));
  const usos = new Map<string, number>();
  const modelos = new Map<string, number>();
  const modeloDe = (p: Pergunta) => p.id.replace(/-\d+$/, "");
  for (const p of ja) {
    usos.set(p.sujeito, (usos.get(p.sujeito) ?? 0) + 1);
    modelos.set(modeloDe(p), (modelos.get(modeloDe(p)) ?? 0) + 1);
  }

  let tentativas = 0;
  while (saida.length < quantas && tentativas < quantas * 40 && geradores.length) {
    tentativas += 1;
    const p = s.um(geradores)(s);
    if (!p || enunciados.has(p.enunciado)) continue;
    if (filtro.aceita && !filtro.aceita(p)) continue;
    if (filtro.porSujeito && (usos.get(p.sujeito) ?? 0) >= filtro.porSujeito) continue;
    if (filtro.porModelo && (modelos.get(modeloDe(p)) ?? 0) >= filtro.porModelo && tentativas < quantas * 30) continue;
    if (filtro.nivel && p.nivel !== filtro.nivel && tentativas < quantas * 20) continue;
    enunciados.add(p.enunciado);
    usos.set(p.sujeito, (usos.get(p.sujeito) ?? 0) + 1);
    modelos.set(modeloDe(p), (modelos.get(modeloDe(p)) ?? 0) + 1);
    saida.push(p);
  }
  return saida;
}

function geradoresDoTema(tema: Tema): Gerador[] {
  switch (tema) {
    case "kihon":
      return getTecnicas().flatMap(geradoresTecnica);
    case "kata":
      return [...getKatas().flatMap(geradoresKata), ...geradoresPrograma(), ...geradoresPrograma()];
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

/**
 * Corta as alternativas para `n` (4 ou 5), mantendo a certa. Pergunta que
 * já tem `n` ou menos fica como está.
 */
export function comAlternativas(p: Pergunta, n: number, s: Sorteio): Pergunta {
  if (p.alternativas.length <= n) return p;
  const certa = p.alternativas[p.correta];
  const erradas = s.embaralhar(p.alternativas.filter((_, i) => i !== p.correta)).slice(0, n - 1);
  const alternativas = s.embaralhar([certa, ...erradas]);
  return { ...p, alternativas, correta: alternativas.indexOf(certa) };
}

/** Do fácil para o difícil (o sort é estável). */
const doFacilAoDificil = (lista: Pergunta[]) => [...lista].sort((a, b) => a.nivel - b.nivel);

/**
 * Treino livre (Randori): mistura os temas escolhidos, sem perguntas de
 * tradução, na dificuldade pedida, da mais fácil para a mais difícil.
 */
export function perguntasDoTreino({
  temas,
  quantas,
  semente,
  nivel,
  alternativas,
}: {
  temas: Tema[];
  quantas: number;
  semente: number;
  nivel: Nivel;
  alternativas: 4 | 5;
}) {
  const s = criarSorteio(semente);
  const lista = temas.length ? temas : TEMAS.map((t) => t.id);
  // Cada tema entra com peso parecido, mesmo os que têm muitos geradores
  // (kata tem centenas; filosofia, três).
  const geradores = lista.flatMap((tema) => {
    const g = geradoresDoTema(tema);
    const peso = Math.max(1, Math.round(40 / g.length));
    return Array.from({ length: peso }, () => g).flat();
  });
  const escolhidas = colher(s, geradores, quantas, {
    nivel,
    porSujeito: 1,
    porModelo: 2,
    aceita: (p) => !p.traducao,
  });
  return doFacilAoDificil(escolhidas.map((p) => comAlternativas(p, alternativas, s)));
}

// ------------------------------------------------------------- ilhas

/**
 * Regra de cada nível de faixa numa ilha: quantas perguntas, quantas
 * alternativas, quantas para passar e de que dificuldade. Quanto mais
 * escura a faixa, mais perguntas, mais alternativas e mais difíceis.
 */
export function regraDaFaixa(indice: number) {
  const tamanhos = [5, 5, 6, 6, 7, 7, 8, 10];
  const quantas = tamanhos[indice] ?? 6;
  const base = Math.min(3, 1 + Math.floor(indice / 3)) as Nivel;
  return {
    quantas,
    alternativas: (indice < 2 ? 4 : 5) as 4 | 5,
    passa: Math.ceil(quantas * 0.7),
    /** Primeira metade num nível, segunda metade no seguinte. */
    niveis: [base, Math.min(3, base + 1) as Nivel] as const,
  };
}

const katasPorNome = (nomes: string[]) =>
  getKatas().filter((k) => nomes.some((n) => normal(n) === normal(k.nome)));

/** O que cai numa faixa, para a "mini aula" antes das perguntas. */
export function conteudoDaFaixa(indice: number) {
  const graduacoes = getGraduacoes();
  const atual = graduacoes[indice];
  return {
    graduacao: atual,
    tecnicas: (atual?.kihonExigido ?? [])
      .map((n) => acharTecnica(n))
      .filter((t): t is Tecnica => Boolean(t)),
    katas: katasPorNome(atual?.katasExigidos ?? []),
  };
}

/** De onde saem as perguntas de uma faixa: primeiro o programa dela, depois o que veio antes. */
function fontesDaFaixa(tema: Tema, indice: number): Gerador[][] {
  const graduacoes = getGraduacoes();
  const atual = graduacoes[indice];
  const anteriores = graduacoes.slice(0, indice);

  if (tema === "kihon") {
    const tecnicas = (nomes: string[]) =>
      nomes.map((n) => acharTecnica(n)).filter((t): t is Tecnica => Boolean(t));
    const daFaixa = tecnicas(atual?.kihonExigido ?? []);
    const antes = tecnicas(anteriores.flatMap((g) => g.kihonExigido));
    return [
      daFaixa.flatMap(geradoresTecnica),
      antes.flatMap(geradoresTecnica),
      getTecnicas().flatMap(geradoresTecnica),
    ];
  }
  if (tema === "kata") {
    let daFaixa = katasPorNome(atual?.katasExigidos ?? []);
    // A Branca pede o Taikyoku, que não tem ficha: prepara para o Heian Shodan.
    if (!daFaixa.length) daFaixa = katasPorNome(graduacoes[indice + 1]?.katasExigidos ?? []);
    const antes = katasPorNome(anteriores.flatMap((g) => g.katasExigidos));
    return [
      daFaixa.flatMap(geradoresKata),
      [...antes.flatMap(geradoresKata), ...geradoresPrograma()],
      geradoresPrograma(),
    ];
  }
  return [geradoresDoTema(tema)];
}

/** As perguntas de um nível de faixa numa ilha, da mais fácil para a mais difícil. */
export function perguntasDaFaixa(tema: Tema, indice: number, semente: number) {
  const s = criarSorteio(semente);
  const regra = regraDaFaixa(indice);
  const fontes = fontesDaFaixa(tema, indice);
  const metade = Math.ceil(regra.quantas / 2);
  const alvos: [Nivel, number][] = [
    [regra.niveis[0], metade],
    [regra.niveis[1], regra.quantas - metade],
  ];

  const escolhidas: Pergunta[] = [];
  for (const [nivel, quantas] of alvos) {
    let falta = quantas;
    for (const fonte of fontes) {
      if (falta <= 0) break;
      const achadas = colher(s, fonte, falta, {
        porSujeito: 2,
        porModelo: Math.max(2, Math.ceil(regra.quantas / 3)),
        ja: escolhidas,
        aceita: (p) => p.nivel === nivel,
      });
      escolhidas.push(...achadas);
      falta -= achadas.length;
    }
  }
  // Se o tema não tem perguntas desse nível, completa com qualquer uma.
  for (const fonte of fontes) {
    if (escolhidas.length >= regra.quantas) break;
    escolhidas.push(
      ...colher(s, fonte, regra.quantas - escolhidas.length, { porSujeito: 2, ja: escolhidas }),
    );
  }
  return doFacilAoDificil(escolhidas.map((p) => comAlternativas(p, regra.alternativas, s)));
}

// ------------------------------------------------------------- a prova

export const PROVA = {
  /** Perguntas de uma prova gerada pela faixa. */
  total: 20,
  /** Quantas de cada dificuldade: 7 fáceis, 8 médias e 5 difíceis. */
  porNivel: { 1: 7, 2: 8, 3: 5 } as Record<Nivel, number>,
  /** Fração de acertos para aprovar (15 de 20). */
  aprovacao: 0.75,
} as const;

/** Acertos para aprovar numa prova de `total` perguntas (75%, para cima). */
export const minimoPara = (total: number) => Math.max(1, Math.ceil(total * PROVA.aprovacao));

/** Geradores de prática da faixa (kihon e katas do programa) e do acervo inteiro. */
function geradoresPratica(graduacao: GraduacaoCompleta | undefined) {
  const tecnicasDaFaixa = (graduacao?.kihonExigido ?? [])
    .map((nome) => acharTecnica(nome))
    .filter((t): t is Tecnica => Boolean(t));
  const katasDaFaixa = getKatas().filter((k) =>
    (graduacao?.katasExigidos ?? []).some((nome) => normal(nome) === normal(k.nome)),
  );
  return {
    daFaixa: [...tecnicasDaFaixa.flatMap(geradoresTecnica), ...katasDaFaixa.flatMap(geradoresKata)],
    // Fora do programa da faixa, só katas que o aluno já aprendeu (das faixas
    // até a atual): um kata de faixa preta na prova da amarela é injusto.
    acervo: [...getTecnicas().flatMap(geradoresTecnica), ...katasAteAFaixa(graduacao).flatMap(geradoresKata)],
  };
}

/** Katas exigidos da primeira faixa até a atual (todos, se a faixa for desconhecida). */
function katasAteAFaixa(graduacao: GraduacaoCompleta | undefined) {
  const todas = getGraduacoes();
  const indice = todas.findIndex((g) => g.faixa === graduacao?.faixa);
  if (indice === -1) return getKatas();
  const nomes = todas.slice(0, indice + 1).flatMap((g) => g.katasExigidos).map(normal);
  return getKatas().filter((k) => nomes.includes(normal(k.nome)));
}

const geradoresTeoria = () => [
  ...geradoresDojo(),
  ...geradoresFilosofia(),
  ...geradoresVocabulario(),
  ...geradoresHistoria(),
];

/** Faixas de iniciante (até a Laranja): teoria só no fácil e no médio. */
function ehIniciante(graduacao: GraduacaoCompleta | undefined) {
  const indice = getGraduacoes().findIndex((g) => g.faixa === graduacao?.faixa);
  return indice !== -1 && indice < 4;
}

/**
 * A prova da faixa: 20 perguntas, da mais fácil para a mais difícil.
 *
 * A prática sai do kihon e dos katas exigidos na faixa; se o programa for
 * curto demais (o 1º Dan pede "Bunkai completo", que não vira múltipla
 * escolha), completa com o acervo. A teoria cobre Dojo Kun, princípios,
 * vocabulário e história. Nas faixas de iniciante a teoria não passa do
 * médio — as difíceis delas ficam na prática, que é o que elas treinam.
 */
export function montarProva(graduacao: GraduacaoCompleta | undefined, semente: number) {
  const s = criarSorteio(semente);
  const { daFaixa, acervo } = geradoresPratica(graduacao);

  // Teoria por nível (7 no total): iniciante 3/4/0, os demais 2/3/2.
  const teoriaPorNivel: Record<Nivel, number> = ehIniciante(graduacao)
    ? { 1: 3, 2: 4, 3: 0 }
    : { 1: 2, 2: 3, 3: 2 };

  const escolhidas: Pergunta[] = [];
  for (const nivel of [1, 2, 3] as Nivel[]) {
    const teoria = colher(s, geradoresTeoria(), teoriaPorNivel[nivel], {
      porSujeito: 1,
      ja: escolhidas,
      aceita: (p) => p.tipo === "teoria" && p.nivel === nivel,
    });
    escolhidas.push(...teoria);

    const regraPratica = {
      porSujeito: 2,
      aceita: (p: Pergunta) => p.tipo === "pratica" && p.nivel === nivel,
    };
    const pratica = colher(s, daFaixa, PROVA.porNivel[nivel] - teoria.length, {
      ...regraPratica,
      ja: escolhidas,
    });
    escolhidas.push(...pratica);

    const falta = PROVA.porNivel[nivel] - teoria.length - pratica.length;
    if (falta > 0) escolhidas.push(...colher(s, acervo, falta, { ...regraPratica, ja: escolhidas }));
  }

  // Se algum nível ficou curto, completa com qualquer pergunta de prática.
  if (escolhidas.length < PROVA.total) {
    escolhidas.push(
      ...colher(s, acervo, PROVA.total - escolhidas.length, {
        porSujeito: 2,
        ja: escolhidas,
        aceita: (p) => p.tipo === "pratica",
      }),
    );
  }

  // A prova do portal fica com 4 alternativas. Embaralha e ordena do fácil
  // para o difícil (o sort é estável).
  return s
    .embaralhar(escolhidas)
    .map((p) => comAlternativas(p, 4, s))
    .sort((a, b) => a.nivel - b.nivel);
}

/**
 * Uma pergunta nova do banco, para o professor trocar uma da prova.
 * Respeita o tipo e, se der, o nível da que sai; não repete enunciado.
 */
export function outraPergunta(
  graduacao: GraduacaoCompleta | undefined,
  semente: number,
  molde: Pick<Pergunta, "tipo" | "nivel">,
  ja: Pergunta[],
): Pergunta | undefined {
  const s = criarSorteio(semente);
  const { daFaixa, acervo } = geradoresPratica(graduacao);
  const fontes = molde.tipo === "pratica" ? [daFaixa, acervo] : [geradoresTeoria()];
  for (const nivel of [molde.nivel, undefined]) {
    for (const fonte of fontes) {
      const [achada] = colher(s, fonte, 1, {
        porSujeito: 2,
        ja,
        aceita: (p) => p.tipo === molde.tipo && (nivel === undefined || p.nivel === nivel),
      });
      if (achada) return comAlternativas(achada, 4, s);
    }
  }
  return undefined;
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

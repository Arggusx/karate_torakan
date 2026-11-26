import type { Idioma } from "@/i18n/idioma";
import { KATAS_EN, TECNICAS_EN } from "@/i18n/katas-en";
import { DESCRICOES_EN } from "@/i18n/tecnicas-en";
import { getKatas, getTecnicas } from "@/services/dataService";
import type { KataCompleto, MovimentoKata, Tecnica } from "@/types";

/**
 * Katas no idioma pedido.
 *
 * Fica fora do dataService de propósito: o dataService também roda no
 * navegador (busca de técnicas, Jornada), e as traduções só precisam existir
 * no servidor, que monta a página do kata.
 *
 * Campos derivados (nível, cor da faixa) são calculados sobre o original em
 * português e não mudam: a tradução só troca o texto.
 */

function traduzir(kata: KataCompleto): KataCompleto {
  const en = KATAS_EN[kata.id];
  if (!en) return kata;

  const movimentosDetalhados: MovimentoKata[] = kata.movimentosDetalhados.map((m, i) => {
    const [traducao, direcao] = en.movimentos[i] ?? [m.traducao, m.direcao];
    return { ...m, traducao, direcao: direcao ?? undefined };
  });

  // O diagrama do embusen lê a frase corrida pelo número do movimento.
  // Movimentos com fases (A-B) dividem o mesmo número e viram uma frase só.
  const porNumero = new Map<number, MovimentoKata[]>();
  for (const m of movimentosDetalhados) {
    porNumero.set(m.numero, [...(porNumero.get(m.numero) ?? []), m]);
  }
  const movimentos = [...porNumero.entries()]
    .sort(([a], [b]) => a - b)
    .map(([numero, lista]) => {
      const partes = lista.map(
        (m) => `${m.tecnica} — ${m.traducao}.${m.direcao ? ` ${m.direcao}.` : ""}`,
      );
      const kiai = lista.some((m) => m.kiai) ? " KIAI." : "";
      return `${numero}. ${partes.join(" ")}${kiai}`;
    });

  return {
    ...kata,
    significadoNome: en.significadoNome,
    significadoLiteral: en.significadoLiteral ?? kata.significadoLiteral,
    faixaRecomendada: en.faixaRecomendada,
    nivelDificuldade: en.nivelDificuldade,
    posicoesKiai: en.posicoesKiai ?? kata.posicoesKiai,
    observacaoContagem: en.observacaoContagem,
    contagemAlternativa: en.contagemAlternativa,
    comentario: en.comentario,
    bunkai: en.bunkai,
    movimentosDetalhados,
    movimentos,
    resumo:
      kata.resumo && en.resumo
        ? {
            ...kata.resumo,
            significado: en.resumo.significado,
            text: en.resumo.text,
            decomposicao: kata.resumo.decomposicao.map((parte, i) => ({
              ...parte,
              significado: en.resumo?.decomposicao[i] ?? parte.significado,
            })),
          }
        : kata.resumo,
  };
}

export function katasNoIdioma(idioma: Idioma): KataCompleto[] {
  const katas = getKatas();
  return idioma === "en" ? katas.map(traduzir) : katas;
}

export function kataNoIdioma(id: string, idioma: Idioma): KataCompleto | undefined {
  return katasNoIdioma(idioma).find((kata) => kata.id === id);
}

/** Catálogo de kihon no idioma pedido (significado curto e descrição). */
export function tecnicasNoIdioma(idioma: Idioma): Tecnica[] {
  const tecnicas = getTecnicas();
  if (idioma === "pt") return tecnicas;
  return tecnicas.map((tecnica) => ({
    ...tecnica,
    pt: TECNICAS_EN[tecnica.nome] ?? tecnica.pt,
    desc: DESCRICOES_EN[tecnica.nome] ?? tecnica.desc,
  }));
}

/**
 * Katas só com o que a lista mostra (tabela e vitrine). A ficha completa
 * fica na página de cada kata; mandar 950 movimentos para uma lista só
 * deixaria a página pesada à toa.
 */
export function katasResumidosNoIdioma(idioma: Idioma): KataCompleto[] {
  return katasNoIdioma(idioma).map((kata) => ({
    ...kata,
    movimentos: [],
    movimentosDetalhados: [],
    bunkai: [],
    comentario: undefined,
    observacaoContagem: undefined,
    contagemAlternativa: undefined,
    resumo: undefined,
  }));
}

export function vizinhosNoIdioma(id: string, idioma: Idioma) {
  const katas = katasNoIdioma(idioma);
  const indice = katas.findIndex((kata) => kata.id === id);
  return {
    anterior: indice > 0 ? katas[indice - 1] : null,
    proximo: indice >= 0 && indice < katas.length - 1 ? katas[indice + 1] : null,
  };
}

import { LINHAGENS, ORIGEM_KATAS } from "@/data/origemKatas";
import type { Idioma } from "@/i18n/idioma";
import {
  CURIOSIDADES_EN,
  DICIONARIO_EN,
  DOJO_KUN_EN,
  ETIQUETA_EN,
  GRADUACOES_EN,
  LINHAGENS_EN,
  NIJU_KUN_EN,
  ORIGEM_EN,
  ORIGEM_KATAS_EN,
  PRINCIPIOS_FUND_EN,
} from "@/i18n/fundamentos-en";
import {
  getCuriosidades,
  getDicionario,
  getDojoKun,
  getEtiquetaDojo,
  getGraduacoes,
  getNijuKun,
  getOrigemDosKatas,
  getPrincipiosTecnicos,
} from "@/services/dataService";

/**
 * Tudo o que a página de Fundamentos mostra, no idioma pedido. Ids, cores e
 * termos japoneses vêm sempre do original em português: a tradução só troca
 * o texto. O que não tiver tradução fica como está.
 */
export function fundamentosNoIdioma(idioma: Idioma) {
  const graduacoes = getGraduacoes();
  const dojoKun = getDojoKun();
  const nijuKun = getNijuKun();
  const principios = getPrincipiosTecnicos();
  const etiqueta = getEtiquetaDojo();
  const origemDosKatas = getOrigemDosKatas();
  const dicionario = getDicionario();
  const curiosidades = getCuriosidades();

  if (idioma === "pt") {
    return {
      graduacoes,
      dojoKun,
      nijuKun,
      principios,
      etiqueta,
      origemDosKatas,
      dicionario,
      curiosidades,
      linhagens: LINHAGENS,
      origemKatas: ORIGEM_KATAS,
    };
  }

  return {
    graduacoes: graduacoes.map((g) => {
      const en = GRADUACOES_EN[g.faixa];
      return en
        ? {
            ...g,
            faixa: en.faixa,
            txt: en.txt,
            significado: en.significado ?? g.significado,
            grau: en.grau,
            tempoMinimo: en.tempoMinimo,
            kihonExigido: en.kihon,
          }
        : g;
    }),
    dojoKun: dojoKun.map((lema, i) => ({ ...lema, ...(DOJO_KUN_EN[i] ?? {}) })),
    nijuKun: nijuKun.map((preceito, i) => NIJU_KUN_EN[i] ?? preceito),
    principios: principios.map((p) => ({ ...p, ...(PRINCIPIOS_FUND_EN[p.n] ?? {}) })),
    etiqueta: etiqueta.map((item) => ({ ...item, ...(ETIQUETA_EN[item.nome] ?? {}) })),
    origemDosKatas: {
      ...origemDosKatas,
      nota: ORIGEM_EN.nota,
      fonte: { ...origemDosKatas.fonte, ...ORIGEM_EN.fonte },
    },
    dicionario: dicionario.map((d) => ({ ...d, pt: DICIONARIO_EN[d.romaji] ?? d.pt })),
    curiosidades: curiosidades.map((c, i) => ({ ...c, ...(CURIOSIDADES_EN[i] ?? {}) })),
    linhagens: LINHAGENS.map((l) => ({ ...l, ...LINHAGENS_EN[l.id] })),
    origemKatas: ORIGEM_KATAS.map((o) => ({ ...o, ...(ORIGEM_KATAS_EN[o.id] ?? {}) })),
  };
}

import {
  LINHAGEM_BRASIL,
  LINHAGEM_JAPAO,
  LINHAGEM_OKINAWA,
} from "@/components/historia/LineageTree";
import type { Idioma } from "@/i18n/idioma";
import {
  LINHAGEM_BRASIL_EN,
  LINHAGEM_JAPAO_EN,
  LINHAGEM_OKINAWA_EN,
  MESTRES_EN,
  PRECEITOS_FUNAKOSHI_EN,
  TIMELINE_EN,
} from "@/i18n/historia-en";
import { getMestres, getPreceitosFunakoshi, getTimeline } from "@/services/dataService";

/**
 * Tudo o que a página de História mostra, no idioma pedido. Kanji, datas e
 * nomes vêm sempre do original; o que não tiver tradução fica como está.
 */
export function historiaNoIdioma(idioma: Idioma) {
  const timeline = getTimeline();
  const mestres = getMestres();
  if (idioma === "pt") {
    return {
      timeline,
      mestres,
      preceitos: getPreceitosFunakoshi(),
      linhagens: { okinawa: LINHAGEM_OKINAWA, japao: LINHAGEM_JAPAO, brasil: LINHAGEM_BRASIL },
    };
  }
  return {
    timeline: timeline.map((marco) => {
      const en = TIMELINE_EN[marco.year];
      return en ? { ...marco, ...en, year: en.year ?? marco.year } : marco;
    }),
    mestres: mestres.map((m) => ({ ...m, text: MESTRES_EN[m.nome] ?? m.text })),
    preceitos: PRECEITOS_FUNAKOSHI_EN,
    linhagens: { okinawa: LINHAGEM_OKINAWA_EN, japao: LINHAGEM_JAPAO_EN, brasil: LINHAGEM_BRASIL_EN },
  };
}

export const TEXTOS_HISTORIA = {
  pt: {
    sobretitulo: "História · 歴史",
    titulo: "De Okinawa ao mundo: a linhagem do Shotokan",
    descricao: (marcos: number, mestres: number) =>
      `${marcos} marcos históricos e ${mestres} mestres catalogados. Conhecer essa trajetória muda a forma como se executa cada kata.`,
    bannerSobretitulo: "Do castelo de Shuri ao mundo",
    bannerTexto:
      "Um professor primário de Okinawa levou a arte ao Japão em 1922. Cem anos depois, ela se treina em todos os continentes — e cada kata ainda carrega o nome de quem o guardou.",
    rotuloAbas: "Tópicos de História",
    abaLinha: "Linha do tempo",
    abaLinhagem: "Linhagem",
    abaMestres: "Mestres",
    abaBrasil: "No Brasil",
    linhaTitulo: "Linha do tempo",
    linhaDescricao: "Clique em um marco para abrir o contexto histórico completo.",
    preceitosLegenda: "Preceitos de Gichin Funakoshi",
    linhagemTitulo: "A linhagem, do Japão ao mundo",
    linhagemDescricao:
      "A sucessão de mestres que levou a arte de Shuri aos dojos contemporâneos. Em recortes, porque uma árvore só chegava a cinco níveis de recuo e ninguém conseguia seguir quem vinha de quem.",
    okinawaTitulo: "1 · As raízes em Okinawa",
    okinawaLegenda: "Séculos XIX e XX",
    okinawaRodape:
      "Asato e Itosu formaram Funakoshi em conjunto — não é uma linha única. A árvore os mostra lado a lado, e a descendência segue por Itosu apenas para manter a leitura vertical.",
    japaoTitulo: "2 · Do fundador ao mundo",
    japaoLegenda: "Os discípulos diretos e onde cada um plantou",
    japaoRodape:
      "Todos os nomes deste nível treinaram diretamente com Funakoshi. As organizações entre parênteses foram fundadas por eles depois — várias nasceram de discordâncias sobre o rumo esportivo do estilo.",
    mestresTitulo: "Fichas dos mestres",
    mestresDescricao: "Quem foi cada um, quando viveu e o que deixou para o estilo.",
    brasilTitulo: "Chegada ao Brasil",
    brasilDescricao:
      "Entre 1955 e 1972, mestres japoneses desembarcam em ondas e fundam as linhagens de onde descende a maior parte do Shotokan brasileiro — de Harada, que veio trabalhar num banco, a Okuda, enviado oficialmente pela JKA.",
    brasilArvoreTitulo: "3 · Ramificações no Brasil",
    brasilLegenda: "1955 a 1972",
    brasilRodape:
      "Datas e cidades conferidas em fontes independentes. Existem outras linhagens importantes além destas — a primeira geração chegou em grupo, e nem todos os nomes ficaram registrados.",
  },
  en: {
    sobretitulo: "History · 歴史",
    titulo: "From Okinawa to the world: the Shotokan lineage",
    descricao: (marcos: number, mestres: number) =>
      `${marcos} historical milestones and ${mestres} masters catalogued. Knowing this journey changes the way you perform every kata.`,
    bannerSobretitulo: "From Shuri castle to the world",
    bannerTexto:
      "An Okinawan primary school teacher took the art to Japan in 1922. A hundred years later it is trained on every continent — and each kata still carries the name of whoever preserved it.",
    rotuloAbas: "History topics",
    abaLinha: "Timeline",
    abaLinhagem: "Lineage",
    abaMestres: "Masters",
    abaBrasil: "In Brazil",
    linhaTitulo: "Timeline",
    linhaDescricao: "Click a milestone to open its full historical context.",
    preceitosLegenda: "Precepts of Gichin Funakoshi",
    linhagemTitulo: "The lineage, from Japan to the world",
    linhagemDescricao:
      "The succession of masters that carried the art from Shuri to today's dojos. Split into sections, because a single tree went five levels deep and nobody could follow who came from whom.",
    okinawaTitulo: "1 · The roots in Okinawa",
    okinawaLegenda: "19th and 20th centuries",
    okinawaRodape:
      "Asato and Itosu trained Funakoshi together — it is not a single line. The tree shows them side by side, and the descent follows Itosu only to keep it readable top to bottom.",
    japaoTitulo: "2 · From the founder to the world",
    japaoLegenda: "His direct students and where each one took root",
    japaoRodape:
      "Everyone at this level trained directly with Funakoshi. The organisations in the badges were founded by them later — several were born of disagreements over the style's turn towards sport.",
    mestresTitulo: "The masters",
    mestresDescricao: "Who each one was, when they lived and what they left to the style.",
    brasilTitulo: "Arrival in Brazil",
    brasilDescricao:
      "Between 1955 and 1972, Japanese masters arrive in waves and found the lineages from which most Brazilian Shotokan descends — from Harada, who came to work at a bank, to Okuda, sent officially by the JKA.",
    brasilArvoreTitulo: "3 · Branches in Brazil",
    brasilLegenda: "1955 to 1972",
    brasilRodape:
      "Dates and cities checked against independent sources. There are other important lineages beyond these — the first generation arrived as a group, and not every name was recorded.",
  },
} as const;

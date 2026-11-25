/**
 * Idiomas do academy. O português é o padrão e mora em /estudos; o inglês
 * espelha as mesmas páginas sob /en/estudos.
 *
 * Por enquanto só os katas têm versão em inglês (fase 1). As rotas abaixo
 * concentram os endereços para os componentes não montarem caminho à mão.
 */

export type Idioma = "pt" | "en";

export const PREFIXO: Record<Idioma, string> = { pt: "", en: "/en" };

/** Página de um kata no idioma pedido. */
export const rotaKata = (idioma: Idioma, id: string) =>
  `${PREFIXO[idioma]}/estudos/tecnicas/kata/${id}`;

/** Lista de katas (PT: Técnicas e Katas; EN: índice dos katas). */
export const rotaTecnicas = (idioma: Idioma) => `${PREFIXO[idioma]}/estudos/tecnicas`;

/** Mesmo caminho no outro idioma, para o seletor PT | EN. */
export function noOutroIdioma(caminho: string, destino: Idioma): string {
  const semPrefixo = caminho.replace(/^\/en(?=\/|$)/, "") || "/";
  return destino === "en" ? `/en${semPrefixo === "/" ? "" : semPrefixo}` : semPrefixo;
}

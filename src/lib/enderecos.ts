/**
 * Os três endereços do Torakan, servidos por este mesmo projeto:
 *
 *   torakandojo.com           → site: landing, planos e matrícula
 *   academy.torakandojo.com   → parte didática (/estudos)
 *   portal.torakandojo.com    → área do aluno, do professor e do admin
 *
 * Cada endereço vem de uma variável NEXT_PUBLIC_URL_*. Sem elas (localhost,
 * previews da Vercel), tudo continua num endereço só, como antes: os helpers
 * devolvem o caminho relativo e o middleware não separa nada.
 *
 * Use os helpers só nos links que atravessam de uma parte para outra. Link
 * dentro da mesma parte continua relativo.
 */

export type Secao = "site" | "academy" | "portal";

function semBarraFinal(valor: string | undefined): string {
  return (valor ?? "").trim().replace(/\/+$/, "");
}

// Leitura literal de cada variável: é assim que o Next as embute no navegador.
const BASE: Record<Secao, string> = {
  site: semBarraFinal(process.env.NEXT_PUBLIC_URL_SITE),
  academy: semBarraFinal(process.env.NEXT_PUBLIC_URL_ACADEMY),
  portal: semBarraFinal(process.env.NEXT_PUBLIC_URL_PORTAL),
};

/** Endereço completo de `caminho` na parte indicada (ou relativo, sem configuração). */
export function urlNa(secao: Secao, caminho: string): string {
  return `${BASE[secao]}${caminho}`;
}

export const noSite = (caminho: string) => urlNa("site", caminho);
export const naAcademy = (caminho: string) => urlNa("academy", caminho);
export const noPortal = (caminho: string) => urlNa("portal", caminho);

/**
 * Endereço base de uma parte para o `metadataBase` do Next (canonical e
 * imagens de compartilhamento). Sem configuração, o Next usa o endereço do
 * deploy.
 */
export function baseDa(secao: Secao): URL | undefined {
  return BASE[secao] ? new URL(BASE[secao]) : undefined;
}

/** Separação ligada só quando os três endereços estão configurados. */
export function separacaoAtiva(): boolean {
  return Boolean(BASE.site && BASE.academy && BASE.portal);
}

/** host (ex.: "academy.torakandojo.com") → parte que ele serve. */
export function secaoDoHost(host: string | null): Secao | null {
  if (!host || !separacaoAtiva()) return null;
  const alvo = host.toLowerCase();
  for (const secao of Object.keys(BASE) as Secao[]) {
    if (new URL(BASE[secao]).host.toLowerCase() === alvo) return secao;
  }
  return null;
}

/**
 * A qual parte pertence um caminho. "comum" vale em qualquer endereço: a API
 * (chamada por fetch relativo de todas as telas) e as páginas legais.
 */
export function secaoDoCaminho(caminho: string): Secao | "comum" {
  const comeca = (prefixo: string) =>
    caminho === prefixo || caminho.startsWith(`${prefixo}/`);

  if (comeca("/api") || comeca("/privacidade") || comeca("/termos")) {
    return "comum";
  }
  if (comeca("/estudos")) return "academy";
  if (comeca("/portal") || comeca("/login") || comeca("/primeiro-acesso")) {
    return "portal";
  }
  return "site";
}

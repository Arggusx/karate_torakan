import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { secaoDoHost, separacaoAtiva, type Secao } from "@/lib/enderecos";
import { getKatas } from "@/services/dataService";

/**
 * sitemap.xml por endereço: www lista as páginas do site, academy as de
 * estudo (incluindo cada kata), portal não lista nada. Sem a separação
 * configurada (localhost), lista tudo no endereço atual.
 */

type Entrada = MetadataRoute.Sitemap[number];

const PAGINAS_SITE: (Omit<Entrada, "url"> & { caminho: string })[] = [
  { caminho: "/", changeFrequency: "monthly", priority: 1 },
  { caminho: "/planos", changeFrequency: "monthly", priority: 0.8 },
  { caminho: "/privacidade", changeFrequency: "yearly", priority: 0.2 },
  { caminho: "/termos", changeFrequency: "yearly", priority: 0.2 },
];

const CAMINHOS_ACADEMY = [
  { caminho: "/estudos", prioridade: 1 },
  { caminho: "/estudos/tecnicas", prioridade: 0.9 },
  { caminho: "/estudos/historia", prioridade: 0.8 },
  { caminho: "/estudos/fundamentos", prioridade: 0.8 },
];

function entradas(base: string, secoes: Secao[]): MetadataRoute.Sitemap {
  const lista: MetadataRoute.Sitemap = [];

  if (secoes.includes("site")) {
    for (const { caminho, ...resto } of PAGINAS_SITE) {
      lista.push({ url: `${base}${caminho}`, ...resto });
    }
  }

  if (secoes.includes("academy")) {
    for (const { caminho, prioridade } of CAMINHOS_ACADEMY) {
      lista.push({
        url: `${base}${caminho}`,
        changeFrequency: "monthly",
        priority: prioridade,
      });
    }
    // Versões em inglês, cada página apontando para a do outro idioma.
    const parDeIdiomas = (caminho: string) => ({
      languages: { "pt-BR": `${base}${caminho}`, en: `${base}/en${caminho}` },
    });
    for (const caminho of ["/estudos", "/estudos/historia", "/estudos/tecnicas", "/estudos/fundamentos"]) {
      lista.push({
        url: `${base}/en${caminho}`,
        changeFrequency: "monthly",
        priority: 0.8,
        alternates: parDeIdiomas(caminho),
      });
    }
    for (const kata of getKatas()) {
      const caminho = `/estudos/tecnicas/kata/${kata.id}`;
      for (const url of [`${base}${caminho}`, `${base}/en${caminho}`]) {
        lista.push({
          url,
          changeFrequency: "yearly",
          priority: 0.7,
          alternates: parDeIdiomas(caminho),
        });
      }
    }
  }

  return lista;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (await headers()).get("host") ?? "";
  const protocolo = host.startsWith("localhost") ? "http" : "https";
  const base = `${protocolo}://${host}`;
  const secao = secaoDoHost(host);

  if (!separacaoAtiva()) return entradas(base, ["site", "academy"]);
  if (secao === "site" || secao === "academy") return entradas(base, [secao]);
  return [];
}

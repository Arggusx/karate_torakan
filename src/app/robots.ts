import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { secaoDoHost, separacaoAtiva } from "@/lib/enderecos";

/**
 * robots.txt por endereço.
 *
 * - portal.*: fechado inteiro. O portal é aberto pelo link do professor.
 * - site e academy: abertos, cada um apontando para o próprio sitemap.
 * - Qualquer outro endereço em produção (torakan-academy.vercel.app e afins):
 *   fechado, para o Google não indexar o mesmo conteúdo em dois lugares.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host") ?? "";
  const secao = secaoDoHost(host);

  if (secao === "portal" || (separacaoAtiva() && !secao)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/portal", "/login", "/primeiro-acesso"],
    },
    sitemap: `https://${host}/sitemap.xml`,
  };
}

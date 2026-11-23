import { NextResponse, type NextRequest } from "next/server";
import { secaoDoCaminho, secaoDoHost, urlNa } from "@/lib/enderecos";

/**
 * Separa site, academy e portal pelo endereço acessado.
 *
 * - A raiz de cada subdomínio leva à página inicial daquela parte.
 * - Um caminho aberto no endereço errado vai para o certo, mantendo o resto
 *   da URL (ex.: torakandojo.com/estudos/historia → academy.torakandojo.com/...).
 * - O portal inteiro sai com X-Robots-Tag: noindex, para não aparecer em
 *   buscadores; ele é acessado pelo link que o professor manda.
 *
 * Fora dos endereços configurados (localhost, previews), nada muda.
 */
export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const secaoHost = secaoDoHost(request.headers.get("host"));
  const secaoCaminho = secaoDoCaminho(pathname);

  if (secaoHost) {
    if (pathname === "/" && secaoHost === "academy") {
      return NextResponse.redirect(urlNa("academy", "/estudos"), 307);
    }
    if (pathname === "/" && secaoHost === "portal") {
      return NextResponse.redirect(urlNa("portal", "/login"), 307);
    }
    if (secaoCaminho !== "comum" && secaoCaminho !== secaoHost) {
      return NextResponse.redirect(
        urlNa(secaoCaminho, `${pathname}${search}`),
        308,
      );
    }
  }

  const resposta = NextResponse.next();
  if (secaoHost === "portal" || secaoCaminho === "portal") {
    resposta.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return resposta;
}

export const config = {
  // Fora: arquivos internos do Next e qualquer arquivo com extensão
  // (imagens, ícones, robots.txt).
  matcher: ["/((?!_next/|.*\\..*).*)"],
};

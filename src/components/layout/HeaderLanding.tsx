import Link from "next/link";
import { MarcaTorakan } from "@/components/ui/MarcaTorakan";
import {
  BarraInferiorSite,
  type ItemBarra,
} from "@/components/layout/BarraInferiorSite";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/*
  O header da vitrine ficou com um destino só.

  Antes ele repetia as âncoras das seções (#beneficios, #pilares, #dojo), o que
  competia com a própria rolagem da página e empurrava o único link que leva a
  outro lugar para a ponta direita. Com um item só, o Portal de Estudos deixa
  de disputar atenção com atalhos para algo que já está logo abaixo.
*/
const LINKS = [{ href: "/estudos", label: "Portal de Estudos" }];

/** No celular, os destinos do site vão para a barra inferior. */
const BARRA: ItemBarra[] = [
  { href: "/", label: "Início", icone: "inicio", exato: true },
  { href: "/planos", label: "Planos", icone: "planos" },
  { href: "/estudos", label: "Estudos", icone: "estudos" },
  { href: "/login", label: "Entrar", icone: "entrar" },
];

export function HeaderLanding() {
  return (
    <>
    <header className="cabecalho-vidro">
      <div className="section flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <MarcaTorakan className="h-10 w-10" />
            <span className="font-marca text-2xl leading-none text-accent">
              Torakan
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

        </div>
      </div>
    </header>
    <BarraInferiorSite itens={BARRA} />
    </>
  );
}

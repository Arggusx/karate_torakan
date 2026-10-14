import Link from "next/link";
import { MarcaTorakan } from "@/components/ui/MarcaTorakan";
import {
  MenuMobile,
  MenuMobileLink,
  MenuMobileSeparador,
} from "@/components/layout/MenuMobile";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

/*
  O header da vitrine ficou com um destino só.

  Antes ele repetia as âncoras das seções (#beneficios, #pilares, #dojo), o que
  competia com a própria rolagem da página e empurrava o único link que leva a
  outro lugar para a ponta direita. Com um item só, o Portal de Estudos deixa
  de disputar atenção com atalhos para algo que já está logo abaixo.
*/
const LINKS = [{ href: "/estudos", label: "Portal de Estudos" }];

export function HeaderLanding() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface">
      <div className="section flex h-14 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <MarcaTorakan className="h-10 w-10" />
            <span className="font-marca text-2xl leading-none text-accent">
              Torakan
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded px-2.5 py-1.5 text-sm font-medium text-muted transition-colors duration-150 hover:bg-elevated hover:text-fg"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <MenuMobile className="lg:hidden" rotulo="Abrir menu do site">
            {LINKS.map((link) => (
              <MenuMobileLink key={link.href} href={link.href}>
                {link.label}
              </MenuMobileLink>
            ))}
            <MenuMobileSeparador />
            <MenuMobileLink href="/planos">Planos e matrícula</MenuMobileLink>
            <MenuMobileLink href="/login">Entrar no portal</MenuMobileLink>
          </MenuMobile>
        </div>
      </div>
    </header>
  );
}

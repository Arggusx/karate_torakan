"use client";

import Link from "next/link";
import { MarcaTorakan } from "@/components/ui/MarcaTorakan";
import { usePathname } from "next/navigation";
import {
  BarraInferiorSite,
  type ItemBarra,
} from "@/components/layout/BarraInferiorSite";
import { IconePortal } from "@/components/portal/IconePortal";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ButtonLink } from "@/components/ui/Button";

const LINKS = [
  { href: "/estudos", label: "Home" },
  { href: "/estudos/historia", label: "História" },
  { href: "/estudos/tecnicas", label: "Técnicas" },
  { href: "/estudos/fundamentos", label: "Fundamentos" },
  { href: "/estudos/jornada", label: "Jornada" },
];

/** No celular, os mesmos destinos vão para a barra inferior. */
const BARRA: ItemBarra[] = [
  { href: "/estudos", label: "Estudos", icone: "estudos", exato: true },
  { href: "/estudos/historia", label: "História", icone: "historia" },
  { href: "/estudos/tecnicas", label: "Técnicas", icone: "tecnicas" },
  { href: "/estudos/fundamentos", label: "Fundamentos", icone: "fundamentos" },
  { href: "/estudos/jornada", label: "Jornada", icone: "jornada" },
];

export function HeaderEstudos() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/estudos" ? pathname === href : pathname.startsWith(href);

  return (
    <>
    <header className="cabecalho-vidro">
      <div className="section flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <MarcaTorakan className="h-8 w-8" />
            <span className="font-marca text-2xl leading-none text-accent">
              Torakan
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className="nav-link"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ButtonLink href="/login" size="sm" className="hidden md:inline-flex">
            Área do Aluno / Professor
          </ButtonLink>
          {/* No celular, "Entrar" cede o lugar da barra inferior à Jornada e
              fica aqui, como ícone. */}
          <Link
            href="/login"
            aria-label="Entrar na área do aluno ou do professor"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated text-muted transition-colors hover:text-accent md:hidden"
          >
            <IconePortal nome="entrar" className="h-5 w-5" />
          </Link>

        </div>
      </div>
    </header>
    <BarraInferiorSite itens={BARRA} />
    </>
  );
}

"use client";

import Link from "next/link";
import { MarcaTorakan } from "@/components/ui/MarcaTorakan";
import { usePathname } from "next/navigation";
import {
  BarraInferiorSite,
  type ItemBarra,
} from "@/components/layout/BarraInferiorSite";
import { SeletorIdioma } from "@/components/layout/SeletorIdioma";
import { IconePortal } from "@/components/portal/IconePortal";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ButtonLink } from "@/components/ui/Button";
import type { Idioma } from "@/i18n/idioma";
import { noPortal, noSite } from "@/lib/enderecos";

const LINKS: Record<Idioma, { href: string; label: string }[]> = {
  pt: [
    { href: "/estudos", label: "Home" },
    { href: "/estudos/historia", label: "História" },
    { href: "/estudos/tecnicas", label: "Técnicas" },
    { href: "/estudos/fundamentos", label: "Fundamentos" },
  ],
  // Fase 1 do inglês: só os katas.
  en: [{ href: "/en/estudos/tecnicas", label: "Katas" }],
};

/** No celular, os mesmos destinos vão para a barra inferior. */
const BARRA: Record<Idioma, ItemBarra[]> = {
  pt: [
    { href: "/estudos", label: "Estudos", icone: "estudos", exato: true },
    { href: "/estudos/historia", label: "História", icone: "historia" },
    { href: "/estudos/tecnicas", label: "Técnicas", icone: "tecnicas" },
    { href: "/estudos/fundamentos", label: "Fundamentos", icone: "fundamentos" },
  ],
  en: [{ href: "/en/estudos/tecnicas", label: "Katas", icone: "tecnicas" }],
};

const AREA_DO_ALUNO: Record<Idioma, { botao: string; aria: string }> = {
  pt: {
    botao: "Área do Aluno / Professor",
    aria: "Entrar na área do aluno ou do professor",
  },
  en: { botao: "Student / Instructor area", aria: "Sign in to the student or instructor area" },
};

export function HeaderEstudos({ idioma = "pt" }: { idioma?: Idioma }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/estudos" ? pathname === href : pathname.startsWith(href);

  return (
    <>
    <header className="cabecalho-vidro">
      <div className="section flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href={noSite("/")} className="flex items-center gap-2">
            <MarcaTorakan className="h-8 w-8" />
            {/* Abaixo de 360px (celulares bem estreitos) fica só a marca: com
                os três botões à direita, o nome não cabe sem cortar. */}
            <span className="font-marca text-2xl leading-none text-accent max-[359px]:hidden">
              Torakan
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {LINKS[idioma].map((link) => {
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

        <div className="flex items-center gap-1.5 sm:gap-2">
          <SeletorIdioma />
          <ThemeToggle />
          <ButtonLink href={noPortal("/login")} size="sm" className="hidden md:inline-flex">
            {AREA_DO_ALUNO[idioma].botao}
          </ButtonLink>
          {/* No celular, "Entrar" fica aqui, como ícone: a barra inferior é
              só das seções de estudo. */}
          <Link
            href={noPortal("/login")}
            aria-label={AREA_DO_ALUNO[idioma].aria}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-elevated text-muted transition-colors hover:text-accent md:hidden"
          >
            <IconePortal nome="entrar" className="h-5 w-5" />
          </Link>

        </div>
      </div>
    </header>
    <BarraInferiorSite itens={BARRA[idioma]} />
    </>
  );
}

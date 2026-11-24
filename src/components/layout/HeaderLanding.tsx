import Link from "next/link";
import { MarcaTorakan } from "@/components/ui/MarcaTorakan";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { noSite } from "@/lib/enderecos";
// O header também vai para /planos e para as páginas legais: o estilo vem junto.
import "@/app/landing.css";

/*
  Header da vitrine no redesign "tinta sumi" (DESIGN.md, seção 6): logo,
  TORAKAN, as quatro âncoras da landing e o botão "Aula grátis".

  Também aparece em /planos e nas páginas legais, por isso as âncoras levam o
  endereço do site (noSite): de qualquer página elas voltam para a seção certa
  da landing.

  Sem link para o portal de estudos nem para o portal do aluno: o conteúdo de
  estudo é de quem já é matriculado. O único atalho para a área do aluno fica
  no rodapé.
*/
const LINKS = [
  { href: noSite("/#turmas"), label: "Turmas" },
  { href: noSite("/#aula"), label: "A aula" },
  { href: noSite("/#dojo"), label: "O dojo" },
  { href: noSite("/#contato"), label: "Contato" },
];

export function HeaderLanding() {
  return (
    <header className="landing landing-header">
      <nav
        aria-label="Principal"
        className="landing-container flex min-h-16 flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:gap-x-6"
      >
        <Link href={noSite("/")} className="flex items-center gap-2 sm:gap-3">
          <MarcaTorakan className="h-8 w-8 sm:h-9 sm:w-9" />
          <span className="landing-marca">Torakan</span>
        </Link>

        <ul className="landing-nav ml-auto hidden items-center gap-6 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="landing-link text-fg">
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 sm:gap-3 md:ml-0">
          <ThemeToggle />
          <a
            href={noSite("/#contato")}
            className="landing-botao landing-botao-tinta !px-4 !py-3 text-sm sm:!px-5"
          >
            Aula grátis
          </a>
        </div>
      </nav>
    </header>
  );
}

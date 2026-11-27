import type { Metadata } from "next";
import Link from "next/link";
import { MarcaTorakan } from "@/components/ui/MarcaTorakan";
import { Footer } from "@/components/layout/Footer";
import { SessaoHeader } from "@/components/portal/SessaoHeader";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ButtonLink } from "@/components/ui/Button";
import { naAcademy, noSite } from "@/lib/enderecos";
// Redesign "tinta sumi" do portal: tudo fica sob .portal (ver o arquivo).
import "../portal.css";

/** O portal não entra em buscadores: é aberto pelo link do professor. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="portal flex min-h-screen flex-col">
      <header className="cabecalho-vidro">
        <div className="section flex h-16 items-center justify-between gap-4">
          <Link href={noSite("/")} className="flex items-center gap-2">
            <MarcaTorakan className="h-8 w-8" />
            <span className="font-marca text-2xl leading-none text-accent">
              Torakan
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <SessaoHeader />
            <ThemeToggle />
            <ButtonLink href={naAcademy("/estudos")} variant="ghost" size="sm" className="hidden sm:inline-flex">
              Portal de estudos
            </ButtonLink>
          </div>
        </div>
      </header>

      {/* Ver comentário em estudos/layout.tsx: o hero de cada página encosta
          no header, então o padding do topo sai daqui. */}
      <main id="conteudo" tabIndex={-1} className="flex-1 pb-8">{children}</main>
      <Footer />
    </div>
  );
}

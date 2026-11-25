import type { Metadata } from "next";
import Link from "next/link";
import { HeaderEstudos } from "@/components/layout/HeaderEstudos";
import { IdiomaDoDocumento } from "@/components/layout/IdiomaDoDocumento";
import { baseDa, noSite } from "@/lib/enderecos";
// Mesmo visual do academy em português.
import "../../academy.css";

/**
 * Academy em inglês (/en/estudos). Fase 1: índice e páginas dos katas.
 * O rodapé é curto de propósito: as outras seções ainda só existem em
 * português, e o botão PT no cabeçalho leva até elas.
 */
export const metadata: Metadata = {
  metadataBase: baseDa("academy"),
  title: { default: "Torakan Academy", template: "%s · Torakan" },
  openGraph: {
    siteName: "Torakan Academy",
    locale: "en_US",
    type: "website",
    images: [{ url: "/imagens/estudos.jpg", alt: "Shotokan Karate study collection" }],
  },
};

export default function EstudosEnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="academy flex min-h-screen flex-col">
      <IdiomaDoDocumento lang="en" />
      <HeaderEstudos idioma="en" />
      <main className="flex-1 pb-10">{children}</main>
      <footer className="mt-16 border-t border-line bg-elevated">
        <div className="section flex flex-col gap-2 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Academia Tigre de Karatê ·{" "}
            <Link href={noSite("/")} className="underline-offset-2 hover:text-accent hover:underline">
              torakandojo.com
            </Link>
          </p>
          <p>空手に先手なし — There is no first attack in karate.</p>
        </div>
      </footer>
    </div>
  );
}

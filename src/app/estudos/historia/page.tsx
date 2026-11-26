import type { Metadata } from "next";
import { PaginaHistoria } from "@/components/historia/PaginaHistoria";

export const metadata: Metadata = {
  title: "História",
  description:
    "Linha do tempo do Karatê Shotokan e a árvore genealógica dos mestres.",
  alternates: {
    canonical: "/estudos/historia",
    languages: { "pt-BR": "/estudos/historia", en: "/en/estudos/historia" },
  },
};

/** História em português. O conteúdo da página está em PaginaHistoria. */
export default function HistoriaPage() {
  return <PaginaHistoria idioma="pt" />;
}

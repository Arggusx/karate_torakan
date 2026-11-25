import type { Metadata } from "next";
import { PaginaFundamentos } from "@/components/fundamentos/PaginaFundamentos";

export const metadata: Metadata = {
  title: "Fundamentos",
  description:
    "Sistema de faixas Kyu/Dan, Dojo Kun, Niju Kun, etiqueta, princípios técnicos, origem dos katas e o dicionário do dojo.",
  alternates: {
    canonical: "/estudos/fundamentos",
    languages: { "pt-BR": "/estudos/fundamentos", en: "/en/estudos/fundamentos" },
  },
};

/** Fundamentos em português. O conteúdo da página está em PaginaFundamentos. */
export default function FundamentosPage() {
  return <PaginaFundamentos idioma="pt" />;
}

import type { Metadata } from "next";
import { PaginaFundamentos } from "@/components/fundamentos/PaginaFundamentos";

export const metadata: Metadata = {
  title: "Fundamentals",
  description:
    "The Kyu/Dan belt system, Dojo Kun, Niju Kun, etiquette, technical principles, the origin of the katas and the dojo glossary.",
  alternates: {
    canonical: "/en/estudos/fundamentos",
    languages: { "pt-BR": "/estudos/fundamentos", en: "/en/estudos/fundamentos" },
  },
};

export default function FundamentosEnPage() {
  return <PaginaFundamentos idioma="en" />;
}

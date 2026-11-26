import type { Metadata } from "next";
import { PaginaEstudos } from "@/components/estudos/PaginaEstudos";

export const metadata: Metadata = {
  title: "Portal de Estudos",
  description:
    "Os três pilares do estudo do Karatê Shotokan: história, técnicas e fundamentos.",
  alternates: {
    canonical: "/estudos",
    languages: { "pt-BR": "/estudos", en: "/en/estudos" },
  },
};

/** Home do academy em português. O conteúdo está em PaginaEstudos. */
export default function EstudosHomePage() {
  return <PaginaEstudos idioma="pt" />;
}

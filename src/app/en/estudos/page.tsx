import type { Metadata } from "next";
import { PaginaEstudos } from "@/components/estudos/PaginaEstudos";

export const metadata: Metadata = {
  title: "Study Portal",
  description:
    "The three pillars of Shotokan Karate study: history, techniques and fundamentals.",
  alternates: {
    canonical: "/en/estudos",
    languages: { "pt-BR": "/estudos", en: "/en/estudos" },
  },
};

export default function EstudosEnPage() {
  return <PaginaEstudos idioma="en" />;
}

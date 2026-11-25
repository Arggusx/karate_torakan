import type { Metadata } from "next";

/**
 * A página de técnicas é client component e não pode exportar metadata, então
 * o título dela fica aqui. As páginas de kata, logo abaixo, têm o próprio
 * título e canonical em generateMetadata.
 */
export const metadata: Metadata = {
  title: "Técnicas e Katas",
  description:
    "Os 26 katas do Karatê Shotokan com sequência de movimentos, embusen e significado, e o kihon catalogado: bases, socos, defesas e chutes.",
  alternates: {
    canonical: "/estudos/tecnicas",
    languages: { "pt-BR": "/estudos/tecnicas", en: "/en/estudos/tecnicas" },
  },
};

export default function TecnicasLayout({ children }: { children: React.ReactNode }) {
  return children;
}

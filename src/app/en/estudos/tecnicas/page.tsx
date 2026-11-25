import type { Metadata } from "next";
import { PaginaTecnicas } from "@/components/tecnicas/PaginaTecnicas";
import { katasResumidosNoIdioma, tecnicasNoIdioma } from "@/i18n/katas";

export const metadata: Metadata = {
  title: "Techniques and Katas",
  description:
    "The 26 Shotokan katas with sequence of moves, embusen and meaning, and the full kihon catalog: stances, punches, blocks and kicks.",
  alternates: {
    canonical: "/en/estudos/tecnicas",
    languages: { "pt-BR": "/estudos/tecnicas", en: "/en/estudos/tecnicas" },
  },
};

/** Técnicas em inglês: os dados já vão traduzidos do servidor. */
export default function TecnicasEnPage() {
  return (
    <PaginaTecnicas
      idioma="en"
      dados={{ tecnicas: tecnicasNoIdioma("en"), katas: katasResumidosNoIdioma("en") }}
    />
  );
}

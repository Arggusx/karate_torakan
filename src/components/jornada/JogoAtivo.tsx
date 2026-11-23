"use client";

import { JogoColecao } from "@/components/jornada/JogoColecao";
import { JogoIlhas } from "@/components/jornada/JogoIlhas";
import { JogoMontar } from "@/components/jornada/JogoMontar";
import { JogoRanking } from "@/components/jornada/JogoRanking";
import { JogoSequencia } from "@/components/jornada/JogoSequencia";
import { JogoTreino } from "@/components/jornada/JogoTreino";

/** Troca o jogo pela rota /estudos/jornada/[jogo]. */
export function JogoAtivo({ slug }: { slug: string }) {
  switch (slug) {
    case "ilhas":
      return <JogoIlhas />;
    case "treino":
      return <JogoTreino />;
    case "montar":
      return <JogoMontar />;
    case "sequencia":
      return <JogoSequencia />;
    case "ranking":
      return <JogoRanking />;
    case "colecao":
      return <JogoColecao />;
    default:
      return null;
  }
}

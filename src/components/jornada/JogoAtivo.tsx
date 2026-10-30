"use client";

import { JogoCaminhos } from "@/components/jornada/JogoCaminhos";
import { JogoColecao } from "@/components/jornada/JogoColecao";
import { JogoKaruta } from "@/components/jornada/JogoKaruta";
import { JogoRandori } from "@/components/jornada/JogoRandori";
import { JogoSequencia } from "@/components/jornada/JogoSequencia";

/** Troca o jogo pela rota /estudos/jornada/[jogo]. */
export function JogoAtivo({ slug }: { slug: string }) {
  switch (slug) {
    case "caminhos":
      return <JogoCaminhos />;
    case "randori":
      return <JogoRandori />;
    case "karuta":
      return <JogoKaruta />;
    case "sequencia":
      return <JogoSequencia />;
    case "colecao":
      return <JogoColecao />;
    default:
      return null;
  }
}

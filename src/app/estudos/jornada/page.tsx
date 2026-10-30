import type { Metadata } from "next";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { PainelJornada } from "@/components/jornada/PainelJornada";

export const metadata: Metadata = {
  title: "Jornada",
  description:
    "Minigames para estudar karatê: caminhos com leituras e quizzes, randori de perguntas, karuta e a sequência dos katas.",
};

export default function JornadaPage() {
  return (
    <>
      <HeroPagina
        compacto
        sobretitulo="Jornada · 道"
        titulo="Estudar jogando, no seu ritmo"
        descricao="Caminhos de leitura, perguntas, cartas e a ordem dos katas. Nada de placar nem ranking: o que você conclui vira selo no seu Livro de selos."
        kanji="道"
      />
      <div className="section py-8">
        <PainelJornada />
      </div>
    </>
  );
}

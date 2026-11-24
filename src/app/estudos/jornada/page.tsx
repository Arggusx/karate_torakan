import type { Metadata } from "next";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { PainelJornada } from "@/components/jornada/PainelJornada";

export const metadata: Metadata = {
  title: "Jornada",
  description:
    "Minigames para estudar karatê: ilhas com mini aula e perguntas por faixa, treino livre, Monte a técnica, ordem dos katas e ranking do dojo.",
  alternates: { canonical: "/estudos/jornada" },
};

export default function JornadaPage() {
  return (
    <>
      <HeroPagina
        compacto
        sobretitulo="Jornada · 道"
        titulo="Estudar jogando, no seu ritmo"
        descricao="Seis ilhas para explorar faixa a faixa, treino livre, o nome das técnicas e a ordem dos katas. Cada acerto vale pontos para o ranking do dojo, e o que você conclui vira selo e moldura."
        kanji="道"
      />
      <div className="section py-8">
        <PainelJornada />
      </div>
    </>
  );
}

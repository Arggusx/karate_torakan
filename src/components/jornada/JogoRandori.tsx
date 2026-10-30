"use client";

import { useState } from "react";
import { ComoFunciona } from "@/components/jornada/ComoFunciona";
import { jogo } from "@/components/jornada/jogos";
import { QuizRodada } from "@/components/jornada/QuizRodada";
import { Button } from "@/components/ui/Button";
import { FilterChips } from "@/components/ui/Tabs";
import {
  TEMAS,
  novaSemente,
  perguntasDoTema,
  perguntasMisturadas,
  type Nivel,
  type Pergunta,
  type Tema,
} from "@/services/perguntas";

const COR = jogo("randori")!.cor;
const QUANTAS = 8;

const NIVEIS = [
  { value: "1" as const, label: "Fácil" },
  { value: "2" as const, label: "Médio" },
  { value: "3" as const, label: "Difícil" },
];

const OPCOES_TEMA = [
  { value: "todos" as const, label: "Todos os temas" },
  ...TEMAS.map((t) => ({ value: t.id, label: t.label })),
];

/**
 * Randori: o "desafio aleatório" do Oratio. Randori é o treino livre do
 * karatê — aqui, perguntas livres. Escolhe-se a dificuldade e o tema; nada
 * fica guardado, é só treino.
 */
export function JogoRandori() {
  const [nivel, setNivel] = useState<"1" | "2" | "3">("1");
  const [tema, setTema] = useState<"todos" | Tema>("todos");
  const [rodada, setRodada] = useState<{ semente: number; perguntas: Pergunta[] } | null>(null);

  function comecar() {
    const semente = novaSemente();
    const n = Number(nivel) as Nivel;
    setRodada({
      semente,
      perguntas:
        tema === "todos"
          ? perguntasMisturadas(QUANTAS, semente, n)
          : perguntasDoTema(tema, QUANTAS, semente, n),
    });
  }

  return (
    <div style={{ "--game": COR } as React.CSSProperties}>
      <ComoFunciona
        id="randori"
        passos={[
          "Escolha a dificuldade e, se quiser, um tema.",
          `São ${QUANTAS} perguntas, uma de cada vez.`,
          "Depois de cada resposta aparece o porquê — acertando ou não.",
        ]}
        nota="O Randori é só treino: nada fica guardado e não existe placar."
      />

      {rodada ? (
        <div className="painel">
          <QuizRodada
            key={rodada.semente}
            perguntas={rodada.perguntas}
            cor={COR}
            onDeNovo={comecar}
          />
          <button type="button" onClick={() => setRodada(null)} className="mt-4 text-xs font-semibold text-muted hover:text-accent">
            Mudar dificuldade ou tema
          </button>
        </div>
      ) : (
        <div className="painel grid gap-5">
          <div>
            <p className="label mb-2">Dificuldade</p>
            <FilterChips options={NIVEIS} value={nivel} onChange={setNivel} />
          </div>
          <div>
            <p className="label mb-2">Tema</p>
            <FilterChips options={OPCOES_TEMA} value={tema} onChange={setTema} />
          </div>
          <div>
            <Button onClick={comecar}>Começar o Randori</Button>
          </div>
        </div>
      )}
    </div>
  );
}

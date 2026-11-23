"use client";

import { useState } from "react";
import { ComoFunciona } from "@/components/jornada/ComoFunciona";
import { jogo } from "@/components/jornada/jogos";
import { QuizRodada } from "@/components/jornada/QuizRodada";
import { Button } from "@/components/ui/Button";
import { FilterChips } from "@/components/ui/Tabs";
import { cn } from "@/lib/cn";
import { TEMAS, novaSemente, perguntasDoTreino, type Nivel, type Pergunta, type Tema } from "@/services/perguntas";

const COR = jogo("treino")!.cor;

const NIVEIS = [
  { value: "1" as const, label: "Fácil" },
  { value: "2" as const, label: "Médio" },
  { value: "3" as const, label: "Difícil" },
];

const QUANTIDADES = [
  { value: "8" as const, label: "8 perguntas" },
  { value: "12" as const, label: "12 perguntas" },
];

/** Vocabulário é todo de tradução — e o Treino livre não tem tradução. */
const TEMAS_DO_TREINO = TEMAS.filter((t) => t.id !== "vocabulario");

/**
 * Treino livre (o Randori do karatê: treino sem roteiro). Escolhe-se um ou
 * mais temas, a dificuldade e o tamanho da rodada. Não entra pergunta de
 * tradução ("o que significa…"): aqui se pergunta o que se faz e por quê.
 */
export function JogoTreino() {
  const [nivel, setNivel] = useState<"1" | "2" | "3">("1");
  const [quantas, setQuantas] = useState<"8" | "12">("8");
  const [temas, setTemas] = useState<Tema[]>(TEMAS_DO_TREINO.map((t) => t.id));
  const [rodada, setRodada] = useState<{ semente: number; perguntas: Pergunta[] } | null>(null);

  const alternar = (tema: Tema) =>
    setTemas((atuais) => (atuais.includes(tema) ? atuais.filter((t) => t !== tema) : [...atuais, tema]));

  function comecar() {
    const semente = novaSemente();
    const n = Number(nivel) as Nivel;
    setRodada({
      semente,
      perguntas: perguntasDoTreino({
        temas,
        quantas: Number(quantas),
        semente,
        nivel: n,
        alternativas: n === 1 ? 4 : 5,
      }),
    });
  }

  const todos = temas.length === TEMAS_DO_TREINO.length;

  return (
    <div style={{ "--game": COR } as React.CSSProperties}>
      <ComoFunciona
        id="treino"
        titulo="Como funciona o Treino livre"
        passos={[
          "Marque um ou mais temas: dá para misturar, por exemplo, Katas e História.",
          "Escolha a dificuldade e o tamanho da rodada.",
          "As perguntas vêm da mais fácil para a mais difícil. No médio e no difícil são 5 alternativas.",
          "No fim aparecem o placar, os pontos, o desempenho por tema e a revisão com o porquê de cada erro.",
        ]}
        nota="Aqui não há perguntas de tradução. Para o vocabulário, use a Ilha das Palavras ou o Monte a técnica."
      />

      {rodada ? (
        <div className="painel">
          <QuizRodada key={rodada.semente} perguntas={rodada.perguntas} cor={COR} onDeNovo={comecar} porTema />
          <button
            type="button"
            onClick={() => setRodada(null)}
            className="mt-4 text-xs font-semibold text-muted hover:text-accent"
          >
            ← Mudar temas ou dificuldade
          </button>
        </div>
      ) : (
        <div className="painel grid gap-6">
          <div>
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <p className="label">Temas</p>
              <button
                type="button"
                className="text-2xs font-semibold text-muted hover:text-accent"
                onClick={() => setTemas(todos ? [] : TEMAS_DO_TREINO.map((t) => t.id))}
              >
                {todos ? "Desmarcar todos" : "Marcar todos"}
              </button>
            </div>
            <div className="temas-escolha" role="group" aria-label="Temas do treino">
              {TEMAS_DO_TREINO.map((t) => {
                const marcado = temas.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    aria-pressed={marcado}
                    onClick={() => alternar(t.id)}
                    className={cn("tema-chip", marcado && "is-marcado")}
                  >
                    <span className="tema-chip-caixa" aria-hidden>
                      {marcado ? "✓" : ""}
                    </span>
                    {t.label}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-2xs text-muted">
              {temas.length === 0
                ? "Marque ao menos um tema."
                : `${temas.length} ${temas.length === 1 ? "tema marcado" : "temas marcados"}.`}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="label mb-2">Dificuldade</p>
              <FilterChips options={NIVEIS} value={nivel} onChange={setNivel} />
            </div>
            <div>
              <p className="label mb-2">Tamanho</p>
              <FilterChips options={QUANTIDADES} value={quantas} onChange={setQuantas} />
            </div>
          </div>
          <div>
            <Button onClick={comecar} disabled={temas.length === 0}>
              Começar o treino
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

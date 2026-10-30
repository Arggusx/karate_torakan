"use client";

import { useState } from "react";
import { Contas } from "@/components/jornada/Contas";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import type { Pergunta } from "@/services/perguntas";

/**
 * Uma rodada de quiz em modo estudo (Caminhos e Randori).
 *
 * Diferente da prova do portal: aqui a resposta aparece na hora, com o "por
 * quê" — acertando ou errando —, porque o objetivo é aprender. Errar não tira
 * nada; no fim, a pessoa vê o que acertou e pode tentar de novo.
 */
export function QuizRodada({
  perguntas,
  cor,
  passa,
  onFim,
  onDeNovo,
  continuar,
}: {
  perguntas: Pergunta[];
  cor: string;
  /** Acertos para "passar" (Caminhos). Sem ele, a rodada só termina. */
  passa?: number;
  onFim?: (acertos: number, passou: boolean) => void;
  onDeNovo?: () => void;
  /** Ação principal quando a rodada é vencida (ex.: voltar ao caminho). */
  continuar?: { rotulo: string; acao: () => void };
}) {
  const [indice, setIndice] = useState(0);
  const [escolha, setEscolha] = useState<number | null>(null);
  const [acertos, setAcertos] = useState<boolean[]>([]);
  const [terminou, setTerminou] = useState(false);

  const p = perguntas[indice];
  const respondida = escolha !== null;
  const certo = respondida && escolha === p?.correta;
  const totalAcertos = acertos.filter(Boolean).length;

  function responder(i: number) {
    if (respondida) return;
    setEscolha(i);
    setAcertos((a) => [...a, i === p.correta]);
  }

  function avancar() {
    if (indice + 1 < perguntas.length) {
      setIndice(indice + 1);
      setEscolha(null);
      return;
    }
    setTerminou(true);
    onFim?.(totalAcertos, passa === undefined || totalAcertos >= passa);
  }

  if (perguntas.length === 0) {
    return <p className="body-muted">Não foi possível montar perguntas agora.</p>;
  }

  if (terminou) {
    const passou = passa === undefined || totalAcertos >= passa;
    return (
      <div className="quiz-fim" style={{ "--game": cor } as React.CSSProperties}>
        <p className="quiz-fim-titulo">
          {passa === undefined
            ? "Rodada concluída"
            : passou
              ? "Parada vencida"
              : "Quase lá"}
        </p>
        <p className="body-muted">
          Você acertou {totalAcertos} de {perguntas.length}.
          {passa !== undefined && !passou
            ? ` Para seguir, são ${passa}. Releia as explicações e tente de novo — errar aqui não apaga nada.`
            : null}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {passou && continuar ? (
            <Button size="sm" onClick={continuar.acao}>
              {continuar.rotulo}
            </Button>
          ) : null}
          {onDeNovo ? (
            <Button size="sm" variant={passou ? "secondary" : "primary"} onClick={onDeNovo}>
              {passou ? "Jogar outra rodada" : "Tentar de novo"}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="quiz" style={{ "--game": cor } as React.CSSProperties}>
      <div className="quiz-topo">
        <Contas
          total={perguntas.length}
          feitas={indice + (respondida ? 1 : 0)}
          cor={cor}
          rotulo={`Pergunta ${indice + 1} de ${perguntas.length}`}
        />
        <span className="quiz-contador">
          {indice + 1} de {perguntas.length}
        </span>
      </div>

      <p className="quiz-enunciado">{p.enunciado}</p>

      <ul className="quiz-alternativas">
        {p.alternativas.map((alt, i) => (
          <li key={alt}>
            <button
              type="button"
              disabled={respondida}
              onClick={() => responder(i)}
              className={cn(
                "quiz-alternativa",
                respondida && i === p.correta && "is-certa",
                respondida && i === escolha && i !== p.correta && "is-errada",
              )}
            >
              <span className="quiz-letra" aria-hidden>
                {"ABCD"[i]}
              </span>
              {alt}
            </button>
          </li>
        ))}
      </ul>

      {respondida ? (
        <div className={cn("quiz-porque", certo ? "is-certo" : "is-errado")} aria-live="polite">
          <strong>{certo ? "Isso mesmo." : "Não foi dessa vez."}</strong> {p.porque}
          <div className="mt-3">
            <Button size="sm" onClick={avancar}>
              {indice + 1 < perguntas.length ? "Próxima" : "Ver resultado"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

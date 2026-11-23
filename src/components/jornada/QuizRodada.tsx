"use client";

import { useState } from "react";
import { Contas } from "@/components/jornada/Contas";
import { IconeFeito } from "@/components/jornada/IconesJornada";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { jornada } from "@/lib/jornadaStore";
import { TEMAS, type Pergunta } from "@/services/perguntas";
import { chaveNova } from "@/services/pontuacao";

const LETRAS = "ABCDEF";

/**
 * Uma rodada de perguntas em modo estudo (Ilhas e Treino livre).
 *
 * Durante a rodada, a resposta só é marcada (certa em verde, a escolhida em
 * vermelho): a explicação já veio antes, na mini aula. No fim, a tela de
 * resultado mostra o placar, os pontos e a revisão de cada pergunta — com o
 * "por quê" das que ficaram erradas.
 */
export function QuizRodada({
  perguntas,
  cor,
  passa,
  onFim,
  onDeNovo,
  continuar,
  porTema = false,
}: {
  perguntas: Pergunta[];
  cor: string;
  /** Acertos para "passar" (Ilhas). Sem ele, a rodada só termina. */
  passa?: number;
  /** Chamado no fim; pode devolver pontos de bônus (ex.: faixa vencida). */
  onFim?: (acertos: number, passou: boolean) => number | void;
  onDeNovo?: () => void;
  /** Ação principal quando a rodada é vencida (ex.: voltar à ilha). */
  continuar?: { rotulo: string; acao: () => void };
  /** Mostra o desempenho por tema no resultado (Treino livre). */
  porTema?: boolean;
}) {
  const [indice, setIndice] = useState(0);
  const [escolhas, setEscolhas] = useState<number[]>([]);
  const [fim, setFim] = useState<{ pontos: number } | null>(null);

  const p = perguntas[indice];
  const escolha = escolhas[indice];
  const respondida = escolha !== undefined;
  const acertos = escolhas.filter((e, i) => e === perguntas[i]?.correta).length;

  function responder(i: number) {
    if (respondida) return;
    setEscolhas((e) => [...e, i]);
  }

  function avancar() {
    if (indice + 1 < perguntas.length) {
      setIndice(indice + 1);
      return;
    }
    const passou = passa === undefined || acertos >= passa;
    const nivel = Math.round(perguntas.reduce((soma, q) => soma + q.nivel, 0) / perguntas.length) as 1 | 2 | 3;
    const alternativas = perguntas.some((q) => q.alternativas.length >= 5) ? 5 : 4;
    const ganhos = jornada.terminarRodada({
      tipo: "quiz",
      chave: chaveNova("q"),
      acertos,
      total: perguntas.length,
      nivel,
      alternativas,
    });
    const bonus = onFim?.(acertos, passou) ?? 0;
    setFim({ pontos: ganhos + bonus });
  }

  if (perguntas.length === 0) {
    return <p className="body-muted">Não foi possível montar perguntas agora.</p>;
  }

  if (fim) {
    return (
      <Resultado
        perguntas={perguntas}
        escolhas={escolhas}
        cor={cor}
        passa={passa}
        pontos={fim.pontos}
        porTema={porTema}
        onDeNovo={onDeNovo}
        continuar={continuar}
      />
    );
  }

  const certo = respondida && escolha === p.correta;

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
          <span className="quiz-dificuldade" data-nivel={p.nivel}>
            {["", "fácil", "média", "difícil"][p.nivel]}
          </span>
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
                {LETRAS[i]}
              </span>
              {alt}
            </button>
          </li>
        ))}
      </ul>

      {respondida ? (
        <div className={cn("quiz-marca", certo ? "is-certo" : "is-errado")} aria-live="polite">
          <strong>{certo ? "Isso mesmo." : "Não foi dessa vez."}</strong>
          <span>{certo ? "" : " A certa está marcada em verde. A explicação fica na revisão, no fim."}</span>
          <Button size="sm" onClick={avancar} className="ml-auto">
            {indice + 1 < perguntas.length ? "Próxima" : "Ver resultado"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function Resultado({
  perguntas,
  escolhas,
  cor,
  passa,
  pontos,
  porTema,
  onDeNovo,
  continuar,
}: {
  perguntas: Pergunta[];
  escolhas: number[];
  cor: string;
  passa?: number;
  pontos: number;
  porTema: boolean;
  onDeNovo?: () => void;
  continuar?: { rotulo: string; acao: () => void };
}) {
  const certas = perguntas.map((p, i) => escolhas[i] === p.correta);
  const acertos = certas.filter(Boolean).length;
  const total = perguntas.length;
  const passou = passa === undefined || acertos >= passa;
  const fracao = acertos / total;
  const perfeito = acertos === total;
  const [mostrarCertas, setMostrarCertas] = useState(false);

  const titulo = perfeito
    ? "Rodada perfeita"
    : passa === undefined
      ? fracao >= 0.7
        ? "Bom treino"
        : "Rodada concluída"
      : passou
        ? "Nível vencido"
        : "Quase lá";

  const temas = porTema
    ? TEMAS.map((t) => {
        const dele = perguntas.map((p, i) => ({ p, ok: certas[i] })).filter((x) => x.p.tema === t.id);
        return { ...t, total: dele.length, acertos: dele.filter((x) => x.ok).length };
      }).filter((t) => t.total > 0)
    : [];

  // Circunferência do placar (r = 42).
  const volta = 2 * Math.PI * 42;

  return (
    <div className="quiz-resultado" style={{ "--game": cor } as React.CSSProperties}>
      <div className="quiz-resultado-topo">
        <div className="quiz-placar" role="img" aria-label={`${acertos} de ${total} certas`}>
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" className="quiz-placar-fundo" />
            <circle
              cx="50"
              cy="50"
              r="42"
              className="quiz-placar-valor"
              strokeDasharray={`${volta * fracao} ${volta}`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <span>
            <strong>{acertos}</strong>
            <small>de {total}</small>
          </span>
        </div>

        <div className="min-w-0">
          <p className="quiz-fim-titulo">{titulo}</p>
          <p className="body-muted">
            {passa !== undefined && !passou
              ? `Para vencer o nível são ${passa} certas. Leia a revisão abaixo e tente de novo: errar não tira nada.`
              : passa !== undefined
                ? "O próximo nível já está aberto na ilha."
                : "Veja abaixo o que errou e o porquê de cada resposta."}
          </p>
          <ul className="quiz-numeros">
            <li>
              <strong>{Math.round(fracao * 100)}%</strong> de acerto
            </li>
            <li className={pontos > 0 ? "is-pontos" : ""}>
              <strong>+{pontos}</strong> pontos
            </li>
            {passa !== undefined ? (
              <li>
                <strong>{passa}</strong> para vencer
              </li>
            ) : null}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {passou && continuar ? (
              <Button size="sm" onClick={continuar.acao}>
                {continuar.rotulo}
              </Button>
            ) : null}
            {onDeNovo ? (
              <Button size="sm" variant={passou && continuar ? "secondary" : "primary"} onClick={onDeNovo}>
                {passou ? "Jogar outra rodada" : "Tentar de novo"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {temas.length > 1 ? (
        <section className="quiz-temas" aria-label="Acertos por tema">
          {temas.map((t) => (
            <div key={t.id} className="quiz-tema">
              <span className="text-xs font-semibold text-heading">{t.label}</span>
              <span className="quiz-tema-barra">
                <span style={{ width: `${(t.acertos / t.total) * 100}%` }} />
              </span>
              <span className="text-2xs text-muted">
                {t.acertos}/{t.total}
              </span>
            </div>
          ))}
        </section>
      ) : null}

      <section className="quiz-revisao">
        <header className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="heading-md">Revisão</h3>
          {acertos > 0 && !perfeito ? (
            <button type="button" className="text-xs font-semibold text-muted hover:text-accent" onClick={() => setMostrarCertas((v) => !v)}>
              {mostrarCertas ? "Mostrar só as erradas" : `Mostrar também as ${acertos} certas`}
            </button>
          ) : null}
        </header>
        <ol>
          {perguntas.map((p, i) => {
            if (certas[i] && !mostrarCertas && !perfeito) return null;
            const sua = p.alternativas[escolhas[i]];
            return (
              <li key={p.id} className={cn("quiz-revisao-item", certas[i] ? "is-certa" : "is-errada")}>
                <span className="quiz-revisao-marca" aria-label={certas[i] ? "Certa" : "Errada"}>
                  {certas[i] ? <IconeFeito className="h-3.5 w-3.5" /> : "×"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-heading">
                    {i + 1}. {p.enunciado}
                  </p>
                  {certas[i] ? (
                    <p className="mt-1 text-xs text-muted">
                      Sua resposta: <span className="font-semibold text-fg">{sua}</span>
                    </p>
                  ) : (
                    <>
                      <p className="mt-1 text-xs text-muted">
                        Você marcou: <span className="quiz-revisao-errada">{sua}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        Certa: <span className="quiz-revisao-certa">{p.alternativas[p.correta]}</span>
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-fg/85">{p.porque}</p>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

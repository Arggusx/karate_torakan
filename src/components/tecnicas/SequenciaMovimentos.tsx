"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { acharTecnica } from "@/services/dataService";
import type { MovimentoKata } from "@/types";

/** Quantos movimentos ficam à mostra antes de expandir. */
const PREVIA = 5;

/**
 * A sequência completa do kata, em tabela, com prévia e expansão animada.
 *
 * Recolher tudo enterrava a informação principal da página; mostrar tudo
 * tomava a tela inteira (o Kanku Dai tem 65 linhas). A prévia resolve os dois:
 * as primeiras linhas ficam legíveis e o resto abre quando o aluno quiser.
 *
 * A altura é medida e animada em pixel em vez de `max-height` chutado — com um
 * valor fixo a transição fica lenta no começo e brusca no fim, porque o navegador
 * interpola até um limite que o conteúdo nunca alcança.
 */
export function SequenciaMovimentos({
  movimentos,
}: {
  movimentos: MovimentoKata[];
}) {
  const [aberto, setAberto] = useState(false);
  const [altura, setAltura] = useState<number>();
  const caixa = useRef<HTMLDivElement>(null);
  const tabela = useRef<HTMLTableElement>(null);

  const temMais = movimentos.length > PREVIA;

  useEffect(() => {
    const t = tabela.current;
    if (!t) return;

    function medir() {
      if (!t) return;
      if (aberto || !temMais) {
        setAltura(t.scrollHeight);
        return;
      }
      // Altura do cabeçalho mais as primeiras linhas.
      const cabecalho = t.tHead?.offsetHeight ?? 0;
      const linhas = [...(t.tBodies[0]?.rows ?? [])].slice(0, PREVIA);
      const corpo = linhas.reduce((soma, linha) => soma + linha.offsetHeight, 0);
      setAltura(cabecalho + corpo);
    }

    medir();
    // A altura das linhas muda quando o texto reflui na troca de largura.
    const observador = new ResizeObserver(medir);
    observador.observe(t);
    return () => observador.disconnect();
  }, [aberto, temMais, movimentos.length]);

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <h2 className="heading-md">Sequência de movimentos</h2>
        <span className="text-2xs tabular-nums text-subtle">
          {movimentos.length} movimentos
        </span>
      </div>

      <div className="relative">
        <div
          ref={caixa}
          style={{ height: altura }}
          className="overflow-hidden transition-[height] duration-500 ease-in-out motion-reduce:transition-none"
        >
          <div className="overflow-x-auto">
            <table
              ref={tabela}
              className="w-full min-w-[680px] border-collapse text-left"
            >
              <thead>
                <tr className="border-b border-line bg-elevated">
                  <th className="w-12 px-3 py-2 text-2xs font-medium uppercase tracking-[0.08em] text-muted">
                    Nº
                  </th>
                  <th className="w-1/4 px-3 py-2 text-2xs font-medium uppercase tracking-[0.08em] text-muted">
                    Técnica
                  </th>
                  <th className="px-3 py-2 text-2xs font-medium uppercase tracking-[0.08em] text-muted">
                    Tradução / Explicação
                  </th>
                  <th className="w-1/3 px-3 py-2 text-2xs font-medium uppercase tracking-[0.08em] text-muted">
                    Direção / Base
                  </th>
                </tr>
              </thead>
              <tbody>
                {movimentos.map((movimento) => {
                  const ficha = acharTecnica(movimento.tecnica);
                  return (
                    <tr
                      key={`${movimento.numero}${movimento.fases ?? ""}`}
                      className="border-b border-line align-top last:border-0 hover:bg-elevated/60"
                    >
                      <td className="px-3 py-2 text-2xs font-medium tabular-nums text-accent">
                        {movimento.numero}
                        {movimento.fases ? (
                          <span className="text-subtle">{movimento.fases}</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-xs font-medium text-fg">
                        {ficha ? (
                          <Link
                            href={`/estudos/tecnicas#${encodeURIComponent(ficha.nome)}`}
                            className="underline decoration-line-strong underline-offset-2 transition-colors hover:text-accent hover:decoration-accent"
                          >
                            {movimento.tecnica}
                          </Link>
                        ) : (
                          movimento.tecnica
                        )}
                        {movimento.kiai ? (
                          <span className="ml-1.5 rounded-full border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                            KIAI
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-xs leading-relaxed text-fg/85">
                        {movimento.traducao}
                      </td>
                      <td className="px-3 py-2 text-xs leading-relaxed text-muted">
                        {movimento.direcao ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/*
          Véu que esmaece a última linha da prévia. É o que faz o corte parecer
          "tem mais adiante" em vez de "a tabela acabou aqui".
        */}
        {temMais && !aberto ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface to-transparent"
          />
        ) : null}
      </div>

      {temMais ? (
        <div className="border-t border-line">
          <button
            type="button"
            onClick={() => setAberto((a) => !a)}
            aria-expanded={aberto}
            className="flex w-full items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-accent transition-colors hover:bg-elevated"
          >
            {aberto
              ? "Recolher"
              : `Ver os ${movimentos.length} movimentos`}
            <span
              aria-hidden
              className={`text-2xs transition-transform duration-300 ${aberto ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>
        </div>
      ) : null}
    </section>
  );
}

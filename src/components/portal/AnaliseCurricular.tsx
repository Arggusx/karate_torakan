"use client";

import { useEffect, useMemo, useState } from "react";
import { Expandir } from "@/components/ui/Expandir";
import { getGraduacoes } from "@/services/dataService";
import { cn } from "@/lib/cn";

const GRADUACOES = getGraduacoes();

interface ItemHistorico {
  faixa_alvo: string;
  tipo: string;
  item: string;
  concluido_em: string;
}

interface Curriculo {
  faixaAtual: string | null;
  desde: string | null;
  historico: ItemHistorico[];
}

/** Situação de uma faixa na trajetória do aluno. */
type Situacao = "concluida" | "atual" | "futura";

/**
 * Análise curricular — as faixas como períodos de uma faculdade.
 *
 * Cada graduação vira um período com um dropdown: dentro dele, todo o kihon e
 * os katas que aquela faixa exige, marcando o que o professor já validou. A
 * faixa atual é o período em curso; as anteriores aparecem concluídas; as
 * seguintes, como o que vem pela frente.
 *
 * Nota honesta: o sistema ainda não guarda a nota do exame de faixa, só quais
 * itens foram validados. Então aqui mostramos o cumprimento do programa, não um
 * boletim — e dizemos isso em vez de inventar uma nota.
 */
export function AnaliseCurricular() {
  const [dados, setDados] = useState<Curriculo | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/conta/curriculo", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.erro) setErro(d.erro);
        else setDados(d);
      })
      .catch(() => setErro("Falha ao carregar a análise curricular."));
  }, []);

  // Índice da faixa atual na série, para classificar cada período.
  const indiceAtual = useMemo(() => {
    if (!dados?.faixaAtual) return -1;
    const alvo = dados.faixaAtual.toLowerCase();
    return GRADUACOES.findIndex((g) =>
      alvo.includes(g.faixa.toLowerCase()),
    );
  }, [dados]);

  // Agrupa o histórico por faixa_alvo e tipo, para checar cada item depressa.
  const concluidosPorFaixa = useMemo(() => {
    const mapa = new Map<string, Set<string>>();
    for (const linha of dados?.historico ?? []) {
      const chave = normalizar(linha.faixa_alvo);
      if (!mapa.has(chave)) mapa.set(chave, new Set());
      mapa.get(chave)!.add(normalizar(linha.item));
    }
    return mapa;
  }, [dados]);

  if (erro) {
    return (
      <div className="card px-4 py-6 text-center">
        <p className="text-xs text-status-bad">{erro}</p>
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="card px-4 py-6 text-center">
        <p className="text-xs text-muted">Carregando sua trajetória…</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h2 className="heading-md">Sua trajetória, faixa a faixa</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Como os períodos de uma faculdade, cada faixa reúne o kihon e os katas
          que você precisa treinar nela. Abra uma faixa para ver o programa e o
          que já foi validado pelo professor. O sistema registra os itens
          cumpridos, não a nota do exame.
        </p>
      </div>

      <ol className="space-y-2">
        {GRADUACOES.map((grad, indice) => {
          const situacao: Situacao =
            indiceAtual === -1
              ? "futura"
              : indice < indiceAtual
                ? "concluida"
                : indice === indiceAtual
                  ? "atual"
                  : "futura";

          const chave = normalizar(grad.faixa);
          const feitos = concluidosPorFaixa.get(chave) ?? new Set<string>();
          const programa = [
            ...grad.kihonExigido.map((item) => ({ tipo: "Kihon", item })),
            ...grad.katasExigidos.map((item) => ({ tipo: "Kata", item })),
          ];
          const totalFeitos = programa.filter((p) =>
            feitos.has(normalizar(p.item)),
          ).length;

          return (
            <li key={grad.id}>
              <Periodo
                grad={grad}
                situacao={situacao}
                ordem={indice + 1}
                programa={programa}
                feitos={feitos}
                totalFeitos={totalFeitos}
                total={programa.length}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Periodo({
  grad,
  situacao,
  ordem,
  programa,
  feitos,
  totalFeitos,
  total,
}: {
  grad: (typeof GRADUACOES)[number];
  situacao: Situacao;
  ordem: number;
  programa: { tipo: string; item: string }[];
  feitos: Set<string>;
  totalFeitos: number;
  total: number;
}) {
  const [aberto, setAberto] = useState(situacao === "atual");

  const rotuloSituacao =
    situacao === "concluida"
      ? "Concluída"
      : situacao === "atual"
        ? "Em curso"
        : "A caminho";

  const corSituacao =
    situacao === "concluida"
      ? "text-status-ok"
      : situacao === "atual"
        ? "text-accent"
        : "text-subtle";

  return (
    <article
      className={cn(
        "card overflow-hidden",
        situacao === "atual" && "border-accent/50 ring-1 ring-accent/15",
      )}
    >
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-elevated"
      >
        <span className="text-2xs font-semibold tabular-nums text-subtle">
          {String(ordem).padStart(2, "0")}
        </span>
        <span
          aria-hidden
          className="h-7 w-2 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
          style={{ backgroundColor: grad.cor }}
        />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-fg">
              {grad.faixa}
            </span>
            <span className="font-kanji text-xs text-subtle">{grad.jp}</span>
            <span className="text-2xs uppercase tracking-[0.06em] text-accent">
              {grad.grau}
            </span>
          </span>
          <span className="mt-0.5 block text-2xs text-muted">
            {total > 0
              ? `${totalFeitos} de ${total} itens do programa validados`
              : "Programa desta faixa não mapeado"}
          </span>
        </span>
        <span
          className={cn("shrink-0 text-2xs font-medium", corSituacao)}
        >
          {rotuloSituacao}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "shrink-0 text-subtle transition-transform duration-200",
            aberto && "rotate-180",
          )}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <Expandir aberto={aberto}>
        <div className="border-t border-line">
          {/* Barra de progresso do período */}
          {total > 0 ? (
            <div className="px-4 pt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${(totalFeitos / total) * 100}%` }}
                />
              </div>
            </div>
          ) : null}

          {programa.length === 0 ? (
            <p className="px-4 py-4 text-xs text-subtle">
              O programa técnico desta faixa ainda não foi cadastrado no acervo.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {programa.map((p) => {
                const feito = feitos.has(normalizar(p.item));
                return (
                  <li
                    key={p.tipo + p.item}
                    className="flex items-center gap-3 px-4 py-2.5"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                        feito
                          ? "border-status-ok bg-status-ok/15 text-status-ok"
                          : "border-line text-transparent",
                      )}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    <span className="flex-1 text-xs text-fg/85">{p.item}</span>
                    <span className="chip shrink-0">{p.tipo}</span>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Resultado do exame — honesto sobre o que o sistema guarda hoje */}
          <div className="border-t border-line bg-elevated/40 px-4 py-2.5">
            <p className="text-2xs text-subtle">
              {situacao === "concluida"
                ? "Exame concluído — você graduou a partir desta faixa. A nota detalhada do exame ainda não é registrada no sistema."
                : situacao === "atual"
                  ? "Exame em preparação. Complete o programa acima para ficar apto."
                  : "Faixa ainda não iniciada."}
            </p>
          </div>
        </div>
      </Expandir>
    </article>
  );
}

/** Sem acento, minúsculas, sem espaço extra: casa itens escritos diferente. */
function normalizar(valor: string): string {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

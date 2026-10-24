"use client";

import { useState } from "react";
import { Expandir } from "@/components/ui/Expandir";
import { cn } from "@/lib/cn";
import type { AulaPlano } from "@/types";

/**
 * Plano de aulas da semana como um dropdown por dia, um ao lado do outro.
 *
 * Era uma lista chapada com todos os dias abertos ao mesmo tempo, enchendo a
 * tela. Agora cada dia é uma coluna com cabeçalho clicável (o dia e o foco
 * ficam à mostra mesmo fechado, para o card não parecer vazio); clicar abre o
 * conteúdo daquela aula. No desktop as colunas ficam lado a lado; no celular
 * empilham, uma por linha.
 *
 * O mesmo componente serve ao card de turma do professor/admin e ao quadro de
 * horários do aluno — eram duas renderizações diferentes do mesmo dado.
 */
export function PlanoSemanal({
  plano,
  horario,
  vazio = "Nenhuma aula planejada.",
}: {
  plano: AulaPlano[];
  /** "19:30 às 20:30", mostrado sob o dia quando informado. */
  horario?: string;
  vazio?: string;
}) {
  if (plano.length === 0) {
    return <p className="px-4 py-3 text-xs text-subtle">{vazio}</p>;
  }

  // Até 3 dias cabem lado a lado; com mais, cai para 2 colunas e quebra.
  const colunas =
    plano.length >= 3
      ? "sm:grid-cols-3"
      : plano.length === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-1";

  return (
    <div className={cn("grid grid-cols-1 gap-2 p-3", colunas)}>
      {plano.map((aula) => (
        <DiaDropdown key={aula.dia + aula.foco} aula={aula} horario={horario} />
      ))}
    </div>
  );
}

function DiaDropdown({
  aula,
  horario,
}: {
  aula: AulaPlano;
  horario?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const itens = aula.conteudo.filter(Boolean);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border transition-colors",
        aberto ? "border-accent/50 bg-elevated/40" : "border-line",
      )}
    >
      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        className="flex w-full items-start justify-between gap-2 px-3 py-2.5 text-left transition-colors hover:bg-elevated"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-fg">
            {aula.dia}
            {horario ? (
              <span className="ml-1.5 text-2xs font-normal text-subtle">
                {horario}
              </span>
            ) : null}
          </span>
          <span className="mt-0.5 block truncate text-2xs font-medium text-accent">
            {aula.foco}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          <span className="text-2xs tabular-nums text-subtle">
            {itens.length}
          </span>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "text-subtle transition-transform duration-200",
              aberto && "rotate-180",
            )}
            aria-hidden
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </button>

      <Expandir aberto={aberto}>
        <ul className="space-y-1.5 border-t border-line px-3 py-2.5">
          {itens.length === 0 ? (
            <li className="text-2xs text-subtle">Sem conteúdo definido.</li>
          ) : (
            itens.map((item) => (
              <li
                key={item}
                className="flex gap-2 text-xs leading-relaxed text-fg/85"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))
          )}
        </ul>
      </Expandir>
    </div>
  );
}

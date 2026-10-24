"use client";

import { useState } from "react";
import { CampoBusca } from "@/components/portal/CampoBusca";
import { DiarioPanel } from "@/components/portal/DiarioPanel";
import { FinanceiroPanel } from "@/components/portal/FinanceiroPanel";
import { SegmentedControl } from "@/components/ui/Tabs";
import { useAcademia } from "@/lib/academiaStore";

/**
 * Alunos — a tela única que juntou o Diário de Classe e o Financeiro.
 *
 * As duas olham para a mesma lista de alunos; a diferença é o que se faz com
 * ela (marcar presença ou dar baixa em mensalidade). Então os filtros — busca,
 * turma e dia da aula — ficam aqui em cima, valem para as duas, e a escolha
 * entre "Chamada" e "Mensalidades" é só um segmento que troca a ação.
 *
 * O filtro por dia era um pedido direto: "filtro terça — vieram esses alunos
 * na terça". Ele casa o dia escolhido com os dias da turma de cada aluno.
 */

const MODOS = [
  { value: "chamada" as const, label: "Chamada" },
  { value: "mensalidades" as const, label: "Mensalidades" },
];

const DIAS = [
  { value: "todos", label: "Todos os dias" },
  { value: "Segunda", label: "Segunda" },
  { value: "Terça", label: "Terça" },
  { value: "Quarta", label: "Quarta" },
  { value: "Quinta", label: "Quinta" },
  { value: "Sexta", label: "Sexta" },
  { value: "Sábado", label: "Sábado" },
];

export function AlunosPanel() {
  const { turmas } = useAcademia();
  const [modo, setModo] = useState<"chamada" | "mensalidades">("chamada");
  const [busca, setBusca] = useState("");
  const [turmaFiltro, setTurmaFiltro] = useState("todas");
  const [diaFiltro, setDiaFiltro] = useState("todos");

  return (
    <div className="space-y-4">
      {/* Barra de filtros comum às duas visões */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <SegmentedControl options={MODOS} value={modo} onChange={setModo} />

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <CampoBusca
            id="busca-alunos"
            valor={busca}
            onChange={setBusca}
            placeholder="Buscar aluno por nome ou usuário"
            className="sm:w-60"
          />
          <select
            aria-label="Filtrar por turma"
            className="input sm:w-44"
            value={turmaFiltro}
            onChange={(event) => setTurmaFiltro(event.target.value)}
          >
            <option value="todas">Todas as turmas</option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                Turma {turma.nome}
              </option>
            ))}
          </select>
          <select
            aria-label="Filtrar por dia da semana"
            className="input sm:w-40"
            value={diaFiltro}
            onChange={(event) => setDiaFiltro(event.target.value)}
          >
            {DIAS.map((dia) => (
              <option key={dia.value} value={dia.value}>
                {dia.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {modo === "chamada" ? (
        <DiarioPanel
          busca={busca}
          turmaFiltro={turmaFiltro}
          diaFiltro={diaFiltro}
        />
      ) : (
        <FinanceiroPanel
          busca={busca}
          turmaFiltro={turmaFiltro}
          diaFiltro={diaFiltro}
        />
      )}
    </div>
  );
}

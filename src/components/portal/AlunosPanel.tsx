"use client";

import { useMemo, useState } from "react";
import { CampoBusca } from "@/components/portal/CampoBusca";
import { DiarioPanel } from "@/components/portal/DiarioPanel";
import { FinanceiroPanel } from "@/components/portal/FinanceiroPanel";
import { PainelFiltros, type ValoresFiltro } from "@/components/ui/PainelFiltros";
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

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export function AlunosPanel() {
  const { turmas } = useAcademia();
  const [modo, setModo] = useState<"chamada" | "mensalidades">("chamada");
  const [busca, setBusca] = useState("");
  // Turma e dia ficam no botão "Filtros"; a busca continua à vista.
  const [filtros, setFiltros] = useState<ValoresFiltro>({ turma: null, dia: null });
  const turmaFiltro = filtros.turma ?? "todas";
  const diaFiltro = filtros.dia ?? "todos";

  const grupos = useMemo(
    () => [
      { id: "turma", rotulo: "Turma", opcoes: turmas.map((t) => ({ id: t.id, rotulo: `Turma ${t.nome}` })) },
      { id: "dia", rotulo: "Dia da aula", opcoes: DIAS.map((d) => ({ id: d, rotulo: d })) },
    ],
    [turmas],
  );

  return (
    <div className="space-y-4">
      {/* Filtros comuns às duas visões: a busca à vista, turma e dia no botão "Filtros". */}
      <div className="flex flex-col items-start gap-3">
        <SegmentedControl options={MODOS} value={modo} onChange={setModo} />

        <PainelFiltros
          grupos={grupos}
          valores={filtros}
          onAplicar={setFiltros}
          antes={
            <CampoBusca
              id="busca-alunos"
              valor={busca}
              onChange={setBusca}
              placeholder="Buscar aluno por nome ou usuário"
              className="w-full sm:w-64"
            />
          }
        />
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

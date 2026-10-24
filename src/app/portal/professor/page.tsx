"use client";

import { useState } from "react";
import { AlunosPanel } from "@/components/portal/AlunosPanel";
import { CadastroAlunoPanel } from "@/components/portal/CadastroAlunoPanel";
import { GuardaPortal } from "@/components/portal/GuardaPortal";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { NavPortal, type ItemNav } from "@/components/portal/NavPortal";
import { RodapePortal } from "@/components/portal/RodapePortal";
import { TurmasPanel } from "@/components/portal/TurmasPanel";
import { Badge } from "@/components/ui/Badge";
import { useAcademia } from "@/lib/academiaStore";

type Aba = "turmas" | "alunos" | "cadastro";

const ITENS: ItemNav<Aba>[] = [
  { value: "turmas", label: "Turmas", icone: "turmas" },
  { value: "alunos", label: "Alunos", icone: "alunos" },
  { value: "cadastro", label: "Cadastrar aluno", curto: "Novo", icone: "cadastro" },
];

export default function PortalProfessorPage() {
  return (
    <GuardaPortal perfis={["professor"]}>
      <ConteudoProfessor />
    </GuardaPortal>
  );
}

function ConteudoProfessor() {
  const { professores, sessao } = useAcademia();
  const [aba, setAba] = useState<Aba>("turmas");

  const professor = professores.find((item) => item.id === sessao?.id);

  return (
    <NavPortal
      itens={ITENS}
      valor={aba}
      onChange={setAba}
      titulo="Portal do Professor"
      rodape={<RodapePortal />}
    >
      <HeroPagina
        compacto
        sobretitulo="Portal do Professor"
        titulo={professor?.nome ?? sessao?.nome ?? ""}
        descricao="Turmas, plano de aulas, chamada, mensalidades e cadastro de alunos."
        imagem="/imagens/dojo.jpg"
        acao={
          professor ? (
            <Badge tone="accent">{professor.graduacao}</Badge>
          ) : undefined
        }
      />

      <div className="section space-y-4 py-6">
        {aba === "turmas" ? (
          <TurmasPanel />
        ) : aba === "alunos" ? (
          <AlunosPanel />
        ) : (
          <CadastroAlunoPanel />
        )}
      </div>
    </NavPortal>
  );
}

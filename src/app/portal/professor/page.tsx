"use client";

import { useEffect, useState } from "react";
import { AlunosPanel } from "@/components/portal/AlunosPanel";
import { CadastroAlunoPanel } from "@/components/portal/CadastroAlunoPanel";
import { GuardaPortal } from "@/components/portal/GuardaPortal";
import { MinhaConta } from "@/components/portal/MinhaConta";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { NavPortal, type ItemNav } from "@/components/portal/NavPortal";
import { ProvasEquipePanel } from "@/components/portal/ProvasEquipePanel";
import { RodapePortal } from "@/components/portal/RodapePortal";
import { TurmasPanel } from "@/components/portal/TurmasPanel";
import { Badge } from "@/components/ui/Badge";
import { useAcademia } from "@/lib/academiaStore";

type Aba = "turmas" | "alunos" | "provas" | "cadastro" | "conta";

const ITENS: ItemNav<Aba>[] = [
  { value: "turmas", label: "Turmas", icone: "turmas" },
  { value: "alunos", label: "Alunos", icone: "alunos" },
  { value: "provas", label: "Provas", icone: "prova" },
  { value: "cadastro", label: "Cadastrar aluno", curto: "Novo", icone: "cadastro" },
  { value: "conta", label: "Minha conta", curto: "Conta", icone: "perfil" },
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

  // ?aba=conta abre direto numa aba — é para onde o Google devolve depois de
  // vincular. Lido pelo window para não exigir Suspense.
  useEffect(() => {
    const pedida = new URLSearchParams(window.location.search).get("aba");
    if (pedida && ITENS.some((item) => item.value === pedida)) setAba(pedida as Aba);
  }, []);

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
        descricao="Turmas, plano de aulas, chamada, mensalidades, provas e cadastro de alunos."
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
        ) : aba === "provas" ? (
          <ProvasEquipePanel />
        ) : aba === "conta" ? (
          <MinhaConta volta="/portal/professor?aba=conta" />
        ) : (
          <CadastroAlunoPanel />
        )}
      </div>
    </NavPortal>
  );
}

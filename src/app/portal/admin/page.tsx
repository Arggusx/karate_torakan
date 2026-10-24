"use client";

import { useState } from "react";
import { AlunosPanel } from "@/components/portal/AlunosPanel";
import { GuardaPortal } from "@/components/portal/GuardaPortal";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { NavPortal, type ItemNav } from "@/components/portal/NavPortal";
import { ProfessoresPanel } from "@/components/portal/ProfessoresPanel";
import { RodapePortal } from "@/components/portal/RodapePortal";
import { TurmasPanel } from "@/components/portal/TurmasPanel";
import { Badge } from "@/components/ui/Badge";

type Aba = "turmas" | "alunos" | "professores";

const ITENS: ItemNav<Aba>[] = [
  { value: "turmas", label: "Turmas", icone: "turmas" },
  { value: "alunos", label: "Alunos", icone: "alunos" },
  { value: "professores", label: "Professores", curto: "Equipe", icone: "professores" },
];

export default function PortalAdminPage() {
  return (
    <GuardaPortal perfis={["admin"]}>
      <ConteudoAdmin />
    </GuardaPortal>
  );
}

function ConteudoAdmin() {
  const [aba, setAba] = useState<Aba>("turmas");

  return (
    <NavPortal
      itens={ITENS}
      valor={aba}
      onChange={setAba}
      titulo="Portal do Admin"
      rodape={<RodapePortal />}
    >
      <HeroPagina
        compacto
        sobretitulo="Portal do Admin"
        titulo="Administração do dojo"
        descricao="Turmas, chamada e mensalidades num só lugar, mais o cadastro de professores e alunos."
        imagem="/imagens/dojo.jpg"
        acao={<Badge tone="accent">Acesso total</Badge>}
      />

      <div className="section space-y-4 py-6">
        {aba === "turmas" ? (
          <TurmasPanel />
        ) : aba === "alunos" ? (
          <AlunosPanel />
        ) : (
          <ProfessoresPanel />
        )}
      </div>
    </NavPortal>
  );
}

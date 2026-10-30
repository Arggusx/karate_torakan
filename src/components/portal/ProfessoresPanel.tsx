"use client";

import { useEffect, useMemo, useState } from "react";
import { CadastroAlunoPanel } from "@/components/portal/CadastroAlunoPanel";
import { CadastroProfessorPanel } from "@/components/portal/CadastroProfessorPanel";
import { CampoBusca, paraBusca } from "@/components/portal/CampoBusca";
import { ProfessorDetalheModal } from "@/components/portal/DetalheModal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Paginacao } from "@/components/ui/Paginacao";
import { useAcademia } from "@/lib/academiaStore";
import { horarioDaTurma } from "@/services/dataService";
import { AvatarMini } from "@/components/portal/AvatarMini";
import type { Professor } from "@/types";

const POR_PAGINA = 8;

/** Qual formulário de cadastro está aberto — nenhum, por padrão. */
type Cadastro = "nenhum" | "professor" | "aluno";

/**
 * Professores — a lista do corpo docente com suas turmas.
 *
 * O cadastro deixou de ser um cartão sempre visível no fim da página: agora os
 * botões "Cadastrar professor" e "Cadastrar aluno" revelam o formulário certo,
 * e ele some de novo quando o cadastro termina. Era o pedido — a tela de
 * gestão não precisa carregar o formulário inteiro o tempo todo.
 */
export function ProfessoresPanel() {
  const { professores, turmas, alunosDaTurma } = useAcademia();
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [emDetalhe, setEmDetalhe] = useState<Professor | null>(null);
  const [cadastro, setCadastro] = useState<Cadastro>("nenhum");

  const filtrados = useMemo(() => {
    const alvo = paraBusca(busca.trim());
    if (!alvo) return professores;
    return professores.filter(
      (professor) =>
        paraBusca(professor.nome).includes(alvo) ||
        paraBusca(professor.usuario).includes(alvo),
    );
  }, [professores, busca]);

  useEffect(() => setPagina(1), [busca]);

  const visiveis = filtrados.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

  return (
    <div className="space-y-4">
      {/* Ações de cadastro + busca */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={cadastro === "professor" ? "primary" : "secondary"}
            onClick={() =>
              setCadastro((atual) =>
                atual === "professor" ? "nenhum" : "professor",
              )
            }
          >
            + Cadastrar professor
          </Button>
          <Button
            size="sm"
            variant={cadastro === "aluno" ? "primary" : "secondary"}
            onClick={() =>
              setCadastro((atual) => (atual === "aluno" ? "nenhum" : "aluno"))
            }
          >
            + Cadastrar aluno
          </Button>
        </div>
        <CampoBusca
          id="busca-professor"
          valor={busca}
          onChange={setBusca}
          placeholder="Buscar professor por nome ou usuário"
          className="w-full sm:max-w-xs"
        />
      </div>

      {/* Formulário revelado, com botão de fechar */}
      {cadastro !== "nenhum" ? (
        <div className="rounded-xl border border-dashed border-line-strong p-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-2xs font-semibold uppercase tracking-[0.1em] text-gold">
              {cadastro === "professor"
                ? "Novo professor"
                : "Novo aluno"}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setCadastro("nenhum")}
            >
              Fechar
            </Button>
          </div>
          {cadastro === "professor" ? (
            <CadastroProfessorPanel />
          ) : (
            <CadastroAlunoPanel />
          )}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <span className="text-2xs tabular-nums text-subtle">
          {filtrados.length} de {professores.length} professores
        </span>
      </div>

      {filtrados.length === 0 ? (
        <div className="card px-4 py-6 text-center">
          <p className="text-xs text-muted">
            Nenhum professor encontrado para “{busca}”.
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        {visiveis.map((professor) => {
          const doProfessor = turmas.filter(
            (turma) => turma.professorId === professor.id,
          );
          const totalAlunos = doProfessor.reduce(
            (total, turma) => total + alunosDaTurma(turma.id).length,
            0,
          );

          return (
            <article key={professor.id} className="card">
              <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
                <button
                  type="button"
                  onClick={() => setEmDetalhe(professor)}
                  className="flex items-center gap-3 text-left"
                >
                  <AvatarMini src={professor.avatarUrl} iniciais={professor.foto} tamanho="md" />
                  <div>
                    <h3 className="heading-md underline decoration-line underline-offset-4 hover:decoration-accent">
                      {professor.nome}
                    </h3>
                    <p className="text-2xs text-muted">{professor.email}</p>
                  </div>
                </button>
                <Badge tone="accent">{professor.graduacao}</Badge>
              </div>

              <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
                <div className="px-4 py-2.5">
                  <p className="label">No dojo desde</p>
                  <p className="mt-0.5 text-sm font-semibold text-fg">
                    {professor.desde}
                  </p>
                </div>
                <div className="px-4 py-2.5">
                  <p className="label">Turmas</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-fg">
                    {doProfessor.length}
                  </p>
                </div>
                <div className="px-4 py-2.5">
                  <p className="label">Alunos</p>
                  <p className="mt-0.5 text-sm font-semibold tabular-nums text-fg">
                    {totalAlunos}
                  </p>
                </div>
              </div>

              {doProfessor.length === 0 ? (
                <p className="px-4 py-3 text-xs text-subtle">
                  Nenhuma turma atribuída.
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {doProfessor.map((turma) => (
                    <li
                      key={turma.id}
                      className="flex items-center justify-between gap-3 px-4 py-2.5"
                    >
                      <span>
                        <span className="block text-xs font-medium text-fg">
                          Turma {turma.nome}
                        </span>
                        <span className="block text-2xs text-muted">
                          {horarioDaTurma(turma)} · {turma.faixaEtaria}
                        </span>
                      </span>
                      <span className="text-2xs tabular-nums text-subtle">
                        {alunosDaTurma(turma.id).length} alunos
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>

      <Paginacao
        total={filtrados.length}
        pagina={pagina}
        porPagina={POR_PAGINA}
        onPagina={setPagina}
        rotulo="professores"
      />

      <ProfessorDetalheModal
        professor={emDetalhe}
        onClose={() => setEmDetalhe(null)}
      />
    </div>
  );
}

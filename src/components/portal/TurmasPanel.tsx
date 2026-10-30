"use client";

import { useEffect, useMemo, useState } from "react";
import { AlunoCampo, AlunoCard } from "@/components/portal/AlunoCard";
import { CampoBusca, paraBusca } from "@/components/portal/CampoBusca";
import { AlunoDetalheModal } from "@/components/portal/DetalheModal";
import { PlanoSemanal } from "@/components/portal/PlanoSemanal";
import { SeletorTurma } from "@/components/portal/SeletorTurma";
import { TurmaFormModal } from "@/components/portal/TurmaFormModal";
import { Badge, BeltBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Paginacao } from "@/components/ui/Paginacao";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import { useAcademia } from "@/lib/academiaStore";
import { CRITERIO_TURMAS, horarioDaTurma } from "@/services/dataService";
import { AvatarMini } from "@/components/portal/AvatarMini";
import type { Aluno, Turma } from "@/types";

const POR_PAGINA = 8;

/** Turmas, plano de aulas e a tabela de alunos de cada uma. */
export function TurmasPanel() {
  const { turmas, alunosDaTurma, professorDaTurma, removerTurma } =
    useAcademia();
  const [emEdicao, setEmEdicao] = useState<Turma | null>(null);
  const [criando, setCriando] = useState(false);
  const [busca, setBusca] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted">{CRITERIO_TURMAS}</p>
        <div className="flex items-center gap-2">
          <CampoBusca
            id="busca-turmas"
            valor={busca}
            onChange={setBusca}
            className="w-full sm:w-64"
          />
          <Button size="sm" className="shrink-0" onClick={() => setCriando(true)}>
            + Nova turma
          </Button>
        </div>
      </div>

      {turmas.map((turma) => {
        const professor = professorDaTurma(turma.id);
        const matriculados = alunosDaTurma(turma.id);
        const frequencia = matriculados.length
          ? Math.round(
              matriculados.reduce(
                (total, aluno) => total + aluno.frequencia,
                0,
              ) / matriculados.length,
            )
          : null;

        return (
          <section key={turma.id} className="space-y-3">
            {/* Cabeçalho e plano de aulas */}
            <article className="card">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="heading-md">Turma {turma.nome}</h3>
                    <Badge>{turma.faixaEtaria}</Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {horarioDaTurma(turma)}
                  </p>
                  <p className="mt-0.5 text-2xs text-subtle">
                    {professor?.nome ?? "Sem professor"} · {turma.faixasTipicas}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEmEdicao(turma)}
                  >
                    Editar
                  </Button>
                  {turmas.length > 1 ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removerTurma(turma.id)}
                    >
                      Excluir
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-line border-b border-line">
                <div className="px-4 py-2.5">
                  <p className="label">Alunos</p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-fg">
                    {matriculados.length}
                  </p>
                </div>
                <div className="px-4 py-2.5">
                  <p className="label">Frequência média</p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-fg">
                    {frequencia !== null ? `${frequencia}%` : "—"}
                  </p>
                </div>
              </div>

              <PlanoSemanal
                plano={turma.plano}
                vazio="Nenhuma aula planejada. Use “Editar” para definir o conteúdo."
              />
            </article>

            <AlunosDaTurma alunos={matriculados} busca={busca} />
          </section>
        );
      })}

      <TurmaFormModal
        open={criando || emEdicao !== null}
        onClose={() => {
          setCriando(false);
          setEmEdicao(null);
        }}
        turma={emEdicao}
      />
    </div>
  );
}

/** Lista paginada dos alunos de uma turma, filtrada pela busca global. */
function AlunosDaTurma({ alunos, busca }: { alunos: Aluno[]; busca: string }) {
  const [pagina, setPagina] = useState(1);
  const [emDetalhe, setEmDetalhe] = useState<Aluno | null>(null);

  const filtrados = useMemo(() => {
    const alvo = paraBusca(busca.trim());
    if (!alvo) return alunos;
    return alunos.filter(
      (aluno) =>
        paraBusca(aluno.nome).includes(alvo) ||
        paraBusca(aluno.usuario).includes(alvo),
    );
  }, [alunos, busca]);

  // Buscar de novo recomeça na primeira página.
  useEffect(() => setPagina(1), [busca]);

  const visiveis = filtrados.slice(
    (pagina - 1) * POR_PAGINA,
    pagina * POR_PAGINA,
  );

  if (alunos.length === 0) {
    return (
      <div className="card px-4 py-6 text-center">
        <p className="text-xs text-muted">
          Nenhum aluno matriculado nesta turma.
        </p>
      </div>
    );
  }

  if (filtrados.length === 0) {
    return (
      <div className="card px-4 py-6 text-center">
        <p className="text-xs text-muted">
          Nenhum aluno desta turma corresponde à busca.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: um card por aluno, expansível */}
      <div className="space-y-2 sm:hidden">
        {visiveis.map((aluno) => (
          <AlunoCard
            key={aluno.id}
            aluno={aluno}
            onDetalhe={() => setEmDetalhe(aluno)}
          >
            <AlunoCampo rotulo="Idade">{aluno.idade} anos</AlunoCampo>
            <AlunoCampo rotulo="Usuário">
              <span className="font-mono">{aluno.usuario}</span>
            </AlunoCampo>
            <AlunoCampo rotulo="Faixa">
              <BeltBadge cor={aluno.corFaixa}>{aluno.faixa}</BeltBadge>
            </AlunoCampo>
            <AlunoCampo rotulo="Frequência">
              <span className="tabular-nums">{aluno.frequencia}%</span>
            </AlunoCampo>
            <AlunoCampo rotulo="Próximo exame">{aluno.proximoExame}</AlunoCampo>
            <AlunoCampo rotulo="Pagamento">
              <StatusBadge status={aluno.status} />
            </AlunoCampo>
            <AlunoCampo rotulo="Turma">
              <SeletorTurma aluno={aluno} />
            </AlunoCampo>
          </AlunoCard>
        ))}
      </div>

      {/* Desktop: tabela completa */}
      <div className="hidden sm:block">
        <Table minWidth="min-w-[760px]">
          <THead>
            <TR>
              <TH>Aluno</TH>
              <TH>Faixa</TH>
              <TH className="text-right">Frequência</TH>
              <TH>Próximo exame</TH>
              <TH>Pagamento</TH>
              <TH>Mudar de turma</TH>
            </TR>
          </THead>
          <TBody>
            {visiveis.map((aluno) => (
              <TR key={aluno.id}>
                <TD>
                  {/* Só o nome abre a ficha: a linha tem um select de turma,
                      e linha inteira clicável engoliria esse clique. */}
                  <button
                    type="button"
                    onClick={() => setEmDetalhe(aluno)}
                    className="flex items-center gap-2.5 text-left"
                  >
                    <AvatarMini src={aluno.avatarUrl} iniciais={aluno.foto} />
                    <span>
                      <span className="block font-medium text-fg underline decoration-line underline-offset-4 hover:decoration-accent">
                        {aluno.nome}
                      </span>
                      <span className="block text-2xs text-subtle">
                        {aluno.idade} anos · {aluno.usuario}
                      </span>
                    </span>
                  </button>
                </TD>
                <TD>
                  <BeltBadge cor={aluno.corFaixa}>{aluno.faixa}</BeltBadge>
                </TD>
                <TD className="text-right tabular-nums">{aluno.frequencia}%</TD>
                <TD className="whitespace-nowrap text-muted">
                  {aluno.proximoExame}
                </TD>
                <TD>
                  <StatusBadge status={aluno.status} />
                </TD>
                <TD>
                  <SeletorTurma aluno={aluno} />
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      <Paginacao
        total={filtrados.length}
        pagina={pagina}
        porPagina={POR_PAGINA}
        onPagina={setPagina}
        rotulo="alunos"
      />

      <AlunoDetalheModal
        aluno={emDetalhe}
        onClose={() => setEmDetalhe(null)}
      />
    </>
  );
}

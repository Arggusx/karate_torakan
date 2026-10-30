"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnaliseCurricular } from "@/components/portal/AnaliseCurricular";
import { AvatarPerfil } from "@/components/portal/AvatarPerfil";
import { CheckoutModal } from "@/components/portal/CheckoutModal";
import { GuardaPortal } from "@/components/portal/GuardaPortal";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { MinhaConta } from "@/components/portal/MinhaConta";
import { NavPortal, type ItemNav } from "@/components/portal/NavPortal";
import { PlanoSemanal } from "@/components/portal/PlanoSemanal";
import { ProvaPanel } from "@/components/portal/ProvaPanel";
import { RodapePortal } from "@/components/portal/RodapePortal";
import { Badge, BeltBadge, StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useAcademia } from "@/lib/academiaStore";
import {
  formatarReais,
  getGraduacoes,
  horarioDaTurma,
} from "@/services/dataService";

const GRADUACOES = getGraduacoes();

type Aba = "painel" | "provas" | "curriculo" | "conta";

const ITENS: ItemNav<Aba>[] = [
  { value: "painel", label: "Meu painel", curto: "Painel", icone: "inicio" },
  { value: "provas", label: "Provas", icone: "prova" },
  { value: "curriculo", label: "Análise curricular", curto: "Currículo", icone: "curriculo" },
  { value: "conta", label: "Minha conta", curto: "Conta", icone: "perfil" },
];

/** Descobre o programa de exame a partir da faixa do aluno ("Verde · 3º Kyu"). */
function programaDaFaixa(faixa: string) {
  return GRADUACOES.find((graduacao) =>
    faixa.toLowerCase().includes(graduacao.faixa.toLowerCase()),
  );
}

export default function PortalAlunoPage() {
  return (
    <GuardaPortal perfis={["aluno"]}>
      <ConteudoAluno />
    </GuardaPortal>
  );
}

function ConteudoAluno() {
  const { turmas, alunos, sessao, mensalidadeCentavos } = useAcademia();
  const [aba, setAba] = useState<Aba>("painel");

  // ?aba=conta abre direto numa aba — é para onde o Google devolve o aluno
  // depois de vincular. Lido pelo window para não exigir Suspense.
  useEffect(() => {
    const pedida = new URLSearchParams(window.location.search).get("aba");
    if (pedida && ITENS.some((item) => item.value === pedida)) setAba(pedida as Aba);
  }, []);
  const [checkoutAberto, setCheckoutAberto] = useState(false);

  const aluno = alunos.find((item) => item.id === sessao?.id);

  if (!aluno) {
    return (
      <div className="section py-10">
        <div className="card mx-auto max-w-md p-5 text-center">
          <h1 className="heading-md">Matrícula não encontrada</h1>
          <p className="body-muted mt-2">
            Esta conta não está mais vinculada a um aluno. Procure o professor.
          </p>
        </div>
      </div>
    );
  }

  const turma = turmas.find((item) => item.id === aluno.turmaId);
  const programa = programaDaFaixa(aluno.faixa);

  return (
    <NavPortal
      itens={ITENS}
      valor={aba}
      onChange={setAba}
      titulo="Portal do Aluno"
      rodape={<RodapePortal />}
    >
      <HeroPagina
        compacto
        sobretitulo="Portal do Aluno"
        titulo={`Olá, ${aluno.nome.split(" ")[0]}`}
        imagem="/imagens/faixa.jpg"
        acao={<StatusBadge status={aluno.status} />}
      />

      <div className="section space-y-4 py-6">
        {aba === "painel" ? (
          <PainelAluno
            aluno={aluno}
            turma={turma}
            programa={programa}
            mensalidadeCentavos={mensalidadeCentavos}
            onCheckout={() => setCheckoutAberto(true)}
          />
        ) : aba === "provas" ? (
          <ProvaPanel faixa={aluno.faixa} />
        ) : aba === "curriculo" ? (
          <AnaliseCurricular />
        ) : (
          <MinhaConta iniciais={aluno.foto} />
        )}
      </div>

      <CheckoutModal
        aberto={checkoutAberto}
        onClose={() => setCheckoutAberto(false)}
        usuario={aluno.usuario}
        valorCentavos={mensalidadeCentavos}
      />
    </NavPortal>
  );
}

function PainelAluno({
  aluno,
  turma,
  programa,
  mensalidadeCentavos,
  onCheckout,
}: {
  aluno: ReturnType<typeof useAcademia>["alunos"][number];
  turma: ReturnType<typeof useAcademia>["turmas"][number] | undefined;
  programa: (typeof GRADUACOES)[number] | undefined;
  mensalidadeCentavos: number;
  onCheckout: () => void;
}) {
  return (
    <>
      {/* Identificação e progresso */}
      <section className="card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <AvatarPerfil src={aluno.avatarUrl} iniciais={aluno.foto} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-fg">{aluno.nome}</h2>
              <BeltBadge cor={aluno.corFaixa}>{aluno.faixa}</BeltBadge>
              <Badge>Frequência {aluno.frequencia}%</Badge>
            </div>
            <p className="mt-1 text-xs text-muted">
              {aluno.idade} anos · Turma {turma?.nome ?? "não definida"}
            </p>

            <div className="mt-4">
              <div className="flex items-end justify-between gap-4">
                <p className="label">Progresso para o próximo exame</p>
                <p className="text-xs font-semibold tabular-nums text-fg">
                  {aluno.progresso}%
                </p>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-elevated">
                <div
                  className="h-full rounded-full bg-accent transition-all duration-500"
                  style={{ width: `${aluno.progresso}%` }}
                />
              </div>
              <p className="mt-1.5 text-2xs text-subtle">
                Próximo exame de graduação: {aluno.proximoExame}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quadro de horários */}
      {turma ? (
        <section className="card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
            <div>
              <h2 className="heading-md">Quadro de horários</h2>
              <p className="mt-0.5 text-xs text-muted">
                Turma {turma.nome} · {turma.faixaEtaria} ·{" "}
                {horarioDaTurma(turma)}
              </p>
            </div>
            <Badge tone="accent">
              {turma.inicio} às {turma.fim}
            </Badge>
          </div>

          <PlanoSemanal
            plano={turma.plano}
            horario={`${turma.inicio} às ${turma.fim}`}
          />

          <p className="border-t border-line px-4 py-2.5 text-2xs text-subtle">
            Faixas típicas da turma: {turma.faixasTipicas}. O conteúdo pode ser
            ajustado pelo professor a cada semana.
          </p>
        </section>
      ) : null}

      {/* Financeiro, programa e atalhos */}
      <section className="grid gap-3 lg:grid-cols-3">
        <div className="card">
          <div className="border-b border-line px-4 py-2.5">
            <h2 className="heading-md">Mensalidade</h2>
          </div>
          <div className="p-4">
            <p className="text-2xl font-semibold tabular-nums tracking-[-0.02em] text-fg">
              R$ {formatarReais(mensalidadeCentavos)}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Valor único · vence dia 10
            </p>
            <div className="mt-3">
              <StatusBadge status={aluno.status} />
            </div>
            <Button size="sm" className="mt-4 w-full" onClick={onCheckout}>
              Ir para o checkout
            </Button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <h2 className="heading-md">Programa da faixa atual</h2>
            <span className="text-2xs text-subtle">{programa?.grau}</span>
          </div>
          <ul className="divide-y divide-line">
            {[
              ...(programa?.katasExigidos ?? []),
              ...(programa?.kihonExigido ?? []),
            ].map((item) => (
              <li key={item} className="px-4 py-2 text-xs text-fg/85">
                {item}
              </li>
            ))}
          </ul>
          <div className="border-t border-line p-3">
            <ButtonLink
              href="/estudos/fundamentos"
              variant="secondary"
              size="sm"
              className="w-full"
            >
              Ver exigências completas
            </ButtonLink>
          </div>
        </div>

        <div className="card">
          <div className="border-b border-line px-4 py-2.5">
            <h2 className="heading-md">Continuar estudando</h2>
          </div>
          <ul className="divide-y divide-line">
            {[
              {
                href: "/estudos/tecnicas/kata/heian-yondan",
                label: "Kata Heian Yondan",
              },
              { href: "/estudos/tecnicas", label: "Kihon e tabelas de katas" },
              { href: "/estudos/historia", label: "Linhagem dos mestres" },
              { href: "/estudos/fundamentos", label: "Dojo Kun e princípios" },
            ].map((atalho) => (
              <li key={atalho.href}>
                <Link
                  href={atalho.href}
                  className="flex items-center justify-between px-4 py-2.5 text-xs text-fg/85 transition-colors hover:bg-elevated"
                >
                  {atalho.label}
                  <span className="text-subtle">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

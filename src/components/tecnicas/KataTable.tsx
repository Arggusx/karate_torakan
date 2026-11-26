"use client";

import Link from "next/link";
import { useState } from "react";
import { NivelTag } from "@/components/ui/Badge";
import { IconeFaixa } from "@/components/ui/IconeFaixa";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { rotaKata, type Idioma } from "@/i18n/idioma";
import { TEXTOS_TECNICAS } from "@/i18n/textos-tecnicas";
import { listarDestaques } from "@/services/dataService";
import type { KataCompleto } from "@/types";

export function KataTable({
  titulo,
  descricao,
  katas,
  idioma = "pt",
}: {
  titulo: string;
  descricao: string;
  katas: KataCompleto[];
  idioma?: Idioma;
}) {
  const t = TEXTOS_TECNICAS[idioma];
  const [aberto, setAberto] = useState<string | null>(null);

  if (katas.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="heading-md">{titulo}</h3>
          <p className="mt-0.5 text-xs text-muted">{descricao}</p>
        </div>
        <span className="text-2xs tabular-nums text-subtle">
          {t.nKatas(katas.length)}
        </span>
      </div>

      {/*
        Mobile: um card por kata, colapsado mostrando só nome e nível — o
        mesmo padrão das tabelas de aluno do portal. A tabela de sete colunas
        exige 1000px de largura e só faz sentido no desktop.
      */}
      <div className="space-y-2 sm:hidden">
        {katas.map((kata) => (
          <CardKata
            key={kata.id}
            kata={kata}
            idioma={idioma}
            aberto={aberto === kata.id}
            onAlternar={() => setAberto(aberto === kata.id ? null : kata.id)}
          />
        ))}
      </div>

      <div className="hidden sm:block">
        <Table minWidth="min-w-[1000px]">
          <THead>
            <TR>
              <TH>{t.colKata}</TH>
              <TH className="text-right">{t.colMov}</TH>
              <TH>{t.colNivel}</TH>
              <TH>{t.colSignificado}</TH>
              <TH>{t.colKiais}</TH>
              <TH>{t.colFaixa}</TH>
              <TH>{t.colDestaques}</TH>
            </TR>
          </THead>
          <TBody>
            {katas.map((kata) => (
              <TR key={kata.id}>
                <TD>
                  <Link
                    href={rotaKata(idioma, kata.id)}
                    className="font-medium text-fg hover:text-accent"
                  >
                    {kata.nome}
                  </Link>
                  {kata.kanji ? (
                    <span className="ml-1.5 font-kanji text-xs text-subtle">
                      {kata.kanji}
                    </span>
                  ) : null}
                </TD>
                <TD className="text-right tabular-nums">
                  {kata.quantidadeMovimentos}
                </TD>
                <TD>
                  <NivelTag nivel={kata.nivel}>
                    {kata.nivelDificuldade}
                  </NivelTag>
                </TD>
                <TD className="max-w-[220px] text-muted">
                  {kata.significadoNome}
                </TD>
                <TD className="whitespace-nowrap text-muted">
                  {kata.posicoesKiai}
                </TD>
                <TD>
                  <IconeFaixa cor={kata.corFaixa} nome={kata.faixaRecomendada} />
                </TD>
                <TD>
                  <div className="flex flex-wrap gap-1">
                    {listarDestaques(kata).map((destaque) => (
                      <span
                        key={destaque}
                        className="rounded border border-line bg-elevated px-1.5 py-0.5 text-2xs text-muted"
                      >
                        {destaque}
                      </span>
                    ))}
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>
    </section>
  );
}

/** Versão mobile: colapsado mostra nome, kanji e a tag de nível. */
function CardKata({
  kata,
  idioma,
  aberto,
  onAlternar,
}: {
  kata: KataCompleto;
  idioma: Idioma;
  aberto: boolean;
  onAlternar: () => void;
}) {
  return (
    <article className="card">
      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={aberto}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-fg">
            {kata.nome}
            {kata.kanji ? (
              <span className="ml-1.5 font-kanji text-xs font-normal text-subtle">
                {kata.kanji}
              </span>
            ) : null}
          </span>
        </span>
        <NivelTag nivel={kata.nivel}>{kata.nivelDificuldade}</NivelTag>
        <span
          aria-hidden
          className={cn(
            "shrink-0 text-2xs text-subtle transition-transform duration-200",
            aberto && "rotate-180",
          )}
        >
          ▾
        </span>
      </button>

      {aberto ? (
        <dl className="divide-y divide-line border-t border-line">
          <Campo rotulo={TEXTOS_TECNICAS[idioma].campoMovimentos}>
            <span className="tabular-nums">{kata.quantidadeMovimentos}</span>
          </Campo>
          <Campo rotulo={TEXTOS_TECNICAS[idioma].colSignificado}>{kata.significadoNome}</Campo>
          <Campo rotulo={TEXTOS_TECNICAS[idioma].colKiais}>{kata.posicoesKiai}</Campo>
          <Campo rotulo={TEXTOS_TECNICAS[idioma].colFaixa}>
            <IconeFaixa cor={kata.corFaixa} nome={kata.faixaRecomendada} />
          </Campo>
          <div className="px-3 py-2">
            <dt className="text-2xs uppercase tracking-[0.08em] text-muted">
              {TEXTOS_TECNICAS[idioma].colDestaques}
            </dt>
            <dd className="mt-1.5 flex flex-wrap gap-1">
              {listarDestaques(kata).map((destaque) => (
                <span
                  key={destaque}
                  className="rounded border border-line bg-elevated px-1.5 py-0.5 text-2xs text-muted"
                >
                  {destaque}
                </span>
              ))}
            </dd>
          </div>
          <div className="px-3 py-2.5">
            <Link
              href={rotaKata(idioma, kata.id)}
              className="text-xs font-medium text-accent"
            >
              {TEXTOS_TECNICAS[idioma].abrirFicha}
            </Link>
          </div>
        </dl>
      ) : null}
    </article>
  );
}

function Campo({
  rotulo,
  children,
}: {
  rotulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-3 py-2">
      <dt className="shrink-0 text-2xs uppercase tracking-[0.08em] text-muted">
        {rotulo}
      </dt>
      <dd className="text-right text-xs text-fg">{children}</dd>
    </div>
  );
}

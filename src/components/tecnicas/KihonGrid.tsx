"use client";

import { useMemo, useState } from "react";
import { ICONE_FAMILIA } from "@/components/tecnicas/IconesFamilia";
import {
  TecnicaDetalhe,
  TecnicaModal,
} from "@/components/tecnicas/TecnicaModal";
import { VerMais } from "@/components/ui/VerMais";
import type { Idioma } from "@/i18n/idioma";
import { CATEGORIAS_EN } from "@/i18n/tecnicas-en";
import { TEXTOS_TECNICAS } from "@/i18n/textos-tecnicas";
import { cn } from "@/lib/cn";
import { getCategoriasTecnicas } from "@/services/dataService";
import type { Tecnica } from "@/types";

const CATEGORIAS = getCategoriasTecnicas();

/**
 * `mostrarTudo` desliga o "Ver mais": quando se chega por um link para uma
 * técnica (#Gedan-Barai) ou numa busca, o card precisa estar na tela.
 */
export function KihonGrid({
  tecnicas,
  mostrarTudo = false,
  idioma = "pt",
}: {
  tecnicas: Tecnica[];
  mostrarTudo?: boolean;
  idioma?: Idioma;
}) {
  const t = TEXTOS_TECNICAS[idioma];
  const [selecionada, setSelecionada] = useState<Tecnica | null>(null);
  const [expandida, setExpandida] = useState<string | null>(null);

  /**
   * Agrupa por categoria mantendo a ordem do acervo (Socos, Chutes, Defesas,
   * Bases). Grupo vazio não é renderizado, então o filtro continua valendo:
   * filtrar por "Chutes" apenas deixa um grupo só na tela.
   */
  const grupos = useMemo(
    () =>
      CATEGORIAS.map((categoria) => ({
        categoria,
        itens: tecnicas.filter((tecnica) => tecnica.cat === categoria.id),
      })).filter((grupo) => grupo.itens.length > 0),
    [tecnicas],
  );

  if (tecnicas.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="body-muted">{t.nenhumaTecnica}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {grupos.map(({ categoria, itens }) => {
          const Icone = ICONE_FAMILIA[categoria.id];
          return (
            <section key={categoria.id}>
              <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-2">
                <h3 className="heading-lg flex items-center gap-3">
                  <span aria-hidden className="familia-selo">
                    {Icone ? (
                      <Icone className="h-8 w-8" />
                    ) : (
                      <span>{categoria.kanji.charAt(0)}</span>
                    )}
                  </span>
                  {idioma === "en" ? CATEGORIAS_EN[categoria.id] ?? categoria.label : categoria.label}
                </h3>
                <span className="text-2xs tabular-nums text-subtle">
                  {t.nTecnicas(itens.length)}
                </span>
              </div>

              <VerMais
                key={`${categoria.id}:${mostrarTudo}`}
                inicial={mostrarTudo ? itens.length : 6}
                className="grade-centrada grade-3"
                rotulo={t.verMais}
                rotuloMenos={t.verMenos}
              >
                {itens.map((tecnica) => (
                  <CardTecnica
                    key={tecnica.nome}
                    tecnica={tecnica}
                    idioma={idioma}
                    aberta={expandida === tecnica.nome}
                    onAbrirModal={() => setSelecionada(tecnica)}
                    onAlternar={() =>
                      setExpandida(
                        expandida === tecnica.nome ? null : tecnica.nome,
                      )
                    }
                  />
                ))}
              </VerMais>
            </section>
          );
        })}
      </div>

      <TecnicaModal
        tecnica={selecionada}
        onClose={() => setSelecionada(null)}
        idioma={idioma}
      />
    </>
  );
}

/**
 * No desktop o card abre o modal; no mobile ele expande em acordeão, evitando
 * um modal em tela pequena.
 */
function CardTecnica({
  tecnica,
  idioma,
  aberta,
  onAbrirModal,
  onAlternar,
}: {
  tecnica: Tecnica;
  idioma: Idioma;
  aberta: boolean;
  onAbrirModal: () => void;
  onAlternar: () => void;
}) {
  return (
    /*
      O id é a âncora usada pelos links vindos da página do kata: o aluno
      clica em "Gedan Barai" no Heian Shodan e cai neste card. scroll-mt
      compensa o header fixo, senão o card encosta atrás dele.
    */
    <article id={tecnica.nome} className="card card-hover scroll-mt-24">
      <button
        type="button"
        onClick={onAbrirModal}
        className="hidden w-full p-3.5 text-left sm:block"
      >
        <Cabecalho tecnica={tecnica} />
        <span className="mt-2.5 flex items-center justify-between border-t border-line pt-2">
          <span className="text-2xs uppercase tracking-[0.08em] text-subtle">
            {tecnica.tipo}
          </span>
          <span className="text-2xs font-medium text-accent">
            {TEXTOS_TECNICAS[idioma].verDetalhes}
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={aberta}
        className="w-full p-3.5 text-left sm:hidden"
      >
        <Cabecalho tecnica={tecnica} />
        <span className="mt-2.5 flex items-center justify-between border-t border-line pt-2">
          <span className="text-2xs uppercase tracking-[0.08em] text-subtle">
            {tecnica.tipo}
          </span>
          <span
            aria-hidden
            className={cn(
              "text-2xs text-accent transition-transform duration-200",
              aberta && "rotate-180",
            )}
          >
            ▾
          </span>
        </span>
      </button>

      {aberta ? (
        <div className="border-t border-line p-3.5 sm:hidden">
          <TecnicaDetalhe tecnica={tecnica} compacto idioma={idioma} />
        </div>
      ) : null}
    </article>
  );
}

function Cabecalho({ tecnica }: { tecnica: Tecnica }) {
  return (
    <>
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-fg">{tecnica.nome}</span>
        <span className="shrink-0 font-kanji text-sm text-subtle">
          {tecnica.kanji}
        </span>
      </span>
      <span className="mt-0.5 block text-xs font-medium text-accent">
        {tecnica.pt}
      </span>
      <span className="mt-2 block text-xs leading-relaxed text-muted">
        {tecnica.desc}
      </span>
    </>
  );
}

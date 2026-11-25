"use client";

import { useMemo, useState } from "react";
import { CampoBusca } from "@/components/portal/CampoBusca";
import { FilterChips } from "@/components/ui/Tabs";
import { Sanfona } from "@/components/ui/Sanfona";
import { VerMais } from "@/components/ui/VerMais";
import type { Idioma } from "@/i18n/idioma";
import { TEXTOS_FUNDAMENTOS } from "@/i18n/textos-fundamentos";
import type { Curiosidade, DicionarioItem } from "@/types";

/**
 * Dicionário e curiosidades numa consulta só: cada verbete é uma sanfona
 * (título à vista, explicação ao abrir), com busca e um filtro por tipo. A
 * lista começa curta e cresce no "Ver mais".
 */

type Tipo = "tudo" | "termo" | "curiosidade";

interface Verbete {
  tipo: Exclude<Tipo, "tudo">;
  titulo: string;
  lateral?: string;
  texto: string;
}

const semAcento = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function ConsultaDojo({
  dicionario,
  curiosidades,
  idioma = "pt",
}: {
  dicionario: DicionarioItem[];
  curiosidades: Curiosidade[];
  idioma?: Idioma;
}) {
  const t = TEXTOS_FUNDAMENTOS[idioma];
  const tipos: { value: Tipo; label: string }[] = [
    { value: "tudo", label: t.tudo },
    { value: "termo", label: t.dicionario },
    { value: "curiosidade", label: t.curiosidades },
  ];
  const [tipo, setTipo] = useState<Tipo>("tudo");
  const [busca, setBusca] = useState("");

  const verbetes = useMemo<Verbete[]>(
    () => [
      ...dicionario.map((d) => ({
        tipo: "termo" as const,
        titulo: d.romaji,
        lateral: d.jp,
        texto: d.pt,
      })),
      ...curiosidades.map((c) => ({ tipo: "curiosidade" as const, titulo: c.titulo, texto: c.text })),
    ],
    [dicionario, curiosidades],
  );

  const filtrados = useMemo(() => {
    const termo = semAcento(busca.trim());
    return verbetes
      .filter((v) => tipo === "tudo" || v.tipo === tipo)
      .filter((v) => !termo || semAcento(`${v.titulo} ${v.lateral ?? ""} ${v.texto}`).includes(termo));
  }, [verbetes, tipo, busca]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CampoBusca
          id="busca-consulta"
          valor={busca}
          onChange={setBusca}
          placeholder={t.buscarVerbete}
          rotuloLimpar={t.limparBusca}
          className="sm:w-72"
        />
        <FilterChips options={tipos} value={tipo} onChange={setTipo} />
      </div>

      {filtrados.length === 0 ? (
        <p className="card px-4 py-6 text-center text-xs text-muted">{t.nadaEncontrado(busca)}</p>
      ) : (
        <VerMais key={`${tipo}:${busca}`} inicial={8} rotulo={t.verMaisVerbetes} rotuloMenos={t.verMenos}>
          {filtrados.map((v) => (
            <Sanfona
              key={`${v.tipo}:${v.titulo}`}
              sobretitulo={v.tipo === "termo" ? t.dicionario : t.curiosidade}
              titulo={v.titulo}
              lateral={v.lateral ? <span className="font-kanji text-base">{v.lateral}</span> : undefined}
            >
              {v.texto}
            </Sanfona>
          ))}
        </VerMais>
      )}
    </div>
  );
}

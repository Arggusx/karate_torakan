"use client";

import { useMemo, useState } from "react";
import { CampoBusca } from "@/components/portal/CampoBusca";
import { FilterChips } from "@/components/ui/Tabs";
import { Sanfona } from "@/components/ui/Sanfona";
import { VerMais } from "@/components/ui/VerMais";
import type { Curiosidade, DicionarioItem } from "@/types";

/**
 * Dicionário e curiosidades numa consulta só: cada verbete é uma sanfona
 * (título à vista, explicação ao abrir), com busca e um filtro por tipo. A
 * lista começa curta e cresce no "Ver mais".
 */

type Tipo = "tudo" | "termo" | "curiosidade";

const TIPOS = [
  { value: "tudo" as const, label: "Tudo" },
  { value: "termo" as const, label: "Dicionário" },
  { value: "curiosidade" as const, label: "Curiosidades" },
];

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
}: {
  dicionario: DicionarioItem[];
  curiosidades: Curiosidade[];
}) {
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
          placeholder="Buscar termo ou curiosidade"
          className="sm:w-72"
        />
        <FilterChips options={TIPOS} value={tipo} onChange={setTipo} />
      </div>

      {filtrados.length === 0 ? (
        <p className="card px-4 py-6 text-center text-xs text-muted">Nada encontrado para “{busca}”.</p>
      ) : (
        <VerMais key={`${tipo}:${busca}`} inicial={8} rotulo="Ver mais verbetes">
          {filtrados.map((v) => (
            <Sanfona
              key={`${v.tipo}:${v.titulo}`}
              sobretitulo={v.tipo === "termo" ? "Dicionário" : "Curiosidade"}
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

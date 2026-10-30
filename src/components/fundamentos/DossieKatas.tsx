"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FilterChips } from "@/components/ui/Tabs";
import { Sanfona } from "@/components/ui/Sanfona";
import { VerMais } from "@/components/ui/VerMais";
import type { OrigemKata } from "@/data/origemKatas";

type Item = OrigemKata & { nome: string; significado: string };

const FILTROS = [
  { value: "todos" as const, label: "Todos" },
  { value: "Shuri-te" as const, label: "Shuri-te" },
  { value: "Tomari-te" as const, label: "Tomari-te" },
  { value: "Naha-te" as const, label: "Naha-te" },
];

/** O dossiê de origem: um kata por sanfona, com filtro por escola. */
export function DossieKatas({ itens }: { itens: Item[] }) {
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]["value"]>("todos");
  const visiveis = useMemo(
    () => itens.filter((i) => filtro === "todos" || i.linhagem === filtro),
    [itens, filtro],
  );

  return (
    <div className="grid gap-3">
      <FilterChips options={FILTROS} value={filtro} onChange={setFiltro} />
      <VerMais key={filtro} inicial={8} rotulo="Ver mais katas">
        {visiveis.map((k) => (
          <Sanfona
            key={k.id}
            sobretitulo={`${k.linhagem} · antes: ${k.nomeOriginal}`}
            titulo={k.nome}
            lateral={<span className="text-2xs">{k.epoca}</span>}
          >
            <p className="text-fg/85">{k.historia}</p>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-2xs sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="text-subtle">Significado</dt>
                <dd className="text-fg">{k.significado || "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-subtle">Quem</dt>
                <dd className="text-fg">{k.quem}</dd>
              </div>
            </dl>
            <Link
              href={`/estudos/tecnicas/kata/${k.id}`}
              className="mt-3 inline-block text-xs font-semibold text-accent underline-offset-2 hover:underline"
            >
              Abrir a ficha do {k.nome} →
            </Link>
          </Sanfona>
        ))}
      </VerMais>
    </div>
  );
}

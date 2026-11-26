"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { FilterChips } from "@/components/ui/Tabs";
import { Sanfona } from "@/components/ui/Sanfona";
import { VerMais } from "@/components/ui/VerMais";
import type { OrigemKata } from "@/data/origemKatas";
import { rotaKata, type Idioma } from "@/i18n/idioma";
import { TEXTOS_FUNDAMENTOS } from "@/i18n/textos-fundamentos";

type Item = OrigemKata & { nome: string; significado: string };

type Filtro = "todos" | "Shuri-te" | "Tomari-te" | "Naha-te";

/** O dossiê de origem: um kata por sanfona, com filtro por escola. */
export function DossieKatas({ itens, idioma = "pt" }: { itens: Item[]; idioma?: Idioma }) {
  const t = TEXTOS_FUNDAMENTOS[idioma];
  const filtros: { value: Filtro; label: string }[] = [
    { value: "todos", label: t.todos },
    { value: "Shuri-te", label: "Shuri-te" },
    { value: "Tomari-te", label: "Tomari-te" },
    { value: "Naha-te", label: "Naha-te" },
  ];
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const visiveis = useMemo(
    () => itens.filter((i) => filtro === "todos" || i.linhagem === filtro),
    [itens, filtro],
  );

  return (
    <div className="grid gap-3">
      <FilterChips options={filtros} value={filtro} onChange={setFiltro} />
      <VerMais key={filtro} inicial={8} rotulo={t.verMaisKatas} rotuloMenos={t.verMenos}>
        {visiveis.map((k) => (
          <Sanfona
            key={k.id}
            sobretitulo={`${k.linhagem} · ${t.antes}: ${k.nomeOriginal}`}
            titulo={k.nome}
            lateral={<span className="text-2xs">{k.epoca}</span>}
          >
            <p className="text-fg/85">{k.historia}</p>
            <dl className="mt-3 grid gap-x-6 gap-y-1 text-2xs sm:grid-cols-2">
              <div className="flex gap-2">
                <dt className="text-subtle">{t.significado}</dt>
                <dd className="text-fg">{k.significado || "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-subtle">{t.quem}</dt>
                <dd className="text-fg">{k.quem}</dd>
              </div>
            </dl>
            <Link
              href={rotaKata(idioma, k.id)}
              className="mt-3 inline-block text-xs font-semibold text-accent underline-offset-2 hover:underline"
            >
              {t.abrirFicha(k.nome)}
            </Link>
          </Sanfona>
        ))}
      </VerMais>
    </div>
  );
}

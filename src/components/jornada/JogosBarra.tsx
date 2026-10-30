"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { JOGOS } from "@/components/jornada/jogos";

/**
 * Barra de jogos, dentro de cada jogo, logo abaixo de "← Jornada". No celular
 * rola para o lado e centraliza o chip ativo; a partir de 900px quebra linha
 * e fica centralizada.
 */
export function JogosBarra({ ativo }: { ativo: string }) {
  const barra = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = barra.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!el || !barra.current) return;
    barra.current.scrollLeft = el.offsetLeft - barra.current.clientWidth / 2 + el.clientWidth / 2;
  }, [ativo]);

  return (
    <div>
      <Link href="/estudos/jornada" className="mb-3 inline-flex text-sm font-semibold text-muted hover:text-accent">
        ← Jornada
      </Link>
      <nav ref={barra} className="jogos-barra" aria-label="Jogos da Jornada">
        {JOGOS.map((j) => (
          <Link
            key={j.slug}
            href={`/estudos/jornada/${j.slug}`}
            aria-current={j.slug === ativo ? "page" : undefined}
            style={{ "--game": j.cor } as React.CSSProperties}
          >
            <span className="jogos-barra-kanji" aria-hidden>
              {j.kanji}
            </span>
            {j.nome}
          </Link>
        ))}
      </nav>
    </div>
  );
}

"use client";

import { Children, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Mostra só os primeiros itens de uma lista longa e um botão "Ver mais +N"
 * (o LoadMore do Oratio). Cada clique abre mais um lote; no fim, "Ver menos".
 *
 * Os filhos são os itens da lista: o contêiner (`como` + `className`) é o
 * mesmo que a lista teria sem o botão, então a grade não muda.
 */
export function VerMais({
  children,
  inicial = 6,
  passo,
  como: Como = "div",
  className,
  rotulo = "Ver mais",
}: {
  children: ReactNode;
  inicial?: number;
  /** Quantos aparecem a cada clique (padrão: o mesmo que `inicial`). */
  passo?: number;
  como?: "div" | "ul" | "ol";
  className?: string;
  rotulo?: string;
}) {
  const itens = Children.toArray(children);
  const [visiveis, setVisiveis] = useState(inicial);
  const lote = passo ?? inicial;
  const restantes = itens.length - visiveis;

  return (
    <>
      <Como className={className}>{itens.slice(0, visiveis)}</Como>
      {itens.length > inicial ? (
        <div className="ver-mais">
          {restantes > 0 ? (
            <button type="button" onClick={() => setVisiveis((v) => v + lote)}>
              {rotulo}
              <span className="ver-mais-conta">+{restantes}</span>
            </button>
          ) : (
            <button type="button" onClick={() => setVisiveis(inicial)} className={cn("ver-mais-menos")}>
              Ver menos
            </button>
          )}
        </div>
      ) : null}
    </>
  );
}

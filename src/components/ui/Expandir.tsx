"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Colapsável que anima a altura sem medir pixel em JS.
 *
 * O truque é o grid: um `grid-template-rows` de `0fr` para `1fr` transiciona
 * suave, e o filho com `overflow-hidden` e `min-h-0` é recortado durante o
 * movimento. Mais simples e mais robusto que calcular altura — e respeita
 * `prefers-reduced-motion` por não depender de script.
 */
export function Expandir({
  aberto,
  children,
  className,
}: {
  aberto: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
        aberto ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        className,
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

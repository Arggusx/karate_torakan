"use client";

import { useEffect } from "react";

/**
 * Efeitos de mouse do site inteiro, com um ouvinte só:
 *
 * - Luz: nos cartões (.card, .painel, .sanfona, [data-luz]) uma luz suave
 *   segue o cursor — as variáveis --mx/--my vão para o elemento e o CSS
 *   desenha o brilho (.luz em componentes.css).
 * - (A inclinação 3D de [data-inclinar] saiu no redesign: academy e portal
 *   só têm transições de estado. Ver DESIGN.md, seção 5.)
 * - Revelação: [data-revelar-mouse] recebe --mx/--my para a máscara que
 *   mostra a imagem de baixo em volta do cursor.
 *
 * Desligado em tela de toque (sem hover). Não renderiza nada.
 */
const ALVO_LUZ = ".card, .painel, .sanfona, [data-luz]";

export function EfeitosGlobais() {
  useEffect(() => {
    const finoComHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finoComHover.matches) return;

    let luzAtual: HTMLElement | null = null;
    let quadro = 0;
    let ultimo: PointerEvent | null = null;

    function aplicar() {
      quadro = 0;
      const e = ultimo;
      if (!e) return;
      const alvo = e.target instanceof Element ? e.target : null;

      // Luz nos cartões.
      const luz = alvo?.closest<HTMLElement>(ALVO_LUZ) ?? null;
      if (luz !== luzAtual) {
        luzAtual?.classList.remove("luz");
        luzAtual = luz;
        luz?.classList.add("luz");
      }
      if (luz) {
        const r = luz.getBoundingClientRect();
        luz.style.setProperty("--mx", `${e.clientX - r.left}px`);
        luz.style.setProperty("--my", `${e.clientY - r.top}px`);
      }

      // Revelação pelo mouse.
      const revelar = alvo?.closest<HTMLElement>("[data-revelar-mouse]");
      if (revelar) {
        const r = revelar.getBoundingClientRect();
        revelar.style.setProperty("--mx", `${e.clientX - r.left}px`);
        revelar.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    }

    function mover(e: PointerEvent) {
      ultimo = e;
      if (!quadro) quadro = requestAnimationFrame(aplicar);
    }

    function sair() {
      luzAtual?.classList.remove("luz");
      luzAtual = null;
    }

    document.addEventListener("pointermove", mover, { passive: true });
    document.documentElement.addEventListener("pointerleave", sair);
    return () => {
      document.removeEventListener("pointermove", mover);
      document.documentElement.removeEventListener("pointerleave", sair);
      cancelAnimationFrame(quadro);
      sair();
    };
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

/**
 * Efeitos de mouse do site inteiro, com um ouvinte só:
 *
 * - Luz: nos cartões (.card, .painel, .sanfona, [data-luz]) uma luz suave
 *   segue o cursor — as variáveis --mx/--my vão para o elemento e o CSS
 *   desenha o brilho (.luz em componentes.css).
 * - Inclinação 3D: [data-inclinar] gira alguns graus na direção do mouse
 *   (--rx/--ry), como uma foto segurada na mão.
 * - Revelação: [data-revelar-mouse] recebe --mx/--my para a máscara que
 *   mostra a imagem de baixo em volta do cursor.
 *
 * Desligado em tela de toque (sem hover) e com prefers-reduced-motion. Não
 * renderiza nada.
 */
const ALVO_LUZ = ".card, .painel, .sanfona, [data-luz]";

export function EfeitosGlobais() {
  useEffect(() => {
    const finoComHover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finoComHover.matches) return;

    let luzAtual: HTMLElement | null = null;
    let inclinadoAtual: HTMLElement | null = null;
    let quadro = 0;
    let ultimo: PointerEvent | null = null;

    function soltarInclinado() {
      if (!inclinadoAtual) return;
      inclinadoAtual.style.setProperty("--rx", "0deg");
      inclinadoAtual.style.setProperty("--ry", "0deg");
      inclinadoAtual = null;
    }

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

      // Inclinação 3D.
      if (menosMovimento.matches) return;
      const inclinar = alvo?.closest<HTMLElement>("[data-inclinar]") ?? null;
      if (inclinar !== inclinadoAtual) soltarInclinado();
      if (inclinar) {
        inclinadoAtual = inclinar;
        const r = inclinar.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        const forca = Number(inclinar.dataset.inclinar) || 8;
        inclinar.style.setProperty("--rx", `${(-y * forca).toFixed(2)}deg`);
        inclinar.style.setProperty("--ry", `${(x * forca).toFixed(2)}deg`);
      }
    }

    function mover(e: PointerEvent) {
      ultimo = e;
      if (!quadro) quadro = requestAnimationFrame(aplicar);
    }

    function sair() {
      luzAtual?.classList.remove("luz");
      luzAtual = null;
      soltarInclinado();
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

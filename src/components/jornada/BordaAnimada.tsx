"use client";

import { useEffect, useId, useRef } from "react";
import { CAMADAS_SVG } from "@/components/jornada/camadasSvg";

/**
 * Monta uma borda animada em volta do avatar:
 *
 *   <span class="borda">        ← o anel ocupa a caixa inteira (0..100)
 *     <svg class="borda-fx">    ← camada de trás (SMIL anima sozinho)
 *     <span class="borda-av">   ← avatar no meio (8..92)
 *     <svg class="borda-fx">    ← camada da frente
 *   </span>
 *
 * Pausa as animações SMIL (svg.pauseAnimations) quando a borda sai da tela,
 * quando `animar` é falso (miniatura de moldura ainda bloqueada) e quando a
 * pessoa prefere movimento reduzido. Pausada, mostra um quadro do meio da
 * animação — no instante zero algumas bordas ainda estão "em branco".
 */
export function BordaAnimada({
  borda,
  tamanho = 88,
  animar = true,
  rotulo,
  children,
}: {
  borda: string;
  tamanho?: number;
  animar?: boolean;
  rotulo?: string;
  children?: React.ReactNode;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const caixa = useRef<HTMLSpanElement>(null);
  const camadas = CAMADAS_SVG[borda] ?? {};
  const html = (svg?: string) => (svg ?? "").replaceAll("{{id}}", `b${uid}`);

  useEffect(() => {
    const el = caixa.current;
    if (!el) return;
    const svgs = Array.from(el.querySelectorAll<SVGSVGElement>("svg.borda-fx"));
    const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

    const aplicar = (visivel: boolean) => {
      const tocar = animar && visivel && !menosMovimento.matches;
      for (const svg of svgs) {
        try {
          if (tocar) {
            svg.unpauseAnimations();
          } else {
            svg.setCurrentTime(2.4);
            svg.pauseAnimations();
          }
        } catch {
          // navegador sem SMIL: a borda fica parada, sem quebrar nada
        }
      }
    };

    aplicar(true);
    if (!("IntersectionObserver" in window)) return;
    const observador = new IntersectionObserver(([e]) => aplicar(e.isIntersecting));
    observador.observe(el);
    const aoMudar = () => aplicar(true);
    menosMovimento.addEventListener("change", aoMudar);
    return () => {
      observador.disconnect();
      menosMovimento.removeEventListener("change", aoMudar);
    };
  }, [animar, borda]);

  return (
    <span
      ref={caixa}
      className={`borda b-${borda}`}
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.3 } as React.CSSProperties}
      role={rotulo ? "img" : undefined}
      aria-label={rotulo}
      aria-hidden={rotulo ? undefined : true}
    >
      <svg className="borda-fx" viewBox="-40 -40 180 180" dangerouslySetInnerHTML={{ __html: html(camadas.tras) }} />
      <span className="borda-av">{children}</span>
      {camadas.frente ? (
        <svg className="borda-fx borda-frente" viewBox="-40 -40 180 180" dangerouslySetInnerHTML={{ __html: html(camadas.frente) }} />
      ) : null}
    </span>
  );
}

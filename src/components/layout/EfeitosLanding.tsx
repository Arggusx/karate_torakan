"use client";

import { useEffect } from "react";

/**
 * Efeitos da landing ligados à rolagem (DESIGN.md, seção 5), com GSAP +
 * ScrollTrigger. Funciona em Safari/iOS, ao contrário das scroll-driven
 * animations do CSS.
 *
 * - [data-tinta]: a foto aparece por manchas de tinta que crescem com a
 *   rolagem (anima --m, ver .landing-tinta em landing.css).
 * - [data-subir]: o bloco sobe 48px até o lugar. Só deslocamento, nunca
 *   opacidade: preço e horário não podem ficar escondidos se algo falhar.
 * - [data-kata]: o embusen do Heian Shodan se desenha e o contador vai de 00
 *   a 21 enquanto a seção passa.
 *
 * O GSAP é importado só aqui, sob demanda, e só esta página monta este
 * componente. Sem JavaScript ou com prefers-reduced-motion nada é montado e o
 * HTML fica no estado final: fotos inteiras, embusen completo, "21".
 * Não renderiza nada.
 */
export function EfeitosLanding() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelado = false;
    let desfazer: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelado) return;
      gsap.registerPlugin(ScrollTrigger);

      const contexto = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-tinta]").forEach((foto) => {
          gsap.fromTo(
            foto,
            { "--m": "0%" },
            {
              "--m": "320%",
              ease: "none",
              scrollTrigger: {
                trigger: foto,
                start: "top bottom",
                end: "center center",
                scrub: true,
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-subir]").forEach((bloco) => {
          gsap.fromTo(
            bloco,
            { y: 48 },
            {
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: bloco,
                start: "top bottom",
                end: "top 75%",
                scrub: true,
              },
            },
          );
        });

        const kata = document.querySelector<HTMLElement>("[data-kata]");
        const desenho = kata?.querySelector<SVGPathElement>("[data-kata-desenho]");
        const contador = kata?.querySelector<HTMLElement>("[data-kata-contador]");
        if (kata && desenho && contador) {
          const total = Number(contador.dataset.total) || 21;
          const estado = { progresso: 0 };
          const pintar = () => {
            desenho.style.strokeDashoffset = String(1 - estado.progresso);
            contador.textContent = String(
              Math.round(estado.progresso * total),
            ).padStart(2, "0");
          };

          // Em todas as telas o desenho acompanha a passagem da seção pela
          // tela; ela não fica mais presa no desktop (ver .landing-kata).
          const telas = gsap.matchMedia();
          const montar = (start: string, end: string) => {
            estado.progresso = 0;
            pintar();
            const tween = gsap.to(estado, {
              progresso: 1,
              ease: "none",
              onUpdate: pintar,
              scrollTrigger: { trigger: kata, start, end, scrub: true },
            });
            return () => {
              tween.scrollTrigger?.kill();
              tween.kill();
              estado.progresso = 1;
              pintar();
            };
          };
          telas.add("all", () => montar("top 70%", "bottom 60%"));
        }
      });

      desfazer = () => contexto.revert();
    })();

    return () => {
      cancelado = true;
      desfazer?.();
    };
  }, []);

  return null;
}

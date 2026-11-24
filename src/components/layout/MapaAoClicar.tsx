"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mapa do Google que só carrega quando a pessoa pede.
 *
 * O iframe do Google Maps põe cookies e manda dados da visita ao Google assim
 * que a página abre. Aqui, até o clique, nada sai do site: no lugar do mapa
 * fica um bloco com o endereço e o botão "Mostrar mapa". O endereço e o link
 * para o Google Maps continuam na seção, fora deste bloco, então nenhuma
 * informação essencial depende do clique.
 */
export function MapaAoClicar({
  src,
  titulo,
  className,
}: {
  src: string;
  titulo: string;
  className?: string;
}) {
  const [ativo, setAtivo] = useState(false);
  const mapa = useRef<HTMLIFrameElement>(null);

  // Quem ativou pelo teclado continua no mesmo ponto: o foco vai para o mapa.
  useEffect(() => {
    if (ativo) mapa.current?.focus();
  }, [ativo]);

  if (ativo) {
    return (
      <iframe
        ref={mapa}
        src={src}
        title={titulo}
        referrerPolicy="no-referrer-when-downgrade"
        className={`${className ?? ""} grayscale`}
      />
    );
  }

  return (
    <div
      className={`${className ?? ""} relative flex flex-col justify-between gap-8 overflow-hidden bg-surface p-8`}
    >
      {/* Sugestão de quadras ao fundo, só decoração. */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[55%] w-full text-line"
        preserveAspectRatio="none"
        viewBox="0 0 400 300"
      >
        <g fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round">
          <path d="M-20 90 L420 60" />
          <path d="M-20 210 L420 190" />
          <path d="M120 -20 L150 320" />
          <path d="M290 -20 L270 320" />
        </g>
        <circle cx="210" cy="125" r="9" className="fill-accent-solid" />
      </svg>

      <span className="landing-rotulo relative">Localização</span>
      <div className="relative">
        <p className="mb-5 max-w-[360px] text-sm leading-relaxed text-muted">
          O mapa é do Google e só carrega se você pedir. Ao abrir, o Google
          recebe dados da sua visita.
        </p>
        <button
          type="button"
          onClick={() => setAtivo(true)}
          className="landing-botao landing-botao-tinta"
        >
          Mostrar mapa
        </button>
      </div>
    </div>
  );
}

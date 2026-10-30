import { cn } from "@/lib/cn";

/**
 * A faixa (obi) desenhada: a tira com costura, o nó no meio e as duas pontas
 * caídas. Na preta, as pontas ganham as listras douradas do Dan.
 *
 * `animada` balança as pontas devagar, como pano solto — o resto fica
 * parado. Respeita prefers-reduced-motion pelo CSS (.obi-*).
 */
export function Obi({
  cor,
  dan = false,
  animada = false,
  soNo = false,
  className,
}: {
  cor: string;
  dan?: boolean;
  animada?: boolean;
  /** Só o nó e as pontas, para pôr sobre uma tira desenhada à parte. */
  soNo?: boolean;
  className?: string;
}) {
  // A branca some no fundo creme: ganha um contorno.
  const contorno = "rgb(0 0 0 / 0.14)";

  return (
    <svg
      viewBox={soNo ? "92 4 60 60" : "0 0 240 64"}
      className={cn("obi", animada && "obi-animada", className)}
      style={{ "--obi-cor": cor } as React.CSSProperties}
      aria-hidden
    >
      {soNo ? null : (
        <>
          {/* Tira */}
          <rect x="4" y="14" width="232" height="18" rx="3" fill="var(--obi-cor)" stroke={contorno} />
          {/* Costura: as linhas paralelas que todo obi tem. */}
          <path d="M8 19.5H232M8 23H232M8 26.5H232" className="obi-costura" />
        </>
      )}

      {/* Pontas, presas atrás do nó */}
      <g className="obi-ponta obi-ponta-esq">
        <path d="M112 30 L96 60 L108 62 L120 32 Z" fill="var(--obi-cor)" stroke={contorno} />
        {dan ? <path d="M101 51 L111 53 M99 55 L109 57" className="obi-dan" /> : null}
      </g>
      <g className="obi-ponta obi-ponta-dir">
        <path d="M128 30 L146 60 L134 62 L120 32 Z" fill="var(--obi-cor)" stroke={contorno} />
        {dan ? <path d="M137 52 L144 51 M139 56 L146 55" className="obi-dan" /> : null}
      </g>

      {/* Nó */}
      <rect x="108" y="9" width="24" height="28" rx="5" fill="var(--obi-cor)" stroke={contorno} />
      <path d="M112 14 Q120 23 128 32" className="obi-dobra" />
    </svg>
  );
}

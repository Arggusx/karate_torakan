import type { ReactNode } from "react";

/*
  Selos das famílias do kihon: um karateca em cada posição. Desenhos da pasta
  icones-karate-set (versão colorida). Decorativos: o nome da família está
  logo ao lado, em texto.
*/

/** Contorno escuro largo e corpo branco por cima: o traço do boneco. */
function Corpo({ tracos }: { tracos: string[] }) {
  return (
    <>
      <g stroke="#2F3542" strokeWidth="10.5">
        {tracos.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g stroke="#FFFFFF" strokeWidth="7">
        {tracos.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </>
  );
}

function Icone({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      {children}
    </svg>
  );
}

const CABELO = "c.4-4.2 3.4-6.4 6.6-6.2 3.3.2 5.6 2.6 5.3 5.4-2.4-.9-5-1-7.6-.4-1.6.4-3 .8-4.3 1.2z";

export function IconeChute({ className }: { className?: string }) {
  return (
    <Icone className={className}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 29h8M2 36h9M5 43h6" stroke="#A7B1BE" strokeWidth="2.4" />
        <Corpo
          tracos={[
            "M24.5 20 29 34",
            "M29.5 35 27.5 46.5 25.5 56",
            "M30.5 33 42.5 28.5 52 24",
            "M24 23.5 18 29.5 15 35.5",
            "M27 23 34 24.5 38.5 20",
          ]}
        />
        <path d="M24.5 32.2 33.5 29.4" stroke="#1E1E1E" strokeWidth="3.2" />
        <path d="M29.5 31.5 27.5 37M30.5 31.2 31.5 36.8" stroke="#1E1E1E" strokeWidth="2" />
      </g>
      <g fill="#F4C7A1" stroke="#2F3542" strokeWidth="1.6">
        <ellipse cx="56.5" cy="22" rx="4.2" ry="2.8" transform="rotate(-25 56.5 22)" />
        <ellipse cx="24" cy="59" rx="5" ry="2.6" />
        <circle cx="14.5" cy="37.5" r="2.6" />
        <circle cx="39.5" cy="18.5" r="2.6" />
        <circle cx="23" cy="13" r="6" />
      </g>
      <path d={`M17.2 12.2${CABELO}`} fill="#2F3542" />
    </Icone>
  );
}

export function IconeSoco({ className }: { className?: string }) {
  return (
    <Icone className={className}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M57 15l3-3M58 22.5h4M57 30l3 3" stroke="#A7B1BE" strokeWidth="2.4" />
        <Corpo
          tracos={[
            "M30.5 18 31 33",
            "M32.5 34.5 41 43 45 55",
            "M29.5 34.5 22 45 14 55",
            "M33 22 43.5 22.5 52 22.5",
            "M28.5 22 23.5 28.5 27.5 31.5",
          ]}
        />
        <path d="M26.5 31.5 35 31" stroke="#1E1E1E" strokeWidth="3.2" />
        <path d="M31 31 29.5 36.5M32 31 33.5 36.3" stroke="#1E1E1E" strokeWidth="2" />
      </g>
      <g fill="#F4C7A1" stroke="#2F3542" strokeWidth="1.6">
        <ellipse cx="47" cy="58" rx="4.8" ry="2.6" />
        <ellipse cx="12" cy="58" rx="4.8" ry="2.6" />
        <circle cx="55" cy="22.5" r="2.8" />
        <circle cx="29.5" cy="31" r="2.8" />
        <circle cx="29.5" cy="11.5" r="6" />
      </g>
      <path d={`M23.7 10.7${CABELO}`} fill="#2F3542" />
      <g fill="none" stroke="#3BA776" strokeLinecap="round" strokeWidth="2.4">
        <path d="M23.9 10.3h11.2" />
        <path d="M24.1 10.3l-4 -2.5M24.1 10.3l-4.5 1.2" />
      </g>
    </Icone>
  );
}

export function IconeBaseBaixa({ className }: { className?: string }) {
  return (
    <Icone className={className}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M58 16l3-3M59 23h3.5M58 30l3 3" stroke="#A7B1BE" strokeWidth="2.4" />
        <Corpo
          tracos={[
            "M32 19 32 34",
            "M34.5 36.5 45 42 50 54",
            "M29.5 36.5 19 42 14 54",
            "M34.5 22.5 45 23 52.5 23",
            "M29.5 22.5 24.5 28.5 28.5 32",
          ]}
        />
        <path d="M27.5 33 36.5 33" stroke="#1E1E1E" strokeWidth="3.2" />
        <path d="M31 33 29.5 38.5M33 33 34.5 38.5" stroke="#1E1E1E" strokeWidth="2" />
      </g>
      <g fill="#F4C7A1" stroke="#2F3542" strokeWidth="1.6">
        <ellipse cx="51.5" cy="57.5" rx="4.8" ry="2.6" />
        <ellipse cx="12.5" cy="57.5" rx="4.8" ry="2.6" />
        <circle cx="55.5" cy="23" r="2.8" />
        <circle cx="30" cy="32" r="2.8" />
        <circle cx="32" cy="12" r="6" />
      </g>
      <path d={`M26.2 11.2${CABELO}`} fill="#2F3542" />
    </Icone>
  );
}

export function IconePronto({ className }: { className?: string }) {
  return (
    <Icone className={className}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Corpo
          tracos={[
            "M32 18 32 33",
            "M29.5 35 27.5 45.5 25.5 55",
            "M34.5 35 36.5 45.5 38.5 55",
            "M28 22 24 28.5 26 32.5",
            "M36 22 40 28.5 38 32.5",
          ]}
        />
        <path d="M27.5 31.5 36.5 31.5" stroke="#1E1E1E" strokeWidth="3.2" />
        <path d="M31 31.5 29.5 37M33 31.5 34.5 37" stroke="#1E1E1E" strokeWidth="2" />
      </g>
      <g fill="#F4C7A1" stroke="#2F3542" strokeWidth="1.6">
        <ellipse cx="23.5" cy="58" rx="4.6" ry="2.6" />
        <ellipse cx="40.5" cy="58" rx="4.6" ry="2.6" />
        <circle cx="26.5" cy="34" r="2.8" />
        <circle cx="37.5" cy="34" r="2.8" />
        <circle cx="32" cy="11" r="6" />
      </g>
      <path d={`M26.2 10.2${CABELO}`} fill="#2F3542" />
    </Icone>
  );
}

/** Braço erguido para defender (arquivo karate-guarda). */
export function IconeDefesa({ className }: { className?: string }) {
  return (
    <Icone className={className}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Corpo
          tracos={[
            "M28.5 18 30 33",
            "M32 34.5 41.5 43 46.5 55",
            "M28.5 34.5 20.5 45 15 55",
            "M32 21.5 40 25.5 44 20",
            "M26 22 22 28.5 26 32",
          ]}
        />
        <path d="M25 31.8 34 30.6" stroke="#1E1E1E" strokeWidth="3.2" />
        <path d="M29.5 31.2 28 36.7M30.5 31.1 32 36.5" stroke="#1E1E1E" strokeWidth="2" />
      </g>
      <g fill="#F4C7A1" stroke="#2F3542" strokeWidth="1.6">
        <ellipse cx="48.5" cy="58" rx="4.8" ry="2.6" />
        <ellipse cx="13" cy="58" rx="4.8" ry="2.6" />
        <circle cx="27.5" cy="32.5" r="2.8" />
        <ellipse cx="45.8" cy="16.4" rx="2.3" ry="4" transform="rotate(-20 45.8 16.4)" />
        <circle cx="28" cy="11.5" r="6" />
      </g>
      <path d={`M22.2 10.7${CABELO}`} fill="#2F3542" />
    </Icone>
  );
}

/**
 * O desenho de cada família do kihon, pelo id da categoria. Família sem
 * desenho continua com o kanji.
 */
export const ICONE_FAMILIA: Record<string, (p: { className?: string }) => ReactNode> = {
  Socos: IconeSoco,
  Chutes: IconeChute,
  Defesas: IconeDefesa,
  Bases: IconeBaseBaixa,
  Kamae: IconePronto,
};

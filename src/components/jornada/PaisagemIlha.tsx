import { cn } from "@/lib/cn";
import type { IlhaId } from "@/services/pontuacao";

/**
 * A paisagem de cada ilha: o mar, a ilha e o marco que dá nome a ela
 * (o makiwara do kihon, o torii dos katas, o dojo, o castelo de Shuri, o
 * pergaminho das palavras e o jardim de pedras da mente). SVG leve; as
 * ondas se mexem por CSS (e param com movimento reduzido).
 */
export function PaisagemIlha({
  ilha,
  cor,
  className,
  apagada = false,
}: {
  ilha: IlhaId;
  cor: string;
  className?: string;
  /** Ilha ainda não visitada: em tons de cinza. */
  apagada?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 160 110"
      aria-hidden
      className={cn("paisagem", apagada && "is-apagada", className)}
      style={{ "--ilha": cor } as React.CSSProperties}
    >
      {/* céu: um sol baixo */}
      <circle cx="128" cy="24" r="11" className="paisagem-sol" />

      {/* a ilha */}
      <path d="M14 86 C30 60 130 60 146 86 Z" className="paisagem-areia" />
      <path d="M26 80 C44 62 116 62 134 80 C110 76 50 76 26 80 Z" className="paisagem-grama" />

      <Marco ilha={ilha} />

      {/* o mar, na frente da base da ilha */}
      <g className="paisagem-mar">
        <path d="M-40 88 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 V110 H-40 Z" className="paisagem-agua" />
        <path d="M-40 96 q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" className="paisagem-onda" />
      </g>
    </svg>
  );
}

function Marco({ ilha }: { ilha: IlhaId }) {
  switch (ilha) {
    case "kihon":
      // Makiwara: poste de madeira com a almofada de palha.
      return (
        <g>
          <rect x="77" y="30" width="6" height="42" rx="1.5" fill="#8a5a33" />
          <rect x="74" y="32" width="12" height="15" rx="2.5" className="paisagem-cor" />
          <path d="M74 36.5h12M74 41h12" stroke="#fff" strokeOpacity=".55" strokeWidth="1" />
          <path d="M60 50 l9 -2 M58 43 l10 0 M61 36 l8 3" stroke="var(--ilha)" strokeWidth="1.6" strokeLinecap="round" className="paisagem-impacto" />
        </g>
      );
    case "katas":
      // Torii: o portal que separa o comum do sagrado.
      return (
        <g className="paisagem-cor-traco" strokeLinecap="round">
          <path d="M60 34 Q80 28 100 34" fill="none" strokeWidth="5" />
          <path d="M64 42 H96" strokeWidth="3.5" />
          <path d="M67 34 V72 M93 34 V72" strokeWidth="4.5" />
          <path d="M80 34 V42" strokeWidth="2.5" />
        </g>
      );
    case "dojo":
      return (
        <g>
          <rect x="58" y="50" width="44" height="21" fill="#f3e6cf" stroke="#8a6a44" strokeWidth="1" />
          <path d="M50 51 Q80 34 110 51 L104 45 Q80 28 56 45 Z" className="paisagem-cor" />
          <rect x="74" y="57" width="12" height="14" fill="#8a6a44" />
          <path d="M80 57 V71" stroke="#f3e6cf" strokeWidth="1" />
          <rect x="62" y="55" width="7" height="6" fill="#d9c5a3" />
          <rect x="91" y="55" width="7" height="6" fill="#d9c5a3" />
        </g>
      );
    case "historia":
      // Castelo de Shuri, em Okinawa, em três telhados.
      return (
        <g>
          <rect x="62" y="58" width="36" height="13" fill="#f0e2c8" stroke="#8a6a44" strokeWidth="1" />
          <path d="M56 59 Q80 50 104 59 L98 54 H62 Z" className="paisagem-cor" />
          <rect x="68" y="44" width="24" height="10" fill="#f0e2c8" stroke="#8a6a44" strokeWidth="1" />
          <path d="M62 45 Q80 37 98 45 L93 40 H67 Z" className="paisagem-cor" />
          <rect x="73" y="32" width="14" height="8" fill="#f0e2c8" stroke="#8a6a44" strokeWidth="1" />
          <path d="M68 33 Q80 25 92 33 L88 29 H72 Z" className="paisagem-cor" />
          <rect x="77" y="63" width="6" height="8" fill="#8a6a44" />
        </g>
      );
    case "vocabulario":
      return (
        <g>
          {/* pergaminho pendurado */}
          <path d="M66 26 H90" stroke="#5b3a29" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="68" y="27" width="20" height="38" rx="1" fill="#fbf6ea" stroke="#5b3a29" strokeWidth="1" />
          <path d="M66 66 H90" stroke="#5b3a29" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M74 34 h8 M73 40 h10 M75 46 h6 M74 52 h8 M76 58 h4" className="paisagem-cor-traco" strokeWidth="2" strokeLinecap="round" />
          {/* cerejeira */}
          <path d="M108 72 C107 62 110 54 116 48 M110 60 C104 56 100 54 98 50" stroke="#5b3a29" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <g className="paisagem-flores">
            <circle cx="116" cy="45" r="7" />
            <circle cx="109" cy="48" r="6" />
            <circle cx="98" cy="48" r="5" />
            <circle cx="122" cy="50" r="5" />
          </g>
        </g>
      );
    case "filosofia":
      // Jardim de pedras, com o ensō no céu.
      return (
        <g>
          <path d="M50 32 C49 18 63 10 76 12 C90 14 96 27 91 37 C87 45 76 47 68 44" fill="none" className="paisagem-cor-traco" strokeWidth="3" strokeLinecap="round" />
          <g fill="none" stroke="#b9a98b" strokeWidth="1">
            <path d="M40 74 C56 66 104 66 120 74" />
            <path d="M46 70 C60 64 100 64 114 70" />
          </g>
          <ellipse cx="70" cy="68" rx="9" ry="5.5" fill="#8d8a84" />
          <ellipse cx="92" cy="70" rx="6" ry="4" fill="#a6a39c" />
          <ellipse cx="80" cy="64" rx="4" ry="3" fill="#6f6c66" />
        </g>
      );
  }
}

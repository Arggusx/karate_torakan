import { cn } from "@/lib/cn";

/**
 * Animações de karatê — a biblioteca de cenas pequenas do site.
 *
 * Mesmo molde das animações do Oratio: cada cena é um SVG inline desenhado à
 * mão, e todo o movimento mora em `src/app/animacoes.css` como @keyframes.
 * Nenhum JavaScript roda para animar, então nada disso pesa na hidratação, e
 * quem pede menos movimento recebe as cenas paradas no quadro final.
 *
 * As cores vêm de `currentColor` e das variáveis do tema: a mesma cena serve
 * no claro e no escuro.
 *
 */

interface Props {
  className?: string;
}

/* ------------------------------------------------------------- Ensō */

/** Círculo zen pincelado que se desenha, respira e recomeça. */
export function Enso({ className }: Props) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={cn("anim-enso", className)}>
      <path
        pathLength={100}
        d="M62 14C38 9 15 26 14 52c-1 25 21 38 40 36 22-2 34-21 32-40-1-12-9-22-19-27"
        className="anim-enso-traco"
      />
    </svg>
  );
}

/* ----------------------------------------------------------- Makiwara */

/**
 * Makiwara, o poste de soco do Okinawa. A tábua é presa no chão e flexível:
 * leva o golpe na palha, verga para trás e volta balançando até parar. O
 * golpe aparece só pelo efeito — anel de impacto e linhas de velocidade —, sem
 * desenhar quem bate.
 */
export function Makiwara({ className }: Props) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={cn("anim-makiwara", className)}>
      <line x1="10" y1="92" x2="90" y2="92" className="anim-chao" />
      {/* base enterrada */}
      <rect x="40" y="84" width="20" height="8" rx="1.5" className="anim-makiwara-base" />
      <g className="anim-makiwara-tabua">
        <path d="M46 90 L48 16 Q50 13 52 16 L54 90 Z" className="anim-makiwara-madeira" />
        {/* almofada de palha amarrada */}
        <rect x="44" y="22" width="12" height="18" rx="2" className="anim-makiwara-palha" />
        <g className="anim-makiwara-amarra">
          <line x1="44" y1="27" x2="56" y2="27" />
          <line x1="44" y1="31" x2="56" y2="31" />
          <line x1="44" y1="35" x2="56" y2="35" />
        </g>
        {/* O anel mora dentro da tábua: acompanha a palha quando ela verga. */}
        <circle cx="44" cy="31" r="6" className="anim-kime anim-kime-makiwara" />
      </g>
      {/* linhas de velocidade chegando pela esquerda */}
      <g className="anim-makiwara-vento">
        <line x1="14" y1="27" x2="32" y2="27" />
        <line x1="20" y1="32" x2="36" y2="32" />
        <line x1="14" y1="37" x2="30" y2="37" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------ Bokken em choque */

/**
 * Dois bokken — espadas de madeira de treino — partindo da guarda, cruzando
 * no alto com uma faísca no ponto de contato, e voltando. É o kumite contado
 * pelas armas, não pelos lutadores.
 */
export function BokkenChoque({ className }: Props) {
  return (
    <svg viewBox="0 0 120 100" aria-hidden className={cn("anim-bokken", className)}>
      <line x1="8" y1="94" x2="112" y2="94" className="anim-chao" />
      <g className="anim-bokken-esq">
        <Bokken x={20} />
      </g>
      <g className="anim-bokken-dir">
        <Bokken x={100} />
      </g>
      {/* faísca no cruzamento */}
      <g className="anim-bokken-faisca">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line
            key={a}
            x1="60"
            y1="38"
            x2="60"
            y2="31"
            transform={`rotate(${a} 60 44)`}
          />
        ))}
      </g>
      <circle cx="60" cy="44" r="5" className="anim-kime anim-kime-bokken" />
    </svg>
  );
}

/** Um bokken de pé, com o punho apoiado em (x, 92). */
function Bokken({ x }: { x: number }) {
  return (
    <>
      <line x1={x} y1="92" x2={x} y2="72" className="anim-bokken-punho" />
      <line x1={x - 4} y1="72" x2={x + 4} y2="72" className="anim-bokken-tsuba" />
      <path
        d={`M${x} 72 Q${x + 1.5} 46 ${x} 20`}
        className="anim-bokken-lamina"
      />
    </>
  );
}

/* ----------------------------------------------------------- Tōrō */

/** Lanterna de pedra de jardim, com a chama tremeluzindo lá dentro. */
export function Lanterna({ className }: Props) {
  return (
    <svg viewBox="0 0 80 100" aria-hidden className={cn("anim-lanterna", className)}>
      {/* brilho atrás da janela */}
      <circle cx="40" cy="44" r="16" className="anim-lanterna-brilho" />
      {/* telhado */}
      <path d="M14 30 Q40 14 66 30 L60 33 L20 33 Z" className="anim-pedra" />
      <rect x="37" y="10" width="6" height="8" rx="2" className="anim-pedra" />
      {/* câmara da luz */}
      <rect x="24" y="34" width="32" height="22" rx="2" className="anim-pedra-oca" />
      {/* chama */}
      <path d="M40 38 C45 45 44 51 40 53 C36 51 35 45 40 38 Z" className="anim-chama" />
      {/* base e coluna */}
      <rect x="20" y="56" width="40" height="5" rx="1.5" className="anim-pedra" />
      <rect x="33" y="61" width="14" height="22" className="anim-pedra" />
      <rect x="22" y="83" width="36" height="6" rx="2" className="anim-pedra" />
    </svg>
  );
}

/* ------------------------------------------------------- Faixa ao vento */

/** O nó da faixa com as duas pontas balançando. A cor vem do pai. */
export function FaixaAoVento({ className }: Props) {
  return (
    <svg viewBox="0 0 100 80" aria-hidden className={cn("anim-faixa", className)}>
      {/* volta da faixa na cintura */}
      <rect x="6" y="18" width="88" height="11" rx="2" className="anim-faixa-tecido" />
      {/* pontas */}
      <path d="M48 28 Q40 46 34 66" className="anim-faixa-ponta anim-faixa-ponta-e" />
      <path d="M52 28 Q62 46 70 66" className="anim-faixa-ponta anim-faixa-ponta-d" />
      {/* nó */}
      <rect x="41" y="15" width="18" height="16" rx="3" className="anim-faixa-no" />
    </svg>
  );
}

/* ------------------------------------------------------- Garra do tigre */

/** Três riscos de garra que rasgam em sequência — o Tigre da academia. */
export function GarraTigre({ className }: Props) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden className={cn("anim-garra", className)}>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          pathLength={100}
          d={`M${30 + i * 16} 14 C${24 + i * 16} 40 ${26 + i * 16} 62 ${18 + i * 16} 86`}
          className="anim-garra-risco"
          style={{ animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------- Bambu */

/** Três colmos de bambu balançando fora de fase, com folhas. */
export function Bambu({ className }: Props) {
  return (
    <svg viewBox="0 0 100 120" aria-hidden className={cn("anim-bambu", className)}>
      {[
        { x: 28, h: 112, atraso: 0 },
        { x: 50, h: 100, atraso: 0.8 },
        { x: 72, h: 116, atraso: 1.6 },
      ].map((c) => (
        <g
          key={c.x}
          className="anim-bambu-colmo"
          style={{
            transformOrigin: `${c.x}px 120px`,
            animationDelay: `${c.atraso}s`,
          }}
        >
          <line x1={c.x} y1="120" x2={c.x} y2={120 - c.h} className="anim-bambu-haste" />
          {/* nós do colmo */}
          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={c.x - 4}
              x2={c.x + 4}
              y1={120 - c.h * f}
              y2={120 - c.h * f}
              className="anim-bambu-no"
            />
          ))}
          <path
            d={`M${c.x} ${120 - c.h * 0.8} q14 -4 22 -14 q-16 2 -22 14z`}
            className="anim-bambu-folha"
          />
          <path
            d={`M${c.x} ${120 - c.h * 0.55} q-14 -3 -20 -13 q14 1 20 13z`}
            className="anim-bambu-folha"
          />
        </g>
      ))}
    </svg>
  );
}

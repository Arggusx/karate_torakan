/**
 * Camada decorativa de fundo do site inteiro.
 *
 * Três planos, do mais distante para o mais próximo:
 *
 *  1. Seigaiha (青海波) — as ondas concêntricas que aparecem em kimono e
 *     porcelana desde o século VI. Entram como <pattern>, então o arquivo é
 *     de poucos bytes e escala para qualquer tela.
 *  2. Dois halos — um vermelho e um dourado — respirando devagar. São o que
 *     impede que o fundo pareça papel de parede chapado.
 *  3. Pétalas de sakura caindo, cada uma com duração e atraso próprios.
 *
 * Tudo fica em `fixed … -z-10`: um filho com z-index negativo pinta acima do
 * fundo do <body> e abaixo do conteúdo. Por isso cartões e faixas opacas
 * continuam cobrindo a decoração — ela aparece no respiro entre eles, que é
 * exatamente onde deve aparecer.
 *
 * Nada aqui recebe clique, e quem pediu menos movimento no sistema recebe o
 * fundo parado (ver `prefers-reduced-motion` em globals.css).
 */
export function FundoAsiatico() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* 1 — Ondas */}
      <svg
        className="absolute inset-0 h-full w-full text-accent opacity-[0.13] dark:opacity-[0.09]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="seigaiha"
            width="72"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            {/*
              Cada onda é um leque de quatro arcos. O segundo leque sai meia
              largura à direita e meia altura abaixo, que é o encaixe que faz
              o padrão parecer escamas em vez de fileiras soltas.
            */}
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1.1"
              transform="translate(0 0)"
            >
              <circle cx="36" cy="36" r="34" />
              <circle cx="36" cy="36" r="25.5" />
              <circle cx="36" cy="36" r="17" />
              <circle cx="36" cy="36" r="8.5" />
              <circle cx="0" cy="36" r="34" />
              <circle cx="0" cy="36" r="25.5" />
              <circle cx="0" cy="36" r="17" />
              <circle cx="0" cy="36" r="8.5" />
              <circle cx="72" cy="36" r="34" />
              <circle cx="72" cy="36" r="25.5" />
              <circle cx="72" cy="36" r="17" />
              <circle cx="72" cy="36" r="8.5" />
              <circle cx="18" cy="18" r="34" />
              <circle cx="18" cy="18" r="25.5" />
              <circle cx="18" cy="18" r="17" />
              <circle cx="18" cy="18" r="8.5" />
              <circle cx="54" cy="18" r="34" />
              <circle cx="54" cy="18" r="25.5" />
              <circle cx="54" cy="18" r="17" />
              <circle cx="54" cy="18" r="8.5" />
            </g>
          </pattern>
          {/* Desbotada nas bordas: o padrão some em vez de ser cortado. */}
          <radialGradient id="seigaiha-fade" cx="50%" cy="38%" r="78%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="60%" stopColor="white" stopOpacity="0.7" />
            <stop offset="100%" stopColor="white" stopOpacity="0.3" />
          </radialGradient>
          <mask id="seigaiha-mask">
            <rect width="100%" height="100%" fill="url(#seigaiha-fade)" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#seigaiha)"
          mask="url(#seigaiha-mask)"
          className="fundo-ondas"
        />
      </svg>

      {/* 2 — Halos */}
      <div className="fundo-halo fundo-halo-vermelho" />
      <div className="fundo-halo fundo-halo-dourado" />

      {/*
        2b — Hinomaru. O equivalente diurno da lua vermelha do modo escuro:
        lá ela acende como neon; aqui é o disco chapado sobre papel, com raios
        girando devagar e anéis que se abrem como onda de impacto. No escuro
        fica bem mais apagado, porque quem faz esse papel lá é a lua.
      */}
      <div className="fundo-sol">
        <svg viewBox="-200 -200 400 400" className="h-full w-full">
          <g className="fundo-sol-raios">
            {RAIOS.map((angulo) => (
              <path
                key={angulo}
                d="M0 0 L-9 -196 L9 -196 Z"
                transform={`rotate(${angulo})`}
                className="fundo-sol-raio"
              />
            ))}
          </g>
          <circle r="150" className="fundo-sol-anel" />
          <circle r="122" className="fundo-sol-anel" />
          <circle r="62" className="fundo-sol-disco" />
          <circle r="62" className="fundo-sol-onda" />
          <circle r="62" className="fundo-sol-onda fundo-sol-onda-2" />
        </svg>
      </div>

      {/* 3a — Vaga-lumes dourados, subindo devagar (sentido oposto à sakura). */}
      <div className="absolute inset-0">
        {VAGALUMES.map((v, i) => (
          <span
            key={i}
            className="vagalume"
            style={
              {
                left: `${v.x}%`,
                top: `${v.y}%`,
                "--dur": `${v.dur}s`,
                "--atraso": `${v.atraso}s`,
                "--dx": `${v.dx}px`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* 3b — Sakura */}
      <div className="absolute inset-0">
        {PETALAS.map((petala, indice) => (
          <span
            key={indice}
            className="sakura"
            style={
              {
                left: `${petala.x}%`,
                "--queda": `${petala.queda}s`,
                "--atraso": `${petala.atraso}s`,
                "--giro": `${petala.giro}deg`,
                "--deriva": `${petala.deriva}px`,
                "--tamanho": `${petala.tamanho}px`,
                "--opacidade": petala.opacidade,
              } as React.CSSProperties
            }
          >
            <PetalaSakura />
          </span>
        ))}
      </div>
    </div>
  );
}

/*
  Valores escritos à mão em vez de sorteados: `Math.random()` no corpo do
  componente daria resultados diferentes no servidor e no cliente, e o React
  acusaria divergência de hidratação a cada carregamento.
*/
const PETALAS = [
  { x: 4, queda: 23, atraso: 0, giro: 420, deriva: 70, tamanho: 13, opacidade: 0.5 },
  { x: 14, queda: 31, atraso: 6, giro: -300, deriva: -55, tamanho: 9, opacidade: 0.35 },
  { x: 23, queda: 27, atraso: 12, giro: 360, deriva: 90, tamanho: 16, opacidade: 0.45 },
  { x: 33, queda: 35, atraso: 3, giro: -480, deriva: -40, tamanho: 10, opacidade: 0.3 },
  { x: 44, queda: 25, atraso: 17, giro: 300, deriva: 60, tamanho: 12, opacidade: 0.4 },
  { x: 53, queda: 38, atraso: 9, giro: -360, deriva: -80, tamanho: 15, opacidade: 0.34 },
  { x: 63, queda: 29, atraso: 21, giro: 420, deriva: 45, tamanho: 11, opacidade: 0.46 },
  { x: 72, queda: 33, atraso: 2, giro: -300, deriva: -65, tamanho: 14, opacidade: 0.32 },
  { x: 81, queda: 26, atraso: 14, giro: 390, deriva: 75, tamanho: 10, opacidade: 0.42 },
  { x: 90, queda: 36, atraso: 8, giro: -420, deriva: -50, tamanho: 13, opacidade: 0.36 },
  { x: 96, queda: 30, atraso: 19, giro: 330, deriva: 55, tamanho: 9, opacidade: 0.3 },
];

/** Doze raios, de 30 em 30 graus — a bandeira do sol nascente simplificada. */
const RAIOS = Array.from({ length: 12 }, (_, i) => i * 30);

const VAGALUMES = [
  { x: 8, y: 70, dur: 14, atraso: 0, dx: 30 },
  { x: 19, y: 88, dur: 18, atraso: 4, dx: -24 },
  { x: 37, y: 76, dur: 16, atraso: 9, dx: 20 },
  { x: 58, y: 92, dur: 20, atraso: 2, dx: -30 },
  { x: 71, y: 80, dur: 15, atraso: 11, dx: 26 },
  { x: 86, y: 90, dur: 19, atraso: 6, dx: -18 },
  { x: 94, y: 68, dur: 17, atraso: 13, dx: 22 },
];

/** Uma pétala só, com a dobra central que a sakura tem na ponta. */
function PetalaSakura() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 1.5c4.6 2.6 7.4 6.6 7.4 11 0 5.1-3.3 9-7.4 10.5-4.1-1.5-7.4-5.4-7.4-10.5 0-4.4 2.8-8.4 7.4-11z"
        className="sakura-corpo"
      />
      <path
        d="M12 4.5c0 5.5-1.2 11-1.2 17"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

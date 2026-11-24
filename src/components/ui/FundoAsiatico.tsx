/**
 * Camada decorativa de fundo do site inteiro: só o seigaiha (青海波), as
 * ondas concêntricas que aparecem em kimono e porcelana desde o século VI.
 * Entra como <pattern>, então o arquivo é de poucos bytes e escala para
 * qualquer tela. Desliza devagar na horizontal (ver .fundo-ondas em
 * globals.css).
 *
 * Desde o redesign "tinta sumi" (DESIGN.md, seção 5) saíram os brilhos, o sol
 * com raios, os vaga-lumes e a sakura. O traço é cor de tinta (--fg), não
 * vermelho: o vermelho é carimbo, nunca fundo.
 *
 * Tudo fica em `fixed … -z-10`: um filho com z-index negativo pinta acima do
 * fundo do <body> e abaixo do conteúdo. Por isso cartões e faixas opacas
 * continuam cobrindo a decoração — ela aparece no respiro entre eles.
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
      {/* Ondas */}
      <svg
        className="absolute inset-0 h-full w-full text-fg opacity-[0.13] dark:opacity-[0.07]"
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
    </div>
  );
}

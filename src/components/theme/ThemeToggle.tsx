"use client";

import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal, flushSync } from "react-dom";
import { tocarCorte, tocarSaque } from "@/lib/shink";

/**
 * Botão de tema: a katana que corta o dia.
 *
 * Em repouso, um círculo com a cena do tema atual — de dia, o sol vermelho,
 * pétalas e uma katana embainhada; de noite, a lua e dois guerreiros em duelo
 * no morro. Passar o mouse puxa a empunhadura um pouco para fora da bainha:
 * dá para ver o aço, e fica claro que o botão faz alguma coisa.
 *
 * O clique tem três tempos:
 *   1. a espada sai da bainha no próprio botão (som de saque);
 *   2. a lâmina risca a tela na diagonal (som de corte);
 *   3. o novo tema aparece pela fenda que se abre ao longo do risco — o tema
 *      não troca por trás de um efeito, ele é revelado pelo corte.
 *
 * O passo 3 usa a View Transitions API: o navegador fotografa a página antiga
 * e a nova, e o CSS recorta a nova num polígono que cresce a partir da
 * diagonal. Sem suporte à API, ou com movimento reduzido, o tema troca na hora
 * — o enfeite nunca é condição para a função.
 */

type Fase = "repouso" | "sacando" | "cortando" | "particulas";

type DocumentoComTransicao = Document & {
  startViewTransition?: (atualizar: () => void) => {
    finished: Promise<void>;
  };
};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [montado, setMontado] = useState(false);
  const [fase, setFase] = useState<Fase>("repouso");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    setMontado(true);
    const pendentes = timers.current;
    return () => pendentes.forEach((t) => clearTimeout(t));
  }, []);

  const escuro = resolvedTheme === "dark";

  const esperar = (ms: number) =>
    new Promise<void>((resolver) => {
      timers.current.push(window.setTimeout(resolver, ms));
    });

  const alternar = useCallback(async () => {
    if (fase !== "repouso") return;
    const proximo = escuro ? "light" : "dark";
    const doc = document as DocumentoComTransicao;

    const menosMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (menosMovimento) {
      setTheme(proximo);
      return;
    }

    // Aplica a classe na hora, sem esperar o efeito do next-themes: a View
    // Transition fotografa o DOM assim que o callback termina.
    const aplicar = () => {
      const raiz = document.documentElement;
      raiz.classList.toggle("dark", proximo === "dark");
      raiz.style.colorScheme = proximo;
      setTheme(proximo);
    };

    // 1 — saque, no botão
    tocarSaque();
    setFase("sacando");
    await esperar(230);

    // 2 e 3 — risco e fenda
    tocarCorte();

    if (!doc.startViewTransition) {
      aplicar();
      setFase("particulas");
      await esperar(900);
      setFase("repouso");
      return;
    }

    const raiz = document.documentElement;
    raiz.dataset.corte = "";
    const transicao = doc.startViewTransition(() => {
      // A lâmina entra no DOM dentro do callback: assim ela só existe na
      // fotografia nova e o CSS anima a entrada dela (o risco).
      flushSync(() => setFase("cortando"));
      aplicar();
    });

    try {
      await transicao.finished;
    } finally {
      delete raiz.dataset.corte;
      // Síncrono: a lâmina real (opaca) sai do DOM antes do próximo quadro,
      // senão piscaria um traço inteiro quando as fotografias somem.
      // Faíscas e pétalas entram no lugar, já sobre o tema novo.
      flushSync(() => setFase("particulas"));
    }

    await esperar(1000);
    setFase("repouso");
  }, [escuro, fase, setTheme]);

  const rotulo = !montado
    ? "Alternar tema"
    : escuro
      ? "Ativar tema claro"
      : "Ativar tema escuro";

  return (
    <>
      <button
        type="button"
        aria-label={rotulo}
        title={rotulo}
        onClick={alternar}
        data-fase={fase}
        className="tema-botao group relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-line bg-surface shadow-painel transition-[border-color,transform] duration-200 hover:border-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-95 dark:shadow-none"
      >
        {montado ? (
          escuro ? (
            <CenaNoite />
          ) : (
            <CenaDia />
          )
        ) : null}
      </button>

      {fase === "cortando" ? <Lamina /> : null}
      {fase === "particulas" ? <Particulas /> : null}
    </>
  );
}

/* ------------------------------------------------------------- cenas */

/**
 * Dia. A katana atravessa a cena na diagonal; a empunhadura e o aço formam um
 * grupo só (`tema-punho`) que desliza ao longo do eixo da espada, e a bainha
 * fica por cima do aço — por isso o aço só aparece quando o punho sai.
 */
function CenaDia() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
      <defs>
        <radialGradient id="tema-ceu-dia" cx="55%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#FFF6EE" />
          <stop offset="100%" stopColor="#F1D3C1" />
        </radialGradient>
      </defs>
      <rect width="40" height="40" fill="url(#tema-ceu-dia)" />
      {/* sol */}
      <circle cx="23" cy="14.5" r="7.5" fill="#DC2626" />
      {/* morro ao longe */}
      <path d="M0 31 Q12 25 22 28 T40 26 V40 H0 Z" fill="#E7C2AE" />
      {/* pétalas */}
      <g fill="#EC9DB3" className="tema-petalas">
        <path d="M8 10c1.6-.8 3 .2 2.6 1.6-.9.4-2.2.2-2.6-1.6z" />
        <path d="M33 22c1.4-.6 2.6.3 2.2 1.5-.8.3-1.9.1-2.2-1.5z" />
        <path d="M12 21c1.2-.5 2.2.2 1.9 1.3-.7.3-1.6.1-1.9-1.3z" />
      </g>
      {/* katana */}
      <g className="tema-punho">
        {/* aço (escondido pela bainha em repouso) */}
        <line x1="9" y1="31.5" x2="25" y2="19.2" stroke="#D9DEE6" strokeWidth="1.6" strokeLinecap="round" />
        {/* tsuba */}
        <ellipse cx="25.6" cy="18.7" rx="1.2" ry="2.6" transform="rotate(-37.6 25.6 18.7)" fill="#C9A24B" />
        {/* tsuka, com a amarração em losangos */}
        <line x1="26.4" y1="18.1" x2="33.5" y2="12.6" stroke="#1C1714" strokeWidth="2.6" strokeLinecap="round" />
        <g fill="#C9A24B">
          <circle cx="28.4" cy="16.6" r="0.55" />
          <circle cx="30.4" cy="15.1" r="0.55" />
          <circle cx="32.2" cy="13.7" r="0.55" />
        </g>
      </g>
      {/* saya — laca preta com a boca dourada (koiguchi) */}
      <line x1="6" y1="33.8" x2="24.6" y2="19.5" stroke="#1C1714" strokeWidth="3" strokeLinecap="round" />
      <line x1="23.4" y1="20.4" x2="24.6" y2="19.5" stroke="#C9A24B" strokeWidth="3" strokeLinecap="butt" />
    </svg>
  );
}

/** Noite. Lua crescente, três estrelas e dois guerreiros frente a frente. */
function CenaNoite() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="tema-ceu-noite" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#232A52" />
          <stop offset="100%" stopColor="#0C1024" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" fill="url(#tema-ceu-noite)" />
      {/* halo e lua crescente */}
      <circle cx="23" cy="13.5" r="9" fill="#F4E9C8" opacity="0.12" />
      <path d="M26.5 6.6a7.2 7.2 0 1 0 2.9 11.6 6 6 0 1 1-2.9-11.6z" fill="#F4E9C8" />
      {/* estrelas */}
      <g fill="#F4E9C8" className="tema-estrelas">
        <circle cx="8" cy="9" r="0.8" />
        <circle cx="13" cy="5.5" r="0.55" />
        <circle cx="34" cy="21" r="0.6" />
      </g>
      {/* morro */}
      <path d="M0 31 Q11 26.5 20 28.5 T40 27 V40 H0 Z" fill="#05070F" />
      {/* guerreiros: kamae, espadas cruzando no alto */}
      {/*
        Corpos com hakama aberto embaixo — é o alargamento que faz a mancha ler
        como pessoa, e não como poste. As lâminas se cruzam na frente da lua.
      */}
      <g fill="#05070F">
        <circle cx="11.6" cy="19.4" r="1.9" />
        <path d="M10.2 21.5h2.8l1.7 7.8H8.5z" />
        <circle cx="28.4" cy="19.8" r="1.9" />
        <path d="M27 21.9h2.8l1.7 7.4h-6.2z" />
      </g>
      <g stroke="#DDE2EC" strokeWidth="0.9" strokeLinecap="round">
        <line x1="13.2" y1="23.2" x2="22.4" y2="14.6" />
        <line x1="26.8" y1="23.6" x2="17.8" y2="14.8" />
      </g>
    </svg>
  );
}

/* -------------------------------------------------------- lâmina e partículas */

/**
 * A lâmina em tela cheia. O `view-transition-name` faz o navegador fotografá-la
 * à parte, e o CSS anima essa fotografia: primeiro o risco atravessa (recorte
 * da esquerda para a direita), depois o brilho apaga.
 *
 * A linha vai do canto inferior esquerdo ao superior direito — a mesma
 * diagonal em que a fenda do tema novo se abre.
 */
function Lamina() {
  return createPortal(
    <div className="tema-lamina" aria-hidden>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full">
        <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(220,38,38,0.28)" strokeWidth="22" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(212,175,90,0.7)" strokeWidth="7" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        <line x1="0" y1="100" x2="100" y2="0" stroke="#FFFBF2" strokeWidth="2.2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      </svg>
    </div>,
    document.body,
  );
}

/*
  Faíscas e pétalas espalhadas ao longo da diagonal do corte. O ponto i fica
  em (x, 100 - x), e o deslocamento é perpendicular ao risco, alternando de
  lado — como lascas que saltam das duas bordas.
*/
const PONTOS = [8, 16, 24, 33, 41, 49, 57, 65, 73, 81, 89, 95].map((x, i) => {
  const lado = i % 2 === 0 ? 1 : -1;
  return {
    x,
    y: 100 - x,
    dx: lado * (18 + (i % 3) * 10),
    dy: lado * (18 + (i % 3) * 10) + 46,
    giro: lado * (140 + i * 15),
    atraso: i * 22,
    petala: i % 3 !== 0,
  };
});

function Particulas() {
  return createPortal(
    <div className="tema-particulas" aria-hidden>
      {PONTOS.map((p, i) => (
        <span
          key={i}
          className={p.petala ? "tema-petala" : "tema-faisca"}
          style={
            {
              left: `${p.x}%`,
              top: `${p.y}%`,
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              "--giro": `${p.giro}deg`,
              "--atraso": `${p.atraso}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>,
    document.body,
  );
}

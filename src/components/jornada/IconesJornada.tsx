import { cn } from "@/lib/cn";

/**
 * Ícones da Jornada, em traço fino (como lucide), no lugar dos kanji que
 * serviam de ícone. Herdam a cor do texto (currentColor).
 */

type Props = { className?: string };

function Base({ className, children }: Props & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("icone-jornada", className)}
    >
      {children}
    </svg>
  );
}

/** Ilha com coqueiro. */
export const IconeIlha = (p: Props) => (
  <Base {...p}>
    <path d="M2 20c2-1.3 4-1.3 6 0s4 1.3 6 0 4-1.3 6 0" />
    <path d="M5 17c1.5-2.2 4-3.3 7-3.3s5.5 1.1 7 3.3" />
    <path d="M12 13.7c.2-3 .8-5.6 2-7.7" />
    <path d="M14 6c-1.8-1.6-4.4-1.8-6.3-.6M14 6c.6-2.2 2.6-3.6 5-3.4M14 6c2.3-.2 4.4 1 5.2 3" />
  </Base>
);

/** Makiwara: o poste de treino de golpes. */
export const IconeTreino = (p: Props) => (
  <Base {...p}>
    <path d="M12 21V4" />
    <rect x="9.5" y="4" width="5" height="6" rx="1.2" />
    <path d="M9.5 6.5h5M9.5 8h5" />
    <path d="M6 21h12" />
    <path d="M3.5 9.5l3 .8M3.5 6.5l3 1.4" />
  </Base>
);

/** Peças que se encaixam. */
export const IconeMontar = (p: Props) => (
  <Base {...p}>
    <path d="M4 7h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4z" />
    <path d="M12 7v3" />
  </Base>
);

/** Pegadas: a ordem dos passos do kata. */
export const IconeOrdem = (p: Props) => (
  <Base {...p}>
    <path d="M7 15.5c-1.6 0-2.5-1.6-2.5-3.6S5.4 7 7 7s2.5 2.9 2.5 4.9-.9 3.6-2.5 3.6z" />
    <path d="M5.5 18.5h3" />
    <path d="M16.5 11c-1.6 0-2.5-1.6-2.5-3.6S15 2.5 16.5 2.5 19 5.4 19 7.4 18.1 11 16.5 11z" />
    <path d="M15 14h3" />
    <path d="M10.5 21l2-2" />
  </Base>
);

/** Carimbo (hanko). */
export const IconeSelos = (p: Props) => (
  <Base {...p}>
    <path d="M9 3h6v4.5c0 1 .8 1.8 1.8 2.2l.7.3c1 .4 1.5 1.3 1.5 2.3V14H5v-1.7c0-1 .6-1.9 1.5-2.3l.7-.3C8.2 9.3 9 8.5 9 7.5z" />
    <path d="M4 17.5h16" />
    <path d="M7 21h10" />
  </Base>
);

/** Pódio com estrela. */
export const IconeRanking = (p: Props) => (
  <Base {...p}>
    <path d="M3 21v-6h6v6M9 21V11h6v10M15 21v-4h6v4" />
    <path d="M12 2.8l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2L9.1 5l2-.3z" />
  </Base>
);

/** Livro aberto: a mini aula. */
export const IconeAula = (p: Props) => (
  <Base {...p}>
    <path d="M12 6.5C10 5 7.3 4.5 3.5 4.8v13c3.8-.3 6.5.2 8.5 1.7 2-1.5 4.7-2 8.5-1.7v-13C16.7 4.5 14 5 12 6.5z" />
    <path d="M12 6.5v13" />
  </Base>
);

/** Cadeado: parada ainda bloqueada. */
export const IconeCadeado = (p: Props) => (
  <Base {...p}>
    <rect x="5" y="10.5" width="14" height="10" rx="2" />
    <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
  </Base>
);

/** Visto. */
export const IconeFeito = (p: Props) => (
  <Base {...p}>
    <path d="M5 12.5l4.2 4.2L19 7" />
  </Base>
);

/** Ícone por jogo — usado na barra, nos cartões e no painel. */
export const ICONE_DO_JOGO: Record<string, (p: Props) => React.ReactElement> = {
  ilhas: IconeIlha,
  treino: IconeTreino,
  montar: IconeMontar,
  sequencia: IconeOrdem,
  colecao: IconeSelos,
  ranking: IconeRanking,
};

export function IconeJogo({ slug, className }: { slug: string } & Props) {
  const Icone = ICONE_DO_JOGO[slug] ?? IconeIlha;
  return <Icone className={className} />;
}

// ------------------------------------------------ famílias de técnica

/** Punho fechado (socos). */
export const IconeSoco = (p: Props) => (
  <Base {...p}>
    <path d="M6 10.5V8.2a1.6 1.6 0 0 1 3.2 0V10M9.2 9.6V7.4a1.6 1.6 0 0 1 3.2 0v2.4M12.4 9.6V7.8a1.6 1.6 0 0 1 3.2 0V10M15.6 10V9a1.6 1.6 0 0 1 3.2 0v4.5c0 3.6-2.7 6.5-6.3 6.5H11c-2.8 0-5-2.2-5-5v-2.4c0-1.1.9-2 2-2h2.5a1.5 1.5 0 0 1 0 3H9" />
  </Base>
);

/** Pé em chute. */
export const IconeChute = (p: Props) => (
  <Base {...p}>
    <path d="M4 20l5-6 2.5-5.5" />
    <path d="M11.5 8.5L19 6.5c1.2-.3 2 .9 1.2 1.9L18 11l-6 1" />
    <path d="M2.5 13.5h3M3 9.5h3.5" />
  </Base>
);

/** Antebraço defendendo, com o arco do golpe desviado. */
export const IconeDefesa = (p: Props) => (
  <Base {...p}>
    <path d="M5 19L17 7" />
    <path d="M15 5l4 4" />
    <path d="M4 9.5C6 6 9.5 4 13.5 4" strokeDasharray="2 2.5" />
    <path d="M12.5 2.5l1.3 1.5-1.8.9" />
  </Base>
);

/** Base: os dois pés no chão, afastados. */
export const IconeBase = (p: Props) => (
  <Base {...p}>
    <path d="M7 4l-3 11h4M17 4l3 11h-4" />
    <path d="M2 20h20" />
    <path d="M9 9h6" strokeDasharray="1.5 2" />
  </Base>
);

/** Guarda (kamae): mãos à frente. */
export const IconeGuarda = (p: Props) => (
  <Base {...p}>
    <circle cx="12" cy="5" r="2.2" />
    <path d="M12 7.5V14l-3 6M12 14l3 6" />
    <path d="M12 9.5l-4 2 2 2.5M12 9.5l4 1.5 1.5-3" />
  </Base>
);

export const ICONE_DA_FAMILIA: Record<string, (p: Props) => React.ReactElement> = {
  socos: IconeSoco,
  chutes: IconeChute,
  defesas: IconeDefesa,
  bases: IconeBase,
  kamae: IconeGuarda,
};

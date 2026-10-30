/**
 * Contas de progresso (como as da novena no Oratio): uma por etapa, as feitas
 * preenchidas na cor do jogo e a próxima com um anel. Informativas, nunca
 * vermelhas nem em tom de cobrança.
 */
export function Contas({
  total,
  feitas,
  cor,
  proxima,
  tamanho = "md",
  rotulo,
}: {
  total: number;
  /** Quantas, contando do começo — ou a lista exata de índices feitos. */
  feitas: number | number[];
  cor: string;
  /** Índice da próxima etapa (ganha o anel). Padrão: a primeira não feita. */
  proxima?: number;
  tamanho?: "sm" | "md";
  rotulo?: string;
}) {
  const feita = (i: number) => (Array.isArray(feitas) ? feitas.includes(i) : i < feitas);
  const alvo = proxima ?? Array.from({ length: total }, (_, i) => i).find((i) => !feita(i));

  return (
    <span
      className={`contas contas-${tamanho}`}
      style={{ "--game": cor } as React.CSSProperties}
      role={rotulo ? "img" : undefined}
      aria-label={rotulo}
      aria-hidden={rotulo ? undefined : true}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`conta ${feita(i) ? "is-feita" : ""} ${i === alvo ? "is-agora" : ""}`}
        />
      ))}
    </span>
  );
}

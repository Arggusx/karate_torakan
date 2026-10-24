import { cn } from "@/lib/cn";

/**
 * Hinomaru — a versão diurna da lua vermelha.
 *
 * No modo escuro a lua é luz: um disco em neon que espalha brilho. No claro
 * não há escuro para a luz aparecer, então o mesmo círculo vira tinta — o
 * disco chapado sobre papel, como na bandeira. Em volta, dois anéis
 * tracejados girando em sentidos opostos e uma onda que se abre do disco,
 * para o círculo não ficar estático onde a lua do escuro pulsa.
 */
export function Hinomaru({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-160 -160 320 320"
      aria-hidden
      className={cn("hinomaru overflow-visible", className)}
    >
      <circle r="150" className="hinomaru-anel hinomaru-anel-fora" />
      <circle r="128" className="hinomaru-anel hinomaru-anel-dentro" />
      <circle r="100" className="hinomaru-onda" />
      <circle r="100" className="hinomaru-disco" />
    </svg>
  );
}

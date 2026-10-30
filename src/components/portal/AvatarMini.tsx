import { cn } from "@/lib/cn";

const TAMANHOS = {
  sm: "h-7 w-7 text-2xs",
  md: "h-9 w-9 text-xs",
  lg: "h-12 w-12 text-sm",
} as const;

/**
 * Avatar pequeno das listas: a foto quando existe (enviada pela pessoa ou a do
 * Google), senão as iniciais. Sem interação — para editar, AvatarPerfil.
 */
export function AvatarMini({
  src,
  iniciais,
  tamanho = "sm",
  className,
}: {
  src?: string | null;
  iniciais: string;
  tamanho?: keyof typeof TAMANHOS;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-elevated font-medium text-fg",
        TAMANHOS[tamanho],
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : (
        <span aria-hidden>{iniciais}</span>
      )}
    </span>
  );
}

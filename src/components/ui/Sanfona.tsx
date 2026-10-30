import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Item de sanfona (o FAQ do Oratio): o título sempre visível e o conteúdo
 * que abre por baixo. Feito com <details>, então funciona sem JavaScript, é
 * acessível pelo teclado e o Ctrl+F do navegador acha o texto fechado.
 */
export function Sanfona({
  titulo,
  sobretitulo,
  lateral,
  children,
  className,
  aberta = false,
}: {
  titulo: ReactNode;
  /** Linha pequena acima do título (categoria, tipo). */
  sobretitulo?: ReactNode;
  /** Algo à direita do título: kanji, contagem. */
  lateral?: ReactNode;
  children: ReactNode;
  className?: string;
  aberta?: boolean;
}) {
  return (
    <details className={cn("sanfona", className)} open={aberta || undefined}>
      <summary>
        <span className="min-w-0 flex-1">
          {sobretitulo ? <span className="sanfona-sobre">{sobretitulo}</span> : null}
          <span className="sanfona-titulo">{titulo}</span>
        </span>
        {lateral ? <span className="sanfona-lateral">{lateral}</span> : null}
        <svg className="sanfona-seta" viewBox="0 0 24 24" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="sanfona-corpo">{children}</div>
    </details>
  );
}

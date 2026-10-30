import { Obi } from "@/components/ui/Obi";
import { cn } from "@/lib/cn";

/**
 * A faixa como ícone: um obi na cor dela, e o nome ("6º Kyu (Amarela)")
 * numa dica que aparece ao passar o mouse ou focar com o teclado. Para leitor
 * de tela, o nome vai no aria-label.
 */
export function IconeFaixa({
  cor,
  nome,
  className,
}: {
  cor: string;
  nome: string;
  className?: string;
}) {
  return (
    <span
      className={cn("icone-faixa", className)}
      tabIndex={0}
      role="img"
      aria-label={`Faixa recomendada: ${nome}`}
      data-dica={nome}
    >
      <Obi cor={cor} dan={/dan/i.test(nome)} className="icone-faixa-obi" />
    </span>
  );
}

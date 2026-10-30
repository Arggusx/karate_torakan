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
  lado = "direita",
  className,
}: {
  cor: string;
  nome: string;
  /** Para onde a dica abre: "esquerda" quando o ícone fica na borda direita. */
  lado?: "direita" | "esquerda";
  className?: string;
}) {
  return (
    <span
      className={cn("icone-faixa", lado === "esquerda" && "icone-faixa-esquerda", className)}
      tabIndex={0}
      role="img"
      aria-label={`Faixa: ${nome}`}
      data-dica={nome}
    >
      <Obi cor={cor} dan={/dan/i.test(nome)} className="icone-faixa-obi" />
    </span>
  );
}

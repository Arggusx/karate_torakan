"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconePortal, type NomeIcone } from "@/components/portal/IconePortal";

/**
 * Barra inferior do celular para as páginas públicas, como a do Oratio.
 *
 * Substitui o menu de três riscos abaixo de 768px: os destinos ficam à vista
 * e ao alcance do polegar, em vez de escondidos atrás de um toque a mais.
 *
 * Fica fora do <header> de propósito. O cabeçalho tem backdrop-filter, e um
 * filho position: fixed dele se posicionaria em relação ao cabeçalho, não à
 * tela.
 */
export interface ItemBarra {
  href: string;
  label: string;
  icone: NomeIcone;
  /** Ativo só na rota exata (o padrão é "começa com"). */
  exato?: boolean;
}

export function BarraInferiorSite({ itens }: { itens: ItemBarra[] }) {
  const pathname = usePathname();

  const ativo = (item: ItemBarra) =>
    item.exato ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <nav
      aria-label="Navegação principal"
      data-ate="md"
      className="barra-inferior md:hidden"
    >
      {itens.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={ativo(item) ? "page" : undefined}
          className="barra-item"
        >
          <IconePortal nome={item.icone} className="h-5 w-5" />
          <span className="w-full truncate text-center tracking-[-0.01em]">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
}

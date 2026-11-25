"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Botão PT | EN do academy, ao lado do botão de tema.
 *
 * O site abre sempre em português e só muda de idioma quando a pessoa clica
 * aqui — nada é trocado sozinho pelo idioma do navegador. Cada idioma tem o
 * próprio endereço (/estudos/... e /en/estudos/...), para o Google indexar
 * as duas versões.
 *
 * Por enquanto só Técnicas e os katas têm versão em inglês. Numa página em português
 * sem equivalente, o botão leva a Técnicas em inglês.
 */

const COM_VERSAO_EN = /^\/estudos\/tecnicas(\/kata\/[^/]+)?\/?$/;

function destino(caminho: string): { href: string; idioma: "pt" | "en" } {
  if (caminho === "/en" || caminho.startsWith("/en/")) {
    return { href: caminho.replace(/^\/en/, "") || "/estudos", idioma: "pt" };
  }
  return {
    href: COM_VERSAO_EN.test(caminho) ? `/en${caminho}` : "/en/estudos/tecnicas",
    idioma: "en",
  };
}

export function SeletorIdioma() {
  const caminho = usePathname() ?? "/";
  const { href, idioma } = destino(caminho);
  const rotulo = idioma === "en" ? "Read in English" : "Ler em português";

  return (
    <Link
      href={href}
      hrefLang={idioma === "en" ? "en" : "pt-BR"}
      aria-label={rotulo}
      title={rotulo}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface font-rotulo text-2xs font-semibold tracking-[0.08em] text-muted shadow-painel transition-[border-color,color,transform] duration-200 hover:border-accent/50 hover:text-accent active:scale-95 dark:shadow-none"
    >
      {idioma === "en" ? "EN" : "PT"}
    </Link>
  );
}

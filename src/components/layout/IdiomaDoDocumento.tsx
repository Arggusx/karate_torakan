"use client";

import { useEffect } from "react";

/**
 * Ajusta o `lang` do <html> nas páginas em inglês.
 *
 * O layout raiz declara pt-BR para o site inteiro, e trocar isso no servidor
 * obrigaria a separar o layout raiz por idioma. Aqui o atributo muda no
 * navegador e volta ao sair da página; o Google lê o idioma também pelo
 * hreflang e pelo conteúdo.
 */
export function IdiomaDoDocumento({ lang }: { lang: string }) {
  useEffect(() => {
    const anterior = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = anterior;
    };
  }, [lang]);
  return null;
}

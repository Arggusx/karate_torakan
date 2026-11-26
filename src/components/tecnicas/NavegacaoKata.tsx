"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { rotaKata, type Idioma } from "@/i18n/idioma";
import { TEXTOS } from "@/i18n/textos";

/**
 * Navegação entre katas com virada de página.
 *
 * A folha atual gira sobre a lombada — esquerda ou direita conforme o sentido —
 * e a próxima entra por trás. Usa a View Transitions API do navegador: ela
 * fotografa o estado antes e depois da navegação e anima entre os dois, o que
 * dispensa manter as duas páginas montadas ao mesmo tempo.
 *
 * Onde a API não existe, `startViewTransition` é undefined e a navegação
 * acontece normalmente, sem animação. Nada quebra — só não vira página.
 *
 * O sentido vai num atributo no <html> porque o CSS da transição roda fora da
 * árvore do React: os pseudo-elementos ::view-transition são do documento.
 */
export function NavegacaoKata({
  anterior,
  proximo,
  idioma = "pt",
}: {
  anterior: { id: string; nome: string } | null;
  proximo: { id: string; nome: string } | null;
  idioma?: Idioma;
}) {
  const router = useRouter();
  const t = TEXTOS[idioma];

  function virar(
    evento: MouseEvent<HTMLAnchorElement>,
    href: string,
    sentido: "frente" | "tras",
  ) {
    // Deixa passar cliques que o usuário quer em nova aba.
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey) return;

    const iniciar = document.startViewTransition?.bind(document);
    const menosMovimento = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!iniciar || menosMovimento) return;

    evento.preventDefault();
    document.documentElement.dataset.virada = sentido;

    const transicao = iniciar(() => {
      router.push(href);
    });

    transicao.finished.finally(() => {
      delete document.documentElement.dataset.virada;
    });
  }

  return (
    <nav className="grid gap-3 sm:grid-cols-2">
      {anterior ? (
        <Link
          href={rotaKata(idioma, anterior.id)}
          onClick={(e) => virar(e, rotaKata(idioma, anterior.id), "tras")}
          className="card card-hover px-4 py-3"
        >
          <p className="text-2xs text-muted">{t.kataAnterior}</p>
          <p className="mt-0.5 text-sm font-semibold text-fg">
            {anterior.nome}
          </p>
        </Link>
      ) : (
        <div className="card px-4 py-3 opacity-50">
          <p className="text-2xs text-muted">{t.kataAnterior}</p>
          <p className="mt-0.5 text-sm font-semibold text-fg">
            {t.inicioSequencia}
          </p>
        </div>
      )}

      {proximo ? (
        <Link
          href={rotaKata(idioma, proximo.id)}
          onClick={(e) => virar(e, rotaKata(idioma, proximo.id), "frente")}
          className="card card-hover px-4 py-3 text-right"
        >
          <p className="text-2xs text-muted">{t.proximoKata}</p>
          <p className="mt-0.5 text-sm font-semibold text-fg">{proximo.nome}</p>
        </Link>
      ) : (
        <div className="card px-4 py-3 text-right opacity-50">
          <p className="text-2xs text-muted">{t.proximoKata}</p>
          <p className="mt-0.5 text-sm font-semibold text-fg">
            {t.fimSequencia}
          </p>
        </div>
      )}
    </nav>
  );
}

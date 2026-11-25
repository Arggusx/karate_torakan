"use client";

import { useEffect, useRef } from "react";

/**
 * Captcha da Cloudflare (Turnstile), no modo "Managed": quase sempre passa
 * sozinho, sem a pessoa clicar em nada; só acesso suspeito recebe desafio.
 *
 * O token vale uma vez só e expira em 5 minutos. Por isso `renovar` existe:
 * mude o valor depois de cada tentativa recusada e o widget gera outro.
 *
 * Sem site key (produção sem a variável), o componente não renderiza nada e
 * o servidor também não exige o captcha: ver src/server/turnstile.ts.
 */

const SCRIPT =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

/**
 * Chave de teste da própria Cloudflare: sempre passa. Usada só fora de
 * produção, para o login funcionar no localhost sem gastar o widget real.
 */
const CHAVE_DE_TESTE = "1x00000000000000000000AA";

export const SITE_KEY_TURNSTILE =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
  (process.env.NODE_ENV === "production" ? "" : CHAVE_DE_TESTE);

type Opcoes = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  theme: "auto";
  language: string;
  size: "flexible";
};

declare global {
  interface Window {
    turnstile?: {
      render: (alvo: HTMLElement, opcoes: Opcoes) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

let carregando: Promise<void> | null = null;

function carregarScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  carregando ??= new Promise((resolver, rejeitar) => {
    const tag = document.createElement("script");
    tag.src = SCRIPT;
    tag.async = true;
    tag.onload = () => resolver();
    tag.onerror = () => {
      carregando = null;
      rejeitar(new Error("Não foi possível carregar o captcha."));
    };
    document.head.appendChild(tag);
  });
  return carregando;
}

export function Turnstile({
  onToken,
  renovar = 0,
  className,
}: {
  /** Recebe o token novo, ou null quando ele expira ou dá erro. */
  onToken: (token: string | null) => void;
  /** Mude este número para pedir um token novo. */
  renovar?: number;
  className?: string;
}) {
  const alvo = useRef<HTMLDivElement>(null);
  const widget = useRef<string | null>(null);
  const callback = useRef(onToken);
  callback.current = onToken;

  useEffect(() => {
    if (!SITE_KEY_TURNSTILE) return;
    let ativo = true;

    carregarScript()
      .then(() => {
        if (!ativo || !alvo.current || !window.turnstile) return;
        widget.current = window.turnstile.render(alvo.current, {
          sitekey: SITE_KEY_TURNSTILE,
          callback: (token) => callback.current(token),
          "expired-callback": () => callback.current(null),
          "error-callback": () => callback.current(null),
          theme: "auto",
          language: "pt-br",
          size: "flexible",
        });
      })
      .catch(() => callback.current(null));

    return () => {
      ativo = false;
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
      widget.current = null;
    };
  }, []);

  useEffect(() => {
    if (renovar === 0 || !widget.current || !window.turnstile) return;
    callback.current(null);
    window.turnstile.reset(widget.current);
  }, [renovar]);

  if (!SITE_KEY_TURNSTILE) return null;
  return <div ref={alvo} className={className} />;
}

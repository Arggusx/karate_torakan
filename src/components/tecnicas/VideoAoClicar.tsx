"use client";

import { useState } from "react";
import type { Idioma } from "@/i18n/idioma";

const TEXTOS: Record<Idioma, { aviso: string; botao: string }> = {
  pt: {
    aviso: "O vídeo é do YouTube e só carrega se você pedir. Ao abrir, o YouTube recebe dados da sua visita.",
    botao: "Assistir ao vídeo",
  },
  en: {
    aviso: "This video is hosted on YouTube and only loads if you ask. Once it opens, YouTube receives data about your visit.",
    botao: "Watch the video",
  },
};

/**
 * Converte o endereço de embed do YouTube para o domínio sem cookies
 * (youtube-nocookie.com), tira o parâmetro de rastreio de compartilhamento
 * (`si`) e já pede para tocar, já que a pessoa clicou para assistir.
 */
function semCookies(url: string): string {
  try {
    const u = new URL(url);
    if (/(^|\.)youtube\.com$/.test(u.hostname)) u.hostname = "www.youtube-nocookie.com";
    u.searchParams.delete("si");
    u.searchParams.set("autoplay", "1");
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Vídeo do kata que só carrega com um clique, como o mapa da landing.
 *
 * O iframe do YouTube manda dados da visita ao Google assim que a página abre,
 * antes de qualquer escolha da pessoa. Até o clique, nada sai do site; depois,
 * o vídeo vem do domínio sem cookies do YouTube.
 */
export function VideoAoClicar({
  src,
  titulo,
  idioma = "pt",
}: {
  src: string;
  titulo: string;
  idioma?: Idioma;
}) {
  const [ativo, setAtivo] = useState(false);
  const t = TEXTOS[idioma];

  if (ativo) {
    return (
      <iframe
        className="absolute inset-0 h-full w-full"
        src={semCookies(src)}
        title={titulo}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="max-w-sm text-xs leading-relaxed text-muted">{t.aviso}</p>
      <button
        type="button"
        onClick={() => setAtivo(true)}
        className="inline-flex items-center gap-2 rounded-full bg-accent-solid px-4 py-2 text-xs font-semibold text-on-accent transition-transform active:scale-95"
      >
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
        {t.botao}
      </button>
    </div>
  );
}

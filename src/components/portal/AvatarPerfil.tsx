"use client";

import { useRef, useState } from "react";
import { imagemParaAvatar } from "@/lib/imagem";
import { cn } from "@/lib/cn";

/**
 * Avatar do aluno. Mostra a foto quando existe; quando não, as iniciais sobre
 * um fundo neutro — o mesmo fallback que já aparecia nas tabelas.
 *
 * Com `editavel`, um botão de câmera sobreposto abre o seletor de arquivo,
 * reduz a imagem no navegador e chama `onEnviar` com o data URL. O pai decide
 * o que fazer (gravar via API). `onRemover` some quando não há foto.
 */
export function AvatarPerfil({
  src,
  iniciais,
  tamanho = "md",
  editavel = false,
  onEnviar,
  onRemover,
}: {
  src: string | null;
  iniciais: string;
  tamanho?: "md" | "lg";
  editavel?: boolean;
  onEnviar?: (dataUrl: string) => Promise<void> | void;
  onRemover?: () => Promise<void> | void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const dimensao = tamanho === "lg" ? "h-24 w-24 text-2xl" : "h-16 w-16 text-lg";

  async function escolher(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    evento.target.value = ""; // permite reenviar o mesmo arquivo depois
    if (!arquivo) return;

    setErro(null);
    setOcupado(true);
    try {
      const dataUrl = await imagemParaAvatar(arquivo);
      await onEnviar?.(dataUrl);
    } catch (falha) {
      setErro(
        falha instanceof Error ? falha.message : "Não foi possível enviar.",
      );
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-elevated font-semibold text-fg",
            dimensao,
          )}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt="Foto de perfil"
              className="h-full w-full object-cover"
            />
          ) : (
            <span aria-hidden>{iniciais}</span>
          )}
        </div>

        {editavel ? (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={ocupado}
            aria-label={src ? "Trocar foto de perfil" : "Enviar foto de perfil"}
            className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface bg-accent text-white shadow-painel transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {ocupado ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
          </button>
        ) : null}

        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={escolher}
        />
      </div>

      {editavel && src && onRemover ? (
        <button
          type="button"
          onClick={() => onRemover()}
          className="text-2xs text-subtle underline-offset-2 hover:text-accent hover:underline"
        >
          Remover foto
        </button>
      ) : null}

      {erro ? <p className="text-2xs text-status-bad">{erro}</p> : null}
    </div>
  );
}

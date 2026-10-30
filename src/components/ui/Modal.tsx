"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Quantos modais estão abertos agora — a rolagem só volta quando for zero. */
let abertos = 0;

/**
 * Modal desenhado direto no <body>, por portal.
 *
 * Sem o portal, um modal aberto de dentro de outro (a confirmação "Redefinir
 * senha?" dentro da ficha do aluno) ficava preso na caixa do modal de fora:
 * ela tem rolagem interna e um transform da animação de entrada, e os dois
 * juntos recortam qualquer `position: fixed` lá dentro — o diálogo abria
 * invisível.
 */
export function Modal({
  open,
  onClose,
  titulo,
  children,
}: {
  open: boolean;
  onClose: () => void;
  titulo?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    abertos += 1;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      // Fechar o modal de dentro não pode destravar a rolagem com o de fora aberto.
      abertos = Math.max(0, abertos - 1);
      if (abertos === 0) document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-heading/45 backdrop-blur-[2px] dark:bg-black/60"
      />
      <div className="card relative z-10 max-h-[85vh] w-full max-w-lg animate-fade-in overflow-y-auto shadow-lg">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          {titulo ? <h3 className="heading-md">{titulo}</h3> : <span />}
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-muted transition-colors hover:bg-elevated hover:text-heading"
          >
            ×
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

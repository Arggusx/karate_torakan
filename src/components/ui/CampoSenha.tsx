"use client";

import { useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Campo de senha com o botão de olho para mostrar ou esconder o que foi
 * digitado. Aceita as mesmas props de um <input>; o `type` é controlado aqui.
 *
 * O botão fica dentro da caixa, à direita, e não rouba o foco do teclado na
 * ordem normal: Tab passa por ele depois do campo, e Enter no campo continua
 * enviando o formulário.
 */
export function CampoSenha({
  className = "input",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visivel, setVisivel] = useState(false);
  const rotulo = visivel ? "Ocultar senha" : "Mostrar senha";

  return (
    <div className="relative mt-1">
      <input {...props} type={visivel ? "text" : "password"} className={cn(className, "pr-11")} />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        aria-label={rotulo}
        aria-pressed={visivel}
        title={rotulo}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md text-muted transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-[18px] w-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          {/* Com a senha à mostra, o risco indica que o clique volta a esconder. */}
          {visivel ? <path d="M4 4l16 16" /> : null}
        </svg>
      </button>
    </div>
  );
}

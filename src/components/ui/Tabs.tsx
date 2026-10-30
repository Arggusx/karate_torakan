"use client";

import { cn } from "@/lib/cn";

export interface TabOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

/** Segmented control compacto (Kihon / Katas, abas do portal). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  destaque = false,
}: {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  /** Escolha central da página (Kihon / Katas): ganha peso e o acento vermelho. */
  destaque?: boolean;
}) {
  return (
    <div
      role="tablist"
      aria-label="Visualização"
      className={cn(
        // w-fit + self-start: como filho de um flex-column, o `align-items:
        // stretch` padrão esticava a borda até a largura da tela no mobile,
        // deixando um vazio à direita das abas.
        //
        // max-w-full + overflow-x-auto: com cinco abas (portal do admin) o
        // conjunto não cabe em 375px e transbordava cortado. Agora rola na
        // horizontal em vez de sumir fora da tela.
        //
        // Pílula do Oratio: trilho em creme quente, opção ativa em vermelho.
        "inline-flex w-fit max-w-full self-start gap-0.5 overflow-x-auto rounded-full bg-elevated p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              // shrink-0: dentro do container rolável, as abas mantêm a
              // largura do rótulo em vez de comprimirem o texto.
              "shrink-0 whitespace-nowrap rounded-full transition-[background-color,color,box-shadow] duration-[250ms] ease-oratio",
              destaque
                ? "px-5 py-2 text-sm font-bold uppercase tracking-[0.06em]"
                : "px-4 py-1.5 text-sm font-semibold",
              active && "bg-accent-solid text-on-accent shadow-sm",
              !active && "text-muted hover:text-heading",
            )}
          >
            {option.label}
            {option.hint ? (
              <span className="ml-1.5 text-2xs font-normal text-subtle">
                {option.hint}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Chips de filtro rápido. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-[background-color,color] duration-[250ms] ease-oratio",
              active
                ? "bg-accent-solid text-on-accent"
                : "bg-elevated text-muted hover:text-heading",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

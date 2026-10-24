"use client";

import { useEffect, useState, type ReactNode } from "react";
import { IconePortal, type NomeIcone } from "@/components/portal/IconePortal";
import { cn } from "@/lib/cn";

/**
 * Navegação dos portais: trilho lateral no desktop, barra inferior no celular.
 *
 * A barra horizontal de abas que existia antes empurrava o conteúdo para
 * baixo e não tinha para onde crescer — com cinco abas já rolava na
 * horizontal. O trilho cresce para baixo, cabe quantos itens forem precisos,
 * e no celular vira a barra de aplicativo, onde o polegar alcança.
 *
 * O estado de aberto/fechado mora no navegador de quem usa: é preferência de
 * quem está ali, não do sistema.
 */

export interface ItemNav<T extends string> {
  value: T;
  label: string;
  /** Rótulo curto da barra inferior, quando o completo não couber. */
  curto?: string;
  icone: NomeIcone;
  /** Subitens: viram um dropdown no trilho e some da barra inferior. */
  filhos?: { value: T; label: string }[];
}

const CHAVE = "torakan:nav-aberto";

export function NavPortal<T extends string>({
  itens,
  valor,
  onChange,
  titulo,
  rodape,
  children,
}: {
  itens: ItemNav<T>[];
  valor: T;
  onChange: (valor: T) => void;
  /** Nome do portal, mostrado no topo do trilho quando aberto. */
  titulo: string;
  /** Ações fixas no pé do trilho (portal de estudos, sair). */
  rodape?: ReactNode;
  children: ReactNode;
}) {
  const [aberto, setAberto] = useState(true);
  const [montado, setMontado] = useState(false);
  const [grupoAberto, setGrupoAberto] = useState<string | null>(null);

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(CHAVE);
      if (guardado !== null) setAberto(guardado === "1");
    } catch {
      // Navegação anônima ou storage bloqueado: segue com o padrão aberto.
    }
    setMontado(true);
  }, []);

  function alternar() {
    setAberto((atual) => {
      const proximo = !atual;
      try {
        localStorage.setItem(CHAVE, proximo ? "1" : "0");
      } catch {
        /* ignora */
      }
      return proximo;
    });
  }

  /** Um item está ativo quando é o valor, ou quando um filho dele é. */
  const ativo = (item: ItemNav<T>) =>
    item.value === valor || (item.filhos ?? []).some((f) => f.value === valor);

  // Enquanto não montou, o trilho renderiza aberto nos dois lados: é o padrão
  // do servidor, e evita o pulo de largura que uma leitura tardia causaria.
  const expandido = !montado || aberto;

  return (
    <>
      <div className="flex">
        <aside
          className={cn(
            "sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-200 lg:flex",
            expandido ? "w-[250px]" : "w-[76px]",
          )}
        >
          <div
            className={cn(
              "flex h-14 items-center border-b border-line px-3",
              expandido ? "justify-between" : "justify-center",
            )}
          >
            {expandido ? (
              <span className="truncate text-2xs font-semibold uppercase tracking-[0.1em] text-gold">
                {titulo}
              </span>
            ) : null}
            <button
              type="button"
              onClick={alternar}
              aria-label={expandido ? "Recolher menu" : "Expandir menu"}
              aria-expanded={expandido}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-elevated hover:text-fg"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
            {itens.map((item) => {
              const temFilhos = (item.filhos ?? []).length > 0;
              const estaAtivo = ativo(item);
              const filhosVisiveis =
                expandido && temFilhos &&
                (grupoAberto === item.value || estaAtivo);

              return (
                <div key={item.value}>
                  <button
                    type="button"
                    title={expandido ? undefined : item.label}
                    aria-current={item.value === valor ? "page" : undefined}
                    onClick={() => {
                      if (temFilhos) {
                        // Fechado, clicar num grupo primeiro abre o trilho:
                        // não há onde mostrar os filhos em 76px.
                        if (!expandido) {
                          alternar();
                          setGrupoAberto(item.value);
                          return;
                        }
                        setGrupoAberto((atual) =>
                          atual === item.value ? null : item.value,
                        );
                        onChange(item.filhos![0].value);
                        return;
                      }
                      onChange(item.value);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      expandido ? "justify-start" : "justify-center",
                      estaAtivo
                        ? "bg-accent/10 text-accent"
                        : "text-muted hover:bg-elevated hover:text-fg",
                    )}
                  >
                    <IconePortal nome={item.icone} className="h-5 w-5 shrink-0" />
                    {expandido ? (
                      <>
                        <span className="flex-1 truncate text-left">
                          {item.label}
                        </span>
                        {temFilhos ? (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={cn(
                              "shrink-0 transition-transform duration-200",
                              filhosVisiveis && "rotate-180",
                            )}
                            aria-hidden
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        ) : null}
                      </>
                    ) : null}
                  </button>

                  {filhosVisiveis ? (
                    <ul className="ml-[22px] mt-0.5 space-y-0.5 border-l border-line pl-3">
                      {item.filhos!.map((filho) => (
                        <li key={filho.value}>
                          <button
                            type="button"
                            onClick={() => onChange(filho.value)}
                            aria-current={
                              filho.value === valor ? "page" : undefined
                            }
                            className={cn(
                              "w-full rounded-md px-2.5 py-1.5 text-left text-xs transition-colors",
                              filho.value === valor
                                ? "font-medium text-accent"
                                : "text-muted hover:bg-elevated hover:text-fg",
                            )}
                          >
                            {filho.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </nav>

          {rodape ? (
            <div
              className={cn(
                "border-t border-line p-2",
                expandido ? "" : "flex flex-col items-center",
              )}
              data-trilho-aberto={expandido ? "1" : "0"}
            >
              {rodape}
            </div>
          ) : null}
        </aside>

        {/* pb-20 abre espaço para a barra inferior não cobrir o fim da página. */}
        <div className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</div>
      </div>

      <BarraInferior itens={itens} valor={valor} onChange={onChange} />
    </>
  );
}

/**
 * Barra inferior do celular. Itens com filhos entram achatados: na barra o
 * que importa é chegar em um lugar com um toque, não refletir a hierarquia.
 */
function BarraInferior<T extends string>({
  itens,
  valor,
  onChange,
}: {
  itens: ItemNav<T>[];
  valor: T;
  onChange: (valor: T) => void;
}) {
  const planos = itens.flatMap((item) =>
    (item.filhos ?? []).length > 0
      ? item.filhos!.map((filho) => ({
          value: filho.value,
          label: filho.label,
          icone: item.icone,
        }))
      : [{ value: item.value, label: item.curto ?? item.label, icone: item.icone }],
  );

  return (
    <nav
      aria-label="Seções do portal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch">
        {planos.map((item) => {
          const estaAtivo = item.value === valor;
          return (
            <li key={item.value} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => onChange(item.value)}
                aria-current={estaAtivo ? "page" : undefined}
                className={cn(
                  "flex w-full flex-col items-center gap-1 px-1 pb-2 pt-2.5 transition-colors",
                  estaAtivo ? "text-accent" : "text-subtle hover:text-fg",
                )}
              >
                {/* A marca do item ativo é um traço acima do ícone, como em
                    app de treino: some do caminho do polegar. */}
                <span
                  aria-hidden
                  className={cn(
                    "h-0.5 w-7 rounded-full transition-colors",
                    estaAtivo ? "bg-accent" : "bg-transparent",
                  )}
                />
                <IconePortal nome={item.icone} className="h-5 w-5" />
                <span className="w-full truncate text-center text-[0.625rem] font-medium uppercase tracking-[0.06em]">
                  {item.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

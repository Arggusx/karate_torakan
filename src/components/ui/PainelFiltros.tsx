"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface GrupoFiltro {
  id: string;
  rotulo: string;
  opcoes: { id: string; rotulo: string }[];
}

/** Escolha atual: id da opção por grupo, ou null para "todos". */
export type ValoresFiltro = Record<string, string | null>;

/**
 * Filtros reunidos atrás de um botão "Filtros" (o FilterPanel do Oratio):
 * em vez de uma fileira de selects e chips na página, a pessoa abre um painel,
 * escolhe com calma e confirma em "Aplicar". O que está valendo aparece ao
 * lado do botão em chips que se tiram com um toque.
 *
 * `contar(rascunho)`, opcional, mostra quantos resultados a escolha traz — e
 * desliga as opções que não trariam nenhum.
 *
 * `antes` fica à esquerda do botão (a busca, que continua à vista).
 */
export function PainelFiltros({
  grupos,
  valores,
  onAplicar,
  contar,
  antes,
}: {
  grupos: GrupoFiltro[];
  valores: ValoresFiltro;
  onAplicar: (valores: ValoresFiltro) => void;
  contar?: (rascunho: ValoresFiltro) => number;
  antes?: ReactNode;
}) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [rascunho, setRascunho] = useState(valores);

  // Clique no fundo escurecido (fora do painel) fecha sem aplicar.
  useEffect(() => {
    const d = dialogo.current;
    const fora = (e: MouseEvent) => {
      if (e.target === d) d?.close();
    };
    d?.addEventListener("click", fora);
    return () => d?.removeEventListener("click", fora);
  }, []);

  function abrir() {
    setRascunho(valores);
    dialogo.current?.showModal();
  }

  function aplicar() {
    onAplicar(rascunho);
    dialogo.current?.close();
  }

  const ativos = grupos.flatMap((g) => {
    const opcao = g.opcoes.find((o) => o.id === valores[g.id]);
    return opcao ? [{ grupo: g, opcao }] : [];
  });
  const limpos: ValoresFiltro = Object.fromEntries(grupos.map((g) => [g.id, null]));
  const totalRascunho = contar?.(rascunho);

  return (
    <div className="filtros-barra">
      {antes}
      <button type="button" className="filtros-abrir" onClick={abrir} aria-haspopup="dialog">
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4" />
        </svg>
        Filtros
        {ativos.length > 0 ? <span className="filtros-conta">{ativos.length}</span> : null}
      </button>

      {ativos.map(({ grupo, opcao }) => (
        <button
          key={grupo.id}
          type="button"
          className="filtros-chip-ativo"
          onClick={() => onAplicar({ ...valores, [grupo.id]: null })}
          aria-label={`Tirar filtro ${grupo.rotulo}: ${opcao.rotulo}`}
        >
          {opcao.rotulo}
          <span aria-hidden>×</span>
        </button>
      ))}
      {ativos.length > 1 ? (
        <button type="button" className="filtros-limpar" onClick={() => onAplicar(limpos)}>
          Limpar tudo
        </button>
      ) : null}

      <dialog ref={dialogo} className="filtros-painel" aria-labelledby="filtros-titulo">
        <header className="filtros-painel-topo">
          <h2 id="filtros-titulo">Filtros</h2>
          <button
            type="button"
            className="filtros-fechar"
            onClick={() => dialogo.current?.close()}
            aria-label="Fechar sem aplicar"
          >
            ×
          </button>
        </header>

        <div className="filtros-painel-corpo">
          {grupos.map((g) => (
            <fieldset key={g.id} className="filtros-grupo">
              <legend>{g.rotulo}</legend>
              <div className="flex flex-wrap gap-1.5">
                {g.opcoes.map((o) => {
                  const marcada = rascunho[g.id] === o.id;
                  const quantos = contar?.({ ...rascunho, [g.id]: o.id });
                  return (
                    <button
                      key={o.id}
                      type="button"
                      aria-pressed={marcada}
                      disabled={quantos === 0 && !marcada}
                      onClick={() => setRascunho({ ...rascunho, [g.id]: marcada ? null : o.id })}
                      className="filtros-opcao"
                    >
                      {o.rotulo}
                      {quantos !== undefined ? <span className="filtros-opcao-conta"> ({quantos})</span> : null}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </div>

        <footer className="filtros-painel-pe">
          <button type="button" className="filtros-limpar-rascunho" onClick={() => setRascunho(limpos)}>
            Limpar
          </button>
          <button type="button" className="filtros-aplicar" onClick={aplicar}>
            Aplicar filtros{totalRascunho !== undefined ? ` (${totalRascunho})` : ""}
          </button>
        </footer>
      </dialog>
    </div>
  );
}

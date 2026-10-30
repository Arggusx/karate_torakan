"use client";

import { useEffect, useState, type ReactNode } from "react";

export interface AbaSecao {
  id: string;
  label: string;
  conteudo: ReactNode;
}

/**
 * Abas em pílula do Oratio (.subnav-segmented): trilho creme, aba ativa
 * clara com o texto no vermelho. Para dividir uma página longa em tópicos
 * sem mudar de rota.
 *
 * A aba escolhida vai para a URL (?secao=), então dá para mandar o link de
 * um tópico e o voltar do navegador não perde o lugar. Todas as abas são
 * renderizadas no servidor; só a visível aparece.
 */
export function AbasSecao({
  abas,
  parametro = "secao",
  rotulo = "Tópicos da página",
}: {
  abas: AbaSecao[];
  parametro?: string;
  rotulo?: string;
}) {
  const [ativa, setAtiva] = useState(abas[0]?.id ?? "");

  useEffect(() => {
    const pedida = new URLSearchParams(window.location.search).get(parametro);
    if (pedida && abas.some((a) => a.id === pedida)) setAtiva(pedida);
  }, [abas, parametro]);

  function escolher(id: string) {
    setAtiva(id);
    const url = new URL(window.location.href);
    if (id === abas[0]?.id) url.searchParams.delete(parametro);
    else url.searchParams.set(parametro, id);
    window.history.replaceState(null, "", url);
  }

  return (
    <div>
      <div role="tablist" aria-label={rotulo} className="abas-secao">
        {abas.map((aba) => (
          <button
            key={aba.id}
            id={`aba-${aba.id}`}
            type="button"
            role="tab"
            aria-selected={aba.id === ativa}
            aria-controls={`painel-${aba.id}`}
            onClick={() => escolher(aba.id)}
          >
            {aba.label}
          </button>
        ))}
      </div>
      {abas.map((aba) => (
        <div
          key={aba.id}
          id={`painel-${aba.id}`}
          role="tabpanel"
          aria-labelledby={`aba-${aba.id}`}
          hidden={aba.id !== ativa}
          className="abas-secao-painel"
        >
          {aba.conteudo}
        </div>
      ))}
    </div>
  );
}

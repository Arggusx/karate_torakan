"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

/**
 * "Como funciona": a explicação de uma tela, aberta na primeira visita e
 * depois guardada atrás do botão "?", que a reabre quando a pessoa quiser.
 *
 * Quais explicações já foram vistas fica só neste aparelho (localStorage).
 * Sem acesso ao armazenamento (aba anônima, bloqueio), a explicação abre
 * toda vez — nada quebra.
 */

const CHAVE = "torakan:intros-vistas";

function lerVistas(): string[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as string[]) : [];
  } catch {
    return [];
  }
}

function marcarVista(id: string) {
  try {
    const vistas = lerVistas();
    if (!vistas.includes(id)) localStorage.setItem(CHAVE, JSON.stringify([...vistas, id]));
  } catch {
    // Sem armazenamento: só não lembra.
  }
}

export function ComoFunciona({
  id,
  passos,
  nota,
  titulo = "Como funciona",
}: {
  id: string;
  passos: string[];
  nota?: string;
  titulo?: string;
}) {
  // Começa fechado no servidor e decide no navegador, que é onde a lista mora.
  const [aberto, setAberto] = useState(false);
  useEffect(() => {
    setAberto(!lerVistas().includes(id));
  }, [id]);

  const fechar = () => {
    setAberto(false);
    marcarVista(id);
  };

  if (!aberto) {
    return (
      <button type="button" className="jogo-intro-botao" onClick={() => setAberto(true)}>
        <span aria-hidden className="jogo-intro-interrogacao">?</span>
        {titulo}
      </button>
    );
  }

  return (
    <section className="jogo-intro" aria-label={titulo}>
      <header>
        <strong>
          <span aria-hidden className="jogo-intro-interrogacao">?</span>
          {titulo}
        </strong>
        <button type="button" onClick={fechar} aria-label="Fechar explicação" className="jogo-intro-fechar">
          ×
        </button>
      </header>
      <ol>
        {passos.map((passo) => (
          <li key={passo}>{passo}</li>
        ))}
      </ol>
      {nota ? <p className="jogo-intro-nota">{nota}</p> : null}
      <Button size="sm" onClick={fechar}>
        Entendi, vamos lá
      </Button>
    </section>
  );
}

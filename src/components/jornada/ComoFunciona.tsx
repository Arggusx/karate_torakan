"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { jornada, useJornada } from "@/lib/jornadaStore";

/**
 * "Como funciona": a explicação de um jogo, como a GameIntro do Oratio.
 * Aberta na primeira visita; depois fica atrás do botão "?" e abre de novo
 * quando a pessoa quiser.
 */
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
  const { introsVistas } = useJornada();
  const primeiraVez = !introsVistas.includes(id);
  const [aberto, setAberto] = useState<boolean | null>(null);
  const mostrar = aberto ?? primeiraVez;

  const fechar = () => {
    setAberto(false);
    jornada.verIntro(id);
  };

  if (!mostrar) {
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

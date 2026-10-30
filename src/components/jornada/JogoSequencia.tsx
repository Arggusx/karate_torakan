"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ComoFunciona } from "@/components/jornada/ComoFunciona";
import { Contas } from "@/components/jornada/Contas";
import { jogo } from "@/components/jornada/jogos";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { jornada, useJornada } from "@/lib/jornadaStore";
import { getKatas } from "@/services/dataService";
import { TRECHO, trechosDo } from "@/services/jornada";
import { criarSorteio, novaSemente } from "@/services/perguntas";
import type { KataCompleto } from "@/types";

const COR = jogo("sequencia")!.cor;
const KATAS = getKatas();

/**
 * Sequência do kata: os movimentos de um trecho aparecem embaralhados e a
 * pessoa toca na ordem certa. Errar só balança a carta. Ordenar todos os
 * trechos de um kata o coloca no Leque dos katas.
 */
export function JogoSequencia() {
  const params = useSearchParams();
  const kata = KATAS.find((k) => k.id === params.get("kata"));

  return (
    <div style={{ "--game": COR } as React.CSSProperties}>
      <ComoFunciona
        id="sequencia"
        passos={[
          "Escolha um kata.",
          `Cada rodada mostra ${TRECHO} movimentos seguidos, fora de ordem.`,
          "Toque neles na ordem em que acontecem no kata.",
          "Ordene todos os trechos para guardar o kata no Leque.",
        ]}
        nota="Os movimentos seguem a sequência do acervo do dojo — a mesma da página de cada kata."
      />
      {kata ? <Trechos kata={kata} /> : <ListaDeKatas />}
    </div>
  );
}

function ListaDeKatas() {
  const estado = useJornada();
  return (
    <div className="grade-centrada grade-4 [--grade-gap:0.6rem]">
      {KATAS.map((k) => {
        const total = trechosDo(k.movimentosDetalhados.length);
        const feitos = estado.sequencias[k.id] ?? [];
        return (
          <Link key={k.id} href={`/estudos/jornada/sequencia?kata=${k.id}`} className="jogo-tile !gap-2 !p-3">
            <span className="flex items-baseline justify-between gap-2">
              <strong className="text-sm text-heading">{k.nome}</strong>
              <span className="font-kanji text-xs text-muted">{k.kanji}</span>
            </span>
            <span className="flex items-center justify-between gap-2">
              <Contas total={total} feitas={feitos} cor={COR} tamanho="sm" />
              <span className="jogo-tile-conta text-2xs">
                {feitos.length >= total ? "No leque" : `${feitos.length}/${total}`}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

const rotulo = (m: KataCompleto["movimentosDetalhados"][number]) =>
  `${m.tecnica}${m.direcao ? ` — ${m.direcao}` : ""}`;

function Trechos({ kata }: { kata: KataCompleto }) {
  const estado = useJornada();
  const total = trechosDo(kata.movimentosDetalhados.length);
  const feitos = estado.sequencias[kata.id] ?? [];
  const [trecho, setTrecho] = useState(0);
  const [semente, setSemente] = useState(novaSemente);
  const [postos, setPostos] = useState<number[]>([]);
  const [errado, setErrado] = useState<number | null>(null);

  const movimentos = kata.movimentosDetalhados.slice(trecho * TRECHO, trecho * TRECHO + TRECHO);
  const embaralhados = useMemo(
    () => criarSorteio(semente).embaralhar(movimentos.map((_, i) => i)),
    [semente, trecho, kata.id],
  );
  const completo = postos.length === movimentos.length;

  function tocar(i: number) {
    if (postos.includes(i) || completo) return;
    const esperado = movimentos[postos.length];
    // Dois movimentos idênticos (mesma técnica e deslocamento) valem nos dois sentidos.
    if (rotulo(movimentos[i]) === rotulo(esperado)) {
      const proximos = [...postos, i];
      setPostos(proximos);
      setErrado(null);
      if (proximos.length === movimentos.length) jornada.ordenarTrecho(kata.id, trecho);
    } else {
      setErrado(i);
      window.setTimeout(() => setErrado(null), 400);
    }
  }

  function irPara(t: number) {
    setTrecho(t);
    setSemente(novaSemente());
    setPostos([]);
  }

  const primeiro = movimentos[0]?.numero;
  const ultimo = movimentos[movimentos.length - 1]?.numero;

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow" style={{ color: COR }}>{kata.kanji}</p>
          <h2 className="heading-lg">{kata.nome}</h2>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            Movimentos {primeiro} a {ultimo} · trecho {trecho + 1} de {total}
            <Contas total={total} feitas={feitos} proxima={trecho} cor={COR} tamanho="sm" />
          </p>
        </div>
        <Link href="/estudos/jornada/sequencia" className="text-sm font-semibold text-muted hover:text-accent">
          Outros katas
        </Link>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <section>
          <p className="label mb-2">Toque na ordem</p>
          <div className="sequencia-fila">
            {embaralhados.map((i) => (
              <button
                key={`${semente}-${i}`}
                type="button"
                onClick={() => tocar(i)}
                disabled={postos.includes(i)}
                className={cn("sequencia-item", postos.includes(i) && "is-posto", errado === i && "is-errado")}
              >
                <span className="sequencia-numero">{postos.includes(i) ? postos.indexOf(i) + primeiro : "?"}</span>
                <span>
                  <span className="block font-semibold text-heading">{movimentos[i].tecnica}</span>
                  {movimentos[i].direcao ? (
                    <span className="block text-2xs text-muted">{movimentos[i].direcao}</span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section>
          <p className="label mb-2">Sua sequência</p>
          <ol className="sequencia-fila">
            {movimentos.map((m, n) => {
              const i = postos[n];
              return (
                <li key={m.numero} className={cn("sequencia-item", i !== undefined && "is-posto")}>
                  <span className="sequencia-numero">{m.numero}</span>
                  <span className="text-sm">
                    {i !== undefined ? (
                      <>
                        <span className="block font-semibold text-heading">{movimentos[i].tecnica}</span>
                        <span className="block text-2xs text-muted">{movimentos[i].traducao}</span>
                      </>
                    ) : (
                      <span className="text-subtle">…</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      {completo ? (
        <div className="painel mt-5" aria-live="polite">
          <p className="quiz-fim-titulo" style={{ "--game": COR } as React.CSSProperties}>
            {feitos.length >= total ? "Kata no leque" : "Trecho na ordem"}
          </p>
          <p className="body-muted">
            {feitos.length >= total
              ? `Você ordenou o ${kata.nome} inteiro. Ele está no seu Leque dos katas.`
              : `Faltam ${total - feitos.length} ${total - feitos.length === 1 ? "trecho" : "trechos"} para guardar o ${kata.nome}.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {trecho + 1 < total ? <Button size="sm" onClick={() => irPara(trecho + 1)}>Próximo trecho</Button> : null}
            <Button size="sm" variant="secondary" onClick={() => irPara(trecho)}>Fazer de novo</Button>
            <Link href={`/estudos/tecnicas/kata/${kata.id}`} className="self-center text-xs font-semibold text-muted hover:text-accent">
              Ver o kata completo →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

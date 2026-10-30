"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ComoFunciona } from "@/components/jornada/ComoFunciona";
import { Contas } from "@/components/jornada/Contas";
import { jogo } from "@/components/jornada/jogos";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { jornada, useJornada } from "@/lib/jornadaStore";
import { BARALHOS, PARES, type Baralho } from "@/services/jornada";
import { criarSorteio, novaSemente } from "@/services/perguntas";

const COR = jogo("karuta")!.cor;

/**
 * Karuta: o jogo de cartas japonês, aqui como jogo da memória. Cada par é um
 * termo e o seu significado. O baralho é dividido em rodadas de seis pares;
 * vencer todas as rodadas completa o baralho na coleção.
 */
export function JogoKaruta() {
  const params = useSearchParams();
  const baralho = BARALHOS.find((b) => b.id === params.get("baralho"));

  return (
    <div style={{ "--game": COR } as React.CSSProperties}>
      <ComoFunciona
        id="karuta"
        passos={[
          "Escolha um baralho: bases, socos, defesas, princípios…",
          "Vire duas cartas. Se forem o termo e o seu significado, elas ficam abertas.",
          `Abra os ${PARES} pares para vencer a rodada.`,
          "Vença todas as rodadas do baralho para guardá-lo na sua coleção.",
        ]}
        nota="Não tem relógio nem limite de tentativas."
      />
      {baralho ? <Mesa baralho={baralho} /> : <Baralhos />}
    </div>
  );
}

const rodadasDo = (b: Baralho) => Math.ceil(b.cartas.length / PARES);

function Baralhos() {
  const estado = useJornada();
  return (
    <div className="grade-centrada grade-3">
      {BARALHOS.map((b) => {
        const feitas = estado.rodadasKaruta[b.id] ?? [];
        const total = rodadasDo(b);
        return (
          <Link key={b.id} href={`/estudos/jornada/karuta?baralho=${b.id}`} className="jogo-tile">
            <span className="jogo-tile-cabeca">
              <span className="jogo-icone" aria-hidden>{b.kanji.slice(0, 1)}</span>
              <span className="jogo-tile-texto">
                <strong>{b.nome}</strong>
                <small>{b.cartas.length} cartas · {total} {total === 1 ? "rodada" : "rodadas"}</small>
              </span>
            </span>
            <span className="flex items-center justify-between gap-2">
              <Contas total={total} feitas={feitas.map((r) => r)} cor={COR} tamanho="sm" />
              <span className="jogo-tile-conta">{estado.karuta.includes(b.id) ? "Completo" : `${feitas.length}/${total}`}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

interface Carta {
  id: string;
  par: number;
  texto: string;
  termo: boolean;
}

function Mesa({ baralho }: { baralho: Baralho }) {
  const estado = useJornada();
  const total = rodadasDo(baralho);
  const vencidas = estado.rodadasKaruta[baralho.id] ?? [];
  // Começa pela primeira rodada ainda não vencida.
  const primeiraAberta = Array.from({ length: total }, (_, i) => i).find((i) => !vencidas.includes(i)) ?? 0;
  const [rodada, setRodada] = useState(primeiraAberta);
  const [semente, setSemente] = useState(novaSemente);

  const cartas = useMemo<Carta[]>(() => {
    const s = criarSorteio(semente);
    const fatia = baralho.cartas.slice(rodada * PARES, rodada * PARES + PARES);
    // A última rodada pode ter menos pares: completa com cartas das anteriores.
    const pares = fatia.length < PARES ? [...fatia, ...s.embaralhar(baralho.cartas.slice(0, rodada * PARES)).slice(0, PARES - fatia.length)] : fatia;
    return s.embaralhar(
      pares.flatMap((c, i) => [
        { id: `t${i}`, par: i, texto: c.termo, termo: true },
        { id: `s${i}`, par: i, texto: c.significado, termo: false },
      ]),
    );
  }, [baralho, rodada, semente]);

  const [viradas, setViradas] = useState<string[]>([]);
  const [achados, setAchados] = useState<number[]>([]);
  const completa = achados.length === cartas.length / 2;

  // Duas cartas viradas: confere o par; se não for, desvira depois de um instante.
  useEffect(() => {
    if (viradas.length !== 2) return;
    const [a, b] = viradas.map((id) => cartas.find((c) => c.id === id)!);
    if (a.par === b.par) {
      setAchados((x) => [...x, a.par]);
      setViradas([]);
      return;
    }
    const t = window.setTimeout(() => setViradas([]), 900);
    return () => window.clearTimeout(t);
  }, [viradas, cartas]);

  useEffect(() => {
    if (completa) jornada.vencerRodadaKaruta(baralho.id, rodada, total);
  }, [completa, baralho.id, rodada, total]);

  function virar(id: string) {
    if (viradas.length === 2 || viradas.includes(id)) return;
    setViradas((v) => [...v, id]);
  }

  function irPara(r: number) {
    setRodada(r);
    setSemente(novaSemente());
    setViradas([]);
    setAchados([]);
  }

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow" style={{ color: COR }}>Karuta</p>
          <h2 className="heading-lg">{baralho.nome}</h2>
          <p className="mt-1 flex items-center gap-2 text-xs text-muted">
            Rodada {rodada + 1} de {total}
            <Contas total={total} feitas={vencidas} proxima={rodada} cor={COR} tamanho="sm" />
          </p>
        </div>
        <Link href="/estudos/jornada/karuta" className="text-sm font-semibold text-muted hover:text-accent">
          Outros baralhos
        </Link>
      </header>

      <div className="karuta-mesa">
        {cartas.map((c) => {
          const aberta = viradas.includes(c.id) || achados.includes(c.par);
          return (
            <div
              key={c.id}
              className={cn("karuta-carta", viradas.includes(c.id) && "is-virada", achados.includes(c.par) && "is-par")}
            >
              <button
                type="button"
                onClick={() => virar(c.id)}
                disabled={aberta}
                aria-label={aberta ? c.texto : "Carta virada para baixo"}
              >
                <span className="karuta-face karuta-verso" aria-hidden>札</span>
                <span className={cn("karuta-face karuta-frente", c.termo && "is-termo")} aria-hidden={!aberta}>
                  {c.texto}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {completa ? (
        <div className="painel mt-5" aria-live="polite">
          <p className="quiz-fim-titulo" style={{ "--game": COR } as React.CSSProperties}>
            {estado.karuta.includes(baralho.id) ? "Baralho completo" : "Rodada vencida"}
          </p>
          <p className="body-muted">
            {estado.karuta.includes(baralho.id)
              ? `O baralho ${baralho.nome} está guardado no seu Livro de selos.`
              : `Faltam ${total - vencidas.length} ${total - vencidas.length === 1 ? "rodada" : "rodadas"} para completar o baralho.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {rodada + 1 < total ? (
              <Button size="sm" onClick={() => irPara(rodada + 1)}>Próxima rodada</Button>
            ) : null}
            <Button size="sm" variant="secondary" onClick={() => irPara(rodada)}>Jogar de novo</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

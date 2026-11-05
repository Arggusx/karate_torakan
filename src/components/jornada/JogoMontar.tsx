"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ComoFunciona } from "@/components/jornada/ComoFunciona";
import { Contas } from "@/components/jornada/Contas";
import { ICONE_DA_FAMILIA, IconeMontar } from "@/components/jornada/IconesJornada";
import { jogo } from "@/components/jornada/jogos";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { jornada, useJornada } from "@/lib/jornadaStore";
import {
  FAMILIAS,
  POR_RODADA,
  pecasDe,
  rodadasDa,
  significadoDaPeca,
  type Familia,
} from "@/services/jornada";
import { criarSorteio, novaSemente } from "@/services/perguntas";

const COR = jogo("montar")!.cor;

/**
 * Monte a técnica: aparece o que o golpe faz, em português, e um punhado de
 * palavras japonesas. A pessoa junta as palavras na ordem certa para formar
 * o nome (Gedan + Barai). Depois de cada uma, o jogo mostra o que cada
 * palavra quer dizer — é assim que se aprende a "ler" o nome de qualquer
 * técnica nova.
 */
export function JogoMontar() {
  const params = useSearchParams();
  const familia = FAMILIAS.find((f) => f.id === params.get("familia"));

  return (
    <div style={{ "--game": COR } as React.CSSProperties}>
      <ComoFunciona
        id="montar"
        titulo="Como funciona o Monte a técnica"
        passos={[
          "Escolha uma família: socos, chutes, defesas, bases ou guardas.",
          "Leia o que o golpe faz e toque nas palavras japonesas na ordem certa para formar o nome.",
          "Tocou errado? Toque na palavra montada para devolvê-la. Depois é só conferir.",
          `Cada rodada tem até ${POR_RODADA} técnicas. Acerte quase todas para vencer a rodada; vença todas as rodadas da família para completá-la.`,
        ]}
        nota="Depois de cada técnica aparece o significado de cada palavra: zuki é soco, gedan é nível baixo…"
      />
      {familia ? <Mesa key={familia.id} familia={familia} /> : <Familias />}
    </div>
  );
}

function Familias() {
  const estado = useJornada();
  return (
    <div className="grade-centrada grade-3">
      {FAMILIAS.map((f) => {
        const feitas = estado.montagem[f.id] ?? [];
        const total = rodadasDa(f);
        const Icone = ICONE_DA_FAMILIA[f.id] ?? IconeMontar;
        return (
          <Link key={f.id} href={`/estudos/jornada/montar?familia=${f.id}`} className="jogo-tile">
            <span className="jogo-tile-cabeca">
              <span className="jogo-icone" aria-hidden>
                <Icone className="h-6 w-6" />
              </span>
              <span className="jogo-tile-texto">
                <strong>{f.nome}</strong>
                <small>
                  {f.tecnicas.length} técnicas · {total} {total === 1 ? "rodada" : "rodadas"}
                </small>
              </span>
            </span>
            <span className="flex items-center justify-between gap-2">
              <Contas total={total} feitas={feitas} cor={COR} tamanho="sm" />
              <span className="jogo-tile-conta">
                {estado.familias.includes(f.id) ? "Completa" : `${feitas.length}/${total}`}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** Tira o nome da técnica da descrição, para a pista não entregar a resposta. */
function semONome(texto: string, nome: string) {
  let saida = texto.split(/(?<=[.!?])\s/)[0] ?? texto;
  for (const peca of pecasDe(nome)) {
    if (peca.length > 2) saida = saida.replace(new RegExp(peca, "gi"), "____");
  }
  return saida;
}

function Mesa({ familia }: { familia: Familia }) {
  const estado = useJornada();
  const total = rodadasDa(familia);
  const feitas = estado.montagem[familia.id] ?? [];
  const primeiraPorFazer = Array.from({ length: total }, (_, i) => i).find((i) => !feitas.includes(i)) ?? 0;
  const [rodada, setRodada] = useState(primeiraPorFazer);
  const [semente, setSemente] = useState(novaSemente);
  const [vez, setVez] = useState(0);
  const [montadas, setMontadas] = useState<number[]>([]);
  const [conferida, setConferida] = useState<boolean | null>(null);
  const [acertos, setAcertos] = useState(0);
  const [fim, setFim] = useState<{ venceu: boolean; pontos: number } | null>(null);

  // As técnicas da rodada, embaralhadas, e as peças de cada uma.
  const tecnicas = useMemo(() => {
    const lista = familia.tecnicas.slice(rodada * POR_RODADA, rodada * POR_RODADA + POR_RODADA);
    return criarSorteio(semente).embaralhar(lista);
  }, [familia, rodada, semente]);

  const atual = tecnicas[vez];
  const certas = useMemo(() => (atual ? pecasDe(atual.nome) : []), [atual]);
  const pecas = useMemo(() => {
    if (!atual) return [];
    const s = criarSorteio(semente + vez * 7919);
    const minusculas = new Set(certas.map((p) => p.toLowerCase()));
    const extras: string[] = [];
    for (const outra of s.embaralhar(familia.tecnicas.flatMap((t) => pecasDe(t.nome)))) {
      if (minusculas.has(outra.toLowerCase())) continue;
      minusculas.add(outra.toLowerCase());
      extras.push(outra);
      if (extras.length === 3) break;
    }
    return s.embaralhar([...certas, ...extras]);
  }, [atual, certas, familia, semente, vez]);

  const passa = Math.ceil(tecnicas.length * 0.7);

  function tocar(i: number) {
    if (conferida !== null || montadas.includes(i) || montadas.length >= certas.length) return;
    setMontadas((m) => [...m, i]);
  }

  function devolver(posicao: number) {
    if (conferida !== null) return;
    setMontadas((m) => m.filter((_, k) => k !== posicao));
  }

  function conferir() {
    const ok = montadas.map((i) => pecas[i].toLowerCase()).join(" ") === certas.map((p) => p.toLowerCase()).join(" ");
    setConferida(ok);
    if (ok) setAcertos((a) => a + 1);
  }

  function proxima() {
    if (vez + 1 < tecnicas.length) {
      setVez(vez + 1);
      setMontadas([]);
      setConferida(null);
      return;
    }
    const venceu = acertos >= passa;
    const pontos = jornada.terminarMontagem(familia.id, rodada, total, acertos, tecnicas.length, venceu);
    setFim({ venceu, pontos });
  }

  function irPara(r: number) {
    setRodada(r);
    setSemente(novaSemente());
    setVez(0);
    setMontadas([]);
    setConferida(null);
    setAcertos(0);
    setFim(null);
  }

  const Icone = ICONE_DA_FAMILIA[familia.id] ?? IconeMontar;

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="jogo-icone" aria-hidden>
            <Icone className="h-6 w-6" />
          </span>
          <div>
            <h2 className="heading-lg">{familia.nome}</h2>
            <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted">
              Rodada {rodada + 1} de {total}
              <Contas total={total} feitas={feitas} proxima={rodada} cor={COR} tamanho="sm" />
            </p>
          </div>
        </div>
        <Link href="/estudos/jornada/montar" className="text-sm font-semibold text-muted hover:text-accent">
          Outras famílias
        </Link>
      </header>

      {fim ? (
        <div className="painel" aria-live="polite">
          <p className="quiz-fim-titulo">{fim.venceu ? "Rodada vencida" : "Quase lá"}</p>
          <p className="body-muted">
            Você montou {acertos} de {tecnicas.length}.{" "}
            {fim.venceu
              ? estado.familias.includes(familia.id)
                ? "A família está completa."
                : "Siga para a próxima rodada."
              : `Para vencer a rodada são ${passa}.`}
          </p>
          <ul className="quiz-numeros mt-3">
            <li className={fim.pontos > 0 ? "is-pontos" : ""}>
              <strong>+{fim.pontos}</strong> pontos
            </li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {fim.venceu && rodada + 1 < total ? (
              <Button size="sm" onClick={() => irPara(rodada + 1)}>
                Próxima rodada
              </Button>
            ) : null}
            <Button size="sm" variant={fim.venceu ? "secondary" : "primary"} onClick={() => irPara(rodada)}>
              {fim.venceu ? "Jogar de novo" : "Tentar de novo"}
            </Button>
          </div>
        </div>
      ) : atual ? (
        <div className="painel montar">
          <div className="quiz-topo">
            <Contas total={tecnicas.length} feitas={vez + (conferida !== null ? 1 : 0)} cor={COR} rotulo={`Técnica ${vez + 1} de ${tecnicas.length}`} />
            <span className="quiz-contador">
              {vez + 1} de {tecnicas.length}
            </span>
          </div>

          <p className="label">O que o golpe faz</p>
          <p className="quiz-enunciado !mt-1">{atual.pt}</p>
          <p className="text-xs leading-relaxed text-muted">{semONome(atual.desc, atual.nome)}</p>

          <p className="label mt-5">Seu nome montado</p>
          <div className={cn("montar-encaixe", conferida === true && "is-certo", conferida === false && "is-errado")}>
            {certas.map((_, posicao) => {
              const i = montadas[posicao];
              return i !== undefined ? (
                <button key={posicao} type="button" className="montar-peca is-posta" onClick={() => devolver(posicao)} aria-label={`Devolver ${pecas[i]}`}>
                  {pecas[i]}
                </button>
              ) : (
                <span key={posicao} className="montar-vaga" aria-hidden />
              );
            })}
          </div>

          <p className="label mt-5">Palavras</p>
          <div className="montar-pecas">
            {pecas.map((peca, i) => (
              <button
                key={`${peca}-${i}`}
                type="button"
                className="montar-peca"
                disabled={montadas.includes(i) || conferida !== null}
                onClick={() => tocar(i)}
              >
                {peca}
              </button>
            ))}
          </div>

          {conferida === null ? (
            <Button className="mt-5" size="sm" disabled={montadas.length < certas.length} onClick={conferir}>
              Conferir
            </Button>
          ) : (
            <div className={cn("montar-resposta", conferida ? "is-certo" : "is-errado")} aria-live="polite">
              <p className="text-sm font-semibold text-heading">
                {conferida ? "Isso mesmo: " : "O nome certo é "}
                <span className="font-display text-lg">{atual.nome}</span>
              </p>
              <ul className="montar-glossario">
                {certas.map((peca) => (
                  <li key={peca}>
                    <strong>{peca}</strong>
                    <span>{significadoDaPeca(peca) ?? "parte do nome da técnica"}</span>
                  </li>
                ))}
              </ul>
              <Button size="sm" className="mt-3" onClick={proxima}>
                {vez + 1 < tecnicas.length ? "Próxima técnica" : "Ver resultado"}
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

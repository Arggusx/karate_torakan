"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { baseDoMovimento, type TracadoEmbusen } from "@/services/embusen";

/**
 * Diagrama do embusen com o kata sendo percorrido passo a passo.
 *
 * Dois modos, como nos manuais: "traçado" mostra só a linha de deslocamento;
 * "completo" acrescenta a base de cada movimento. O botão percorre a sequência
 * no ritmo, destacando o passo atual e pulsando nos movimentos com kiai.
 *
 * É desenhado em SVG, não em imagem: só assim o marcador tem um caminho para
 * seguir, e só assim o diagrama acompanha o tema claro/escuro.
 */
export function Embusen({
  tracado,
  movimentos,
}: {
  tracado: TracadoEmbusen;
  movimentos: string[];
}) {
  const [modo, setModo] = useState<"tracado" | "completo">("tracado");
  const [atual, setAtual] = useState(0);
  const [tocando, setTocando] = useState(false);
  const timer = useRef<number | null>(null);

  const passos = tracado.passos;

  useEffect(() => {
    if (!tocando) return;

    timer.current = window.setInterval(() => {
      setAtual((i) => {
        if (i >= passos.length - 1) {
          setTocando(false);
          return i;
        }
        return i + 1;
      });
    }, 1100);

    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [tocando, passos.length]);

  // Caixa do desenho a partir dos próprios pontos, com folga para o marcador.
  // Os `via` entram na caixa: se um deles sair da área dos passos, a linha
  // ficaria cortada na borda do desenho.
  const pontos = passos.flatMap((p) => [...(p.via ?? []), { x: p.x, y: p.y }]);
  const xs = pontos.map((p) => p.x);
  const ys = pontos.map((p) => p.y);
  const folga = 1;
  const minX = Math.min(0, ...xs) - folga;
  const maxX = Math.max(0, ...xs) + folga;
  const minY = Math.min(0, ...ys) - folga;
  const maxY = Math.max(0, ...ys) + folga;

  // y do SVG cresce para baixo; o do tatame cresce para cima. Daí a inversão.
  const px = (x: number) => x - minX;
  const py = (y: number) => maxY - y;

  /*
    A linha percorre os passos na ordem, abrindo os `via` de cada um antes de
    chegar nele. Sem isso o traçado cortaria em diagonal onde o deslocamento
    na verdade dobra uma esquina.
  */
  const linha = [
    { x: 0, y: 0 },
    ...passos.flatMap((p) => [...(p.via ?? []), { x: p.x, y: p.y }]),
  ]
    .map((p) => `${px(p.x).toFixed(2)},${py(p.y).toFixed(2)}`)
    .join(" ");

  const passo = passos[atual];
  const movimento = movimentos[passo.numero - 1] ?? "";
  const base = passo.base ?? baseDoMovimento(movimento);

  /*
    Nem todo movimento desloca o praticante: vários são executados parado, na
    mesma base. Sem sinalizar isso o diagrama parece travado — o número sobe e
    o marcador não sai do lugar. Aqui a interface conta quantos movimentos
    seguidos caem neste ponto e em qual deles estamos.
  */
  let inicioDoPonto = atual;
  let fimDoPonto = atual;
  while (
    inicioDoPonto > 0 &&
    passos[inicioDoPonto - 1].x === passo.x &&
    passos[inicioDoPonto - 1].y === passo.y
  ) {
    inicioDoPonto--;
  }
  while (
    fimDoPonto < passos.length - 1 &&
    passos[fimDoPonto + 1].x === passo.x &&
    passos[fimDoPonto + 1].y === passo.y
  ) {
    fimDoPonto++;
  }
  const movimentosNoPonto = fimDoPonto - inicioDoPonto + 1;
  const ordemNoPonto = atual - inicioDoPonto + 1;

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div>
          <h3 className="heading-md">Embusen · 演武線</h3>
          <p className="mt-0.5 text-2xs text-muted">
            Linha de deslocamento — forma de {tracado.forma}
          </p>
        </div>
        <div className="inline-flex w-fit shrink-0 overflow-hidden rounded-md border border-line">
          {(
            [
              ["tracado", "Traçado"],
              ["completo", "Com bases"],
            ] as const
          ).map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setModo(valor)}
              className={cn(
                "px-3 py-1 text-2xs font-medium transition-colors",
                modo === valor
                  ? "bg-accent text-white"
                  : "bg-surface text-muted hover:text-fg",
              )}
            >
              {rotulo}
            </button>
          ))}
        </div>
      </div>

      {tracado.emConferencia ? (
        <p className="border-b border-status-warn/40 bg-status-warn/10 px-4 py-2 text-2xs leading-relaxed text-status-warn">
          Traçado ainda em conferência contra referência técnica. A sequência de
          movimentos abaixo está correta; as posições no diagrama podem mudar.
        </p>
      ) : null}

      <div className="grid gap-4 p-4 sm:grid-cols-[1fr_1.1fr]">
        <svg
          viewBox={`0 0 ${maxX - minX} ${maxY - minY}`}
          className="w-full rounded-md border border-line bg-canvas"
          role="img"
          aria-label={`Diagrama do embusen, forma de ${tracado.forma}`}
        >
          {/* Malha do tatame, para dar noção de distância. */}
          <defs>
            <pattern id="malha" width="1" height="1" patternUnits="userSpaceOnUse">
              <path
                d="M1 0 L0 0 0 1"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.02"
                className="text-line"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#malha)" />

          <polyline
            points={linha}
            fill="none"
            strokeWidth="0.14"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-line-strong"
            stroke="currentColor"
          />

          {/* Ponto de início (yoi). */}
          <circle
            cx={px(0)}
            cy={py(0)}
            r="0.16"
            className="text-muted"
            fill="currentColor"
          />

          {modo === "completo"
            ? passos.map((p, i) => (
                <g key={p.numero} opacity={i <= atual ? 1 : 0.25}>
                  {/* Cunha apontando para onde o praticante olha. */}
                  <path
                    d="M0,-0.34 L0.2,0.14 L-0.2,0.14 Z"
                    transform={`translate(${px(p.x)} ${py(p.y)}) rotate(${p.olhar})`}
                    className="text-accent"
                    fill="currentColor"
                    opacity="0.55"
                  />
                </g>
              ))
            : null}

          {/* Marcador do passo atual. */}
          <g transform={`translate(${px(passo.x)} ${py(passo.y)})`}>
            {passo.kiai ? (
              <circle r="0.5" className="text-accent" fill="currentColor" opacity="0.2">
                <animate
                  attributeName="r"
                  values="0.35;0.7;0.35"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            ) : null}
            <path
              d="M0,-0.4 L0.24,0.18 L-0.24,0.18 Z"
              transform={`rotate(${passo.olhar})`}
              className="text-accent"
              fill="currentColor"
            />

            {/*
              Anel de contagem: fecha conforme os movimentos parados vão sendo
              executados. É o que dá movimento ao diagrama quando o marcador
              não anda.
            */}
            {movimentosNoPonto > 1 ? (
              <circle
                r="0.42"
                fill="none"
                strokeWidth="0.1"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={`${ordemNoPonto / movimentosNoPonto} 1`}
                transform="rotate(-90)"
                className="text-gold"
                stroke="currentColor"
              />
            ) : null}
          </g>
        </svg>

        <div className="flex flex-col">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums text-accent">
              {String(passo.numero).padStart(2, "0")}
            </span>
            <span className="text-2xs uppercase tracking-[0.08em] text-subtle">
              de {passos.length}
            </span>
            {passo.kiai ? (
              <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-2xs font-medium text-accent">
                KIAI
              </span>
            ) : null}
          </div>

          {/* Movimentos executados sem sair do lugar. */}
          {movimentosNoPonto > 1 ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-2xs text-gold">
              <span className="inline-flex gap-0.5" aria-hidden>
                {Array.from({ length: movimentosNoPonto }, (_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      i < ordemNoPonto ? "bg-gold" : "bg-gold/25",
                    )}
                  />
                ))}
              </span>
              {ordemNoPonto}º de {movimentosNoPonto} movimentos nesta posição —
              sem deslocamento
            </p>
          ) : null}

          {base ? (
            <p className="mt-1 text-xs font-medium text-gold">{base}</p>
          ) : null}

          {/*
            Foto do movimento, quando existe. O diagrama funciona sem nenhuma —
            cada foto cadastrada aparece sozinha no passo dela, sem deixar
            buraco nos passos que ainda não têm.
          */}
          {passo.foto ? (
            <figure className="relative mt-2 aspect-[4/3] w-full overflow-hidden rounded-md border border-line bg-elevated">
              <Image
                src={passo.foto}
                alt={`Movimento ${passo.numero} do kata`}
                fill
                sizes="(min-width: 640px) 320px, 100vw"
                className="object-cover"
              />
              {passo.fotoCredito ? (
                <figcaption className="absolute inset-x-0 bottom-0 bg-black/55 px-2 py-1 text-2xs text-white">
                  {passo.fotoCredito}
                </figcaption>
              ) : null}
            </figure>
          ) : null}

          <p className="mt-2 min-h-[3.5rem] text-xs leading-relaxed text-fg/85">
            {movimento}
          </p>

          {/*
            Sem `mt-auto`: antes os controles eram empurrados para o fim da
            coluna e abriam um vazio no meio. Agora eles vêm logo depois do
            texto e o espaço que sobra embaixo é o do diagrama de referência.
          */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                if (atual >= passos.length - 1) setAtual(0);
                setTocando((t) => !t);
              }}
            >
              {tocando ? "Pausar" : "Executar kata"}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setTocando(false);
                setAtual((i) => Math.max(0, i - 1));
              }}
            >
              ←
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setTocando(false);
                setAtual((i) => Math.min(passos.length - 1, i + 1));
              }}
            >
              →
            </Button>
          </div>

          {/* Régua de passos: clicável, e mostra onde estão os kiai. */}
          <div className="mt-3 flex flex-wrap gap-1">
            {passos.map((p, i) => (
              <button
                key={p.numero}
                type="button"
                aria-label={`Movimento ${p.numero}`}
                onClick={() => {
                  setTocando(false);
                  setAtual(i);
                }}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i === atual
                    ? "bg-accent"
                    : i < atual
                      ? "bg-accent/40"
                      : p.kiai
                        ? "bg-gold/50"
                        : "bg-elevated",
                )}
              />
            ))}
          </div>

          {/*
            Espaço do diagrama de referência — o embusen desenhado à mão, que
            entra depois. Enquanto não há imagem, o lugar fica marcado em vez
            de virar vazio: quem olha entende que falta algo ali, e não que a
            coluna acabou.
          */}
          <div className="mt-4 flex-1">
            {tracado.imagemReferencia ? (
              <figure className="relative h-full min-h-[160px] w-full overflow-hidden rounded-md border border-line bg-canvas">
                <Image
                  src={tracado.imagemReferencia}
                  alt={`Diagrama de referência do embusen, forma de ${tracado.forma}`}
                  fill
                  sizes="(min-width: 640px) 360px, 100vw"
                  className="object-contain p-2"
                />
              </figure>
            ) : (
              <div className="flex h-full min-h-[160px] w-full items-center justify-center rounded-md border border-dashed border-line bg-canvas px-4 text-center">
                <p className="text-2xs leading-relaxed text-subtle">
                  Diagrama de referência
                  <br />
                  <span className="text-subtle/70">em preparo</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

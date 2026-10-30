"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ComoFunciona } from "@/components/jornada/ComoFunciona";
import { Contas } from "@/components/jornada/Contas";
import { AvatarMoldura, Selo } from "@/components/jornada/Insignias";
import { QuizRodada } from "@/components/jornada/QuizRodada";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { jornada, useJornada } from "@/lib/jornadaStore";
import {
  CAMINHOS,
  progressoDo,
  type Caminho,
  type Parada,
} from "@/services/jornada";
import { novaSemente, perguntasDoTema, type Nivel } from "@/services/perguntas";

/**
 * Caminhos: as "ilhas" do Oratio. Sem ?id, a lista dos seis; com ?id, o mapa
 * do caminho — paradas alternando esquerda e direita, a próxima com anel.
 */
export function JogoCaminhos() {
  const params = useSearchParams();
  const caminho = CAMINHOS.find((c) => c.id === params.get("id"));

  return (
    <>
      <ComoFunciona
        id="caminhos"
        passos={[
          "Escolha um dos seis caminhos.",
          "Leia cada lição — elas saem do mesmo acervo das páginas de estudo.",
          "Depois de algumas lições vem um quiz (fácil, médio e difícil). Passa com 3 de 4.",
          "O desafio final fecha o caminho: 6 perguntas, passa com 5.",
          "Concluiu? Você ganha um selo no Livro de selos e uma moldura nova para o medalhão.",
        ]}
        nota="Errar não tira nada: é só tentar de novo. Sugestão: uma parada por dia."
      />
      {caminho ? <MapaDoCaminho caminho={caminho} /> : <ListaDeCaminhos />}
    </>
  );
}

function ListaDeCaminhos() {
  const estado = useJornada();
  return (
    <div className="grade-centrada grade-3">
      {CAMINHOS.map((c) => {
        const p = progressoDo(c, estado.caminhos[c.id]);
        return (
          <Link
            key={c.id}
            href={`/estudos/jornada/caminhos?id=${c.id}`}
            className="jogo-tile"
            style={{ "--game": c.cor } as React.CSSProperties}
          >
            <span className="jogo-tile-cabeca">
              <span className="jogo-icone" aria-hidden>{c.kanji.slice(0, 1)}</span>
              <span className="jogo-tile-texto">
                <strong>{c.nome}</strong>
                <small>{c.resumo}</small>
              </span>
            </span>
            <span className="flex items-center justify-between gap-2">
              <Contas total={p.total} feitas={p.paradas.map((_, i) => i).filter((i) => p.feita(p.paradas[i]))} cor={c.cor} tamanho="sm" />
              <span className="jogo-tile-conta">
                {p.concluido ? "Concluído" : p.comecou ? `${p.feitas}/${p.total}` : "Novo"}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function MapaDoCaminho({ caminho }: { caminho: Caminho }) {
  const estado = useJornada();
  const router = useRouter();
  const p = progressoDo(caminho, estado.caminhos[caminho.id]);
  const [aberta, setAberta] = useState<number | null>(null);
  const parada = aberta !== null ? p.paradas[aberta] : null;

  const recompensa = `caminho:${caminho.id}`;
  const revelar = p.concluido && !estado.recompensasVistas.includes(recompensa);

  return (
    <div style={{ "--game": caminho.cor } as React.CSSProperties}>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow" style={{ color: caminho.cor }}>{caminho.kanji}</p>
          <h2 className="heading-xl">{caminho.nome}</h2>
          <p className="body-muted mt-1">{caminho.resumo}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => router.push("/estudos/jornada/caminhos")}>
          Todos os caminhos
        </Button>
      </header>

      {/* O caminho: nós em zigue-zague ligados por um traço */}
      <ol className="relative mx-auto grid max-w-xl gap-3">
        <span aria-hidden className="absolute bottom-6 left-1/2 top-6 w-0.5 -translate-x-1/2 bg-line" />
        {p.paradas.map((parada, i) => {
          const feita = p.feita(parada);
          const agora = i === p.proxima;
          const liberada = feita || agora;
          return (
            <li key={i} className={cn("relative flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
              <button
                type="button"
                disabled={!liberada}
                onClick={() => setAberta(i)}
                className={cn(
                  "parada",
                  i % 2 === 0 ? "flex-row" : "flex-row-reverse text-right",
                  agora && "is-agora",
                  feita && "is-feita",
                )}
              >
                <span className="parada-icone" aria-hidden>
                  {parada.tipo === "licao" ? (parada.licao.kanji ?? "読").slice(0, 2) : "問"}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-heading">
                    {parada.tipo === "licao" ? parada.licao.titulo : parada.nivel.titulo}
                  </span>
                  <span className="block text-2xs text-muted">
                    {feita ? "Feito" : agora ? "Próxima parada" : "Bloqueada"}
                    {parada.tipo === "quiz" ? ` · ${parada.nivel.tamanho} perguntas` : ""}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <Modal
        open={parada !== null}
        onClose={() => setAberta(null)}
        titulo={parada ? (parada.tipo === "licao" ? parada.licao.titulo : parada.nivel.titulo) : ""}
      >
        {parada ? (
          <ConteudoDaParada
            caminho={caminho}
            parada={parada}
            onFeito={() => setAberta(null)}
          />
        ) : null}
      </Modal>

      <Modal open={revelar} onClose={() => jornada.verRecompensa(recompensa)} titulo="Caminho concluído">
        <div className="grid justify-items-center gap-3 text-center">
          <Selo kanji={caminho.kanji} cor={caminho.cor} tamanho={112} inclinacao={-5} animar />
          <p className="font-display text-2xl font-semibold text-heading">{caminho.selo.titulo}</p>
          <p className="font-kanji text-xl" style={{ color: caminho.cor }}>{caminho.selo.lemaJp}</p>
          <p className="body-muted">{caminho.selo.lemaPt}</p>
          <div className="mt-2 flex items-center gap-3 rounded-xl bg-elevated p-3 text-left">
            <AvatarMoldura moldura={caminho.moldura} iniciais="" tamanho={56} />
            <p className="text-sm">
              Você ganhou a <strong>{caminho.moldura.nome}</strong> para o seu medalhão.
            </p>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                jornada.definirPerfil({ moldura: caminho.moldura.id });
                jornada.verRecompensa(recompensa);
              }}
            >
              Usar esta moldura
            </Button>
            <Button size="sm" variant="secondary" onClick={() => jornada.verRecompensa(recompensa)}>
              Agora não
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ConteudoDaParada({
  caminho,
  parada,
  onFeito,
}: {
  caminho: Caminho;
  parada: Parada;
  onFeito: () => void;
}) {
  const [semente, setSemente] = useState(novaSemente);

  const perguntas = useMemo(() => {
    if (parada.tipo !== "quiz") return [];
    const nivel = parada.nivel.id < 4 ? (parada.nivel.id as Nivel) : undefined;
    return perguntasDoTema(caminho.tema, parada.nivel.tamanho, semente, nivel);
  }, [caminho.tema, parada, semente]);

  if (parada.tipo === "licao") {
    const { licao } = parada;
    return (
      <div>
        {licao.texto ? <p className="text-sm leading-relaxed text-fg/90">{licao.texto}</p> : null}
        {licao.itens ? (
          <dl className="mt-2 divide-y divide-line">
            {licao.itens.map((item) => (
              <div key={item.termo + item.texto} className="py-2.5">
                <dt className="text-sm font-semibold text-heading">
                  {item.termo}
                  {item.sub ? <span className="ml-2 font-kanji text-xs font-normal text-muted">{item.sub}</span> : null}
                </dt>
                <dd className="mt-0.5 text-xs leading-relaxed text-muted">{item.texto}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <Button
          size="sm"
          className="mt-4"
          onClick={() => {
            jornada.lerLicao(caminho.id, parada.indice);
            onFeito();
          }}
        >
          Li, seguir caminho
        </Button>
      </div>
    );
  }

  return (
    <QuizRodada
      key={semente}
      perguntas={perguntas}
      cor={caminho.cor}
      passa={parada.nivel.passa}
      onFim={(_, passou) => {
        if (passou) jornada.vencerNivel(caminho.id, parada.nivel.id);
      }}
      onDeNovo={() => setSemente(novaSemente())}
      continuar={{ rotulo: "Seguir caminho", acao: onFeito }}
    />
  );
}

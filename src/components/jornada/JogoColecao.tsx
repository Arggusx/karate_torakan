"use client";

import Link from "next/link";
import { useState } from "react";
import { Contas } from "@/components/jornada/Contas";
import { ICONE_DA_FAMILIA, IconeMontar } from "@/components/jornada/IconesJornada";
import { AvatarMoldura, Selo } from "@/components/jornada/Insignias";
import { iniciaisDe, moldurasGanhas, resumoDa } from "@/components/jornada/jogos";
import { PaisagemIlha } from "@/components/jornada/PaisagemIlha";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Obi } from "@/components/ui/Obi";
import { cn } from "@/lib/cn";
import { useRanking } from "@/lib/jornadaRede";
import { jornada, useJornada } from "@/lib/jornadaStore";
import { getKatas } from "@/services/dataService";
import { FAMILIAS, ILHAS, TODAS_MOLDURAS, progressoDa, rodadasDa, type Moldura } from "@/services/jornada";

const KATAS = getKatas();

const GRUPOS: { id: Moldura["grupo"]; titulo: string }[] = [
  { id: "ilha", titulo: "Das ilhas" },
  { id: "conquista", titulo: "Das conquistas" },
  { id: "grau", titulo: "Dos graus (pontos)" },
  { id: "ranking", titulo: "Do ranking" },
];

/**
 * Livro de selos: o goshuinchō, caderno onde os templos japoneses carimbam a
 * visita do peregrino — aqui, um selo por ilha concluída. Junto, as
 * molduras do medalhão, o Leque dos katas e as famílias do Monte a técnica.
 */
export function JogoColecao() {
  const estado = useJornada();
  const { dados } = useRanking();
  const resumo = resumoDa(estado);
  const ganhas = moldurasGanhas(estado, dados?.eu);
  const [apagar, setApagar] = useState(false);

  return (
    <div className="grid gap-10">
      <section>
        <header className="mb-4">
          <p className="eyebrow">Goshuinchō</p>
          <h2 className="heading-lg">Livro de selos</h2>
          <p className="body-muted mt-1">
            Nos templos do Japão, o peregrino leva um caderno e recebe um carimbo a cada visita. Aqui, cada ilha concluída deixa o seu.
          </p>
        </header>
        <div className="grade-centrada grade-3">
          {ILHAS.map((ilha, i) => {
            const p = progressoDa(ilha, estado.ilhas[ilha.id]);
            return (
              <article key={ilha.id} className="card selo-cartao">
                <PaisagemIlha ilha={ilha.id} cor={ilha.cor} apagada={!p.concluido} className="selo-cartao-arte" />
                <div className="flex items-center gap-3 p-4">
                  <Selo kanji={ilha.kanji} cor={ilha.cor} vazio={!p.concluido} inclinacao={(i % 3) * 4 - 4} tamanho={60} />
                  <div className="min-w-0">
                    <p className="font-display text-lg font-semibold leading-tight text-heading">
                      {p.concluido ? ilha.selo.titulo : ilha.nome}
                    </p>
                    {p.concluido ? (
                      <p className="text-2xs text-muted">{ilha.selo.lemaPt}</p>
                    ) : (
                      <Link href={`/estudos/jornada/ilhas?id=${ilha.id}`} className="text-2xs font-semibold text-muted hover:text-accent">
                        {p.comecou ? `${p.feitas - 1} de 8 faixas` : "Ainda não visitada"} →
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="eyebrow">Molduras</p>
            <h2 className="heading-lg">Molduras do medalhão</h2>
          </div>
          <span className="text-xs text-muted">
            {ganhas.length} de {TODAS_MOLDURAS.length} conquistadas · toque numa conquistada para usar
          </span>
        </header>
        <div className="grid gap-6">
          {GRUPOS.map((grupo) => (
            <div key={grupo.id}>
              <p className="label mb-3">{grupo.titulo}</p>
              <div className="molduras-grade">
                {TODAS_MOLDURAS.filter((m) => m.grupo === grupo.id).map((m) => {
                  const tem = ganhas.includes(m);
                  const vestida = estado.perfil.moldura === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!tem}
                      onClick={() => jornada.definirPerfil({ moldura: m.id })}
                      className={cn("moldura-ficha", !tem && "is-bloqueada", vestida && "is-vestida")}
                      aria-pressed={vestida}
                    >
                      <AvatarMoldura moldura={m} iniciais={tem ? iniciaisDe(estado.perfil.nome) : "?"} tamanho={64} animar={tem} />
                      <span className="text-xs font-semibold text-heading">{m.nome}</span>
                      <span className="text-2xs text-muted">{vestida ? "Usando agora" : tem ? "Conquistada" : m.como}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="eyebrow">Leque</p>
            <h2 className="heading-lg">Leque dos katas</h2>
          </div>
          <span className="text-xs text-muted">
            {resumo.katasDominados.length} de {KATAS.length} na ordem
          </span>
        </header>
        <div className="grade-centrada grade-4 [--grade-gap:0.5rem]">
          {KATAS.map((k) => {
            const feito = resumo.katasDominados.includes(k);
            return (
              <Link
                key={k.id}
                href={`/estudos/jornada/sequencia?kata=${k.id}`}
                className={cn(
                  "card card-hover flex items-center justify-between gap-2 px-3 py-2",
                  feito && "card-faixa [--faixa-cor:#2E6E8E]",
                  !feito && "opacity-70",
                )}
              >
                <span className="min-w-0 truncate text-sm font-semibold text-heading">{k.nome}</span>
                <Obi cor={k.corFaixa} className="w-8 shrink-0" />
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <header className="mb-4">
          <p className="eyebrow">Monte a técnica</p>
          <h2 className="heading-lg">Famílias de técnicas</h2>
        </header>
        <div className="grade-centrada grade-3">
          {FAMILIAS.map((f) => {
            const total = rodadasDa(f);
            const feitas = estado.montagem[f.id] ?? [];
            const Icone = ICONE_DA_FAMILIA[f.id] ?? IconeMontar;
            return (
              <Link key={f.id} href={`/estudos/jornada/montar?familia=${f.id}`} className="card card-hover flex items-center justify-between gap-3 p-4">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="jogo-icone [--game:#C2486A]" aria-hidden>
                    <Icone className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-heading">{f.nome}</span>
                    <span className="block text-2xs text-muted">
                      {estado.familias.includes(f.id) ? "Completa" : `${feitas.length} de ${total} rodadas`}
                    </span>
                  </span>
                </span>
                <Contas total={total} feitas={feitas} cor="#C2486A" tamanho="sm" />
              </Link>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-line pt-5 text-center">
        <p className="text-xs text-muted">
          O progresso fica guardado neste aparelho. Se você entrou no portal, os pontos também ficam na sua conta, para o ranking.
        </p>
        <button type="button" onClick={() => setApagar(true)} className="mt-2 text-xs font-semibold text-muted underline-offset-2 hover:text-accent hover:underline">
          Apagar o progresso deste aparelho
        </button>
      </footer>

      <Modal open={apagar} onClose={() => setApagar(false)} titulo="Apagar o progresso?">
        <p className="body-muted">
          Selos, molduras, pontos do aparelho, katas e famílias voltam ao começo neste aparelho. Os pontos já registrados na sua conta do
          portal continuam lá. Não dá para desfazer.
        </p>
        <div className="mt-4 flex gap-2">
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              jornada.apagarTudo();
              setApagar(false);
            }}
          >
            Apagar tudo
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setApagar(false)}>
            Manter
          </Button>
        </div>
      </Modal>
    </div>
  );
}

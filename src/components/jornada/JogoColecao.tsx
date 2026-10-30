"use client";

import Link from "next/link";
import { useState } from "react";
import { Contas } from "@/components/jornada/Contas";
import { AvatarMoldura, Selo } from "@/components/jornada/Insignias";
import { resumoDa } from "@/components/jornada/jogos";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { jornada, useJornada } from "@/lib/jornadaStore";
import { getKatas } from "@/services/dataService";
import { BARALHOS, CAMINHOS, PARES, progressoDo } from "@/services/jornada";

const KATAS = getKatas();

/**
 * Livro de selos: o goshuinchō, caderno onde os templos japoneses carimbam a
 * visita do peregrino — aqui, um selo por caminho concluído. Junto, o Leque
 * dos katas e os baralhos de karuta. É o "Passaporte" do Oratio.
 */
export function JogoColecao() {
  const estado = useJornada();
  const resumo = resumoDa(estado);
  const [apagar, setApagar] = useState(false);

  return (
    <div className="grid gap-10">
      <section>
        <header className="mb-4">
          <p className="eyebrow">御朱印帳 · Goshuinchō</p>
          <h2 className="heading-lg">Livro de selos</h2>
          <p className="body-muted mt-1">
            Nos templos do Japão, o peregrino leva um caderno e recebe um carimbo a cada visita. Aqui, cada caminho concluído deixa o seu.
          </p>
        </header>
        <div className="grade-centrada grade-3">
          {CAMINHOS.map((c, i) => {
            const p = progressoDo(c, estado.caminhos[c.id]);
            return (
              <article key={c.id} className="card flex items-center gap-4 p-4">
                <Selo kanji={c.kanji} cor={c.cor} vazio={!p.concluido} inclinacao={(i % 3) * 4 - 4} tamanho={72} />
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold leading-tight text-heading">
                    {p.concluido ? c.selo.titulo : c.nome}
                  </p>
                  {p.concluido ? (
                    <>
                      <p className="font-kanji text-sm" style={{ color: c.cor }}>{c.selo.lemaJp}</p>
                      <p className="text-2xs text-muted">{c.selo.lemaPt}</p>
                    </>
                  ) : (
                    <Link href={`/estudos/jornada/caminhos?id=${c.id}`} className="text-2xs font-semibold text-muted hover:text-accent">
                      {p.comecou ? `${p.feitas} de ${p.total} paradas` : "Ainda não começado"} →
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <header className="mb-4">
          <p className="eyebrow">額縁 · Molduras</p>
          <h2 className="heading-lg">Molduras do medalhão</h2>
        </header>
        <div className="flex flex-wrap justify-center gap-4">
          {CAMINHOS.map((c) => {
            const tem = resumo.caminhosFeitos.includes(c);
            return (
              <figure key={c.id} className={cn("grid justify-items-center gap-1 text-center", !tem && "opacity-35")}>
                <AvatarMoldura moldura={c.moldura} iniciais={tem ? "✓" : "?"} tamanho={72} />
                <figcaption className="text-2xs text-muted">{c.moldura.nome}</figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      <section>
        <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="eyebrow">扇 · Leque</p>
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
                )}
              >
                <span className="text-sm font-semibold text-heading">{k.nome}</span>
                <span className={cn("font-kanji text-sm", feito ? "text-[#2E6E8E]" : "text-subtle")}>{k.kanji}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <header className="mb-4">
          <p className="eyebrow">札 · Karuta</p>
          <h2 className="heading-lg">Baralhos</h2>
        </header>
        <div className="grade-centrada grade-3">
          {BARALHOS.map((b) => {
            const total = Math.ceil(b.cartas.length / PARES);
            const feitas = estado.rodadasKaruta[b.id] ?? [];
            return (
              <Link key={b.id} href={`/estudos/jornada/karuta?baralho=${b.id}`} className="card card-hover flex items-center justify-between gap-3 p-4">
                <span>
                  <span className="block text-sm font-semibold text-heading">{b.nome}</span>
                  <span className="block text-2xs text-muted">
                    {estado.karuta.includes(b.id) ? "Completo" : `${feitas.length} de ${total} rodadas`}
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
          Tudo isto fica guardado só neste aparelho. Nada é enviado ao dojo.
        </p>
        <button type="button" onClick={() => setApagar(true)} className="mt-2 text-xs font-semibold text-muted underline-offset-2 hover:text-accent hover:underline">
          Apagar meu progresso
        </button>
      </footer>

      <Modal open={apagar} onClose={() => setApagar(false)} titulo="Apagar o progresso?">
        <p className="body-muted">
          Selos, molduras, katas e baralhos voltam ao começo neste aparelho. Não dá para desfazer.
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

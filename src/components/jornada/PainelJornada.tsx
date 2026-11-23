"use client";

import Link from "next/link";
import { IconeFeito, IconeJogo } from "@/components/jornada/IconesJornada";
import { Selo } from "@/components/jornada/Insignias";
import { Contas } from "@/components/jornada/Contas";
import { JOGOS, jogo, resumoDa } from "@/components/jornada/jogos";
import { Medalhao } from "@/components/jornada/Medalhao";
import { PaisagemIlha } from "@/components/jornada/PaisagemIlha";
import { useRanking } from "@/lib/jornadaRede";
import { useJornada } from "@/lib/jornadaStore";
import { acharTecnica, getGraduacoes, getKatas } from "@/services/dataService";
import { FAIXAS, FAMILIAS, ILHAS, progressoDa, trechosDo, type Ilha } from "@/services/jornada";

const KATAS = getKatas();
const GRADUACOES = getGraduacoes();

/**
 * Tela inicial da Jornada, no desenho do painel do Oratio: o destaque e o
 * "Para hoje" à esquerda, o medalhão à direita (fixo no desktop) e as
 * prateleiras embaixo — cada uma num layout, para não virar grade genérica.
 */
export function PainelJornada() {
  const estado = useJornada();
  const { dados } = useRanking();
  const resumo = resumoDa(estado);

  const progressos = ILHAS.map((ilha) => ({ ilha, p: progressoDa(ilha, estado.ilhas[ilha.id]) }));
  const emAndamento = progressos.find(({ p }) => p.comecou && !p.concluido);
  const proxima = emAndamento ?? progressos.find(({ p }) => !p.concluido);

  // Personalização pela faixa escolhida no medalhão.
  const graduacao = GRADUACOES.find((g) => g.faixa === estado.perfil.faixa);
  const kataDaFaixa = KATAS.find((k) => graduacao?.katasExigidos.includes(k.nome));
  const tecnicaDaFaixa = graduacao?.kihonExigido.map((n) => acharTecnica(n)).find(Boolean);
  const familiaDaFaixa = FAMILIAS.find((f) => f.tecnicas.some((t) => t.nome === tecnicaDaFaixa?.nome));

  return (
    <div className="jornada-painel">
      <aside className="jornada-lado">
        <Medalhao />
      </aside>

      <div className="jornada-principal">
        <Destaque atual={proxima} />

        <section className="painel para-hoje">
          <header className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="heading-md">Para hoje</h2>
            <small className="label">sugestões</small>
          </header>
          <ul>
            {proxima ? (
              <ItemHoje
                href={`/estudos/jornada/ilhas?id=${proxima.ilha.id}`}
                titulo={`${proxima.ilha.nome}: ${tituloDaParada(proxima.p)}`}
                sub={proxima.p.comecou ? "Próxima parada" : "Comece pela mini aula"}
              />
            ) : null}
            {kataDaFaixa ? (
              <ItemHoje
                href={`/estudos/jornada/sequencia?kata=${kataDaFaixa.id}`}
                titulo={`Ordem do ${kataDaFaixa.nome}`}
                sub={`O kata da sua faixa (${graduacao!.faixa})`}
                feito={(estado.sequencias[kataDaFaixa.id]?.length ?? 0) >= trechosDo(kataDaFaixa.movimentosDetalhados.length)}
              />
            ) : null}
            {familiaDaFaixa ? (
              <ItemHoje
                href={`/estudos/jornada/montar?familia=${familiaDaFaixa.id}`}
                titulo={`Monte a técnica: ${familiaDaFaixa.nome}`}
                sub={`Tem ${tecnicaDaFaixa!.nome}, do kihon da sua faixa`}
                feito={estado.familias.includes(familiaDaFaixa.id)}
              />
            ) : null}
            <ItemHoje
              href="/estudos/jornada/treino"
              titulo="Uma rodada de Treino livre"
              sub={dados?.logado ? "Soma pontos para o ranking da semana" : "Escolha os temas que quiser"}
              feito={estado.hoje.dia === hojeLocal() && estado.hoje.pontos > 0}
            />
            {!graduacao ? (
              <li className="px-1 py-2 text-xs text-muted">
                Escolha sua faixa no medalhão para receber sugestões do seu programa.
              </li>
            ) : null}
          </ul>
        </section>
      </div>

      <div className="jornada-prateleiras">
        {/* Aprender: ilhas em destaque, Treino livre ao lado */}
        <section className="prateleira is-destaque">
          <header>
            <h2>Aprender</h2>
            <small>Mini aula, perguntas faixa a faixa e o selo de cada ilha.</small>
          </header>
          <div className="prateleira-grade">
            <Tile slug="ilhas" grande>
              <span className="mini-arquipelago" aria-hidden>
                {progressos.map(({ ilha, p }) => (
                  <span key={ilha.id} className={p.concluido ? "is-feita" : p.comecou ? "is-agora" : ""}>
                    <PaisagemIlha ilha={ilha.id} cor={ilha.cor} apagada={!p.comecou && !p.concluido} />
                  </span>
                ))}
              </span>
              <span className="jogo-tile-conta">
                {resumo.ilhasFeitas.length} de {ILHAS.length} ilhas concluídas
              </span>
            </Tile>
            <Tile slug="treino" listrado>
              <span className="jogo-chips">
                <span>Katas</span>
                <span>Dojo</span>
                <span>História</span>
                <span>+</span>
              </span>
            </Tile>
          </div>
        </section>

        {/* Praticar: em linhas */}
        <section className="prateleira is-linhas">
          <header>
            <h2>Praticar</h2>
            <small>Rodadas curtas, para treinar a memória do que se faz no tatame.</small>
          </header>
          <div className="prateleira-grade">
            <Tile slug="montar">
              <span className="mini-montar" aria-hidden>
                <span>Gedan</span>
                <span>Barai</span>
              </span>
            </Tile>
            <Tile slug="sequencia">
              <span className="mini-ordem" aria-hidden>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>…</span>
              </span>
            </Tile>
          </div>
        </section>

        {/* Competir e colecionar: mosaico */}
        <section className="prateleira is-mosaico">
          <header>
            <h2>Competir e colecionar</h2>
            <small>O ranking do dojo e o que você já concluiu.</small>
          </header>
          <div className="prateleira-grade">
            <Tile slug="ranking" largo>
              {dados?.logado && dados.semana?.length ? (
                <span className="mini-podio">
                  {dados.semana.slice(0, 3).map((l) => (
                    <span key={`${l.posicao}-${l.nome}`} className={l.eu ? "is-eu" : ""}>
                      <strong>{l.posicao}º</strong> {l.nome} <small>{l.pontos}</small>
                    </span>
                  ))}
                </span>
              ) : (
                <span className="text-xs text-muted">
                  {dados?.logado ? "Ninguém pontuou nesta semana ainda." : "Entre no portal para disputar o ranking da semana e do mês."}
                </span>
              )}
            </Tile>
            <Tile slug="colecao">
              <span className="mini-selos">
                {ILHAS.map((ilha, i) => (
                  <Selo
                    key={ilha.id}
                    kanji={ilha.kanji}
                    cor={ilha.cor}
                    vazio={!resumo.ilhasFeitas.includes(ilha)}
                    inclinacao={(i % 3) * 4 - 4}
                    tamanho={36}
                  />
                ))}
              </span>
            </Tile>
            <Link href="/estudos/jornada/colecao" className="jogo-tile" style={{ "--game": "#2E6E8E" } as React.CSSProperties}>
              <span className="jogo-tile-cabeca">
                <span className="jogo-icone" aria-hidden>
                  <IconeJogo slug="sequencia" className="h-6 w-6" />
                </span>
                <span className="jogo-tile-texto">
                  <strong>Leque dos katas</strong>
                  <small>
                    {resumo.katasDominados.length} de {KATAS.length} katas na ordem
                  </small>
                </span>
              </span>
              <span className="jogo-tile-previa">
                <span className="mini-leque" aria-hidden>
                  {KATAS.map((k) => (
                    <span key={k.id} className={resumo.katasDominados.includes(k) ? "is-feito" : ""} />
                  ))}
                </span>
              </span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function hojeLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function tituloDaParada(p: ReturnType<typeof progressoDa>) {
  const parada = p.paradas[p.proxima];
  if (!parada) return "concluída";
  return parada.tipo === "aula" ? "mini aula" : `faixa ${FAIXAS[parada.indice]?.faixa}`;
}

/** "Continue de onde parou": a ilha em andamento, ou a próxima a visitar. */
function Destaque({ atual }: { atual?: { ilha: Ilha; p: ReturnType<typeof progressoDa> } }) {
  if (!atual) {
    const t = jogo("treino")!;
    return (
      <Link href="/estudos/jornada/treino" className="continue" style={{ "--game": t.cor } as React.CSSProperties}>
        <span className="continue-arte is-icone" aria-hidden>
          <IconeJogo slug="treino" className="h-14 w-14" />
        </span>
        <span className="continue-corpo">
          <small>Todas as ilhas concluídas</small>
          <strong>Que tal um Treino livre?</strong>
          <small>Perguntas dos temas que você escolher, valendo pontos para o ranking.</small>
          <span className="continue-cta">Treinar agora →</span>
        </span>
      </Link>
    );
  }

  const { ilha, p } = atual;
  return (
    <Link href={`/estudos/jornada/ilhas?id=${ilha.id}`} className="continue" style={{ "--game": ilha.cor } as React.CSSProperties}>
      <span className="continue-arte" aria-hidden>
        <PaisagemIlha ilha={ilha.id} cor={ilha.cor} />
      </span>
      <span className="continue-corpo">
        <small>{p.comecou ? "Continue de onde parou" : "Comece uma ilha"}</small>
        <strong>{ilha.nome}</strong>
        <span className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
          <Contas total={p.total} feitas={p.paradas.map((_, i) => i).filter((i) => p.feita(p.paradas[i]))} cor={ilha.cor} tamanho="sm" />
          {p.feitas} de {p.total}
        </span>
        <span className="continue-cta">
          {p.comecou ? `Seguir: ${tituloDaParada(p)}` : "Abrir a mini aula"} →
        </span>
      </span>
    </Link>
  );
}

function ItemHoje({ href, titulo, sub, feito = false }: { href: string; titulo: string; sub: string; feito?: boolean }) {
  return (
    <li className={feito ? "is-feito" : ""}>
      <Link href={href}>
        <span className="para-hoje-marca" aria-hidden>
          <IconeFeito className="h-3 w-3" />
        </span>
        <span className="grid min-w-0">
          <strong className="truncate text-sm text-heading">{titulo}</strong>
          <small className="truncate text-2xs text-muted">{sub}</small>
        </span>
      </Link>
    </li>
  );
}

/** Cartão de jogo na prateleira. */
function Tile({
  slug,
  children,
  grande = false,
  listrado = false,
  largo = false,
}: {
  slug: string;
  children: React.ReactNode;
  grande?: boolean;
  listrado?: boolean;
  largo?: boolean;
}) {
  const j = JOGOS.find((x) => x.slug === slug)!;
  return (
    <Link
      href={`/estudos/jornada/${slug}`}
      className={`jogo-tile ${grande ? "is-grande" : ""} ${listrado ? "is-listrado" : ""} ${largo ? "is-largo" : ""}`}
      style={{ "--game": j.cor } as React.CSSProperties}
    >
      <span className="jogo-tile-cabeca">
        <span className="jogo-icone" aria-hidden>
          <IconeJogo slug={slug} className="h-6 w-6" />
        </span>
        <span className="jogo-tile-texto">
          <strong>
            {j.nome}
            {j.jp ? <span className="ml-1.5 text-2xs font-semibold text-subtle">{j.jp}</span> : null}
          </strong>
          <small>{j.resumo}</small>
        </span>
      </span>
      <span className="jogo-tile-previa">{children}</span>
      <span className="jogo-tile-cta">Abrir →</span>
    </Link>
  );
}

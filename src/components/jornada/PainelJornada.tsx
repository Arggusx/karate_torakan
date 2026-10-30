"use client";

import Link from "next/link";
import { Selo } from "@/components/jornada/Insignias";
import { Contas } from "@/components/jornada/Contas";
import { JOGOS, jogo, resumoDa } from "@/components/jornada/jogos";
import { Medalhao } from "@/components/jornada/Medalhao";
import { useJornada } from "@/lib/jornadaStore";
import { acharTecnica, getGraduacoes, getKatas } from "@/services/dataService";
import { BARALHOS, CAMINHOS, progressoDo, trechosDo } from "@/services/jornada";

const KATAS = getKatas();
const GRADUACOES = getGraduacoes();

/**
 * Tela inicial da Jornada, no desenho do painel do Oratio: o destaque e o
 * "Para hoje" à esquerda, o medalhão à direita (fixo no desktop) e as
 * prateleiras embaixo — cada uma num layout, para não virar grade genérica.
 */
export function PainelJornada() {
  const estado = useJornada();
  const resumo = resumoDa(estado);

  const progressos = CAMINHOS.map((c) => ({ c, p: progressoDo(c, estado.caminhos[c.id]) }));
  const emAndamento = progressos.find(({ p }) => p.comecou && !p.concluido);
  const proximo = progressos.find(({ p }) => !p.concluido);

  // Personalização pela faixa escolhida no medalhão.
  const graduacao = GRADUACOES.find((g) => g.faixa === estado.perfil.faixa);
  const kataDaFaixa = KATAS.find((k) => graduacao?.katasExigidos.includes(k.nome));
  const tecnicaDaFaixa = graduacao?.kihonExigido.map((n) => acharTecnica(n)).find(Boolean);
  const baralhoDaFaixa = BARALHOS.find((b) => b.cartas.some((c) => c.termo === tecnicaDaFaixa?.nome));

  return (
    <div className="jornada-painel">
      <aside className="jornada-lado">
        <Medalhao />
      </aside>

      <div className="jornada-principal">
        <Destaque emAndamento={emAndamento ?? proximo} todosFeitos={!proximo} />

        <section className="painel para-hoje">
          <header className="mb-2 flex items-baseline justify-between gap-2">
            <h2 className="heading-md">Para hoje</h2>
            <small className="label">sugestões</small>
          </header>
          <ul>
            {(emAndamento ?? proximo) ? (
              <ItemHoje
                href={`/estudos/jornada/caminhos?id=${(emAndamento ?? proximo)!.c.id}`}
                titulo={`Próxima parada: ${tituloDaParada((emAndamento ?? proximo)!.p)}`}
                sub={(emAndamento ?? proximo)!.c.nome}
              />
            ) : null}
            {kataDaFaixa ? (
              <ItemHoje
                href={`/estudos/jornada/sequencia?kata=${kataDaFaixa.id}`}
                titulo={`Sequência do ${kataDaFaixa.nome}`}
                sub={`O kata da sua faixa (${graduacao!.faixa})`}
                feito={(estado.sequencias[kataDaFaixa.id]?.length ?? 0) >= trechosDo(kataDaFaixa.movimentosDetalhados.length)}
              />
            ) : null}
            {baralhoDaFaixa ? (
              <ItemHoje
                href={`/estudos/jornada/karuta?baralho=${baralhoDaFaixa.id}`}
                titulo={`Karuta: ${baralhoDaFaixa.nome}`}
                sub={`Tem ${tecnicaDaFaixa!.nome}, do kihon da sua faixa`}
                feito={estado.karuta.includes(baralhoDaFaixa.id)}
              />
            ) : null}
            {!graduacao ? (
              <li className="px-1 py-2 text-xs text-muted">
                Escolha sua faixa no medalhão para receber sugestões do seu programa.
              </li>
            ) : null}
          </ul>
        </section>
      </div>

      <div className="jornada-prateleiras">
        {/* Aprender: caminhos em destaque, Randori ao lado */}
        <section className="prateleira is-destaque">
          <header>
            <h2>Aprender</h2>
            <small>Leia, responda e conclua um caminho para ganhar o selo.</small>
          </header>
          <div className="prateleira-grade">
            <Tile slug="caminhos" grande>
              <span className="jogo-ilhas">
                {progressos.map(({ c, p }, i) => (
                  <span
                    key={c.id}
                    className={`jogo-ilha ${p.concluido ? "is-feita" : ""} ${!p.concluido && p.comecou ? "is-agora" : ""}`}
                    style={{ "--ilha": c.cor } as React.CSSProperties}
                    title={`${c.nome}: ${p.feitas}/${p.total}`}
                    data-i={i}
                  >
                    {c.kanji.slice(0, 1)}
                  </span>
                ))}
              </span>
              <span className="jogo-tile-conta">
                {resumo.caminhosFeitos.length} de {CAMINHOS.length} caminhos concluídos
              </span>
            </Tile>
            <Tile slug="randori" listrado>
              <span className="jogo-chips">
                <span>Fácil</span>
                <span>Médio</span>
                <span>Difícil</span>
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
            <Tile slug="karuta">
              <span className="mini-cartas" aria-hidden>
                {BARALHOS.map((b, i) => (
                  <span
                    key={b.id}
                    className={estado.karuta.includes(b.id) ? "is-feito" : ""}
                    style={{ "--giro": `${(i - 3) * 5}deg` } as React.CSSProperties}
                  />
                ))}
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

        {/* Colecionar: mosaico */}
        <section className="prateleira is-mosaico">
          <header>
            <h2>Colecionar</h2>
            <small>O que você concluiu fica guardado aqui, neste aparelho.</small>
          </header>
          <div className="prateleira-grade">
            <Tile slug="colecao" largo>
              <span className="mini-selos">
                {CAMINHOS.map((c, i) => {
                  const feito = resumo.caminhosFeitos.includes(c);
                  return (
                    <Selo
                      key={c.id}
                      kanji={c.kanji}
                      cor={c.cor}
                      vazio={!feito}
                      inclinacao={(i % 3) * 4 - 4}
                      tamanho={44}
                    />
                  );
                })}
              </span>
            </Tile>
            <LinkColecao titulo="Leque dos katas" kanji="扇" cor="#2E6E8E" texto={`${resumo.katasDominados.length} de ${KATAS.length} katas na ordem`}>
              <span className="mini-leque" aria-hidden style={{ "--game": "#2E6E8E" } as React.CSSProperties}>
                {KATAS.map((k) => (
                  <span key={k.id} className={resumo.katasDominados.includes(k) ? "is-feito" : ""} />
                ))}
              </span>
            </LinkColecao>
            <LinkColecao titulo="Baralhos" kanji="札" cor="#C2486A" texto={`${resumo.baralhos.length} de ${BARALHOS.length} baralhos completos`}>
              <Contas total={BARALHOS.length} feitas={resumo.baralhos.length} cor="#C2486A" />
            </LinkColecao>
          </div>
        </section>
      </div>
    </div>
  );
}

function tituloDaParada(p: ReturnType<typeof progressoDo>) {
  const parada = p.paradas[p.proxima];
  if (!parada) return "concluído";
  return parada.tipo === "licao" ? parada.licao.titulo : parada.nivel.titulo;
}

/** "Continue de onde parou": o caminho em andamento, ou o próximo a começar. */
function Destaque({
  emAndamento,
  todosFeitos,
}: {
  emAndamento?: { c: (typeof CAMINHOS)[number]; p: ReturnType<typeof progressoDo> };
  todosFeitos: boolean;
}) {
  if (todosFeitos || !emAndamento) {
    const r = jogo("randori")!;
    return (
      <Link href="/estudos/jornada/randori" className="continue" style={{ "--game": r.cor } as React.CSSProperties}>
        <span className="continue-arte" aria-hidden>{r.kanji}</span>
        <span className="continue-corpo">
          <small>Todos os caminhos concluídos</small>
          <strong>Que tal um Randori?</strong>
          <small>Perguntas de todos os temas, na dificuldade que você escolher.</small>
          <span className="continue-cta">Jogar agora →</span>
        </span>
      </Link>
    );
  }

  const { c, p } = emAndamento;
  return (
    <Link
      href={`/estudos/jornada/caminhos?id=${c.id}`}
      className="continue"
      style={{ "--game": c.cor } as React.CSSProperties}
    >
      <span className="continue-arte" aria-hidden>{c.kanji}</span>
      <span className="continue-corpo">
        <small>{p.comecou ? "Continue de onde parou" : "Comece um caminho"}</small>
        <strong>{c.nome}</strong>
        <span className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
          <Contas total={p.total} feitas={p.paradas.map((_, i) => i).filter((i) => p.feita(p.paradas[i]))} cor={c.cor} tamanho="sm" />
          {p.feitas} de {p.total}
        </span>
        <span className="continue-cta">
          {p.comecou ? `Seguir: ${tituloDaParada(p)}` : "Começar"} →
        </span>
      </span>
    </Link>
  );
}

function ItemHoje({ href, titulo, sub, feito = false }: { href: string; titulo: string; sub: string; feito?: boolean }) {
  return (
    <li className={feito ? "is-feito" : ""}>
      <Link href={href}>
        <span className="para-hoje-marca" aria-hidden>✓</span>
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
        <span className="jogo-icone" aria-hidden>{j.kanji}</span>
        <span className="jogo-tile-texto">
          <strong>{j.nome}</strong>
          <small>{j.resumo}</small>
        </span>
      </span>
      <span className="jogo-tile-previa">{children}</span>
      <span className="jogo-tile-cta">Abrir →</span>
    </Link>
  );
}

/** Cartões menores da coleção, que abrem o Livro de selos na seção certa. */
function LinkColecao({
  titulo,
  kanji,
  cor,
  texto,
  children,
}: {
  titulo: string;
  kanji: string;
  cor: string;
  texto: string;
  children: React.ReactNode;
}) {
  return (
    <Link href="/estudos/jornada/colecao" className="jogo-tile" style={{ "--game": cor } as React.CSSProperties}>
      <span className="jogo-tile-cabeca">
        <span className="jogo-icone" aria-hidden>{kanji}</span>
        <span className="jogo-tile-texto">
          <strong>{titulo}</strong>
          <small>{texto}</small>
        </span>
      </span>
      <span className="jogo-tile-previa">{children}</span>
    </Link>
  );
}

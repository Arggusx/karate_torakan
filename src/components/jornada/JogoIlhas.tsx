"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ComoFunciona } from "@/components/jornada/ComoFunciona";
import { Contas } from "@/components/jornada/Contas";
import { IconeAula, IconeCadeado, IconeFeito } from "@/components/jornada/IconesJornada";
import { AvatarMoldura, Selo } from "@/components/jornada/Insignias";
import { PaisagemIlha } from "@/components/jornada/PaisagemIlha";
import { QuizRodada } from "@/components/jornada/QuizRodada";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Obi } from "@/components/ui/Obi";
import { cn } from "@/lib/cn";
import { jornada, useJornada } from "@/lib/jornadaStore";
import { FAIXAS, ILHAS, progressoDa, type Ilha, type Licao, type Parada } from "@/services/jornada";
import { conteudoDaFaixa, novaSemente, perguntasDaFaixa, regraDaFaixa } from "@/services/perguntas";

/**
 * Ilhas: sem ?id, o arquipélago com as seis; com ?id, a ilha — a mini aula
 * na chegada e depois um nível por faixa, da Branca à Preta, cada um com
 * mais perguntas, mais alternativas e mais difícil que o anterior.
 */
export function JogoIlhas() {
  const params = useSearchParams();
  const ilha = ILHAS.find((c) => c.id === params.get("id"));

  return (
    <>
      <ComoFunciona
        id="ilhas"
        passos={[
          "Escolha uma das seis ilhas.",
          "Ao chegar, leia a mini aula: é ali que está a explicação do que vai cair.",
          "Depois vêm oito níveis, um por faixa, da Branca à Preta. Cada um começa com um resumo curto do que cai nele.",
          "As perguntas ficam mais difíceis a cada faixa: mais perguntas e, a partir da Vermelha, 5 alternativas.",
          "Venceu todas as faixas? Ganha o selo da ilha e uma moldura nova. Cada acerto também soma pontos para o ranking.",
        ]}
        nota="Errar não tira nada: no fim de cada nível há a revisão do que você errou, com o porquê."
      />
      {ilha ? <IlhaAberta key={ilha.id} ilha={ilha} /> : <Arquipelago />}
    </>
  );
}

function Arquipelago() {
  const estado = useJornada();
  return (
    <div className="arquipelago">
      {ILHAS.map((ilha, n) => {
        const p = progressoDa(ilha, estado.ilhas[ilha.id]);
        return (
          <Link
            key={ilha.id}
            href={`/estudos/jornada/ilhas?id=${ilha.id}`}
            className={cn("ilha-cartao", p.concluido && "is-feita")}
            style={{ "--game": ilha.cor, "--n": n } as React.CSSProperties}
          >
            <PaisagemIlha ilha={ilha.id} cor={ilha.cor} className="ilha-cartao-arte" />
            {p.concluido ? (
              <span className="ilha-cartao-selo" aria-hidden>
                <Selo kanji={ilha.kanji} cor={ilha.cor} tamanho={42} inclinacao={-8} />
              </span>
            ) : null}
            <span className="ilha-cartao-corpo">
              <strong>{ilha.nome}</strong>
              <small>{ilha.resumo}</small>
              <span className="flex items-center justify-between gap-2">
                <Contas total={p.total} feitas={p.paradas.map((_, i) => i).filter((i) => p.feita(p.paradas[i]))} cor={ilha.cor} tamanho="sm" />
                <span className="jogo-tile-conta">
                  {p.concluido ? "Concluída" : p.comecou ? `${p.feitas - 1}/8 faixas` : "Nova"}
                </span>
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

const nomeDaParada = (p: Parada) => (p.tipo === "aula" ? "Mini aula" : `Faixa ${FAIXAS[p.indice]?.faixa}`);

function IlhaAberta({ ilha }: { ilha: Ilha }) {
  const estado = useJornada();
  const router = useRouter();
  const p = progressoDa(ilha, estado.ilhas[ilha.id]);
  const [aberta, setAberta] = useState<number | null>(null);
  const [aulaAberta, setAulaAberta] = useState(false);
  const parada = aberta !== null ? p.paradas[aberta] : null;

  // Primeira vez na ilha: a mini aula abre sozinha.
  useEffect(() => {
    if (!estado.ilhas[ilha.id]?.aula) setAulaAberta(true);
    // só na chegada
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ilha.id]);

  const recompensa = `ilha:${ilha.id}`;
  const revelar = p.concluido && !estado.recompensasVistas.includes(recompensa);
  const feitasFaixas = estado.ilhas[ilha.id]?.faixas.length ?? 0;

  return (
    <div style={{ "--game": ilha.cor } as React.CSSProperties}>
      <header className="ilha-topo">
        <PaisagemIlha ilha={ilha.id} cor={ilha.cor} className="ilha-topo-arte" />
        <div className="min-w-0">
          <p className="eyebrow" style={{ color: ilha.cor }}>Ilha {ILHAS.indexOf(ilha) + 1} de {ILHAS.length}</p>
          <h2 className="heading-xl">{ilha.nome}</h2>
          <p className="body-muted mt-1">{ilha.resumo}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted">
            <Contas total={8} feitas={estado.ilhas[ilha.id]?.faixas ?? []} cor={ilha.cor} />
            {feitasFaixas} de 8 faixas
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => setAulaAberta(true)}>
              <IconeAula className="h-4 w-4" /> Rever a mini aula
            </Button>
            <Button size="sm" variant="ghost" onClick={() => router.push("/estudos/jornada/ilhas")}>
              Todas as ilhas
            </Button>
          </div>
        </div>
      </header>

      {/* A trilha: mini aula e as oito faixas, em zigue-zague */}
      <ol className="trilha">
        {p.paradas.map((parada, i) => {
          const feita = p.feita(parada);
          const agora = i === p.proxima;
          const liberada = feita || agora;
          const g = parada.tipo === "faixa" ? FAIXAS[parada.indice] : null;
          const regra = parada.tipo === "faixa" ? regraDaFaixa(parada.indice) : null;
          return (
            <li key={i} className={cn("trilha-item", i % 2 === 0 ? "is-esquerda" : "is-direita")}>
              <button
                type="button"
                disabled={!liberada}
                onClick={() => (parada.tipo === "aula" ? setAulaAberta(true) : setAberta(i))}
                className={cn("parada", agora && "is-agora", feita && "is-feita")}
              >
                <span className="parada-icone" aria-hidden>
                  {parada.tipo === "aula" ? (
                    <IconeAula className="h-5 w-5" />
                  ) : (
                    <Obi cor={g!.cor} dan={/dan/i.test(g!.grau)} className="w-9" />
                  )}
                  {feita ? (
                    <span className="parada-visto">
                      <IconeFeito className="h-3 w-3" />
                    </span>
                  ) : !liberada ? (
                    <span className="parada-visto is-cadeado">
                      <IconeCadeado className="h-3 w-3" />
                    </span>
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-heading">{nomeDaParada(parada)}</span>
                  <span className="block text-2xs text-muted">
                    {parada.tipo === "aula"
                      ? feita
                        ? "Lida"
                        : "Comece por aqui"
                      : `${regra!.quantas} perguntas · ${regra!.alternativas} alternativas`}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <MiniAula
        ilha={ilha}
        aberta={aulaAberta}
        onFechar={() => setAulaAberta(false)}
        onConcluir={() => {
          jornada.lerAula(ilha.id);
          setAulaAberta(false);
        }}
      />

      <Modal open={parada !== null} onClose={() => setAberta(null)} titulo={parada ? `${ilha.nome} · ${nomeDaParada(parada)}` : ""}>
        {parada && parada.tipo === "faixa" ? (
          <NivelDeFaixa key={aberta} ilha={ilha} indice={parada.indice} onFeito={() => setAberta(null)} />
        ) : null}
      </Modal>

      <Modal open={revelar} onClose={() => jornada.verRecompensa(recompensa)} titulo="Ilha concluída">
        <div className="grid justify-items-center gap-3 text-center">
          <Selo kanji={ilha.kanji} cor={ilha.cor} tamanho={112} inclinacao={-5} animar />
          <p className="font-display text-2xl font-semibold text-heading">{ilha.selo.titulo}</p>
          <p className="font-kanji text-xl" style={{ color: ilha.cor }}>{ilha.selo.lemaJp}</p>
          <p className="body-muted">{ilha.selo.lemaPt}</p>
          <div className="mt-2 flex items-center gap-3 rounded-xl bg-elevated p-3 text-left">
            <AvatarMoldura moldura={ilha.moldura} iniciais="" tamanho={56} />
            <p className="text-sm">
              Você ganhou a <strong>{ilha.moldura.nome}</strong> para o seu medalhão.
            </p>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                jornada.definirPerfil({ moldura: ilha.moldura.id });
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

/** A mini aula da ilha: as lições em páginas curtas, uma de cada vez. */
function MiniAula({
  ilha,
  aberta,
  onFechar,
  onConcluir,
}: {
  ilha: Ilha;
  aberta: boolean;
  onFechar: () => void;
  onConcluir: () => void;
}) {
  const [pagina, setPagina] = useState(0);
  const licao = ilha.aula[pagina];
  const ultima = pagina === ilha.aula.length - 1;

  useEffect(() => {
    if (aberta) setPagina(0);
  }, [aberta]);

  return (
    <Modal open={aberta} onClose={onFechar} titulo={`Mini aula · ${ilha.nome}`}>
      <div className="mini-aula" style={{ "--game": ilha.cor } as React.CSSProperties}>
        <div className="mini-aula-topo">
          <Contas total={ilha.aula.length} feitas={pagina + 1} cor={ilha.cor} tamanho="sm" />
          <span className="text-2xs font-semibold text-muted">
            {pagina + 1} de {ilha.aula.length}
          </span>
        </div>
        {licao ? <PaginaDaAula licao={licao} /> : null}
        <div className="mt-5 flex flex-wrap justify-between gap-2">
          <Button size="sm" variant="ghost" disabled={pagina === 0} onClick={() => setPagina((n) => n - 1)}>
            ← Anterior
          </Button>
          {ultima ? (
            <Button size="sm" onClick={onConcluir}>
              Entendi, ir para as faixas
            </Button>
          ) : (
            <Button size="sm" onClick={() => setPagina((n) => n + 1)}>
              Próxima →
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}

function PaginaDaAula({ licao }: { licao: Licao }) {
  return (
    <article>
      <h3 className="heading-md">{licao.titulo}</h3>
      {licao.texto ? <p className="mt-2 text-sm leading-relaxed text-fg/90">{licao.texto}</p> : null}
      {licao.itens ? (
        <dl className="mini-aula-itens">
          {licao.itens.map((item) => (
            <div key={item.termo + item.texto}>
              <dt>
                {item.termo}
                {item.sub ? <span className="ml-2 text-xs font-normal text-muted">{item.sub}</span> : null}
              </dt>
              <dd>{item.texto}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}

/** Um nível de faixa: primeiro o resumo do que cai, depois as perguntas. */
function NivelDeFaixa({ ilha, indice, onFeito }: { ilha: Ilha; indice: number; onFeito: () => void }) {
  const [semente, setSemente] = useState<number | null>(null);
  const regra = regraDaFaixa(indice);
  const perguntas = useMemo(
    () => (semente === null ? [] : perguntasDaFaixa(ilha.tema, indice, semente)),
    [ilha.tema, indice, semente],
  );

  if (semente === null) {
    return <ResumoDaFaixa ilha={ilha} indice={indice} onComecar={() => setSemente(novaSemente())} />;
  }

  return (
    <QuizRodada
      key={semente}
      perguntas={perguntas}
      cor={ilha.cor}
      passa={Math.min(regra.passa, perguntas.length)}
      onFim={(_, passou) => (passou ? jornada.vencerFaixa(ilha.id, indice) : 0)}
      onDeNovo={() => setSemente(novaSemente())}
      continuar={{ rotulo: "Voltar à ilha", acao: onFeito }}
    />
  );
}

/** "O que cai nesta faixa": o resumo curto antes das perguntas. */
function ResumoDaFaixa({ ilha, indice, onComecar }: { ilha: Ilha; indice: number; onComecar: () => void }) {
  const regra = regraDaFaixa(indice);
  const { graduacao, tecnicas, katas } = conteudoDaFaixa(indice);
  const niveis = ["", "fácil", "média", "difícil"];

  // Nas ilhas que não dependem do programa da faixa, o resumo mostra uma
  // parte da mini aula, diferente a cada faixa.
  const itensDaAula = ilha.aula.flatMap((l) => l.itens ?? (l.texto ? [{ termo: l.titulo, texto: l.texto }] : []));
  const fatia = itensDaAula.length
    ? Array.from({ length: Math.min(3, itensDaAula.length) }, (_, k) => itensDaAula[(indice * 3 + k) % itensDaAula.length])
    : [];

  return (
    <div className="resumo-faixa" style={{ "--game": ilha.cor } as React.CSSProperties}>
      <div className="resumo-faixa-topo">
        <Obi cor={graduacao?.cor ?? "#fff"} dan={/dan/i.test(graduacao?.grau ?? "")} className="w-20" animada />
        <div>
          <p className="eyebrow">Antes de começar</p>
          <p className="font-display text-xl font-semibold text-heading">
            Faixa {graduacao?.faixa} · {graduacao?.grau}
          </p>
        </div>
      </div>

      <ul className="resumo-faixa-regras">
        <li><strong>{regra.quantas}</strong> perguntas</li>
        <li><strong>{regra.alternativas}</strong> alternativas</li>
        <li>passa com <strong>{regra.passa}</strong></li>
        <li>de {niveis[regra.niveis[0]]} a {niveis[regra.niveis[1]]}</li>
      </ul>

      {ilha.tema === "kihon" ? (
        tecnicas.length ? (
          <>
            <p className="label mt-4">O kihon desta faixa</p>
            <dl className="mini-aula-itens">
              {tecnicas.map((t) => (
                <div key={t.nome}>
                  <dt>
                    {t.nome} <span className="ml-1 text-xs font-normal text-muted">{t.pt}</span>
                  </dt>
                  <dd>{t.desc.split(/(?<=[.!?])\s/)[0]}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <p className="body-muted mt-4 text-sm">
            Nesta faixa o programa pede combinações e kumite livre. As perguntas misturam o kihon de todas as faixas, no nível mais difícil.
          </p>
        )
      ) : ilha.tema === "kata" ? (
        <>
          <p className="label mt-4">{katas.length ? "Os katas desta faixa" : "Para chegar à próxima faixa"}</p>
          <dl className="mini-aula-itens">
            {(katas.length ? katas : conteudoDaFaixa(indice + 1).katas).map((k) => (
              <div key={k.id}>
                <dt>
                  {k.nome} <span className="ml-1 text-xs font-normal text-muted">{k.significadoNome}</span>
                </dt>
                <dd>
                  {k.quantidadeMovimentos} movimentos
                  {k.posicoesKiai ? ` · kiai nos ${k.posicoesKiai.toLowerCase()}` : ""}.
                  {indice > 0 ? " Também caem os katas das faixas anteriores." : ""}
                </dd>
              </div>
            ))}
          </dl>
          {!katas.length ? (
            <p className="mt-2 text-2xs text-muted">
              A faixa Branca pede o Taikyoku Shodan, que ainda não tem ficha no acervo: as perguntas preparam para o Heian Shodan.
            </p>
          ) : null}
        </>
      ) : fatia.length ? (
        <>
          <p className="label mt-4">Para lembrar</p>
          <dl className="mini-aula-itens">
            {fatia.map((item) => (
              <div key={item.termo + item.texto}>
                <dt>{item.termo}</dt>
                <dd>{item.texto.length > 220 ? `${item.texto.slice(0, 217)}…` : item.texto}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : null}

      <Button className="mt-5" onClick={onComecar}>
        Começar as perguntas
      </Button>
    </div>
  );
}

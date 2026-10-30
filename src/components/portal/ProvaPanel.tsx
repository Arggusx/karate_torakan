"use client";

import { useCallback, useEffect, useState } from "react";
import { ComoFunciona } from "@/components/jornada/ComoFunciona";
import { Contas } from "@/components/jornada/Contas";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { graduacaoDaFaixa } from "@/services/dataService";
import { PROVA, type PerguntaPublica } from "@/services/perguntas";

/**
 * Prova da faixa, no portal do aluno.
 *
 * É a "prova de verdade": o servidor monta as perguntas a partir do programa
 * da faixa atual, guarda o gabarito e corrige na entrega. Diferente dos
 * minigames da Jornada, aqui a resposta certa só aparece no fim.
 *
 * O que continua igual aos jogos: sem relógio, sem punição — dá para refazer
 * quando quiser, e o resultado é informação, não sentença.
 */

const COR = "#B91C1C";

interface ProvaAberta {
  id: number;
  faixa: string;
  perguntas: PerguntaPublica[];
}

interface Correcao {
  enunciado: string;
  alternativas: string[];
  correta: number;
  marcada: number | null;
  porque: string;
  tipo: "pratica" | "teoria";
}

interface Resultado {
  faixa: string;
  acertos: number;
  total: number;
  minimo: number;
  aprovado: boolean;
  correcao: Correcao[];
}

interface ItemHistorico {
  id: number;
  faixa: string;
  acertos: number;
  total: number;
  aprovado: boolean;
  concluidaEm: string;
}

const chaveRespostas = (id: number) => `torakan:prova:${id}`;

const dataCurta = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export function ProvaPanel({ faixa }: { faixa: string }) {
  const [historico, setHistorico] = useState<ItemHistorico[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [prova, setProva] = useState<ProvaAberta | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [carregando, setCarregando] = useState(false);

  const carregarHistorico = useCallback(async () => {
    const resposta = await fetch("/api/provas", { cache: "no-store" });
    const dados = await resposta.json();
    if (!resposta.ok) {
      setErro(dados.erro ?? "Não foi possível carregar as provas.");
      setHistorico([]);
      return;
    }
    setErro(null);
    setHistorico(dados.historico);
  }, []);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  async function comecar() {
    setCarregando(true);
    const resposta = await fetch("/api/provas", { method: "POST" });
    const dados = await resposta.json();
    setCarregando(false);
    if (!resposta.ok) {
      setErro(dados.erro ?? "Não foi possível montar a prova.");
      return;
    }
    setResultado(null);
    setProva(dados.prova);
  }

  if (prova) {
    return (
      <EmProva
        prova={prova}
        onEntregue={(r) => {
          setProva(null);
          setResultado(r);
          carregarHistorico();
        }}
      />
    );
  }

  if (resultado) {
    return <ResultadoDaProva resultado={resultado} onVoltar={() => setResultado(null)} />;
  }

  const graduacao = graduacaoDaFaixa(faixa);

  return (
    <div className="grid gap-4">
      <ComoFunciona
        id="prova"
        passos={[
          `São ${PROVA.pratica + PROVA.teoria} perguntas de múltipla escolha.`,
          `${PROVA.pratica} são sobre a prática da sua faixa: o kihon e os katas do seu programa — bases, técnicas, ordem dos movimentos.`,
          `${PROVA.teoria} são de teoria: Dojo Kun, princípios, vocabulário e história.`,
          `Aprova com ${PROVA.minimo} acertos. Não tem relógio, e você pode voltar e mudar respostas antes de entregar.`,
          "Depois de entregar, você vê a correção com a explicação de cada pergunta.",
        ]}
        nota="A prova cobre o conhecimento. A execução no tatame continua sendo avaliada pelo sensei no exame de faixa."
      />

      <section className="painel card-faixa grid gap-4 [--faixa-cor:#B91C1C] sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="eyebrow">Prova teórica</p>
          <h2 className="heading-lg mt-1">Faixa {faixa}</h2>
          {graduacao ? (
            <dl className="mt-3 grid gap-1.5 text-xs">
              <div className="flex gap-2">
                <dt className="w-14 shrink-0 text-muted">Katas</dt>
                <dd className="text-fg">{graduacao.katasExigidos.join(" · ") || "—"}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-14 shrink-0 text-muted">Kihon</dt>
                <dd className="text-fg">{graduacao.kihonExigido.join(" · ") || "—"}</dd>
              </div>
            </dl>
          ) : null}
        </div>
        <Button onClick={comecar} disabled={carregando || Boolean(erro && historico?.length === 0 && erro.includes("migração"))}>
          {carregando ? "Montando a prova…" : "Começar a prova"}
        </Button>
      </section>

      {erro ? (
        <p className="rounded-lg border border-status-warn/40 bg-status-warn/10 px-3 py-2 text-xs text-fg">
          {erro}
        </p>
      ) : null}

      <section className="card">
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <h3 className="heading-md">Suas provas</h3>
          <span className="text-2xs text-muted">{historico?.length ?? 0} entregues</span>
        </header>
        {historico === null ? (
          <p className="px-4 py-4 text-xs text-muted">Carregando…</p>
        ) : historico.length === 0 ? (
          <p className="px-4 py-4 text-xs text-muted">
            Nenhuma prova entregue ainda. Quando você fizer a primeira, ela aparece aqui.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {historico.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span>
                  <span className="block text-sm font-semibold text-heading">Faixa {h.faixa}</span>
                  <span className="block text-2xs text-muted">{dataCurta(h.concluidaEm)}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-sm font-semibold tabular-nums text-fg">
                    {h.acertos}/{h.total}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-2xs font-semibold",
                      h.aprovado ? "bg-status-ok/10 text-status-ok" : "bg-elevated text-muted",
                    )}
                  >
                    {h.aprovado ? "Aprovado" : "Ainda não"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/** A prova em andamento: uma pergunta por vez, com volta livre. */
function EmProva({ prova, onEntregue }: { prova: ProvaAberta; onEntregue: (r: Resultado) => void }) {
  const total = prova.perguntas.length;
  const [respostas, setRespostas] = useState<(number | null)[]>(() => Array(total).fill(null));
  const [atual, setAtual] = useState(0);
  const [confirmar, setConfirmar] = useState(false);
  const [entregando, setEntregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Respostas guardadas no aparelho: recarregar a página não apaga o que já marcou.
  useEffect(() => {
    try {
      const salvas = JSON.parse(localStorage.getItem(chaveRespostas(prova.id)) ?? "null");
      if (Array.isArray(salvas) && salvas.length === total) setRespostas(salvas);
    } catch {
      /* sem armazenamento */
    }
  }, [prova.id, total]);

  function marcar(i: number) {
    setRespostas((r) => {
      const prox = r.map((v, j) => (j === atual ? i : v));
      try {
        localStorage.setItem(chaveRespostas(prova.id), JSON.stringify(prox));
      } catch {
        /* sem armazenamento */
      }
      return prox;
    });
  }

  async function entregar() {
    setEntregando(true);
    setErro(null);
    const resposta = await fetch(`/api/provas/${prova.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ respostas }),
    });
    const dados = await resposta.json();
    setEntregando(false);
    if (!resposta.ok) {
      setErro(dados.erro ?? "Não foi possível entregar.");
      return;
    }
    try {
      localStorage.removeItem(chaveRespostas(prova.id));
    } catch {
      /* sem armazenamento */
    }
    onEntregue(dados.resultado);
  }

  const p = prova.perguntas[atual];
  const respondidas = respostas.map((r, i) => (r === null ? -1 : i)).filter((i) => i >= 0);
  const emBranco = total - respondidas.length;

  return (
    <div className="painel" style={{ "--game": COR } as React.CSSProperties}>
      <div className="quiz-topo">
        <Contas total={total} feitas={respondidas} proxima={atual} cor={COR} rotulo={`${respondidas.length} de ${total} respondidas`} />
        <span className="quiz-contador">
          Pergunta {atual + 1} de {total} · {p.tipo === "pratica" ? "prática" : "teoria"}
        </span>
      </div>

      <p className="quiz-enunciado">{p.enunciado}</p>

      <ul className="quiz-alternativas">
        {p.alternativas.map((alt, i) => (
          <li key={alt}>
            <button
              type="button"
              onClick={() => marcar(i)}
              aria-pressed={respostas[atual] === i}
              className="quiz-alternativa"
            >
              <span className="quiz-letra" aria-hidden>{"ABCD"[i]}</span>
              {alt}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <Button size="sm" variant="secondary" disabled={atual === 0} onClick={() => setAtual(atual - 1)}>
          ← Anterior
        </Button>
        {atual + 1 < total ? (
          <Button size="sm" onClick={() => setAtual(atual + 1)}>
            Próxima →
          </Button>
        ) : (
          <Button size="sm" onClick={() => setConfirmar(true)}>
            Entregar prova
          </Button>
        )}
      </div>

      {/* Atalho para qualquer pergunta: dá para revisar antes de entregar. */}
      <nav className="mt-4 flex flex-wrap gap-1.5" aria-label="Ir para a pergunta">
        {prova.perguntas.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setAtual(i)}
            aria-current={i === atual ? "step" : undefined}
            className={cn(
              "h-8 w-8 rounded-full text-xs font-semibold tabular-nums transition-colors",
              i === atual
                ? "bg-accent-solid text-on-accent"
                : respostas[i] !== null
                  ? "bg-accent/10 text-accent"
                  : "bg-elevated text-muted",
            )}
          >
            {i + 1}
          </button>
        ))}
      </nav>

      <Modal open={confirmar} onClose={() => setConfirmar(false)} titulo="Entregar a prova?">
        <p className="body-muted">
          {emBranco > 0
            ? `${emBranco} ${emBranco === 1 ? "pergunta está" : "perguntas estão"} em branco e contam como erro.`
            : "Todas as perguntas foram respondidas."}{" "}
          Depois de entregar, não dá para mudar as respostas.
        </p>
        {erro ? <p className="mt-2 text-xs text-status-bad">{erro}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={entregar} disabled={entregando}>
            {entregando ? "Corrigindo…" : "Entregar"}
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setConfirmar(false)}>
            Revisar mais
          </Button>
        </div>
      </Modal>
    </div>
  );
}

function ResultadoDaProva({ resultado, onVoltar }: { resultado: Resultado; onVoltar: () => void }) {
  const faltaram = resultado.minimo - resultado.acertos;
  return (
    <div className="grid gap-4">
      <section className={cn("painel card-faixa text-center", resultado.aprovado ? "[--faixa-cor:#16A34A]" : "[--faixa-cor:rgb(var(--gold))]")}>
        <p className="eyebrow">Faixa {resultado.faixa}</p>
        <p className="mt-2 font-display text-5xl font-bold tabular-nums text-heading">
          {resultado.acertos}
          <span className="text-2xl text-muted">/{resultado.total}</span>
        </p>
        <p className="heading-md mt-2">
          {resultado.aprovado ? "Aprovado na prova teórica" : "Ainda não foi desta vez"}
        </p>
        <p className="body-muted mx-auto mt-1 max-w-md">
          {resultado.aprovado
            ? "O resultado ficou registrado no seu histórico e na análise curricular. O exame de faixa no tatame é com o sensei."
            : `Faltaram ${faltaram} ${faltaram === 1 ? "acerto" : "acertos"} para os ${resultado.minimo}. Leia a correção abaixo e refaça quando quiser.`}
        </p>
        <Button size="sm" className="mt-4" onClick={onVoltar}>
          Voltar às provas
        </Button>
      </section>

      <section className="card">
        <header className="border-b border-line px-4 py-3">
          <h3 className="heading-md">Correção</h3>
        </header>
        <ol className="divide-y divide-line">
          {resultado.correcao.map((c, i) => {
            const certo = c.marcada === c.correta;
            return (
              <li key={i} className="px-4 py-4">
                <p className="flex items-start gap-2 text-sm font-semibold text-heading">
                  <span
                    className={cn(
                      "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[0.65rem] text-on-accent",
                      certo ? "bg-status-ok" : "bg-subtle",
                    )}
                    aria-label={certo ? "Certa" : "Errada"}
                  >
                    {certo ? "✓" : "×"}
                  </span>
                  {i + 1}. {c.enunciado}
                </p>
                <p className="mt-1.5 pl-7 text-xs text-fg">
                  Certa: <strong>{c.alternativas[c.correta]}</strong>
                  {!certo ? (
                    <span className="text-muted">
                      {" "}· Você marcou: {c.marcada === null ? "em branco" : c.alternativas[c.marcada]}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 pl-7 text-xs leading-relaxed text-muted">{c.porque}</p>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

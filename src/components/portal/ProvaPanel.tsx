"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ComoFunciona } from "@/components/jornada/ComoFunciona";
import { Contas } from "@/components/jornada/Contas";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { PROVA, type PerguntaPublica } from "@/services/perguntas";

/**
 * Provas do aluno.
 *
 * O aluno não começa prova sozinho: o professor monta (ou gera pela faixa),
 * revisa e libera. Aqui aparecem as liberadas, prontas para fazer, e as já
 * entregues. O servidor guarda o gabarito e corrige na entrega — a resposta
 * certa só aparece no fim.
 *
 * Sem relógio e sem punição: o resultado é informação, não sentença.
 */

const COR = "#B91C1C";
const LETRAS = "ABCDEF";
const NIVEL: Record<number, string> = { 1: "fácil", 2: "média", 3: "difícil" };

interface Pendente {
  id: number;
  titulo: string;
  faixa: string;
  total: number;
  minimo: number;
  liberadaEm: string;
  iniciada: boolean;
}

interface ProvaAberta {
  id: number;
  titulo: string;
  faixa: string;
  minimo: number;
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
  titulo: string;
  faixa: string;
  acertos: number;
  total: number;
  minimo: number;
  aprovado: boolean;
  correcao: Correcao[];
}

interface ItemHistorico {
  id: number;
  titulo: string;
  faixa: string;
  acertos: number;
  total: number;
  aprovado: boolean;
  concluidaEm: string;
}

const chaveRespostas = (id: number) => `torakan:prova:${id}`;

const dataCurta = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

export function ProvaPanel() {
  const [pendentes, setPendentes] = useState<Pendente[] | null>(null);
  const [historico, setHistorico] = useState<ItemHistorico[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [prova, setProva] = useState<ProvaAberta | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [abrindo, setAbrindo] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    const resposta = await fetch("/api/provas", { cache: "no-store" });
    const dados = await resposta.json();
    if (!resposta.ok) {
      setErro(dados.erro ?? "Não foi possível carregar as provas.");
      setPendentes([]);
      return;
    }
    setErro(null);
    setPendentes(dados.pendentes ?? []);
    setHistorico(dados.historico ?? []);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function abrir(id: number) {
    setAbrindo(id);
    const resposta = await fetch(`/api/provas/${id}`, { cache: "no-store" });
    const dados = await resposta.json();
    setAbrindo(null);
    if (!resposta.ok) {
      setErro(dados.erro ?? "Não foi possível abrir a prova.");
      carregar();
      return;
    }
    setResultado(null);
    setProva(dados.prova);
  }

  if (prova) {
    return (
      <EmProva
        prova={prova}
        onSair={() => setProva(null)}
        onEntregue={(r) => {
          setProva(null);
          setResultado(r);
          carregar();
        }}
      />
    );
  }

  if (resultado) {
    return <ResultadoDaProva resultado={resultado} onVoltar={() => setResultado(null)} />;
  }

  return (
    <div className="grid gap-4">
      <ComoFunciona
        id="prova-liberada"
        passos={[
          "A prova aparece aqui quando o seu sensei liberar — não precisa pedir nem procurar.",
          `As provas da faixa têm ${PROVA.total} perguntas, das fáceis às difíceis: o kihon e os katas do seu programa, mais Dojo Kun, princípios, vocabulário e história.`,
          "Aprova com 75% de acertos. Não tem relógio, e dá para voltar e mudar respostas antes de entregar.",
          "Pode sair e continuar depois: o que você marcou fica guardado neste aparelho.",
          "Depois de entregar, você vê a correção com a explicação de cada pergunta.",
        ]}
        nota="A prova cobre o conhecimento. A execução no tatame continua sendo avaliada pelo sensei no exame de faixa."
      />

      {erro ? (
        <p className="rounded-lg border border-status-warn/40 bg-status-warn/10 px-3 py-2 text-xs text-fg">
          {erro}
        </p>
      ) : null}

      {pendentes === null ? (
        <section className="painel">
          <p className="text-xs text-muted">Carregando…</p>
        </section>
      ) : pendentes.length === 0 ? (
        <section className="painel prova-vazia">
          <svg viewBox="0 0 120 80" className="prova-vazia-arte" aria-hidden>
            <rect x="22" y="14" width="56" height="58" rx="6" className="prova-vazia-folha" />
            <path d="M32 30h36M32 40h36M32 50h24" className="prova-vazia-linhas" />
            <circle cx="88" cy="54" r="15" className="prova-vazia-selo" />
            <text x="88" y="55" textAnchor="middle" dominantBaseline="central" className="prova-vazia-kanji">
              待
            </text>
          </svg>
          <div>
            <p className="eyebrow">Nenhuma prova liberada</p>
            <h2 className="heading-md mt-1">Quando o sensei liberar, ela aparece aqui</h2>
            <p className="body-muted mt-1 max-w-md">
              Enquanto isso, dá para treinar o mesmo conteúdo nos jogos da Jornada, sem nota.
            </p>
            <Link href="/estudos/jornada" className="mt-3 inline-block text-xs font-semibold text-accent underline-offset-2 hover:underline">
              Abrir a Jornada →
            </Link>
          </div>
        </section>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {pendentes.map((p) => (
            <article key={p.id} className="painel card-faixa flex flex-col gap-3 [--faixa-cor:#B91C1C]">
              <div>
                <p className="eyebrow">{p.iniciada ? "Em andamento" : "Liberada para você"}</p>
                <h2 className="heading-md mt-1">{p.titulo}</h2>
                <p className="mt-1 text-2xs text-muted">
                  {p.total} perguntas · aprova com {p.minimo} · liberada em {dataCurta(p.liberadaEm)}
                </p>
              </div>
              <Button size="sm" className="self-start" onClick={() => abrir(p.id)} disabled={abrindo !== null}>
                {abrindo === p.id ? "Abrindo…" : p.iniciada ? "Continuar a prova" : "Começar a prova"}
              </Button>
            </article>
          ))}
        </div>
      )}

      <section className="card">
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <h3 className="heading-md">Suas provas</h3>
          <span className="text-2xs text-muted">{historico.length} entregues</span>
        </header>
        {historico.length === 0 ? (
          <p className="px-4 py-4 text-xs text-muted">
            Nenhuma prova entregue ainda. Quando você fizer a primeira, ela aparece aqui.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {historico.map((h) => (
              <li key={h.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-heading">{h.titulo}</span>
                  <span className="block text-2xs text-muted">
                    Faixa {h.faixa} · {dataCurta(h.concluidaEm)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
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
function EmProva({
  prova,
  onEntregue,
  onSair,
}: {
  prova: ProvaAberta;
  onEntregue: (r: Resultado) => void;
  onSair: () => void;
}) {
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
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onSair}
          className="text-xs font-semibold text-muted underline-offset-2 hover:text-accent hover:underline"
        >
          ← Sair e continuar depois
        </button>
        <span className="text-2xs text-subtle">{prova.titulo}</span>
      </div>

      <div className="quiz-topo">
        <Contas total={total} feitas={respondidas} proxima={atual} cor={COR} rotulo={`${respondidas.length} de ${total} respondidas`} />
        <span className="quiz-contador">
          Pergunta {atual + 1} de {total} · {p.tipo === "pratica" ? "prática" : "teoria"} · {NIVEL[p.nivel] ?? ""}
        </span>
      </div>

      <p className="quiz-enunciado">{p.enunciado}</p>

      <ul className="quiz-alternativas">
        {p.alternativas.map((alt, i) => (
          <li key={`${i}-${alt}`}>
            <button
              type="button"
              onClick={() => marcar(i)}
              aria-pressed={respostas[atual] === i}
              className="quiz-alternativa"
            >
              <span className="quiz-letra" aria-hidden>{LETRAS[i]}</span>
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
        <p className="eyebrow">{resultado.titulo}</p>
        <p className="mt-2 font-display text-5xl font-bold tabular-nums text-heading">
          {resultado.acertos}
          <span className="text-2xl text-muted">/{resultado.total}</span>
        </p>
        <p className="heading-md mt-2">
          {resultado.aprovado ? "Aprovado na prova teórica" : "Ainda não foi desta vez"}
        </p>
        <p className="body-muted mx-auto mt-1 max-w-md">
          {resultado.aprovado
            ? "O resultado ficou registrado no seu histórico e o sensei já pode ver. O exame de faixa no tatame é com ele."
            : `Faltaram ${faltaram} ${faltaram === 1 ? "acerto" : "acertos"} para os ${resultado.minimo}. Leia a correção abaixo; o sensei pode liberar uma nova prova quando você estiver pronto.`}
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
                {c.porque ? <p className="mt-1 pl-7 text-xs leading-relaxed text-muted">{c.porque}</p> : null}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

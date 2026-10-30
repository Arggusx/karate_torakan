"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AvatarMini } from "@/components/portal/AvatarMini";
import { EditorProva, perguntaEmBranco, type ProvaEmEdicao } from "@/components/portal/EditorProva";
import { Badge, BeltBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAcademia } from "@/lib/academiaStore";
import { cn } from "@/lib/cn";
import { getGraduacoes, graduacaoDaFaixa } from "@/services/dataService";
import { PROVA, minimoPara, montarProva, novaSemente } from "@/services/perguntas";

/**
 * Provas, no portal do professor e do admin.
 *
 * Fluxo: gerar pela faixa (ou começar em branco) → revisar e editar as
 * perguntas → liberar para um ou vários alunos → acompanhar quem entregou.
 * O aluno só vê a prova depois de liberada.
 */

const GRADUACOES = getGraduacoes();

interface ModeloResumo {
  id: number;
  titulo: string;
  faixa: string;
  total: number;
  minimo: number;
  autor: string | null;
  atualizadaEm: string;
  liberadas: number;
  entregues: number;
}

interface Liberada {
  id: number;
  alunoId: number;
  alunoNome: string;
  titulo: string;
  liberadaEm: string;
  iniciadaEm: string | null;
  concluidaEm: string | null;
  acertos: number | null;
  total: number;
  aprovado: boolean | null;
}

const dataCurta = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

const corDaFaixa = (faixa: string) => graduacaoDaFaixa(faixa)?.cor ?? "rgb(var(--line-strong))";

async function lerJson(resposta: Response) {
  try {
    return await resposta.json();
  } catch {
    return {};
  }
}

export function ProvasEquipePanel() {
  const toast = useToast();
  const [modelos, setModelos] = useState<ModeloResumo[] | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [editando, setEditando] = useState<ProvaEmEdicao | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [gerar, setGerar] = useState(false);
  const [liberar, setLiberar] = useState<ModeloResumo | null>(null);
  const [resultados, setResultados] = useState<ModeloResumo | null>(null);

  const carregar = useCallback(async () => {
    const resposta = await fetch("/api/provas/modelos", { cache: "no-store" });
    const dados = await lerJson(resposta);
    if (!resposta.ok) {
      setAviso(dados.erro ?? "Não foi possível carregar as provas.");
      setModelos([]);
      return;
    }
    setAviso(null);
    setModelos(dados.modelos);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function abrirParaEditar(id: number) {
    const resposta = await fetch(`/api/provas/modelos/${id}`, { cache: "no-store" });
    const dados = await lerJson(resposta);
    if (!resposta.ok) {
      toast(dados.erro ?? "Não foi possível abrir a prova.", "erro");
      return;
    }
    setEditando(dados.modelo);
  }

  function gerarPelaFaixa(faixa: string) {
    const graduacao = GRADUACOES.find((g) => g.faixa === faixa);
    const perguntas = montarProva(graduacao, novaSemente());
    setGerar(false);
    setEditando({
      titulo: `Prova da faixa ${faixa}`,
      faixa,
      minimo: minimoPara(perguntas.length),
      perguntas,
    });
  }

  async function salvar(prova: ProvaEmEdicao, depois: "ficar" | "liberar") {
    setSalvando(true);
    const resposta = await fetch(prova.id ? `/api/provas/modelos/${prova.id}` : "/api/provas/modelos", {
      method: prova.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prova),
    });
    const dados = await lerJson(resposta);
    setSalvando(false);
    if (!resposta.ok) {
      toast(dados.erro ?? "Não foi possível salvar.", "erro");
      return;
    }
    toast("Prova salva.");
    setEditando(null);
    await carregar();
    if (depois === "liberar") {
      const m = dados.modelo;
      setLiberar({
        id: m.id,
        titulo: m.titulo,
        faixa: m.faixa,
        total: m.perguntas.length,
        minimo: m.minimo,
        autor: null,
        atualizadaEm: m.atualizadaEm,
        liberadas: 0,
        entregues: 0,
      });
    }
  }

  async function apagar(modelo: ModeloResumo) {
    if (!window.confirm(`Apagar "${modelo.titulo}"? As provas já liberadas continuam com os alunos.`)) return;
    const resposta = await fetch(`/api/provas/modelos/${modelo.id}`, { method: "DELETE" });
    const dados = await lerJson(resposta);
    if (!resposta.ok) {
      toast(dados.erro ?? "Não foi possível apagar.", "erro");
      return;
    }
    toast("Prova apagada.");
    carregar();
  }

  if (editando) {
    return (
      <EditorProva
        inicial={editando}
        salvando={salvando}
        onSalvar={salvar}
        onCancelar={() => setEditando(null)}
      />
    );
  }

  return (
    <div className="grid gap-4">
      <section className="prova-equipe-hero">
        <div>
          <p className="eyebrow">Provas</p>
          <h2 className="heading-lg mt-1">Monte, revise e libere</h2>
          <p className="body-muted mt-1 max-w-xl">
            O aluno só vê a prova depois que você liberar. Gere uma pela faixa ({PROVA.total} perguntas, das
            fáceis às difíceis) e ajuste o que quiser, ou escreva a sua do zero.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setGerar(true)} disabled={Boolean(aviso)}>
              Gerar pela faixa
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={Boolean(aviso)}
              onClick={() =>
                setEditando({ titulo: "", faixa: "", minimo: 1, perguntas: [perguntaEmBranco()] })
              }
            >
              Prova em branco
            </Button>
          </div>
        </div>
        <ol className="prova-equipe-passos" aria-label="Como funciona">
          <li><span>1</span>Gerar ou escrever</li>
          <li><span>2</span>Revisar perguntas</li>
          <li><span>3</span>Liberar aos alunos</li>
          <li><span>4</span>Ver resultados</li>
        </ol>
      </section>

      {aviso ? (
        <p className="rounded-lg border border-status-warn/40 bg-status-warn/10 px-3 py-2 text-xs text-fg">{aviso}</p>
      ) : null}

      {modelos === null ? (
        <p className="text-xs text-muted">Carregando…</p>
      ) : modelos.length === 0 && !aviso ? (
        <p className="card px-4 py-6 text-center text-xs text-muted">
          Nenhuma prova montada ainda. Comece gerando uma pela faixa.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {modelos.map((m) => (
            <article
              key={m.id}
              className="painel card-faixa flex flex-col gap-3"
              style={{ "--faixa-cor": corDaFaixa(m.faixa) } as React.CSSProperties}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="heading-md">{m.titulo}</h3>
                {m.faixa ? <BeltBadge cor={corDaFaixa(m.faixa)}>{m.faixa}</BeltBadge> : <Badge>Livre</Badge>}
              </div>
              <p className="text-2xs text-muted">
                {m.total} perguntas · aprova com {m.minimo}
                {m.autor ? ` · por ${m.autor.split(" ")[0]}` : ""} · editada em {dataCurta(m.atualizadaEm)}
              </p>
              <div className="prova-equipe-uso">
                <span><strong>{m.liberadas}</strong> liberadas</span>
                <span><strong>{m.entregues}</strong> entregues</span>
              </div>
              <div className="mt-auto flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setLiberar(m)}>
                  Liberar
                </Button>
                <Button size="sm" variant="secondary" onClick={() => abrirParaEditar(m.id)}>
                  Editar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setResultados(m)} disabled={m.liberadas === 0}>
                  Resultados
                </Button>
                <Button size="sm" variant="ghost" onClick={() => apagar(m)}>
                  Apagar
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={gerar} onClose={() => setGerar(false)} titulo="Gerar prova pela faixa">
        <p className="body-muted">
          Sai com {PROVA.total} perguntas do programa da faixa — 7 fáceis, 8 médias e 5 difíceis — que você
          revisa antes de salvar.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GRADUACOES.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => gerarPelaFaixa(g.faixa)}
              className="faixa-escolha"
              style={{ "--faixa-cor": g.cor } as React.CSSProperties}
            >
              <span className="faixa-escolha-obi" aria-hidden />
              {g.faixa}
            </button>
          ))}
        </div>
      </Modal>

      <LiberarModal
        modelo={liberar}
        onClose={() => setLiberar(null)}
        onLiberado={() => {
          setLiberar(null);
          carregar();
        }}
      />

      <ResultadosModal
        modelo={resultados}
        onClose={() => setResultados(null)}
        onMudou={carregar}
      />
    </div>
  );
}

/** Escolhe os alunos que recebem a prova: um, vários, a turma ou a faixa. */
function LiberarModal({
  modelo,
  onClose,
  onLiberado,
}: {
  modelo: ModeloResumo | null;
  onClose: () => void;
  onLiberado: () => void;
}) {
  const { alunos, turmas } = useAcademia();
  const toast = useToast();
  const [busca, setBusca] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [soDaFaixa, setSoDaFaixa] = useState(false);
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    // Abriu para outra prova: começa do zero, já filtrando a faixa se houver.
    setBusca("");
    setTurmaId("");
    setSoDaFaixa(Boolean(modelo?.faixa));
    setMarcados(new Set());
  }, [modelo?.id, modelo?.faixa]);

  const daFaixa = useCallback(
    (faixaAluno: string) => Boolean(modelo?.faixa) && graduacaoDaFaixa(faixaAluno)?.faixa === modelo?.faixa,
    [modelo?.faixa],
  );

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return alunos
      .filter((a) => !turmaId || a.turmaId === turmaId)
      .filter((a) => !soDaFaixa || daFaixa(a.faixa))
      .filter((a) => !termo || a.nome.toLowerCase().includes(termo))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }, [alunos, busca, turmaId, soDaFaixa, daFaixa]);

  const todosVisiveisMarcados = visiveis.length > 0 && visiveis.every((a) => marcados.has(a.id));

  function alternar(id: string) {
    setMarcados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }

  function alternarVisiveis() {
    setMarcados((atual) => {
      const novo = new Set(atual);
      for (const a of visiveis) {
        if (todosVisiveisMarcados) novo.delete(a.id);
        else novo.add(a.id);
      }
      return novo;
    });
  }

  async function enviar() {
    if (!modelo) return;
    setEnviando(true);
    const resposta = await fetch(`/api/provas/modelos/${modelo.id}/liberar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alunoIds: [...marcados].map(Number) }),
    });
    const dados = await lerJson(resposta);
    setEnviando(false);
    if (!resposta.ok) {
      toast(dados.erro ?? "Não foi possível liberar.", "erro");
      return;
    }
    const { liberadas, puladas } = dados as { liberadas: number; puladas: number };
    toast(
      liberadas === 0
        ? "Esses alunos já estavam com esta prova pendente."
        : `Prova liberada para ${liberadas} ${liberadas === 1 ? "aluno" : "alunos"}${
            puladas ? ` (${puladas} já tinham)` : ""
          }.`,
    );
    onLiberado();
  }

  return (
    <Modal open={Boolean(modelo)} onClose={onClose} titulo={`Liberar “${modelo?.titulo ?? ""}”`}>
      <div className="grid gap-3">
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            className="input"
            placeholder="Buscar aluno"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Buscar aluno"
          />
          <select className="input" value={turmaId} onChange={(e) => setTurmaId(e.target.value)} aria-label="Turma">
            <option value="">Todas as turmas</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          {modelo?.faixa ? (
            <label className="flex items-center gap-2 text-xs text-fg">
              <input type="checkbox" checked={soDaFaixa} onChange={(e) => setSoDaFaixa(e.target.checked)} />
              Só alunos da faixa {modelo.faixa}
            </label>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={alternarVisiveis}
            disabled={visiveis.length === 0}
            className="text-xs font-semibold text-accent underline-offset-2 hover:underline disabled:opacity-40"
          >
            {todosVisiveisMarcados ? "Desmarcar todos" : `Marcar todos (${visiveis.length})`}
          </button>
        </div>

        <ul className="max-h-72 divide-y divide-line overflow-y-auto rounded-xl border border-line">
          {visiveis.length === 0 ? (
            <li className="px-3 py-4 text-center text-xs text-muted">Nenhum aluno com esses filtros.</li>
          ) : (
            visiveis.map((a) => (
              <li key={a.id}>
                <label className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-elevated">
                  <input type="checkbox" checked={marcados.has(a.id)} onChange={() => alternar(a.id)} />
                  <AvatarMini src={a.avatarUrl} iniciais={a.foto} />
                  <span className="min-w-0 flex-1 truncate text-sm text-fg">{a.nome}</span>
                  <BeltBadge cor={a.corFaixa}>{graduacaoDaFaixa(a.faixa)?.faixa ?? a.faixa}</BeltBadge>
                </label>
              </li>
            ))
          )}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted">
            {marcados.size} {marcados.size === 1 ? "aluno marcado" : "alunos marcados"}
          </span>
          <Button size="sm" onClick={enviar} disabled={enviando || marcados.size === 0}>
            {enviando ? "Liberando…" : `Liberar para ${marcados.size}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Quem recebeu a prova, quem já entregou e a nota; cancela as pendentes. */
function ResultadosModal({
  modelo,
  onClose,
  onMudou,
}: {
  modelo: ModeloResumo | null;
  onClose: () => void;
  onMudou: () => void;
}) {
  const toast = useToast();
  const [lista, setLista] = useState<Liberada[] | null>(null);

  const carregar = useCallback(async () => {
    if (!modelo) return;
    setLista(null);
    const resposta = await fetch(`/api/provas/liberadas?modeloId=${modelo.id}`, { cache: "no-store" });
    const dados = await lerJson(resposta);
    setLista(resposta.ok ? dados.liberadas : []);
  }, [modelo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function cancelar(item: Liberada) {
    const resposta = await fetch(`/api/provas/liberadas/${item.id}`, { method: "DELETE" });
    const dados = await lerJson(resposta);
    if (!resposta.ok) {
      toast(dados.erro ?? "Não foi possível cancelar.", "erro");
      return;
    }
    toast(`Prova de ${item.alunoNome.split(" ")[0]} cancelada.`);
    carregar();
    onMudou();
  }

  const entregues = lista?.filter((l) => l.concluidaEm) ?? [];
  const aprovados = entregues.filter((l) => l.aprovado).length;

  return (
    <Modal open={Boolean(modelo)} onClose={onClose} titulo={`Resultados — ${modelo?.titulo ?? ""}`}>
      {lista === null ? (
        <p className="text-xs text-muted">Carregando…</p>
      ) : lista.length === 0 ? (
        <p className="text-xs text-muted">Esta prova ainda não foi liberada para ninguém.</p>
      ) : (
        <div className="grid gap-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-elevated px-2 py-2">
              <p className="text-lg font-bold tabular-nums text-heading">{lista.length}</p>
              <p className="text-2xs text-muted">liberadas</p>
            </div>
            <div className="rounded-xl bg-elevated px-2 py-2">
              <p className="text-lg font-bold tabular-nums text-heading">{entregues.length}</p>
              <p className="text-2xs text-muted">entregues</p>
            </div>
            <div className="rounded-xl bg-elevated px-2 py-2">
              <p className="text-lg font-bold tabular-nums text-status-ok">{aprovados}</p>
              <p className="text-2xs text-muted">aprovados</p>
            </div>
          </div>
          <ul className="divide-y divide-line rounded-xl border border-line">
            {lista.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-fg">{l.alunoNome}</span>
                  <span className="block text-2xs text-muted">
                    liberada em {dataCurta(l.liberadaEm)}
                    {l.concluidaEm ? ` · entregue em ${dataCurta(l.concluidaEm)}` : ""}
                  </span>
                </span>
                {l.concluidaEm ? (
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-0.5 text-2xs font-semibold tabular-nums",
                      l.aprovado ? "bg-status-ok/10 text-status-ok" : "bg-elevated text-muted",
                    )}
                  >
                    {l.acertos}/{l.total} · {l.aprovado ? "aprovado" : "ainda não"}
                  </span>
                ) : (
                  <span className="flex shrink-0 items-center gap-2">
                    <Badge tone={l.iniciadaEm ? "warn" : "neutral"}>
                      {l.iniciadaEm ? "Fazendo" : "Não começou"}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => cancelar(l)}
                      className="text-2xs font-semibold text-muted underline-offset-2 hover:text-accent hover:underline"
                    >
                      Cancelar
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}

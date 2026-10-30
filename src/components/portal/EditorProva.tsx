"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { getGraduacoes, graduacaoDaFaixa } from "@/services/dataService";
import {
  minimoPara,
  novaSemente,
  outraPergunta,
  type Nivel,
  type Pergunta,
} from "@/services/perguntas";

/**
 * Editor de prova da equipe: título, faixa, nota mínima e as perguntas.
 *
 * Cada pergunta abre numa sanfona com o enunciado, as alternativas (marca a
 * certa no círculo), o nível, o tipo e a explicação mostrada na correção. Dá
 * para trocar uma pergunta por outra do banco, mover, remover e acrescentar
 * — em branco ou sorteada.
 */

const GRADUACOES = getGraduacoes();
const LETRAS = "ABCDEF";
const NIVEIS: { valor: Nivel; rotulo: string }[] = [
  { valor: 1, rotulo: "Fácil" },
  { valor: 2, rotulo: "Média" },
  { valor: 3, rotulo: "Difícil" },
];

export interface ProvaEmEdicao {
  id?: number;
  titulo: string;
  faixa: string;
  minimo: number;
  perguntas: Pergunta[];
}

const idNovo = () => `prof-${Math.random().toString(36).slice(2, 10)}`;

export const perguntaEmBranco = (): Pergunta => ({
  id: idNovo(),
  tema: "dojo",
  tipo: "teoria",
  nivel: 2,
  enunciado: "",
  alternativas: ["", "", "", ""],
  correta: 0,
  porque: "",
  sujeito: "",
});

export function EditorProva({
  inicial,
  salvando,
  onSalvar,
  onCancelar,
}: {
  inicial: ProvaEmEdicao;
  salvando: boolean;
  onSalvar: (prova: ProvaEmEdicao, depois: "ficar" | "liberar") => void;
  onCancelar: () => void;
}) {
  const toast = useToast();
  const [prova, setProva] = useState<ProvaEmEdicao>(inicial);
  // Sem nota mínima escolhida à mão, ela acompanha o total (75%).
  const [minimoManual, setMinimoManual] = useState(inicial.minimo !== minimoPara(inicial.perguntas.length));
  const [aberta, setAberta] = useState<string | null>(inicial.perguntas.length === 1 ? inicial.perguntas[0].id : null);

  const minimo = minimoManual ? Math.min(prova.minimo, prova.perguntas.length) : minimoPara(prova.perguntas.length);
  const graduacao = graduacaoDaFaixa(prova.faixa);

  const contagem = useMemo(() => {
    const porNivel = { 1: 0, 2: 0, 3: 0 } as Record<Nivel, number>;
    let teoria = 0;
    for (const p of prova.perguntas) {
      porNivel[p.nivel] += 1;
      if (p.tipo === "teoria") teoria += 1;
    }
    return { porNivel, teoria, pratica: prova.perguntas.length - teoria };
  }, [prova.perguntas]);

  function mudarPergunta(id: string, mudanca: Partial<Pergunta>) {
    setProva((atual) => ({
      ...atual,
      perguntas: atual.perguntas.map((p) => (p.id === id ? { ...p, ...mudanca } : p)),
    }));
  }

  function mover(indice: number, passo: -1 | 1) {
    setProva((atual) => {
      const lista = [...atual.perguntas];
      const alvo = indice + passo;
      if (alvo < 0 || alvo >= lista.length) return atual;
      [lista[indice], lista[alvo]] = [lista[alvo], lista[indice]];
      return { ...atual, perguntas: lista };
    });
  }

  function remover(id: string) {
    setProva((atual) => ({ ...atual, perguntas: atual.perguntas.filter((p) => p.id !== id) }));
  }

  function trocar(p: Pergunta) {
    const nova = outraPergunta(graduacao, novaSemente(), p, prova.perguntas);
    if (!nova) {
      toast("O banco não tem outra pergunta desse tipo agora.", "erro");
      return;
    }
    setProva((atual) => ({
      ...atual,
      perguntas: atual.perguntas.map((q) => (q.id === p.id ? nova : q)),
    }));
    setAberta(nova.id);
  }

  function acrescentarDoBanco(tipo: Pergunta["tipo"], nivel: Nivel) {
    const nova = outraPergunta(graduacao, novaSemente(), { tipo, nivel }, prova.perguntas);
    if (!nova) {
      toast("O banco não tem mais perguntas desse tipo.", "erro");
      return;
    }
    setProva((atual) => ({ ...atual, perguntas: [...atual.perguntas, nova] }));
  }

  function acrescentarEmBranco() {
    const nova = perguntaEmBranco();
    setProva((atual) => ({ ...atual, perguntas: [...atual.perguntas, nova] }));
    setAberta(nova.id);
  }

  function salvar(depois: "ficar" | "liberar") {
    onSalvar({ ...prova, minimo }, depois);
  }

  return (
    <div className="grid gap-4">
      <button
        type="button"
        onClick={onCancelar}
        className="justify-self-start text-xs font-semibold text-muted underline-offset-2 hover:text-accent hover:underline"
      >
        ← Voltar às provas
      </button>

      <section className="painel card-faixa grid gap-4 [--faixa-cor:#B91C1C]">
        <div>
          <p className="eyebrow">{prova.id ? "Editar prova" : "Nova prova"}</p>
          <p className="body-muted mt-1">
            Revise as perguntas antes de liberar. O que já foi liberado não muda se você editar depois.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[2fr_1fr_auto]">
          <div>
            <label htmlFor="prova-titulo" className="label">Título</label>
            <input
              id="prova-titulo"
              className="input mt-1"
              value={prova.titulo}
              maxLength={120}
              onChange={(e) => setProva({ ...prova, titulo: e.target.value })}
              placeholder="Ex.: Prova da faixa Amarela — março"
            />
          </div>
          <div>
            <label htmlFor="prova-faixa" className="label">Faixa</label>
            <select
              id="prova-faixa"
              className="input mt-1"
              value={prova.faixa}
              onChange={(e) => setProva({ ...prova, faixa: e.target.value })}
            >
              <option value="">Livre</option>
              {GRADUACOES.map((g) => (
                <option key={g.id} value={g.faixa}>
                  {g.faixa}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="prova-minimo" className="label">Aprova com</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                id="prova-minimo"
                type="number"
                min={1}
                max={Math.max(1, prova.perguntas.length)}
                className="input w-20"
                value={minimo}
                onChange={(e) => {
                  setMinimoManual(true);
                  setProva({ ...prova, minimo: Math.max(1, Number(e.target.value) || 1) });
                }}
              />
              <span className="whitespace-nowrap text-xs text-muted">de {prova.perguntas.length}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge>{prova.perguntas.length} perguntas</Badge>
          {NIVEIS.map((n) => (
            <Badge key={n.valor} tone={n.valor === 3 ? "accent" : "neutral"}>
              {contagem.porNivel[n.valor]} {n.rotulo.toLowerCase()}{contagem.porNivel[n.valor] === 1 ? "" : "s"}
            </Badge>
          ))}
          <Badge>{contagem.pratica} de prática</Badge>
          <Badge>{contagem.teoria} de teoria</Badge>
        </div>
      </section>

      <ol className="grid gap-2">
        {prova.perguntas.map((p, i) => (
          <li key={p.id} className="card overflow-hidden">
            <button
              type="button"
              onClick={() => setAberta(aberta === p.id ? null : p.id)}
              aria-expanded={aberta === p.id}
              className="flex w-full items-start gap-3 px-4 py-3 text-left"
            >
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-elevated text-2xs font-bold tabular-nums text-fg">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn("block text-sm text-fg", aberta === p.id ? "" : "line-clamp-2")}>
                  {p.enunciado || <em className="text-subtle">Pergunta sem enunciado</em>}
                </span>
                <span className="mt-1 flex flex-wrap gap-1.5 text-2xs text-muted">
                  <span className={cn("nivel-pilula", `nivel-${p.nivel}`)}>{NIVEIS[p.nivel - 1].rotulo}</span>
                  <span>{p.tipo === "pratica" ? "Prática" : "Teoria"}</span>
                  {p.alternativas[p.correta] ? (
                    <span className="truncate">· certa: {p.alternativas[p.correta]}</span>
                  ) : null}
                </span>
              </span>
              <span aria-hidden className={cn("mt-1 text-muted transition-transform", aberta === p.id && "rotate-180")}>
                ▾
              </span>
            </button>

            {aberta === p.id ? (
              <EditorPergunta
                pergunta={p}
                primeira={i === 0}
                ultima={i === prova.perguntas.length - 1}
                onMudar={(m) => mudarPergunta(p.id, m)}
                onMover={(passo) => mover(i, passo)}
                onTrocar={() => trocar(p)}
                onRemover={() => remover(p.id)}
              />
            ) : null}
          </li>
        ))}
      </ol>

      <section className="painel grid gap-3">
        <p className="label">Acrescentar pergunta</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={acrescentarEmBranco}>
            + Em branco
          </Button>
          {NIVEIS.map((n) => (
            <Button key={`p${n.valor}`} size="sm" variant="ghost" onClick={() => acrescentarDoBanco("pratica", n.valor)}>
              + Prática {n.rotulo.toLowerCase()}
            </Button>
          ))}
          {NIVEIS.map((n) => (
            <Button key={`t${n.valor}`} size="sm" variant="ghost" onClick={() => acrescentarDoBanco("teoria", n.valor)}>
              + Teoria {n.rotulo.toLowerCase()}
            </Button>
          ))}
        </div>
      </section>

      <div className="barra-salvar-prova">
        <Button variant="secondary" size="sm" onClick={onCancelar} disabled={salvando}>
          Cancelar
        </Button>
        <Button variant="secondary" size="sm" onClick={() => salvar("ficar")} disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar"}
        </Button>
        <Button size="sm" onClick={() => salvar("liberar")} disabled={salvando}>
          Salvar e liberar
        </Button>
      </div>
    </div>
  );
}

function EditorPergunta({
  pergunta: p,
  primeira,
  ultima,
  onMudar,
  onMover,
  onTrocar,
  onRemover,
}: {
  pergunta: Pergunta;
  primeira: boolean;
  ultima: boolean;
  onMudar: (m: Partial<Pergunta>) => void;
  onMover: (passo: -1 | 1) => void;
  onTrocar: () => void;
  onRemover: () => void;
}) {
  const nome = `correta-${p.id}`;

  function mudarAlternativa(i: number, valor: string) {
    onMudar({ alternativas: p.alternativas.map((a, j) => (j === i ? valor : a)) });
  }

  function tirarAlternativa(i: number) {
    const alternativas = p.alternativas.filter((_, j) => j !== i);
    // A certa acompanha a alternativa que ela marcava.
    const correta = i === p.correta ? 0 : i < p.correta ? p.correta - 1 : p.correta;
    onMudar({ alternativas, correta });
  }

  return (
    <div className="grid gap-3 border-t border-line bg-canvas/40 px-4 py-4">
      <div>
        <label htmlFor={`enunciado-${p.id}`} className="label">Enunciado</label>
        <textarea
          id={`enunciado-${p.id}`}
          className="input mt-1 min-h-[4.5rem] py-2"
          maxLength={500}
          value={p.enunciado}
          onChange={(e) => onMudar({ enunciado: e.target.value })}
        />
      </div>

      <fieldset>
        <legend className="label">Alternativas — marque a certa</legend>
        <ul className="mt-1 grid gap-1.5">
          {p.alternativas.map((alt, i) => (
            <li key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name={nome}
                checked={p.correta === i}
                onChange={() => onMudar({ correta: i })}
                className="h-4 w-4 accent-[rgb(var(--accent))]"
                aria-label={`Alternativa ${LETRAS[i]} é a certa`}
              />
              <span className="w-4 text-2xs font-bold text-muted">{LETRAS[i]}</span>
              <input
                className={cn("input", p.correta === i && "border-status-ok/60")}
                value={alt}
                maxLength={200}
                onChange={(e) => mudarAlternativa(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => tirarAlternativa(i)}
                disabled={p.alternativas.length <= 2}
                aria-label={`Tirar alternativa ${LETRAS[i]}`}
                className="h-8 w-8 shrink-0 rounded-full text-muted hover:bg-elevated hover:text-accent disabled:opacity-30"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        {p.alternativas.length < 6 ? (
          <button
            type="button"
            onClick={() => onMudar({ alternativas: [...p.alternativas, ""] })}
            className="mt-1.5 text-2xs font-semibold text-accent underline-offset-2 hover:underline"
          >
            + alternativa
          </button>
        ) : null}
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor={`nivel-${p.id}`} className="label">Dificuldade</label>
          <select
            id={`nivel-${p.id}`}
            className="input mt-1"
            value={p.nivel}
            onChange={(e) => onMudar({ nivel: Number(e.target.value) as Nivel })}
          >
            {NIVEIS.map((n) => (
              <option key={n.valor} value={n.valor}>{n.rotulo}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`tipo-${p.id}`} className="label">Tipo</label>
          <select
            id={`tipo-${p.id}`}
            className="input mt-1"
            value={p.tipo}
            onChange={(e) => onMudar({ tipo: e.target.value as Pergunta["tipo"] })}
          >
            <option value="pratica">Prática (kihon, kata)</option>
            <option value="teoria">Teoria (dojo, história…)</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={`porque-${p.id}`} className="label">Explicação (aparece na correção)</label>
        <textarea
          id={`porque-${p.id}`}
          className="input mt-1 min-h-[3.5rem] py-2"
          maxLength={800}
          value={p.porque}
          onChange={(e) => onMudar({ porque: e.target.value })}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={onTrocar}>
          Trocar por outra do banco
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onMover(-1)} disabled={primeira}>
          ↑ Subir
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onMover(1)} disabled={ultima}>
          ↓ Descer
        </Button>
        <Button size="sm" variant="danger" onClick={onRemover}>
          Remover
        </Button>
      </div>
    </div>
  );
}

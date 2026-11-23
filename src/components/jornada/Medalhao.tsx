"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AvatarMoldura } from "@/components/jornada/Insignias";
import { iniciaisDe, moldurasGanhas, pontosDoGrau, resumoDa } from "@/components/jornada/jogos";
import { useRanking } from "@/lib/jornadaRede";
import { jornada, useJornada } from "@/lib/jornadaStore";
import { getGraduacoes } from "@/services/dataService";
import { ILHAS, MOLDURA_SIMPLES } from "@/services/jornada";
import { grauDe } from "@/services/pontuacao";

const GRADUACOES = getGraduacoes();

/** Saudação conforme a hora do aparelho. */
function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

/**
 * Medalhão da Jornada: saudação, nome e faixa editáveis, a moldura vestida,
 * os pontos e o grau, e as molduras já conquistadas.
 */
export function Medalhao() {
  const estado = useJornada();
  const { dados } = useRanking();
  const { perfil } = estado;
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(perfil.nome);
  const [ola, setOla] = useState("Olá");

  // A hora é do aparelho: calcular no servidor daria a hora errada.
  useEffect(() => setOla(saudacao()), []);
  useEffect(() => setNome(perfil.nome), [perfil.nome]);

  const { ilhasFeitas, katasDominados } = resumoDa(estado);
  const ganhas = moldurasGanhas(estado, dados?.eu);
  const vestida = ganhas.find((m) => m.id === perfil.moldura) ?? MOLDURA_SIMPLES;
  const pontos = pontosDoGrau(estado, dados?.eu);
  const grau = grauDe(pontos);

  return (
    <section className="medalhao painel">
      <div className="medalhao-topo">
        <AvatarMoldura moldura={vestida} iniciais={iniciaisDe(perfil.nome)} tamanho={92} />
        <div className="min-w-0">
          <p className="text-xs text-muted">{ola}{perfil.nome ? "," : ""}</p>
          {editando ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                jornada.definirPerfil({ nome: nome.trim().slice(0, 40) });
                setEditando(false);
              }}
              className="mt-1 flex gap-1.5"
            >
              <input
                autoFocus
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                aria-label="Seu nome"
                placeholder="Seu nome"
                className="input h-9"
              />
              <button type="submit" className="chip shrink-0">Salvar</button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="text-left font-display text-2xl font-semibold leading-tight text-heading hover:text-accent"
            >
              {perfil.nome || "Como quer ser chamado?"}
            </button>
          )}
          <label className="mt-1.5 flex items-center gap-1.5 text-2xs text-muted">
            Minha faixa
            <select
              value={perfil.faixa}
              onChange={(e) => jornada.definirPerfil({ faixa: e.target.value })}
              className="rounded-full bg-elevated px-2 py-0.5 text-2xs font-semibold text-fg"
            >
              <option value="">Escolher</option>
              {GRADUACOES.map((g) => (
                <option key={g.id} value={g.faixa}>
                  {g.faixa} · {g.grau}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <Link href="/estudos/jornada/ranking" className="medalhao-grau">
        <span className="flex items-baseline justify-between gap-2">
          <span>
            <small>Grau</small>
            <strong>{grau.atual.nome}</strong>
          </span>
          <span className="text-right">
            <strong>{pontos.toLocaleString("pt-BR")}</strong>
            <small> pontos</small>
          </span>
        </span>
        <span className="ranking-barra is-fina">
          <span style={{ width: `${Math.round(grau.fracao * 100)}%` }} />
        </span>
        <small>
          {dados?.logado && dados.eu?.posicaoSemana
            ? `${dados.eu.posicaoSemana}º no ranking da semana`
            : grau.proximo
              ? `${grau.falta.toLocaleString("pt-BR")} para ${grau.proximo.nome}`
              : "Último grau da Jornada"}
        </small>
      </Link>

      <dl className="medalhao-numeros">
        <div>
          <dt>ilhas</dt>
          <dd>
            {ilhasFeitas.length}/{ILHAS.length}
          </dd>
        </div>
        <div>
          <dt>dias de treino</dt>
          <dd>{estado.dias.length}</dd>
        </div>
        <div>
          <dt>katas na ordem</dt>
          <dd>{katasDominados.length}</dd>
        </div>
        <div>
          <dt>molduras</dt>
          <dd>{ganhas.length}</dd>
        </div>
      </dl>

      <div className="grid gap-1.5">
        <span className="flex items-baseline justify-between gap-2">
          <small className="label">Suas molduras</small>
          <Link href="/estudos/jornada/colecao" className="text-2xs font-semibold text-muted hover:text-accent">
            Ver todas →
          </Link>
        </span>
        <div className="medalhao-molduras">
          {ganhas.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={vestida.id === m.id}
              title={m.nome}
              onClick={() => jornada.definirPerfil({ moldura: m.id })}
              className="medalhao-moldura"
            >
              <AvatarMoldura moldura={m} iniciais="" tamanho={34} animar={false} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

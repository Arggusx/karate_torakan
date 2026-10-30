"use client";

import { useEffect, useState } from "react";
import { AvatarMoldura } from "@/components/jornada/Insignias";
import { iniciaisDe, resumoDa } from "@/components/jornada/jogos";
import { jornada, useJornada } from "@/lib/jornadaStore";
import { getGraduacoes, getKatas } from "@/services/dataService";
import { CAMINHOS, MOLDURA_SIMPLES, TODAS_MOLDURAS } from "@/services/jornada";

const GRADUACOES = getGraduacoes();

/** Saudação conforme a hora do aparelho. */
function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

/**
 * Medalhão da Jornada: saudação, nome e faixa editáveis, a moldura vestida e
 * quatro números do que a pessoa já concluiu. Sem sequência, sem recorde.
 */
export function Medalhao() {
  const estado = useJornada();
  const { perfil } = estado;
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(perfil.nome);
  const [ola, setOla] = useState("Olá");

  // A hora é do aparelho: calcular no servidor daria a hora errada.
  useEffect(() => setOla(saudacao()), []);
  useEffect(() => setNome(perfil.nome), [perfil.nome]);

  const { caminhosFeitos, katasDominados, baralhos } = resumoDa(estado);
  const conquistadas = [
    MOLDURA_SIMPLES,
    ...caminhosFeitos.map((c) => c.moldura),
  ];
  const vestida =
    TODAS_MOLDURAS.find((m) => m.id === perfil.moldura && conquistadas.includes(m)) ?? MOLDURA_SIMPLES;

  return (
    <section className="medalhao painel">
      <div className="medalhao-topo">
        <AvatarMoldura moldura={vestida} iniciais={iniciaisDe(perfil.nome)} />
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

      <dl className="medalhao-numeros">
        <div>
          <dt>caminhos</dt>
          <dd>
            {caminhosFeitos.length}/{CAMINHOS.length}
          </dd>
        </div>
        <div>
          <dt>selos</dt>
          <dd>{caminhosFeitos.length}</dd>
        </div>
        <div>
          <dt>katas na ordem</dt>
          <dd>
            {katasDominados.length}/{getKatas().length}
          </dd>
        </div>
        <div>
          <dt>baralhos</dt>
          <dd>{baralhos.length}</dd>
        </div>
      </dl>

      <div className="grid gap-1.5">
        <small className="label">Molduras</small>
        <div className="medalhao-molduras">
          {TODAS_MOLDURAS.map((m) => {
            const tem = conquistadas.includes(m);
            return (
              <button
                key={m.id}
                type="button"
                disabled={!tem}
                aria-pressed={vestida.id === m.id}
                title={tem ? m.nome : `${m.nome} — conclua o caminho para ganhar`}
                onClick={() => jornada.definirPerfil({ moldura: m.id })}
                className="medalhao-moldura disabled:opacity-30"
              >
                <AvatarMoldura moldura={m} iniciais="" tamanho={34} />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

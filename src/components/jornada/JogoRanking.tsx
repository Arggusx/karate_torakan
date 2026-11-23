"use client";

import Link from "next/link";
import { useState } from "react";
import { ComoFunciona } from "@/components/jornada/ComoFunciona";
import { AvatarMoldura } from "@/components/jornada/Insignias";
import { iniciaisDe, jogo, pontosDoGrau } from "@/components/jornada/jogos";
import { AvatarMini } from "@/components/portal/AvatarMini";
import { FilterChips } from "@/components/ui/Tabs";
import { cn } from "@/lib/cn";
import { noPortal } from "@/lib/enderecos";
import { useRanking, type LinhaRanking } from "@/lib/jornadaRede";
import { useJornada } from "@/lib/jornadaStore";
import { MOLDURAS_GRAU, MOLDURAS_RANKING } from "@/services/jornada";
import { GRAUS, LIMITE_DIA, grauDe } from "@/services/pontuacao";

const COR = jogo("ranking")!.cor;

const PERIODOS = [
  { value: "semana" as const, label: "Esta semana" },
  { value: "mes" as const, label: "Este mês" },
];

/**
 * Ranking: os pontos da semana e do mês com todos os usuários do portal, o
 * grau de quem joga e as recompensas que vêm com os pontos e com o pódio.
 * Quem joga sem login vê o próprio grau (pontos do aparelho) e o convite
 * para entrar.
 */
export function JogoRanking() {
  const estado = useJornada();
  const { dados, erro } = useRanking();
  const [periodo, setPeriodo] = useState<"semana" | "mes">("semana");

  const pontos = pontosDoGrau(estado, dados?.eu);
  const grau = grauDe(pontos);
  const lista = (periodo === "semana" ? dados?.semana : dados?.mes) ?? [];

  return (
    <div className="grid gap-6" style={{ "--game": COR } as React.CSSProperties}>
      <ComoFunciona
        id="ranking"
        titulo="Como funcionam os pontos"
        passos={[
          "Cada acerto nas Ilhas e no Treino livre vale de 10 a 23 pontos: mais nas perguntas difíceis e nas de 5 alternativas.",
          "Mini aula lida, nível de faixa vencido, trecho de kata na ordem e família do Monte a técnica completa dão bônus (só na primeira vez).",
          "O ranking soma os pontos da semana (de segunda a domingo) e do mês, no horário de Brasília.",
          "Os pontos vão subindo o seu grau — e cada grau novo dá uma moldura animada para o medalhão.",
        ]}
        nota={`Para o ranking não virar maratona, cada pessoa soma no máximo ${LIMITE_DIA} pontos por dia. Errar nunca tira ponto.`}
      />

      <section className="ranking-grau painel">
        <div className="ranking-grau-topo">
          <span className="ranking-grau-kanji" aria-hidden>
            {grau.atual.kanji}
          </span>
          <div className="min-w-0">
            <p className="eyebrow">Seu grau</p>
            <p className="font-display text-3xl font-semibold leading-tight text-heading">{grau.atual.nome}</p>
            <p className="text-xs text-muted">
              {grau.atual.jp} · {grau.atual.sobre}
            </p>
          </div>
          <p className="ranking-grau-pontos">
            <strong>{pontos.toLocaleString("pt-BR")}</strong>
            <small>pontos</small>
          </p>
        </div>
        <div className="ranking-barra" role="img" aria-label={grau.proximo ? `Faltam ${grau.falta} pontos para ${grau.proximo.nome}` : "Grau máximo"}>
          <span style={{ width: `${Math.round(grau.fracao * 100)}%` }} />
        </div>
        <p className="mt-1.5 text-2xs text-muted">
          {grau.proximo
            ? `Faltam ${grau.falta.toLocaleString("pt-BR")} pontos para ${grau.proximo.nome} (${grau.proximo.jp}).`
            : "Você chegou ao último grau da Jornada."}
          {!dados?.logado ? " Estes são os pontos deste aparelho." : ""}
        </p>
        <ol className="ranking-graus">
          {GRAUS.map((g, i) => {
            const moldura = i > 0 ? MOLDURAS_GRAU[i - 1] : null;
            const tem = i <= grau.indice;
            return (
              <li key={g.id} className={cn(tem && "is-feito", i === grau.indice && "is-atual")}>
                {moldura ? (
                  <AvatarMoldura moldura={moldura} iniciais="" tamanho={40} animar={tem} />
                ) : (
                  <span className="ranking-graus-vazio" aria-hidden>{g.kanji[0]}</span>
                )}
                <span>
                  <strong>{g.nome}</strong>
                  <small>{g.min.toLocaleString("pt-BR")} pts</small>
                </span>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="painel">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Ranking do dojo</p>
            <h2 className="heading-lg">Quem mais estudou</h2>
          </div>
          <FilterChips options={PERIODOS} value={periodo} onChange={setPeriodo} />
        </header>

        {erro && !dados ? (
          <p className="body-muted">Não foi possível carregar o ranking agora.</p>
        ) : !dados ? (
          <p className="body-muted">Carregando…</p>
        ) : !dados.logado ? (
          <div className="ranking-convite">
            <p className="font-display text-xl font-semibold text-heading">Entre para aparecer no ranking</p>
            <p className="body-muted mt-1">
              O ranking é dos alunos, professores e da equipe do dojo. Entre com sua conta do portal e jogue: os pontos passam a contar
              para a semana e o mês. Os que você fez sem login ficam só neste aparelho.
            </p>
            <Link href={noPortal("/login")} className="mt-3 inline-flex text-sm font-semibold text-accent hover:underline">
              Entrar no portal →
            </Link>
          </div>
        ) : dados.indisponivel ? (
          <p className="body-muted">O ranking ainda não foi ativado no banco do dojo. Os seus pontos continuam guardados neste aparelho.</p>
        ) : (
          <>
            <MinhaPosicao
              posicao={periodo === "semana" ? dados.eu?.posicaoSemana : dados.eu?.posicaoMes}
              pontos={periodo === "semana" ? dados.eu?.semana : dados.eu?.mes}
              periodo={periodo}
            />
            {lista.length ? <Placar linhas={lista} moldura={estado.perfil.moldura} nome={estado.perfil.nome} /> : (
              <p className="body-muted mt-4">Ninguém pontuou {periodo === "semana" ? "nesta semana" : "neste mês"} ainda. Que tal ser o primeiro?</p>
            )}
          </>
        )}
      </section>

      <section>
        <p className="eyebrow">Recompensas do ranking</p>
        <h2 className="heading-lg mt-1">Molduras que só o pódio tem</h2>
        <div className="mt-4 grade-centrada grade-2">
          {MOLDURAS_RANKING.map((m) => {
            const tem = m.id === "b-podio" ? dados?.eu?.podio : dados?.eu?.campeao;
            return (
              <article key={m.id} className={cn("card flex items-center gap-4 p-4", !tem && "opacity-80")}>
                <AvatarMoldura moldura={m} iniciais={tem ? iniciaisDe(estado.perfil.nome) : "?"} tamanho={72} animar={Boolean(tem)} />
                <div className="min-w-0">
                  <p className="font-display text-lg font-semibold text-heading">{m.nome}</p>
                  <p className="text-xs text-muted">{m.como}</p>
                  <p className="mt-1 text-2xs font-semibold" style={{ color: m.cor }}>
                    {tem ? "Conquistada" : "Vale para semanas e meses já encerrados."}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function MinhaPosicao({ posicao, pontos, periodo }: { posicao?: number | null; pontos?: number; periodo: "semana" | "mes" }) {
  return (
    <p className="ranking-minha">
      {posicao ? (
        <>
          Você está em <strong>{posicao}º</strong> {periodo === "semana" ? "nesta semana" : "neste mês"}, com{" "}
          <strong>{(pontos ?? 0).toLocaleString("pt-BR")}</strong> pontos.
        </>
      ) : (
        <>Você ainda não pontuou {periodo === "semana" ? "nesta semana" : "neste mês"}.</>
      )}
    </p>
  );
}

function Placar({ linhas, nome }: { linhas: LinhaRanking[]; moldura: string; nome: string }) {
  const max = Math.max(...linhas.map((l) => l.pontos), 1);
  return (
    <ol className="ranking-lista">
      {linhas.map((l, i) => {
        const separado = i > 0 && l.posicao > linhas[i - 1].posicao + 1 && l.eu;
        return (
          <li key={`${l.posicao}-${l.nome}-${i}`} className={cn("ranking-linha", l.eu && "is-eu", separado && "is-separado")} data-posicao={l.posicao}>
            <span className="ranking-posicao">{l.posicao <= 3 ? <Medalha posicao={l.posicao} /> : `${l.posicao}º`}</span>
            <AvatarMini src={l.avatarUrl} iniciais={iniciaisDe(l.eu && nome ? nome : l.nome)} tamanho="md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-heading">
                {l.nome}
                {l.eu ? <span className="ml-1.5 text-2xs font-semibold text-accent">você</span> : null}
              </span>
              <span className="ranking-linha-barra">
                <span style={{ width: `${(l.pontos / max) * 100}%` }} />
              </span>
            </span>
            <span className="ranking-linha-pontos">{l.pontos.toLocaleString("pt-BR")}</span>
          </li>
        );
      })}
    </ol>
  );
}

/** Medalha de ouro, prata ou bronze para os três primeiros. */
function Medalha({ posicao }: { posicao: number }) {
  const cores = ["#E0A400", "#9AA3AD", "#B87333"];
  const cor = cores[posicao - 1];
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" role="img" aria-label={`${posicao}º lugar`}>
      <path d="M7 2h4l2 6H9z M13 2h4l-2 6h-4z" fill={cor} opacity=".55" />
      <circle cx="12" cy="15" r="7" fill={cor} />
      <circle cx="12" cy="15" r="5.2" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="1" />
      <text x="12" y="15.6" textAnchor="middle" dominantBaseline="middle" fontSize="7.5" fontWeight="800" fill="#fff">
        {posicao}
      </text>
    </svg>
  );
}

import "server-only";
import { sql } from "@/lib/db";
import { LIMITE_DIA, pontosDo, type EventoPontos } from "@/services/pontuacao";

/**
 * Pontos da Jornada no banco: registrar, somar e montar o ranking.
 *
 * Semana e mês contam no horário de Brasília (a semana começa na segunda).
 * O nome no ranking é curto ("Ana S."): a lista é vista por todos os
 * usuários do portal, e há alunos menores de idade.
 */

const FUSO = "America/Sao_Paulo";

export type Periodo = "semana" | "mes";

export interface LinhaRanking {
  posicao: number;
  nome: string;
  avatarUrl: string | null;
  pontos: number;
  eu: boolean;
}

export interface MeusPontos {
  total: number;
  hoje: number;
  semana: number;
  mes: number;
  posicaoSemana: number | null;
  posicaoMes: number | null;
  /** Ficou entre os 3 primeiros de alguma semana já encerrada. */
  podio: boolean;
  /** Foi o primeiro de algum mês já encerrado. */
  campeao: boolean;
}

/** A tabela ainda não existe (migração 009 não aplicada). */
export function semTabelaDaJornada(erro: unknown) {
  return erro instanceof Error && /relation "jornada_pontos" does not exist/i.test(erro.message);
}

/** "Ana Beatriz Souza" → "Ana S." */
export function nomeCurto(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "Aluno";
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1][0].toUpperCase()}.`;
}

/**
 * Registra um evento. Devolve os pontos que valeram: 0 se o evento já tinha
 * sido contado (mesma chave) ou se o teto do dia já foi atingido.
 */
export async function registrarPontos(usuarioId: number, evento: EventoPontos): Promise<number> {
  const calculado = pontosDo(evento);
  if (calculado <= 0) return 0;

  const [{ hoje }] = (await sql`
    SELECT COALESCE(SUM(pontos), 0)::int AS hoje
    FROM jornada_pontos
    WHERE usuario_id = ${usuarioId}
      AND (criado_em AT TIME ZONE ${FUSO})::date = (now() AT TIME ZONE ${FUSO})::date
  `) as { hoje: number }[];

  const pontos = Math.min(calculado, LIMITE_DIA - hoje);
  if (pontos <= 0) return 0;

  const inseridas = (await sql`
    INSERT INTO jornada_pontos (usuario_id, tipo, chave, pontos)
    VALUES (${usuarioId}, ${evento.tipo}, ${evento.chave}, ${pontos})
    ON CONFLICT (usuario_id, chave) DO NOTHING
    RETURNING pontos
  `) as { pontos: number }[];

  return inseridas[0]?.pontos ?? 0;
}

/** Início do período, no fuso de Brasília. */
const inicio = (periodo: Periodo) => (periodo === "semana" ? "week" : "month");

/** Os 20 primeiros do período, e a pessoa logada se ela estiver fora deles. */
export async function ranking(periodo: Periodo, usuarioId: number): Promise<LinhaRanking[]> {
  const unidade = inicio(periodo);
  const linhas = (await sql`
    WITH somas AS (
      SELECT p.usuario_id, SUM(p.pontos)::int AS pontos, MAX(p.criado_em) AS ultimo
      FROM jornada_pontos p
      WHERE p.criado_em >= (date_trunc(${unidade}, now() AT TIME ZONE ${FUSO}) AT TIME ZONE ${FUSO})
      GROUP BY p.usuario_id
    ), ordenadas AS (
      SELECT s.*, RANK() OVER (ORDER BY s.pontos DESC) AS posicao,
             ROW_NUMBER() OVER (ORDER BY s.pontos DESC, s.ultimo ASC) AS ordem
      FROM somas s
      JOIN users u ON u.id = s.usuario_id
      WHERE u.ativo IS NOT FALSE
    )
    SELECT o.posicao::int, o.pontos, u.id, u.nome, u.avatar_url
    FROM ordenadas o
    JOIN users u ON u.id = o.usuario_id
    WHERE o.ordem <= 20 OR o.usuario_id = ${usuarioId}
    ORDER BY o.ordem
  `) as { posicao: number; pontos: number; id: number; nome: string; avatar_url: string | null }[];

  return linhas.map((l) => ({
    posicao: l.posicao,
    nome: nomeCurto(l.nome ?? ""),
    avatarUrl: l.avatar_url,
    pontos: l.pontos,
    eu: l.id === usuarioId,
  }));
}

export async function meusPontos(usuarioId: number): Promise<MeusPontos> {
  const [linha] = (await sql`
    WITH limites AS (
      SELECT
        (date_trunc('week', now() AT TIME ZONE ${FUSO}) AT TIME ZONE ${FUSO}) AS semana,
        (date_trunc('month', now() AT TIME ZONE ${FUSO}) AT TIME ZONE ${FUSO}) AS mes,
        (date_trunc('day', now() AT TIME ZONE ${FUSO}) AT TIME ZONE ${FUSO}) AS dia
    ),
    minhas AS (
      SELECT
        COALESCE(SUM(p.pontos), 0)::int AS total,
        COALESCE(SUM(p.pontos) FILTER (WHERE p.criado_em >= l.dia), 0)::int AS hoje,
        COALESCE(SUM(p.pontos) FILTER (WHERE p.criado_em >= l.semana), 0)::int AS semana,
        COALESCE(SUM(p.pontos) FILTER (WHERE p.criado_em >= l.mes), 0)::int AS mes
      FROM limites l
      LEFT JOIN jornada_pontos p ON p.usuario_id = ${usuarioId}
    ),
    por_semana AS (
      SELECT usuario_id, date_trunc('week', criado_em AT TIME ZONE ${FUSO}) AS periodo, SUM(pontos) AS soma
      FROM jornada_pontos GROUP BY 1, 2
    ),
    por_mes AS (
      SELECT usuario_id, date_trunc('month', criado_em AT TIME ZONE ${FUSO}) AS periodo, SUM(pontos) AS soma
      FROM jornada_pontos GROUP BY 1, 2
    )
    SELECT
      m.*,
      (SELECT COUNT(*) + 1 FROM por_semana s
        WHERE s.periodo = date_trunc('week', now() AT TIME ZONE ${FUSO}) AND s.soma > m.semana)::int AS posicao_semana,
      (SELECT COUNT(*) + 1 FROM por_mes s
        WHERE s.periodo = date_trunc('month', now() AT TIME ZONE ${FUSO}) AND s.soma > m.mes)::int AS posicao_mes,
      EXISTS (
        SELECT 1 FROM (
          SELECT usuario_id, RANK() OVER (PARTITION BY periodo ORDER BY soma DESC) AS r
          FROM por_semana WHERE periodo < date_trunc('week', now() AT TIME ZONE ${FUSO})
        ) x WHERE x.usuario_id = ${usuarioId} AND x.r <= 3
      ) AS podio,
      EXISTS (
        SELECT 1 FROM (
          SELECT usuario_id, RANK() OVER (PARTITION BY periodo ORDER BY soma DESC) AS r
          FROM por_mes WHERE periodo < date_trunc('month', now() AT TIME ZONE ${FUSO})
        ) x WHERE x.usuario_id = ${usuarioId} AND x.r = 1
      ) AS campeao
    FROM minhas m
  `) as {
    total: number;
    hoje: number;
    semana: number;
    mes: number;
    posicao_semana: number;
    posicao_mes: number;
    podio: boolean;
    campeao: boolean;
  }[];

  return {
    total: linha.total,
    hoje: linha.hoje,
    semana: linha.semana,
    mes: linha.mes,
    posicaoSemana: linha.semana > 0 ? linha.posicao_semana : null,
    posicaoMes: linha.mes > 0 ? linha.posicao_mes : null,
    podio: linha.podio,
    campeao: linha.campeao,
  };
}

import "server-only";
import { sql } from "@/lib/db";
import { graduacaoDaFaixa } from "@/services/dataService";
import {
  PROVA,
  montarProva,
  novaSemente,
  semGabarito,
  type Pergunta,
  type PerguntaPublica,
} from "@/services/perguntas";

/**
 * Provas teóricas da faixa.
 *
 * O servidor monta a prova, guarda as perguntas com o gabarito e entrega ao
 * navegador só os enunciados e as alternativas. Na entrega, corrige a partir
 * do que guardou — o navegador nunca diz quantas acertou, só o que marcou.
 */

export interface ProvaAberta {
  id: number;
  faixa: string;
  perguntas: PerguntaPublica[];
  iniciadaEm: string;
}

export interface Correcao {
  enunciado: string;
  alternativas: string[];
  correta: number;
  /** Índice marcado, ou null se ficou em branco. */
  marcada: number | null;
  porque: string;
  tipo: Pergunta["tipo"];
}

export interface ResultadoProva {
  id: number;
  faixa: string;
  acertos: number;
  total: number;
  minimo: number;
  aprovado: boolean;
  concluidaEm: string;
  correcao: Correcao[];
}

export interface ProvaNoHistorico {
  id: number;
  faixa: string;
  acertos: number;
  total: number;
  aprovado: boolean;
  concluidaEm: string;
}

/** Erro de regra (prova de outro aluno, já entregue): vira 4xx na rota. */
export class ErroProva extends Error {
  constructor(
    message: string,
    readonly status: 400 | 403 | 404 | 409,
  ) {
    super(message);
  }
}

/**
 * Começa uma prova — ou devolve a que já está aberta. Reabrir a mesma evita
 * que o aluno "role" perguntas fáceis recarregando a página.
 */
export async function iniciarProva(alunoId: number): Promise<ProvaAberta> {
  const aberta = await sql`
    SELECT id, faixa, perguntas, iniciada_em::text AS iniciada_em
      FROM provas
     WHERE aluno_id = ${alunoId} AND concluida_em IS NULL
     ORDER BY iniciada_em DESC
     LIMIT 1`;

  if (aberta[0]) {
    const linha = aberta[0] as {
      id: number;
      faixa: string;
      perguntas: Pergunta[];
      iniciada_em: string;
    };
    return {
      id: linha.id,
      faixa: linha.faixa,
      perguntas: linha.perguntas.map(semGabarito),
      iniciadaEm: linha.iniciada_em,
    };
  }

  const perfil = await sql`
    SELECT faixa_atual FROM alunos_perfil WHERE user_id = ${alunoId} LIMIT 1`;
  const faixa = (perfil[0]?.faixa_atual as string | undefined) ?? "";
  if (!faixa) throw new ErroProva("Aluno sem faixa cadastrada.", 404);

  const perguntas = montarProva(graduacaoDaFaixa(faixa), novaSemente());

  const criada = await sql`
    INSERT INTO provas (aluno_id, faixa, perguntas, total)
    VALUES (${alunoId}, ${faixa}, ${JSON.stringify(perguntas)}::jsonb, ${perguntas.length})
    RETURNING id, iniciada_em::text AS iniciada_em`;

  return {
    id: criada[0].id as number,
    faixa,
    perguntas: perguntas.map(semGabarito),
    iniciadaEm: criada[0].iniciada_em as string,
  };
}

/** Corrige e encerra a prova. `respostas[i]` é o índice marcado na pergunta i. */
export async function entregarProva(
  alunoId: number,
  provaId: number,
  respostas: (number | null)[],
): Promise<ResultadoProva> {
  const linhas = await sql`
    SELECT id, aluno_id, faixa, perguntas, concluida_em
      FROM provas WHERE id = ${provaId} LIMIT 1`;
  const prova = linhas[0] as
    | { id: number; aluno_id: number; faixa: string; perguntas: Pergunta[]; concluida_em: string | null }
    | undefined;

  if (!prova) throw new ErroProva("Prova não encontrada.", 404);
  if (prova.aluno_id !== alunoId) throw new ErroProva("Esta prova é de outro aluno.", 403);
  if (prova.concluida_em) throw new ErroProva("Esta prova já foi entregue.", 409);

  const total = prova.perguntas.length;
  // Só vale número inteiro dentro das alternativas; o resto conta como branco.
  const marcadas = prova.perguntas.map((p, i) => {
    const r = respostas[i];
    return Number.isInteger(r) && r! >= 0 && r! < p.alternativas.length ? r! : null;
  });
  const acertos = prova.perguntas.filter((p, i) => marcadas[i] === p.correta).length;
  const minimo = Math.ceil((PROVA.minimo / (PROVA.pratica + PROVA.teoria)) * total);
  const aprovado = acertos >= minimo;

  const fechada = await sql`
    UPDATE provas
       SET respostas = ${JSON.stringify(marcadas)}::jsonb,
           acertos = ${acertos},
           aprovado = ${aprovado},
           concluida_em = CURRENT_TIMESTAMP
     WHERE id = ${provaId} AND concluida_em IS NULL
     RETURNING concluida_em::text AS concluida_em`;
  if (!fechada[0]) throw new ErroProva("Esta prova já foi entregue.", 409);

  return {
    id: prova.id,
    faixa: prova.faixa,
    acertos,
    total,
    minimo,
    aprovado,
    concluidaEm: fechada[0].concluida_em as string,
    correcao: prova.perguntas.map((p, i) => ({
      enunciado: p.enunciado,
      alternativas: p.alternativas,
      correta: p.correta,
      marcada: marcadas[i],
      porque: p.porque,
      tipo: p.tipo,
    })),
  };
}

/** Provas entregues, da mais recente para a mais antiga. */
export async function historicoProvas(alunoId: number): Promise<ProvaNoHistorico[]> {
  const linhas = await sql`
    SELECT id, faixa, acertos, total, aprovado, concluida_em::text AS concluida_em
      FROM provas
     WHERE aluno_id = ${alunoId} AND concluida_em IS NOT NULL
     ORDER BY concluida_em DESC
     LIMIT 30`;
  return (linhas as {
    id: number;
    faixa: string;
    acertos: number;
    total: number;
    aprovado: boolean;
    concluida_em: string;
  }[]).map((l) => ({
    id: l.id,
    faixa: l.faixa,
    acertos: l.acertos,
    total: l.total,
    aprovado: l.aprovado,
    concluidaEm: l.concluida_em,
  }));
}

/** A tabela ainda não existe: migração 007 pendente. */
export function semTabelaDeProvas(erro: unknown) {
  return erro instanceof Error && /relation "provas" does not exist/i.test(erro.message);
}

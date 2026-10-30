import "server-only";
import { randomBytes } from "node:crypto";
import { sql } from "@/lib/db";
import {
  TEMAS,
  minimoPara,
  semGabarito,
  type Nivel,
  type Pergunta,
  type PerguntaPublica,
  type Tema,
} from "@/services/perguntas";

/**
 * Provas liberadas pelo professor.
 *
 * O professor monta um modelo (gerado pela faixa ou feito à mão), edita as
 * perguntas e libera para um ou vários alunos. Cada liberação copia as
 * perguntas para a prova do aluno — o modelo pode mudar depois sem mexer no
 * que já foi entregue.
 *
 * O navegador do aluno só recebe enunciados e alternativas. Na entrega, a
 * correção sai do gabarito guardado aqui — ninguém aprova mandando "acertei
 * 18" pela rede.
 */

// ------------------------------------------------------------------ tipos

export interface ModeloResumo {
  id: number;
  titulo: string;
  faixa: string;
  total: number;
  minimo: number;
  autor: string | null;
  atualizadaEm: string;
  /** Liberações deste modelo: quantas no total e quantas já entregues. */
  liberadas: number;
  entregues: number;
}

export interface Modelo {
  id: number;
  titulo: string;
  faixa: string;
  minimo: number;
  perguntas: Pergunta[];
  atualizadaEm: string;
}

export interface DadosModelo {
  titulo: string;
  faixa: string;
  minimo?: number;
  perguntas: Pergunta[];
}

export interface ProvaLiberada {
  id: number;
  modeloId: number | null;
  alunoId: number;
  alunoNome: string;
  titulo: string;
  faixa: string;
  total: number;
  minimo: number;
  liberadaEm: string;
  iniciadaEm: string | null;
  concluidaEm: string | null;
  acertos: number | null;
  aprovado: boolean | null;
}

export interface ProvaPendente {
  id: number;
  titulo: string;
  faixa: string;
  total: number;
  minimo: number;
  liberadaEm: string;
  iniciada: boolean;
}

export interface ProvaAberta {
  id: number;
  titulo: string;
  faixa: string;
  minimo: number;
  perguntas: PerguntaPublica[];
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
  titulo: string;
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
  titulo: string;
  faixa: string;
  acertos: number;
  total: number;
  aprovado: boolean;
  concluidaEm: string;
}

/** Erro de regra (prova de outro aluno, já entregue, dado inválido): vira 4xx. */
export class ErroProva extends Error {
  constructor(
    message: string,
    readonly status: 400 | 403 | 404 | 409,
  ) {
    super(message);
  }
}

/** As tabelas ainda não existem: migração 007 pendente. */
export function semTabelaDeProvas(erro: unknown) {
  return erro instanceof Error && /relation "provas(_modelo)?" does not exist/i.test(erro.message);
}

// ------------------------------------------------------------ validação

const LIMITES = { perguntas: 60, enunciado: 500, alternativa: 200, porque: 800, titulo: 120 };
const TEMAS_VALIDOS = new Set<string>(TEMAS.map((t) => t.id));

const texto = (valor: unknown) => (typeof valor === "string" ? valor.trim() : "");

/**
 * Confere as perguntas que chegam do editor do professor. Tudo o que vem do
 * navegador é refeito aqui campo a campo — nada passa adiante sem checagem.
 */
export function validarPerguntas(entrada: unknown): Pergunta[] {
  if (!Array.isArray(entrada) || entrada.length === 0) {
    throw new ErroProva("A prova precisa de pelo menos uma pergunta.", 400);
  }
  if (entrada.length > LIMITES.perguntas) {
    throw new ErroProva(`No máximo ${LIMITES.perguntas} perguntas por prova.`, 400);
  }

  return entrada.map((bruta, i) => {
    const p = (bruta ?? {}) as Record<string, unknown>;
    const n = i + 1;
    const enunciado = texto(p.enunciado);
    if (!enunciado) throw new ErroProva(`A pergunta ${n} está sem enunciado.`, 400);
    if (enunciado.length > LIMITES.enunciado) {
      throw new ErroProva(`O enunciado da pergunta ${n} está longo demais.`, 400);
    }

    const alternativas = Array.isArray(p.alternativas) ? p.alternativas.map(texto) : [];
    if (alternativas.length < 2 || alternativas.length > 6) {
      throw new ErroProva(`A pergunta ${n} precisa de 2 a 6 alternativas.`, 400);
    }
    if (alternativas.some((a) => !a)) {
      throw new ErroProva(`A pergunta ${n} tem alternativa em branco.`, 400);
    }
    if (alternativas.some((a) => a.length > LIMITES.alternativa)) {
      throw new ErroProva(`Uma alternativa da pergunta ${n} está longa demais.`, 400);
    }
    if (new Set(alternativas.map((a) => a.toLowerCase())).size !== alternativas.length) {
      throw new ErroProva(`A pergunta ${n} tem alternativas repetidas.`, 400);
    }

    const correta = Number(p.correta);
    if (!Number.isInteger(correta) || correta < 0 || correta >= alternativas.length) {
      throw new ErroProva(`Marque a alternativa certa da pergunta ${n}.`, 400);
    }

    const tipo = p.tipo === "teoria" ? "teoria" : "pratica";
    const nivel = ([1, 2, 3].includes(Number(p.nivel)) ? Number(p.nivel) : 2) as Nivel;
    const tema = (TEMAS_VALIDOS.has(String(p.tema)) ? p.tema : tipo === "pratica" ? "kihon" : "dojo") as Tema;
    const porque = texto(p.porque).slice(0, LIMITES.porque);
    const id = texto(p.id).slice(0, 80) || `prof-${randomBytes(6).toString("hex")}`;

    return {
      id,
      tema,
      tipo,
      nivel,
      enunciado,
      alternativas,
      correta,
      porque,
      sujeito: texto(p.sujeito).slice(0, 120) || id,
    };
  });
}

function validarModelo(dados: Partial<DadosModelo>) {
  const titulo = texto(dados.titulo);
  if (!titulo) throw new ErroProva("Dê um título à prova.", 400);
  if (titulo.length > LIMITES.titulo) throw new ErroProva("Título longo demais.", 400);
  const perguntas = validarPerguntas(dados.perguntas);
  const minimoPedido = Number(dados.minimo);
  const minimo =
    Number.isInteger(minimoPedido) && minimoPedido >= 1 && minimoPedido <= perguntas.length
      ? minimoPedido
      : minimoPara(perguntas.length);
  return { titulo, faixa: texto(dados.faixa).slice(0, 60), perguntas, minimo };
}

// --------------------------------------------------------------- modelos

export async function listarModelos(): Promise<ModeloResumo[]> {
  const linhas = await sql`
    SELECT m.id, m.titulo, m.faixa, m.minimo,
           jsonb_array_length(m.perguntas) AS total,
           m.atualizada_em::text AS atualizada_em,
           u.nome AS autor,
           (SELECT count(*) FROM provas p WHERE p.modelo_id = m.id)::int AS liberadas,
           (SELECT count(*) FROM provas p WHERE p.modelo_id = m.id AND p.concluida_em IS NOT NULL)::int AS entregues
      FROM provas_modelo m
      LEFT JOIN users u ON u.id = m.criada_por
     ORDER BY m.atualizada_em DESC
     LIMIT 200`;
  return (linhas as Record<string, unknown>[]).map((l) => ({
    id: l.id as number,
    titulo: l.titulo as string,
    faixa: l.faixa as string,
    total: Number(l.total),
    minimo: l.minimo as number,
    autor: (l.autor as string | null) ?? null,
    atualizadaEm: l.atualizada_em as string,
    liberadas: l.liberadas as number,
    entregues: l.entregues as number,
  }));
}

export async function lerModelo(id: number): Promise<Modelo> {
  const linhas = await sql`
    SELECT id, titulo, faixa, minimo, perguntas, atualizada_em::text AS atualizada_em
      FROM provas_modelo WHERE id = ${id} LIMIT 1`;
  const l = linhas[0];
  if (!l) throw new ErroProva("Prova não encontrada.", 404);
  return {
    id: l.id as number,
    titulo: l.titulo as string,
    faixa: l.faixa as string,
    minimo: l.minimo as number,
    perguntas: l.perguntas as Pergunta[],
    atualizadaEm: l.atualizada_em as string,
  };
}

export async function criarModelo(autorId: number, dados: Partial<DadosModelo>): Promise<Modelo> {
  const m = validarModelo(dados);
  const criado = await sql`
    INSERT INTO provas_modelo (titulo, faixa, perguntas, minimo, criada_por)
    VALUES (${m.titulo}, ${m.faixa}, ${JSON.stringify(m.perguntas)}::jsonb, ${m.minimo}, ${autorId})
    RETURNING id`;
  return lerModelo(criado[0].id as number);
}

export async function salvarModelo(id: number, dados: Partial<DadosModelo>): Promise<Modelo> {
  const m = validarModelo(dados);
  const salvo = await sql`
    UPDATE provas_modelo
       SET titulo = ${m.titulo}, faixa = ${m.faixa},
           perguntas = ${JSON.stringify(m.perguntas)}::jsonb, minimo = ${m.minimo},
           atualizada_em = CURRENT_TIMESTAMP
     WHERE id = ${id}
     RETURNING id`;
  if (!salvo[0]) throw new ErroProva("Prova não encontrada.", 404);
  return lerModelo(id);
}

/** Apaga o modelo. As provas já liberadas ficam (com modelo_id nulo). */
export async function apagarModelo(id: number): Promise<void> {
  const apagado = await sql`DELETE FROM provas_modelo WHERE id = ${id} RETURNING id`;
  if (!apagado[0]) throw new ErroProva("Prova não encontrada.", 404);
}

/**
 * Libera o modelo para os alunos. Quem já tem esta prova pendente é pulado —
 * clicar duas vezes não manda a mesma prova em dobro.
 */
export async function liberarModelo(
  modeloId: number,
  alunoIds: number[],
  porId: number,
): Promise<{ liberadas: number; puladas: number }> {
  const ids = [...new Set(alunoIds.filter((n) => Number.isInteger(n) && n > 0))];
  if (ids.length === 0) throw new ErroProva("Escolha pelo menos um aluno.", 400);
  if (ids.length > 300) throw new ErroProva("Alunos demais de uma vez.", 400);

  const modelo = await lerModelo(modeloId);

  const alunos = (await sql`
    SELECT u.id, COALESCE(a.faixa_atual, '') AS faixa,
           EXISTS (
             SELECT 1 FROM provas p
              WHERE p.aluno_id = u.id AND p.modelo_id = ${modeloId} AND p.concluida_em IS NULL
           ) AS pendente
      FROM users u
      LEFT JOIN alunos_perfil a ON a.user_id = u.id
     WHERE u.id = ANY(${ids}) AND u.role = 'aluno'`) as { id: number; faixa: string; pendente: boolean }[];

  const novos = alunos.filter((a) => !a.pendente);
  const perguntas = JSON.stringify(modelo.perguntas);
  for (const aluno of novos) {
    await sql`
      INSERT INTO provas (aluno_id, modelo_id, titulo, faixa, perguntas, total, minimo, liberada_por)
      VALUES (${aluno.id}, ${modeloId}, ${modelo.titulo}, ${aluno.faixa || modelo.faixa},
              ${perguntas}::jsonb, ${modelo.perguntas.length}, ${modelo.minimo}, ${porId})`;
  }
  return { liberadas: novos.length, puladas: ids.length - novos.length };
}

/** Provas liberadas (de um modelo, ou todas), da mais recente para a mais antiga. */
export async function listarLiberadas(modeloId?: number): Promise<ProvaLiberada[]> {
  const linhas = modeloId
    ? await sql`
        SELECT p.id, p.modelo_id, p.aluno_id, u.nome AS aluno_nome, p.titulo, p.faixa,
               p.total, p.minimo, p.acertos, p.aprovado,
               p.liberada_em::text AS liberada_em, p.iniciada_em::text AS iniciada_em,
               p.concluida_em::text AS concluida_em
          FROM provas p JOIN users u ON u.id = p.aluno_id
         WHERE p.modelo_id = ${modeloId}
         ORDER BY p.liberada_em DESC LIMIT 500`
    : await sql`
        SELECT p.id, p.modelo_id, p.aluno_id, u.nome AS aluno_nome, p.titulo, p.faixa,
               p.total, p.minimo, p.acertos, p.aprovado,
               p.liberada_em::text AS liberada_em, p.iniciada_em::text AS iniciada_em,
               p.concluida_em::text AS concluida_em
          FROM provas p JOIN users u ON u.id = p.aluno_id
         ORDER BY p.liberada_em DESC LIMIT 500`;
  return (linhas as Record<string, unknown>[]).map((l) => ({
    id: l.id as number,
    modeloId: (l.modelo_id as number | null) ?? null,
    alunoId: l.aluno_id as number,
    alunoNome: l.aluno_nome as string,
    titulo: l.titulo as string,
    faixa: l.faixa as string,
    total: l.total as number,
    minimo: l.minimo as number,
    liberadaEm: l.liberada_em as string,
    iniciadaEm: (l.iniciada_em as string | null) ?? null,
    concluidaEm: (l.concluida_em as string | null) ?? null,
    acertos: (l.acertos as number | null) ?? null,
    aprovado: (l.aprovado as boolean | null) ?? null,
  }));
}

/** Cancela uma liberação que o aluno ainda não entregou. */
export async function cancelarLiberada(id: number): Promise<void> {
  const apagada = await sql`
    DELETE FROM provas WHERE id = ${id} AND concluida_em IS NULL RETURNING id`;
  if (!apagada[0]) throw new ErroProva("Essa prova já foi entregue ou não existe.", 409);
}

// ------------------------------------------------------------------ aluno

export async function provasDoAluno(alunoId: number): Promise<{
  pendentes: ProvaPendente[];
  historico: ProvaNoHistorico[];
}> {
  const pendentes = (await sql`
    SELECT id, titulo, faixa, total, minimo, liberada_em::text AS liberada_em,
           iniciada_em IS NOT NULL AS iniciada
      FROM provas
     WHERE aluno_id = ${alunoId} AND concluida_em IS NULL
     ORDER BY liberada_em DESC`) as Record<string, unknown>[];
  return {
    pendentes: pendentes.map((l) => ({
      id: l.id as number,
      titulo: l.titulo as string,
      faixa: l.faixa as string,
      total: l.total as number,
      minimo: l.minimo as number,
      liberadaEm: l.liberada_em as string,
      iniciada: l.iniciada as boolean,
    })),
    historico: await historicoProvas(alunoId),
  };
}

/** Abre uma prova liberada para o aluno (marca o início na primeira vez). */
export async function abrirProva(alunoId: number, provaId: number): Promise<ProvaAberta> {
  const linhas = await sql`
    UPDATE provas SET iniciada_em = COALESCE(iniciada_em, CURRENT_TIMESTAMP)
     WHERE id = ${provaId} AND aluno_id = ${alunoId} AND concluida_em IS NULL
     RETURNING id, titulo, faixa, minimo, perguntas`;
  const l = linhas[0];
  if (!l) throw new ErroProva("Essa prova não está disponível para você.", 404);
  return {
    id: l.id as number,
    titulo: l.titulo as string,
    faixa: l.faixa as string,
    minimo: l.minimo as number,
    perguntas: (l.perguntas as Pergunta[]).map(semGabarito),
  };
}

/** Corrige e encerra a prova. `respostas[i]` é o índice marcado na pergunta i. */
export async function entregarProva(
  alunoId: number,
  provaId: number,
  respostas: (number | null)[],
): Promise<ResultadoProva> {
  const linhas = await sql`
    SELECT id, aluno_id, titulo, faixa, perguntas, minimo, concluida_em
      FROM provas WHERE id = ${provaId} LIMIT 1`;
  const prova = linhas[0] as
    | {
        id: number;
        aluno_id: number;
        titulo: string;
        faixa: string;
        perguntas: Pergunta[];
        minimo: number;
        concluida_em: string | null;
      }
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
  const aprovado = acertos >= prova.minimo;

  const fechada = await sql`
    UPDATE provas
       SET respostas = ${JSON.stringify(marcadas)}::jsonb,
           acertos = ${acertos},
           aprovado = ${aprovado},
           iniciada_em = COALESCE(iniciada_em, CURRENT_TIMESTAMP),
           concluida_em = CURRENT_TIMESTAMP
     WHERE id = ${provaId} AND concluida_em IS NULL
     RETURNING concluida_em::text AS concluida_em`;
  if (!fechada[0]) throw new ErroProva("Esta prova já foi entregue.", 409);

  return {
    id: prova.id,
    titulo: prova.titulo,
    faixa: prova.faixa,
    acertos,
    total,
    minimo: prova.minimo,
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
    SELECT id, titulo, faixa, acertos, total, aprovado, concluida_em::text AS concluida_em
      FROM provas
     WHERE aluno_id = ${alunoId} AND concluida_em IS NOT NULL
     ORDER BY concluida_em DESC
     LIMIT 30`;
  return (linhas as Record<string, unknown>[]).map((l) => ({
    id: l.id as number,
    titulo: l.titulo as string,
    faixa: l.faixa as string,
    acertos: l.acertos as number,
    total: l.total as number,
    aprovado: l.aprovado as boolean,
    concluidaEm: l.concluida_em as string,
  }));
}

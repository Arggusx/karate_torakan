import "server-only";
import { sql } from "@/lib/db";

/**
 * Contato de cada conta: telefone, aceite de WhatsApp e, para alunos menores
 * de idade, o responsável.
 *
 * Menor de idade é decidido aqui no servidor, pela data de nascimento (ou pela
 * idade, quando não há data). Para menores, os avisos vão para o responsável e
 * é ele quem aceita o WhatsApp (LGPD, art. 14); para maiores, o próprio titular.
 *
 * As colunas do responsável vêm da migração 011. Enquanto ela não rodar, a
 * leitura devolve `disponivel: false` e a tela esconde o bloco, sem quebrar o
 * resto de Minha conta.
 */

export interface Contato {
  disponivel: boolean;
  menorDeIdade: boolean;
  telefone: string | null;
  aceitaWhatsapp: boolean;
  whatsappOptinEm: string | null;
  responsavelNome: string | null;
  responsavelParentesco: string | null;
  responsavelTelefone: string | null;
  responsavelEmail: string | null;
}

export interface DadosContato {
  telefone?: string | null;
  aceitaWhatsapp?: boolean;
  responsavelNome?: string | null;
  responsavelParentesco?: string | null;
  responsavelTelefone?: string | null;
  responsavelEmail?: string | null;
}

const SEM_CONTATO: Contato = {
  disponivel: false,
  menorDeIdade: false,
  telefone: null,
  aceitaWhatsapp: false,
  whatsappOptinEm: null,
  responsavelNome: null,
  responsavelParentesco: null,
  responsavelTelefone: null,
  responsavelEmail: null,
};

function semColunasContato(erro: unknown) {
  return (
    erro instanceof Error &&
    /column .*(responsavel_|whatsapp_optin_por).* does not exist/i.test(erro.message)
  );
}

/** Idade em anos completos a partir de AAAA-MM-DD. */
function idadeEm(nascimento: string, hoje = new Date()): number {
  const [a, m, d] = nascimento.slice(0, 10).split("-").map(Number);
  let idade = hoje.getFullYear() - a;
  const mes = hoje.getMonth() + 1;
  if (mes < m || (mes === m && hoje.getDate() < d)) idade -= 1;
  return idade;
}

export function ehMenorDeIdade(nascimento: string | null, idade: number | null): boolean {
  if (nascimento) return idadeEm(nascimento) < 18;
  if (idade !== null && idade > 0) return idade < 18;
  return false;
}

/**
 * Telefone brasileiro: só dígitos, com DDD (10 ou 11 dígitos). Aceita o 55 do
 * país na frente e o tira. Devolve null para vazio e lança para inválido.
 */
export function normalizarTelefone(valor: string | null | undefined): string | null {
  if (valor === null || valor === undefined || valor.trim() === "") return null;
  let digitos = valor.replace(/\D/g, "");
  if (digitos.length > 11 && digitos.startsWith("55")) digitos = digitos.slice(2);
  if (digitos.length !== 10 && digitos.length !== 11) {
    throw new ErroContato("Telefone inválido. Use DDD + número, ex.: (82) 99999-0000.");
  }
  return digitos;
}

function normalizarEmail(valor: string | null | undefined): string | null {
  if (valor === null || valor === undefined || valor.trim() === "") return null;
  const email = valor.trim().toLowerCase();
  if (email.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ErroContato("E-mail do responsável inválido.");
  }
  return email;
}

function texto(valor: string | null | undefined, maximo: number): string | null {
  if (valor === null || valor === undefined) return null;
  const limpo = valor.trim().replace(/\s+/g, " ");
  return limpo === "" ? null : limpo.slice(0, maximo);
}

export class ErroContato extends Error {}

export async function lerContato(id: number): Promise<Contato> {
  try {
    const linhas = await sql`
      SELECT telefone, aceita_whatsapp,
             to_char(whatsapp_optin_em AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS whatsapp_optin_em,
             data_nascimento::text AS data_nascimento, idade,
             responsavel_nome, responsavel_parentesco,
             responsavel_telefone, responsavel_email
        FROM users WHERE id = ${id} LIMIT 1`;
    const l = linhas[0];
    if (!l) return SEM_CONTATO;
    return {
      disponivel: true,
      menorDeIdade: ehMenorDeIdade(l.data_nascimento, l.idade),
      telefone: l.telefone,
      aceitaWhatsapp: Boolean(l.aceita_whatsapp),
      whatsappOptinEm: l.whatsapp_optin_em,
      responsavelNome: l.responsavel_nome,
      responsavelParentesco: l.responsavel_parentesco,
      responsavelTelefone: l.responsavel_telefone,
      responsavelEmail: l.responsavel_email,
    };
  } catch (erro) {
    if (semColunasContato(erro)) return SEM_CONTATO;
    throw erro;
  }
}

/**
 * Grava o contato. Valida tudo antes de escrever e só registra a data do
 * aceite de WhatsApp quando ele passa de "não" para "sim"; ao retirar, a data
 * e o autor do aceite são apagados junto.
 */
export async function salvarContato(id: number, dados: DadosContato): Promise<Contato> {
  const atual = await lerContato(id);
  if (!atual.disponivel) {
    throw new ErroContato("Os campos de contato ainda não estão disponíveis.");
  }

  const telefone =
    dados.telefone !== undefined ? normalizarTelefone(dados.telefone) : atual.telefone;
  const responsavelTelefone =
    dados.responsavelTelefone !== undefined
      ? normalizarTelefone(dados.responsavelTelefone)
      : atual.responsavelTelefone;
  const responsavelEmail =
    dados.responsavelEmail !== undefined
      ? normalizarEmail(dados.responsavelEmail)
      : atual.responsavelEmail;
  const responsavelNome =
    dados.responsavelNome !== undefined ? texto(dados.responsavelNome, 120) : atual.responsavelNome;
  const responsavelParentesco =
    dados.responsavelParentesco !== undefined
      ? texto(dados.responsavelParentesco, 40)
      : atual.responsavelParentesco;

  const aceita = dados.aceitaWhatsapp ?? atual.aceitaWhatsapp;
  const numeroDosAvisos = atual.menorDeIdade ? responsavelTelefone : telefone;
  if (aceita && !numeroDosAvisos) {
    throw new ErroContato(
      atual.menorDeIdade
        ? "Para receber pelo WhatsApp, informe o telefone do responsável."
        : "Para receber pelo WhatsApp, informe o seu telefone.",
    );
  }
  if (atual.menorDeIdade && aceita && !responsavelNome) {
    throw new ErroContato("Informe o nome do responsável que está autorizando.");
  }

  const passouAAceitar = aceita && !atual.aceitaWhatsapp;
  const autor = atual.menorDeIdade ? "responsavel" : "titular";

  await sql`
    UPDATE users SET
      telefone = ${telefone},
      responsavel_nome = ${responsavelNome},
      responsavel_parentesco = ${responsavelParentesco},
      responsavel_telefone = ${responsavelTelefone},
      responsavel_email = ${responsavelEmail},
      aceita_whatsapp = ${aceita},
      whatsapp_optin_em = CASE
        WHEN ${aceita} = false THEN NULL
        WHEN ${passouAAceitar} THEN now()
        ELSE whatsapp_optin_em END,
      whatsapp_optin_por = CASE
        WHEN ${aceita} = false THEN NULL
        WHEN ${passouAAceitar} THEN ${autor}
        ELSE whatsapp_optin_por END
    WHERE id = ${id}`;

  return lerContato(id);
}

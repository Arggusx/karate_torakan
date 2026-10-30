import "server-only";
import bcrypt from "bcryptjs";
import { randomBytes, randomInt } from "node:crypto";
import { sql } from "@/lib/db";

/**
 * Contas de acesso (alunos, professores e admin) e leitura das turmas.
 * Substitui o estado que vivia no localStorage do navegador.
 *
 * Senhas nunca são guardadas em texto — bcrypt, o mesmo formato das contas
 * que já existiam no banco.
 */

export type Perfil = "aluno" | "professor" | "admin";

export interface ContaBasica {
  id: number;
  nome: string;
  usuario: string;
  role: Perfil;
  ativo: boolean;
  precisa_trocar_senha: boolean;
}

// ------------------------------------------------------------------- senha

export function gerarHashSenha(senha: string): string {
  return bcrypt.hashSync(senha, 12);
}

export function conferirSenha(senha: string, guardado: string): boolean {
  try {
    return bcrypt.compareSync(senha, guardado);
  } catch {
    return false;
  }
}

/**
 * Normaliza o nome de usuário: minúsculas, sem acento e sem espaço.
 * Mesma regra do front-end — é a forma que garante unicidade.
 */
export function normalizarUsuario(valor: string): string {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9._-]+/g, ".")
    .replace(/\.{2,}/g, ".")
    .replace(/(^[.]|[.]$)/g, "");
}

// --------------------------------------------------------------- consultas

export async function autenticar(
  usuarioInformado: string,
  senha: string,
): Promise<ContaBasica | null> {
  const usuario = normalizarUsuario(usuarioInformado);
  if (!usuario) return null;

  const linhas = await sql`
    SELECT id, nome, usuario, role, ativo, precisa_trocar_senha, senha_hash
      FROM users
     WHERE usuario = ${usuario} AND ativo = true
     LIMIT 1`;

  const conta = linhas[0] as (ContaBasica & { senha_hash: string }) | undefined;
  if (!conta) return null;
  if (!conferirSenha(senha, conta.senha_hash)) return null;

  const { senha_hash: _ignorado, ...publico } = conta;
  return publico;
}

export async function usuarioEmUso(usuario: string): Promise<boolean> {
  const linhas = await sql`
    SELECT 1 FROM users WHERE usuario = ${normalizarUsuario(usuario)} LIMIT 1`;
  return linhas.length > 0;
}

export interface AlunoDoBanco {
  id: number;
  nome: string;
  usuario: string;
  email: string;
  data_nascimento: string | null;
  idade: number | null;
  turma_id: number | null;
  faixa_atual: string;
  progresso: number;
  frequencia: number;
  proximo_exame: string | null;
  financial_status: string;
  avatar_url: string | null;
}

// --------------------------------------------------------- conta própria

/** Dados que o próprio usuário pode ver e editar da sua conta. */
export interface MinhaConta {
  id: number;
  nome: string;
  usuario: string;
  email: string;
  avatar_url: string | null;
  precisa_trocar_senha: boolean;
  /** E-mail da conta Google vinculada, ou null. */
  google_email: string | null;
  /** false quando a conta só entra pelo Google (ainda sem senha própria). */
  tem_senha: boolean;
  /** As colunas do Google existem no banco (migração 008 aplicada). */
  google_disponivel: boolean;
}

/**
 * A migração 008 (colunas do Google) pode ainda não ter rodado. Nesse caso as
 * consultas novas falham com "column ... does not exist", e o código cai na
 * versão antiga em vez de derrubar a tela de conta inteira.
 */
export function semColunasGoogle(erro: unknown) {
  return (
    erro instanceof Error &&
    /column .*(google_sub|google_email|tem_senha).* does not exist/i.test(erro.message)
  );
}

export async function lerConta(id: number): Promise<MinhaConta | null> {
  try {
    const linhas = await sql`
      SELECT id, nome, usuario, email, avatar_url, precisa_trocar_senha,
             google_email, tem_senha, true AS google_disponivel
        FROM users WHERE id = ${id} AND ativo = true LIMIT 1`;
    return (linhas[0] as MinhaConta | undefined) ?? null;
  } catch (erro) {
    if (!semColunasGoogle(erro)) throw erro;
    const linhas = await sql`
      SELECT id, nome, usuario, email, avatar_url, precisa_trocar_senha,
             NULL AS google_email, true AS tem_senha, false AS google_disponivel
        FROM users WHERE id = ${id} AND ativo = true LIMIT 1`;
    return (linhas[0] as MinhaConta | undefined) ?? null;
  }
}

/**
 * Troca o nome de usuário do próprio usuário. Devolve o usuário normalizado
 * em caso de sucesso, ou um erro de validação.
 */
export async function trocarUsuario(
  id: number,
  novoUsuario: string,
): Promise<{ ok: boolean; erro?: string; usuario?: string }> {
  const usuario = normalizarUsuario(novoUsuario);
  if (usuario.length < 3) {
    return { ok: false, erro: "O usuário precisa de ao menos 3 caracteres." };
  }

  const ocupado = await sql`
    SELECT 1 FROM users WHERE usuario = ${usuario} AND id <> ${id} LIMIT 1`;
  if (ocupado.length > 0) {
    return { ok: false, erro: "Esse nome de usuário já está em uso." };
  }

  await sql`UPDATE users SET usuario = ${usuario} WHERE id = ${id}`;
  return { ok: true, usuario };
}

/**
 * Troca a senha do próprio usuário.
 *
 * Em regra confere a senha atual antes. Duas exceções, em que a senha atual
 * não prova nada:
 *  - primeiro acesso (`precisa_trocar_senha`): a pessoa acabou de entrar com
 *    a senha temporária que a equipe entregou;
 *  - conta só com Google (`tem_senha = false`): não existe senha atual.
 * Nos dois casos quem autoriza é a sessão, que veio de um login legítimo.
 *
 * Zera `precisa_trocar_senha`: depois de escolher a sua, o aviso some.
 */
export async function trocarSenha(
  id: number,
  senhaAtual: string,
  novaSenha: string,
): Promise<{ ok: boolean; erro?: string }> {
  if (novaSenha.length < 6) {
    return { ok: false, erro: "A nova senha precisa de ao menos 6 caracteres." };
  }

  const conta = await lerConta(id);
  if (!conta) return { ok: false, erro: "Conta não encontrada." };

  const dispensaAtual = conta.precisa_trocar_senha || !conta.tem_senha;
  if (!dispensaAtual) {
    const linhas = await sql`
      SELECT senha_hash FROM users WHERE id = ${id} AND ativo = true LIMIT 1`;
    const atual = linhas[0] as { senha_hash: string } | undefined;
    if (!atual || !conferirSenha(senhaAtual, atual.senha_hash)) {
      return { ok: false, erro: "A senha atual não confere." };
    }
  }

  await sql`
    UPDATE users
       SET senha_hash = ${gerarHashSenha(novaSenha)},
           precisa_trocar_senha = false
     WHERE id = ${id}`;
  if (conta.google_disponivel) {
    await sql`UPDATE users SET tem_senha = true WHERE id = ${id}`;
  }
  return { ok: true };
}

// --------------------------------------------- senha redefinida pela equipe

/*
  Senha temporária legível, para ser ditada ou escrita num papel: duas
  palavras do dojo e quatro dígitos ("kiai-4821-tora"). São uns 23 bits de
  sorteio com crypto: fraca como senha definitiva, suficiente para uma que
  vale só até o primeiro acesso, quando a troca é obrigatória.
*/
const PALAVRAS = [
  "tora", "kata", "kiai", "zuki", "geri", "dachi", "rei", "oss", "uke", "kime",
  "dojo", "obi", "kumite", "kihon", "heian", "tekki", "bassai", "kanku", "jion",
  "empi", "hangetsu", "jitte", "unsu", "sochin", "meikyo", "wankan", "zanshin",
  "maai", "koshi", "hikite", "shoshin", "mushin", "sensei", "senpai", "kohai",
  "tatame", "karate", "shuto", "nukite", "haito", "teisho", "uraken", "mawashi",
  "yoko", "ushiro", "mikazuki", "kakato", "hiza", "tsuki", "uchi", "kokutsu",
  "zenkutsu", "kiba", "neko", "sanchin", "fudo", "hachiji", "musubi", "heiko",
  "teiji", "sakura", "bushi", "kamae", "bunkai",
];

export function gerarSenhaTemporaria(): string {
  const palavra = () => PALAVRAS[randomInt(PALAVRAS.length)];
  const digitos = String(randomInt(10000)).padStart(4, "0");
  return `${palavra()}-${digitos}-${palavra()}`;
}

/**
 * A equipe redefine a senha de alguém: gera uma temporária, grava o hash e
 * marca `precisa_trocar_senha` — no próximo acesso a pessoa escolhe a dela
 * (ou vincula o Google). A temporária volta uma única vez, para ser entregue.
 */
export async function redefinirSenha(alvoId: number): Promise<string> {
  const temporaria = gerarSenhaTemporaria();
  await sql`
    UPDATE users
       SET senha_hash = ${gerarHashSenha(temporaria)},
           precisa_trocar_senha = true
     WHERE id = ${alvoId}`;
  try {
    await sql`UPDATE users SET tem_senha = true WHERE id = ${alvoId}`;
  } catch (erro) {
    if (!semColunasGoogle(erro)) throw erro;
  }
  return temporaria;
}

/** Papel e situação de uma conta, para conferir quem pode redefinir o quê. */
export async function lerPapel(
  id: number,
): Promise<{ role: Perfil; ativo: boolean } | null> {
  const linhas = await sql`SELECT role, ativo FROM users WHERE id = ${id} LIMIT 1`;
  return (linhas[0] as { role: Perfil; ativo: boolean } | undefined) ?? null;
}

// ------------------------------------------------------------ conta Google

/** Conta vinculada a um Google, se houver e estiver ativa. */
export async function acharPorGoogle(sub: string): Promise<ContaBasica | null> {
  const linhas = await sql`
    SELECT id, nome, usuario, role, ativo, precisa_trocar_senha
      FROM users WHERE google_sub = ${sub} AND ativo = true LIMIT 1`;
  return (linhas[0] as ContaBasica | undefined) ?? null;
}

/**
 * Vincula a conta Google à conta já logada. Se for o primeiro acesso, a senha
 * temporária que a equipe entregou é descartada: vira o hash de um valor
 * aleatório que ninguém conhece, e a conta passa a entrar pelo Google.
 */
export async function vincularGoogle(
  id: number,
  google: { sub: string; email: string },
): Promise<{ ok: boolean; erro?: string }> {
  const dono = await sql`
    SELECT id FROM users WHERE google_sub = ${google.sub} AND id <> ${id} LIMIT 1`;
  if (dono.length > 0) {
    return { ok: false, erro: "Esta conta Google já está vinculada a outro usuário do dojo." };
  }

  const conta = await lerConta(id);
  if (!conta) return { ok: false, erro: "Conta não encontrada." };

  if (conta.precisa_trocar_senha) {
    await sql`
      UPDATE users
         SET google_sub = ${google.sub},
             google_email = ${google.email},
             senha_hash = ${gerarHashSenha(randomBytes(24).toString("base64url"))},
             tem_senha = false,
             precisa_trocar_senha = false
       WHERE id = ${id}`;
  } else {
    await sql`
      UPDATE users SET google_sub = ${google.sub}, google_email = ${google.email}
       WHERE id = ${id}`;
  }
  return { ok: true };
}

/** Desvincula — só se a pessoa tiver senha própria, senão ficaria trancada fora. */
export async function desvincularGoogle(
  id: number,
): Promise<{ ok: boolean; erro?: string }> {
  const conta = await lerConta(id);
  if (!conta) return { ok: false, erro: "Conta não encontrada." };
  if (!conta.tem_senha) {
    return {
      ok: false,
      erro: "Crie uma senha antes de desvincular o Google, ou você ficaria sem como entrar.",
    };
  }
  await sql`UPDATE users SET google_sub = NULL, google_email = NULL WHERE id = ${id}`;
  return { ok: true };
}

/** Grava (ou remove, com null) a foto de perfil do próprio usuário. */
export async function salvarAvatar(
  id: number,
  avatarUrl: string | null,
): Promise<void> {
  await sql`UPDATE users SET avatar_url = ${avatarUrl} WHERE id = ${id}`;
}

export async function listarAlunos(): Promise<AlunoDoBanco[]> {
  const linhas = await sql`
    SELECT u.id, u.nome, u.usuario, u.email,
           u.data_nascimento::text AS data_nascimento,
           -- A data de nascimento manda. Idade solta é o fallback de quem foi
           -- cadastrado antes de o campo passar a ser preenchido.
           COALESCE(
             EXTRACT(YEAR FROM age(u.data_nascimento))::int,
             u.idade
           ) AS idade,
           p.turma_id, p.faixa_atual,
           p.progresso, p.frequencia, p.proximo_exame,
           u.financial_status, u.avatar_url
      FROM users u
      JOIN alunos_perfil p ON p.user_id = u.id
     WHERE u.ativo = true
     ORDER BY u.nome`;
  return linhas as AlunoDoBanco[];
}

export interface ProfessorDoBanco {
  id: number;
  nome: string;
  usuario: string;
  email: string;
  role: Perfil;
  criado_em: string;
  data_nascimento: string | null;
  idade: number | null;
}

export async function listarProfessores(): Promise<ProfessorDoBanco[]> {
  const linhas = await sql`
    SELECT id, nome, usuario, email, role, criado_em,
           data_nascimento::text AS data_nascimento,
           COALESCE(
             EXTRACT(YEAR FROM age(data_nascimento))::int,
             idade
           ) AS idade
      FROM users
     WHERE role IN ('professor', 'admin') AND ativo = true
     ORDER BY nome`;
  return linhas as ProfessorDoBanco[];
}

export interface TurmaDoBanco {
  id: number;
  nome: string;
  dias_semana: string;
  horario: string;
  hora_fim: string | null;
  faixa_etaria: string | null;
  faixas_tipicas: string | null;
  professor_id: number | null;
  plano: { dia: string; foco: string; conteudo: string[] }[];
}

export async function listarTurmas(): Promise<TurmaDoBanco[]> {
  const linhas = await sql`
    SELECT id, nome, dias_semana, horario::text, hora_fim::text,
           faixa_etaria, faixas_tipicas, professor_id, plano
      FROM turmas
     WHERE ativa = true
     ORDER BY horario`;
  return linhas as TurmaDoBanco[];
}

// --------------------------------------------------------------- comandos

export async function criarAluno(dados: {
  nome: string;
  usuario: string;
  senha: string;
  email: string;
  idade: number | null;
  dataNascimento: string | null;
  turmaId: number | null;
  faixa: string;
}): Promise<{ id: number }> {
  const usuario = normalizarUsuario(dados.usuario);

  const linhas = await sql`
    INSERT INTO users (nome, email, senha_hash, role, usuario, idade,
                       data_nascimento, ativo, precisa_trocar_senha,
                       financial_status)
    VALUES (${dados.nome}, ${dados.email}, ${gerarHashSenha(dados.senha)},
            'aluno', ${usuario}, ${dados.idade},
            ${dados.dataNascimento}::date, true, true, 'pendente')
    RETURNING id`;

  const id = linhas[0].id as number;

  await sql`
    INSERT INTO alunos_perfil (user_id, turma_id, faixa_atual, status_mensalidade)
    VALUES (${id}, ${dados.turmaId}, ${dados.faixa}, 'pendente')
    ON CONFLICT (user_id) DO UPDATE
      SET turma_id = EXCLUDED.turma_id, faixa_atual = EXCLUDED.faixa_atual`;

  return { id };
}

export async function criarProfessor(dados: {
  nome: string;
  usuario: string;
  senha: string;
  email: string;
  dataNascimento?: string | null;
  role?: "professor" | "admin";
}): Promise<{ id: number }> {
  const linhas = await sql`
    INSERT INTO users (nome, email, senha_hash, role, usuario,
                       data_nascimento, ativo, precisa_trocar_senha)
    VALUES (${dados.nome}, ${dados.email}, ${gerarHashSenha(dados.senha)},
            ${dados.role ?? "professor"}, ${normalizarUsuario(dados.usuario)},
            ${dados.dataNascimento ?? null}::date, true, true)
    RETURNING id`;
  return { id: linhas[0].id as number };
}

export async function buscarConta(id: number): Promise<ContaBasica | null> {
  const linhas = await sql`
    SELECT id, nome, usuario, role, ativo, precisa_trocar_senha
      FROM users WHERE id = ${id} LIMIT 1`;
  return (linhas[0] as ContaBasica) ?? null;
}

/**
 * Desmatricula desativando a conta, sem apagar a linha.
 *
 * Mensalidades, lançamentos financeiros e chamadas apontam para users.id — uma
 * exclusão física levaria junto o histórico que precisa continuar auditável, e
 * o registro de quem já pagou não pode sumir. Todas as listagens dos portais
 * filtram por ativo = true, então a conta desaparece das telas do mesmo jeito.
 */
export async function desativarConta(id: number): Promise<ContaBasica | null> {
  const linhas = await sql`
    UPDATE users SET ativo = false
     WHERE id = ${id} AND ativo = true
    RETURNING id, nome, usuario, role, ativo, precisa_trocar_senha`;

  const conta = linhas[0] as ContaBasica | undefined;
  if (!conta) return null;

  // Turma órfã é melhor do que turma apontando para conta desativada: o admin
  // reatribui pela tela de turmas.
  await sql`UPDATE turmas SET professor_id = NULL WHERE professor_id = ${id}`;

  return conta;
}

/**
 * Edita os dados do aluno que a equipe pode mudar depois do cadastro.
 * Campo ausente fica como está — COALESCE com o parâmetro nulo.
 */
export async function atualizarAluno(
  alunoId: number,
  mudancas: { faixa?: string; dataNascimento?: string | null },
): Promise<void> {
  if (mudancas.dataNascimento !== undefined) {
    await sql`
      UPDATE users
         SET data_nascimento = ${mudancas.dataNascimento}::date
       WHERE id = ${alunoId}`;
  }

  if (mudancas.faixa !== undefined) {
    // Trocar de faixa é graduar: o ciclo de tempo mínimo e de aulas recomeça
    // hoje. Regravar a mesma faixa não mexe na data — só uma correção de texto.
    await sql`
      UPDATE alunos_perfil
         SET faixa_atual = ${mudancas.faixa},
             data_graduacao = CASE
               WHEN faixa_atual IS DISTINCT FROM ${mudancas.faixa}
                 THEN CURRENT_DATE
               ELSE data_graduacao
             END,
             atualizado_em = CURRENT_TIMESTAMP
       WHERE user_id = ${alunoId}`;
  }
}

export async function moverAlunoDeTurma(
  alunoId: number,
  turmaId: number,
): Promise<void> {
  await sql`
    UPDATE alunos_perfil
       SET turma_id = ${turmaId}, atualizado_em = CURRENT_TIMESTAMP
     WHERE user_id = ${alunoId}`;
}

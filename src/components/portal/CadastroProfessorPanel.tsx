"use client";

import { useState, type FormEvent } from "react";
import {
  CampoUsuario,
  type StatusUsuario,
} from "@/components/portal/CampoUsuario";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAcademia } from "@/lib/academiaStore";
import {
  formatarNome,
  idadePorNascimento,
  normalizarUsuario,
} from "@/services/dataService";

/**
 * Cadastro de professor. Vivia solto dentro do painel do admin; virou
 * componente próprio para poder ficar escondido atrás do botão "Cadastrar
 * professor", igual ao de aluno. Só o admin chega até aqui.
 */
export function CadastroProfessorPanel({ onPronto }: { onPronto?: () => void }) {
  const { criarProfessor } = useAcademia();
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [graduacao, setGraduacao] = useState("");
  const [email, setEmail] = useState("");
  const [desde, setDesde] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [statusUsuario, setStatusUsuario] = useState<StatusUsuario>("vazio");
  const [erro, setErro] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState<string | null>(null);

  async function cadastrar(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    if (!nome.trim()) {
      setErro("Informe o nome completo do professor.");
      return;
    }

    const resultado = await criarProfessor({
      nome: formatarNome(nome),
      usuario,
      senha,
      graduacao: graduacao.trim() || "1º Dan",
      email: email.trim(),
      desde: desde.trim() || String(new Date().getFullYear()),
      dataNascimento: nascimento,
      idade: idadePorNascimento(nascimento),
    });

    if (!resultado.ok) {
      setErro(resultado.erro ?? "Não foi possível cadastrar.");
      return;
    }

    setConfirmado(`${formatarNome(nome)}|${normalizarUsuario(usuario)}`);
    setNome("");
    setUsuario("");
    setSenha("");
    setGraduacao("");
    setEmail("");
    setDesde("");
    setNascimento("");
    setStatusUsuario("vazio");
    onPronto?.();
  }

  const [nomeConfirmado, usuarioConfirmado] = (confirmado ?? "").split("|");

  return (
    <>
      <section className="card max-w-2xl">
        <div className="border-b border-line px-4 py-2.5">
          <h2 className="heading-md">Cadastrar professor</h2>
          <p className="mt-0.5 text-xs text-muted">
            Somente o admin pode criar contas de professor.
          </p>
        </div>

        <form onSubmit={cadastrar} className="grid gap-3 p-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="prof-nome" className="label">
              Nome completo
            </label>
            <input
              id="prof-nome"
              className="input mt-1"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              onBlur={() => setNome(formatarNome(nome))}
              placeholder="Sensei Nome Sobrenome"
            />
          </div>

          <CampoUsuario
            id="prof-usuario"
            nomeCompleto={nome}
            valor={usuario}
            onChange={setUsuario}
            onStatus={setStatusUsuario}
          />

          <div>
            <label htmlFor="prof-senha" className="label">
              Senha de acesso
            </label>
            <input
              id="prof-senha"
              type="text"
              className="input mt-1"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Mínimo de 6 caracteres"
            />
            <p className="mt-1 text-2xs text-subtle">
              Entregue ao professor no primeiro acesso.
            </p>
          </div>

          <div>
            <label htmlFor="prof-graduacao" className="label">
              Graduação
            </label>
            <input
              id="prof-graduacao"
              className="input mt-1"
              value={graduacao}
              onChange={(event) => setGraduacao(event.target.value)}
              placeholder="3º Dan · JKA"
            />
          </div>

          <div>
            <label htmlFor="prof-desde" className="label">
              No dojo desde
            </label>
            <input
              id="prof-desde"
              className="input mt-1"
              value={desde}
              onChange={(event) => setDesde(event.target.value)}
              placeholder="2020"
            />
          </div>

          <div>
            <label htmlFor="prof-nascimento" className="label">
              Data de nascimento
            </label>
            <input
              id="prof-nascimento"
              type="date"
              className="input mt-1"
              value={nascimento}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setNascimento(event.target.value)}
            />
            <p className="mt-1 text-2xs text-subtle">
              {idadePorNascimento(nascimento) !== null
                ? `${idadePorNascimento(nascimento)} anos — calculado a partir daqui.`
                : "A idade é calculada a partir desta data."}
            </p>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="prof-email" className="label">
              E-mail de contato
            </label>
            <input
              id="prof-email"
              type="email"
              className="input mt-1"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="professor@email.com"
            />
            <p className="mt-1 text-2xs text-subtle">
              Não é usado para entrar — serve para contato e, futuramente, para
              o envio de comprovantes.
            </p>
          </div>

          {erro ? (
            <p className="rounded-md border border-status-bad/40 bg-status-bad/10 px-3 py-2 text-xs text-status-bad sm:col-span-2">
              {erro}
            </p>
          ) : null}

          <div className="flex items-center gap-3 sm:col-span-2">
            <Button
              type="submit"
              size="sm"
              disabled={statusUsuario !== "livre"}
            >
              Cadastrar professor
            </Button>
            {statusUsuario === "ocupado" ? (
              <span className="text-2xs text-status-bad">
                Escolha um nome de usuário livre para continuar.
              </span>
            ) : null}
          </div>
        </form>
      </section>

      <Modal
        open={confirmado !== null}
        onClose={() => setConfirmado(null)}
        titulo="Professor cadastrado"
      >
        <p className="text-sm text-muted">
          {nomeConfirmado} já pode receber turmas e entrar no portal com o
          usuário{" "}
          <span className="font-mono font-medium text-fg">
            {usuarioConfirmado}
          </span>
          .
        </p>
        <Button size="sm" className="mt-4" onClick={() => setConfirmado(null)}>
          Fechar
        </Button>
      </Modal>
    </>
  );
}

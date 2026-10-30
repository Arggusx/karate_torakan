"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

/**
 * Botão da equipe para redefinir a senha de um aluno (ou de um professor,
 * pelo admin). Gera uma senha temporária no servidor e a mostra UMA vez:
 * ela não fica guardada em texto em lugar nenhum. No próximo acesso, a
 * pessoa troca pela dela ou vincula o Google.
 */
export function RedefinirSenha({ usuarioId, nome }: { usuarioId: string; nome: string }) {
  const [etapa, setEtapa] = useState<"fechado" | "confirmar" | "pronto">("fechado");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function redefinir() {
    setEnviando(true);
    setErro(null);
    const resposta = await fetch(`/api/academia/usuarios/${usuarioId}/senha`, { method: "POST" });
    const dados = await resposta.json();
    setEnviando(false);
    if (!resposta.ok) {
      setErro(dados.erro ?? "Não foi possível redefinir.");
      return;
    }
    setSenha(dados.senha);
    setEtapa("pronto");
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(senha);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  function fechar() {
    setEtapa("fechado");
    setSenha("");
    setErro(null);
    setCopiado(false);
  }

  const primeiroNome = nome.split(" ")[0];

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setEtapa("confirmar")}>
        Redefinir senha
      </Button>

      <Modal open={etapa === "confirmar"} onClose={fechar} titulo="Redefinir senha?">
        <p className="body-muted">
          A senha atual de {primeiroNome} deixa de valer e uma senha temporária é gerada para você
          entregar. No próximo acesso, {primeiroNome} escolhe a própria senha ou vincula o Google.
        </p>
        {erro ? <p className="mt-2 text-xs text-status-bad">{erro}</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={redefinir} disabled={enviando}>
            {enviando ? "Gerando…" : "Gerar senha temporária"}
          </Button>
          <Button size="sm" variant="secondary" onClick={fechar}>
            Cancelar
          </Button>
        </div>
      </Modal>

      <Modal open={etapa === "pronto"} onClose={fechar} titulo="Senha temporária">
        <p className="body-muted">Entregue esta senha a {primeiroNome}. Ela aparece só agora.</p>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-dashed border-gold bg-gold/10 px-4 py-3">
          <code className="select-all font-mono text-lg font-semibold tracking-wide text-heading">{senha}</code>
          <Button size="sm" variant="secondary" onClick={copiar}>
            {copiado ? "Copiada" : "Copiar"}
          </Button>
        </div>
        <p className="mt-3 text-2xs text-subtle">
          Ela vale só até o primeiro acesso, quando a troca é obrigatória.
        </p>
        <Button size="sm" className="mt-4" onClick={fechar}>
          Feito
        </Button>
      </Modal>
    </>
  );
}

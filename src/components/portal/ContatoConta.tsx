"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export interface ContatoDaConta {
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

/** (82) 99999-0000 a partir dos dígitos gravados. */
function formatarTelefone(digitos: string | null) {
  if (!digitos) return "";
  const d = digitos.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return d;
}

/**
 * Bloco "Contato e avisos" de Minha conta.
 *
 * Maior de idade: o próprio telefone e o aceite de WhatsApp. Menor de idade:
 * o contato do responsável, e o aceite é dado por ele (LGPD, art. 14). O
 * servidor decide quem é menor pela data de nascimento; aqui só se mostra o
 * formulário certo.
 *
 * O aceite é opcional e pode ser retirado a qualquer momento, desmarcando.
 */
export function ContatoConta({
  contato,
  onSalvo,
}: {
  contato: ContatoDaConta;
  onSalvo: (novo: ContatoDaConta) => void;
}) {
  const toast = useToast();
  const [telefone, setTelefone] = useState("");
  const [nome, setNome] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [telefoneResp, setTelefoneResp] = useState("");
  const [emailResp, setEmailResp] = useState("");
  const [aceita, setAceita] = useState(false);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setTelefone(formatarTelefone(contato.telefone));
    setNome(contato.responsavelNome ?? "");
    setParentesco(contato.responsavelParentesco ?? "");
    setTelefoneResp(formatarTelefone(contato.responsavelTelefone));
    setEmailResp(contato.responsavelEmail ?? "");
    setAceita(contato.aceitaWhatsapp);
  }, [contato]);

  const menor = contato.menorDeIdade;

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setSalvando(true);
    const corpo = menor
      ? {
          responsavelNome: nome,
          responsavelParentesco: parentesco,
          responsavelTelefone: telefoneResp,
          responsavelEmail: emailResp,
          aceitaWhatsapp: aceita,
        }
      : { telefone, aceitaWhatsapp: aceita };
    const resposta = await fetch("/api/conta", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contato: corpo }),
    });
    const dados = await resposta.json();
    setSalvando(false);
    if (!resposta.ok) {
      toast(dados.erro ?? "Não foi possível salvar o contato.", "erro");
      return;
    }
    onSalvo(dados.contato);
    toast("Contato salvo.");
  }

  const desde = contato.aceitaWhatsapp && contato.whatsappOptinEm
    ? new Date(contato.whatsappOptinEm).toLocaleDateString("pt-BR")
    : null;

  return (
    <form onSubmit={salvar} className="card p-5">
      <h3 className="heading-md">Contato e avisos</h3>
      <p className="mt-0.5 text-xs text-muted">
        {menor
          ? "Como o aluno é menor de idade, os avisos da academia (mensalidade, horários) vão para o responsável."
          : "Para a academia falar com você sobre mensalidade e horários."}
      </p>

      {menor ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="resp-nome" className="label">Nome do responsável</label>
            <input id="resp-nome" className="input mt-1" value={nome}
              onChange={(e) => setNome(e.target.value)} autoComplete="name" maxLength={120} />
          </div>
          <div>
            <label htmlFor="resp-parentesco" className="label">Parentesco</label>
            <input id="resp-parentesco" className="input mt-1" value={parentesco}
              onChange={(e) => setParentesco(e.target.value)} placeholder="Mãe, pai, avó…" maxLength={40} />
          </div>
          <div>
            <label htmlFor="resp-telefone" className="label">Telefone (WhatsApp)</label>
            <input id="resp-telefone" className="input mt-1" type="tel" inputMode="tel" value={telefoneResp}
              onChange={(e) => setTelefoneResp(e.target.value)} placeholder="(82) 99999-0000" autoComplete="tel" />
          </div>
          <div>
            <label htmlFor="resp-email" className="label">E-mail</label>
            <input id="resp-email" className="input mt-1" type="email" value={emailResp}
              onChange={(e) => setEmailResp(e.target.value)} placeholder="responsavel@email.com" autoComplete="email" />
          </div>
        </div>
      ) : (
        <div className="mt-3 sm:max-w-xs">
          <label htmlFor="conta-telefone" className="label">Telefone (WhatsApp)</label>
          <input id="conta-telefone" className="input mt-1" type="tel" inputMode="tel" value={telefone}
            onChange={(e) => setTelefone(e.target.value)} placeholder="(82) 99999-0000" autoComplete="tel" />
        </div>
      )}

      <label className="mt-4 flex items-start gap-2.5 text-xs leading-relaxed text-fg">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 accent-[rgb(var(--accent))]"
          checked={aceita}
          onChange={(e) => setAceita(e.target.checked)}
        />
        <span>
          {menor
            ? "Sou o responsável e aceito receber avisos da academia pelo WhatsApp neste número."
            : "Aceito receber avisos da academia pelo WhatsApp neste número."}{" "}
          <span className="text-muted">
            Só mensalidade, horários e recados do dojo. Dá para desmarcar quando quiser.
          </span>
        </span>
      </label>
      {desde ? <p className="mt-1 pl-6 text-2xs text-subtle">Aceite registrado em {desde}.</p> : null}

      <Button type="submit" size="sm" className="mt-4" disabled={salvando}>
        {salvando ? "Salvando…" : "Salvar contato"}
      </Button>
    </form>
  );
}

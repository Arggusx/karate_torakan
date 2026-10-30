"use client";

import { useEffect, useState } from "react";
import { AvatarPerfil } from "@/components/portal/AvatarPerfil";
import { BotaoGoogle } from "@/components/ui/BotaoGoogle";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { useAcademia } from "@/lib/academiaStore";

interface Conta {
  id: number;
  nome: string;
  usuario: string;
  email: string;
  avatar_url: string | null;
  precisa_trocar_senha: boolean;
  google_email: string | null;
  tem_senha: boolean;
  google_disponivel: boolean;
}

const RETORNO_GOOGLE: Record<string, { texto: string; tipo?: "erro" }> = {
  vinculado: { texto: "Conta Google vinculada. Você já pode entrar por ela." },
  "ja-vinculado": { texto: "Essa conta Google já está ligada a outra pessoa do dojo.", tipo: "erro" },
  falhou: { texto: "O Google não confirmou o vínculo. Tente de novo.", tipo: "erro" },
  cancelado: { texto: "Vínculo com o Google cancelado.", tipo: "erro" },
  indisponivel: { texto: "O login com Google ainda não está ativado.", tipo: "erro" },
};

/** Avisa o cabeçalho que a foto mudou, sem esperar recarregar a página. */
export const EVENTO_CONTA = "torakan:conta";

function iniciaisDe(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (partes[0][0] + ultima).toUpperCase();
}

/**
 * Minha conta — cada pessoa (aluno, professor ou admin) edita o que é dela:
 * foto, nome de usuário, senha e o vínculo com o Google.
 *
 * O id de quem salva nunca vem daqui: a rota /api/conta o tira do cookie
 * assinado. Esta tela só coleta os campos e mostra o resultado.
 */
export function MinhaConta({
  iniciais,
  volta = "/portal/aluno?aba=conta",
}: {
  iniciais?: string;
  /** Para onde o Google devolve depois de vincular (a aba de conta do portal). */
  volta?: string;
}) {
  const toast = useToast();
  const { recarregar } = useAcademia();

  const [conta, setConta] = useState<Conta | null>(null);
  const [usuario, setUsuario] = useState("");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [salvandoUsuario, setSalvandoUsuario] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  async function carregar() {
    const resposta = await fetch("/api/conta", { cache: "no-store" });
    if (!resposta.ok) return;
    const dados = await resposta.json();
    setConta(dados.conta);
    setUsuario(dados.conta.usuario);
  }

  const [comGoogle, setComGoogle] = useState(false);
  const [desvinculando, setDesvinculando] = useState(false);

  useEffect(() => {
    carregar();
    fetch("/api/auth/metodos")
      .then((r) => r.json())
      .then((m) => setComGoogle(Boolean(m.google)))
      .catch(() => setComGoogle(false));

    // Volta do Google (?google=…): avisa e limpa a URL.
    const busca = new URLSearchParams(window.location.search);
    const retorno = RETORNO_GOOGLE[busca.get("google") ?? ""];
    if (retorno) {
      toast(retorno.texto, retorno.tipo);
      busca.delete("google");
      const resto = busca.toString();
      window.history.replaceState(null, "", window.location.pathname + (resto ? `?${resto}` : ""));
    }
  }, []);

  async function desvincular() {
    setDesvinculando(true);
    const resposta = await fetch("/api/conta/google", { method: "DELETE" });
    const dados = await resposta.json();
    setDesvinculando(false);
    if (!resposta.ok) {
      toast(dados.erro ?? "Não foi possível desvincular.", "erro");
      return;
    }
    setConta(dados.conta);
    toast("Conta Google desvinculada.");
  }

  // Sem senha atual para conferir: primeiro acesso ou conta só com Google.
  const pedeSenhaAtual = Boolean(conta && !conta.precisa_trocar_senha && conta.tem_senha);

  function avisarFoto(avatarUrl: string | null) {
    window.dispatchEvent(new CustomEvent(EVENTO_CONTA, { detail: { avatarUrl } }));
  }

  async function enviarAvatar(dataUrl: string) {
    const resposta = await fetch("/api/conta", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: dataUrl }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      toast(dados.erro ?? "Não foi possível salvar a foto.", "erro");
      return;
    }
    setConta(dados.conta);
    avisarFoto(dados.conta.avatar_url);
    await recarregar();
    toast("Foto de perfil atualizada.");
  }

  async function removerAvatar() {
    const resposta = await fetch("/api/conta", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ avatarUrl: null }),
    });
    const dados = await resposta.json();
    if (!resposta.ok) {
      toast(dados.erro ?? "Não foi possível remover.", "erro");
      return;
    }
    setConta(dados.conta);
    avisarFoto(null);
    await recarregar();
    toast("Foto removida.");
  }

  async function salvarUsuario(evento: React.FormEvent) {
    evento.preventDefault();
    if (usuario.trim() === conta?.usuario) {
      toast("Esse já é o seu usuário.", "erro");
      return;
    }
    setSalvandoUsuario(true);
    const resposta = await fetch("/api/conta", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario }),
    });
    const dados = await resposta.json();
    setSalvandoUsuario(false);
    if (!resposta.ok) {
      toast(dados.erro ?? "Não foi possível trocar o usuário.", "erro");
      return;
    }
    setConta(dados.conta);
    setUsuario(dados.conta.usuario);
    toast("Nome de usuário atualizado. Use-o no próximo acesso.");
  }

  async function salvarSenha(evento: React.FormEvent) {
    evento.preventDefault();
    if (novaSenha !== confirmar) {
      toast("A confirmação não bate com a nova senha.", "erro");
      return;
    }
    setSalvandoSenha(true);
    const resposta = await fetch("/api/conta", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    });
    const dados = await resposta.json();
    setSalvandoSenha(false);
    if (!resposta.ok) {
      toast(dados.erro ?? "Não foi possível trocar a senha.", "erro");
      return;
    }
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmar("");
    setConta(dados.conta);
    toast("Senha alterada.");
  }

  return (
    <div className="space-y-4">
      {conta?.precisa_trocar_senha ? (
        <div className="rounded-xl border border-accent/40 bg-accent/5 px-4 py-3">
          <p className="text-xs font-medium text-accent">
            Primeiro acesso: troque a senha que a academia entregou por uma
            sua, ou vincule sua conta Google.
          </p>
          <p className="mt-0.5 text-2xs text-muted">
            Enquanto não escolher, este aviso continua aparecendo.{" "}
            <a href="/primeiro-acesso" className="font-semibold text-accent underline-offset-2 hover:underline">
              Escolher agora
            </a>
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Foto e identificação */}
        <section className="card flex flex-col items-center gap-3 p-5 text-center">
          <AvatarPerfil
            src={conta?.avatar_url ?? null}
            iniciais={iniciais ?? iniciaisDe(conta?.nome ?? "")}
            tamanho="lg"
            editavel
            onEnviar={enviarAvatar}
            onRemover={removerAvatar}
          />
          <div>
            <p className="text-sm font-semibold text-fg">{conta?.nome}</p>
            <p className="font-mono text-2xs text-subtle">
              {conta?.usuario}
            </p>
          </div>
          <p className="text-2xs leading-relaxed text-muted">
            A foto aparece no seu portal e nas listas do dojo. Se você entrar
            com o Google sem ter enviado uma, usamos a da conta Google.
          </p>
        </section>

        <div className="space-y-4">
          {/* Nome de usuário */}
          <form onSubmit={salvarUsuario} className="card p-5">
            <h3 className="heading-md">Nome de usuário</h3>
            <p className="mt-0.5 text-xs text-muted">
              É com ele que você entra no portal. Trocar vale a partir do
              próximo acesso.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="conta-usuario" className="label">
                  Usuário
                </label>
                <input
                  id="conta-usuario"
                  className="input mt-1"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  autoComplete="username"
                />
              </div>
              <Button type="submit" size="sm" disabled={salvandoUsuario}>
                {salvandoUsuario ? "Salvando…" : "Salvar usuário"}
              </Button>
            </div>
          </form>

          {/* Senha */}
          <form onSubmit={salvarSenha} className="card p-5">
            <h3 className="heading-md">{conta && !conta.tem_senha ? "Criar senha" : "Senha"}</h3>
            <p className="mt-0.5 text-xs text-muted">
              {conta && !conta.tem_senha
                ? "Hoje você entra só pelo Google. Crie uma senha se quiser entrar também com usuário e senha."
                : pedeSenhaAtual
                  ? "Para trocar, confirme a senha atual."
                  : "Escolha a sua senha — a temporária da academia deixa de valer."}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {pedeSenhaAtual ? (
                <div className="sm:col-span-2">
                  <label htmlFor="conta-senha-atual" className="label">
                    Senha atual
                  </label>
                  <input
                    id="conta-senha-atual"
                    type="password"
                    className="input mt-1"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
              ) : null}
              <div>
                <label htmlFor="conta-nova-senha" className="label">
                  Nova senha
                </label>
                <input
                  id="conta-nova-senha"
                  type="password"
                  className="input mt-1"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Mínimo de 6 caracteres"
                />
              </div>
              <div>
                <label htmlFor="conta-confirmar" className="label">
                  Confirmar nova senha
                </label>
                <input
                  id="conta-confirmar"
                  type="password"
                  className="input mt-1"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <Button
              type="submit"
              size="sm"
              className="mt-3"
              disabled={salvandoSenha || (pedeSenhaAtual && !senhaAtual) || !novaSenha}
            >
              {salvandoSenha ? "Salvando…" : conta && !conta.tem_senha ? "Criar senha" : "Trocar senha"}
            </Button>
          </form>

          {/* Conta Google */}
          <section className="card p-5">
            <h3 className="heading-md">Conta Google</h3>
            {!conta?.google_disponivel || !comGoogle ? (
              <p className="mt-1 text-xs text-muted">
                O login com Google ainda não está ativado neste site.
              </p>
            ) : conta.google_email ? (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted">
                  Vinculada a <strong className="text-fg">{conta.google_email}</strong>. Você pode
                  entrar pelo botão &ldquo;Entrar com Google&rdquo;.
                </p>
                <Button size="sm" variant="secondary" onClick={desvincular} disabled={desvinculando}>
                  {desvinculando ? "Desvinculando…" : "Desvincular"}
                </Button>
              </div>
            ) : (
              <div className="mt-2 grid gap-3">
                <p className="text-xs text-muted">
                  Vincule para entrar sem digitar senha. Use uma conta Google só sua.
                </p>
                <BotaoGoogle
                  href={`/api/auth/google?modo=vincular&volta=${encodeURIComponent(volta)}`}
                  className="sm:w-auto sm:justify-self-start"
                >
                  Vincular conta Google
                </BotaoGoogle>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

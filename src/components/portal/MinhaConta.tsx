"use client";

import { useEffect, useState } from "react";
import { AvatarPerfil } from "@/components/portal/AvatarPerfil";
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
}

/**
 * Minha conta — o aluno edita o que é dele: foto, nome de usuário e senha.
 *
 * O id de quem salva nunca vem daqui: a rota /api/conta o tira do cookie
 * assinado. Esta tela só coleta os campos e mostra o resultado.
 */
export function MinhaConta({ iniciais }: { iniciais: string }) {
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

  useEffect(() => {
    carregar();
  }, []);

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
            Primeiro acesso: troque a senha que a academia entregou por uma sua.
          </p>
          <p className="mt-0.5 text-2xs text-muted">
            Enquanto não trocar, este aviso continua aparecendo.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Foto e identificação */}
        <section className="card flex flex-col items-center gap-3 p-5 text-center">
          <AvatarPerfil
            src={conta?.avatar_url ?? null}
            iniciais={iniciais}
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
            A foto aparece aqui no seu portal. Imagens são recortadas em um
            quadrado automaticamente.
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
            <h3 className="heading-md">Senha</h3>
            <p className="mt-0.5 text-xs text-muted">
              Para trocar, confirme a senha atual.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
              disabled={salvandoSenha || !senhaAtual || !novaSenha}
            >
              {salvandoSenha ? "Salvando…" : "Trocar senha"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

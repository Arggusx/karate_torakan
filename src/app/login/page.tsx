"use client";

import Link from "next/link";
import { GarraTigre } from "@/components/animacoes/AnimacoesKarate";
import { MarcaTorakan } from "@/components/ui/MarcaTorakan";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { BotaoGoogle } from "@/components/ui/BotaoGoogle";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { useAcademia } from "@/lib/academiaStore";
import { DESTINO_POR_PERFIL } from "@/services/dataService";

const ERROS: Record<string, string> = {
  "google-sem-vinculo":
    "Esta conta Google ainda não está ligada a nenhum aluno ou professor. Entre com usuário e senha e vincule o Google no primeiro acesso ou em Minha conta.",
  "google-cancelado": "O login com Google foi cancelado.",
  "google-falhou": "O Google não confirmou o login. Tente de novo.",
  "google-indisponivel": "O login com Google ainda não está ativado. Entre com usuário e senha.",
  sessao: "Sua sessão expirou. Entre de novo.",
};

export default function LoginPage() {
  const router = useRouter();
  const { entrar } = useAcademia();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [comGoogle, setComGoogle] = useState(false);

  // O botão do Google só aparece onde ele está configurado.
  useEffect(() => {
    fetch("/api/auth/metodos")
      .then((r) => r.json())
      .then((m) => setComGoogle(Boolean(m.google)))
      .catch(() => setComGoogle(false));
  }, []);

  // Volta do Google com erro: a rota de retorno manda ?erro=… para cá. Lido
  // pelo window para não precisar de Suspense na página inteira.
  useEffect(() => {
    const codigo = new URLSearchParams(window.location.search).get("erro");
    if (codigo && ERROS[codigo]) setErro(ERROS[codigo]);
  }, []);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setEnviando(true);
    setErro(null);

    entrar(usuario, senha).then((resultado) => {
      if (!resultado.ok || !resultado.sessao) {
        setErro(resultado.erro ?? "Não foi possível entrar.");
        setEnviando(false);
        return;
      }
      // Conta criada pela equipe: antes do portal, a pessoa escolhe como vai
      // entrar daqui pra frente (senha própria ou Google).
      router.push(
        resultado.primeiroAcesso
          ? "/primeiro-acesso"
          : DESTINO_POR_PERFIL[resultado.sessao.perfil],
      );
    });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="cabecalho-vidro">
        <div className="section flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <MarcaTorakan className="h-10 w-10" />
            <span className="font-marca text-2xl leading-none text-accent">
              Torakan
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="card relative overflow-hidden p-5">
            {/* A marca do Tigre: três riscos de garra no canto do cartão. */}
            <GarraTigre className="pointer-events-none absolute -right-2 -top-2 h-16 w-16 opacity-70" />
            <h1 className="heading-lg">Área do Aluno / Professor</h1>
            <p className="body-muted mt-1">
              Entre com seu nome de usuário e senha.
            </p>

            <form onSubmit={onSubmit} className="mt-5 space-y-3">
              <div>
                <label htmlFor="usuario" className="label">
                  Nome de usuário
                </label>
                <input
                  id="usuario"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  value={usuario}
                  onChange={(event) => setUsuario(event.target.value)}
                  placeholder="nome.sobrenome"
                  className="input mt-1 font-mono"
                />
              </div>

              <div>
                <label htmlFor="senha" className="label">
                  Senha
                </label>
                <input
                  id="senha"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={senha}
                  onChange={(event) => setSenha(event.target.value)}
                  placeholder="••••••••"
                  className="input mt-1"
                />
              </div>

              {erro ? (
                <p className="rounded-md border border-status-bad/40 bg-status-bad/10 px-3 py-2 text-xs text-status-bad">
                  {erro}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={enviando}>
                {enviando ? "Entrando..." : "Entrar"}
              </Button>
            </form>

            {comGoogle ? (
              <>
                <div className="my-4 flex items-center gap-3 text-2xs uppercase tracking-[0.12em] text-subtle">
                  <span className="h-px flex-1 bg-line" />
                  ou
                  <span className="h-px flex-1 bg-line" />
                </div>
                <BotaoGoogle href="/api/auth/google?modo=entrar">Entrar com Google</BotaoGoogle>
                <p className="mt-2 text-center text-2xs text-subtle">
                  Só para contas que já vincularam o Google.
                </p>
              </>
            ) : null}

            <p className="mt-4 border-t border-line pt-4 text-2xs leading-relaxed text-subtle">
              As contas são criadas pelo professor ou pelo admin no portal.
              Esqueceu a senha? Peça ao professor para redefinir.
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            <Link href="/estudos" className="hover:text-fg">
              Continuar sem entrar — ir para o portal de estudos
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

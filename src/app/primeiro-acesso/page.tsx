"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { MarcaTorakan } from "@/components/ui/MarcaTorakan";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { BotaoGoogle } from "@/components/ui/BotaoGoogle";
import { Button } from "@/components/ui/Button";
import { useAcademia } from "@/lib/academiaStore";
import { DESTINO_POR_PERFIL } from "@/services/dataService";

interface Conta {
  nome: string;
  usuario: string;
  precisa_trocar_senha: boolean;
  google_email: string | null;
  google_disponivel: boolean;
}

const AVISOS_GOOGLE: Record<string, string> = {
  "ja-vinculado": "Esta conta Google já está ligada a outra pessoa do dojo. Use outra conta Google ou crie uma senha.",
  falhou: "O Google não confirmou o vínculo. Tente de novo.",
  cancelado: "O vínculo com o Google foi cancelado.",
  indisponivel: "O login com Google ainda não está ativado. Crie uma senha por enquanto.",
};

/**
 * Primeiro acesso: a conta foi criada pela equipe com uma senha temporária.
 * Antes de seguir, a pessoa escolhe como vai entrar daqui pra frente:
 *  - criar a própria senha; ou
 *  - vincular a conta Google — e a temporária, que o professor conhece,
 *    deixa de valer na hora.
 * "Fazer isso depois" leva ao portal; o lembrete continua em Minha conta.
 */
export default function PrimeiroAcessoPage() {
  const router = useRouter();
  const { carregado, sessao } = useAcademia();
  const [conta, setConta] = useState<Conta | null>(null);
  const [comGoogle, setComGoogle] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [vinculou, setVinculou] = useState(false);

  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const destino = sessao ? DESTINO_POR_PERFIL[sessao.perfil] : "/login";

  useEffect(() => {
    if (carregado && !sessao) router.replace("/login?erro=sessao");
  }, [carregado, sessao, router]);

  useEffect(() => {
    if (!sessao) return;
    fetch("/api/conta", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setConta(d.conta ?? null))
      .catch(() => setConta(null));
    fetch("/api/auth/metodos")
      .then((r) => r.json())
      .then((m) => setComGoogle(Boolean(m.google)))
      .catch(() => setComGoogle(false));

    const google = new URLSearchParams(window.location.search).get("google");
    if (google === "vinculado") setVinculou(true);
    else if (google && AVISOS_GOOGLE[google]) setAviso(AVISOS_GOOGLE[google]);
  }, [sessao]);

  async function criarSenha(evento: FormEvent) {
    evento.preventDefault();
    setErro(null);
    if (senha.length < 6) return setErro("A senha precisa de ao menos 6 caracteres.");
    if (senha !== confirmar) return setErro("A confirmação não bate com a senha.");

    setSalvando(true);
    const resposta = await fetch("/api/conta", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ novaSenha: senha }),
    });
    const dados = await resposta.json();
    setSalvando(false);
    if (!resposta.ok) return setErro(dados.erro ?? "Não foi possível salvar a senha.");
    router.push(destino);
  }

  const primeiroNome = (conta?.nome ?? sessao?.nome ?? "").split(" ")[0];
  const googleLigado = comGoogle && conta?.google_disponivel !== false;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="cabecalho-vidro">
        <div className="section flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <MarcaTorakan className="h-10 w-10" />
            <span className="font-marca text-2xl leading-none text-accent">Torakan</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-12">
        <div className="w-full max-w-3xl">
          {vinculou ? (
            <section className="painel card-faixa mx-auto max-w-md text-center [--faixa-cor:#16A34A]">
              <p className="eyebrow">Tudo certo</p>
              <h1 className="heading-lg mt-1">Google vinculado</h1>
              <p className="body-muted mt-2">
                A partir de agora você entra com o botão &ldquo;Entrar com Google&rdquo;
                {conta?.google_email ? <> usando <strong className="text-fg">{conta.google_email}</strong></> : null}.
                A senha temporária que você recebeu deixou de valer.
              </p>
              <Button className="mt-5" onClick={() => router.push(destino)}>
                Ir para o meu portal
              </Button>
            </section>
          ) : (
            <>
              <div className="mb-6 text-center">
                <p className="eyebrow">Primeiro acesso</p>
                <h1 className="heading-xl mt-2">
                  {primeiroNome ? `Bem-vindo, ${primeiroNome}` : "Bem-vindo"}
                </h1>
                <p className="body-muted mx-auto mt-2 max-w-xl">
                  Sua conta foi criada pela academia com uma senha temporária. Escolha como
                  você quer entrar daqui pra frente.
                </p>
              </div>

              {aviso ? (
                <p className="mx-auto mb-4 max-w-xl rounded-lg border border-status-warn/40 bg-status-warn/10 px-3 py-2 text-center text-xs text-fg">
                  {aviso}
                </p>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <form onSubmit={criarSenha} className="painel card-faixa grid content-start gap-3">
                  <div>
                    <h2 className="heading-md">Criar minha senha</h2>
                    <p className="mt-1 text-xs text-muted">
                      Você continua entrando com o usuário{" "}
                      <span className="font-mono text-fg">{conta?.usuario ?? sessao?.usuario}</span> e
                      a senha que escolher agora.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="pa-senha" className="label">Nova senha</label>
                    <input
                      id="pa-senha"
                      type="password"
                      autoComplete="new-password"
                      className="input mt-1"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="Mínimo de 6 caracteres"
                    />
                  </div>
                  <div>
                    <label htmlFor="pa-confirmar" className="label">Confirmar</label>
                    <input
                      id="pa-confirmar"
                      type="password"
                      autoComplete="new-password"
                      className="input mt-1"
                      value={confirmar}
                      onChange={(e) => setConfirmar(e.target.value)}
                    />
                  </div>
                  {erro ? <p className="text-xs text-status-bad">{erro}</p> : null}
                  <Button type="submit" disabled={salvando || !senha}>
                    {salvando ? "Salvando…" : "Salvar senha e entrar"}
                  </Button>
                </form>

                <section className="painel card-faixa grid content-start gap-3 [--faixa-cor:#4285F4]">
                  <div>
                    <h2 className="heading-md">Entrar com o Google</h2>
                    <p className="mt-1 text-xs text-muted">
                      Sem senha para lembrar: você entra com a sua conta Google. A senha temporária
                      que você recebeu deixa de valer na hora.
                    </p>
                  </div>
                  {googleLigado ? (
                    <BotaoGoogle href="/api/auth/google?modo=vincular&volta=/primeiro-acesso">
                      Vincular minha conta Google
                    </BotaoGoogle>
                  ) : (
                    <p className="rounded-lg bg-elevated px-3 py-2 text-xs text-muted">
                      O login com Google ainda não está ativado neste site. Por enquanto, crie uma senha.
                    </p>
                  )}
                  <p className="text-2xs leading-relaxed text-subtle">
                    Use uma conta Google só sua. Se ela já estiver ligada a outra pessoa do dojo, o
                    vínculo é recusado.
                  </p>
                </section>
              </div>

              <p className="mt-6 text-center text-xs text-muted">
                <Link href={destino} className="underline-offset-2 hover:text-accent hover:underline">
                  Fazer isso depois
                </Link>{" "}
                — o lembrete fica no seu portal até você escolher.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

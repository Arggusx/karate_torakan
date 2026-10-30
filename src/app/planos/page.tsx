import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { HeaderLanding } from "@/components/layout/HeaderLanding";
import { ButtonLink } from "@/components/ui/Button";
import { formatarReais } from "@/services/dataService";
import { VALOR_MENSALIDADE_CENTAVOS } from "@/server/pagamentos";
import { listarTurmas } from "@/server/usuarios";

export const metadata: Metadata = {
  title: "Planos e matrícula",
  description:
    "Mensalidade, taxa de inscrição, formas de pagamento e como agendar a semana de aulas gratuita na Academia Tigre de Karatê.",
};

/** A página lê turmas do banco; 5 minutos de cache é o bastante. */
export const revalidate = 300;

const INCLUSO = [
  {
    titulo: "Três aulas por semana",
    texto: "Terça, quinta e sexta, na turma da sua faixa etária.",
  },
  {
    titulo: "Portal de estudos completo",
    texto: "26 katas, kihon catalogado, embusen animado e a linhagem inteira.",
  },
  {
    titulo: "Acompanhamento individual",
    texto: "Correção do sensei aula a aula, com no máximo 20 alunos por turma.",
  },
  {
    titulo: "Exames de graduação",
    texto: "Sem custo extra. A faixa se conquista no tatame, não no caixa.",
  },
  {
    titulo: "Frequência e progresso online",
    texto: "Você vê quanto já treinou e o que falta para o próximo exame.",
  },
  {
    titulo: "Sem fidelidade",
    texto: "Mês a mês. Para sair, basta avisar — não há multa nem carência.",
  },
];

/*
  Os métodos refletem o que o sistema realmente aceita hoje. PIX e cartão
  passam pelo checkout do portal; o presencial existe porque é como boa parte
  dos alunos paga, e o professor dá baixa manual depois.
*/
const PAGAMENTOS = [
  {
    nome: "PIX",
    prazo: "Na hora",
    texto:
      "QR Code gerado dentro do portal. A mensalidade é baixada automaticamente assim que o pagamento cai.",
    icone: "pix" as const,
  },
  {
    nome: "Cartão de crédito",
    prazo: "Em minutos",
    texto:
      "Checkout seguro, sem cadastrar o cartão na academia. Também pelo portal do aluno.",
    icone: "cartao" as const,
  },
  {
    nome: "Presencial",
    prazo: "Baixa manual",
    texto:
      "PIX ou dinheiro direto ao professor. O sensei lança no portal e aparece no seu histórico.",
    icone: "mao" as const,
  },
];

const PASSOS = [
  {
    n: "01",
    titulo: "Agende a semana gratuita",
    texto:
      "Fale com a academia e escolha o dia para começar. Nada de pagar ou assinar antes disso.",
  },
  {
    n: "02",
    titulo: "Treine uma semana inteira",
    texto:
      "Três aulas, na turma da sua faixa etária. Tempo suficiente para sentir o ritmo e decidir sem pressa.",
  },
  {
    n: "03",
    titulo: "Efetive a matrícula",
    texto:
      "Gostou, a gente cadastra. Você recebe o acesso ao portal e a primeira mensalidade vence no mês seguinte.",
  },
];

export default async function PlanosPage() {
  const turmas = await listarTurmas().catch(() => []);
  const valor = formatarReais(VALOR_MENSALIDADE_CENTAVOS);

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderLanding />

      <main className="flex-1">
        {/*
          Hero e preço na mesma dobra.

          Na versão anterior o valor morava na terceira seção, depois de dois
          blocos de texto — quem abre uma página chamada "planos" quer o número
          primeiro. Agora a coluna da direita é o cartão de preço, e o texto à
          esquerda só justifica o que está nele.
        */}
        <section className="relative isolate overflow-hidden border-b border-line bg-[rgb(var(--hero))] text-fg">
          <div
            aria-hidden
            className="absolute inset-0 -z-20 bg-[url('/imagens/dojo.jpg')] bg-cover bg-center opacity-[0.18] grayscale dark:opacity-[0.3]"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(110%_80%_at_12%_15%,rgb(var(--accent)/0.12),transparent_60%),linear-gradient(100deg,rgb(var(--hero))_40%,rgb(var(--hero)/0.88)_72%,rgb(var(--hero)/0.6)_100%)]"
          />
          <span
            aria-hidden
            className="kanji-mark pointer-events-none absolute -right-4 top-6 text-[11rem] opacity-[0.06] dark:opacity-[0.05]"
          >
            入門
          </span>

          <div className="section grid items-center gap-10 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
            <div className="max-w-xl">
              <p className="eyebrow">Matrícula · 入門</p>
              <h1 className="heading-xl mt-3">
                Um valor só. Para qualquer idade, qualquer faixa.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
                Sem pacote, sem plano anual e sem letra miúda. A diferença entre
                as turmas é o horário — nunca o preço. E a primeira semana de
                treino é por nossa conta.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="chip">Sem taxa de matrícula</span>
                <span className="chip">Sem fidelidade</span>
                <span className="chip">Exames inclusos</span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="#comecar">Agendar semana grátis</ButtonLink>
                <ButtonLink href="#turmas" variant="secondary">
                  Ver horários
                </ButtonLink>
              </div>
            </div>

            {/* Cartão de preço em vidro, sobre bolhas de cor que se mexem. */}
            <div className="vidro-palco">
            <div className="painel vidro relative" data-inclinar="5">
              <span className="absolute -top-3 left-6 rounded-full bg-accent-solid px-3 py-1 text-2xs font-semibold uppercase tracking-[0.1em] text-on-accent">
                Plano único
              </span>

              <p className="label mt-2">Mensalidade</p>
              <p className="mt-2 flex items-baseline gap-1.5">
                <span className="text-lg text-muted">R$</span>
                <span className="text-6xl font-semibold tabular-nums tracking-[-0.04em] text-fg">
                  {valor}
                </span>
                <span className="text-sm text-muted">/mês</span>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Cobrada a partir do mês seguinte à matrícula. A semana de
                experiência não entra na conta.
              </p>

              <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line">
                <div className="bg-surface px-3.5 py-3">
                  <dt className="label">Inscrição</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-fg">
                    Isenta
                  </dd>
                </div>
                <div className="bg-surface px-3.5 py-3">
                  <dt className="label">Exame de faixa</dt>
                  <dd className="mt-0.5 text-lg font-semibold text-fg">
                    Isento
                  </dd>
                </div>
              </dl>

              <ButtonLink href="#comecar" className="mt-5 w-full">
                Começar pela semana gratuita
              </ButtonLink>
              <p className="mt-3 text-center text-2xs text-subtle">
                Você só paga depois de treinar uma semana inteira.
              </p>
            </div>
            </div>
          </div>
        </section>

        {/* Como começar */}
        <section id="comecar" className="section scroll-mt-16 py-14">
          <div className="max-w-2xl">
            <p className="eyebrow">Como começar</p>
            <h2 className="heading-lg mt-1.5">Três passos, uma semana</h2>
            <p className="body-muted mt-2">
              Nenhum deles envolve cartão, contrato ou compromisso. O primeiro
              pagamento acontece depois que você já treinou.
            </p>
          </div>

          {/*
            A linha que liga os passos é um pseudo-elemento do contêiner, não
            uma borda de cada cartão: assim ela atravessa os três no desktop e
            simplesmente não aparece quando eles empilham no celular.
          */}
          <ol className="relative mt-8 grid gap-4 lg:grid-cols-3">
            <span
              aria-hidden
              className="absolute left-0 right-0 top-9 hidden h-px bg-line lg:block"
            />
            {PASSOS.map((passo) => (
              <li key={passo.n} className="relative">
                <span className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-line bg-surface font-display text-2xl text-accent shadow-painel dark:shadow-none">
                  {passo.n}
                </span>
                <h3 className="heading-md mt-4">{passo.titulo}</h3>
                <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-muted">
                  {passo.texto}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* O que está incluso */}
        <section className="faixa-destacada py-14">
          <div className="section">
            <div className="max-w-2xl">
              <p className="eyebrow">Incluso</p>
              <h2 className="heading-lg mt-1.5">
                O que a mensalidade cobre
              </h2>
              <p className="body-muted mt-2">
                Tudo abaixo está dentro do mesmo valor. Não existe item avulso
                nem cobrança de surpresa no meio do ano.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {INCLUSO.map((item) => (
                <article key={item.titulo} className="card card-hover p-5">
                  <IconeCheck />
                  <h3 className="heading-md mt-3">{item.titulo}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    {item.texto}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Formas de pagamento */}
        <section className="section py-14">
          <div className="max-w-2xl">
            <p className="eyebrow">Pagamento</p>
            <h2 className="heading-lg mt-1.5">Como você pode pagar</h2>
            <p className="body-muted mt-2">
              Três caminhos, todos com o registro aparecendo no seu portal. Você
              acompanha o que foi pago e o que está em aberto sem perguntar a
              ninguém.
            </p>
          </div>

          <div className="mt-8 grid gap-3 lg:grid-cols-3">
            {PAGAMENTOS.map((forma) => (
              <article key={forma.nome} className="card card-hover p-5">
                <div className="flex items-center justify-between gap-2">
                  <IconePagamento tipo={forma.icone} />
                  <span className="chip">{forma.prazo}</span>
                </div>
                <h3 className="heading-md mt-4">{forma.nome}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  {forma.texto}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Turmas e horários */}
        <section id="turmas" className="faixa-destacada scroll-mt-16 py-14">
          <div className="section">
            <div className="max-w-2xl">
              <p className="eyebrow">Horários</p>
              <h2 className="heading-lg mt-1.5">Em qual turma você entra</h2>
              <p className="body-muted mt-2">
                A divisão formal é por nível e faixa; na prática, a idade é o
                critério do dia a dia. Mesmo método, ritmos diferentes.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {turmas.map((turma) => (
                <article key={turma.id} className="card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="heading-lg">Turma {turma.nome}</h3>
                    <span className="chip">{turma.faixa_etaria}</span>
                  </div>

                  <p className="mt-4 font-display text-2xl tabular-nums tracking-[-0.02em] text-accent">
                    {turma.horario.slice(0, 5)} às{" "}
                    {(turma.hora_fim ?? "").slice(0, 5)}
                  </p>
                  <p className="mt-1 text-xs text-muted">{turma.dias_semana}</p>

                  <p className="mt-4 border-t border-line pt-3 text-2xs leading-relaxed text-subtle">
                    Faixas típicas: {turma.faixas_tipicas}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Fechamento */}
        <section className="section py-14">
          <div className="painel flex flex-col items-start justify-between gap-5 border-accent/50 sm:flex-row sm:items-center">
            <div className="max-w-xl">
              <h2 className="heading-lg">
                A primeira semana não custa nada
              </h2>
              <p className="body-muted mt-1.5">
                Leve roupa confortável — o kimono fica para depois. Se não for
                para você, a gente agradece a visita e fica por isso mesmo.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <ButtonLink href="/#dojo">Ver onde treinamos</ButtonLink>
              <ButtonLink href="/estudos" variant="secondary">
                Conhecer o portal
              </ButtonLink>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-muted">
            Já é aluno?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Acesse seu portal.
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function IconeCheck() {
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

function IconePagamento({ tipo }: { tipo: "pix" | "cartao" | "mao" }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-elevated text-fg">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {tipo === "pix" ? (
          // Losango do PIX: dois quadrados girados, como o próprio símbolo.
          <>
            <path d="M12 2.8 21.2 12 12 21.2 2.8 12z" />
            <path d="M12 7.6 16.4 12 12 16.4 7.6 12z" />
          </>
        ) : tipo === "cartao" ? (
          <>
            <rect x="2" y="5" width="20" height="14" rx="2.5" />
            <path d="M2 10h20M6 15h4" />
          </>
        ) : (
          <>
            <path d="M7 11V5.5a1.5 1.5 0 0 1 3 0V11" />
            <path d="M10 10.5V4.5a1.5 1.5 0 0 1 3 0V11" />
            <path d="M13 10.5V6a1.5 1.5 0 0 1 3 0v6" />
            <path d="M16 11V8.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-6-6v-1.5l-1.6-1.6a1.5 1.5 0 0 1 2.1-2.1L7 11.5" />
          </>
        )}
      </svg>
    </span>
  );
}

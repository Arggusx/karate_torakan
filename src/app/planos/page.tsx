import type { Metadata } from "next";
import { FooterLanding } from "@/components/layout/FooterLanding";
import { HeaderLanding } from "@/components/layout/HeaderLanding";
import { MENSALIDADE } from "@/lib/precos";
import { listarTurmas } from "@/server/usuarios";
import "../landing.css";

export const metadata: Metadata = {
  title: "Planos e matrícula",
  description:
    "Mensalidade de R$ 70, sem taxa de matrícula e sem fidelidade. Primeira semana de aulas grátis na Academia Tigre de Karatê.",
  alternates: { canonical: "/planos" },
};

/** A página lê turmas do banco; 5 minutos de cache é o bastante. */
export const revalidate = 300;

/*
  Página enxuta: preço, o que inclui, como começar, como pagar e horários,
  tudo em duas telas. Cada item é uma linha; o detalhe fica para a conversa
  no dojo.
*/
const INCLUSO = [
  "Três aulas por semana",
  "Exames de graduação sem custo extra",
  "Turmas de no máximo 20 alunos",
  "Frequência e progresso no portal do aluno",
  "Sem taxa de matrícula",
  "Sem fidelidade: para sair, é só avisar",
];

const PASSOS = [
  { titulo: "Agende a semana grátis", texto: "Fale com a academia e escolha o dia." },
  { titulo: "Treine uma semana", texto: "Três aulas na turma da sua idade." },
  { titulo: "Faça a matrícula", texto: "A primeira mensalidade vence no mês seguinte." },
];

/* O que o sistema aceita hoje: PIX e cartão pelo portal, e o pagamento em mãos. */
const PAGAMENTOS = [
  { nome: "PIX", texto: "QR Code no portal, baixa automática." },
  { nome: "Cartão de crédito", texto: "Checkout seguro pelo portal." },
  { nome: "Em mãos", texto: "PIX ou dinheiro ao professor." },
];

export default async function PlanosPage() {
  const turmas = await listarTurmas().catch(() => []);

  return (
    <div className="landing flex min-h-screen flex-col text-fg">
      <HeaderLanding />

      <main className="flex-1">
        {/* Preço e o que ele cobre, na mesma dobra. */}
        <section className="landing-container grid items-center gap-10 pb-14 pt-28 lg:grid-cols-[1.1fr_0.9fr] lg:pb-20 lg:pt-36">
          <div>
            <p className="landing-rotulo mb-5">Planos e matrícula · 入門</p>
            <h1 className="landing-titulo text-[clamp(36px,5vw,64px)] leading-[1.02]">
              Um valor só, para qualquer idade e faixa.
            </h1>
            <p className="mt-5 max-w-[480px] leading-relaxed text-muted">
              Sem pacote e sem plano anual. E a primeira semana de treino é por
              nossa conta.
            </p>
            <ul className="mt-8 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
              {INCLUSO.map((item) => (
                <li key={item} className="flex items-start gap-2.5 leading-snug">
                  <Check />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Cartão invertido com o carimbo 虎, o mesmo da landing. */}
          <article className="landing-card relative bg-fg p-8 text-canvas sm:p-10">
            <span
              aria-hidden
              className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-[10px] bg-accent-solid font-mincho text-[28px] font-extrabold text-on-accent"
            >
              虎
            </span>
            <p className="landing-rotulo tracking-[0.16em] !text-canvas/75">Mensalidade</p>
            <p className="mt-3 whitespace-nowrap font-mincho text-[clamp(56px,6vw,80px)] font-extrabold leading-none">
              {MENSALIDADE}
              <span className="text-[24px]">/mês</span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-canvas/75">
              Você só paga depois de treinar a semana grátis. A primeira
              mensalidade vence no mês seguinte à matrícula.
            </p>
            <a href="#comecar" className="landing-botao mt-7 bg-canvas text-fg hover:bg-elevated">
              Agendar a semana grátis
            </a>
          </article>
        </section>

        {/* Como começar, como pagar e horários: três colunas curtas. */}
        <section
          id="comecar"
          className="landing-container grid scroll-mt-20 gap-10 border-t border-line py-14 md:grid-cols-3 lg:py-20"
        >
          <div>
            <p className="landing-rotulo mb-5">Como começar</p>
            <ol className="space-y-4">
              {PASSOS.map((passo, i) => (
                <li key={passo.titulo} className="grid grid-cols-[36px_1fr] gap-3">
                  <span className="font-mincho text-2xl font-extrabold leading-none text-accent">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-bold">{passo.titulo}</span>
                    <span className="text-sm text-muted">{passo.texto}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="landing-rotulo mb-5">Pagamento</p>
            <ul className="space-y-4">
              {PAGAMENTOS.map((forma) => (
                <li key={forma.nome}>
                  <span className="block font-bold">{forma.nome}</span>
                  <span className="text-sm text-muted">{forma.texto}</span>
                </li>
              ))}
            </ul>
          </div>

          <div id="turmas" className="scroll-mt-20">
            <p className="landing-rotulo mb-5">Turmas · terça, quinta e sexta</p>
            <ul className="space-y-4">
              {turmas.map((turma) => (
                <li key={turma.id}>
                  <span className="block font-bold">
                    {turma.nome}{" "}
                    <span className="font-normal text-muted">· {turma.faixa_etaria}</span>
                  </span>
                  <span className="text-sm tabular-nums text-muted">
                    {turma.horario.slice(0, 5)} às {(turma.hora_fim ?? "").slice(0, 5)}
                  </span>
                </li>
              ))}
            </ul>
            <a href="/#onde-fica" className="landing-botao landing-botao-secundario mt-7">
              Ver onde fica o dojo
            </a>
          </div>
        </section>
      </main>

      <FooterLanding />
    </div>
  );
}

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

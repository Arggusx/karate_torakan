import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/Footer";
import { HeaderLanding } from "@/components/layout/HeaderLanding";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Card";
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
  "Três aulas por semana — terça, quinta e sexta",
  "Acesso integral ao portal de estudos",
  "Acompanhamento individual do sensei",
  "Exames de graduação sem custo extra",
  "Material de apoio: katas, kihon e história",
];

/*
  Os métodos refletem o que o sistema realmente aceita hoje. PIX e cartão
  passam pelo checkout do portal; o presencial existe porque é como boa parte
  dos alunos paga, e o professor dá baixa manual depois.
*/
const PAGAMENTOS = [
  {
    nome: "PIX",
    prazo: "Confirmação em segundos",
    texto:
      "QR Code gerado na hora dentro do portal. A mensalidade é baixada automaticamente assim que o pagamento cai.",
  },
  {
    nome: "Cartão de crédito",
    prazo: "Confirmação em minutos",
    texto:
      "Checkout seguro, sem precisar cadastrar o cartão na academia. Também pelo portal do aluno.",
  },
  {
    nome: "Presencial",
    prazo: "Baixa manual",
    texto:
      "PIX ou dinheiro direto ao professor. O registro é lançado no portal pelo sensei e aparece no seu histórico.",
  },
];

const PASSOS = [
  {
    n: "01",
    titulo: "Agende a semana gratuita",
    texto:
      "Fale com a academia e escolha o dia para começar. Não precisa pagar nada nem assinar nada antes disso.",
  },
  {
    n: "02",
    titulo: "Treine uma semana inteira",
    texto:
      "Três aulas, na turma da sua faixa etária. É tempo suficiente para sentir o ritmo e decidir sem pressa.",
  },
  {
    n: "03",
    titulo: "Efetive a matrícula",
    texto:
      "Gostou, a gente cadastra. Você recebe o acesso ao portal e a primeira mensalidade só vence no mês seguinte.",
  },
];

export default async function PlanosPage() {
  const turmas = await listarTurmas();

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderLanding />

      <main className="flex-1">
        <HeroPagina
          sobretitulo="Matrícula · 入門"
          titulo="Quanto custa treinar aqui"
          descricao="Um valor único para qualquer idade e qualquer faixa. Sem pacote, sem fidelidade e sem letra miúda — e a primeira semana é por nossa conta."
          imagem="/imagens/dojo.jpg"
          kanji="入門"
        />

        {/* Semana gratuita: é a oferta, então vem antes do preço. */}
        <section className="faixa-destacada py-12">
          <div className="section">
            <SectionHeading
              eyebrow="Comece por aqui"
              titulo="A primeira semana é gratuita"
              descricao="Três aulas completas antes de qualquer compromisso. Você treina, conhece a turma e o professor, e só então decide."
            />

            <ol className="mt-4 grid gap-3 lg:grid-cols-3">
              {PASSOS.map((passo) => (
                <li key={passo.n} className="card p-5">
                  <span className="font-display text-3xl leading-none text-accent">
                    {passo.n}
                  </span>
                  <h3 className="heading-md mt-3">{passo.titulo}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    {passo.texto}
                  </p>
                </li>
              ))}
            </ol>

            <div className="card mt-3 flex flex-wrap items-center justify-between gap-3 border-accent p-5">
              <div>
                <p className="text-sm font-medium text-fg">
                  Pronto para agendar?
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  Escolha o dia e apareça. Leve roupa confortável — o kimono
                  fica para depois.
                </p>
              </div>
              <ButtonLink href="/#dojo" size="sm">
                Ver onde treinamos
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="section py-12">
          <SectionHeading
            eyebrow="Valores"
            titulo="Mensalidade e inscrição"
            descricao="O mesmo valor para infantil e avançado, de qualquer graduação. A diferença entre as turmas é o horário, não o preço."
          />

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_1.3fr]">
            <article className="card border-accent p-5">
              <p className="label">Mensalidade</p>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-sm text-muted">R$</span>
                <span className="text-5xl font-semibold tabular-nums tracking-[-0.03em] text-fg">
                  {formatarReais(VALOR_MENSALIDADE_CENTAVOS)}
                </span>
                <span className="text-sm text-muted">/mês</span>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Cobrada a partir do mês seguinte à matrícula. A semana de
                experiência não entra na conta.
              </p>
            </article>

            <article className="card p-5">
              <p className="label">Taxa de inscrição</p>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-5xl font-semibold tracking-[-0.03em] text-fg">
                  Isenta
                </span>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Não cobramos adesão, matrícula nem taxa de exame. O que você
                paga é a mensalidade, e só.
              </p>
            </article>

            <article className="card">
              <div className="border-b border-line px-4 py-2.5">
                <h3 className="heading-md">O que está incluso</h3>
              </div>
              <ul className="space-y-2 p-4">
                {INCLUSO.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs leading-relaxed text-fg/85"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </section>

        {/* Formas de pagamento */}
        <section className="faixa-destacada py-12">
          <div className="section">
            <SectionHeading
              eyebrow="Pagamento"
              titulo="Como você pode pagar"
              descricao="Três caminhos, todos com o registro aparecendo no seu portal. Você acompanha o que foi pago e o que está em aberto sem precisar perguntar a ninguém."
            />

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {PAGAMENTOS.map((forma) => (
                <article key={forma.nome} className="card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="heading-md">{forma.nome}</h3>
                    <Badge>{forma.prazo}</Badge>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    {forma.texto}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Turmas e horários */}
        <section className="section py-12">
          <SectionHeading
            eyebrow="Horários"
            titulo="Em qual turma você entra"
            descricao="A divisão formal é por nível e faixa; na prática, a idade é o critério do dia a dia."
          />

          <div className="card mt-4">
            <ul className="divide-y divide-line">
              {turmas.map((turma) => (
                <li key={turma.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-fg">
                      Turma {turma.nome}
                    </span>
                    <Badge>{turma.faixa_etaria}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {turma.dias_semana} · {turma.horario.slice(0, 5)} às{" "}
                    {(turma.hora_fim ?? "").slice(0, 5)}
                  </p>
                  <p className="mt-0.5 text-2xs text-subtle">
                    Faixas típicas: {turma.faixas_tipicas}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-center text-xs text-muted">
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

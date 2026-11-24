import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { noSite } from "@/lib/enderecos";
import { EfeitosLanding } from "@/components/layout/EfeitosLanding";
import { FooterLanding } from "@/components/layout/FooterLanding";
import { HeaderLanding } from "@/components/layout/HeaderLanding";
import { HeroLanding } from "@/components/layout/HeroLanding";
import { MapaAoClicar } from "@/components/layout/MapaAoClicar";
import "./landing.css";

/*
  Landing de torakandojo.com no redesign "tinta sumi". Estrutura e textos
  aprovados em DESIGN.md, seção 6, e no protótipo da home.

  Sem menção ao portal de estudos nem ao portal do aluno: o conteúdo de estudo
  é de quem já é matriculado. A única saída é "Área do aluno", no rodapé.
*/

const ENDERECO = "Rua 15 de Novembro, 1104, Olho d'Água das Flores - AL, 57442-000";

const MAPS_LINK =
  "https://www.google.com/maps/place/R.+Quinze+de+Novembro,+1104,+Olho+d'%C3%81gua+das+Flores+-+AL,+57442-000/@-9.5275156,-37.2944468,19z";

const MAPS_EMBED = `https://maps.google.com/maps?q=${encodeURIComponent(ENDERECO)}&z=17&output=embed`;

const TURMAS = [
  {
    nome: "Infantil",
    idade: "7 a 12 anos",
    dias: "Terça, quinta e sexta",
    horario: "18h30 às 19h30",
  },
  {
    nome: "Avançado",
    idade: "13 anos ou mais",
    dias: "Terça, quinta e sexta",
    horario: "19h30 às 21h",
  },
];

const INCLUSO = [
  "Turmas de no máximo 20 alunos",
  "Equipe de faixas pretas",
  "Primeira aula grátis",
];

/** Rei → Aquecimento → Kihon → Kata → Kumite → Rei. */
const AULA = [
  { marca: "礼", kanji: true, titulo: "Rei", texto: "A saudação abre o treino." },
  { marca: "02", kanji: false, titulo: "Aquecimento", texto: "Corpo pronto antes da técnica." },
  {
    marca: "基本",
    kanji: true,
    titulo: "Kihon",
    texto: "Base, socos, defesas e chutes, repetidos até virarem reflexo.",
  },
  {
    marca: "型",
    kanji: true,
    titulo: "Kata",
    texto: "Formas que guardam a técnica e a história do estilo.",
  },
  {
    marca: "組手",
    kanji: true,
    titulo: "Kumite",
    texto: "Combate com parceiro, com controle e respeito.",
  },
  { marca: "礼", kanji: true, titulo: "Rei", texto: "A saudação fecha o treino." },
];

const NUMEROS_DOJO = [
  { valor: "180 m²", rotulo: "de tatame" },
  { valor: "20", rotulo: "alunos no máximo por turma" },
  { valor: "黒帯", rotulo: "equipe de faixas pretas" },
];

/*
  Valor aprovado para a vitrine. Fica escrito aqui, e não lido de
  VALOR_MENSALIDADE_CENTAVOS, para a landing não mudar junto com um valor de
  teste no .env.
*/
const MENSALIDADE = "R$ 70";

export const metadata: Metadata = {
  // `absolute` para não ganhar o " · Torakan" do template: a home leva a
  // cidade no título, que é o que a busca local procura.
  title: {
    absolute: "Torakan — Academia de Karatê Shotokan em Olho d'Água das Flores",
  },
  description:
    "Academia Tigre de Karatê: aulas de Karatê Shotokan para crianças a partir de 7 anos e adultos, terça, quinta e sexta. Primeira aula grátis. Rua 15 de Novembro, 1104, Centro.",
  alternates: { canonical: "/" },
};

/*
  Dados estruturados (schema.org) para o Google mostrar a academia no mapa e
  na busca local: nome, endereço, coordenadas e horários. Os horários são os
  das duas turmas juntas, das 18h30 às 21h.
*/
const DADOS_ESTRUTURADOS = {
  "@context": "https://schema.org",
  "@type": "SportsActivityLocation",
  name: "Academia Tigre de Karatê",
  alternateName: "Torakan",
  description: "Dojo de Karatê Shotokan com turmas infantil e avançada.",
  url: noSite("/") || undefined,
  image: noSite("/imagens/dojo.jpg") || undefined,
  sport: "Karate",
  priceRange: MENSALIDADE,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rua 15 de Novembro, 1104",
    addressLocality: "Olho d'Água das Flores",
    addressRegion: "AL",
    postalCode: "57442-000",
    addressCountry: "BR",
  },
  geo: { "@type": "GeoCoordinates", latitude: -9.5275156, longitude: -37.2944468 },
  hasMap: MAPS_LINK,
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Thursday", "Friday"],
      opens: "18:30",
      closes: "21:00",
    },
  ],
};

export default function LandingPage() {
  return (
    <div className="landing flex min-h-screen flex-col text-fg">
      <script
        type="application/ld+json"
        // JSON montado aqui no servidor, sem nada vindo do usuário.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(DADOS_ESTRUTURADOS) }}
      />
      <HeaderLanding />
      <EfeitosLanding />

      <main className="flex-1">
        <HeroLanding />

        {/* 01 — Turmas e mensalidade */}
        <section id="turmas" className="landing-container landing-secao scroll-mt-16">
          <p className="landing-rotulo mb-5">01 — Turmas e mensalidade</p>
          <h2 className="landing-titulo mb-14 text-[clamp(36px,4.5vw,64px)] leading-[1.05]">
            Uma turma pra cada idade.
          </h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {TURMAS.map((turma) => (
              <article
                key={turma.nome}
                data-subir
                className="landing-card border border-line bg-canvas/60 p-9"
              >
                <p className="landing-rotulo tracking-[0.16em]">Turma</p>
                <h3 className="landing-titulo mb-1 mt-3 text-[40px] leading-tight">
                  {turma.nome}
                </h3>
                <p className="mb-7 text-muted">{turma.idade}</p>
                <p className="border-t border-line pt-5 leading-[1.7]">
                  {turma.dias}
                  <br />
                  {turma.horario}
                </p>
              </article>
            ))}

            {/* Mensalidade: o card invertido, com o carimbo 虎. */}
            <article
              data-subir
              className="landing-card relative bg-fg p-9 text-canvas md:col-span-2 lg:col-span-1"
            >
              <span
                aria-hidden
                className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-[10px] bg-accent-solid font-mincho text-[28px] font-extrabold text-on-accent"
              >
                虎
              </span>
              <p className="landing-rotulo tracking-[0.16em] !text-canvas/75">
                Mensalidade
              </p>
              <p className="mb-1 mt-3 whitespace-nowrap font-mincho text-[clamp(48px,4.4vw,64px)] font-extrabold leading-none">
                {MENSALIDADE}
                <span className="text-[22px]">/mês</span>
              </p>
              <ul className="mb-7 mt-6 list-disc pl-[18px] leading-[1.8]">
                {INCLUSO.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link href="/planos" className="landing-botao bg-canvas text-fg hover:bg-elevated">
                Ver planos e matrícula
              </Link>
            </article>
          </div>
        </section>

        {/* 02 — Como é a aula */}
        <section id="aula" className="landing-container landing-secao scroll-mt-16 !pt-0">
          <p className="landing-rotulo mb-5">02 — Como é a aula</p>
          <div className="grid items-start gap-14 lg:grid-cols-2">
            <div>
              <h2 className="landing-titulo mb-5 text-[clamp(36px,4.5vw,64px)] leading-[1.05]">
                Do primeiro rei ao último.
              </h2>
              <p className="mb-10 max-w-[460px] leading-relaxed text-muted">
                Toda aula passa pelos três pilares do Shotokan, com correção de
                perto do começo ao fim.
              </p>
              <div className="landing-card relative aspect-[5/4] overflow-hidden">
                <Image
                  src="/imagens/faixa.jpg"
                  alt="Karateca ajustando a faixa preta"
                  fill
                  sizes="(min-width: 1024px) 608px, 100vw"
                  data-tinta
                  className="landing-foto landing-tinta object-cover"
                />
              </div>
            </div>

            <ol className="flex flex-col">
              {AULA.map((etapa, i) => (
                <li
                  key={`${etapa.titulo}-${i}`}
                  data-subir
                  className="grid grid-cols-[72px_1fr] gap-5 border-t border-line py-6 last:border-b"
                >
                  {etapa.kanji ? (
                    <span aria-hidden className="font-mincho text-[40px] leading-none">
                      {etapa.marca}
                    </span>
                  ) : (
                    <span aria-hidden className="landing-rotulo pt-1.5 text-sm">
                      {etapa.marca}
                    </span>
                  )}
                  <div>
                    <h3 className="mb-1.5 text-xl font-bold">{etapa.titulo}</h3>
                    <p className="leading-normal text-muted">{etapa.texto}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 03 — O primeiro kata: embusen e contador ligados à rolagem. */}
        <section data-kata className="landing-kata relative border-t border-line">
          <div className="landing-kata-palco landing-container grid items-center gap-12 py-24 lg:grid-cols-2 lg:py-14">
            <div>
              <p className="landing-rotulo mb-5">03 — O primeiro kata</p>
              <h2 className="landing-titulo text-[clamp(44px,6vw,88px)] leading-none">
                Heian Shodan
              </h2>
              <p className="mt-5 max-w-[440px] leading-relaxed text-muted">
                É por ele que todo aluno começa. O embusen é o caminho que o
                corpo desenha no chão.
              </p>
              <p className="mt-10 font-mincho text-[clamp(80px,12vw,168px)] font-extrabold leading-[0.9]">
                <span aria-hidden>
                  <span data-kata-contador data-total="21" className="tabular-nums">
                    21
                  </span>
                  <span className="text-line-strong">/21</span>
                </span>
                <span className="sr-only">21 movimentos</span>
              </p>
              <p aria-hidden className="landing-rotulo mt-2">
                Movimentos
              </p>
            </div>
            <svg
              viewBox="0 0 400 400"
              role="img"
              aria-label="Embusen do Heian Shodan em forma de I"
              className="w-full max-w-[480px] justify-self-center"
            >
              <path
                d="M60 340H340M200 340V60M60 60H340"
                fill="none"
                className="stroke-line"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                data-kata-desenho
                pathLength={1}
                d="M200 340H60M60 340H340M200 340V60M200 60H60M60 60H340M200 60V340"
                fill="none"
                className="stroke-fg"
                strokeWidth="14"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1"
                strokeDashoffset="0"
              />
              {/* Marcador do embusen: o ponto de partida, em vermelho. */}
              <circle cx="200" cy="340" r="14" className="fill-accent-solid" />
            </svg>
          </div>
        </section>

        {/* O dojo */}
        <section id="dojo" className="scroll-mt-16 pb-24 lg:pb-40">
          <div className="relative h-[420px] lg:h-[600px]">
            <Image
              src="/imagens/dojo.jpg"
              alt="Karateca executando chute no dojo"
              fill
              sizes="100vw"
              data-tinta
              className="landing-foto landing-tinta object-cover"
            />
          </div>
          <div className="landing-container relative -mt-[120px] grid gap-3 sm:grid-cols-3">
            {NUMEROS_DOJO.map((numero) => (
              <div key={numero.rotulo} data-subir className="landing-card bg-elevated p-8 dark:bg-surface">
                <p className="font-mincho text-[56px] font-extrabold leading-tight">
                  {numero.valor}
                </p>
                <p className="mt-1.5 text-muted">{numero.rotulo}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 04 — Onde fica */}
        <section
          id="onde-fica"
          className="landing-container landing-secao scroll-mt-16 grid items-stretch gap-10 !pt-0 lg:grid-cols-2"
        >
          <div>
            <p className="landing-rotulo mb-5">04 — Onde fica</p>
            <h2 className="landing-titulo mb-6 text-[clamp(32px,4vw,52px)] leading-[1.05]">
              Venha conhecer o dojo.
            </h2>
            <address className="not-italic leading-[1.8] text-muted">
              Rua 15 de Novembro, 1104 · Centro
              <br />
              Olho d’Água das Flores · AL · 57442-000
              <br />
              Terça, quinta e sexta
              <br />
              Infantil 18h30–19h30 · Avançado 19h30–21h
            </address>
            <a href={MAPS_LINK} className="landing-botao landing-botao-secundario mt-7">
              Abrir no Google Maps
            </a>
          </div>
          {/* O Google só é chamado depois do clique (LGPD). */}
          <MapaAoClicar
            src={MAPS_EMBED}
            titulo="Mapa: Rua 15 de Novembro, 1104, Olho d’Água das Flores – AL"
            className="landing-card min-h-[320px] w-full border border-line"
          />
        </section>

        {/* CTA final. Por enquanto leva ao Google Maps; o canal de contato entra depois. */}
        <section
          id="contato"
          className="landing-secao relative overflow-hidden border-t border-line px-8 text-center"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mincho text-[360px] font-extrabold leading-none text-elevated dark:text-surface lg:text-[560px]"
          >
            虎
          </div>
          <div className="relative mx-auto max-w-[820px]">
            <h2 data-subir className="landing-titulo text-[clamp(44px,7vw,104px)] leading-none">
              A primeira aula é por nossa conta.
            </h2>
            <p className="mx-auto mb-10 mt-6 max-w-[520px] leading-relaxed text-muted">
              Venha conhecer o dojo, treinar uma aula completa e conversar com o
              sensei antes de decidir.
            </p>
            <a href={MAPS_LINK} className="landing-botao landing-botao-principal !px-8 !py-5">
              Ver como chegar
            </a>
          </div>
        </section>
      </main>

      <FooterLanding />
    </div>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { HeroPagina } from "@/components/layout/HeroPagina";
import {
  FaixaAoVento,
  Makiwara,
  Lanterna,
} from "@/components/animacoes/AnimacoesKarate";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Card";
import {
  dados,
  getKatas,
  getPilares,
  getTecnicas,
} from "@/services/dataService";

export const metadata: Metadata = {
  title: "Portal de Estudos",
  description:
    "Os três pilares do estudo do Karatê Shotokan: história, técnicas e fundamentos.",
};

/*
  Esta página é um índice, não um acervo.

  Antes ela exibia o próprio conteúdo — dicionário e curiosidades impressos
  aqui — e o aluno lia dois verbetes na entrada sem descobrir que existiam
  mais noventa adiante. Agora cada cartão diz o que há lá dentro e manda o
  leitor para o lugar onde aquilo mora de verdade.
*/
const PILARES_NAV = [
  {
    href: "/estudos/historia",
    kanji: "歴史",
    cena: Lanterna,
    titulo: "História",
    subtitulo: "Linhagem e Mestres",
    descricao:
      "De Okinawa aos dojos brasileiros: quem ensinou quem, e o que mudou no caminho.",
    dentro: [
      "Linha do tempo, de 1868 aos dias de hoje",
      "Três árvores de linhagem, com link para cada mestre",
      "Como o karatê chegou a Alagoas",
      "Os preceitos de Funakoshi",
    ],
  },
  {
    href: "/estudos/tecnicas",
    kanji: "技術",
    cena: Makiwara,
    titulo: "Técnicas",
    subtitulo: "Kihon e Katas",
    descricao:
      "O vocabulário e as frases: cada golpe catalogado, cada kata destrinchado movimento a movimento.",
    dentro: [
      "Socos, chutes, defesas, bases e guardas",
      "26 katas com ficha, bunkai e vídeo",
      "Sequência completa em tabela, com tradução",
      "Embusen animado, passo a passo",
    ],
  },
  {
    href: "/estudos/fundamentos",
    kanji: "基本",
    cena: FaixaAoVento,
    titulo: "Fundamentos",
    subtitulo: "Graduação e Filosofia",
    descricao:
      "O que se exige em cada faixa, e os princípios que separam o movimento correto do movimento eficaz.",
    dentro: [
      "Sistema de faixas, do 7º Kyu ao 1º Dan",
      "Dojo Kun, Niju Kun e etiqueta",
      "De onde vem cada kata",
      "Dicionário do dojo e curiosidades",
    ],
  },
];

export default function EstudosHomePage() {
  const katas = getKatas();
  const tecnicas = getTecnicas();
  const pilares = getPilares();

  const numeros = [
    { valor: String(katas.length), label: "Katas detalhados" },
    { valor: String(tecnicas.length), label: "Técnicas de kihon" },
    { valor: String(dados.mestres.length), label: "Mestres na linhagem" },
    { valor: String(dados.timeline.length), label: "Marcos históricos" },
    { valor: String(dados.graduacoes.length), label: "Graduações" },
    { valor: String(dados.principiosTecnicos.length), label: "Princípios" },
  ];

  return (
    <>
      <HeroPagina
        sobretitulo="Portal de Estudos"
        titulo="O acervo completo do Shotokan, organizado em três pilares"
        imagem="/imagens/estudos.jpg"
        opacidadeImagem={0.4}
        descricao={
          <>
            Todo o conteúdo desta área vem do acervo do dojo — {katas.length}{" "}
            katas com sequência de movimentos e bunkai, {tecnicas.length}{" "}
            técnicas de kihon e {dados.timeline.length} marcos históricos.
          </>
        }
        acao={
          <div className="flex gap-2">
            <ButtonLink href="/estudos/tecnicas">Ver katas</ButtonLink>
            <ButtonLink
              href="/estudos/historia"
              className="border border-white/35 bg-transparent text-white hover:border-white hover:bg-white/10"
            >
              História
            </ButtonLink>
          </div>
        }
      />

      <div className="section space-y-10 py-10">
      {/* Números do acervo */}
      <section className="card grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-3 lg:grid-cols-6 lg:divide-y-0">
        {numeros.map((numero) => (
          <div key={numero.label} className="px-4 py-3.5">
            <p className="text-2xl font-semibold tabular-nums tracking-[-0.02em] text-fg">
              {numero.valor}
            </p>
            <p className="mt-0.5 text-2xs uppercase tracking-[0.08em] text-muted">
              {numero.label}
            </p>
          </div>
        ))}
      </section>

      {/* Navegação pelos 3 pilares do portal */}
      <section className="grid gap-3 lg:grid-cols-3">
        {PILARES_NAV.map((pilar) => (
          <Link
            key={pilar.href}
            href={pilar.href}
            className="card card-hover group relative overflow-hidden p-4"
          >
            <span
              aria-hidden
              className="kanji-mark absolute right-3 top-2 text-4xl"
            >
              {pilar.kanji}
            </span>
            <pilar.cena className="mb-3 h-16 w-auto" />
            <h2 className="heading-md">{pilar.titulo}</h2>
            <p className="mt-0.5 text-xs font-medium text-accent">
              {pilar.subtitulo}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              {pilar.descricao}
            </p>

            <ul className="mt-3 space-y-1 border-t border-line pt-3">
              {pilar.dentro.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-2xs leading-relaxed text-fg/80"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>

            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-fg group-hover:text-accent">
              Acessar →
            </span>
          </Link>
        ))}
      </section>

      </div>

      {/* Os 3 pilares do treino — fecha a página com o porquê do método,
          depois de ter apresentado onde cada coisa mora. */}
      <section className="faixa-destacada py-12">
        <div className="section space-y-3">
        <SectionHeading
          eyebrow="Kihon · Kata · Kumite"
          titulo="Os três pilares do treino"
          descricao="Como o acervo define cada frente de trabalho e para que ela serve."
        />
        <div className="grid gap-3 lg:grid-cols-3">
          {pilares.map((pilar) => (
            <article key={pilar.nome} className="card p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="heading-md">{pilar.nome}</h3>
                <span className="font-kanji text-sm text-subtle">{pilar.kanji}</span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-accent">
                {pilar.pt}
              </p>
              <p className="mt-2 text-xs italic leading-relaxed text-muted">
                {pilar.tagline}
              </p>
              <dl className="mt-3 space-y-2 border-t border-line pt-3">
                <div>
                  <dt className="label">O que é</dt>
                  <dd className="mt-0.5 text-xs leading-relaxed text-fg/85">
                    {pilar.oque_e}
                  </dd>
                </div>
                <div>
                  <dt className="label">Para que serve</dt>
                  <dd className="mt-0.5 text-xs leading-relaxed text-muted">
                    {pilar.para_que_serve}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
        </div>
      </section>

    </>
  );
}

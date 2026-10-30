import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { HeroPagina } from "@/components/layout/HeroPagina";
import {
  Enso,
  FaixaAoVento,
  Makiwara,
  Lanterna,
} from "@/components/animacoes/AnimacoesKarate";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Card";
import { Sanfona } from "@/components/ui/Sanfona";
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
    cor: "rgb(var(--gold))",
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
    cor: "rgb(var(--accent))",
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
    cor: "rgb(var(--heading))",
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
            <ButtonLink href="/estudos/historia" variant="secondary">
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
            className="card card-hover card-faixa group relative overflow-hidden p-5"
            style={{ "--faixa-cor": pilar.cor } as React.CSSProperties}
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

      {/* Chamada para a Jornada: faixa horizontal com foto, entre o índice e os pilares. */}
      <div className="section py-10">
        <Link href="/estudos/jornada" className="cta-jornada group">
          <Image
            src="/imagens/estudos.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 1120px, 100vw"
            className="cta-jornada-foto"
          />
          <div className="cta-jornada-texto">
            <p className="eyebrow">Jornada · 旅</p>
            <h2 className="heading-lg mt-1">Estudar jogando, sem nota</h2>
            <p className="body-muted mt-1 max-w-md">
              Caminhos por tema, desafios de katas e uma coleção de selos. Errar não tira nada — é só
              tentar de novo.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-accent">
              Abrir a Jornada <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
          <Enso className="cta-jornada-enso" />
        </Link>
      </div>

      {/* Os 3 pilares do treino, em mosaico: o Kihon com a foto do dojo em
          destaque e os outros dois ao lado. "Para que serve" abre na sanfona. */}
      <section className="faixa-destacada py-12">
        <div className="section space-y-5">
          <SectionHeading
            eyebrow="Kihon · Kata · Kumite"
            titulo="Os três pilares do treino"
            descricao="Como o acervo define cada frente de trabalho e para que ela serve."
          />
          <div className="pilares-mosaico">
            {pilares.map((pilar, i) => (
              <article key={pilar.nome} className={i === 0 ? "pilar pilar-destaque" : "pilar"}>
                {i === 0 ? (
                  <div className="pilar-foto">
                    <Image src="/imagens/dojo.jpg" alt="" fill sizes="(min-width: 1024px) 560px, 100vw" />
                  </div>
                ) : null}
                <div className="pilar-corpo">
                  <span className="pilar-kanji" aria-hidden>
                    {pilar.kanji}
                  </span>
                  <h3 className="heading-lg">{pilar.nome}</h3>
                  <p className="mt-0.5 text-xs font-semibold text-accent">{pilar.pt}</p>
                  <p className="mt-2 font-display text-lg italic leading-snug text-muted">{pilar.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-fg/85">{pilar.oque_e}</p>
                  <Sanfona titulo="Para que serve" className="mt-3 shadow-none">
                    {pilar.para_que_serve}
                  </Sanfona>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

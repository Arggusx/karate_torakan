import Image from "next/image";
import Link from "next/link";
import {
  FaixaAoVento,
  Makiwara,
  Lanterna,
} from "@/components/animacoes/AnimacoesKarate";
import { HeroPagina } from "@/components/layout/HeroPagina";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/Card";
import { Sanfona } from "@/components/ui/Sanfona";
import { PREFIXO, type Idioma } from "@/i18n/idioma";
import { PILARES_TREINO_EN, TEXTOS_HOME } from "@/i18n/textos-home";
import {
  dados,
  getKatas,
  getPilares,
  getTecnicas,
} from "@/services/dataService";

/*
  Esta página é um índice, não um acervo.

  Antes ela exibia o próprio conteúdo — dicionário e curiosidades impressos
  aqui — e o aluno lia dois verbetes na entrada sem descobrir que existiam
  mais noventa adiante. Agora cada cartão diz o que há lá dentro e manda o
  leitor para o lugar onde aquilo mora de verdade.

  A mesma página serve /estudos e /en/estudos.
*/
const VISUAL = {
  "/estudos/historia": { kanji: "歴史", cena: Lanterna, cor: "rgb(var(--gold))" },
  "/estudos/tecnicas": { kanji: "技術", cena: Makiwara, cor: "rgb(var(--accent))" },
  "/estudos/fundamentos": { kanji: "基本", cena: FaixaAoVento, cor: "rgb(var(--heading))" },
} as const;

export function PaginaEstudos({ idioma = "pt" }: { idioma?: Idioma }) {
  const t = TEXTOS_HOME[idioma];
  const prefixo = PREFIXO[idioma];
  const katas = getKatas();
  const tecnicas = getTecnicas();
  const pilares = getPilares().map((pilar) =>
    idioma === "en" && PILARES_TREINO_EN[pilar.nome]
      ? { ...pilar, ...PILARES_TREINO_EN[pilar.nome] }
      : pilar,
  );

  const numeros = [
    { valor: String(katas.length), label: t.numeros.katas },
    { valor: String(tecnicas.length), label: t.numeros.tecnicas },
    { valor: String(dados.mestres.length), label: t.numeros.mestres },
    { valor: String(dados.timeline.length), label: t.numeros.marcos },
    { valor: String(dados.graduacoes.length), label: t.numeros.graduacoes },
    { valor: String(dados.principiosTecnicos.length), label: t.numeros.principios },
  ];

  return (
    <>
      <HeroPagina
        sobretitulo={t.sobretitulo}
        titulo={t.titulo}
        imagem="/imagens/estudos.jpg"
        opacidadeImagem={0.4}
        descricao={t.descricao(katas.length, tecnicas.length, dados.timeline.length)}
        acao={
          <div className="flex gap-2">
            <ButtonLink href={`${prefixo}/estudos/tecnicas`}>{t.verKatas}</ButtonLink>
            <ButtonLink href={`${prefixo}/estudos/historia`} variant="secondary">
              {t.historia}
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
          {t.pilaresNav.map((pilar) => {
            const visual = VISUAL[pilar.caminho];
            return (
              <Link
                key={pilar.caminho}
                href={`${prefixo}${pilar.caminho}`}
                className="card card-hover card-faixa group relative overflow-hidden p-5"
                style={{ "--faixa-cor": visual.cor } as React.CSSProperties}
              >
                <span aria-hidden className="kanji-mark absolute right-3 top-2 text-4xl">
                  {visual.kanji}
                </span>
                <visual.cena className="mb-3 h-16 w-auto" />
                <h2 className="heading-md">{pilar.titulo}</h2>
                <p className="mt-0.5 text-xs font-medium text-accent">{pilar.subtitulo}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">{pilar.descricao}</p>

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
                  {t.acessar}
                </span>
              </Link>
            );
          })}
        </section>
      </div>

      {/* Os 3 pilares do treino, em mosaico: o Kihon com a foto do dojo em
          destaque e os outros dois ao lado. "Para que serve" abre na sanfona. */}
      <section className="faixa-destacada py-12">
        <div className="section space-y-5">
          <SectionHeading
            eyebrow={t.pilaresSobretitulo}
            titulo={t.pilaresTitulo}
            descricao={t.pilaresDescricao}
          />
          <div className="pilares-mosaico">
            {pilares.map((pilar, i) => (
              <article
                key={pilar.nome}
                className={i === 0 ? "pilar pilar-destaque" : "pilar"}
                data-inclinar={i === 0 ? "4" : undefined}
              >
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
                  <Sanfona titulo={t.paraQueServe} className="mt-3 shadow-none">
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

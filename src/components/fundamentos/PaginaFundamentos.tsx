import { HeroPagina } from "@/components/layout/HeroPagina";
import { ConsultaDojo } from "@/components/fundamentos/ConsultaDojo";
import { OrigemDosKatas } from "@/components/fundamentos/OrigemDosKatas";
import { AbasSecao } from "@/components/ui/AbasSecao";
import { Obi } from "@/components/ui/Obi";
import { Sanfona } from "@/components/ui/Sanfona";
import { VerMais } from "@/components/ui/VerMais";
import { fundamentosNoIdioma } from "@/i18n/fundamentos";
import type { Idioma } from "@/i18n/idioma";
import { TEXTOS_FUNDAMENTOS } from "@/i18n/textos-fundamentos";

/*
  Fundamentos era uma "gaveta": quatro seções empilhadas numa página longa.
  Agora cada uma é um tópico (abas em pílula, como no Oratio) e cada tópico
  tem um desenho próprio — trilha de faixas, painel do Dojo Kun, árvore dos
  katas e uma consulta em sanfonas — para a leitura não cansar.

  A mesma página serve /estudos/fundamentos e /en/estudos/fundamentos.
*/
export function PaginaFundamentos({ idioma = "pt" }: { idioma?: Idioma }) {
  const t = TEXTOS_FUNDAMENTOS[idioma];
  const {
    graduacoes,
    dojoKun,
    nijuKun,
    principios,
    etiqueta,
    origemDosKatas,
    dicionario,
    curiosidades,
    linhagens,
    origemKatas,
  } = fundamentosNoIdioma(idioma);

  const faixas = (
    <div className="grid gap-6">
      {/* Abertura: as oito faixas lado a lado, como penduradas no dojo. */}
      <section className="fund-varal">
        <div className="max-w-md">
          <p className="eyebrow">{t.faixasSobretitulo}</p>
          <h2 className="heading-lg mt-1">{t.faixasTitulo}</h2>
          <p className="body-muted mt-2">{t.faixasTexto}</p>
        </div>
        <ul className="fund-varal-faixas" aria-label={t.ordemFaixas}>
          {graduacoes.map((g, i) => (
            <li key={g.id} style={{ "--i": i } as React.CSSProperties}>
              <Obi cor={g.cor} dan={g.grau.toLowerCase().includes("dan")} className="w-full" />
              <span>{g.faixa}</span>
            </li>
          ))}
        </ul>
      </section>

      <ol className="fund-trilha">
        {graduacoes.map((faixa, i) => (
          <li
            key={faixa.id}
            className="fund-trilha-item"
            style={{ "--faixa-cor": faixa.cor } as React.CSSProperties}
          >
            <span className="fund-trilha-marco" aria-hidden>
              {i + 1}
            </span>
            <article className="card card-hover card-faixa p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-2xs font-bold uppercase tracking-[0.12em] text-accent">{faixa.grau}</p>
                  <h3 className="heading-md mt-0.5">
                    {t.faixa(faixa.faixa)}
                    <span className="ml-2 font-kanji text-base font-normal text-subtle">{faixa.jp}</span>
                  </h3>
                </div>
                <Obi cor={faixa.cor} dan={faixa.grau.toLowerCase().includes("dan")} className="w-20 shrink-0" />
              </div>
              <p className="mt-2 text-sm italic text-muted">{faixa.txt}</p>
              {faixa.significado?.length ? (
                <Sanfona titulo={t.significadoCor} className="mt-3">
                  <div className="grid gap-2 text-sm text-muted">
                    {faixa.significado.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                </Sanfona>
              ) : null}
              <dl className="mt-3 grid gap-2 border-t border-line pt-3 text-xs">
                <div className="flex gap-2">
                  <dt className="w-12 shrink-0 text-subtle">{t.tempo}</dt>
                  <dd className="text-muted">{faixa.tempoMinimo}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-12 shrink-0 text-subtle">Katas</dt>
                  <dd className="flex flex-wrap gap-1">
                    {faixa.katasExigidos.length ? (
                      faixa.katasExigidos.map((k) => (
                        <span key={k} className="chip">
                          {k}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-12 shrink-0 text-subtle">Kihon</dt>
                  <dd className="text-muted">{faixa.kihonExigido.join(" · ") || "—"}</dd>
                </div>
              </dl>
            </article>
          </li>
        ))}
      </ol>
    </div>
  );

  const filosofia = (
    <div className="grid gap-6">
      {/* Dojo Kun em destaque: é o que se recita no fim de toda aula. */}
      <section className="fund-dojokun">
        <span className="fund-dojokun-kanji" aria-hidden>
          道場訓
        </span>
        <div className="relative">
          <p className="eyebrow">{t.dojoKunSobretitulo}</p>
          <h2 className="heading-lg mt-1">{t.dojoKunTitulo(dojoKun.length)}</h2>
        </div>
        <ol className="relative mt-5 grid gap-3">
          {dojoKun.map((lema, index) => (
            <li key={lema.romaji} className="fund-dojokun-lema">
              <span className="fund-dojokun-num">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p className="font-display text-xl font-semibold leading-tight text-heading">{lema.pt}</p>
                <p className="mt-1 text-2xs text-subtle">
                  {lema.romaji} · <span className="font-kanji">{lema.jp}</span>
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted">{lema.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Etiqueta: três cartões com o kanji grande como ilustração. */}
      <section>
        <p className="eyebrow">{t.etiquetaSobretitulo}</p>
        <h2 className="heading-lg mt-1">{t.etiquetaTitulo}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {etiqueta.map((item) => (
            <article key={item.nome} className="card card-hover overflow-hidden">
              <div className="fund-etiqueta-topo">
                <span className="font-kanji">{item.kanji}</span>
              </div>
              <div className="p-4">
                <h3 className="heading-md">{item.nome}</h3>
                <p className="mt-0.5 text-xs font-semibold text-accent">{item.traducao}</p>
                <p className="mt-2 text-xs leading-relaxed text-fg/85">{item.oque_e}</p>
                {(item.detalhes ?? []).length > 0 ? (
                  <Sanfona titulo={t.detalhes} className="mt-3 shadow-none">
                    <p>{item.para_que_serve}</p>
                    <dl className="mt-2 space-y-2">
                      {(item.detalhes ?? []).map((detalhe) => (
                        <div key={detalhe.titulo}>
                          <dt className="font-semibold text-fg">{detalhe.titulo}</dt>
                          <dd>{detalhe.desc}</dd>
                        </div>
                      ))}
                    </dl>
                  </Sanfona>
                ) : (
                  <p className="mt-2 text-xs leading-relaxed text-muted">{item.para_que_serve}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Princípios técnicos em sanfona: o nome à vista, a explicação ao abrir. */}
        <section>
          <p className="eyebrow">{t.principiosSobretitulo}</p>
          <h2 className="heading-lg mt-1">{t.principiosTitulo}</h2>
          <div className="mt-4">
            <VerMais inicial={5} rotulo={t.verMaisPrincipios} rotuloMenos={t.verMenos}>
              {principios.map((p) => (
                <Sanfona
                  key={p.n}
                  sobretitulo={p.traducao}
                  titulo={p.n}
                  lateral={<span className="font-kanji">{p.k}</span>}
                >
                  <p className="text-fg/85">{p.oque_e}</p>
                  <p className="mt-2">{p.para_que_serve}</p>
                </Sanfona>
              ))}
            </VerMais>
          </div>
        </section>

        {/* Niju Kun como um pergaminho numerado. */}
        <section className="fund-pergaminho">
          <p className="eyebrow">Niju Kun</p>
          <h2 className="heading-lg mt-1">{t.nijuKunTitulo}</h2>
          <VerMais
            inicial={6}
            como="ol"
            className="mt-4 grid gap-2.5"
            rotulo={t.verTodos}
            rotuloMenos={t.verMenos}
          >
            {nijuKun.map((principio, i) => (
              <li key={principio} className="flex gap-3 text-sm leading-relaxed text-fg/85">
                <span className="mt-0.5 font-display text-lg font-semibold leading-none text-accent">{i + 1}</span>
                {/* O acervo já traz "1. " no texto; o número fica só no destaque. */}
                {principio.replace(/^\s*\d+\.\s*/, "")}
              </li>
            ))}
          </VerMais>
        </section>
      </div>
    </div>
  );

  const origem = (
    <div className="grid gap-4">
      <div className="max-w-2xl">
        <p className="eyebrow">{t.origemSobretitulo}</p>
        <h2 className="heading-lg mt-1">{t.origemTitulo}</h2>
        <p className="body-muted mt-2">{t.origemTexto}</p>
      </div>
      <OrigemDosKatas
        dados={origemDosKatas}
        linhagens={linhagens}
        origemKatas={origemKatas}
        idioma={idioma}
      />
    </div>
  );

  const consulta = (
    <div className="grid gap-6 lg:grid-cols-[1fr_17rem]">
      <ConsultaDojo dicionario={dicionario} curiosidades={curiosidades} idioma={idioma} />
      <aside className="fund-consulta-lado">
        <span className="block font-kanji text-5xl text-accent" aria-hidden>
          辞
        </span>
        <p className="eyebrow mt-3">{t.consultaSobretitulo}</p>
        <h2 className="heading-md mt-1">{t.consultaTitulo}</h2>
        <p className="body-muted mt-2 text-xs">{t.consultaTexto(dicionario.length, curiosidades.length)}</p>
      </aside>
    </div>
  );

  return (
    <>
      <HeroPagina
        sobretitulo={t.heroSobretitulo}
        titulo={t.heroTitulo}
        descricao={t.heroDescricao}
        imagem="/imagens/faixa.jpg"
        opacidadeImagem={0.8}
        kanji="基本"
      />

      <div className="section py-10">
        <AbasSecao
          rotulo={t.rotuloAbas}
          abas={[
            { id: "faixas", label: t.abaFaixas, conteudo: faixas },
            { id: "filosofia", label: t.abaFilosofia, conteudo: filosofia },
            { id: "origem", label: t.abaOrigem, conteudo: origem },
            { id: "consulta", label: t.abaDicionario, conteudo: consulta },
          ]}
        />
      </div>
    </>
  );
}

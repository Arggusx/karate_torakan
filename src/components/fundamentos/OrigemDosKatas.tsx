import Link from "next/link";
import { DossieKatas } from "@/components/fundamentos/DossieKatas";
import type { LINHAGENS, OrigemKata } from "@/data/origemKatas";
import { rotaKata, type Idioma } from "@/i18n/idioma";
import { katasNoIdioma } from "@/i18n/katas";
import { TEXTOS_FUNDAMENTOS } from "@/i18n/textos-fundamentos";
import type { OrigemDosKatas as Dados } from "@/types";

/**
 * A origem dos katas em três partes, porque são duas perguntas diferentes:
 *
 * 1. De onde cada kata veio — as três escolas de Okinawa (Shuri, Tomari e
 *    Naha), o nome antigo e a história. É a parte histórica.
 * 2. Em que ordem se aprende — o quadro da ISO, que liga cada kata básico ao
 *    avançado que ele prepara. É um caminho de ensino, não uma árvore
 *    genealógica: antes os dois apareciam misturados e a página confundia.
 * 3. O dossiê de cada kata, para ler com calma.
 *
 * Escolas e histórias chegam já no idioma da página (src/i18n/fundamentos.ts).
 */
export function OrigemDosKatas({
  dados,
  linhagens,
  origemKatas,
  idioma = "pt",
}: {
  dados: Dados;
  linhagens: typeof LINHAGENS;
  origemKatas: OrigemKata[];
  idioma?: Idioma;
}) {
  const t = TEXTOS_FUNDAMENTOS[idioma];
  const katas = katasNoIdioma(idioma);
  const idDe = new Map(katas.map((k) => [k.nome, k.id]));
  const porLinhagem = (linhagem: string) => origemKatas.filter((o) => o.linhagem === linhagem).length;

  const bases = dados.derivados.find((d) => d.de === dados.raiz)?.para ?? [];
  const preparaPara = (nome: string) =>
    dados.derivados.filter((d) => d.de === nome).flatMap((d) => d.para);

  const LinkKata = ({ nome, className }: { nome: string; className: string }) => {
    const id = idDe.get(nome);
    return id ? (
      <Link href={rotaKata(idioma, id)} className={className}>
        {nome}
      </Link>
    ) : (
      <span className={className}>{nome}</span>
    );
  };

  return (
    <div className="grid gap-8">
      {/* 1. As escolas */}
      <section>
        <p className="eyebrow">{t.escolasSobretitulo}</p>
        <h3 className="heading-lg mt-1">{t.escolasTitulo}</h3>
        <p className="body-muted mt-2 max-w-2xl">{t.escolasTexto}</p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {linhagens.map((l) => (
            <article key={l.id} className="origem-escola">
              <span className="origem-escola-kanji" aria-hidden>
                {l.kanji}
              </span>
              <p className="text-2xs font-bold uppercase tracking-[0.14em] text-accent">{l.lugar}</p>
              <h4 className="heading-md mt-1">{l.id}</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted">{l.resumo}</p>
              <p className="mt-3 text-2xs font-semibold text-fg">{t.dosKatas(porLinhagem(l.id))}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 2. O caminho de ensino */}
      <section className="origem-caminho">
        <p className="eyebrow">{t.caminhoSobretitulo}</p>
        <h3 className="heading-lg mt-1">{t.caminhoTitulo}</h3>
        <p className="body-muted mt-2 max-w-2xl">{t.caminhoTexto(dados.raiz)}</p>

        <div className="origem-fluxo">
          <div className="origem-raiz">
            <span className="text-2xs font-bold uppercase tracking-[0.14em] text-accent">{t.kataDeOrigem}</span>
            <LinkKata nome={dados.raiz} className="origem-pilula origem-pilula-raiz" />
          </div>

          <ol className="origem-linhas">
            {bases.map((base) => {
              const avancados = preparaPara(base);
              return (
                <li key={base}>
                  <LinkKata nome={base} className="origem-pilula origem-pilula-base" />
                  <span className="origem-seta" aria-hidden>
                    <span>{t.prepara}</span>
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {avancados.length ? (
                      avancados.map((a) => (
                        <LinkKata key={a} nome={a} className="origem-pilula origem-pilula-avancado" />
                      ))
                    ) : (
                      <span className="text-2xs text-subtle">—</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <p className="mt-4 text-2xs leading-relaxed text-subtle">
          {t.notaJion} {dados.fonte.titulo} — {dados.fonte.entidade}, {dados.fonte.ano}. {dados.fonte.creditos}.
        </p>
      </section>

      {/* 3. Dossiê */}
      <section>
        <p className="eyebrow">{t.dossieSobretitulo}</p>
        <h3 className="heading-lg mt-1">{t.dossieTitulo}</h3>
        <p className="body-muted mt-2 max-w-2xl">{t.dossieTexto}</p>
        <div className="mt-4">
          <DossieKatas
            idioma={idioma}
            itens={origemKatas.map((o) => ({
              ...o,
              nome: katas.find((k) => k.id === o.id)?.nome ?? o.id,
              significado: katas.find((k) => k.id === o.id)?.significadoNome ?? "",
            }))}
          />
        </div>
      </section>
    </div>
  );
}

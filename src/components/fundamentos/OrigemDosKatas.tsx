import Link from "next/link";
import { DossieKatas } from "@/components/fundamentos/DossieKatas";
import { LINHAGENS, ORIGEM_KATAS } from "@/data/origemKatas";
import { getKatas } from "@/services/dataService";
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
 */
export function OrigemDosKatas({ dados }: { dados: Dados }) {
  const katas = getKatas();
  const idDe = new Map(katas.map((k) => [k.nome, k.id]));
  const porLinhagem = (linhagem: string) => ORIGEM_KATAS.filter((o) => o.linhagem === linhagem).length;

  const bases = dados.derivados.find((d) => d.de === dados.raiz)?.para ?? [];
  const preparaPara = (nome: string) =>
    dados.derivados.filter((d) => d.de === nome).flatMap((d) => d.para);

  const LinkKata = ({ nome, className }: { nome: string; className: string }) => {
    const id = idDe.get(nome);
    return id ? (
      <Link href={`/estudos/tecnicas/kata/${id}`} className={className}>
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
        <p className="eyebrow">1 · De onde vieram</p>
        <h3 className="heading-lg mt-1">Três escolas de Okinawa</h3>
        <p className="body-muted mt-2 max-w-2xl">
          Antes de existir “Shotokan”, cada cidade de Okinawa guardava seus katas. Funakoshi reuniu o que
          aprendeu e, ao levar tudo para o Japão nos anos 1920 e 1930, trocou muitos nomes chineses por
          nomes japoneses — o Pinan virou Heian, o Kusanku virou Kanku.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {LINHAGENS.map((l) => (
            <article key={l.id} className="origem-escola">
              <span className="origem-escola-kanji" aria-hidden>
                {l.kanji}
              </span>
              <p className="text-2xs font-bold uppercase tracking-[0.14em] text-accent">{l.lugar}</p>
              <h4 className="heading-md mt-1">{l.id}</h4>
              <p className="mt-2 text-xs leading-relaxed text-muted">{l.resumo}</p>
              <p className="mt-3 text-2xs font-semibold text-fg">
                {porLinhagem(l.id)} dos 26 katas
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* 2. O caminho de ensino */}
      <section className="origem-caminho">
        <p className="eyebrow">2 · Em que ordem se aprende</p>
        <h3 className="heading-lg mt-1">O caminho de aprendizado</h3>
        <p className="body-muted mt-2 max-w-2xl">
          Itosu desmontou o <strong>{dados.raiz}</strong> em katas menores para ensinar crianças: os Heian
          e o Tekki Shodan. Cada um deles treina o que um kata avançado vai exigir depois. Leia cada linha
          como “quem domina este, está pronto para aquele”.
        </p>

        <div className="origem-fluxo">
          <div className="origem-raiz">
            <span className="text-2xs font-bold uppercase tracking-[0.14em] text-accent">Kata de origem</span>
            <LinkKata nome={dados.raiz} className="origem-pilula origem-pilula-raiz" />
          </div>

          <ol className="origem-linhas">
            {bases.map((base) => {
              const avancados = preparaPara(base);
              return (
                <li key={base}>
                  <LinkKata nome={base} className="origem-pilula origem-pilula-base" />
                  <span className="origem-seta" aria-hidden>
                    <span>prepara</span>
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
          O Jion aparece duas vezes porque o cartaz o liga ao Heian Shodan e ao Tekki Shodan. Fonte:{" "}
          {dados.fonte.titulo} — {dados.fonte.entidade}, {dados.fonte.ano}. {dados.fonte.creditos}.
        </p>
      </section>

      {/* 3. Dossiê */}
      <section>
        <p className="eyebrow">3 · Kata por kata</p>
        <h3 className="heading-lg mt-1">A história de cada um</h3>
        <p className="body-muted mt-2 max-w-2xl">
          O nome antigo, quem trouxe ou criou e o que se sabe — e, onde a tradição diverge, o texto avisa.
        </p>
        <div className="mt-4">
          <DossieKatas
            itens={ORIGEM_KATAS.map((o) => ({
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

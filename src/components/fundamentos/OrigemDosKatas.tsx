import Link from "next/link";
import { getKatas } from "@/services/dataService";
import type { OrigemDosKatas as Dados } from "@/types";

/**
 * De qual kata cada kata saiu.
 *
 * O Shotokan não tem 26 formas independentes: quase tudo desce do Kanku Dai,
 * que foi destrinchado por Itosu nos Heian para virar material de ensino. Ver
 * isso desenhado muda como o aluno lê o próprio programa — o Heian Nidan
 * deixa de ser "o segundo kata" e vira o rascunho do Bassai Dai.
 *
 * O grafo é raso de propósito: duas gerações. Passar disso vira árvore
 * genealógica, e já existe uma dessas na página de História.
 */
export function OrigemDosKatas({ dados }: { dados: Dados }) {
  const katas = getKatas();
  const idDe = new Map(katas.map((k) => [k.nome, k.id]));

  const daRaiz = dados.derivados.find((d) => d.de === dados.raiz);
  const filhos = daRaiz?.para ?? [];

  /** O que sai de um kata da segunda geração. */
  function derivadosDe(nome: string) {
    return dados.derivados
      .filter((d) => d.de === nome)
      .flatMap((d) => d.para);
  }

  function Chip({ nome, tom }: { nome: string; tom: "raiz" | "meio" | "folha" }) {
    const estilo =
      tom === "raiz"
        ? "border-accent/50 bg-accent/10 text-fg font-semibold"
        : tom === "meio"
          ? "border-gold/45 bg-gold/10 text-fg font-medium"
          : "border-line bg-elevated text-fg/85";

    const id = idDe.get(nome);
    const conteudo = (
      <span
        className={`inline-block rounded-md border px-2.5 py-1 text-xs transition-colors ${estilo}`}
      >
        {nome}
      </span>
    );

    return id ? (
      <Link href={`/estudos/tecnicas/kata/${id}`} className="hover:opacity-80">
        {conteudo}
      </Link>
    ) : (
      conteudo
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <h3 className="heading-md">De onde vem cada kata</h3>
        <span className="text-2xs text-subtle">{dados.fonte.entidade}</span>
      </div>

      <p className="border-b border-line px-4 py-3 text-xs leading-relaxed text-muted">
        {dados.nota}
      </p>

      <div className="p-4">
        {/* Raiz */}
        <div className="flex items-center gap-3">
          <Chip nome={dados.raiz} tom="raiz" />
          <span className="text-2xs uppercase tracking-[0.08em] text-subtle">
            kata de origem
          </span>
        </div>

        {/* Segunda geração e o que sai dela. */}
        <ul className="mt-3 space-y-2 border-l border-line-strong pl-4">
          {filhos.map((filho) => {
            const netos = derivadosDe(filho);
            return (
              <li
                key={filho}
                className="flex flex-wrap items-center gap-x-2 gap-y-1.5"
              >
                <Chip nome={filho} tom="meio" />
                {netos.length ? (
                  <>
                    <span aria-hidden className="text-subtle">
                      →
                    </span>
                    {netos.map((neto) => (
                      <Chip key={neto} nome={neto} tom="folha" />
                    ))}
                  </>
                ) : null}
              </li>
            );
          })}
        </ul>

        {/*
          Jion aparece duas vezes acima, saindo do Heian Shodan e do Tekki
          Shodan. Não é engano do desenho: o cartaz liga os dois a ele.
        */}
        <p className="mt-4 border-t border-line pt-3 text-2xs leading-relaxed text-subtle">
          Fonte: {dados.fonte.titulo} — {dados.fonte.entidade}, {dados.fonte.ano}.{" "}
          {dados.fonte.creditos}.
        </p>
      </div>
    </div>
  );
}

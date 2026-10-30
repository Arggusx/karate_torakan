import Link from "next/link";
import { BokkenChoque, FaixaAoVento, Makiwara } from "@/components/animacoes/AnimacoesKarate";
import { CartazNumeros } from "@/components/ui/CartazNumeros";
import type { KataCompleto } from "@/types";

/** A abertura de Técnicas: o cartaz com 技 e os três números da página. */
export function AberturaTecnicas({
  tecnicas,
  katas,
  familias,
}: {
  tecnicas: number;
  katas: number;
  familias: number;
}) {
  return (
    <CartazNumeros
      kanji="技"
      foto="/imagens/dojo.jpg"
      sobretitulo="Waza · técnica"
      frase="Mil repetições para uma técnica que sai sem pensar."
      numeros={[
        { valor: tecnicas, rotulo: "técnicas de kihon", Arte: Makiwara },
        { valor: katas, rotulo: "katas com ficha", Arte: FaixaAoVento },
        { valor: familias, rotulo: "famílias de técnica", Arte: BokkenChoque },
      ]}
    />
  );
}

/** Kanji dos katas que o acervo deixou sem (a série Gojushiho). */
const KANJI_FALTANDO: Record<string, string> = {
  "gojushiho-dai": "五十四歩大",
  "gojushiho-sho": "五十四歩小",
};

/** Vitrine de katas: cartões mínimos que inclinam em 3D, rolando para o lado. */
export function VitrineKatas({ katas, titulo = "Vitrine" }: { katas: KataCompleto[]; titulo?: string }) {
  if (katas.length === 0) return null;
  return (
    <section>
      <div className="mb-2 flex items-end justify-between gap-2">
        <h3 className="heading-md">{titulo}</h3>
        <span className="text-2xs text-subtle">arraste para o lado →</span>
      </div>
      <ul className="vitrine-katas">
        {katas.map((kata) => {
          const kanji = kata.kanji || KANJI_FALTANDO[kata.id] || kata.nome.charAt(0);
          return (
          <li key={kata.id}>
            <Link
              href={`/estudos/tecnicas/kata/${kata.id}`}
              className="kata-mini"
              data-inclinar="10"
              style={{ "--faixa-cor": kata.corFaixa, "--kanji-len": kanji.length } as React.CSSProperties}
            >
              {/* Uma linha só: a fonte encolhe para caber kanjis longos (五十四歩大). */}
              <span className="kata-mini-kanji flutua" aria-hidden>
                {kanji}
              </span>
              <span className="kata-mini-nome flutua">{kata.nome}</span>
              <span className="kata-mini-info">
                {kata.quantidadeMovimentos} mov. · {kata.significadoNome}
              </span>
            </Link>
          </li>
          );
        })}
      </ul>
    </section>
  );
}

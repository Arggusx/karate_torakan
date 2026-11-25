import Link from "next/link";
import { BokkenChoque, FaixaAoVento, Makiwara } from "@/components/animacoes/AnimacoesKarate";
import { CartazNumeros } from "@/components/ui/CartazNumeros";
import { rotaKata, type Idioma } from "@/i18n/idioma";
import { TEXTOS_TECNICAS } from "@/i18n/textos-tecnicas";
import type { KataCompleto } from "@/types";

/** A abertura de Técnicas: o cartaz com 技 e os três números da página. */
export function AberturaTecnicas({
  tecnicas,
  katas,
  familias,
  idioma = "pt",
}: {
  tecnicas: number;
  katas: number;
  familias: number;
  idioma?: Idioma;
}) {
  const t = TEXTOS_TECNICAS[idioma];
  return (
    <CartazNumeros
      kanji="技"
      foto="/imagens/dojo.jpg"
      sobretitulo={t.cartazSobretitulo}
      frase={t.cartazFrase}
      numeros={[
        { valor: tecnicas, rotulo: t.cartazTecnicas, Arte: Makiwara },
        { valor: katas, rotulo: t.cartazKatas, Arte: FaixaAoVento },
        { valor: familias, rotulo: t.cartazFamilias, Arte: BokkenChoque },
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
export function VitrineKatas({
  katas,
  titulo,
  idioma = "pt",
}: {
  katas: KataCompleto[];
  titulo?: string;
  idioma?: Idioma;
}) {
  const t = TEXTOS_TECNICAS[idioma];
  if (katas.length === 0) return null;
  return (
    <section>
      <div className="mb-2 flex items-end justify-between gap-2">
        <h3 className="heading-md">{titulo ?? t.vitrine}</h3>
        <span className="text-2xs text-subtle">{t.arraste}</span>
      </div>
      <ul className="vitrine-katas">
        {katas.map((kata) => {
          const kanji = kata.kanji || KANJI_FALTANDO[kata.id] || kata.nome.charAt(0);
          return (
          <li key={kata.id}>
            <Link
              href={rotaKata(idioma, kata.id)}
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
                {kata.quantidadeMovimentos} {t.mov} · {kata.significadoNome}
              </span>
            </Link>
          </li>
          );
        })}
      </ul>
    </section>
  );
}

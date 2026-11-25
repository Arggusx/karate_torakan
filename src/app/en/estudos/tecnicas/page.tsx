import type { Metadata } from "next";
import Link from "next/link";
import { rotaKata } from "@/i18n/idioma";
import { katasNoIdioma } from "@/i18n/katas";
import type { NivelKata } from "@/types";

export const metadata: Metadata = {
  title: "The 26 Shotokan Katas",
  description:
    "All 26 Shotokan katas with the full sequence of moves, bunkai, kiai points, embusen and the meaning of each name.",
  alternates: {
    canonical: "/en/estudos/tecnicas",
    languages: { "pt-BR": "/estudos/tecnicas", en: "/en/estudos/tecnicas" },
  },
};

const GRUPOS: { nivel: NivelKata; titulo: string; texto: string }[] = [
  {
    nivel: "basico",
    titulo: "Fundamental katas",
    texto: "The Heian series and Tekki Shodan: the base every student builds on.",
  },
  {
    nivel: "intermediario",
    titulo: "Intermediate katas",
    texto: "Longer forms that add rhythm changes, jumps and new stances.",
  },
  {
    nivel: "avancado",
    titulo: "Advanced katas",
    texto: "Black-belt forms, each with its own character and applications.",
  },
];

/** A série Gojushiho não tem kanji no acervo. */
const KANJI_FALTANDO: Record<string, string> = {
  "gojushiho-dai": "五十四歩大",
  "gojushiho-sho": "五十四歩小",
};

export default function KatasEnPage() {
  const katas = katasNoIdioma("en");

  return (
    <div className="section space-y-10 pt-10">
      <header className="max-w-2xl">
        <p className="eyebrow">Kata · 型</p>
        <h1 className="heading-xl mt-1.5">The 26 Shotokan katas</h1>
        <p className="body-muted mt-3">
          Each kata page has the full sequence of moves, the kiai points, practical applications
          (bunkai), the demonstration video and, where the source allows, an animated embusen. Where
          schools count a kata differently, the page says so instead of picking one number.
        </p>
      </header>

      {GRUPOS.map((grupo) => {
        const doGrupo = katas.filter((kata) => kata.nivel === grupo.nivel);
        if (doGrupo.length === 0) return null;
        return (
          <section key={grupo.nivel}>
            <h2 className="heading-lg">{grupo.titulo}</h2>
            <p className="body-muted mt-1 text-sm">{grupo.texto}</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {doGrupo.map((kata) => (
                <li key={kata.id}>
                  <Link
                    href={rotaKata("en", kata.id)}
                    className="card card-hover card-faixa flex h-full flex-col p-4"
                    style={{ "--faixa-cor": kata.corFaixa } as React.CSSProperties}
                  >
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="heading-md">{kata.nome}</span>
                      <span className="font-kanji text-sm text-subtle">
                        {kata.kanji || KANJI_FALTANDO[kata.id] || ""}
                      </span>
                    </span>
                    <span className="mt-0.5 text-xs font-medium text-accent">
                      {kata.significadoNome}
                    </span>
                    <span className="mt-2 text-2xs text-muted">
                      {kata.quantidadeMovimentos} moves · {kata.faixaRecomendada}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

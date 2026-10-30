import Image from "next/image";
import type { Mestre } from "@/types";

/**
 * Fotos dos mestres em /public/imagens/mestres/<arquivo>. Só entram fotos com
 * direito de uso (domínio público ou licença); quem não tem foto aparece
 * com um selo (hanko) com o primeiro kanji do sobrenome.
 */
const FOTOS: Record<string, { arquivo: string; credito: string }> = {};

const slug = (nome: string) =>
  nome
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

/** O selo vermelho dos documentos japoneses, com o kanji do sobrenome. */
function Hanko({ kanji }: { kanji: string }) {
  return (
    <svg viewBox="0 0 100 100" className="mestre-hanko" aria-hidden>
      <circle cx="50" cy="50" r="44" className="mestre-hanko-anel" />
      <rect x="24" y="24" width="52" height="52" rx="6" className="mestre-hanko-selo" />
      <text x="50" y="52" textAnchor="middle" dominantBaseline="central" className="mestre-hanko-kanji">
        {kanji}
      </text>
    </svg>
  );
}

export function FichasMestres({ mestres }: { mestres: Mestre[] }) {
  return (
    <div className="mestres-grade">
      {mestres.map((mestre, i) => {
        const foto = FOTOS[slug(mestre.nome)];
        const primeiroKanji = mestre.kanji.trim().charAt(0);
        return (
          <article
            key={mestre.nome}
            className={i === 0 ? "mestre mestre-destaque" : "mestre"}
            data-inclinar={i === 0 ? "4" : undefined}
          >
            <div className="mestre-retrato">
              {foto ? (
                <Image
                  src={`/imagens/mestres/${foto.arquivo}`}
                  alt={`Retrato de ${mestre.nome}`}
                  fill
                  sizes="(min-width: 768px) 240px, 40vw"
                />
              ) : (
                <Hanko kanji={primeiroKanji} />
              )}
            </div>
            <div className="mestre-texto">
              <p className="text-2xs font-bold uppercase tracking-[0.14em] text-accent">{mestre.anos}</p>
              <h3 className="heading-md mt-0.5">{mestre.nome}</h3>
              <p className="font-kanji text-sm text-subtle">{mestre.kanji}</p>
              <p className="mt-2 text-xs leading-relaxed text-fg/85">{mestre.text}</p>
              {foto ? <p className="mt-2 text-[10px] text-subtle">Foto: {foto.credito}</p> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

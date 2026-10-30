import Link from "next/link";
import type { ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { HeaderLanding } from "@/components/layout/HeaderLanding";
import { HeroPagina } from "@/components/layout/HeroPagina";

/**
 * Contato do responsável pelos dados (o "controlador" da LGPD). Enquanto não
 * houver um e-mail definido, as páginas indicam a secretaria da academia.
 */
export const CONTATO_EMAIL: string | null = null;

export const ATUALIZADO_EM = "30 de outubro de 2026";

export interface SecaoLegal {
  id: string;
  titulo: string;
  conteudo: ReactNode;
}

/** Política de privacidade e termos de uso: mesma moldura, índice ao lado. */
export function PaginaLegal({
  sobretitulo,
  titulo,
  descricao,
  secoes,
  outra,
}: {
  sobretitulo: string;
  titulo: string;
  descricao: string;
  secoes: SecaoLegal[];
  /** Link para o outro documento. */
  outra: { href: string; rotulo: string };
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderLanding />
      <main className="flex-1">
        <HeroPagina sobretitulo={sobretitulo} titulo={titulo} descricao={descricao} compacto kanji="約" />

        <div className="section grid gap-8 py-10 lg:grid-cols-[15rem_1fr]">
          <nav aria-label="Índice" className="legal-indice">
            <p className="eyebrow">Neste documento</p>
            <ol className="mt-3 grid gap-1.5">
              {secoes.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}>
                    <span>{i + 1}.</span> {s.titulo}
                  </a>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-2xs text-subtle">Atualizado em {ATUALIZADO_EM}.</p>
            <Link href={outra.href} className="mt-2 inline-block text-xs font-semibold text-accent hover:underline">
              {outra.rotulo} →
            </Link>
          </nav>

          <article className="legal-texto">
            {secoes.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <h2>
                  <span>{i + 1}.</span> {s.titulo}
                </h2>
                {s.conteudo}
              </section>
            ))}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/** Como falar com o responsável pelos dados. */
export function Contato() {
  return CONTATO_EMAIL ? (
    <>
      pelo e-mail <a href={`mailto:${CONTATO_EMAIL}`}>{CONTATO_EMAIL}</a> ou na secretaria da academia
    </>
  ) : (
    <>na secretaria da Academia Tigre de Karatê, pessoalmente ou com o seu professor</>
  );
}

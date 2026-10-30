import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { JOGOS, jogo } from "@/components/jornada/jogos";
import { JogoAtivo } from "@/components/jornada/JogoAtivo";
import { JogosBarra } from "@/components/jornada/JogosBarra";

export function generateStaticParams() {
  return JOGOS.map((j) => ({ jogo: j.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ jogo: string }>;
}): Promise<Metadata> {
  const j = jogo((await params).jogo);
  return j ? { title: `${j.nome} · Jornada`, description: j.resumo } : {};
}

export default async function JogoPage({
  params,
}: {
  params: Promise<{ jogo: string }>;
}) {
  const { jogo: slug } = await params;
  if (!jogo(slug)) notFound();

  return (
    <div className="section py-8">
      <JogosBarra ativo={slug} />
      {/* Os jogos leem ?id=, ?kata= e ?baralho= — useSearchParams pede Suspense. */}
      <Suspense fallback={<p className="body-muted">Carregando…</p>}>
        <JogoAtivo slug={slug} />
      </Suspense>
    </div>
  );
}

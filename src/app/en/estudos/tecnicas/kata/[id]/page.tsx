import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KataDetailView } from "@/components/tecnicas/KataDetailView";
import { kataNoIdioma, katasNoIdioma, vizinhosNoIdioma } from "@/i18n/katas";

export function generateStaticParams() {
  return katasNoIdioma("en").map((kata) => ({ id: kata.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const kata = kataNoIdioma(id, "en");
  if (!kata) return { title: "Kata not found" };

  return {
    title: { absolute: `${kata.nome} — ${kata.significadoNome} · Torakan` },
    description: kata.resumo?.text ?? `${kata.nome} kata: moves, bunkai and embusen.`,
    alternates: {
      canonical: `/en/estudos/tecnicas/kata/${kata.id}`,
      languages: {
        "pt-BR": `/estudos/tecnicas/kata/${kata.id}`,
        en: `/en/estudos/tecnicas/kata/${kata.id}`,
      },
    },
  };
}

export default async function KataEnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kata = kataNoIdioma(id, "en");
  if (!kata) notFound();

  const { anterior, proximo } = vizinhosNoIdioma(kata.id, "en");

  return (
    <div className="section pt-10">
      <KataDetailView kata={kata} anterior={anterior} proximo={proximo} idioma="en" />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KataDetailView } from "@/components/tecnicas/KataDetailView";
import { getKataPorId, getKataVizinhos, getKatas } from "@/services/dataService";

export function generateStaticParams() {
  return getKatas().map((kata) => ({ id: kata.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const kata = getKataPorId(id);

  if (!kata) return { title: "Kata não encontrado" };

  return {
    // `absolute`: o layout de técnicas define um título próprio, e com isso o
    // template " · Torakan" da raiz deixa de chegar aqui sozinho.
    title: { absolute: `${kata.nome} — ${kata.significadoNome} · Torakan` },
    description: kata.resumo?.text ?? kata.tecnicasDestaque,
    alternates: { canonical: `/estudos/tecnicas/kata/${kata.id}` },
  };
}

export default async function KataPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kata = getKataPorId(id);

  if (!kata) notFound();

  const { anterior, proximo } = getKataVizinhos(kata.id);

  return (
    <div className="section pt-10">
      <KataDetailView kata={kata} anterior={anterior} proximo={proximo} />
    </div>
  );
}

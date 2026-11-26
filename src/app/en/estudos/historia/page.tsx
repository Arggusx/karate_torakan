import type { Metadata } from "next";
import { PaginaHistoria } from "@/components/historia/PaginaHistoria";

export const metadata: Metadata = {
  title: "History",
  description:
    "Timeline of Shotokan Karate, the masters and the lineage tree from Okinawa to Japan, the world and Brazil.",
  alternates: {
    canonical: "/en/estudos/historia",
    languages: { "pt-BR": "/estudos/historia", en: "/en/estudos/historia" },
  },
};

export default function HistoriaEnPage() {
  return <PaginaHistoria idioma="en" />;
}

import type { Metadata } from "next";
// Redesign "tinta sumi" do portal (ver o arquivo).
import "../portal.css";

/** Primeiro acesso faz parte do portal: fora dos buscadores. */
export const metadata: Metadata = {
  title: "Primeiro acesso",
  robots: { index: false, follow: false },
};

export default function PrimeiroAcessoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="portal">{children}</div>;
}

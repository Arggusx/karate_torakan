import type { Metadata } from "next";

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
  return children;
}

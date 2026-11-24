import type { Metadata } from "next";
// Redesign "tinta sumi" do portal (ver o arquivo).
import "../portal.css";

/** Login faz parte do portal: fora dos buscadores, como o resto dele. */
export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className="portal">{children}</div>;
}

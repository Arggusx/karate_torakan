import Link from "next/link";
import { noPortal, noSite } from "@/lib/enderecos";

/**
 * Rodapé da landing no redesign "tinta sumi" (DESIGN.md, seção 6): marca,
 * endereço, "Área do aluno", Privacidade e Termos.
 *
 * É um componente à parte porque o Footer de sempre também aparece no
 * academy e no portal, cujos textos o redesign não muda. "Área do aluno" é o
 * único link da landing que leva para fora do site.
 */
export function FooterLanding() {
  return (
    <footer className="landing border-t border-line">
      <div className="landing-container flex flex-wrap items-center gap-x-6 gap-y-3 py-10 text-sm text-subtle">
        <span className="landing-marca text-base">Torakan</span>
        <span>
          Academia Tigre de Karatê · Rua 15 de Novembro, 1104 · Centro · Olho
          d’Água das Flores – AL
        </span>
        <span className="flex gap-5 md:ml-auto">
          <a href={noPortal("/")} className="landing-link text-muted">
            Área do aluno
          </a>
          <Link href={noSite("/privacidade")} className="landing-link text-muted">
            Privacidade
          </Link>
          <Link href={noSite("/termos")} className="landing-link text-muted">
            Termos
          </Link>
        </span>
      </div>
    </footer>
  );
}

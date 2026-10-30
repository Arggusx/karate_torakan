import Link from "next/link";
import { MarcaTorakan } from "@/components/ui/MarcaTorakan";

const COLUNAS = [
  {
    titulo: "Portal de Estudos",
    links: [
      { href: "/estudos", label: "Home dos Estudos" },
      { href: "/estudos/historia", label: "História" },
      { href: "/estudos/tecnicas", label: "Técnicas e Katas" },
      { href: "/estudos/fundamentos", label: "Fundamentos" },
    ],
  },
  {
    titulo: "Academia",
    links: [
      { href: "/#beneficios", label: "Benefícios" },
      { href: "/#dojo", label: "O Dojo" },
      { href: "/#matricula", label: "Mensalidade" },
      { href: "/login", label: "Área do aluno" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-elevated">
      <div className="section grid gap-8 py-12 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <MarcaTorakan className="h-9 w-9" />
            <span className="font-marca text-2xl leading-none text-accent">
              Torakan
              {/* O kanji sai da fonte de pincel: ela não tem glifos CJK e
                  cairia num fallback qualquer do sistema. */}
              <span className="ml-1.5 font-kanji text-sm font-normal text-subtle">
                虎館
              </span>
            </span>
          </div>
          <p className="body-muted mt-3 max-w-sm">
            Nome fantasia da{" "}
            <span className="font-semibold text-heading">Academia Tigre de Karatê</span> — dojo
            Shotokan e plataforma de estudos. Tradição de Okinawa, método
            moderno e acompanhamento contínuo do praticante.
          </p>
        </div>

        {COLUNAS.map((coluna) => (
          <div key={coluna.titulo}>
            <p className="eyebrow">
              {coluna.titulo}
            </p>
            <ul className="mt-3 space-y-2">
              {coluna.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors duration-[250ms] hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="section flex flex-col gap-2 border-t border-line py-4 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Academia Tigre de Karatê. Todos os
          direitos reservados.{" "}
          <Link href="/privacidade" className="underline-offset-2 hover:text-accent hover:underline">
            Privacidade
          </Link>{" "}
          ·{" "}
          <Link href="/termos" className="underline-offset-2 hover:text-accent hover:underline">
            Termos de uso
          </Link>
        </p>
        <p>空手に先手なし — No karatê, não existe atitude ofensiva.</p>
      </div>
    </footer>
  );
}

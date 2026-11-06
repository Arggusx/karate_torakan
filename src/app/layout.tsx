import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Inter,
  Nanum_Brush_Script,
  Yuji_Syuku,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { EfeitosGlobais } from "@/components/layout/EfeitosGlobais";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { FundoAsiatico } from "@/components/ui/FundoAsiatico";
import { ToastProvider } from "@/components/ui/Toast";
import { AcademiaProvider } from "@/lib/academiaStore";
import "./globals.css";
import "./animacoes.css";
import "./jornada.css";
import "./provas.css";
import "./componentes.css";
import "./layouts.css";
import "./efeitos.css";

/**
 * Títulos em Cormorant Garamond, o par tipográfico do Oratio: serifada de
 * livro, com contraste fino — dá aos títulos o ar de página bem diagramada.
 * Auto-hospedada pelo Next (next/font), então não depende do Google em
 * runtime, que é o equivalente ao <link> + preconnect do Oratio.
 */
const fonteDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--fonte-display",
});

/** Texto corrido e interface em Inter, de 400 a 700. */
const fonteTexto = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--fonte-texto",
});

/**
 * Pincel, exclusiva do nome da marca no cabeçalho e no rodapé.
 *
 * Um único peso e um único uso: fonte de traço assim cansa em texto corrido e
 * perde legibilidade em tamanho pequeno. Aqui ela aparece em cinco lugares, e
 * sempre na mesma palavra.
 */
const fonteMarca = Nanum_Brush_Script({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--fonte-marca",
});

/**
 * Pincel japonês, padrão de todo kanji do site.
 *
 * A fonte da marca é coreana/latina e não tem glifos CJK — usá-la num kanji
 * cairia num fallback qualquer do sistema, diferente em cada máquina. Esta
 * cobre o japonês de verdade e dá o mesmo traço de pincel da marca.
 */
const fonteKanji = Yuji_Syuku({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--fonte-kanji",
});

/** Cor da barra do navegador no celular: o creme do papel, ou o café no escuro. */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FDFBF7" },
    { media: "(prefers-color-scheme: dark)", color: "#17120F" },
  ],
};

export const metadata: Metadata = {
  title: {
    // Torakan (虎館, "casa do tigre") é a marca; o nome de registro da
    // academia acompanha no título para busca e reconhecimento formal.
    default: "Torakan — Academia Tigre de Karatê",
    template: "%s · Torakan",
  },
  description:
    "Academia Tigre de Karatê: dojo Shotokan e plataforma de estudos com história, técnicas, katas e fundamentos.",
  // Os ícones vêm de src/app/icon.png e src/app/apple-icon.png, que o Next
  // detecta e serve sozinho — por isso não há entrada `icons` aqui.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${fonteDisplay.variable} ${fonteTexto.variable} ${fonteMarca.variable} ${fonteKanji.variable}`}
    >
      <body className="min-h-screen bg-canvas text-fg">
        <ThemeProvider>
          {/* Ondas, halos e sakura: fica atrás de tudo e não recebe clique. */}
          <FundoAsiatico />
          {/* Luz nos cartões, inclinação 3D e revelação pelo mouse. */}
          <EfeitosGlobais />
          <AcademiaProvider>
            <ToastProvider>{children}</ToastProvider>
          </AcademiaProvider>
        </ThemeProvider>
        {/* Vercel Web Analytics: conta visitas e páginas vistas, sem cookies. */}
        <Analytics />
      </body>
    </html>
  );
}

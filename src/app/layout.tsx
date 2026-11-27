import type { Metadata, Viewport } from "next";
import {
  Cormorant_Garamond,
  Inter,
  JetBrains_Mono,
  Nanum_Brush_Script,
  Shippori_Mincho,
  Yuji_Syuku,
  Zen_Kaku_Gothic_New,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { EfeitosGlobais } from "@/components/layout/EfeitosGlobais";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { FundoAsiatico } from "@/components/ui/FundoAsiatico";
import { ToastProvider } from "@/components/ui/Toast";
import { AcademiaProvider } from "@/lib/academiaStore";
import { baseDa } from "@/lib/enderecos";
import "./globals.css";
import "./animacoes.css";
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
  // Fontes asiáticas (esta e as três abaixo): o Google as divide em centenas
  // de pedaços por faixa de caracteres. Com preload, o Next pedia todos
  // (488 preloads, 5 MB na home) e a foto do hero esperava na fila. Sem
  // preload, o navegador baixa só os pedaços dos caracteres que aparecem.
  preload: false,
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
  preload: false,
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--fonte-kanji",
});

/*
  Fontes do redesign "tinta sumi" (DESIGN.md, seção 4). Por enquanto só a
  landing as usa, pelas classes font-mincho, font-gotica e font-rotulo; o
  academy e o portal trocam de fonte nas fases deles.
*/

/** Títulos, nome da marca e kanji decorativo. */
const fonteMincho = Shippori_Mincho({
  preload: false,
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  display: "swap",
  variable: "--fonte-mincho",
});

/** Texto corrido e interface. */
const fonteGotica = Zen_Kaku_Gothic_New({
  preload: false,
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--fonte-gotica",
});

/** Rótulos e numeração: 12px, caixa alta, espaçado. */
const fonteMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--fonte-mono",
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
  // Base dos links absolutos (canonical, imagens de compartilhamento). O
  // academy troca pela dele em estudos/layout.tsx.
  metadataBase: baseDa("site"),
  // Sem `title` aqui de propósito: cada página herda as imagens, e quem
  // compartilha vê o título da própria página, não um genérico.
  openGraph: {
    siteName: "Torakan",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        // JPEG de 1200x630: o WhatsApp não mostra prévia de WebP em todo aparelho.
        url: "/imagens/og-dojo.jpg",
        width: 1200,
        height: 630,
        alt: "Aluno executando um chute no dojo da Academia Tigre de Karatê",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
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
      className={`${fonteDisplay.variable} ${fonteTexto.variable} ${fonteMarca.variable} ${fonteKanji.variable} ${fonteMincho.variable} ${fonteGotica.variable} ${fonteMono.variable}`}
    >
      <body className="min-h-screen bg-canvas text-fg">
        {/* Teclado e leitor de tela: o primeiro Tab pula o menu e vai ao conteúdo. */}
        <a href="#conteudo" className="pular-conteudo">
          Pular para o conteúdo
        </a>
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

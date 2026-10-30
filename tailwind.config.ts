import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Superfícies e textos vêm de CSS variables trocadas pelo tema.
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        "line-strong": "rgb(var(--line-strong) / <alpha-value>)",
        fg: "rgb(var(--fg) / <alpha-value>)",
        heading: "rgb(var(--heading) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        subtle: "rgb(var(--subtle) / <alpha-value>)",
        faixa: "rgb(var(--faixa) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",

        // Vermelho do Torakan, agora por variável: o tom muda entre os temas
        // para o texto passar no contraste AA (ver globals.css).
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          hover: "rgb(var(--accent-hover) / <alpha-value>)",
          solid: "rgb(var(--accent-solid) / <alpha-value>)",
          soft: "#EF4444",
        },
        "on-accent": "rgb(var(--on-accent) / <alpha-value>)",
        status: {
          ok: "#16A34A",
          warn: "#D97706",
          bad: "#DC2626",
        },
      },
      // Raios e sombras do Oratio. Os nomes do Tailwind ficaram os mesmos, então
      // nenhuma classe mudou de arquivo em arquivo: só o valor por trás delas.
      borderRadius: {
        DEFAULT: "0.5rem",
        sm: "0.5rem",
        md: "0.65rem",
        lg: "1rem",
        xl: "1.1rem",
        "2xl": "1.1rem",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        painel: "var(--shadow-sm)",
      },
      transitionTimingFunction: {
        oratio: "var(--ease-out)",
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      fontFamily: {
        // Inter no texto e na interface; Cormorant Garamond nos títulos.
        sans: ["var(--fonte-texto)", "Inter", "Segoe UI", "system-ui", "sans-serif"],
        display: ["var(--fonte-display)", "Cormorant Garamond", "Georgia", "serif"],
        // Pincel, só para o nome da marca.
        marca: ["var(--fonte-marca)", "cursive"],
        // Pincel japonês, padrão de todo kanji.
        kanji: ["var(--fonte-kanji)", "serif"],
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Entrada de página do Oratio: sobe 14px enquanto aparece. A subida é
        // por "top" (com position: relative no <main>), não por transform:
        // qualquer transform no <main> vira o referencial dos position: fixed
        // lá dentro, e a barra inferior do celular pularia a cada página.
        pageIn: {
          "0%": { opacity: "0", top: "14px" },
          "100%": { opacity: "1", top: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out both",
        pagina: "pageIn 0.42s cubic-bezier(0.33, 1, 0.68, 1) backwards",
      },
    },
  },
  plugins: [],
};

export default config;

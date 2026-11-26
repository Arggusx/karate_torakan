import Image from "next/image";
import { GarraTigre } from "@/components/animacoes/AnimacoesKarate";

/**
 * Abertura da landing no redesign "tinta sumi" (DESIGN.md, seções 5 e 6).
 *
 * Foto em preto e branco revelada por manchas de tinta, o kanji 空手道 na
 * vertical e a Garra do Tigre riscando logo depois. As duas animações são só
 * CSS (.landing-hero-tinta e .landing-garra em landing.css): rodam uma vez ao
 * carregar e, com prefers-reduced-motion, tudo já aparece no estado final.
 *
 * O título e os botões nunca animam: são o que a página tem de essencial.
 */
export function HeroLanding() {
  return (
    <section
      id="topo"
      className="relative isolate flex min-h-[720px] items-end overflow-hidden bg-[rgb(var(--hero))] lg:min-h-[820px]"
    >
      {/* Crédito e licença da foto em public/imagens/CREDITOS.md. */}
      <Image
        src="/imagens/hero-karate.jpg"
        alt="Dois karatecas treinando ao ar livre"
        fill
        priority
        sizes="100vw"
        className="landing-hero-foto landing-tinta landing-hero-tinta -z-20 object-cover"
      />
      <div aria-hidden className="landing-hero-degrade absolute inset-0 -z-10" />

      <p
        aria-hidden
        className="pointer-events-none absolute right-6 top-24 hidden font-mincho text-[64px] font-extrabold tracking-[0.2em] text-fg/10 [writing-mode:vertical-rl] sm:block lg:right-10 lg:top-[120px] dark:text-fg/[0.14]"
      >
        空手道
      </p>

      <GarraTigre className="landing-garra pointer-events-none absolute bottom-[120px] right-12 hidden h-[150px] w-[150px] lg:block" />

      <div className="landing-container relative w-full pb-20 lg:pb-24">
        {/* O 空手 em escala de cartaz, a pincel e em vermelho, que vinha do
            layout anterior. Enfeite: o título logo abaixo diz o mesmo. */}
        <p
          aria-hidden
          className="landing-kanji mb-8 font-kanji text-[clamp(4.5rem,16vw,11rem)] leading-[0.85] tracking-[-0.04em] text-accent"
        >
          空手
        </p>
        <p className="landing-rotulo mb-6 text-muted">
          Karatê Shotokan · Academia Tigre
        </p>
        <h1 className="landing-titulo max-w-[1100px] text-[clamp(48px,8vw,124px)] leading-[0.98]">
          O caminho da mão vazia,{" "}
          <span className="text-muted">ensinado do jeito certo.</span>
        </h1>
        <div className="mt-10 flex flex-wrap gap-3.5">
          <a href="#onde-fica" className="landing-botao landing-botao-principal">
            Fazer a primeira aula grátis
          </a>
          <a href="#turmas" className="landing-botao landing-botao-secundario">
            Ver turmas e horários
          </a>
        </div>
      </div>
    </section>
  );
}

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

      {/* A garra fica no alto: embaixo, à direita, agora mora o kanji. */}
      <GarraTigre className="landing-garra pointer-events-none absolute right-12 top-[120px] hidden h-[150px] w-[150px] lg:block" />

      <div className="landing-container relative w-full pb-20 lg:pb-24">
        <p className="landing-rotulo mb-6 text-muted">
          Karatê Shotokan · Academia Tigre
        </p>
        {/* Título à esquerda e o 空手 do layout anterior à direita, na mesma
            linha. No celular não cabem lado a lado: o kanji sobe e fica à
            direita, acima do título. */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
          <h1 className="landing-titulo max-w-[1100px] text-[clamp(40px,6vw,88px)] leading-[0.98]">
            O caminho da mão vazia,{" "}
            <span className="text-muted">ensinado do jeito certo.</span>
          </h1>
          <p
            aria-hidden
            className="landing-kanji order-first shrink-0 self-end font-kanji text-[clamp(4.5rem,13vw,11rem)] leading-[0.85] tracking-[-0.04em] text-accent sm:order-none"
          >
            空手
          </p>
        </div>
        <div className="mt-10 flex flex-wrap gap-3.5">
          <a href="#onde-fica" className="landing-botao landing-botao-principal">
            Agendar a semana grátis
          </a>
          <a href="#turmas" className="landing-botao landing-botao-secundario">
            Ver turmas e horários
          </a>
        </div>
      </div>
    </section>
  );
}

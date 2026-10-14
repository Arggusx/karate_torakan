import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Faixa escura de abertura, usada no topo de toda página interna e dos
 * portais — o mesmo padrão do hero da landing, em versão mais baixa.
 *
 * Componente de servidor: é só marcação e imagem de fundo, sem animação.
 * A entrada animada fica reservada à landing, onde o hero ocupa a tela toda;
 * repeti-la em página de trabalho só atrasaria a leitura.
 */
export function HeroPagina({
  sobretitulo,
  titulo,
  descricao,
  imagem,
  opacidadeImagem = 0.55,
  kanji,
  acao,
  compacto = false,
}: {
  sobretitulo: string;
  titulo: string;
  descricao?: ReactNode;
  /** Caminho em /public. Sem imagem, fica só o gradiente. */
  imagem?: string;
  /**
   * Quanto da foto aparece. Fotos escuras precisam de mais para não sumirem
   * atrás do gradiente; fotos claras, de menos para não roubarem o texto.
   */
  opacidadeImagem?: number;
  /** Kanji gigante à direita, marca-d'água da seção. */
  kanji?: string;
  /** Botão ou link alinhado à direita (usado nos portais). */
  acao?: ReactNode;
  /** Altura menor, para telas de trabalho como os portais. */
  compacto?: boolean;
}) {
  return (
    /*
      O hero segue o tema. Antes era preto fixo nos dois, o que no modo claro
      abria um bloco quase preto no topo de toda página — a tela inteira clara
      e uma faixa de breu em cima.

      A foto é a mesma nos dois temas: o que muda é a cor por baixo e o véu por
      cima. No claro vira um papel quente com a imagem desbotada atrás; no
      escuro continua o breu de sempre.
    */
    <section className="relative isolate overflow-hidden bg-[#EDE4DE] text-fg dark:bg-[#0B0B0D] dark:text-white">
      {imagem ? (
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-cover bg-center grayscale"
          style={{
            backgroundImage: `url('${imagem}')`,
            opacity: opacidadeImagem,
          }}
        />
      ) : null}

      {/*
        Véu que clareia (ou escurece) o lado do texto e deixa a foto respirar à
        direita. Os dois gradientes têm a mesma geometria — só a cor troca.
      */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,#EDE4DE_30%,rgba(237,228,222,0.82)_65%,rgba(237,228,222,0.55)_100%)] dark:bg-[linear-gradient(100deg,#0B0B0D_30%,rgba(11,11,13,0.78)_65%,rgba(11,11,13,0.5)_100%)]"
      />

      {/*
        Marca-d'água apenas quando a página pede um kanji. O emblema do tigre
        fica reservado à abertura da landing: repetido em toda página interna
        ele deixa de ser assinatura e vira papel de parede.
      */}
      {kanji ? (
        <span
          aria-hidden
          className="pointer-events-none absolute right-6 top-1/2 -z-10 hidden -translate-y-1/2 select-none font-kanji text-[9rem] leading-none text-fg/[0.07] dark:text-white/[0.06] lg:block"
        >
          {kanji}
        </span>
      ) : null}

      <div
        className={cn(
          "section flex flex-wrap items-end justify-between gap-4",
          compacto ? "py-10" : "py-14 sm:py-20",
        )}
      >
        <div>
          <p className="text-2xs font-semibold uppercase tracking-[0.12em] text-gold">
            {sobretitulo}
          </p>
          <h1
            className={cn(
              "mt-2 font-display font-normal leading-[1.15] tracking-[-0.02em]",
              compacto ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl",
            )}
          >
            {titulo}
          </h1>
          {descricao ? (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg/70 dark:text-white/70">
              {descricao}
            </p>
          ) : null}
        </div>

        {acao ? <div className="shrink-0">{acao}</div> : null}
      </div>
    </section>
  );
}

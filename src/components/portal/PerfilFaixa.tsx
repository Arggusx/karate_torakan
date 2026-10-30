import type { ReactNode } from "react";
import { AvatarPerfil } from "@/components/portal/AvatarPerfil";
import { Obi } from "@/components/ui/Obi";
import type { GraduacaoCompleta } from "@/types";

/**
 * Cartão de identificação do aluno, vestido com a faixa atual.
 *
 * Uma tira na cor da faixa atravessa o cartão por trás da foto (com um
 * brilho que corre devagar por ela), um anel na mesma cor gira em volta do
 * avatar e o obi, com as pontas balançando, fecha o canto. O kanji da faixa
 * fica como marca d'água. Na preta, as pontas ganham as listras douradas e o
 * cartão, um brilho dourado.
 *
 * Tudo é decoração: aria-hidden, e parado com prefers-reduced-motion.
 */
export function PerfilFaixa({
  cor,
  programa,
  avatarUrl,
  iniciais,
  children,
}: {
  cor: string;
  programa: GraduacaoCompleta | undefined;
  avatarUrl: string | null;
  iniciais: string;
  /** Nome, selos e progresso — o conteúdo do cartão. */
  children: ReactNode;
}) {
  const dan = Boolean(programa?.grau.toLowerCase().includes("dan"));

  return (
    <section
      className={dan ? "perfil-faixa perfil-faixa-dan" : "perfil-faixa"}
      style={{ "--faixa-cor": cor } as React.CSSProperties}
    >
      <div className="perfil-faixa-tira" aria-hidden />
      <Obi cor={cor} dan={dan} animada soNo className="perfil-faixa-obi" />
      {programa ? (
        <span className="perfil-faixa-kanji" aria-hidden>
          {programa.jp}
        </span>
      ) : null}

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="perfil-faixa-avatar">
          <span className="perfil-faixa-anel" aria-hidden />
          <AvatarPerfil src={avatarUrl} iniciais={iniciais} />
        </div>

        <div className="min-w-0 flex-1 sm:pt-1">
          {children}
          {programa?.txt ? <p className="perfil-faixa-lema">“{programa.txt}”</p> : null}
        </div>
      </div>
    </section>
  );
}

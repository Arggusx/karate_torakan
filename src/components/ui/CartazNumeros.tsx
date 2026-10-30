import type { ComponentType } from "react";

export interface NumeroCartaz {
  valor: string | number;
  rotulo: string;
  Arte: ComponentType<{ className?: string }>;
}

/**
 * Cartaz com um kanji grande que revela uma foto em volta do mouse, ao lado
 * de números com as animações da casa (makiwara, bokken, faixa ao vento).
 * Usado na abertura de Técnicas e na landing.
 */
export function CartazNumeros({
  kanji,
  foto,
  sobretitulo,
  frase,
  numeros,
}: {
  kanji: string;
  foto: string;
  sobretitulo: string;
  frase: string;
  numeros: NumeroCartaz[];
}) {
  return (
    <section className="tec-abertura">
      <div className="revelacao tec-cartaz" data-revelar-mouse>
        <div className="revelacao-foto" style={{ backgroundImage: `url('${foto}')` }} aria-hidden />
        <span className="tec-cartaz-kanji" aria-hidden>
          {kanji}
        </span>
        <div className="relative">
          <p className="eyebrow">{sobretitulo}</p>
          <p className="mt-1 max-w-[19rem] font-display text-2xl leading-tight text-heading">{frase}</p>
          <p className="mt-2 hidden text-2xs text-subtle [@media(hover:hover)]:block">Passe o mouse pelo cartaz.</p>
        </div>
      </div>

      <ul className="tec-numeros">
        {numeros.map(({ valor, rotulo, Arte }) => (
          <li key={rotulo} className="tec-numero" data-luz>
            <Arte className="tec-numero-arte" />
            <span>
              <strong>{valor}</strong>
              {rotulo}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

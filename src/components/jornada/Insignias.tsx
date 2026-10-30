import type { Moldura } from "@/services/jornada";

/**
 * As recompensas desenhadas: a moldura do medalhão e o selo (hanko) do Livro
 * de selos. SVG leve, sem imagem — mesmo princípio das miniaturas do Oratio.
 */

/** Avatar circular com a moldura escolhida. `iniciais` vai no centro. */
export function AvatarMoldura({
  moldura,
  iniciais,
  tamanho = 88,
}: {
  moldura: Moldura;
  iniciais: string;
  tamanho?: number;
}) {
  // Coordenadas arredondadas: o seno do servidor e o do navegador podem
  // diferir na 15ª casa, e o React acusaria diferença de hidratação.
  const redondo = (n: number) => Math.round(n * 100) / 100;
  const pontos = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);
  const p = (r: number, a: number) => [redondo(50 + r * Math.cos(a)), redondo(50 + r * Math.sin(a))];
  const graus = (a: number) => Math.round((a * 180) / Math.PI + 90);

  return (
    <svg
      viewBox="0 0 100 100"
      width={tamanho}
      height={tamanho}
      className="avatar-moldura"
      role="img"
      aria-label={`Medalhão com a ${moldura.nome}`}
    >
      <circle cx="50" cy="50" r="46" fill={moldura.realce} opacity="0.55" />
      <circle cx="50" cy="50" r="36" className="avatar-moldura-fundo" />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" className="avatar-moldura-iniciais">
        {iniciais}
      </text>

      {moldura.motivo === "nenhum" ? (
        <circle cx="50" cy="50" r="41" fill="none" stroke={moldura.cor} strokeWidth="2" />
      ) : null}

      {moldura.motivo === "pincel" ? (
        // Três traços de pincel, com falhas, como tinta que acabou.
        <g fill="none" stroke={moldura.cor} strokeLinecap="round">
          <path d="M14 46 A37 37 0 0 1 58 13" strokeWidth="5" />
          <path d="M66 17 A37 37 0 0 1 86 60" strokeWidth="3.5" />
          <path d="M80 72 A37 37 0 0 1 20 70" strokeWidth="4.5" />
        </g>
      ) : null}

      {moldura.motivo === "enso" ? (
        <path
          d="M58 9 C30 4 9 24 10 50 c1 26 22 41 44 40 C79 89 93 67 90 44 88 30 80 20 70 15"
          fill="none"
          stroke={moldura.cor}
          strokeWidth="5"
          strokeLinecap="round"
        />
      ) : null}

      {moldura.motivo === "tatame" ? (
        // Borda de tatame (heri): faixa escura com pontos dourados.
        <g>
          <circle cx="50" cy="50" r="41" fill="none" stroke={moldura.cor} strokeWidth="6" />
          {pontos.map((a, i) => {
            const [x, y] = p(41, a);
            return <circle key={i} cx={x} cy={y} r="1.3" fill={moldura.realce} />;
          })}
        </g>
      ) : null}

      {moldura.motivo === "bambu" ? (
        <g stroke={moldura.cor} strokeLinecap="round">
          <circle cx="50" cy="50" r="41" fill="none" strokeWidth="3" />
          {pontos.map((a, i) => {
            const [x1, y1] = p(37, a);
            const [x2, y2] = p(45, a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="2.5" />;
          })}
        </g>
      ) : null}

      {moldura.motivo === "sakura" ? (
        <g>
          <circle cx="50" cy="50" r="41" fill="none" stroke={moldura.cor} strokeWidth="1.5" strokeDasharray="2 4" />
          {pontos.filter((_, i) => i % 2 === 0).map((a, i) => {
            const [x, y] = p(41, a);
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${graus(a)})`}>
                {[0, 72, 144, 216, 288].map((r) => (
                  <ellipse key={r} cx="0" cy="-2.6" rx="1.7" ry="2.6" fill={moldura.realce} stroke={moldura.cor} strokeWidth="0.5" transform={`rotate(${r})`} />
                ))}
                <circle r="0.9" fill={moldura.cor} />
              </g>
            );
          })}
        </g>
      ) : null}

      {moldura.motivo === "ondas" ? (
        <g fill="none" stroke={moldura.cor} strokeWidth="1.8">
          {pontos.map((a, i) => {
            const [x, y] = p(41, a);
            return (
              <g key={i} transform={`translate(${x} ${y}) rotate(${graus(a)})`}>
                <path d="M-5 2 A5 5 0 0 1 5 2" />
                <path d="M-2.6 2 A2.6 2.6 0 0 1 2.6 2" />
              </g>
            );
          })}
        </g>
      ) : null}
    </svg>
  );
}

/**
 * Selo (hanko): carimbo vermelho com o kanji do caminho, levemente torto como
 * carimbo de verdade. Sem `cor`, é o espaço ainda vazio no Livro de selos.
 */
export function Selo({
  kanji,
  cor,
  vazio = false,
  inclinacao = 0,
  tamanho = 64,
  animar = false,
}: {
  kanji: string;
  cor: string;
  vazio?: boolean;
  inclinacao?: number;
  tamanho?: number;
  animar?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={tamanho}
      height={tamanho}
      aria-hidden
      className={animar ? "selo selo-carimba" : "selo"}
      style={
        {
          "--inclinacao": `${inclinacao}deg`,
          transform: animar ? undefined : `rotate(${inclinacao}deg)`,
        } as React.CSSProperties
      }
    >
      {vazio ? (
        <rect x="6" y="6" width="52" height="52" rx="8" className="selo-vazio" />
      ) : (
        <>
          <rect x="6" y="6" width="52" height="52" rx="8" fill="none" stroke={cor} strokeWidth="3.5" />
          <rect x="11" y="11" width="42" height="42" rx="5" fill={cor} opacity="0.12" />
          <text
            x="32"
            y="33"
            textAnchor="middle"
            dominantBaseline="central"
            fill={cor}
            className="selo-kanji"
            fontSize={kanji.length > 2 ? 15 : kanji.length === 2 ? 20 : 28}
          >
            {kanji}
          </text>
        </>
      )}
    </svg>
  );
}

/**
 * As bordas animadas do medalhão: SVG puro com animação SMIL (<animate>,
 * <animateTransform>, <animateMotion>). Nada de CSS animation nem JS — o
 * navegador anima sozinho, e BordaAnimada só pausa quando a borda sai da
 * tela ou a pessoa prefere menos movimento.
 *
 * Cada borda tem duas camadas:
 *  - tras: atrás do avatar (o anel, partículas, traços);
 *  - frente: na frente do avatar (selos, medalhas, ícones).
 *
 * Todas usam viewBox="-40 -40 180 180": o anel ocupa 0..100 e o avatar fica
 * em 8..92. O espaço de sobra é para o que sai do anel (pétalas, raios).
 *
 * `{{id}}` é trocado por um id único em cada uso, para os gradientes e
 * recortes de duas bordas iguais na mesma página não se confundirem.
 *
 * O ensō usa currentColor: a tinta é preta no tema claro e clara no escuro
 * (ver .b-enso no jornada.css).
 *
 * Truque usado em quase todas: pathLength="100" deixa o tracejado em
 * porcentagem — stroke-dasharray="18 82" é 18% visível — e animar o
 * stroke-dashoffset faz o traço correr pelo anel.
 */

export interface Camadas {
  tras?: string;
  frente?: string;
}

const r2 = (n: number) => Math.round(n * 100) / 100;
/** Ponto no círculo de centro (50,50), ângulo em graus a partir do topo. */
const ponto = (raio: number, graus: number) => {
  const a = ((graus - 90) * Math.PI) / 180;
  return [r2(50 + raio * Math.cos(a)), r2(50 + raio * Math.sin(a))] as const;
};
/** Círculo do anel começando no topo (o traço parte do meio-dia). */
const anel = (raio: number, attrs: string, filhos = "") =>
  `<circle cx="50" cy="50" r="${raio}" transform="rotate(-90 50 50)" fill="none" ${attrs}>${filhos}</circle>`;
const correr = (dur: string, de = 0, para = -100) =>
  `<animate attributeName="stroke-dashoffset" from="${de}" to="${para}" dur="${dur}" repeatCount="indefinite"/>`;
const piscar = (dur: string, begin = "0s", valores = "0.25;1;0.25") =>
  `<animate attributeName="opacity" values="${valores}" dur="${dur}" begin="${begin}" repeatCount="indefinite"/>`;
const brilho = `<filter id="{{id}}-brilho" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

// ---------------------------------------------------------------- Primeiro passo

const giro: Camadas = {
  tras: `<defs>${brilho}</defs>
    ${anel(46, `stroke="#173452" stroke-width="7"`)}
    ${anel(46, `stroke="#5aa9e6" stroke-opacity=".35" stroke-width="1.5"`)}
    ${anel(46, `pathLength="100" stroke="#38bdf8" stroke-width="5" stroke-linecap="round" stroke-dasharray="18 82" filter="url(#{{id}}-brilho)"`, correr("3.2s"))}
    ${anel(46, `pathLength="100" stroke="#e0f2fe" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 96"`, correr("3.2s", -14, -114))}`,
  frente: `<g transform="translate(50 98)">
      <circle r="10" fill="#3B82C4" stroke="#e0f2fe" stroke-width="1.5">
        <animate attributeName="r" values="10;11.5;10" dur="1.6s" repeatCount="indefinite"/>
      </circle>
      <path d="M-4 3 L0 -5 L4 3 M-2.4 0 H2.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`,
};

// ---------------------------------------------------------------- Sete treinos

const semana: Camadas = (() => {
  const segmentos = Array.from({ length: 7 }, (_, i) =>
    anel(
      46,
      `pathLength="100" stroke="#ff7eb0" stroke-width="6" stroke-dasharray="11.5 88.5" stroke-dashoffset="${r2(-i * (100 / 7) - 1)}" opacity=".25"`,
      `<animate attributeName="opacity" values=".25;1;1;.25" keyTimes="0;.08;.85;1" dur="4.2s" begin="${r2(i * 0.5)}s" repeatCount="indefinite"/>`,
    ),
  ).join("");
  const bolinhas = Array.from({ length: 7 }, (_, i) => {
    const [x, y] = ponto(57, i * (360 / 7) + 360 / 14);
    return `<circle cx="${x}" cy="${y}" r="2.6" fill="#ffd1e3">${piscar("4.2s", `${r2(i * 0.5)}s`, ".3;1;1;.3")}</circle>`;
  }).join("");
  return {
    tras: `${anel(46, `stroke="#4a1530" stroke-width="7.5"`)}${segmentos}`,
    frente: bolinhas,
  };
})();

// ---------------------------------------------------------------- Lua do dojo

const lua: Camadas = (() => {
  const estrelas = [
    [-14, 20], [114, 72], [-8, 86], [104, -12], [30, 118], [80, 116],
  ]
    .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="1.6" fill="#e8e9ff">${piscar(`${2 + (i % 3)}s`, `${r2(i * 0.35)}s`)}</circle>`)
    .join("");
  return {
    tras: `${anel(46, `stroke="#22245c" stroke-width="7"`)}
      ${anel(46, `pathLength="100" stroke="#8c90ff" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="0 100"`,
        `<animate attributeName="stroke-dasharray" values="0 100;100 0;100 0;0 100" keyTimes="0;.6;.9;1" dur="7s" repeatCount="indefinite"/>`)}
      ${estrelas}`,
    frente: `<defs><clipPath id="{{id}}-lua"><circle cx="90" cy="10" r="12"/></clipPath></defs>
      <circle cx="90" cy="10" r="13.5" fill="#4B4FA8" opacity=".5"/>
      <circle cx="90" cy="10" r="12" fill="#f7f3d0"/>
      <g clip-path="url(#{{id}}-lua)">
        <circle cx="76" cy="6" r="12" fill="#22245c">
          <animate attributeName="cx" values="76;104;104;76" keyTimes="0;.6;.9;1" dur="7s" repeatCount="indefinite"/>
        </circle>
      </g>`,
  };
})();

// ---------------------------------------------------------------- Kime perfeito

const kime: Camadas = {
  tras: `<defs><linearGradient id="{{id}}-aco" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e3ece7"/><stop offset=".45" stop-color="#7f9b8c"/><stop offset=".55" stop-color="#5C7A6B"/><stop offset="1" stop-color="#c9d8cf"/>
      <animateTransform attributeName="gradientTransform" type="rotate" from="0 .5 .5" to="360 .5 .5" dur="9s" repeatCount="indefinite"/>
    </linearGradient></defs>
    ${anel(46, `stroke="url(#{{id}}-aco)" stroke-width="7"`)}
    ${anel(39.5, `stroke="#5C7A6B" stroke-opacity=".5" stroke-width="1"`)}
    ${[45, 135, 225, 315]
      .map((g) => {
        const [x, y] = ponto(55, g);
        return `<g transform="translate(${x} ${y}) rotate(${g})"><path d="M-7 3 V-3 H7 V3" fill="none" stroke="#5C7A6B" stroke-width="2.4" stroke-linecap="round"/></g>`;
      })
      .join("")}`,
  frente: `<g transform="translate(50 101)">
      <rect x="-17" y="-5.5" width="34" height="11" rx="5.5" fill="#dce7e1" stroke="#5C7A6B" stroke-width="1.6"/>
      <line x1="-4" y1="-5.5" x2="-4" y2="5.5" stroke="#5C7A6B" stroke-width="1"/>
      <line x1="4" y1="-5.5" x2="4" y2="5.5" stroke="#5C7A6B" stroke-width="1"/>
      <circle cy="0" r="3.4" fill="#9fd3b5" stroke="#3d6150" stroke-width="1">
        <animate attributeName="cx" values="-9;9;-5;3;0;0;-9" keyTimes="0;.2;.38;.52;.62;.9;1" dur="4s" repeatCount="indefinite"/>
      </circle>
    </g>
    <g transform="translate(92 8)"><circle r="8.5" fill="#5C7A6B"/><path d="M-3.6 0 L-1 2.8 L4 -2.6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>`,
};

// ---------------------------------------------------------------- Bambu que cresce

const bambu: Camadas = (() => {
  const colmo = (x: number, lado: 1 | -1, atraso: number) => {
    const nos = [96, 72, 48, 24, 2].map((y) => `<line x1="${x - 3}" y1="${y}" x2="${x + 3}" y2="${y}" stroke="#2f5d2c" stroke-width="1.6"/>`).join("");
    const folhas = [70, 46, 22]
      .map(
        (y, i) => `<path d="M${x} ${y} q${lado * 10} -6 ${lado * 18} -1 q${-lado * 9} 5 ${-lado * 18} 1z" fill="#6fae5f" opacity="0" transform-origin="${x} ${y}">
          <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;${r2(0.25 + i * 0.12)};${r2(0.35 + i * 0.12)};.9;1" dur="6s" begin="${atraso}s" repeatCount="indefinite"/>
        </path>`,
      )
      .join("");
    return `<g>
      <line x1="${x}" y1="100" x2="${x}" y2="0" pathLength="100" stroke="#4E8A4A" stroke-width="5.5" stroke-linecap="round" stroke-dasharray="100" stroke-dashoffset="100">
        <animate attributeName="stroke-dashoffset" values="100;0;0;100" keyTimes="0;.4;.9;1" dur="6s" begin="${atraso}s" repeatCount="indefinite"/>
      </line>
      <g opacity="0">${nos}<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.35;.42;.9;1" dur="6s" begin="${atraso}s" repeatCount="indefinite"/></g>
      ${folhas}
    </g>`;
  };
  return {
    tras: `${anel(46, `stroke="#d7ebcf" stroke-width="6"`)}${anel(46, `stroke="#4E8A4A" stroke-width="1.4" stroke-dasharray="3 3"`)}
      ${colmo(-8, -1, 0)}${colmo(108, 1, 0.8)}`,
  };
})();

// ---------------------------------------------------------------- Ensō de tinta

const enso: Camadas = {
  tras: `<path d="M58 3 C28 -2 2 22 3 51 c1 28 24 46 49 45 C80 95 98 72 96 46 94 30 86 17 72 9"
      pathLength="100" fill="none" stroke="currentColor" stroke-width="7.5" stroke-linecap="round" stroke-dasharray="100" stroke-dashoffset="100">
      <animate attributeName="stroke-dashoffset" values="100;0;0;100" keyTimes="0;.4;.88;1" dur="6s" repeatCount="indefinite"/>
      <animate attributeName="stroke-width" values="9;6;7.5" dur="6s" repeatCount="indefinite"/>
    </path>
    ${[[100, 30, 0.42], [104, 40, 0.45], [96, 22, 0.48]]
      .map(([x, y, t]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="currentColor" opacity="0">
        <animate attributeName="opacity" values="0;0;.8;.8;0" keyTimes="0;${t};${r2(t + 0.04)};.88;1" dur="6s" repeatCount="indefinite"/>
      </circle>`)
      .join("")}`,
  frente: `<g transform="translate(90 92) rotate(-8)">
      <g>
        <animateTransform attributeName="transform" type="scale" values="0;0;1.25;1;1;0" keyTimes="0;.42;.48;.52;.9;1" dur="6s" repeatCount="indefinite"/>
        <rect x="-8" y="-8" width="16" height="16" rx="2.5" fill="#b3261e"/>
        <path d="M-4.5 -4 H4.5 M0 -4 V4.5 M-4.5 4.5 H4.5" stroke="#fbe9e7" stroke-width="1.6" stroke-linecap="round"/>
      </g>
    </g>`,
};

// ---------------------------------------------------------------- Chuva de sakura

const sakura: Camadas = (() => {
  const petala = `<path d="M0 -4 C3 -4 4 0 0 4 C-4 0 -3 -4 0 -4z" fill="#f7a8c4" stroke="#c2486a" stroke-width=".4"/>`;
  const quedas = [
    ["M-20 -30 C0 10 -30 50 -10 130", "7s", "0s"],
    ["M20 -36 C40 0 10 60 30 136", "8.5s", "1.6s"],
    ["M70 -34 C90 10 60 70 85 134", "7.5s", "3s"],
    ["M115 -30 C100 20 130 70 110 132", "9s", "0.8s"],
    ["M95 -38 C70 0 105 40 75 136", "8s", "4.2s"],
    ["M-30 0 C-10 40 -35 80 -15 135", "9.5s", "2.4s"],
  ]
    .map(
      ([d, dur, begin]) => `<g opacity="0">${petala}
        <animateMotion path="${d}" dur="${dur}" begin="${begin}" repeatCount="indefinite" rotate="auto"/>
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" dur="${dur}" begin="${begin}" repeatCount="indefinite"/>
      </g>`,
    )
    .join("");
  const flor = (x: number, y: number, e: number) =>
    `<g transform="translate(${x} ${y}) scale(${e})">${[0, 72, 144, 216, 288]
      .map((g) => `<ellipse cy="-4" rx="2.8" ry="4.2" fill="#fbd3e2" stroke="#c2486a" stroke-width=".5" transform="rotate(${g})"/>`)
      .join("")}<circle r="1.6" fill="#c2486a"/></g>`;
  return {
    tras: `${anel(46, `stroke="#f7d9e4" stroke-width="6.5"`)}
      <g>${anel(46, `stroke="#c2486a" stroke-width="1.6" stroke-dasharray="2 5"`)}
        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="40s" repeatCount="indefinite"/></g>
      ${quedas}`,
    frente: `<path d="M-6 30 C4 14 14 4 32 -4" fill="none" stroke="#5b3a29" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M8 12 C12 6 18 4 22 6" fill="none" stroke="#5b3a29" stroke-width="1.6" stroke-linecap="round"/>
      ${flor(2, 20, 1)}${flor(20, 2, 1.15)}${flor(24, 7, 0.8)}
      <g>${flor(34, -5, 0.9)}<animateTransform attributeName="transform" type="rotate" values="0 32 -4;8 32 -4;0 32 -4" dur="3s" repeatCount="indefinite"/></g>`,
  };
})();

// ---------------------------------------------------------------- Relâmpago do kiai

const kiai: Camadas = (() => {
  const raio = (g: number, begin: string) => {
    const [x, y] = ponto(60, g);
    return `<g transform="translate(${x} ${y}) rotate(${g})" opacity="0">
      <path d="M0 -9 L-3 -1 L2 -1 L-1 9" fill="none" stroke="#ffe066" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <animate attributeName="opacity" values="0;1;0;1;0;0" keyTimes="0;.04;.08;.12;.18;1" dur="2.6s" begin="${begin}" repeatCount="indefinite"/>
    </g>`;
  };
  return {
    tras: `<defs>${brilho}</defs>
      ${anel(46, `stroke="#2a2208" stroke-width="7.5"`)}
      ${anel(46, `pathLength="100" stroke="#ffd43b" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="14 36" filter="url(#{{id}}-brilho)"`, correr("1.6s"))}
      ${anel(46, `pathLength="100" stroke="#fff7d6" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="6 44"`, correr("2.2s", 0, 100))}
      ${raio(30, "0s")}${raio(150, ".9s")}${raio(250, "1.7s")}${raio(330, "1.2s")}`,
    frente: `<g transform="translate(50 100)">
      <g><animateTransform attributeName="transform" type="scale" values="1;1.12;1;1" keyTimes="0;.1;.2;1" dur="1.6s" repeatCount="indefinite"/>
        <rect x="-15" y="-7" width="30" height="14" rx="7" fill="#E0A400" stroke="#2a2208" stroke-width="1.4"/>
        <text x="0" y="0.5" text-anchor="middle" dominant-baseline="middle" font-family="Inter, system-ui, sans-serif" font-size="8" font-weight="800" fill="#2a2208" letter-spacing=".5">KIAI</text>
      </g>
    </g>`,
  };
})();

// ---------------------------------------------------------------- Tigre dourado

const tora: Camadas = (() => {
  const listras = Array.from({ length: 10 }, (_, i) => {
    const g = i * 36 + 8;
    const [x1, y1] = ponto(49.5, g);
    const [x2, y2] = ponto(43, g + 6);
    const [x3, y3] = ponto(49.5, g + 9);
    return `<path d="M${x1} ${y1} L${x2} ${y2} L${x3} ${y3}" fill="#2b1a07" opacity=".85"/>`;
  }).join("");
  const orbita = (raio: number, dur: string, begin: string, cor: string) =>
    `<circle r="2.6" fill="${cor}" filter="url(#{{id}}-brilho)">
      <animateMotion dur="${dur}" begin="${begin}" repeatCount="indefinite" path="M50 ${50 - raio} a${raio} ${raio} 0 1 1 -0.01 0"/>
    </circle>`;
  const estrelas = [[-18, -8], [118, 14], [-10, 106], [112, 108]]
    .map(([x, y], i) => `<path transform="translate(${x} ${y})" d="M0 -5 L1.3 -1.3 L5 0 L1.3 1.3 L0 5 L-1.3 1.3 L-5 0 L-1.3 -1.3z" fill="#ffe8a3">${piscar(`${2.4 + i * 0.4}s`, `${r2(i * 0.5)}s`, ".2;1;.2")}</path>`)
    .join("");
  return {
    tras: `<defs>${brilho}
        <linearGradient id="{{id}}-ouro" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#7a4f12"/><stop offset=".3" stop-color="#f6d27a"/><stop offset=".5" stop-color="#fff3c4"/><stop offset=".7" stop-color="#d9a441"/><stop offset="1" stop-color="#7a4f12"/>
          <animateTransform attributeName="gradientTransform" type="rotate" from="0 .5 .5" to="360 .5 .5" dur="6s" repeatCount="indefinite"/>
        </linearGradient></defs>
      ${anel(46, `stroke="url(#{{id}}-ouro)" stroke-width="9"`)}
      ${listras}
      ${anel(58, `stroke="#C8963E" stroke-opacity=".35" stroke-width=".8" stroke-dasharray="1 4"`)}
      ${orbita(58, "5s", "0s", "#fff3c4")}${orbita(58, "5s", "-1.25s", "#f6d27a")}${orbita(58, "5s", "-2.5s", "#fff3c4")}${orbita(58, "5s", "-3.75s", "#f6d27a")}
      ${estrelas}`,
    frente: `<g transform="translate(50 101)">
      <circle r="10.5" fill="#2b1a07" stroke="#f6d27a" stroke-width="1.6"/>
      <g fill="#f6d27a">
        <ellipse cx="0" cy="2.4" rx="4" ry="3.2"/>
        <circle cx="-4.6" cy="-2.6" r="1.7"/><circle cx="-1.6" cy="-5" r="1.7"/><circle cx="1.6" cy="-5" r="1.7"/><circle cx="4.6" cy="-2.6" r="1.7"/>
        <animate attributeName="opacity" values="1;.55;1" dur="2.4s" repeatCount="indefinite"/>
      </g>
    </g>`,
  };
})();

// ---------------------------------------------------------------- Pódio da semana

const podio: Camadas = (() => {
  const folhas = (lado: 1 | -1) =>
    Array.from({ length: 7 }, (_, i) => {
      const g = 180 + lado * (28 + i * 20);
      const [x, y] = ponto(55, g);
      return `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="6" fill="#b87333" transform="rotate(${r2(g + lado * 35)} ${x} ${y})" opacity=".3">
        <animate attributeName="opacity" values=".3;1;1;.3" keyTimes="0;.15;.85;1" dur="3.5s" begin="${r2(i * 0.18)}s" repeatCount="indefinite"/>
      </ellipse>`;
    }).join("");
  return {
    tras: `${anel(46, `stroke="#5a3415" stroke-width="7"`)}
      ${anel(46, `pathLength="100" stroke="#e6a46a" stroke-width="3" stroke-linecap="round" stroke-dasharray="30 20"`, correr("5s"))}
      ${folhas(1)}${folhas(-1)}`,
    frente: `<g transform="translate(50 103)">
      <rect x="-15" y="-5" width="10" height="9" fill="#d9d9d9" stroke="#5a3415" stroke-width="1"/>
      <rect x="-5" y="-10" width="10" height="14" fill="#f2c94c" stroke="#5a3415" stroke-width="1"/>
      <rect x="5" y="-2" width="10" height="6" fill="#d08b4a" stroke="#5a3415" stroke-width="1"/>
      <g><animateTransform attributeName="transform" type="translate" values="0 0;0 -3;0 0" dur="1.4s" repeatCount="indefinite"/>
        <path transform="translate(0 -16)" d="M0 -4.5 L1.3 -1.4 L4.6 -1.2 L2 1 L2.8 4.3 L0 2.5 L-2.8 4.3 L-2 1 L-4.6 -1.2 L-1.3 -1.4z" fill="#f2c94c" stroke="#5a3415" stroke-width=".7"/>
      </g>
    </g>`,
  };
})();

// ---------------------------------------------------------------- Campeão do mês

const campeao: Camadas = (() => {
  const raios = Array.from({ length: 16 }, (_, i) => {
    const g = i * 22.5;
    const [x1, y1] = ponto(52, g - 4);
    const [x2, y2] = ponto(66, g);
    const [x3, y3] = ponto(52, g + 4);
    return `<path d="M${x1} ${y1} L${x2} ${y2} L${x3} ${y3}z" fill="${i % 2 ? "#f6c453" : "#e07a3f"}" opacity=".55"/>`;
  }).join("");
  return {
    tras: `<g>${raios}<animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="24s" repeatCount="indefinite"/></g>
      ${anel(46, `stroke="#7a1712" stroke-width="8"`)}
      ${anel(46, `pathLength="100" stroke="#f6c453" stroke-width="3" stroke-linecap="round" stroke-dasharray="22 3"`, correr("8s"))}`,
    frente: `<g transform="translate(50 -2)">
      <path d="M-16 6 L-18 -8 L-9 -1 L0 -12 L9 -1 L18 -8 L16 6z" fill="#f6c453" stroke="#7a1712" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="-16" y="5" width="32" height="5" rx="1.5" fill="#e0a400" stroke="#7a1712" stroke-width="1.2"/>
      ${[[-9, 1.5, "0s"], [0, -4, ".5s"], [9, 1.5, "1s"]]
        .map(([x, y, b]) => `<circle cx="${x}" cy="${y}" r="2" fill="#b3261e">${piscar("1.5s", String(b), ".5;1;.5")}</circle>`)
        .join("")}
    </g>
    <g transform="translate(50 101)"><rect x="-11" y="-7" width="22" height="14" rx="7" fill="#b3261e" stroke="#f6c453" stroke-width="1.4"/>
      <text x="0" y=".5" text-anchor="middle" dominant-baseline="middle" font-family="Inter, system-ui, sans-serif" font-size="8.5" font-weight="800" fill="#fff4d6">1º</text></g>`,
  };
})();

export const CAMADAS_SVG: Record<string, Camadas> = {
  giro,
  semana,
  lua,
  kime,
  bambu,
  enso,
  sakura,
  kiai,
  tora,
  podio,
  campeao,
};

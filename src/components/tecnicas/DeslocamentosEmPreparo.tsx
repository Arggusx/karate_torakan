/**
 * Espaço reservado para o ashi-sabaki — a família de deslocamentos.
 *
 * Não é base nem golpe: é como o corpo chega até onde a técnica acontece. A
 * aba fica visível antes do conteúdo de propósito, porque metade do valor
 * dela é o aluno descobrir que essa família existe e tem nome.
 *
 * Os termos abaixo já aparecem no texto dos katas — o `yori-ashi` está no
 * Heian Sandan e no Meikyo, por exemplo — então não são inventados aqui.
 */
const PREVISTOS = [
  {
    nome: "Suri-ashi",
    kanji: "摺り足",
    pt: "Pé que desliza",
    nota: "O pé varre o chão sem levantar. Base do deslocamento que não avisa o adversário.",
  },
  {
    nome: "Yori-ashi",
    kanji: "寄り足",
    pt: "Pé que se aproxima",
    nota: "Os dois pés deslizam juntos, mantendo a base. Aparece no Heian Sandan e no Meikyo.",
  },
  {
    nome: "Tsugi-ashi",
    kanji: "継ぎ足",
    pt: "Pé que emenda",
    nota: "O pé de trás alcança o da frente antes do avanço, ganhando distância sem trocar a guarda.",
  },
  {
    nome: "Ayumi-ashi",
    kanji: "歩み足",
    pt: "Passo caminhado",
    nota: "Passo comum, um pé passando o outro — o deslocamento do oi-zuki.",
  },
  {
    nome: "Tai-sabaki",
    kanji: "体捌き",
    pt: "Manejo do corpo",
    nota: "Sair da linha do ataque girando o corpo, em vez de recuar por ela.",
  },
];

export function DeslocamentosEmPreparo() {
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <p className="eyebrow">Ashi-sabaki · 足捌き</p>
        <h2 className="heading-lg mt-1">Deslocamentos</h2>
        <p className="body-muted mt-2 max-w-2xl">
          Nem base nem golpe: é como o corpo chega até onde a técnica acontece.
          Esta seção ainda está sendo montada — abaixo, o que vai entrar nela.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {PREVISTOS.map((item) => (
          <article key={item.nome} className="card p-4 opacity-70">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="heading-md">{item.nome}</h3>
              <span className="font-kanji text-sm text-subtle">{item.kanji}</span>
            </div>
            <p className="mt-0.5 text-xs font-medium text-accent">{item.pt}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">{item.nota}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

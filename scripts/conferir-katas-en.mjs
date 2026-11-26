// Confere se cada tradução em src/i18n/katas-en bate com o kata original:
// mesma quantidade de movimentos, de bunkai, de comentários e de termos.
// Uso: node scripts/conferir-katas-en.mjs
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const dados = require("../karate_shotokan_dados_completos.json");
const ts = require("typescript");

const pasta = new URL("../src/i18n/katas-en/", import.meta.url);
const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
const resumos = new Map(dados.katasShotokan.map((k) => [norm(k.nome), k]));

let erros = 0;
const ids = new Set();
for (const arquivo of readdirSync(pasta)) {
  if (["index.ts", "tipos.ts", "tecnicas.ts"].includes(arquivo)) continue;
  const id = arquivo.replace(/\.ts$/, "");
  ids.add(id);
  const fonte = readFileSync(new URL(arquivo, pasta), "utf8")
    .replace(/^import .*$/m, "")
    .replace("export default", "module.exports =")
    .replace(/\s*satisfies KataEn;?\s*$/, ";");
  const js = ts.transpileModule(fonte, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const m = { exports: {} };
  new Function("module", "exports", js)(m, m.exports);
  const en = m.exports;
  const pt = dados.katas26Detalhados.find((k) => k.id === id);
  const falha = (msg) => { erros++; console.log(`✗ ${id}: ${msg}`); };
  if (!pt) { falha("não existe no JSON"); continue; }
  if (en.movimentos.length !== pt.movimentosDetalhados.length)
    falha(`movimentos ${en.movimentos.length} ≠ ${pt.movimentosDetalhados.length}`);
  en.movimentos.forEach(([, dir], i) => {
    const temPt = Boolean(pt.movimentosDetalhados[i]?.direcao);
    if (temPt !== Boolean(dir)) falha(`movimento ${i + 1}: direção ${temPt ? "faltando" : "sobrando"}`);
  });
  if (en.bunkai.length !== pt.bunkai.length) falha(`bunkai ${en.bunkai.length} ≠ ${pt.bunkai.length}`);
  if ((en.comentario?.length ?? 0) !== (pt.comentario?.length ?? 0)) falha("comentários com quantidade diferente");
  for (const campo of ["observacaoContagem", "contagemAlternativa", "significadoLiteral", "posicoesKiai"])
    if (Boolean(en[campo]) !== Boolean(pt[campo])) falha(`campo ${campo} diferente`);
  const r = resumos.get(norm(pt.nome));
  if (Boolean(r) !== Boolean(en.resumo)) falha("resumo presente em um e não no outro");
  if (r && en.resumo && r.decomposicao.length !== en.resumo.decomposicao.length) falha("decomposição com tamanho diferente");
}
for (const k of dados.katas26Detalhados) if (!ids.has(k.id)) { erros++; console.log(`✗ ${k.id}: sem tradução`); }
console.log(erros ? `\n${erros} problema(s).` : `✓ ${ids.size} katas conferidos, tudo bate.`);
process.exit(erros ? 1 : 0);

# DESIGN.md — Torakan (redesign "tinta sumi")

Guia de estilo e regras de trabalho para o redesign dos três domínios do Torakan.
Leia este arquivo inteiro antes de qualquer alteração visual.

Protótipo aprovado da landing (modo escuro e claro):
https://claude.ai/artifact/R1NcXc3CZEcp1WK9ntkKVK

---

## 1. Regras de preservação (obrigatórias)

O redesign muda a **aparência**. Ele não muda o que o site faz nem o que ele diz.

**Nunca altere:**
- `src/server/`, `src/services/`, `src/data/`, `src/types/`, `src/lib/` (exceto `cn.ts`), `src/app/api/`, `src/middleware.ts`, `db/`.
- Textos, números, rótulos, mensagens de erro e conteúdo didático do **academy** e do **portal**.
- Rotas, props, nomes de componentes exportados, handlers, chamadas de API, lógica de sessão, pagamentos e permissões.
- Atributos de acessibilidade existentes (`aria-*`, `alt`, `role`, `htmlFor`), a não ser para corrigir um erro.

**Pode alterar:**
- Arquivos `*.css` em `src/app/`.
- `className` e estilos dos componentes.
- Componentes puramente decorativos: `components/ui/FundoAsiatico.tsx`, `components/animacoes/AnimacoesKarate.tsx`, `components/layout/EfeitosGlobais.tsx`.
- `app/layout.tsx`, só para trocar fontes.
- **Exceção: a landing** (`app/page.tsx`, `components/layout/HeroLanding.tsx`, `HeaderLanding.tsx`, `Footer.tsx`) pode ser reestruturada e ter textos alterados conforme a seção 6, porque o novo conteúdo foi aprovado pelo dono do projeto.

Na dúvida se algo é "aparência" ou "comportamento", **não altere: pergunte**.

## 2. Forma de trabalhar

1. Trabalhe na branch `redesign`. Nunca direto na `main`.
2. Uma fase por commit, na ordem: **tokens → fundo e animações globais → landing → academy → portal**.
3. Depois de cada fase: `npm run build` sem erro, conferir **os dois temas** (claro e escuro) e conferir com `prefers-reduced-motion: reduce` ativado.
4. Não instale dependências além das listadas na seção 5.
5. Não apague arquivos. Componente que deixar de ser usado fica, com um comentário `// sem uso desde o redesign`.

## 3. Tokens

O projeto usa variáveis em canais RGB (`--canvas: 242 236 225`) consumidas pelo Tailwind. **Mantenha os mesmos nomes de variável**, troque só os valores. Assim nenhum `className` precisa mudar para o site trocar de cara.

### Claro (`:root`) — papel

| Variável | Valor (canais) | Hex | Uso |
|---|---|---|---|
| `--canvas` | `242 236 225` | #F2ECE1 | fundo da página |
| `--surface` | `247 242 234` | #F7F2EA | cards |
| `--elevated` | `232 224 210` | #E8E0D2 | blocos de destaque, números |
| `--line` | `217 207 192` | #D9CFC0 | bordas |
| `--line-strong` | `168 156 140` | #A89C8C | bordas de botão secundário |
| `--fg` | `22 18 15` | #16120F | texto |
| `--heading` | `22 18 15` | #16120F | títulos |
| `--muted` | `78 69 61` | #4E453D | texto secundário |
| `--subtle` | `107 97 88` | #6B6158 | rótulos pequenos |
| `--faixa` | `232 224 210` | #E8E0D2 | faixas |
| `--hero` | `242 236 225` | #F2ECE1 | fundo dos heros |
| `--accent` | `163 34 27` | #A3221B | texto e ícones em vermelho |
| `--accent-hover` | `130 26 20` | #821A14 | hover |
| `--accent-solid` | `163 34 27` | #A3221B | fundo de botão principal |
| `--on-accent` | `255 255 255` | #FFFFFF | texto sobre o vermelho |

### Escuro (`.dark`) — sumi

| Variável | Valor (canais) | Hex |
|---|---|---|
| `--canvas` | `14 12 11` | #0E0C0B |
| `--surface` | `23 20 17` | #171411 |
| `--elevated` | `30 26 22` | #1E1A16 |
| `--line` | `42 36 32` | #2A2420 |
| `--line-strong` | `90 80 72` | #5A5048 |
| `--fg` | `237 230 218` | #EDE6DA |
| `--heading` | `237 230 218` | #EDE6DA |
| `--muted` | `184 174 162` | #B8AEA2 |
| `--subtle` | `140 131 120` | #8C8378 |
| `--faixa` | `30 26 22` | #1E1A16 |
| `--hero` | `14 12 11` | #0E0C0B |
| `--accent` | `224 87 75` | #E0574B |
| `--accent-hover` | `236 117 105` | #EC7569 |
| `--accent-solid` | `179 38 30` | #B3261E |
| `--on-accent` | `255 255 255` | #FFFFFF |

`--gold` e as sombras: manter os valores atuais.

### Regra do vermelho
O vermelho é **carimbo (hanko)**, não cor de fundo. Só aparece em: botão principal, Garra do Tigre, carimbo 虎, marcador do embusen e links em hover. Nunca em faixas inteiras, fundos de seção ou degradês.

### Fotos
Todas as fotos em preto e branco: `filter: grayscale(1) contrast(1.1)`. No escuro, o hero usa ainda `brightness(.55)` com degradê para `--canvas` na base; no claro, `brightness(1.05)` com degradê de papel (transparente no topo, `--canvas` a partir de ~85%).

### Raios e espaçamento
- Cards, fotos e blocos: `border-radius: 18px`.
- Botões: pílula (`9999px`).
- Inputs e selects: `12px`.
- Seções: `160px` de respiro vertical no desktop, `96px` no mobile. Conteúdo com `max-width: 1280px` e `32px` de margem lateral.

## 4. Tipografia

| Papel | Fonte | Observação |
|---|---|---|
| Títulos | **Shippori Mincho** 700/800 | substitui a Cormorant Garamond |
| Texto e interface | **Zen Kaku Gothic New** 400/500/700 | substitui a Inter |
| Rótulos e numeração | **JetBrains Mono** 400/500, 12px, caixa alta, `letter-spacing: .2em` | ex.: `01 — TURMAS E MENSALIDADE` |
| Kanji decorativo | Yuji Syuku (manter) ou Shippori Mincho | só decoração, sempre `aria-hidden` |
| Nome da marca | Shippori Mincho 800, `letter-spacing: .18em`, caixa alta | substitui a Nanum Brush Script |

Todas via `next/font/google`, como hoje. Títulos de hero: `clamp(48px, 8vw, 124px)`, `line-height: .98`.

## 5. Movimento

**Princípio:** a landing pode ter espetáculo; o academy e o portal, não.

### Fundo global (`FundoAsiatico.tsx`)
- **Manter:** seigaiha, deslizando devagar na horizontal (18s por ciclo, sem fim), opacidade `.07` no escuro e `.13` no claro.
- **Remover:** pétalas de sakura, vaga-lumes, os três brilhos e o sol com 12 raios girando. Os raios reproduzem a bandeira do sol nascente, que é polêmica fora do Japão.
- **Opcional:** hinomaru só como disco chapado, sem raios.

### Assinaturas
- **Revelação em tinta** (landing apenas): fotos aparecem por máscara de manchas que crescem conforme o scroll.
- **Garra do Tigre** (`GarraTigre`): três riscos vermelhos rasgando em sequência no hero da landing, logo depois da revelação da foto.
- **Ensō** (`Enso`): loader e separador.
- **Contador de kata**: na landing, número de movimentos (00 → 21) acompanhando o embusen desenhado no scroll.
- `FaixaAoVento`, `Makiwara`, `BokkenChoque`: ilustrações do academy, sem scroll-linking.

### Implementação
- Landing: **GSAP + ScrollTrigger** para os efeitos ligados ao scroll, carregados só nessa página (import dinâmico). Funciona em Safari/iOS, ao contrário das scroll-driven animations do CSS.
- Academy e portal: só CSS (transições de 150–350ms, `--ease-out`). Sem scroll-linking, sem parallax.
- **Sempre** respeitar `prefers-reduced-motion: reduce`: tudo aparece no estado final, sem animação.
- Nunca esconder informação essencial (preço, horário, endereço, botão de login) atrás de animação.

## 6. Landing (torakandojo.com) — estrutura aprovada

Ordem das seções, conforme o protótipo:

1. **Header**: logo + TORAKAN · Turmas · A aula · O dojo · Contato · botão "Aula grátis".
2. **Hero**: foto `hero-karate.webp` com revelação em tinta, kanji 空手道 vertical, Garra do Tigre. Título "O caminho da mão vazia, ensinado do jeito certo." Botões: "Fazer a primeira aula grátis" (→ Onde fica) e "Ver turmas e horários".
3. **01 — Turmas e mensalidade**: Infantil (7 a 12 anos, ter/qui/sex, 18h30–19h30), Avançado (13+, ter/qui/sex, 19h30–21h), card de mensalidade R$ 70/mês invertido (máx. 20 alunos, equipe de faixas pretas, primeira aula grátis).
4. **02 — Como é a aula**: Rei → Aquecimento → Kihon → Kata → Kumite → Rei, com a foto `faixa.webp`.
5. **03 — O primeiro kata**: Heian Shodan, contador 00/21 + embusen em I desenhado pelo scroll.
6. **O dojo**: foto + 180 m² de tatame, 20 alunos por turma, equipe de faixas pretas.
7. **04 — Onde fica**: Rua 15 de Novembro, 1104 · Centro · Olho d'Água das Flores – AL · 57442-000, com mapa do Google embutido (iframe com `loading="lazy"`).
8. **CTA final**: "A primeira aula é por nossa conta." Por enquanto, o botão leva ao Google Maps. O canal de contato entra depois.
9. **Rodapé**: marca, endereço, "Área do aluno" (portal.torakandojo.com), Privacidade, Termos.

**Fora da landing:** qualquer menção ou link ao portal de estudos (academy) e ao portal do aluno, exceto o link "Área do aluno" no rodapé. O conteúdo de estudo é reservado a quem já é matriculado.

## 7. Academy (academy.torakandojo.com) — didático

- Mesmos tokens, fontes e raios. Mesmo seigaiha de fundo.
- **Prioridade: encontrar e ler.** Busca, filtros e navegação claros; texto corrido com `max-width: 68ch` e `line-height: 1.7`.
- Fichas de kata e técnica em cards de 18px; kanji grande como elemento gráfico.
- Ilustrações animadas (`FaixaAoVento`, `Makiwara`, `BokkenChoque`, `Enso`) nos cabeçalhos das seções.
- Embusen e sequência de movimentos podem animar **ao clicar** (play), nunca com o scroll.
- Jornada (jogos): manter toda a mecânica. Trocar só cores, fontes e raios.
- Não alterar nenhum texto, dado, número ou ordem de conteúdo.

## 8. Portal (portal.torakandojo.com) — ferramenta

- Mesmos tokens e fontes. **Sem** seigaiha animado (no máximo estático, opacidade `.04`).
- Densidade de interface: tabelas, formulários e painéis legíveis primeiro, estética depois.
- Sem animações além de transições de estado (hover, foco, abrir e fechar modal).
- Foco visível em todos os controles: `outline: 2px solid rgb(var(--accent))`, `outline-offset: 2px`.
- Não alterar nada em fluxo de login, primeiro acesso, pagamentos, provas ou cadastro além da aparência.

## 9. Checklist de aceite (cada fase)

- [ ] `npm run build` sem erro e sem warning novo.
- [ ] Claro e escuro conferidos em 375px, 768px e 1440px.
- [ ] Contraste de texto ≥ 4.5:1 nos dois temas.
- [ ] `prefers-reduced-motion: reduce` mostra tudo parado e legível.
- [ ] Nenhum arquivo das pastas protegidas (seção 1) alterado: confira com `git diff --stat`.
- [ ] Nenhum texto do academy ou do portal alterado: confira com `git diff`.

/**
 * Tradução de um kata para o inglês.
 *
 * Só o que é texto em português entra aqui: nomes de técnica (Gedan Barai),
 * kanji, vídeo e imagens continuam vindo do kata original. `movimentos` segue
 * a mesma ordem de `movimentosDetalhados`: [tradução, direção]. O teste em
 * scripts/conferir-katas-en.mjs garante que as contagens batem.
 */
export interface KataEn {
  significadoNome: string;
  significadoLiteral?: string;
  faixaRecomendada: string;
  nivelDificuldade: string;
  posicoesKiai?: string;
  observacaoContagem?: string;
  contagemAlternativa?: string;
  comentario?: string[];
  bunkai: string[];
  resumo?: {
    significado: string;
    text: string;
    /** Significado de cada termo, na mesma ordem da decomposição original. */
    decomposicao: string[];
  };
  movimentos: [traducao: string, direcao?: string][];
}

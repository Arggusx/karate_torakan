/**
 * Embusen (演武線) — a linha de deslocamento do kata.
 *
 * O traçado é FATO sobre o kata, não obra de ninguém: o Heian Shodan desenhar
 * um "I" no chão é como dizer que a água ferve a 100 °C. Por isso é desenhado
 * aqui do zero, em coordenadas, e não copiado de ilustração de livro — a
 * ilustração tem autor, a forma não.
 *
 * Desenhar em vez de usar imagem também é o que torna a animação possível: um
 * PNG não tem caminho para percorrer; um polígono de pontos tem.
 */

/** Onde o praticante está e para onde olha, a cada movimento. */
export interface PassoEmbusen {
  /** Número do movimento, igual ao da lista do kata. */
  numero: number;
  /** Posição no tatame, em passos. x cresce à direita, y cresce para cima. */
  x: number;
  y: number;
  /** Direção do olhar em graus; 0 = frente (shomen), 90 = direita. */
  olhar: number;
  /** Base usada no movimento, quando identificada. */
  base?: string;
  /** Movimento com kiai. */
  kiai?: boolean;
  /**
   * Pontos por onde a linha passa antes de chegar neste passo, sem serem
   * parada. Servem quando o deslocamento dobra uma esquina: ligar os dois
   * movimentos direto desenharia uma diagonal que o praticante não percorre.
   */
  via?: { x: number; y: number }[];
  /**
   * Foto do movimento sendo executado, em `/public`. Opcional de propósito:
   * o diagrama funciona sem nenhuma, e cada foto que chegar aparece sozinha
   * no passo correspondente.
   */
  foto?: string;
  /** Quem aparece na foto — crédito exibido junto dela. */
  fotoCredito?: string;
}

export interface TracadoEmbusen {
  /** Nome da forma, para a legenda: "I" (工), "linha reta", etc. */
  forma: string;
  passos: PassoEmbusen[];
  /**
   * Diagrama de referência em `/public` — o embusen desenhado, exibido ao lado
   * do animado. Opcional: sem ele o espaço aparece reservado, não vazio.
   */
  imagemReferencia?: string;
  /**
   * Marcado enquanto o traçado não foi conferido contra uma referência
   * confiável. A interface avisa o leitor em vez de ensinar errado.
   */
  emConferencia?: boolean;
}

/** Extrai a base do texto do movimento ("... em Kokutsu-dachi -> ..."). */
export function baseDoMovimento(texto: string): string | undefined {
  const achado = /\b([A-Za-zÀ-ÿ]+-dachi)\b/.exec(texto);
  return achado?.[1];
}

/**
 * Traçados conhecidos, por id de kata.
 *
 * Só entram aqui os katas cujo deslocamento eu consigo afirmar. Kata sem
 * traçado confiável fica de fora de propósito: num site de estudo, embusen
 * errado ensina errado — pior do que não ter.
 */
export const TRACADOS: Record<string, TracadoEmbusen> = {
  /**
   * Heian Shodan — forma de "I" (工).
   *
   * Conferido posição a posição contra o diagrama e o descritivo do
   * karateka.it. Duas observações que explicam o traçado:
   *
   * - Aquela referência numera 22 movimentos porque conta o `age shuto uke`
   *   executado *no lugar* como movimento próprio. Ele não desloca ninguém,
   *   então aqui continua fazendo parte do nosso movimento 6 — a partir do 7
   *   a nossa numeração fica um abaixo da deles.
   * - O movimento 4 é o único assimétrico do kata. As fontes divergem sobre
   *   ele: a planilha de referência diz "sem deslocamento de passo, em
   *   zenkutsu-dachi"; o karateka.it descreve o recolhimento do pé da frente
   *   para renoji-dachi. O traçado segue a planilha, que é a mesma fonte do
   *   texto exibido ao lado do diagrama — arrow e texto precisam concordar.
   * - Mesma divergência no movimento 20: a planilha fala em giro de 180° e o
   *   karateka.it em 135°. A posição é a mesma nos dois; muda só o ângulo do
   *   olhar, que aqui segue o texto.
   *
   * Os giros de 180° (movimentos 3 e 12) voltam para a linha central porque o
   * pé de trás é que gira em arco: o pé da frente novo cai onde o de trás
   * estava. Daí 3 e 12 dividirem ponto com o início e com o 9.
   */
  "heian-shodan": {
    forma: "I (工)",
    passos: [
      { numero: 1, x: -1, y: 0, olhar: 270, base: "Zenkutsu-dachi" },
      { numero: 2, x: -2, y: 0, olhar: 270, base: "Zenkutsu-dachi" },
      { numero: 3, x: 0, y: 0, olhar: 90, base: "Zenkutsu-dachi" },
      { numero: 4, x: 0, y: 0, olhar: 90, base: "Zenkutsu-dachi" },
      { numero: 5, x: 1, y: 0, olhar: 90, base: "Zenkutsu-dachi" },
      { numero: 6, x: 0, y: 1, olhar: 0, base: "Zenkutsu-dachi" },
      { numero: 7, x: 0, y: 2, olhar: 0, base: "Zenkutsu-dachi" },
      { numero: 8, x: 0, y: 3, olhar: 0, base: "Zenkutsu-dachi" },
      { numero: 9, x: 0, y: 4, olhar: 0, base: "Zenkutsu-dachi", kiai: true },
      { numero: 10, x: 1, y: 4, olhar: 90, base: "Zenkutsu-dachi" },
      { numero: 11, x: 2, y: 4, olhar: 90, base: "Zenkutsu-dachi" },
      { numero: 12, x: 0, y: 4, olhar: 270, base: "Zenkutsu-dachi" },
      { numero: 13, x: -1, y: 4, olhar: 270, base: "Zenkutsu-dachi" },
      { numero: 14, x: 0, y: 3, olhar: 180, base: "Zenkutsu-dachi" },
      { numero: 15, x: 0, y: 2, olhar: 180, base: "Zenkutsu-dachi" },
      { numero: 16, x: 0, y: 1, olhar: 180, base: "Zenkutsu-dachi" },
      { numero: 17, x: 0, y: 0, olhar: 180, base: "Zenkutsu-dachi", kiai: true },
      { numero: 18, x: -1, y: 0, olhar: 270, base: "Kokutsu-dachi" },
      { numero: 19, x: -1.71, y: 0.71, olhar: 315, base: "Kokutsu-dachi" },
      { numero: 20, x: 0, y: 0, olhar: 135, base: "Kokutsu-dachi" },
      { numero: 21, x: 0.71, y: 0.71, olhar: 45, base: "Kokutsu-dachi" },
    ],
  },

  /**
   * Heian Nidan — forma de "I" (工), com o início no meio da haste.
   *
   * Posições lidas do diagrama de referência (numeração idêntica à nossa, já
   * que a lista tem os 26 movimentos) e conferidas contra o texto de cada
   * movimento. Os agrupamentos do diagrama batem um a um:
   *
   *   {1,2,3}  um passo à esquerda   — as três técnicas do primeiro lado
   *   {4,5,6}  no ponto de início    — o giro de 180° traz de volta
   *   {7,22,25} meio passo atrás     — o yoko-geri e o começo do final
   *   {8}      no ponto de início    — retoma a linha central
   *   {9,17,18,19} / {10,16} / {11,14} — ida e volta pela haste
   *
   * Fica em conferência porque as posições vieram da leitura de um diagrama em
   * baixa resolução: a topologia eu afirmo, os meios-passos não.
   */
  /**
   * Heian Nidan — corredor central com leques de diagonais nas duas pontas.
   *
   * Contagem de passos confirmada pelo praticante, trecho a trecho:
   *
   *   1-6     uma posição só (muda a base, não o lugar)
   *   7-8     preparação e chute para trás — recua no corredor
   *   9-11    três passos à frente (kiai no 11)
   *   12-15   quatro passos: o leque de shuto no fundo
   *   16-22   quatro passos voltando (16 / 17-19 / 20-21 / 22)
   *   23-26   quatro passos: o leque final, perto do início
   *
   * A forma veio do SVG do diagrama revisado — que mostra o corredor desenhado
   * como duas verticais paralelas, porque é a mesma linha percorrida na ida e
   * na volta.
   */
  "heian-nidan": {
    forma: "Corredor com leques",
    emConferencia: true,
    passos: [
      { numero: 1, x: -1, y: 0, olhar: 270, base: "Kokutsu-dachi" },
      { numero: 2, x: -1, y: 0, olhar: 270, base: "Kokutsu-dachi" },
      { numero: 3, x: -1, y: 0, olhar: 270, base: "Kokutsu-dachi" },
      { numero: 4, x: -1, y: 0, olhar: 90, base: "Kokutsu-dachi" },
      { numero: 5, x: -1, y: 0, olhar: 90, base: "Kokutsu-dachi" },
      { numero: 6, x: -1, y: 0, olhar: 90, base: "Kokutsu-dachi" },
      // O 7 desce pelo corredor, mas o caminho até lá dobra a esquina: corre
      // pela horizontal do 1-3 até o centro e só então desce. Sem o `via` a
      // linha cortaria em diagonal, que é um caminho que ninguém percorre.
      { numero: 7, x: 0, y: -1, olhar: 180, base: "Kosa-dachi", via: [{ x: 0, y: 0 }] },
      { numero: 8, x: 0, y: 0, olhar: 0, base: "Kokutsu-dachi" },
      { numero: 9, x: 0, y: 1, olhar: 0, base: "Kokutsu-dachi" },
      { numero: 10, x: 0, y: 2, olhar: 0, base: "Kokutsu-dachi" },
      { numero: 11, x: 0, y: 3, olhar: 0, base: "Zenkutsu-dachi", kiai: true },
      // O leque do fundo vai para a DIREITA primeiro (12 e 13), volta ao
      // centro no 14 e só então abre à esquerda no 15.
      { numero: 12, x: 1, y: 3, olhar: 90, base: "Kokutsu-dachi" },
      { numero: 13, x: 1.7, y: 2.3, olhar: 135, base: "Kokutsu-dachi" },
      { numero: 14, x: 0, y: 3, olhar: 270, base: "Kokutsu-dachi" },
      { numero: 15, x: -0.7, y: 2.3, olhar: 225, base: "Kokutsu-dachi" },
      // Volta pelo corredor: quatro contagens, terminando no morote-uke (22).
      { numero: 16, x: 0, y: 3, olhar: 180, base: "Zenkutsu-dachi" },
      { numero: 17, x: 0, y: 2, olhar: 180, base: "Zenkutsu-dachi" },
      { numero: 18, x: 0, y: 2, olhar: 180, base: "Zenkutsu-dachi" },
      { numero: 19, x: 0, y: 2, olhar: 180, base: "Zenkutsu-dachi" },
      { numero: 20, x: 0, y: 1, olhar: 180, base: "Zenkutsu-dachi" },
      { numero: 21, x: 0, y: 1, olhar: 180, base: "Zenkutsu-dachi" },
      { numero: 22, x: 0, y: 0, olhar: 180, base: "Zenkutsu-dachi" },
      // Leque final, junto do yoi. O 23 corre reto pela mesma linha do 1-3 —
      // não é diagonal. Só depois dele o traçado abre nas diagonais.
      { numero: 23, x: -1, y: 0, olhar: 270, base: "Zenkutsu-dachi" },
      { numero: 24, x: -1.7, y: 0.7, olhar: 315, base: "Zenkutsu-dachi" },
      { numero: 25, x: 0, y: 0, olhar: 90, base: "Zenkutsu-dachi" },
      { numero: 26, x: 1, y: 0.7, olhar: 45, base: "Zenkutsu-dachi", kiai: true },
    ],
  },

  /**
   * Heian Sandan — forma de "T", com a barra curta e o corredor longo.
   *
   * Refeito a partir do SVG do diagrama revisado, e não mais do texto dos
   * movimentos. A diferença foi grande: eu tinha deduzido a barra maior que o
   * corredor, e no desenho é o contrário — a barra mede 142 px contra 408 px
   * do corredor, quase 1 para 3. Aqui a proporção é a mesma.
   *
   * A repartição dos movimentos por trecho vem das anotações do diagrama:
   *
   *   1-3    barra, para a esquerda        11-18  desce o mesmo corredor
   *   4-6    mesma barra, voltando          19    barra de novo
   *   7-10   sobe o corredor (kiai no 10)   20    barra, fechando (kiai)
   *
   * Origem: o `yoi` do SVG, em (470, 590), na junção da barra com o corredor.
   * Escala: 102 px por passo, medidos na travessia 1-3.
   */
  "heian-sandan": {
    forma: "T",
    emConferencia: true,
    passos: [
      { numero: 1, x: -1, y: 0, olhar: 270, base: "Kokutsu-dachi" },
      { numero: 2, x: -1, y: 0, olhar: 270, base: "Heisoku-dachi" },
      { numero: 3, x: -1, y: 0, olhar: 270, base: "Heisoku-dachi" },
      { numero: 4, x: 0, y: 0, olhar: 90, base: "Kokutsu-dachi" },
      { numero: 5, x: 0, y: 0, olhar: 90, base: "Heisoku-dachi" },
      { numero: 6, x: 0, y: 0, olhar: 90, base: "Heisoku-dachi" },
      { numero: 7, x: 0, y: 1, olhar: 0, base: "Kokutsu-dachi" },
      { numero: 8, x: 0, y: 2, olhar: 0, base: "Zenkutsu-dachi" },
      { numero: 9, x: 0, y: 3, olhar: 270, base: "Kiba-dachi" },
      { numero: 10, x: 0, y: 4, olhar: 0, base: "Zenkutsu-dachi", kiai: true },
      { numero: 11, x: 0, y: 4, olhar: 180, base: "Heisoku-dachi" },
      { numero: 12, x: 0, y: 3, olhar: 90, base: "Kiba-dachi" },
      { numero: 13, x: 0, y: 3, olhar: 90, base: "Kiba-dachi" },
      { numero: 14, x: 0, y: 2, olhar: 270, base: "Kiba-dachi" },
      { numero: 15, x: 0, y: 2, olhar: 270, base: "Kiba-dachi" },
      { numero: 16, x: 0, y: 1, olhar: 90, base: "Kiba-dachi" },
      { numero: 17, x: 0, y: 1, olhar: 90, base: "Kiba-dachi" },
      { numero: 18, x: 0, y: 0, olhar: 180, base: "Zenkutsu-dachi" },
      // 19 gira sem andar; quem desloca é o 20, um yori-ashi curto para a
      // direita. Confirmado pelo praticante — a planilha dizia 180° no 19.
      { numero: 19, x: 0, y: 0, olhar: 90, base: "Kiba-dachi" },
      { numero: 20, x: 0.4, y: 0, olhar: 90, base: "Kiba-dachi", kiai: true },
    ],
  },

  /**
   * Heian Yondan — haste central com diagonais nas duas pontas.
   *
   * A abertura (movimentos 1 e 2) está desenhada a 45°, e não a 90° como diz
   * o texto da nossa lista: o kata abre nas duas diagonais, e é o que aparece
   * nos diagramas de referência. Divergência anotada de propósito.
   *
   * O trecho 22-27 foi refeito depois de conferir com o cartaz da ISO: lá o
   * pico das diagonais é o ponto mais distante do kata, sem nada acima dele.
   * Antes a haste seguia além do pico, e o kata não voltava para o ponto de
   * partida — que é uma coisa que todo kata faz.
   */
  "heian-yondan": {
    forma: "Haste com diagonais",
    emConferencia: true,
    passos: [
      { numero: 1, x: -0.71, y: 0.71, olhar: 315, base: "Kokutsu-dachi" },
      { numero: 2, x: 0.71, y: 0.71, olhar: 45, base: "Kokutsu-dachi" },
      { numero: 3, x: 0, y: 1, olhar: 0, base: "Zenkutsu-dachi" },
      { numero: 4, x: 0, y: 2, olhar: 0, base: "Kokutsu-dachi" },
      { numero: 5, x: 0, y: 2, olhar: 270 },
      { numero: 6, x: 0, y: 2, olhar: 270 },
      { numero: 7, x: -1, y: 2, olhar: 270, base: "Zenkutsu-dachi" },
      { numero: 8, x: 0, y: 2, olhar: 90 },
      { numero: 9, x: 0, y: 2, olhar: 90 },
      { numero: 10, x: 1, y: 2, olhar: 90, base: "Zenkutsu-dachi" },
      { numero: 11, x: 0, y: 2, olhar: 0 },
      { numero: 12, x: 0, y: 3, olhar: 0, base: "Kosa-dachi" },
      { numero: 13, x: 0, y: 3, olhar: 0, base: "Kosa-dachi", kiai: true },
      { numero: 14, x: -0.71, y: 2.29, olhar: 225, base: "Kokutsu-dachi" },
      { numero: 15, x: -1.41, y: 1.58, olhar: 225, base: "Zenkutsu-dachi" },
      { numero: 16, x: -2.12, y: 0.87, olhar: 225, base: "Zenkutsu-dachi" },
      { numero: 17, x: -2.12, y: 0.87, olhar: 225, base: "Zenkutsu-dachi" },
      { numero: 18, x: 0.71, y: 2.29, olhar: 135, base: "Kokutsu-dachi" },
      { numero: 19, x: 1.41, y: 1.58, olhar: 135, base: "Zenkutsu-dachi" },
      { numero: 20, x: 2.12, y: 0.87, olhar: 135, base: "Zenkutsu-dachi" },
      { numero: 21, x: 2.12, y: 0.87, olhar: 135, base: "Zenkutsu-dachi" },
      { numero: 22, x: 0, y: 2, olhar: 0, base: "Kokutsu-dachi" },
      { numero: 23, x: 0, y: 3, olhar: 0, base: "Kokutsu-dachi" },
      { numero: 24, x: 0, y: 3, olhar: 0, base: "Kokutsu-dachi" },
      { numero: 25, x: 0, y: 3, olhar: 0, base: "Zenkutsu-dachi", kiai: true },
      { numero: 26, x: 0, y: 2, olhar: 180, base: "Kokutsu-dachi" },
      { numero: 27, x: 0, y: 1, olhar: 180, base: "Kokutsu-dachi" },
    ],
  },

  /**
   * Heian Godan — haste central, com o salto do movimento 17 no meio dela.
   *
   * O trecho 12-21 é o mais incerto daqui: o texto encadeia vários giros de
   * 180° sem dizer quanto cada um desloca, e o salto não deixa rastro na
   * descrição. A forma geral responde; os passos do meio, não.
   */
  "heian-godan": {
    forma: "Haste central",
    emConferencia: true,
    passos: [
      { numero: 1, x: -1, y: 0, olhar: 270, base: "Kokutsu-dachi" },
      { numero: 2, x: -1, y: 0, olhar: 270, base: "Kokutsu-dachi" },
      { numero: 3, x: -1, y: 0, olhar: 270, base: "Heisoku-dachi" },
      { numero: 4, x: 1, y: 0, olhar: 90, base: "Kokutsu-dachi" },
      { numero: 5, x: 1, y: 0, olhar: 90, base: "Kokutsu-dachi" },
      { numero: 6, x: 1, y: 0, olhar: 90, base: "Heisoku-dachi" },
      { numero: 7, x: 0, y: 1, olhar: 0, base: "Kokutsu-dachi" },
      { numero: 8, x: 0, y: 2, olhar: 0, base: "Zenkutsu-dachi" },
      { numero: 9, x: 0, y: 2, olhar: 0, base: "Zenkutsu-dachi" },
      { numero: 10, x: 0, y: 3, olhar: 0, base: "Zenkutsu-dachi" },
      { numero: 11, x: 0, y: 4, olhar: 0, base: "Zenkutsu-dachi", kiai: true },
      { numero: 12, x: 0, y: 3, olhar: 180, base: "Kiba-dachi" },
      { numero: 13, x: 0, y: 2, olhar: 0, base: "Kiba-dachi" },
      { numero: 14, x: 0, y: 2, olhar: 0, base: "Kiba-dachi" },
      { numero: 15, x: 0, y: 2, olhar: 0, base: "Kosa-dachi" },
      { numero: 16, x: 0, y: 2, olhar: 270, base: "Renoji-dachi" },
      { numero: 17, x: 0, y: 1, olhar: 90, base: "Kosa-dachi" },
      { numero: 18, x: 0, y: 1, olhar: 180, base: "Zenkutsu-dachi", kiai: true },
      { numero: 19, x: 0, y: 2, olhar: 0, base: "Zenkutsu-dachi" },
      { numero: 20, x: 0, y: 2, olhar: 0, base: "Kokutsu-dachi" },
      { numero: 21, x: 1, y: 2, olhar: 90, base: "Zenkutsu-dachi" },
      { numero: 22, x: 1, y: 2, olhar: 90, base: "Kokutsu-dachi" },
      { numero: 23, x: 0, y: 1, olhar: 180, base: "Kokutsu-dachi" },
    ],
  },

  /*
    Os três Tekki dividem o mesmo embusen: uma linha reta, na mesma direção,
    mudando só a extensão. O praticante fica de frente (shomen) o tempo todo
    em kiba-dachi e viaja de lado — quem vira é a cabeça, não o corpo. Por
    isso `olhar` é 0 em todos os passos: a cunha do diagrama apontando sempre
    para a frente é a informação correta, não um bug.

    O deslocamento sai dos kosa-dachi: no Tekki toda postura cruzada é um
    passo de travessia pela linha. Os meios-passos marcam a travessia em si.
  */
  /**
   * Tekki Shodan — linha reta, e curta: o kata inteiro cabe em três posições.
   *
   * O praticante confirmou que o ponto mais distante do yoi é **um passo**
   * para cada lado. Então tudo acontece em −1, 0 e +1, e a maior parte dos 29
   * movimentos é executada sem sair do lugar, só mudando para onde se olha.
   *
   * Os dois kosa-dachi (7 e 21) estão no próprio ponto de partida, marcados
   * com o X no diagrama: são a travessia, não uma posição nova.
   *
   * As direções do olhar vêm do quadro "PARA ONDE OLHA" do diagrama revisado.
   * Elas importam mais que a posição aqui — num kata que quase não anda, o que
   * muda a cada contagem é a frente do corpo.
   */
  "tekki-shodan": {
    forma: "Linha reta (一)",
    emConferencia: true,
    passos: [
      { numero: 1, x: 1, y: 0, olhar: 90, base: "Kosa-dachi" },
      { numero: 2, x: 1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 3, x: 1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 4, x: 1, y: 0, olhar: 270, base: "Kiba-dachi" },
      { numero: 5, x: 1, y: 0, olhar: 270, base: "Kiba-dachi" },
      { numero: 6, x: 1, y: 0, olhar: 270, base: "Kiba-dachi" },
      { numero: 7, x: 0, y: 0, olhar: 90, base: "Kosa-dachi" },
      { numero: 8, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 9, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 10, x: -1, y: 0, olhar: 90, base: "Kiba-dachi" },
      { numero: 11, x: -1, y: 0, olhar: 90, base: "Kiba-dachi" },
      { numero: 12, x: -1, y: 0, olhar: 270, base: "Kiba-dachi" },
      { numero: 13, x: -1, y: 0, olhar: 270, base: "Kiba-dachi" },
      { numero: 14, x: -1, y: 0, olhar: 270, base: "Kiba-dachi" },
      { numero: 15, x: -1, y: 0, olhar: 270, base: "Kiba-dachi", kiai: true },
      { numero: 16, x: -1, y: 0, olhar: 270, base: "Kiba-dachi" },
      { numero: 17, x: -1, y: 0, olhar: 270, base: "Kiba-dachi" },
      { numero: 18, x: -1, y: 0, olhar: 90, base: "Kiba-dachi" },
      { numero: 19, x: -1, y: 0, olhar: 90, base: "Kiba-dachi" },
      { numero: 20, x: -1, y: 0, olhar: 90, base: "Kiba-dachi" },
      { numero: 21, x: 0, y: 0, olhar: 270, base: "Kosa-dachi" },
      { numero: 22, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 23, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 24, x: 0, y: 0, olhar: 90, base: "Kiba-dachi" },
      { numero: 25, x: 0, y: 0, olhar: 90, base: "Kiba-dachi" },
      { numero: 26, x: 0, y: 0, olhar: 270, base: "Kiba-dachi" },
      { numero: 27, x: 0, y: 0, olhar: 270, base: "Kiba-dachi" },
      { numero: 28, x: 0, y: 0, olhar: 90, base: "Kiba-dachi" },
      { numero: 29, x: 0, y: 0, olhar: 90, base: "Kiba-dachi", kiai: true },
    ],
  },

  "tekki-nidan": {
    forma: "Linha reta (一)",
    emConferencia: true,
    passos: [
      { numero: 1, x: 0.5, y: 0, olhar: 0, base: "Kosa-dachi" },
      { numero: 2, x: 1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 3, x: 0.5, y: 0, olhar: 0, base: "Kosa-dachi" },
      { numero: 4, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 5, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 6, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 7, x: -0.5, y: 0, olhar: 0, base: "Kosa-dachi" },
      { numero: 8, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 9, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 10, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 11, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 12, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 13, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 14, x: -0.5, y: 0, olhar: 0, base: "Kosa-dachi" },
      { numero: 15, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 16, x: 0, y: 0, olhar: 0, base: "Kiba-dachi", kiai: true },
      { numero: 17, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 18, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 19, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 20, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 21, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 22, x: 0.5, y: 0, olhar: 0, base: "Kosa-dachi" },
      { numero: 23, x: 1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 24, x: 1, y: 0, olhar: 0, base: "Kiba-dachi", kiai: true },
    ],
  },

  "tekki-sandan": {
    forma: "Linha reta (一)",
    emConferencia: true,
    passos: [
      { numero: 1, x: 1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 2, x: 1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 3, x: 1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 4, x: 1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 5, x: 1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 6, x: 1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 7, x: 1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 8, x: 1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 9, x: 0.5, y: 0, olhar: 0, base: "Kosa-dachi" },
      { numero: 10, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 11, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 12, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 13, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 14, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 15, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 16, x: 0, y: 0, olhar: 0, base: "Kiba-dachi", kiai: true },
      { numero: 17, x: 0, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 18, x: -0.5, y: 0, olhar: 0, base: "Kosa-dachi" },
      { numero: 19, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 20, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 21, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 22, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 23, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 24, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 25, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 26, x: -1.5, y: 0, olhar: 0, base: "Kosa-dachi" },
      { numero: 27, x: -2, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 28, x: -2, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 29, x: -2, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 30, x: -2, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 31, x: -2, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 32, x: -2, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 33, x: -1.5, y: 0, olhar: 0, base: "Kosa-dachi" },
      { numero: 34, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 35, x: -1, y: 0, olhar: 0, base: "Kiba-dachi" },
      { numero: 36, x: -1, y: 0, olhar: 0, base: "Kiba-dachi", kiai: true },
    ],
  },
};

export function tracadoDoKata(id: string): TracadoEmbusen | undefined {
  return TRACADOS[id];
}

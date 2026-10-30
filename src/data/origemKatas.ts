/**
 * De onde veio cada um dos 26 katas: o nome que tinha em Okinawa, a escola
 * (linhagem) que o guardou e a história em poucas linhas.
 *
 * Fonte: a tradição registrada pelas organizações Shotokan e pela
 * historiografia do karatê de Okinawa (Funakoshi, "Karate-dō Kyōhan";
 * Nakayama, "Best Karate"; McCarthy, "Bubishi"). Muita coisa sobre os katas
 * antigos é tradição oral — onde as versões divergem, o texto diz "segundo a
 * tradição" ou "atribuído a", em vez de afirmar.
 */

export type Linhagem = "Shuri-te" | "Tomari-te" | "Naha-te" | "Japão";

export interface OrigemKata {
  /** id da ficha em katas26Detalhados. */
  id: string;
  /** Nome que o kata tinha em Okinawa, antes de Funakoshi renomear. */
  nomeOriginal: string;
  linhagem: Linhagem;
  /** Quem criou, trouxe ou preservou — em poucas palavras. */
  quem: string;
  /** Época aproximada. */
  epoca: string;
  historia: string;
}

/** As escolas de Okinawa de onde os katas vieram. */
export const LINHAGENS: {
  id: Linhagem;
  kanji: string;
  lugar: string;
  resumo: string;
}[] = [
  {
    id: "Shuri-te",
    kanji: "首里手",
    lugar: "Shuri, a capital do reino",
    resumo:
      "A escola da corte, de Sōkon Matsumura e Ankō Itosu. Movimentos rápidos e retos, bases altas e naturais. É a raiz principal do Shotokan: Funakoshi aprendeu com Itosu e Azato.",
  },
  {
    id: "Tomari-te",
    kanji: "泊手",
    lugar: "Tomari, a vila do porto",
    resumo:
      "Vizinha de Shuri e muito parecida com ela, guardou katas que chegaram com marinheiros e enviados chineses — Wanshu, Rohai, Wankan e a família Jion.",
  },
  {
    id: "Naha-te",
    kanji: "那覇手",
    lugar: "Naha, o porto comercial",
    resumo:
      "Mais próxima do boxe do sul da China: bases firmes, respiração controlada e trabalho de curta distância. Daí vêm Seishan (Hangetsu) e, pela linha de Arakaki, Sochin e Nijushiho.",
  },
];

export const ORIGEM_KATAS: OrigemKata[] = [
  {
    id: "heian-shodan",
    nomeOriginal: "Pinan Nidan",
    linhagem: "Shuri-te",
    quem: "Ankō Itosu",
    epoca: "c. 1904",
    historia:
      "Itosu criou os cinco Pinan para levar o karatê às escolas públicas de Okinawa: em vez de começar por katas longos e cheios de segredos, o aluno aprendia peças menores, tiradas sobretudo do Kusanku (Kanku Dai). Quando Funakoshi levou a série ao Japão, renomeou-a Heian (“paz e tranquilidade”) e inverteu a ordem dos dois primeiros: o Pinan Nidan de Itosu, mais simples, virou o Heian Shodan.",
  },
  {
    id: "heian-nidan",
    nomeOriginal: "Pinan Shodan",
    linhagem: "Shuri-te",
    quem: "Ankō Itosu",
    epoca: "c. 1904",
    historia:
      "Era o primeiro Pinan de Itosu e passou a segundo no Japão. Traz as primeiras defesas duplas e o mae-geri dentro do kata. Muitos professores o veem como uma preparação para o Bassai Dai, que repete a ideia de defender e contra-atacar mudando de direção.",
  },
  {
    id: "heian-sandan",
    nomeOriginal: "Pinan Sandan",
    linhagem: "Shuri-te",
    quem: "Ankō Itosu",
    epoca: "c. 1904",
    historia:
      "O terceiro Pinan apresenta as defesas em sequência rápida e o trabalho de cotovelo (empi-uchi) em kiba-dachi. As combinações de bloqueio dos dois braços lembram as do Jitte, e por isso a ISO o põe como degrau para ele.",
  },
  {
    id: "heian-yondan",
    nomeOriginal: "Pinan Yondan",
    linhagem: "Shuri-te",
    quem: "Ankō Itosu",
    epoca: "c. 1904",
    historia:
      "Mais longo e com mudanças de ritmo, é o Pinan que mais se parece com o Kusanku de onde Itosu tirou o material. Os chutes laterais e a postura em uma perna preparam o Gankaku; as técnicas de mão aberta, o Empi.",
  },
  {
    id: "heian-godan",
    nomeOriginal: "Pinan Godan",
    linhagem: "Shuri-te",
    quem: "Ankō Itosu",
    epoca: "c. 1904",
    historia:
      "Fecha a série com o salto e a defesa em cruz (juji-uke). A ideia de girar e mudar de base sem perder o centro reaparece no Hangetsu, por isso o cartaz da ISO os liga.",
  },
  {
    id: "tekki-shodan",
    nomeOriginal: "Naihanchi Shodan",
    linhagem: "Shuri-te",
    quem: "Matsumura e Itosu",
    epoca: "antes de 1800 (tradição)",
    historia:
      "Um dos katas mais antigos de Shuri, todo feito de lado, em base de cavaleiro. Funakoshi o treinou por anos com Itosu e o renomeou Tekki (“cavalo de ferro”) por causa da kiba-dachi. Uma explicação tradicional para o deslocamento só lateral é o treino de luta com as costas contra uma parede ou num barco.",
  },
  {
    id: "tekki-nidan",
    nomeOriginal: "Naihanchi Nidan",
    linhagem: "Shuri-te",
    quem: "atribuído a Itosu",
    epoca: "fim do séc. XIX",
    historia:
      "O Naihanchi original era um só. O segundo e o terceiro costumam ser atribuídos a Itosu, que os montou a partir do primeiro para treinar outras combinações na mesma base. Funakoshi manteve a série no Shotokan como Tekki.",
  },
  {
    id: "tekki-sandan",
    nomeOriginal: "Naihanchi Sandan",
    linhagem: "Shuri-te",
    quem: "atribuído a Itosu",
    epoca: "fim do séc. XIX",
    historia:
      "Fecha a série Tekki com as técnicas mais rápidas e circulares das três. Como o Nidan, é tido como criação de Itosu sobre a base do Naihanchi antigo.",
  },
  {
    id: "bassai-dai",
    nomeOriginal: "Passai",
    linhagem: "Tomari-te",
    quem: "linha de Matsumura",
    epoca: "séc. XVIII–XIX",
    historia:
      "Havia várias versões do Passai em Okinawa — de Tomari, de Shuri, de Matsumura. O nome costuma ser lido como “romper a fortaleza”, pela energia com que o kata avança e troca de direção. O Shotokan herdou a forma ensinada por Itosu, e Funakoshi a fez kata de exame de faixa preta.",
  },
  {
    id: "kanku-dai",
    nomeOriginal: "Kusanku (Kūshankū)",
    linhagem: "Shuri-te",
    quem: "Kūshankū, enviado chinês",
    epoca: "c. 1756",
    historia:
      "O nome vem de Kūshankū, oficial chinês que, segundo um registro de 1762 (o Ōshima Hikki), demonstrou sua arte em Okinawa. O kata passou por Sakugawa e Matsumura até Itosu, que tirou dele boa parte dos Pinan. Era o kata preferido de Funakoshi, que o chamou Kanku (“contemplar o céu”) pela abertura em que as mãos formam uma janela acima da cabeça.",
  },
  {
    id: "jion",
    nomeOriginal: "Jion",
    linhagem: "Tomari-te",
    quem: "tradição de Tomari",
    epoca: "origem incerta",
    historia:
      "O nome é o de um templo budista (Jion-ji), e a tradição diz que monges praticavam formas assim. Forma uma família com Jitte e Jiin: os três começam com a mesma saudação, a mão esquerda cobrindo o punho direito. É um kata de bases fortes e ritmo constante, muito usado como referência técnica.",
  },
  {
    id: "empi",
    nomeOriginal: "Wanshu",
    linhagem: "Tomari-te",
    quem: "Wanshu, enviado chinês",
    epoca: "c. 1683",
    historia:
      "Leva o nome de Wang Ji (Wanshu), enviado chinês que esteve em Okinawa em 1683; o kata foi preservado em Tomari. Funakoshi o renomeou Enpi, “voo da andorinha”, pelos movimentos de descer e subir rápido, como a ave rente à água.",
  },
  {
    id: "hangetsu",
    nomeOriginal: "Seishan (Seisan)",
    linhagem: "Naha-te",
    quem: "tradição de Naha e Shuri",
    epoca: "um dos mais antigos",
    historia:
      "Seishan é um dos katas mais antigos de Okinawa e existe em quase todos os estilos, de Naha e de Shuri. Funakoshi o chamou Hangetsu (“meia-lua”) pelos passos em arco da base que leva o mesmo nome. A respiração controlada e os movimentos lentos e tensos mostram a herança de Naha-te.",
  },
  {
    id: "gankaku",
    nomeOriginal: "Chinto",
    linhagem: "Shuri-te",
    quem: "Chinto, náufrago chinês (tradição)",
    epoca: "séc. XIX",
    historia:
      "A tradição conta que um náufrago chinês chamado Chinto se escondia em Okinawa e foi enfrentado por Matsumura, que acabou aprendendo com ele. Funakoshi o renomeou Gankaku, “grou sobre a rocha”, pela postura em uma perna só (tsuru-ashi-dachi) que marca o kata.",
  },
  {
    id: "jitte",
    nomeOriginal: "Jitte",
    linhagem: "Tomari-te",
    quem: "tradição de Tomari",
    epoca: "origem incerta",
    historia:
      "“Dez mãos”: a explicação tradicional é que quem domina o kata vale por dez. Da família do Jion, tem muitas aplicações contra quem ataca com bastão — várias defesas são feitas com as mãos abertas, como quem segura o bō.",
  },
  {
    id: "bassai-sho",
    nomeOriginal: "Passai Shō",
    linhagem: "Shuri-te",
    quem: "atribuído a Itosu",
    epoca: "fim do séc. XIX",
    historia:
      "A versão “pequena” do Passai costuma ser atribuída a Itosu. Apesar do nome, não é mais fácil: traz defesas contra bastão e técnicas de mão aberta que não estão no Bassai Dai.",
  },
  {
    id: "kanku-sho",
    nomeOriginal: "Kusanku Shō",
    linhagem: "Shuri-te",
    quem: "atribuído a Itosu",
    epoca: "fim do séc. XIX",
    historia:
      "Itosu teria criado esta versão menor do Kusanku. Mantém a abertura e o espírito do Kanku Dai, mas acrescenta um salto e trabalho de chão diferentes.",
  },
  {
    id: "chinte",
    nomeOriginal: "Chinte",
    linhagem: "Shuri-te",
    quem: "origem chinesa (tradição)",
    epoca: "origem incerta",
    historia:
      "“Mãos raras”, pelas técnicas que não aparecem em outros katas — golpes com a ponta dos dedos e com a junta de um dedo só. Acredita-se que venha de uma forma chinesa antiga. Funakoshi chegou a chamá-lo Shōin, mas o nome Chinte prevaleceu.",
  },
  {
    id: "unsu",
    nomeOriginal: "Unshu",
    linhagem: "Shuri-te",
    quem: "linha de Arakaki (tradição)",
    epoca: "séc. XIX",
    historia:
      "“Mãos de nuvem”. A origem não é clara; costuma ser ligado à linhagem de Seishō Arakaki e chegou ao Shotokan pela JKA. É um dos katas mais difíceis da série, com o salto em giro e o chute dado do chão.",
  },
  {
    id: "sochin",
    nomeOriginal: "Sōchin",
    linhagem: "Naha-te",
    quem: "linha de Arakaki; Yoshitaka Funakoshi",
    epoca: "séc. XIX; reformulado c. 1930",
    historia:
      "Vem da linha de Seishō Arakaki, em Naha. A versão do Shotokan foi muito reformulada por Yoshitaka (Gigō) Funakoshi, filho do fundador, que deu ao kata a base larga e firme chamada sōchin-dachi (fudō-dachi): “força tranquila”.",
  },
  {
    id: "nijushiho",
    nomeOriginal: "Niseishi",
    linhagem: "Naha-te",
    quem: "linha de Arakaki",
    epoca: "séc. XIX",
    historia:
      "Niseishi quer dizer “24” em chinês, e Nijūshiho, “24 passos”. Ligado à linha de Arakaki, alterna movimentos suaves com explosões súbitas. Funakoshi o chamou Hakkō, mas o nome Nijushiho é o que ficou.",
  },
  {
    id: "gojushiho-dai",
    nomeOriginal: "Useishi",
    linhagem: "Shuri-te",
    quem: "linha de Matsumura",
    epoca: "séc. XIX",
    historia:
      "Useishi é “54” em chinês: “54 passos”. Funakoshi o chamou Hotaku, “pica-pau”, pelas técnicas com a ponta dos dedos. O Shotokan guarda duas versões, Dai e Shō, e a JKA chegou a inverter os nomes das duas em relação ao uso antigo.",
  },
  {
    id: "gojushiho-sho",
    nomeOriginal: "Useishi",
    linhagem: "Shuri-te",
    quem: "linha de Matsumura",
    epoca: "séc. XIX",
    historia:
      "A outra metade do Useishi. Mais rápido e com mais técnicas de mão aberta que o Dai, os dois são estudados juntos: mesma estrutura, ênfases diferentes.",
  },
  {
    id: "meikyo",
    nomeOriginal: "Rōhai",
    linhagem: "Shuri-te",
    quem: "Matsumora (Tomari); Itosu",
    epoca: "séc. XIX",
    historia:
      "O Rōhai (“garça branca”) vem de Tomari; Itosu criou três versões dele. O Meikyō do Shotokan sai dessa família. O nome quer dizer “espelho polido”: o kata começa com um gesto que lembra limpar um espelho, imagem de uma mente clara.",
  },
  {
    id: "jiin",
    nomeOriginal: "Jiin",
    linhagem: "Tomari-te",
    quem: "tradição de Tomari",
    epoca: "origem incerta",
    historia:
      "O terceiro da família Jion, com a mesma saudação de abertura. Funakoshi chegou a chamá-lo Shōkyō, mas o nome antigo voltou. É pouco praticado fora do Shotokan e de algumas escolas de Okinawa.",
  },
  {
    id: "wankan",
    nomeOriginal: "Wankan",
    linhagem: "Tomari-te",
    quem: "tradição de Tomari (Matsumora)",
    epoca: "séc. XIX",
    historia:
      "“Coroa do rei”. Preservado em Tomari, é o kata mais curto dos 26. Funakoshi o chamou Shiōfū, e ele também aparece com os nomes Hitō e Ōkan. A brevidade engana: cada técnica precisa ser decisiva.",
  },
];

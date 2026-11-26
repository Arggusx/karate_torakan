import type { Idioma } from "@/i18n/idioma";

/**
 * Textos da Home do academy (/estudos e /en/estudos). Os hrefs dos cartões
 * são relativos a /estudos; a página acrescenta o prefixo do idioma.
 */

export interface PilarNav {
  caminho: "/estudos/historia" | "/estudos/tecnicas" | "/estudos/fundamentos";
  titulo: string;
  subtitulo: string;
  descricao: string;
  dentro: string[];
}

/** Os três pilares do treino em inglês, indexados pelo nome (Kihon, Kata, Kumite). */
export const PILARES_TREINO_EN: Record<
  string,
  { pt: string; tagline: string; oque_e: string; para_que_serve: string }
> = {
  Kihon: {
    pt: "Basic Techniques and Fundamentals",
    tagline: "The biomechanical matrix and the foundation of every technique.",
    oque_e:
      "Methodical, exhaustive training of the fundamental techniques in isolation — stances (dachi), punches (tsuki), blocks (uke) and kicks (keri) — repeated over and over along straight lines and turns.",
    para_que_serve:
      "Building neuromuscular memory, correcting posture and skeletal alignment, generating instant power and making sure the reaction in combat happens without mental hesitation.",
  },
  Kata: {
    pt: "Forms and Choreographed Combat",
    tagline: "The living, historical encyclopedia of the Shotokan style.",
    oque_e:
      "Structured sequences of defensive and offensive moves against several imaginary opponents, traced along a geometric floor pattern (Enbusen).",
    para_que_serve:
      "Preserving the traditional martial repertoire, training rhythmic shifts of balance and breath control, and uncovering practical applications for real self-defence (Bunkai).",
  },
  Kumite: {
    pt: "Practical Sparring with a Partner",
    tagline: "The laboratory for testing under pressure and real confrontation.",
    oque_e:
      "The direct, controlled application of the fundamentals against a real opponent, progressing from prearranged sparring (Gohon/Sanbon/Ippon Kumite) to free sparring (Jiyu Kumite).",
    para_que_serve:
      "Calibrating the sense of critical distance (Maai) and reaction time (Timing), reading the opponent's intentions, self-control under stress and respect for your partner's physical safety.",
  },
};

export const TEXTOS_HOME = {
  pt: {
    metaTitulo: "Portal de Estudos",
    sobretitulo: "Portal de Estudos",
    titulo: "O acervo completo do Shotokan, organizado em três pilares",
    descricao: (katas: number, tecnicas: number, marcos: number) =>
      `Todo o conteúdo desta área vem do acervo do dojo — ${katas} katas com sequência de movimentos e bunkai, ${tecnicas} técnicas de kihon e ${marcos} marcos históricos.`,
    verKatas: "Ver katas",
    historia: "História",
    numeros: {
      katas: "Katas detalhados",
      tecnicas: "Técnicas de kihon",
      mestres: "Mestres na linhagem",
      marcos: "Marcos históricos",
      graduacoes: "Graduações",
      principios: "Princípios",
    },
    acessar: "Acessar →",
    pilaresSobretitulo: "Kihon · Kata · Kumite",
    pilaresTitulo: "Os três pilares do treino",
    pilaresDescricao: "Como o acervo define cada frente de trabalho e para que ela serve.",
    paraQueServe: "Para que serve",
    pilaresNav: [
      {
        caminho: "/estudos/historia",
        titulo: "História",
        subtitulo: "Linhagem e Mestres",
        descricao:
          "De Okinawa aos dojos brasileiros: quem ensinou quem, e o que mudou no caminho.",
        dentro: [
          "Linha do tempo, de 1868 aos dias de hoje",
          "Três árvores de linhagem, com link para cada mestre",
          "Como o karatê chegou a Alagoas",
          "Os preceitos de Funakoshi",
        ],
      },
      {
        caminho: "/estudos/tecnicas",
        titulo: "Técnicas",
        subtitulo: "Kihon e Katas",
        descricao:
          "O vocabulário e as frases: cada golpe catalogado, cada kata destrinchado movimento a movimento.",
        dentro: [
          "Socos, chutes, defesas, bases e guardas",
          "26 katas com ficha, bunkai e vídeo",
          "Sequência completa em tabela, com tradução",
          "Embusen animado, passo a passo",
        ],
      },
      {
        caminho: "/estudos/fundamentos",
        titulo: "Fundamentos",
        subtitulo: "Graduação e Filosofia",
        descricao:
          "O que se exige em cada faixa, e os princípios que separam o movimento correto do movimento eficaz.",
        dentro: [
          "Sistema de faixas, do 7º Kyu ao 1º Dan",
          "Dojo Kun, Niju Kun e etiqueta",
          "De onde vem cada kata",
          "Dicionário do dojo e curiosidades",
        ],
      },
    ] as PilarNav[],
  },
  en: {
    metaTitulo: "Study Portal",
    sobretitulo: "Study Portal",
    titulo: "The complete Shotokan library, organised in three pillars",
    descricao: (katas: number, tecnicas: number, marcos: number) =>
      `Everything in this area comes from the dojo's own library — ${katas} katas with move-by-move sequences and bunkai, ${tecnicas} kihon techniques and ${marcos} historical milestones.`,
    verKatas: "See the katas",
    historia: "History",
    numeros: {
      katas: "Detailed katas",
      tecnicas: "Kihon techniques",
      mestres: "Masters in the lineage",
      marcos: "Historical milestones",
      graduacoes: "Grades",
      principios: "Principles",
    },
    acessar: "Open →",
    pilaresSobretitulo: "Kihon · Kata · Kumite",
    pilaresTitulo: "The three pillars of training",
    pilaresDescricao: "How the library defines each area of practice and what it is for.",
    paraQueServe: "What it is for",
    pilaresNav: [
      {
        caminho: "/estudos/historia",
        titulo: "History",
        subtitulo: "Lineage and Masters",
        descricao:
          "From Okinawa to Brazilian dojos: who taught whom, and what changed along the way.",
        dentro: [
          "Timeline, from 1868 to the present day",
          "Three lineage trees, with a link for each master",
          "How karate reached Brazil",
          "Funakoshi's precepts",
        ],
      },
      {
        caminho: "/estudos/tecnicas",
        titulo: "Techniques",
        subtitulo: "Kihon and Katas",
        descricao:
          "The vocabulary and the sentences: every strike catalogued, every kata broken down move by move.",
        dentro: [
          "Punches, kicks, blocks, stances and guards",
          "26 katas with profile, bunkai and video",
          "Full sequence in a table, with translation",
          "Animated Embusen, step by step",
        ],
      },
      {
        caminho: "/estudos/fundamentos",
        titulo: "Fundamentals",
        subtitulo: "Grading and Philosophy",
        descricao:
          "What each belt requires, and the principles that separate a correct movement from an effective one.",
        dentro: [
          "Belt system, from 7th Kyu to 1st Dan",
          "Dojo Kun, Niju Kun and etiquette",
          "Where each kata comes from",
          "Dojo glossary and curiosities",
        ],
      },
    ] as PilarNav[],
  },
} satisfies Record<Idioma, unknown>;

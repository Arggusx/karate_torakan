import type { KataEn } from "./tipos";

export default {
  significadoNome: "King's Crown",
  significadoLiteral: "Crowning of the king — Wan = king, Kan = crown",
  faixaRecomendada: "3rd Dan",
  nivelDificuldade: "Expert",
  posicoesKiai: "Move 16",
  observacaoContagem:
    "WARNING — count not fully reconciled: most dojos describe the kata in 16 technical 'blocks', some of which contain 2 official counts each (marked [1 count] or [2 counts] in the direction column). Adding those marks block by block gives 22 counts, not the 24 officially cited by the JKA — 2 counts are missing that the public sources consulted did not allow us to locate with certainty (probably hidden inside one of the blocks marked as 1 count). Unlike the other katas in this research, here it was not possible to close the count with confidence — counting along with an instructor's video is strongly recommended (the kata is short, only 24 counts, easy to check) before using it for an exam.",
  comentario: ["The smallest number of moves among the Shotokan katas."],
  bunkai: [
    "Grab and throw: deflecting the opponent's fist while holding the elbow and lapel to apply a short throw/takedown (Nage Waza).",
  ],
  resumo: {
    significado: "King's crown.",
    text: "The shortest Shotokan kata, with a single Kiai at the end. It features grabs and off-balancing moves performed with nobility and rhythmic elegance.",
    decomposicao: ["King", "Crown"],
  },
  movimentos: [
    ["Wedge block (opening the fists), middle level", "Turn left, step diagonally 45°, neko-ashi-dachi [1 count]"],
    ["Repeat on the right side", "Turn right, diagonal 45°, neko-ashi-dachi [1 count]"],
    ["Scissor block (crossed arms), with the right knee raised", "Turn the head left [1 count]"],
    ["Reverse vertical knife-hand block, middle level, left", "Zenkutsu-dachi [1 count]"],
    ["Right straight punch followed by a left reverse punch", "Zenkutsu-dachi, in place [2 counts]"],
    ["Tiger mouth with a knee off-balance", "Turn left, neko-ashi-dachi [1 count]"],
    ["Repeat of the reverse vertical block", "Zenkutsu-dachi [1 count]"],
    ["Repeat of the double punch", "Zenkutsu-dachi [2 counts]"],
    ["Repeat, with a 180° turn", "Neko-ashi-dachi [1 count]"],
    ["Repeat of the block", "Zenkutsu-dachi [1 count]"],
    ["Repeat of the double punch", "Zenkutsu-dachi [2 counts]"],
    ["Hammer-fist strike, right", "Turn right, kiba-dachi [1 count]"],
    ["Left front kick followed by a left straight punch", "Land in zenkutsu-dachi [2 counts]"],
    ["Right front kick followed by a right straight punch", "Zenkutsu-dachi [2 counts]"],
    ["Repeat of the left kick/punch", "Zenkutsu-dachi [2 counts]"],
    ["Mountain punch (U-shaped double strike)", "Turn, fudo-dachi [1 count — OFFICIAL FINAL MOVE No. 24]"],
  ],
} satisfies KataEn;

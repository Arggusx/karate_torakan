import type { KataEn } from "./tipos";

export default {
  significadoNome: "Peace and Tranquility 3",
  significadoLiteral: "Peace (Hei) and tranquility (an)",
  faixaRecomendada: "4th Kyu (Red)",
  nivelDificuldade: "Beginner",
  posicoesKiai: "Moves 10 and 20",
  observacaoContagem:
    "Count discrepancy: several sources list 21 steps (move 18 is sometimes split into 18 and 19 — the pull-back with grab/hikite and the oi-zuki counted separately).",
  comentario: ["Basic kata, designed to train and refine fundamental techniques."],
  bunkai: [
    "Double Uchi Uke / Gedan Barai: blocking a middle punch while deflecting a low kick.",
    "Elbow press in Kiba-dachi: escaping a grab from behind by pinning the attacker's arms to your body and striking the ribs with the elbow.",
    "Turn with Uraken/Fumikomi: a hard stamp on the opponent's foot (Fumikomi) to pin it, then a fast rotation landing Uraken to the face.",
  ],
  resumo: {
    significado: "Peace and tranquility — third level.",
    text: "Introduces the horse stance Kiba-dachi, fast 180° turns, forearm blocks (Uchi-uke / Morote-uke), elbow strikes (Empi-uchi) and short-range evasions.",
    decomposicao: ["Peace and tranquility", "Third level"],
  },
  movimentos: [
    ["Inside forearm block", "Turn left, kokutsu-dachi"],
    ["Simultaneous", "No step, heisoku-dachi (feet together)"],
    ["Simultaneous", "No step, heisoku-dachi"],
    ["Inside forearm block", "Turn 90° right, kokutsu-dachi"],
    ["Simultaneous", "Heisoku-dachi"],
    ["Simultaneous", "Heisoku-dachi"],
    ["Reinforced block", "Turn 90° left, kokutsu-dachi"],
    ["Fingertip thrust + pressing block", "Step forward, zenkutsu-dachi"],
    ["Side hammer-fist strike (left)", "Turn 180°, kiba-dachi"],
    ["Middle-level straight punch (right)", "Step forward, zenkutsu-dachi"],
    ["Draw both fists to the hips, ready position", "Turn 180° to the rear, heisoku-dachi (slow move)"],
    ["Side stamp + side elbow strike (right)", "Pivot 90° left, kiba-dachi"],
    ["Vertical back-fist strike (right)", "Kiba-dachi, no step"],
    ["Side stamp + side elbow strike (left)", "Pivot 180° right, kiba-dachi"],
    ["Vertical back-fist strike (left)", "Kiba-dachi"],
    ["Side stamp + side elbow strike (right)", "Pivot 180° left, kiba-dachi"],
    ["Vertical back-fist strike (right)", "Kiba-dachi"],
    [
      "Slow block followed by a stepping middle punch",
      "Kiba-dachi (slow), then zenkutsu-dachi (some sources split it into 2 moves)",
    ],
    ["Rear punch/elbow strike, alternating", "Turn 90°, kiba-dachi"],
    ["Opposite side", "Shift sideways (yori-ashi), kiba-dachi"],
  ],
} satisfies KataEn;

import type { KataEn } from "./tipos";

export default {
  significadoNome: "Peace and Tranquility 1",
  significadoLiteral: "Peace (Hei) and tranquility (an)",
  faixaRecomendada: "6th Kyu (Yellow)",
  nivelDificuldade: "Beginner",
  posicoesKiai: "Moves 9 and 17",
  observacaoContagem:
    "Discrepancy: one source (karate-notes.com) places the kiai on moves 9 and 21 instead of 9 and 17.",
  comentario: [
    "Basic kata, designed to train and refine fundamental techniques.",
    "It was originally called Heian Nidan.",
  ],
  bunkai: [
    "Opening Gedan Barai: block against a low kick, or a sweep of the grabbed wrist to break free from a wrist grab.",
    "Advancing Age Uke: rising defense under a high punch (Jodan Zuki), opening the opponent's guard and striking the jaw with the forearm.",
    "Final Shuto Uke: side block with the edge of the hand that deflects a punch and counters to the opponent's neck/carotid artery.",
  ],
  resumo: {
    significado: "Peace and tranquility — first level.",
    text: "First kata of the Heian series. It introduces the front stance Zenkutsu-dachi, the Gedan-barai and Age-uke blocks, and Oi-zuki attacks, with a focus on stability and hip alignment.",
    decomposicao: ["Peace and tranquility", "First level"],
  },
  movimentos: [
    ["Downward block", "Turn 90° left, step into zenkutsu-dachi"],
    ["Stepping middle-level straight punch (right hand)", "Step forward in zenkutsu-dachi"],
    ["Downward block", "Turn 180° (pivot on the left leg), right zenkutsu-dachi"],
    ["Circular hammer-fist strike", "No step, right zenkutsu-dachi"],
    ["Stepping middle-level straight punch (left hand)", "Step forward in pursuit, zenkutsu-dachi"],
    ["Downward block", "Pivot on the right leg, turn 90° left, zenkutsu-dachi"],
    ["Rising block (right)", "Step forward, zenkutsu-dachi"],
    ["Rising block (left)", "Step forward, zenkutsu-dachi"],
    ["Rising block (right)", "Step forward, zenkutsu-dachi"],
    ["Downward block", "Pivot on the right leg, turn 90° left, zenkutsu-dachi"],
    ["Middle-level straight punch (right)", "Step forward, zenkutsu-dachi"],
    ["Downward block", "Turn 180° (pivot on the left leg), right zenkutsu-dachi"],
    ["Middle-level straight punch (left)", "Step forward in pursuit, zenkutsu-dachi"],
    ["Downward block", "Turn 90° left, zenkutsu-dachi"],
    ["Middle-level straight punch (right)", "Step forward, zenkutsu-dachi"],
    ["Middle-level straight punch (left)", "Step forward, zenkutsu-dachi"],
    ["Middle-level straight punch (right)", "Step forward, zenkutsu-dachi"],
    ["Knife-hand block, middle level (left)", "Turn 90°, kokutsu-dachi"],
    ["Knife-hand block, middle level (right)", "Pivot 45°, kokutsu-dachi"],
    ["Knife-hand block, middle level (right)", "Turn 180° (step back), kokutsu-dachi"],
    ["Knife-hand block, middle level (left)", "Pivot 45° (back to the front), kokutsu-dachi"],
  ],
} satisfies KataEn;

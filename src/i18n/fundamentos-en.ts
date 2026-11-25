import type { Linhagem } from "@/data/origemKatas";

/**
 * Fundamentos em inglês. Cada bloco segue a ordem ou a chave do original em
 * português (src/services/dataService.ts, o acervo JSON e
 * src/data/origemKatas.ts); termos japoneses e kanji vêm do original.
 */

/** Faixa por nome em português (Branca, Amarela...). */
export const GRADUACOES_EN: Record<
  string,
  { faixa: string; txt: string; significado?: string[]; grau: string; tempoMinimo: string; kihon: string[] }
> = {
  Branca: {
    faixa: "White",
    txt: "A pure beginning: the blank canvas that already holds the potential of every color that comes after.",
    grau: "7th Kyu",
    tempoMinimo: "3 months of training",
    kihon: ["Zenkutsu-dachi", "Gedan Barai", "Oi-Zuki", "Mae-Geri"],
  },
  Amarela: {
    faixa: "Yellow",
    txt: "The rising sun: the first glow of knowledge.",
    grau: "6th Kyu",
    tempoMinimo: "3 months at 7th Kyu",
    kihon: ["Age-Uke", "Gyaku-Zuki", "Kokutsu-dachi", "Shuto-Uke"],
  },
  Vermelha: {
    faixa: "Red",
    txt: "Fire and willpower.",
    grau: "5th Kyu",
    tempoMinimo: "4 months at 6th Kyu",
    kihon: ["Uchi-Uke", "Yoko-Geri Keage", "Nukite", "Kizami-Zuki"],
  },
  Laranja: {
    faixa: "Orange",
    txt: "A blend that brings confidence and enthusiasm.",
    significado: [
      "It stands for the pursuit of success in daily training, with agility and adaptability.",
      "Encouragement, stimulation, sturdiness and warmth: that is the energy of this stage.",
      "Between fire and earth, it is already the belt with its feet most firmly on the ground.",
    ],
    grau: "4th Kyu",
    tempoMinimo: "4 months at 5th Kyu",
    kihon: ["Kiba-dachi", "Soto-Uke", "Empi-Uchi", "Yoko-Geri Kekomi"],
  },
  Verde: {
    faixa: "Green",
    txt: "The oasis after the desert: harmony and growth.",
    significado: [
      "After so many warm colors, the green belt arrives as a relief. It is the most harmonious of all, linked to hope and faith.",
      "It represents nature, perseverance and growth, but also asks for care with excessive pride.",
      "It is the youth of karate: it has already grown a lot, but still needs to mature.",
    ],
    grau: "3rd Kyu",
    tempoMinimo: "6 months at 4th Kyu",
    kihon: ["Kakiwake-Uke", "Mawashi-Geri", "Hiza-Geri", "Mae-Geri + Empi"],
  },
  Roxa: {
    faixa: "Purple",
    txt: "Spirituality and inner transformation.",
    significado: [
      "The purple belt is considered the most sacred color in karate.",
      "It is born from mixing blue with red and carries the same weight worn by Catholic priests: self-respect, dignity and self-esteem.",
      "It is a color linked to alchemy, transformation and cosmic energy. It is said to purify and heal on the physical, emotional and mental levels.",
      "At this stage the practitioner needs to open new paths and deepen their intuition before reaching the brown belt.",
    ],
    grau: "2nd Kyu",
    tempoMinimo: "6 months at 3rd Kyu",
    kihon: ["Manji-Uke", "Mikazuki-Geri", "Ushiro-Geri", "Jiyu Ippon Kumite"],
  },
  Marrom: {
    faixa: "Brown",
    txt: "Solidity, discipline and closeness to the master: the first true disciple.",
    significado: [
      "The brown belt is the color of solidity in karate.",
      "It represents constancy, discipline and the consistency that only years of training bring. It marks the practitioner's connection with the patron of the style, passed from master to student.",
      "It is made by mixing red with black and carries a little of both: self-criticism, and the dependence on the masters that still exists to get this far.",
      "It is the color of someone completing their technical and mental maturity: solid, compact, with the confidence and constancy of someone who already knows how to go straight to the root of things.",
    ],
    grau: "1st Kyu",
    tempoMinimo: "12 months at 2nd Kyu",
    kihon: ["Renzoku Waza", "Jiyu Kumite", "All stances", "Free combinations"],
  },
  Preta: {
    faixa: "Black",
    txt: "The union of all the other colors and the start of a new, deeper journey.",
    significado: [
      "White, yellow, red, orange, green, purple, brown: years of journey to get here.",
      "Black represents humility, self-control, maturity, serenity, discipline and dignity.",
      "It is the color of power: what is outside does not get in, and what is inside does not get out.",
      "Budō warriors wear this color to follow their own path, away from conventional rules.",
      "It absorbs negative energies and gives them back transformed into positive ones.",
    ],
    grau: "1st Dan +",
    tempoMinimo: "18 months at 1st Kyu",
    kihon: ["Full bunkai", "Jiyu Kumite", "Mastery of Kime and Zanshin"],
  },
};

/** Dojo Kun, na mesma ordem do original. */
export const DOJO_KUN_EN: { pt: string; text: string }[] = [
  {
    pt: "Seek perfection of character.",
    text: "The first and most important. Before technique, before victory, comes the building of the human being. Every practice is a chance to polish yourself.",
  },
  {
    pt: "Be faithful to the way of truth.",
    text: "Absolute sincerity with yourself and others. No pretending, no cheating, no hiding. The truth — even when it hurts — is the only solid foundation.",
  },
  {
    pt: "Cultivate the spirit of effort.",
    text: "Talent without effort goes to waste; effort without talent still reaches the top. Doryoku is the Japanese virtue of persistent work, day after day, without fanfare.",
  },
  {
    pt: "Respect others above all.",
    text: "Rei (礼) is the respect shown in every bow, in every gesture. Respect for the sensei, your partner, your opponent, the dojo, yourself. Without rei there is no karate — only violence.",
  },
  {
    pt: "Refrain from impetuous courage.",
    text: "Kekki is hot blood, the blind courage of youth. The karateka must have courage — but governed by reason. Fighting out of pride is failure; using force without need is a betrayal of the way.",
  },
];

export const NIJU_KUN_EN: string[] = [
  "1. Karate begins and ends with the bow (rei).",
  "2. In karate there is no first attack.",
  "3. Karate is an aid to justice.",
  "4. First know yourself, then know the opponent.",
  "5. Spirit before technique.",
  "6. Keep your mind free.",
  "7. Accidents arise from negligence.",
  "8. Karate is not limited to the dojo.",
  "9. Karate is a lifelong pursuit.",
  "10. Apply karate to everything. Therein lies its beauty.",
];

/** Princípios técnicos, pelo nome japonês (Kime, Kiai...). */
export const PRINCIPIOS_FUND_EN: Record<string, { traducao: string; oque_e: string; para_que_serve: string }> = {
  Kime: {
    traducao: "Focus and Instant Contraction",
    oque_e: "Total, explosive muscle contraction concentrated in the exact millisecond of impact, followed immediately by muscle relaxation.",
    para_que_serve: "Transfers the maximum kinetic energy to the target without pushing, creating a penetrating impact while saving energy and preparing the body for the next move.",
  },
  Kiai: {
    traducao: "Union of Energy and Spirit Shout",
    oque_e: "The explosive exhalation and voice that come from the lower abdomen (Tanden / Hara) at the climax of a technique.",
    para_que_serve: "Synchronizes diaphragmatic breathing, hardens the abdominal wall against counterattacks and psychologically unsettles the opponent.",
  },
  Zanshin: {
    traducao: "Alert Mind and Continuous Presence",
    oque_e: "The state of watchful awareness and attentive calm that stays active even after a strike or kata sequence has ended.",
    para_que_serve: "Prevents premature relaxation or triumphalism on the mat, keeping the practitioner 100% ready to react to any new threat or sudden counterattack.",
  },
  Maai: {
    traducao: "Distance and Strategic Space",
    oque_e: "The dynamic measurement of space and time between you and the opponent, based on the reach of the limbs and the speed of movement.",
    para_que_serve: "Lets you attack with surgical precision at the moment the opponent cannot react, and evade with the minimum movement needed.",
  },
  Hyoshi: {
    traducao: "Rhythm, Cadence and Timing",
    oque_e: "The timing and breathing cadence that govern the exchange of initiative during a fight.",
    para_que_serve: "Breaks the opponent's expected timing so you can anticipate strikes (Sen no Sen) and attack in moments of transition and vulnerability.",
  },
  Koshi: {
    traducao: "Use of the Hips and Center of Gravity",
    oque_e: "The rotation, tilting and locking of the pelvis, connecting the base of the feet with the upper limbs.",
    para_que_serve: "Acts as the body's power engine; in traditional Karate, the power of a strike does not come from the arm alone but from the explosive turn of the hips.",
  },
  Hikite: {
    traducao: "Pulling Back the Opposite Hand",
    oque_e: "The forceful pull of the opposite arm toward the waist at the exact moment the other arm delivers the punch or block.",
    para_que_serve: "Creates an opposing rotation (action and reaction), doubling the speed and penetration of the strike while protecting the flank.",
  },
  Shoshin: {
    traducao: "Beginner's Mind",
    oque_e: "The mindset of humility and constant openness, regardless of years of training or belt rank.",
    para_que_serve: "Removes arrogance and the illusion of self-sufficiency, letting black belts and masters keep refining the basics at every practice.",
  },
  Mushin: {
    traducao: "Free Mind / State of Flow",
    oque_e: "A clear, spontaneous state of mind, free from thoughts of fear, hesitation, vanity or too much conscious calculation.",
    para_que_serve: "Allows automatic, reflexive motor responses at lightning speed in combat, acting intuitively like water taking the shape of its container.",
  },
};

/** Etiqueta, pelo nome (Rei, Oss, Dōjō Kun). */
export const ETIQUETA_EN: Record<
  string,
  { traducao: string; oque_e: string; para_que_serve: string; detalhes?: { titulo: string; desc: string }[] }
> = {
  Rei: {
    traducao: "The Bow and Mutual Respect",
    oque_e: "The solemn, formal act of bowing the upper body, done when entering and leaving the dojo, and before and after every kata, drill or match.",
    para_que_serve: "Disarms the ego, shows humility and gratitude to the master (Sensei), and seals an unspoken commitment to safety, loyalty and trust with your training partner.",
    detalhes: [
      {
        titulo: "Ritsurei (立礼)",
        desc: "Standing bow, tilting the spine about 15 to 30 degrees while keeping an upright posture and a respectful gaze.",
      },
      {
        titulo: "Zarei (座礼)",
        desc: "The traditional kneeling bow in Seiza, placing the hands on the floor in a triangle before bowing the head.",
      },
    ],
  },
  Oss: {
    traducao: "Perseverance, Resilience and Patience",
    oque_e: "Short for 'Oshi Shinobu' (to push and to endure). It is the universal greeting of daily dojo life, used as 'hello', 'thank you', 'understood' and 'I will do my best'.",
    para_que_serve: "Expresses an unshakable spirit (Fudoshin), immediate readiness in the face of hard instructions, and the determination to calmly overcome pain, fatigue and mental and physical limits.",
  },
  "Dōjō Kun": {
    traducao: "The 5 Ethical Precepts of the Dojo",
    oque_e: "The code of conduct and moral philosophy made of five rules, recited aloud at the end of every class by all students and instructors in Seiza.",
    para_que_serve: "Makes sure martial knowledge is always guided by the perfection of character, truth, effort, respect and control of aggressive impulse.",
  },
};

export const ORIGEM_EN = {
  nota: "According to the ISO poster, the Heian katas and Tekki Shodan were drawn from Kanku Dai; the later katas derive from them.",
  fonte: {
    titulo: "Enbusen poster — the 26 Shotokan katas",
    entidade: "ISO — International Shotokan-Ryu Organization",
    creditos: "Supervision: Shihan Takashi Shigeeda · Research: Shihan Evaldir José Sezerino · Art: Gisele Kruger",
  },
};

/** Dicionário, pelo romaji. */
export const DICIONARIO_EN: Record<string, string> = {
  "Dōjō": "Place of practice — literally 'place of the way'.",
  Sensei: "Teacher, 'one who was born before'.",
  "Gi (Dōgi)": "The white uniform worn in training.",
  Obi: "The belt that shows the rank.",
  Rei: "The bow — an expression of respect.",
  "Oss / Osu": "A greeting of respect, patience and perseverance.",
};

/** Curiosidades, na mesma ordem do original. */
export const CURIOSIDADES_EN: { titulo: string; text: string }[] = [
  {
    titulo: "Why is the uniform white?",
    text: "White represents purity, simplicity and the beginner's mind (shoshin). Everyone starts out equal, whatever their past.",
  },
  {
    titulo: "The meaning of belt colors",
    text: "The belt starts white and darkens with sweat and time until it turns black — that is where the tradition came from. Today the intermediate colors (yellow, green, purple, brown) show technical progress.",
  },
  {
    titulo: "What does 'Oss' mean?",
    text: "A contraction of 'Oshi Shinobu' (押し忍ぶ): to push and to endure. It sums up the spirit of perseverance in the face of effort.",
  },
  {
    titulo: "The longest kata: Unsu",
    text: "雲手 — 'Cloud Hands'. 48 moves, including a 360° spinning jump. Considered one of the most advanced katas.",
  },
  {
    titulo: "Shotokan vs. other styles",
    text: "Shotokan favors long stances and powerful linear techniques. Goju-ryu uses shorter stances and audible breathing. Wado-ryu integrates evasions from jiu-jitsu.",
  },
  {
    titulo: "October 25: Karate no Hi",
    text: "空手の日 — Karate Day, made official in Okinawa in 2005, marking the date the name '空手' was adopted in 1936.",
  },
  {
    titulo: "Why 'empty hands'?",
    text: "空手 (kara-te) means 'empty hand'. Funakoshi changed the original ideogram (唐手 — 'Chinese hand') to emphasize the philosophical side: empty of weapons, empty of ego.",
  },
  {
    titulo: "The Shotokan Tiger",
    text: "The tiger-in-a-circle symbol was drawn by Hoan Kosugi. The tiger represents strength and calm, qualities the practitioner strives for.",
  },
  {
    titulo: "Niju Kun — the 20 precepts",
    text: "Funakoshi left 20 philosophical principles. The first: 'Karate begins and ends with the bow (rei)'.",
  },
  {
    titulo: "Kime — the decisive instant",
    text: "決め — the total, instant contraction of the muscles at the impact of a technique. Without kime, a strike has no life.",
  },
  {
    titulo: "The black belt is not the end",
    text: "Shodan (初段) literally means 'first step'. The black belt marks the start of real learning — when the practitioner finally knows enough to begin to understand.",
  },
  {
    titulo: "The oldest dojo in the world",
    text: "The original Shotokan (1936) in Zōshigaya, Tokyo, was destroyed in 1945. Today the JKA Honbu dojo in Ebisu (Tokyo) is considered the headquarters of the style.",
  },
  {
    titulo: "Kobudō — farm weapons",
    text: "When weapons were banned in Okinawa, farmers adapted their tools: nunchaku (rice flail), tonfa (millstone handle), sai (fishing trident), bō (staff) and kama (sickle).",
  },
  {
    titulo: "Ikken Hissatsu",
    text: "一拳必殺 — 'One strike, one kill'. A philosophical concept that does not encourage violence but the pursuit of the perfect technique: every strike should be delivered as if it were the only one.",
  },
  {
    titulo: "Zanshin — the mind that remains",
    text: "残心 — After performing a technique, the practitioner must stay fully aware, ready to react. Zanshin is the difference between a karateka's strike and an amateur's.",
  },
  {
    titulo: "Karate at the Olympics",
    text: "Karate debuted at the Tokyo 2020 Games (held in 2021) but was dropped from Paris 2024. The sport is working to return at Los Angeles 2028, showing that the fight for Olympic recognition goes on.",
  },
  {
    titulo: "How long does it take to reach black belt?",
    text: "By the traditional table, almost 5 years of training. From white to yellow: 3 months and 30 classes, with the kata Heian Shodan. Then the pace picks up: 4, 5 and 6 months up to green. From green to purple it is 9 months, and from purple to brown, 12. At brown belt the student stays 1 to 2 years, studying Bassai Dai and Jion, before attempting the exam. And that is only the first Dan: after black, the rank scale keeps climbing.",
  },
];

/** As três escolas de Okinawa. */
export const LINHAGENS_EN: Record<Linhagem, { lugar: string; resumo: string }> = {
  "Shuri-te": {
    lugar: "Shuri, the royal capital",
    resumo:
      "The court school of Sōkon Matsumura and Ankō Itosu. Fast, straight movements, high and natural stances. The main root of Shotokan: Funakoshi learned from Itosu and Azato.",
  },
  "Tomari-te": {
    lugar: "Tomari, the harbor village",
    resumo:
      "A neighbor of Shuri and very similar to it, it kept katas that arrived with sailors and Chinese envoys — Wanshu, Rohai, Wankan and the Jion family.",
  },
  "Naha-te": {
    lugar: "Naha, the trading port",
    resumo:
      "Closer to southern Chinese boxing: firm stances, controlled breathing and close-range work. It gave us Seishan (Hangetsu) and, through Arakaki's line, Sochin and Nijushiho.",
  },
  "Japão": { lugar: "Japan", resumo: "" },
};

/** Origem de cada kata, pelo id. */
export const ORIGEM_KATAS_EN: Record<string, { quem: string; epoca: string; historia: string }> = {
  "heian-shodan": {
    quem: "Ankō Itosu",
    epoca: "c. 1904",
    historia:
      "Itosu created the five Pinan to bring karate into Okinawa's public schools: instead of starting with long katas full of secrets, students learned smaller pieces, drawn mostly from Kusanku (Kanku Dai). When Funakoshi took the series to Japan, he renamed it Heian (“peace and tranquility”) and swapped the order of the first two: Itosu's simpler Pinan Nidan became Heian Shodan.",
  },
  "heian-nidan": {
    quem: "Ankō Itosu",
    epoca: "c. 1904",
    historia:
      "It was Itosu's first Pinan and became the second in Japan. It brings the first double blocks and the mae-geri into the kata. Many instructors see it as preparation for Bassai Dai, which repeats the idea of blocking and countering while changing direction.",
  },
  "heian-sandan": {
    quem: "Ankō Itosu",
    epoca: "c. 1904",
    historia:
      "The third Pinan introduces blocks in quick succession and elbow work (empi-uchi) in kiba-dachi. Its two-arm block combinations recall those of Jitte, which is why the ISO sets it as a step toward it.",
  },
  "heian-yondan": {
    quem: "Ankō Itosu",
    epoca: "c. 1904",
    historia:
      "Longer and with changes of rhythm, it is the Pinan closest to the Kusanku from which Itosu took the material. The side kicks and the one-leg stance prepare Gankaku; the open-hand techniques, Empi.",
  },
  "heian-godan": {
    quem: "Ankō Itosu",
    epoca: "c. 1904",
    historia:
      "It closes the series with the jump and the cross block (juji-uke). The idea of turning and changing stance without losing your center reappears in Hangetsu, which is why the ISO poster links them.",
  },
  "tekki-shodan": {
    quem: "Matsumura and Itosu",
    epoca: "before 1800 (tradition)",
    historia:
      "One of the oldest katas of Shuri, performed entirely sideways in horse stance. Funakoshi trained it for years with Itosu and renamed it Tekki (“iron horse”) because of the kiba-dachi. One traditional explanation for its purely sideways movement is fighting with your back against a wall or on a boat.",
  },
  "tekki-nidan": {
    quem: "attributed to Itosu",
    epoca: "late 19th century",
    historia:
      "The original Naihanchi was a single kata. The second and third are usually attributed to Itosu, who built them from the first to train other combinations in the same stance. Funakoshi kept the series in Shotokan as Tekki.",
  },
  "tekki-sandan": {
    quem: "attributed to Itosu",
    epoca: "late 19th century",
    historia:
      "It closes the Tekki series with the fastest and most circular techniques of the three. Like Nidan, it is considered Itosu's creation on the base of the old Naihanchi.",
  },
  "bassai-dai": {
    quem: "Matsumura's line",
    epoca: "18th–19th century",
    historia:
      "There were several versions of Passai in Okinawa — from Tomari, from Shuri, from Matsumura. The name is usually read as “to storm the fortress”, for the energy with which the kata advances and changes direction. Shotokan inherited the form taught by Itosu, and Funakoshi made it a black-belt exam kata.",
  },
  "kanku-dai": {
    quem: "Kūshankū, a Chinese envoy",
    epoca: "c. 1756",
    historia:
      "The name comes from Kūshankū, a Chinese official who, according to a 1762 record (the Ōshima Hikki), demonstrated his art in Okinawa. The kata passed through Sakugawa and Matsumura to Itosu, who drew much of the Pinan from it. It was Funakoshi's favorite kata; he called it Kanku (“to view the sky”) for the opening in which the hands form a window above the head.",
  },
  jion: {
    quem: "Tomari tradition",
    epoca: "uncertain origin",
    historia:
      "The name is that of a Buddhist temple (Jion-ji), and tradition says monks practiced forms like it. It forms a family with Jitte and Jiin: all three begin with the same salutation, the left hand covering the right fist. A kata of strong stances and steady rhythm, widely used as a technical reference.",
  },
  empi: {
    quem: "Wanshu, a Chinese envoy",
    epoca: "c. 1683",
    historia:
      "It bears the name of Wang Ji (Wanshu), a Chinese envoy who was in Okinawa in 1683; the kata was preserved in Tomari. Funakoshi renamed it Enpi, “flight of the swallow”, for its quick drops and rises, like the bird skimming the water.",
  },
  hangetsu: {
    quem: "Naha and Shuri tradition",
    epoca: "one of the oldest",
    historia:
      "Seishan is one of the oldest katas in Okinawa and exists in almost every style, from Naha and from Shuri. Funakoshi called it Hangetsu (“half moon”) for the arcing steps of the stance of the same name. The controlled breathing and the slow, tense moves show its Naha-te heritage.",
  },
  gankaku: {
    quem: "Chinto, a Chinese castaway (tradition)",
    epoca: "19th century",
    historia:
      "Tradition says a Chinese castaway named Chinto was hiding in Okinawa and was confronted by Matsumura, who ended up learning from him. Funakoshi renamed it Gankaku, “crane on a rock”, for the one-leg stance (tsuru-ashi-dachi) that marks the kata.",
  },
  jitte: {
    quem: "Tomari tradition",
    epoca: "uncertain origin",
    historia:
      "“Ten hands”: the traditional explanation is that whoever masters the kata is worth ten. Part of the Jion family, it has many applications against a staff attacker — several blocks are done with open hands, as if holding the bō.",
  },
  "bassai-sho": {
    quem: "attributed to Itosu",
    epoca: "late 19th century",
    historia:
      "The “minor” version of Passai is usually attributed to Itosu. Despite the name, it is not easier: it brings staff defenses and open-hand techniques that are not in Bassai Dai.",
  },
  "kanku-sho": {
    quem: "attributed to Itosu",
    epoca: "late 19th century",
    historia:
      "Itosu is said to have created this smaller version of Kusanku. It keeps the opening and spirit of Kanku Dai, but adds a different jump and floor work.",
  },
  chinte: {
    quem: "Chinese origin (tradition)",
    epoca: "uncertain origin",
    historia:
      "“Rare hands”, for techniques that do not appear in other katas — fingertip strikes and single-knuckle strikes. It is believed to come from an old Chinese form. Funakoshi once called it Shōin, but the name Chinte prevailed.",
  },
  unsu: {
    quem: "Arakaki's line (tradition)",
    epoca: "19th century",
    historia:
      "“Cloud hands”. Its origin is unclear; it is usually linked to Seishō Arakaki's lineage and reached Shotokan through the JKA. It is one of the hardest katas in the series, with the spinning jump and the kick delivered from the floor.",
  },
  sochin: {
    quem: "Arakaki's line; Yoshitaka Funakoshi",
    epoca: "19th century; reworked c. 1930",
    historia:
      "It comes from Seishō Arakaki's line in Naha. The Shotokan version was heavily reworked by Yoshitaka (Gigō) Funakoshi, the founder's son, who gave the kata the wide, firm stance called sōchin-dachi (fudō-dachi): “calm strength”.",
  },
  nijushiho: {
    quem: "Arakaki's line",
    epoca: "19th century",
    historia:
      "Niseishi means “24” in Chinese, and Nijūshiho, “24 steps”. Linked to Arakaki's line, it alternates soft moves with sudden bursts. Funakoshi called it Hakkō, but the name Nijushiho is the one that stuck.",
  },
  "gojushiho-dai": {
    quem: "Matsumura's line",
    epoca: "19th century",
    historia:
      "Useishi is “54” in Chinese: “54 steps”. Funakoshi called it Hotaku, “woodpecker”, for its fingertip techniques. Shotokan keeps two versions, Dai and Shō, and the JKA even swapped the two names compared to older usage.",
  },
  "gojushiho-sho": {
    quem: "Matsumura's line",
    epoca: "19th century",
    historia:
      "The other half of Useishi. Faster and with more open-hand techniques than Dai; the two are studied together: same structure, different emphasis.",
  },
  meikyo: {
    quem: "Matsumora (Tomari); Itosu",
    epoca: "19th century",
    historia:
      "Rōhai (“white heron”) comes from Tomari; Itosu created three versions of it. Shotokan's Meikyō comes from that family. The name means “polished mirror”: the kata begins with a gesture that recalls wiping a mirror, an image of a clear mind.",
  },
  jiin: {
    quem: "Tomari tradition",
    epoca: "uncertain origin",
    historia:
      "The third of the Jion family, with the same opening salutation. Funakoshi once called it Shōkyō, but the old name came back. It is rarely practiced outside Shotokan and a few Okinawan schools.",
  },
  wankan: {
    quem: "Tomari tradition (Matsumora)",
    epoca: "19th century",
    historia:
      "“King's crown”. Preserved in Tomari, it is the shortest of the 26 katas. Funakoshi called it Shiōfū, and it also appears under the names Hitō and Ōkan. Its brevity is deceptive: every technique has to be decisive.",
  },
};

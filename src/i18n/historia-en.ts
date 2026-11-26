import type { NoLinhagem } from "@/components/historia/LineageTree";

/**
 * História em inglês. A linha do tempo e os mestres são indexados pelo
 * original (ano do marco, nome do mestre): kanji, datas e nomes vêm sempre
 * do português, aqui só o texto muda.
 */

export interface MarcoEn {
  title: string;
  kanjiTranslate: string;
  text: string;
  detail: string;
}

/** Chave: o campo `year` do marco no acervo. */
export const TIMELINE_EN: Record<string, MarcoEn & { year?: string }> = {
  "Séc. XIV": {
    year: "14th c.",
    title: "Origins in Okinawa",
    kanjiTranslate: "Okinawa",
    text: "Chinese martial arts (Quanfa) blend with local Okinawan fighting techniques and give rise to 'Te'.",
    detail:
      "The Ryūkyū Kingdom (today's Okinawa) kept close trade and diplomatic ties with Ming dynasty China. Chinese monks and merchants brought Quanfa (拳法, 'law of the fist'), which merged with Okinawan Tī in three main centres: Shuri, Naha and Tomari. In 1429 King Shō Hashi unified Okinawa; in 1477 King Shō Shin banned weapons among nobles and peasants alike. Without swords, Tī flourished as a secret art, passed on only within families.",
  },
  "1609": {
    title: "The Satsuma invasion",
    kanjiTranslate: "Satsuma",
    text: "The Japanese Satsuma clan invades Okinawa and imposes a new weapons ban — Te becomes even more secret.",
    detail:
      "The Satsuma domain, from southern Kyushu, conquers Ryūkyū and forbids carrying any weapon at all, even long knives. The Okinawan nobility (the pechin) turns secretly to Te as its only defence. Kobudō weapons also appear, made from farm tools — nunchaku (rice flail), sai, tonfa, kama. Karate matures in silence for three centuries, hidden beneath cultural tradition.",
  },
  "1868": {
    title: "Gichin Funakoshi is born",
    kanjiTranslate: "Funakoshi",
    text: "In Shuri, Okinawa, the future founder of Shotokan is born.",
    detail:
      "Funakoshi Gichin is born premature and frail into an impoverished noble family. As a child he becomes the student of two great Shuri-te masters: Anko Asato and Anko Itosu. He trains as a primary school teacher — the profession he would keep for decades. He was also a poet and calligrapher, and signed his verses with the pen name Shōtō (松濤, 'waving pines'), inspired by the sound of the wind as he walked through the pine forests of Mount Torao.",
  },
  "1901": {
    title: "Karate enters the schools",
    kanjiTranslate: "Schools",
    text: "Anko Itosu brings karate into the curriculum of Okinawa's primary schools.",
    detail:
      "Itosu, Funakoshi's teacher, convinces the government that karate can produce strong, disciplined young men for the imperial army. He simplifies dangerous katas and creates the five Pinan/Heian. For the first time karate leaves secrecy and is taught openly. Funakoshi, then a teacher, is key to this transition, demonstrating techniques in schools across the island.",
  },
  "1922": {
    title: "Demonstration in Tokyo",
    kanjiTranslate: "Tokyo",
    text: "Funakoshi presents karate to mainland Japan at the invitation of the Ministry of Education.",
    detail:
      "At 53, Funakoshi is chosen to represent Okinawa at the 1st National Physical Education Exhibition in Tokyo. His demonstration impresses Jigoro Kano (founder of Judo), who invites him to the Kodokan. Funakoshi decides to stay — he gives up his teaching post, leaves his family in Okinawa and lives in student lodgings, teaching in exchange for room and board. He begins publishing books to spread the art.",
  },
  "1930—1940": {
    title: "The university clubs",
    kanjiTranslate: "DAIGAKU",
    text: "Karate enters Keio, Waseda and Takushoku — and stops being a demonstration to become a teaching method.",
    detail:
      "Between the 1922 demonstration and the war, karate takes root in Tokyo's universities. Keio opens the first club in 1924; Waseda, Takushoku and others follow. It is a change in nature, not just in audience: to teach large classes of students, Funakoshi and his assistants have to organise what until then passed from master to student — sequences, grades, terminology. Those rooms produced the whole generation that would found the JKA: Nakayama joins the Takushoku club in 1932 and becomes Funakoshi's student there.",
  },
  "1935": {
    title: "Karate changes its characters",
    kanjiTranslate: "Empty Hand",
    text: "Funakoshi changes the characters from 唐手 ('Chinese hand') to 空手 ('empty hand').",
    detail:
      "In a nationalist Japan on the eve of war, keeping the 'Chinese' character was politically dangerous. But the change went further: 空 (kara, 'empty') comes from the Zen Buddhist concept of emptiness — empty of weapons, empty of ego, empty of aggressive intent. Karate stops being only a technique and asserts itself as a spiritual path: Karate-Dō (空手道).",
  },
  "1936": {
    title: "Shotokan is founded",
    kanjiTranslate: "Shotokan",
    text: "The 'Shotokan' dojo opens — 'Hall of Waving Pines', named after Funakoshi's pen name.",
    detail:
      "After years of teaching in borrowed spaces, students and admirers build Funakoshi's first permanent dojo in Zōshigaya, Tokyo. Above the door they hang a sign reading Shōtō-kan. The name of the building ended up naming the style — something Funakoshi never intended, since for him there was only 'karate', with no subdivisions. His son Gigō transforms the technique in this period: longer stances, high kicks, dynamic kumite.",
  },
  "1945": {
    title: "Tragedy and rebirth",
    kanjiTranslate: "Rebirth",
    text: "The Shotokan dojo is destroyed in an Allied bombing. Gigō Funakoshi dies of tuberculosis at 39.",
    detail:
      "In May 1945 the bombing of Tokyo reduces the Shotokan to ashes. Months later Gigō Funakoshi — the son who had modernised the technique — dies of tuberculosis. The elder Funakoshi, aged 77, loses his dojo, his son and his country in the same year. Even so, he starts again: he gathers the surviving students and keeps teaching until his death in 1957, repeating: 'True karate is inside each person, not within the walls of a building'.",
  },
  "1949": {
    title: "The JKA is created",
    kanjiTranslate: "JKA",
    text: "The Japan Karate Association is founded and makes the style popular worldwide.",
    detail:
      "Direct students of Funakoshi — among them Masatoshi Nakayama — found the Nihon Karate Kyōkai (JKA) to preserve and expand the teaching. Here the greatest divide in the style's history begins: Funakoshi opposed competition, which he saw as a departure from Budō. Nakayama and the JKA generation took another path, creating the rules for kata and kumite (shiai, 1957) and the legendary 'instructors course', a 3-year programme that trained the masters who took Shotokan to the world: Kanazawa, Enoeda, Nishiyama, Kase, Asai, Mikami…",
  },
  "1955": {
    title: "Shotokan arrives in Brazil",
    kanjiTranslate: "BURAJIRU",
    text: "Mitsusuke Harada lands in São Paulo and opens Shotokan's first door in the country.",
    detail:
      "Harada arrives in São Paulo in 1955 to work at Banco América do Sul and, that same year, receives his 5th Dan from Funakoshi himself — he followed the Shotokai line, not the JKA. Juichi Sagara arrives in 1957 and founds the São Paulo Karate Federation in 1959; Sadamu Uriu and Yasutaka Tanaka arrive in 1958; Yoshizo Machida lands in Belém in 1968 and turns Pará into a hub of the style; Taketo Okuda comes in 1972, the first sent officially by the JKA as chief instructor in the country. Most Shotokan academies in Brazil descend from these roots.",
  },
  "1957": {
    title: "Gichin Funakoshi dies",
    kanjiTranslate: "End",
    text: "At 88, the father of modern karate passes away — but his legacy already reaches five continents.",
    detail:
      "Funakoshi dies on 26 April 1957 in Tokyo. His autobiography 'Karate-Dō: My Way of Life' is already essential reading; the Niju Kun (20 precepts) have already been carved in stone; his students have already left to open dojos from Germany to the United States, from South Africa to South America. His tomb in Kamakura reads: 空手に先手なし — 'There is no first attack in karate'. The same year the JKA holds its 1st National Kata and Kumite Championship — the competition he rejected begins in the year he dies.",
  },
  "1960s-80s": {
    year: "1960s–80s",
    title: "Worldwide expansion",
    kanjiTranslate: "Spread",
    text: "JKA masters leave to teach on five continents — karate stops being Japanese and belongs to the world.",
    detail:
      "Hidetaka Nishiyama goes to the USA (1961); Hirokazu Kanazawa opens up England (1965) before founding SKIF; Keinosuke Enoeda stays in the United Kingdom; Taiji Kase leads Western Europe from Paris; Mikami reaches Latin America. Each master trains thousands of students, and within a few generations Shotokan becomes the most practised karate style on the planet — present in more than 190 countries.",
  },
  "2020": {
    title: "Tokyo Olympics",
    kanjiTranslate: "Olympics",
    text: "Karate debuts as an official Olympic sport — in Tokyo, of all places.",
    detail:
      "After decades of campaigning, karate is included in the Tokyo 2020 Olympic Games (postponed to 2021 by the pandemic). The event is split into Kata (forms) and Kumite (sparring). The symbolism is powerful: the style was born on Japan's most distant island, crossed the sea to the mainland, then the world — and returned in Olympic glory to the land that named it. Gold in women's kata goes to Sandra Sánchez (Spain); in men's kata, to Ryo Kiyuna (Okinawa).",
  },
};

/** Chave: o nome do mestre no acervo. */
export const MESTRES_EN: Record<string, string> = {
  "Gichin Funakoshi":
    "Father of modern karate. He took the art from Okinawa to Japan, set down the 20 precepts (Niju Kun) and founded the Shotokan style. He adopted the pen name 'Shōtō' (松濤, waving pines) because he loved walking among the pine forests while writing poetry.",
  "Gigō Funakoshi":
    "Gichin's son. He gave Shotokan its long, deep stances, the high kicks and the athletic dynamics that set it apart from the original Okinawan karate.",
  "Masatoshi Nakayama":
    "A direct student of Funakoshi. He systematised the teaching, created modern competition (kumite shiai) and spread Shotokan around the world through the JKA. Author of the 'Best Karate' series.",
  "Hidetaka Nishiyama":
    "Introduced Shotokan to the United States in 1961, founding the AAKF/ITKF. He trained generations of Western masters and standardised international rules.",
  "Hirokazu Kanazawa":
    "A legendary competitor — winner of the 1st All Japan championship despite a broken hand. He founded SKIF (Shotokan Karate-Do International Federation) and took the style to more than 100 countries.",
  "Keinosuke Enoeda":
    "Known as 'The Tiger' for his ferocity on the mat. He spread Shotokan across the United Kingdom and Europe, becoming a JKA icon outside Japan.",
  "Taiji Kase":
    "A Shotokan pioneer in Europe, based in Paris. He championed a martial, introspective karate and founded the WKSA.",
  "Tetsuhiko Asai":
    "Famous for his fluid karate and rare open-hand techniques. He founded the JKS (Japan Karate Shotorenmei), with an emphasis on advanced katas.",
};

export const PRECEITOS_FUNAKOSHI_EN = [
  "空手に先手なし — There is no first attack in karate.",
  "礼に始まり礼に終わる — Karate begins and ends with the bow.",
  "心を磨け — Set the ego aside, polish the heart.",
];

export const LINHAGEM_OKINAWA_EN: NoLinhagem = {
  nome: 'Sokon "Bushi" Matsumura',
  papel:
    "Bodyguard to the king of Ryūkyū and patriarch of Shuri-te, the root from which Shotokan grows.",
  anos: "1809 — 1899",
  filhos: [
    {
      nome: "Anko Asato",
      papel:
        "One of Funakoshi's two teachers. A nobleman and swordsman, he taught at night in the yard of his house.",
      anos: "1827 — 1906",
    },
    {
      nome: "Anko Itosu",
      papel:
        "Funakoshi's other teacher. He created the Heian series and brought karate into Okinawa's schools in 1901.",
      anos: "1831 — 1915",
      filhos: [
        {
          nome: "Gichin Funakoshi",
          papel:
            "Trained by Asato and Itosu together. He takes karate to Tokyo in 1922 and never goes back.",
          anos: "1868 — 1957",
        },
      ],
    },
  ],
};

export const LINHAGEM_JAPAO_EN: NoLinhagem = {
  nome: "Gichin Funakoshi",
  papel: "Creator of Shotokan Karate",
  anos: "1868 — 1957",
  filhos: [
    {
      nome: "Yoshitaka (Gigō) Funakoshi",
      papel:
        "The founder's son. He creates the long stances, high kicks and dynamic kumite — the technique recognised today as Shotokan. Dies of tuberculosis at 39.",
      anos: "1906 — 1945",
    },
    {
      nome: "Isao Obata",
      papel:
        "Funakoshi's student at Keio and the JKA's 1st president. He leaves the organisation over its turn towards sport.",
      anos: "1904 — 1976",
    },
    {
      nome: "Tsutomu Ohshima",
      papel:
        "Funakoshi's student at Waseda. He takes karate to the USA in 1955 and preserves the pre-JKA method, without competition.",
      org: "SKA",
    },
    {
      nome: "Masatoshi Nakayama",
      papel:
        "Joins the Takushoku club in 1932 and becomes Funakoshi's student. As JKA chief instructor he systematises the curriculum, creates the instructors course and writes the Best Karate series.",
      anos: "1913 — 1987",
      org: "JKA",
      filhos: [
        {
          nome: "Hirokazu Kanazawa",
          papel:
            "1st JKA champion (1957), he wins the final with a broken hand. Opens up England in 1965 and founds SKIF.",
          anos: "1931 — 2019",
          org: "SKIF",
        },
        {
          nome: "Keinosuke Enoeda",
          papel:
            "Nicknamed 'the Tiger'. Settles in the United Kingdom in 1965 and trains generations of British karateka.",
          anos: "1935 — 2003",
          org: "KUGB",
        },
        {
          nome: "Teruyuki Okazaki",
          papel: "Goes to the USA in 1961 and standardises teaching in the Americas. Founder of the ISKF.",
          anos: "1931 — 2020",
          org: "ISKF",
        },
        {
          nome: "Hiroshi Shirai",
          papel: "Sent to Italy in 1965. Builds one of the strongest schools in Europe there.",
          org: "FIKTA",
        },
        {
          nome: "Hideo Ochi",
          papel: "Goes to Germany in 1970 and founds the DJKB.",
          org: "DJKB",
        },
        {
          nome: "Tetsuhiko Asai",
          papel:
            "Circular, whipping movement and rare katas. Founds the JKS after the JKA split.",
          anos: "1935 — 2006",
          org: "JKS",
        },
        {
          nome: "Mikio Yahara",
          papel: "Took ikken hissatsu — 'one strike, one life' — to the extreme. Founds the KWF.",
          org: "KWF",
        },
      ],
    },
    {
      nome: "Hidetaka Nishiyama",
      papel:
        "JKA co-founder. Goes to the USA in 1961 and spends his life defending karate as budo, not as sport.",
      anos: "1928 — 2008",
      org: "ITKF",
      filhos: [
        { nome: "Avi Rokah", papel: "ITKF chief instructor." },
        { nome: "Vladimir Jorga", papel: "Spread the style in Yugoslavia and Eastern Europe." },
        { nome: "Justo Gómez", papel: "Spread the style in Latin America." },
      ],
    },
    {
      nome: "Taiji Kase",
      papel:
        "Student of Funakoshi and Gigō. Settles in Paris in 1967 and develops a Shotokan focused on real combat.",
      anos: "1929 — 2004",
      org: "Kase Ha",
      filhos: [
        { nome: "Dirk Heene", papel: "Kase Ha in Belgium." },
        { nome: "Jean-Pierre Lavorato", papel: "Kase Ha in France." },
      ],
    },
  ],
};

export const LINHAGEM_BRASIL_EN: NoLinhagem = {
  nome: "Shotokan — origin in Japan",
  papel:
    "The root here is the style, not an organisation: the pioneers came by different paths, and not all of them were JKA.",
  filhos: [
    {
      nome: "Mitsusuke Harada",
      papel:
        "The first to teach Shotokan in Brazil. He arrives in São Paulo in 1955 to work at Banco América do Sul; the same year he receives his 5th Dan from Funakoshi himself, aged 28. He follows the Shotokai line, not the JKA. Leaves for Europe in 1963.",
      anos: "1928 — 2021",
      org: "1955 · São Paulo",
    },
    {
      nome: "Juichi Sagara",
      papel:
        "A Takushoku graduate. He arrives in São Paulo in 1957 and founds the São Paulo Karate Federation in 1959. He reached 9th Dan and is one of the main pioneers of the art in the country.",
      org: "1957 · São Paulo",
      filhos: [
        {
          nome: "Sensei Edson Nakama",
          papel: "7th / 8th Dan — budo tradition and high performance.",
          org: "Dojo Nakama / FPK / CBK",
        },
      ],
    },
    {
      nome: "Sadamu Uriu",
      papel:
        "Also a Takushoku graduate, he arrives in 1958 and settles in Rio de Janeiro. One of the most respected names of the first generation — there are dojos named in his honour, including in Alagoas.",
      org: "1958 · Rio de Janeiro",
    },
    {
      nome: "Yasutaka Tanaka",
      papel:
        "Arrives with the same late-1950s group and takes part in consolidating Shotokan in the country.",
      org: "1958 · São Paulo",
    },
    {
      nome: "Yoshizo Machida",
      papel:
        "Lands in Belém in April 1968, aged 21, with three changes of clothes and three words of Portuguese. He wins the Brasília tournament in 1970 and turns Pará into a Shotokan hub.",
      org: "1968 · Belém, PA",
      filhos: [
        {
          nome: "Lyoto Machida",
          papel:
            "Yoshizo's son, a Shotokan black belt since childhood. UFC light heavyweight champion in 2009 — he took traditional karate to elite MMA and proved the foundation works off the mat.",
          anos: "1978 —",
        },
        {
          nome: "Chinzo Machida",
          papel:
            "Lyoto's brother and also Yoshizo's son. A karate champion and one of those responsible for spreading Machida Karate.",
        },
      ],
    },
    {
      nome: "Taketo Okuda",
      papel:
        "Arrives in 1972 as the first master from the JKA instructors course sent to Brazil, as the organisation's chief instructor in the country.",
      org: "1972 · JKA Brasil",
    },
  ],
};

import type { KataEn } from "./tipos";
import bassaiDai from "./bassai-dai";
import bassaiSho from "./bassai-sho";
import chinte from "./chinte";
import empi from "./empi";
import gankaku from "./gankaku";
import gojushihoDai from "./gojushiho-dai";
import gojushihoSho from "./gojushiho-sho";
import hangetsu from "./hangetsu";
import heianGodan from "./heian-godan";
import heianNidan from "./heian-nidan";
import heianSandan from "./heian-sandan";
import heianShodan from "./heian-shodan";
import heianYondan from "./heian-yondan";
import jiin from "./jiin";
import jion from "./jion";
import jitte from "./jitte";
import kankuDai from "./kanku-dai";
import kankuSho from "./kanku-sho";
import meikyo from "./meikyo";
import nijushiho from "./nijushiho";
import sochin from "./sochin";
import tekkiNidan from "./tekki-nidan";
import tekkiSandan from "./tekki-sandan";
import tekkiShodan from "./tekki-shodan";
import unsu from "./unsu";
import wankan from "./wankan";

export type { KataEn } from "./tipos";
export { TECNICAS_EN } from "./tecnicas";

/** Tradução de cada kata, pelo id usado na URL. */
export const KATAS_EN: Record<string, KataEn> = {
  "heian-shodan": heianShodan,
  "heian-nidan": heianNidan,
  "heian-sandan": heianSandan,
  "heian-yondan": heianYondan,
  "heian-godan": heianGodan,
  "tekki-shodan": tekkiShodan,
  "tekki-nidan": tekkiNidan,
  "tekki-sandan": tekkiSandan,
  "bassai-dai": bassaiDai,
  "kanku-dai": kankuDai,
  jion,
  empi,
  hangetsu,
  gankaku,
  jitte,
  "bassai-sho": bassaiSho,
  "kanku-sho": kankuSho,
  chinte,
  unsu,
  sochin,
  nijushiho,
  "gojushiho-dai": gojushihoDai,
  "gojushiho-sho": gojushihoSho,
  meikyo,
  jiin,
  wankan,
};

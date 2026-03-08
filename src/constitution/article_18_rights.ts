/**
 * article_18_rights.ts — 第2章 臣民権利義務（Art.18–32）
 *
 * User Permissions (Filtered)。全権利に「法律ノ範囲内ニ於テ」の WAF ルール付き。
 * isBlocked = true がハードコードされた Zero Trust Architecture。
 * 治安維持法・新聞紙条例・保安条例等で全ポートが事実上 DROP されている。
 *
 * @since v1.0.0 (1889-02-11)
 * @author 伊藤博文 <ito.hirobumi@naikaku.go.ij>
 */

import { Chapter } from "./types";

// ============================================================
//  第2章 臣民権利義務（Art.18–32）— User Permissions (Filtered)
// ============================================================

export const CHAPTER_2: Chapter = {
  number: 2,
  title: "臣民權利義務",
  articles: [
    {
      number: 18,
      text: "日本臣民タルノ要件ハ法律ノ定ムル所ニ依ル",
      _comment: "臣民 registration の要件は Terms of Service で定める。国民ではなく「臣民」。Customer ではなく Subject。",
    },
    {
      number: 19,
      text: "日本臣民ハ法律命令ノ定ムル所ノ資格ニ應シ均ク文武官ニ任セラレ及其ノ他ノ公務ニ就クコトヲ得",
      _comment: "採用要件を満たせば公務員になれる…はず。実際は身分・性別・思想で filter にかけられる。",
    },
    {
      number: 20,
      text: "日本臣民ハ法律ノ定ムル所ニ從ヒ兵役ノ義務ヲ有ス",
      _comment: "強制 task。cron job で呼び出される。拒否すると懲役。mandatory background service。",
    },
    {
      number: 21,
      text: "日本臣民ハ法律ノ定ムル所ニ從ヒ納税ノ義務ヲ有ス",
      _comment: "課金形式。Free Tier は存在しない。全臣民 paid plan 強制。",
    },
    {
      number: 22,
      text: "日本臣民ハ法律ノ範囲内ニ於テ居住及移轉ノ自由ヲ有ス",
      _comment: "移動の自由…「法律ノ範囲内」。within_the_limits_of_law() で wrapped 済み。",
    },
    {
      number: 23,
      text: "日本臣民ハ法律ニ依ルニ非スシテ逮捕監禁審問處罰ヲ受クルコトナシ",
      _comment: "令状のない逮捕は違法…のはず。でも治安維持法という「法律」を作れば legitimate になる。exploit。",
    },
    {
      number: 24,
      text: "日本臣民ハ法律ニ定メタル裁判官ノ裁判ヲ受クルノ權ヲ奪ハルルコトナシ",
      _comment: "裁判を受ける権利。ただし軍法会議は別 pipeline。judicial service が 2 系統走ってる。",
    },
    {
      number: 25,
      text: "日本臣民ハ法律ニ定メタル場合ヲ除ク外其ノ許諾ナクシテ住所ニ侵入セラレ及搜索セラルルコトナシ",
      _comment: "住居不可侵…「法律ニ定メタル場合ヲ除ク」。特高警察「法律で定めましたー！」で bypass。",
    },
    {
      number: 26,
      text: "日本臣民ハ法律ニ定メタル場合ヲ除ク外信書ノ秘密ヲ侵サルルコトナシ",
      _comment: "通信の秘密。ただし特高 DPI (Deep Packet Inspection) は「法律ニ定メタル場合」に該当。全通信 intercepted。",
    },
    {
      number: 27,
      text: "日本臣民ハ其ノ所有權ヲ侵サルルコトナシ\n公益ノ為必要ナル處分ハ法律ノ定ムル所ニ依ル",
      _comment: "私有財産の保護…「公益ノ為」なら没収可。Eminent Domain as a Service。",
    },
    {
      number: 28,
      text: "日本臣民ハ安寧秩序ヲ妨ケス及臣民タルノ義務ニ背カサル限ニ於テ信教ノ自由ヲ有ス",
      _comment: "信教の自由…「安寧秩序ヲ妨ケス」「臣民タルノ義務ニ背カサル」= 国家神道以外は実質 blocked。double firewall。",
    },
    {
      number: 29,
      text: "日本臣民ハ法律ノ範囲内ニ於テ言論著作印行集會及結社ノ自由ヲ有ス",
      _comment: "言論・出版・集会・結社の自由。ただし新聞紙条例、保安条例、治安警察法、治安維持法で全部 blocked。isBlocked = true。",
    },
    {
      number: 30,
      text: "日本臣民ハ相當ノ敬禮ニ從ヒ請願ヲ為スコトヲ得",
      _comment: "Issue を立てる権利…「相当ノ敬礼ニ従ヒ」= proper template で。どうせ @tokko-police-bot に ban されるが。",
    },
    {
      number: 31,
      text: "本章ニ掲ケタル條規ハ戰時又ハ國家事變ノ場合ニ於テ天皇大權ノ施行ヲ妨クルコトナシ",
      _comment: "⚠️ OVERRIDE CLAUSE: 有事には本章の権利が全て無効になる。emergency mode で全臣民の permissions revoke。",
    },
    {
      number: 32,
      text: "本章ニ掲ケタル條規ハ陸海軍ノ法令又ハ紀律ニ牴触セサルモノニ限リ軍人ニ準行ス",
      _comment: "軍人は別の ACL が適用される。military rules > constitution。namespace: military は独自 policy。",
    },
  ],
};

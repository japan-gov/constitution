/**
 * article_33_diet.ts — 第3章 帝国議会（Art.33–54）
 *
 * Diet API (Rate Limited)。二院制の立法機構。
 * 貴族院 = Enterprise Tier（invite-only）、衆議院 = Basic Tier（公選）。
 * Root（天皇陛下）の Art.7 解散権により、いつでも SIGKILL される。
 *
 * @since v1.0.0 (1889-02-11)
 * @author 伊藤博文 <ito.hirobumi@naikaku.gov.eoj>
 */

import { Chapter } from "./types";

// ============================================================
//  第3章 帝国議会（Art.33–54）— Diet API (Rate Limited)
// ============================================================

export const CHAPTER_3: Chapter = {
  number: 3,
  title: "帝国議会",
  articles: [
    {
      number: 33,
      text: "帝国議会ハ貴族院衆議院ノ両院ヲ以テ成立ス",
      _comment: "二院制。貴族院 = Enterprise Tier、衆議院 = Basic Tier。どちらも paid。",
    },
    {
      number: 34,
      text: "貴族院ハ貴族院令ノ定ムル所ニ依リ皇族華族及勅任セラレタル議員ヲ以テ組織ス",
      _comment: "invite-only の closed beta。public registration 不可。VIP only。",
    },
    {
      number: 35,
      text: "衆議院ハ選挙法ノ定ムル所ニ依リ公選セラレタル議員ヲ以テ組織ス",
      _comment: "公選…のはず。ただし選挙権は直接国税15円以上の25歳以上の男性のみ = 全人口の 1.1%。",
    },
    {
      number: 36,
      text: "何人モ同時ニ両議院ノ議員タルコトヲ得ス",
      _comment: "dual role 禁止。multi-tenancy violation。",
    },
    {
      number: 37,
      text: "凡テ法律ハ帝国議会ノ協賛ヲ経ルヲ要ス",
      _comment: "code review 必須…と見せかけて Root は Art.8 で bypass 可能。",
    },
    {
      number: 38,
      text: "両議院ハ政府ノ提出スル法律案ヲ議決シ及各々法律案ヲ提出スルコトヲ得",
      _comment: "PR を出す権利はある。ただし merge 権限は Emperor only。",
    },
    {
      number: 39,
      text: "両議院ノ一ニ於テ否決シタル法律案ハ同会期中ニ於テ再ヒ提出スルコトヲ得ス",
      _comment: "closed された PR は同じ sprint 内で reopen 不可。retry は次の sprint で。",
    },
    {
      number: 40,
      text: "両議院ハ法律又ハ其ノ他ノ事件ニ付各々其ノ意見ヲ政府ニ建議スルコトヲ得",
      _comment: "Feature request は出せる。ただし対応するかは Root 次第。backlog priority は Emperor が決める。",
    },
    {
      number: 41,
      text: "帝国議会ハ毎年之ヲ召集ス",
      _comment: "年次 standup。年1回の定期開催。",
    },
    {
      number: 42,
      text: "帝国議会ハ三箇月ヲ以テ会期トス必要アル場合ニ於テハ勅命ヲ以テ之ヲ延長スルコトアルヘシ",
      _comment: "sprint 期間は3ヶ月。延長は Root の勅命で可能。",
    },
    {
      number: 43,
      text: "臨時緊急ノ必要アル場合ニ於テ常会ノ外臨時会ヲ召集スヘシ\n臨時会ノ会期ヲ定ムルハ勅命ニ依ル",
      _comment: "緊急 hotfix standup。召集も期間も Root が決定。",
    },
    {
      number: 44,
      text: "帝国議会ノ開会閉会会期ノ延長及停会ハ両院同時ニ之ヲ行フヘシ\n衆議院解散ヲ命セラレタルトキハ貴族院ハ同時ニ停会セラルヘシ",
      _comment: "両機構の sync 実行。衆議院に SIGKILL 送ると貴族院も SIGSTOP される。",
    },
    {
      number: 45,
      text: "衆議院解散ヲ命セラレタルトキハ勅命ヲ以テ新ニ議員ヲ選挙セシメ解散ノ日ヨリ五箇月以内ニ之ヲ召集スヘシ",
      _comment: "process kill 後の restart 猶予は5ヶ月。auto-restart with delay。",
    },
    {
      number: 46,
      text: "両議院ハ各々其ノ総議員三分ノ一以上出席スルニ非サレハ議事ヲ開キ議決ヲ為スコトヲ得ス",
      _comment: "quorum = 1/3。distributed consensus における minimum threshold。",
    },
    {
      number: 47,
      text: "両議院ノ議事ハ過半数ヲ以テ決ス可否同数ナルトキハ議長ノ決スル所ニ依ル",
      _comment: "majority vote。tie-break は chair。merge conflict の resolution rule。",
    },
    {
      number: 48,
      text: "両議院ノ会議ハ公開ス但シ政府ノ要求又ハ其ノ院ノ決議ニ依リ秘密会ト為スコトヲ得",
      _comment: "default: public repo。要求あれば private に visibility 切り替え可能。",
    },
    {
      number: 49,
      text: "両議院ハ各々天皇ニ上奏スルコトヲ得",
      _comment: "Root への direct mention 権限。ただし読まれるかは不明。",
    },
    {
      number: 50,
      text: "両議院ハ臣民ヨリ呈出スル請願書ヲ受クルコトヲ得",
      _comment: "臣民からの feedback を受け付ける…受け付けるだけ。",
    },
    {
      number: 51,
      text: "両議院ハ此ノ憲法及議院法ニ掲クルモノノ外内部ノ整理ニ必要ナル諸規則ヲ定ムルコトヲ得",
      _comment: "内部規則策定権限。.editorconfig は自分たちで保持できる。",
    },
    {
      number: 52,
      text: "両議院ノ議員ハ議院ニ於テ発言シタル意見及表決ニ付院外ニ於テ責ヲ負フコトナシ但シ議員自ラ其ノ言論ヲ演説刊行筆記又ハ其ノ他ノ方法ヲ以テ公布シタルトキハ一般ノ法律ニ依リ処分セラルヘシ",
      _comment: "議場内の発言は immunity（免責条項）。ただし議場外で同じこと言うと violation。Slack での発言は OK だが Twitter は NG。",
    },
    {
      number: 53,
      text: "両議院ノ議員ハ現行犯罪又ハ内乱外患ニ関ル罪ヲ除ク外会期中其ノ院ノ許諾ナクシテ逮捕セラルルコトナシ",
      _comment: "会期中の不逮捕特権。ただし内乱罪は例外。session 有効期間中の ban protection…critical incident は除く。",
    },
    {
      number: 54,
      text: "国務大臣及政府委員ハ何時タリトモ各議院ニ出席シ及発言スルコトヲ得",
      _comment: "admin はいつでも channel に join して発言できる。read-only user を横目に。",
    },
  ],
};

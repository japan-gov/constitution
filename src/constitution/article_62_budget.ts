/**
 * article_62_budget.ts — 第6章 会計（Art.62–72）
 *
 * Budget API。帝国の歳入歳出を管理する財務パイプライン。
 * 予算が通らなくても前年度予算で fallback する「government shutdown 回避設計」。
 * 皇室経費は protected budget として議会 approve 不要。
 *
 * @since v1.0.0 (1889-02-11)
 * @author 伊藤博文 <ito.hirobumi@naikaku.gov.eoj>
 */

import { Chapter } from "./types";

// ============================================================
//  第6章 会計（Art.62–72）— Budget API
// ============================================================

export const CHAPTER_6: Chapter = {
  number: 6,
  title: "会計",
  articles: [
    {
      number: 62,
      text: "新ニ租税ヲ課シ及税率ヲ変更スルハ法律ヲ以テ之ヲ定ムヘシ\n但シ報償ニ属スル行政上ノ手数料及其ノ他ノ収納金ハ前項ノ限ニ在ラス\n国債ヲ起シ及予算ニ定メタルモノヲ除ク外国庫ノ負担トナルヘキ契約ヲ為スハ帝国議会ノ協賛ヲ経ヘシ",
      _comment: "課金制度変更は議会 approve が必要。ただし手数料は別。国債発行も議会通す…はず。",
    },
    {
      number: 63,
      text: "現行ノ租税ハ更ニ法律ヲ以テ之ヲ改メサル限ハ旧ニ依リ之ヲ徴収ス",
      _comment: "既存の課金制度は変更しない限りそのまま auto-renew。subscription auto-renewal。",
    },
    {
      number: 64,
      text: "国家ノ歳出歳入ハ毎年予算ヲ以テ帝国議会ノ協賛ヲ経ヘシ\n予算ノ款項ニ超過シ又ハ予算ノ外ニ生シタル支出アルトキハ後日帝国議会ノ承諾ヲ求ムルヲ要ス",
      _comment: "年間 budget は議会 approve 制。budget overrun は post-hoc report…先に使って後で許可もらう形式。",
    },
    {
      number: 65,
      text: "予算ハ前ニ衆議院ニ提出スヘシ",
      _comment: "budget 案は衆議院が先。衆議院優越の数少ない権限の一つ。first-come rule。",
    },
    {
      number: 66,
      text: "皇室経費ハ現在ノ定額ニ依リ毎年国庫ヨリ之ヲ支出シ将来増額ヲ要スル場合ヲ除ク外帝国議会ノ協賛ヲ要セス",
      _comment: "Root user の monthly quota は fixed。increase しない限り議会 approve 不要。budget: sacred。",
    },
    {
      number: 67,
      text: "憲法上ノ大権ニ基ツケル既定ノ歳出及法律ノ結果ニ由リ又ハ法律上政府ノ義務ニ属スル歳出ハ政府ノ同意ナクシテ帝国議会之ヲ廃除シ又ハ削減スルコトヲ得ス",
      _comment: "固定費は議会が勝手に削れない。protected budget。Root 権限で locked された expenditure。",
    },
    {
      number: 68,
      text: "特別ノ須要ニ因リ政府ハ予メ年限ヲ定メ継続費トシテ帝国議会ノ協賛ヲ求ムルコトヲ得",
      _comment: "multi-year budget。long-term subscription plan。",
    },
    {
      number: 69,
      text: "避クヘカラサル予算ノ不足ヲ補フ為ニ又ハ予算ノ外ニ生シタル必要ノ費用ニ充ツル為ニ予備費ヲ設クヘシ",
      _comment: "reserve fund = contingency buffer。unexpected expense への padding。",
    },
    {
      number: 70,
      text: "公共ノ安全ヲ保持スル為緊急ノ需用アル場合ニ於テ内外ノ情形ニ因リ政府ハ帝国議会ヲ召集スルコト能ハサルトキハ勅令ニ依リ財政上必要ノ処分ヲ為スコトヲ得\n前項ノ場合ニ於テハ次ノ会期ニ於テ帝国議会ニ提出シ其ノ承諾ヲ求ムルヲ要ス",
      _comment: "emergency budget。議会が down してる時は Root 権限で spend 実行。post-hoc report で OK。",
    },
    {
      number: 71,
      text: "帝国議会ニ於テ予算ヲ議定セス又ハ予算成立ニ至ラサルトキハ政府ハ前年度ノ予算ヲ施行スヘシ",
      _comment: "budget が通らなかったら前年度のを使う。fallback to last known good config。government shutdown は起きない設計。",
    },
    {
      number: 72,
      text: "国家ノ歳出歳入ノ決算ハ会計検査院之ヲ検査確定シ政府ハ其ノ検査報告ト倶ニ之ヲ帝国議会ニ提出スヘシ\n会計検査院ノ組織及職権ハ法律ヲ以テ之ヲ定ム",
      _comment: "audit log。会計検査院 = internal audit team。report は出す。remediation されるとは言っていない。",
    },
  ],
};

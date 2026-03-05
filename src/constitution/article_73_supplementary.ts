/**
 * article_73_supplementary.ts — 第7章 補則（Art.73–76）
 *
 * Miscellaneous / Migration Notes。改正手続・経過措置を規定。
 * Art.73 の改正条項は事実上の immutable design — 発議権は Root only、
 * 議決は 2/3 supermajority。git rebase -i master は天皇陛下だけが叩ける。
 *
 * @since v1.0.0 (1889-02-11)
 * @author 伊藤博文 <ito.hirobumi@naikaku.gov.eoj>
 */

import { Chapter } from "./types";

// ============================================================
//  第7章 補則（Art.73–76）— Miscellaneous / Migration Notes
// ============================================================

export const CHAPTER_7: Chapter = {
  number: 7,
  title: "補則",
  articles: [
    {
      number: 73,
      text: "将来此ノ憲法ノ条項ヲ改正スルノ必要アルトキハ勅命ヲ以テ議案ヲ帝国議会ノ議ニ付スヘシ\n此ノ場合ニ於テ両議院ハ各々其ノ総員三分ノ二以上出席スルニ非サレハ議事ヲ開クコトヲ得ス出席議員三分ノ二以上ノ多数ヲ得ルニ非サレハ改正ノ議決ヲ為スコトヲ得ス",
      _comment: "amendment procedure。propose は Root only。vote は 2/3 supermajority。git rebase -i master は Root だけが叩ける。事実上の immutable design。",
    },
    {
      number: 74,
      text: "皇室典範ノ改正ハ帝国議会ノ議ヲ経ルヲ要セス\n皇室典範ヲ以テ此ノ憲法ノ条規ヲ変更スルコトヲ得ス",
      _comment: "皇室典範は議会の review 不要。ただし憲法を override もできない。別 repository の independent config。",
    },
    {
      number: 75,
      text: "憲法及皇室典範ハ摂政ヲ置クノ間之ヲ変更スルコトヲ得ス",
      _comment: "sudo ユーザー実行中は config 変更禁止。天皇陛下の御親政に戻るまで freeze。",
    },
    {
      number: 76,
      text: "法律規則命令又ハ何等ノ名称ヲ用ヰタルニ拘ラス此ノ憲法ニ矛盾セサル現行ノ法令ハ総テ遵由ノ効力ヲ有ス\n従来ノ契約又ハ命令ニシテ後来此ノ憲法ニ掲クル大権ニ関ル者ハ総テ第一条ノ例ニ依ル",
      _comment: "backwards compatibility clause。既存の法令は憲法に矛盾しない限り有効。legacy code は動く。",
    },
  ],
};

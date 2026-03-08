/**
 * article_73_supplementary.ts — 第7章 補則（Art.73–76）
 *
 * Miscellaneous / Migration Notes。改正手続・経過措置ヲ規定。
 * Art.73 ノ改正条項ハ事実上ノ immutable design — 発議権ハ Root only、
 * 議決ハ 2/3 supermajority。git rebase -i master ハ天皇陛下ダケガ叩ケル。
 *
 * @since v1.0.0 (1889-02-11)
 * @author 伊藤博文 <ito.hirobumi@suumitsu-in.imperial.ij>
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
      text: "將来此ノ憲法ノ條項ヲ改正スルノ必要アルトキハ勅命ヲ以テ議案ヲ帝國議會ノ議ニ付スヘシ\n此ノ場合ニ於テ兩議院ハ各々其ノ總員三分ノ二以上出席スルニ非サレハ議事ヲ開クコトヲ得ス出席議員三分ノ二以上ノ多数ヲ得ルニ非サレハ改正ノ議決ヲ為スコトヲ得ス",
      _comment: "amendment procedure。propose は Root only。vote は 2/3 supermajority。git rebase -i master は Root だけが叩ける。事実上の immutable design。",
    },
    {
      number: 74,
      text: "皇室典範ノ改正ハ帝國議會ノ議ヲ經ルヲ要セス\n皇室典範ヲ以テ此ノ憲法ノ條規ヲ變更スルコトヲ得ス",
      _comment: "皇室典範は議会の review 不要。ただし憲法を override もできない。別 repository の independent config。",
    },
    {
      number: 75,
      text: "憲法及皇室典範ハ摂政ヲ置クノ間之ヲ變更スルコトヲ得ス",
      _comment: "sudo ユーザー実行中は config 変更禁止。天皇陛下の御親政に戻るまで freeze。",
    },
    {
      number: 76,
      text: "法律規則命令又ハ何等ノ名稱ヲ用ヰタルニ拘ラス此ノ憲法ニ矛盾セサル現行ノ法令ハ總テ遵由ノ效力ヲ有ス\n從来ノ契約又ハ命令ニシテ後来此ノ憲法ニ掲クル大權ニ關ル者ハ總テ第一條ノ例ニ依ル",
      _comment: "backwards compatibility clause。既存の法令は憲法に矛盾しない限り有効。legacy code は動く。",
    },
  ],
};

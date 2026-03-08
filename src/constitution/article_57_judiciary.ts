/**
 * article_57_judiciary.ts — 第5章 司法（Art.57–61）
 *
 * Judicial Microservice。「天皇陛下の名において」実行される独立サービス。
 * ただし namespace: military の軍法会議が別系統で走っており、
 * 行政訴訟も通常ルートに route できない。実質 3 系統の judicial pipeline。
 *
 * @since v1.0.0 (1889-02-11)
 * @author 伊藤博文 <ito.hirobumi@naikaku.go.ij>
 */

import { Chapter } from "./types";

// ============================================================
//  第5章 司法（Art.57–61）— Judicial Microservice
// ============================================================

export const CHAPTER_5: Chapter = {
  number: 5,
  title: "司法",
  articles: [
    {
      number: 57,
      text: "司法權ハ天皇ノ名ニ於テ法律ニ依リ裁判所之ヲ行フ\n裁判所ノ構成ハ法律ヲ以テ之ヲ定ム",
      _comment: "司法機関は「天皇陛下の名において」実行。namespace: judiciary。ただし Root 直属。",
    },
    {
      number: 58,
      text: "裁判官ハ法律ニ定メタル資格ヲ具フル者ヲ以テ之ニ任ス\n裁判官ハ刑法ノ宣告又ハ懲戒ノ處分ニ由ルノ外其ノ職ヲ免セラルルコトナシ\n懲戒ノ條規ハ法律ヲ以テ之ヲ定ム",
      _comment: "裁判官の身分保障。正当な理由なしの terminate は不可…一応。",
    },
    {
      number: 59,
      text: "裁判ノ對審判決ハ之ヲ公開ス但シ安寧秩序又ハ風俗ヲ害スルノ虞アルトキハ法律ニ依リ又ハ裁判所ノ決議ヲ以テ對審ノ公開ヲ停ムルコトヲ得",
      _comment: "裁判は原則 public。ただし都合が悪ければ private に visibility 切り替え可能。",
    },
    {
      number: 60,
      text: "特別裁判所ノ管轄ニ屬スヘキモノハ別ニ法律ヲ以テ之ヲ定ム",
      _comment: "特別裁判所（軍法会議など）。別 namespace で動く independent judicial service。",
    },
    {
      number: 61,
      text: "行政官廳ノ違法處分ニ由リ權利ヲ傷害セラレタリトスル訴訟ニシテ別ニ法律ヲ以テ定メタル行政裁判所ノ裁判ニ屬スヘキモノハ司法裁判所ニ於テ受理スルノ限ニ在ラス",
      _comment: "行政訴訟は通常の司法に route できない。別の independent service に redirect。行政裁判所方式（大陸法式）。",
    },
  ],
};

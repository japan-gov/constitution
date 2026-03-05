/**
 * article_55_cabinet.ts — 第4章 国務大臣及枢密顧問（Art.55–56）
 *
 * Advisory Middleware。天皇陛下の output に co-sign を付与する middleware 層。
 * reject 権限はない always-approve pattern。2条しかないが、
 * 輔弼責任制度の全てがここに凝縮されている。
 *
 * @since v1.0.0 (1889-02-11)
 * @author 伊藤博文 <ito.hirobumi@naikaku.gov.eoj>
 */

import { Chapter } from "./types";

// ============================================================
//  第4章 国務大臣及枢密顧問（Art.55–56）— Advisory Middleware
// ============================================================

export const CHAPTER_4: Chapter = {
  number: 4,
  title: "国務大臣及枢密顧問",
  articles: [
    {
      number: 55,
      text: "国務各大臣ハ天皇ヲ輔弼シ其ノ責ニ任ス\n凡テ法律勅令其ノ他国務ニ関ル詔勅ハ国務大臣ノ副署ヲ要ス",
      _comment: "大臣 = middleware。天皇陛下の output に co-sign を付与。ただし reject 権限はない。always-approve middleware。",
    },
    {
      number: 56,
      text: "枢密顧問ハ枢密院官制ノ定ムル所ニ依リ天皇ノ諮詢ニ応ヘ重要ノ国務ヲ審議ス",
      _comment: "review committee。Root からの相談には答えるが、final decision 権はない。advisory-only pattern。",
    },
  ],
};

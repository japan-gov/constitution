/**
 * index.ts — 大日本帝国憲法 集約モジュール
 *
 * 全7章76条 + 上諭ヲ各ファイルカラ import シ、
 * 単一ノ CONSTITUTION オブジェクトトシテ re-export スル。
 * 各章ハ独立ファイルデ管理サレ、個別ニ改訂・参照可能。
 *
 * ディレクトリ構成:
 *   constitution/
 *   ├── types.ts                    # 型定義（ConfigMap schema）
 *   ├── preamble.ts                 # 上諭（告文・勅語・前文）
 *   ├── article_1_emperor.ts        # 第1章 天皇（Art.1-17）
 *   ├── article_18_rights.ts        # 第2章 臣民権利義務（Art.18-32）
 *   ├── article_33_diet.ts          # 第3章 帝国議会（Art.33-54）
 *   ├── article_55_cabinet.ts       # 第4章 国務大臣及枢密顧問（Art.55-56）
 *   ├── article_57_judiciary.ts     # 第5章 司法（Art.57-61）
 *   ├── article_62_budget.ts        # 第6章 会計（Art.62-72）
 *   ├── article_73_supplementary.ts # 第7章 補則（Art.73-76）
 *   └── index.ts                    # 本書（集約・再エクスポート）
 *
 * @since v1.0.0 (1889-02-11)
 * @author 伊藤博文 <ito.hirobumi@suumitsu-in.imperial.ij>
 */

// ============================================================
//  Types (Re-export)
// ============================================================

export type { Article, Chapter, ConstitutionData, PreambleSection } from "./types";

// ============================================================
//  Chapter Imports
// ============================================================

import { PREAMBLE } from "./preamble";
import { CHAPTER_1 } from "./article_1_emperor";
import { CHAPTER_2 } from "./article_18_rights";
import { CHAPTER_3 } from "./article_33_diet";
import { CHAPTER_4 } from "./article_55_cabinet";
import { CHAPTER_5 } from "./article_57_judiciary";
import { CHAPTER_6 } from "./article_62_budget";
import { CHAPTER_7 } from "./article_73_supplementary";
import { ConstitutionData } from "./types";

// ============================================================
//  Constitution Data (Assembled & Exported)
// ============================================================

/**
 * 大日本帝國憲法 — 全条文データ
 *
 * 明治二十二年二月十一日発布、明治二十三年十一月二十九日施行。
 * 全7章76条 + 上諭（告文・勅語・前文）。
 * 各章ハ独立ファイルカラ import サレ、ココデ assemble サレル。
 *
 * @remarks immutable deployment。hotfix 不可。改正ハ Art.73 ノ手続ニ依ル。
 */
export const CONSTITUTION: ConstitutionData = {
  title: "大日本帝國憲法",
  promulgated: "明治二十二年二月十一日",
  enforced: "明治二十三年十一月二十九日",
  preamble: PREAMBLE,
  chapters: [CHAPTER_1, CHAPTER_2, CHAPTER_3, CHAPTER_4, CHAPTER_5, CHAPTER_6, CHAPTER_7],
  totalArticles: 76,
};

// ============================================================
//  Individual Chapter Re-exports（章単位デノ参照用）
// ============================================================

export { PREAMBLE } from "./preamble";
export { CHAPTER_1 } from "./article_1_emperor";
export { CHAPTER_2 } from "./article_18_rights";
export { CHAPTER_3 } from "./article_33_diet";
export { CHAPTER_4 } from "./article_55_cabinet";
export { CHAPTER_5 } from "./article_57_judiciary";
export { CHAPTER_6 } from "./article_62_budget";
export { CHAPTER_7 } from "./article_73_supplementary";

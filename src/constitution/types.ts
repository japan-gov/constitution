/**
 * types.ts — 大日本帝国憲法 型定義
 *
 * 全条文ファイルガ参照スル共通型。
 * ConfigMap ノ schema 定義ニ相当。変更ハ全章ニ波及スルタメ要 impact analysis。
 *
 * @since v1.0.0 (1889-02-11)
 * @author 伊藤博文 <ito.hirobumi@suumitsu-in.imperial.ij>
 */

// ============================================================
//  Types & Interfaces
// ============================================================

/** 条文1条分ノ定義。immutable object トシテ freeze サレル。 */
export interface Article {
  readonly number: number;
  readonly text: string;
  readonly _comment: string;
}

/** 章（Chapter）ノ定義。複数ノ Article ヲ束ネル namespace。 */
export interface Chapter {
  readonly number: number;
  readonly title: string;
  readonly articles: Article[];
}

/** 憲法全体ノデータ構造。God Object ノ schema。 */
export interface ConstitutionData {
  readonly title: string;
  readonly promulgated: string;
  readonly enforced: string;
  readonly preamble: PreambleSection[];
  readonly chapters: Chapter[];
  readonly totalArticles: number;
}

/** 上諭（前文）セクションノ定義。 */
export interface PreambleSection {
  readonly title: string;
  readonly text: string;
  readonly _comment: string;
}

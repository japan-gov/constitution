/**
 * types.ts — 大日本帝国憲法 型定義
 *
 * 全条文ファイルが参照する共通型。
 * ConfigMap の schema 定義に相当。変更は全章に波及するため要 impact analysis。
 *
 * @since v1.0.0 (1889-02-11)
 * @author 伊藤博文 <ito.hirobumi@naikaku.go.ij>
 */

// ============================================================
//  Types & Interfaces
// ============================================================

/** 条文1条分の定義。immutable object として freeze される。 */
export interface Article {
  readonly number: number;
  readonly text: string;
  readonly _comment: string;
}

/** 章（Chapter）の定義。複数の Article を束ねる namespace。 */
export interface Chapter {
  readonly number: number;
  readonly title: string;
  readonly articles: Article[];
}

/** 憲法全体のデータ構造。God Object の schema。 */
export interface ConstitutionData {
  readonly title: string;
  readonly promulgated: string;
  readonly enforced: string;
  readonly preamble: PreambleSection[];
  readonly chapters: Chapter[];
  readonly totalArticles: number;
}

/** 上諭（前文）セクションの定義。 */
export interface PreambleSection {
  readonly title: string;
  readonly text: string;
  readonly _comment: string;
}

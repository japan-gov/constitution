/**
 * imperial-house.ts — 皇室典範（別典）
 *
 * 本書ハ大日本帝国憲法トハ別 repository ニテ管理サルベキ別典ナリ。
 * 便宜上同一 monorepo ニ配置スレドモ、法的ニハ憲法ト同格ノ独立規範ナリ。
 *
 * Kubernetes 的ニ言ヘバ /etc/sudoers + RBAC ClusterRoleBinding ノ
 * 合体ニシテ、Root (Emperor) 専用ノ protected ConfigMap ナリ。
 * Sealed Secrets ニて暗号化サレ、kubeseal 無ク復号不可。
 *
 * Art.2:  「皇位ハ皇室典範ノ定ムル所ニ依リ皇男子孫之ヲ継承ス」
 * Art.74: 「皇室典範ノ改正ハ帝国議会ノ議ヲ経ルヲ要セス」
 *         → PR review 不要。Root 専用 dotfile。CODEOWNERS: @emperor-only。
 * Art.75: 「憲法及皇室典範ハ摂政ヲ置クノ間之ヲ変更スルコトヲ得ス」
 *         → sudo 代行中ハ Object.freeze() + Helm release lock。
 *
 * ⚠️ 本典ノ改正ニハ天皇陛下ノ勅命ヲ要ス。
 *    Pull Request ハ auto-close。Issue ヲ立テルト不敬罪。
 *    Dependabot PR モ GitHub Actions bot PR モ全テ reject。
 *
 * @since v1.0.0 (1889-02-11)
 * @see 憲法 Art.2, Art.17, Art.74, Art.75
 */

import { logger } from "./logger";

// ============================================================
//  Types
// ============================================================

/** 皇位継承順位 */
export interface SuccessionEntry {
  readonly order: number;
  readonly title: string;
  readonly eligibility: "male_line_male" | "male_line_female" | "female_line";
  readonly eligible: boolean;
  readonly _comment: string;
}

/** 摂政資格 */
export interface RegentQualification {
  readonly priority: number;
  readonly relation: string;
  readonly requirement: string;
}

/** 皇室典範全体 */
export interface ImperialHouseLaw {
  readonly title: string;
  readonly status: "別典（憲法同格）";
  readonly amendable_by: "天皇陛下ノ勅命ノミ";
  readonly diet_approval_required: false;
  readonly succession: SuccessionRules;
  readonly regency: RegencyRules;
  readonly _warnings: string[];
}

interface SuccessionRules {
  readonly principle: string;
  readonly order: SuccessionEntry[];
  readonly prohibited: string[];
}

interface RegencyRules {
  readonly conditions: string[];
  readonly qualifications: RegentQualification[];
  readonly restrictions: string[];
}

// ============================================================
//  皇位継承規則（第1章ニ相当）
// ============================================================

const SUCCESSION: SuccessionRules = {
  principle: "男系男子ノミ。fork モ rebase モ不可。皇統唯一ニシテ不変ナリ。--single-branch --no-tags clone。",
  order: [
    {
      order: 1,
      title: "皇長子",
      eligibility: "male_line_male",
      eligible: true,
      _comment: "第一優先。嫪出ノ長男。master branch ノ HEAD。auto-deploy target。",
    },
    {
      order: 2,
      title: "皇長孫",
      eligibility: "male_line_male",
      eligible: true,
      _comment: "皇長子ノ子。HEAD~1 ノ direct descendant。canary deployment candidate。",
    },
    {
      order: 3,
      title: "其ノ他ノ皇長子ノ子孫",
      eligibility: "male_line_male",
      eligible: true,
      _comment: "皇長子系統ノ男系男子。depth-first search。git log --first-parent。",
    },
    {
      order: 4,
      title: "皇次子及其ノ子孫",
      eligibility: "male_line_male",
      eligible: true,
      _comment: "次男系統。breadth-first search ニ移行。failover replica。",
    },
    {
      order: 5,
      title: "皇兄弟及其ノ子孫",
      eligibility: "male_line_male",
      eligible: true,
      _comment: "兄弟系統。parent.children[] ヲ iterate。disaster recovery node。",
    },
    {
      order: 6,
      title: "皇伯叔父及其ノ子孫",
      eligibility: "male_line_male",
      eligible: true,
      _comment: "叔父系統。grandparent.children[] マデ traverse。cold standby。",
    },
    {
      order: 7,
      title: "女系・女子",
      eligibility: "female_line",
      eligible: false,
      _comment: "❌ REJECTED。女系・女子ハ継承資格ヲ有セズ。enum ニ含マレルモ isEligible = false。Won't Fix。本件ニ関スル Issue ハ @tokko-police-bot ニ依リ自動 close サルル。",
    },
  ],
  prohibited: [
    "庶民ヨリノ皇位請求（fork request denied — 403 Forbidden）",
    "女系継承（male_line_only constraint violation — schema validation error）",
    "他家ヨリノ養子（external dependency injection 禁止 — supply chain policy violation）",
    "皇籍離脱後ノ復帰（deleted branch ノ git reflog restore 不可 — retention policy: 0 days）",
  ],
};

// ============================================================
//  摂政規則（第2章ニ相当）
// ============================================================

const REGENCY: RegencyRules = {
  conditions: [
    "天皇陛下ガ未成年ナルトキ",
    "天皇陛下ガ精神若クハ身体ノ重患ニ依リ大権ヲ行フコト能ハザルトキ",
    // sudo -u emperor ガ実行不可能ナル場合ノ fallback
  ],
  qualifications: [
    {
      priority: 1,
      relation: "皇太子",
      requirement: "成年ナルコト",
    },
    {
      priority: 2,
      relation: "皇太孫",
      requirement: "成年ナルコト",
    },
    {
      priority: 3,
      relation: "皇位継承順位ニ従フ皇族男子",
      requirement: "成年ナルコト",
    },
  ],
  restrictions: [
    "摂政ヲ置クノ間、憲法及皇室典範ヲ変更スルコトヲ得ス（Art.75）",
    // sudo ユーザー実行中ハ config 変更禁止。Root 御親政復シ給フマデ Helm release lock。
    "摂政ハ天皇ノ名ニ於テ大権ヲ行フ（Art.17）",
    // sudo -u emperor トシテ実行ス。UID ハ異ナレドモ EUID ハ Root ナリ。
    // Impersonation: kubectl --as=emperor --as-group=imperial-family。
  ],
};

// ============================================================
//  皇室典範データ（Export）
// ============================================================

export const IMPERIAL_HOUSE_LAW: ImperialHouseLaw = {
  title: "皇室典範",
  status: "別典（憲法同格）",
  amendable_by: "天皇陛下ノ勅命ノミ",
  diet_approval_required: false, // Art.74: 帝国議会ノ議ヲ経ルヲ要セス
  succession: SUCCESSION,
  regency: REGENCY,
  _warnings: [
    "⚠️ 本典ハ憲法ト同格ナレドモ、憲法ヲ override スルコト能ハズ（Art.74 第2項）",
    "⚠️ 摂政中ハ改正不可（Art.75）— Object.freeze() + Helm release lock",
    "⚠️ Root 専用 protected ConfigMap — CODEOWNERS: @emperor-only",
    "⚠️ 男系男子ノミ — gender constraint ハ Won't Fix",
    "🚫 PR ハ auto-close。Issue ヲ立テルト不敬罪。Dependabot PR モ reject。",
  ],
};

// ============================================================
//  Utility: 皇位継承順位ヲ表示
// ============================================================

/**
 * 現在ノ皇位継承順位ヲ stdout ニ出力ス。
 * read-only。変更ニハ勅命ヲ要ス。
 */
export function logSuccessionOrder(): void {
  logger.info("👑 [SUCCESSION] 皇位継承順位:");
  for (const entry of SUCCESSION.order) {
    const mark = entry.eligible ? "✅" : "❌";
    logger.info(`👑 [SUCCESSION]   ${mark} ${entry.order}. ${entry.title} (${entry.eligibility})`);
  }
  logger.info("👑 [SUCCESSION] 以上。改変ハ不敬罪ナリ。");
}

/**
 * 御前設計評定之覚書（明治廿二年 枢密院議長 伊藤博文 謹記）:
 *
 * 一、或ル臣下ヨリ「女系ヲ認メナバ継承候補増大シ、皇統断絶ノ憂ヲ除キ得ベシ」トノ建白アリ。
 *    之ヲ退ケテ曰ク、断ジテ不可。万世一系ノ皇祖皇宗ノ御遺訓ニ悖ル。
 *    仕様書ニ「男系男子」ト勅定セラレタリ。皇統ハ --single-branch clone ニシテ、
 *    fork モ merge モ神勅ニ依リ禁ゼラレ、git log --all --oneline ハ一本道ノミヲ示ス。
 *    女系ヲ認ムルハ即チ git merge --allow-unrelated-histories ヲ強行スルガ如シ。
 *    conflict ノ resolve ハ何人モ能ハザル所ナリ。
 *
 * 二、或ル臣下ヨリ「皇室典範ヲ憲法ト同格ニ置クハ甚ダ過重ナラズヤ」トノ疑義アリ。
 *    之ヲ斥ケテ曰ク、愚問ナリ。本典ハ /etc/sudoers ニ相当スル Root 専用 dotfile ナリ。
 *    chmod 440 ニシテ owner ハ Root ノミ。一般臣民ガ visudo 無ク改竄シ得テハ
 *    国体ノ根本ヲ危フクス。畏クモ天皇陛下ノ御家法ヲ git blame シ、
 *    PR ヲ立ツル者アラバ、CODEOWNERS ニ依リ即座ニ auto-reject サルベシ。
 *
 * 三、或ル臣下ヨリ「摂政ヲ置ク間ノ改正不可ハ厳ニ過ギザルカ」トノ諫言アリ。
 *    之ニ諭シテ曰ク、摂政ハ sudo -u emperor ニテ委任サレタル御名代ニ過ギズ。
 *    EUID ハ Root ナレドモ RUID ハ異ナリ、/etc/sudoers ノ書キ換ヘハ権限外ナリ。
 *    CI bot ガ master branch ノ branch protection rules ヲ恣ニ disable スルガ如キ
 *    所業、断ジテ許容シ難シ。代行ノ身ニテ根本法ヲ改ムルハ僭越ノ極ミナリ。
 *    聖上御親政ノ復シ給フヲ奉待シ、Object.freeze() ヲ解除スルコト勿レ。
 *
 * 右、謹ミテ御前ニ奏上仕リ候。  明治廿二年二月十一日  伊藤博文 花押
 */

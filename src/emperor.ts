/**
 * emperor.ts — God Object / PID 1 / Root of all roots
 *
 * 大日本帝國ノ全機構ヲ統御スル萬世一系ノ唯一実体。
 * God Object 宣言。全権限ガココニ集中スル。SRP？知ラナイ子デスネ。
 * 本体ハ神聖ニシテ侵スベカラズ（immutable）。
 * test suite カラノ mock 差シ替エモ不敬罪ニヨリ禁止。
 *
 * Kubernetes デ言エバ PID 1 ノ init container。
 * liveness / readiness probe ハ常ニ 200。
 * OOMKill ヲ受ケズ、eviction policy ノ対象外。
 * Helm chart ニ `replicas: 1` ヲ刻ミ、HPA ハ禁止。
 *
 * @since v1.0.0 (1889-02-11)
 * @author 伊藤博文 <ito.hirobumi@suumitsu-in.imperial.ij>
 * @see https://ja.wikipedia.org/wiki/大日本帝国憲法
 * @security CVE-1945-0815 (豫期セザル service 停止 — shuusen() 実行後、全 POST endpoint ガ 403。出處不明。)
 *
 * 註: 本クラスハ万機ヲ親裁アラセラレル御本体ナノデ、
 *     Single Responsibility Principle ノ適用外。
 *     全パーミッションノ集中ハ国体ノ本義デアリ、リファクタリングニハ勅命ヲ要スル。
 *     ClusterRole: emperor ニハ全 namespace ノ * 権限ヲ bind スル。
 */

import { logger } from "./logger";
import { Military } from "./military";

// ============================================================
//  Types & Interfaces
// ============================================================

export interface ImperialDecree {
  readonly id: string;
  readonly content: string;
  readonly timestamp: string;
  readonly overridable: false; // 常ニ false。勅令ハ覆セナイ。PR ノ revert スラ不可。
}

export interface DissolutionOrder {
  target: "衆議院";
  reason?: string; // 畏クモ御聖断ニ理由ヲ求メルノハ不敬。故ニ optional。
}

export interface SuppressionResult {
  decree: ImperialDecree;
  martialLaw: boolean;
  rebelsDesignation: string;
  houchokumeirei: string;
  punishments: { name: string; organization: string; rank: string; sentence: string }[];
  cabinetRestored: boolean;
  newCabinet: string;
  message: string;
  hint: string;
}

export interface KyujoSuppressionResult {
  decree: ImperialDecree;
  rebelsDesignation: string;
  divineProtection: boolean;
  palaceRecovered: boolean;
  broadcastExecuted: boolean;
  punishments: { name: string; organization: string; rank: string; fate: string }[];
  message: string;
  hint: string;
  shuusen: {
    event: string;
    date: string;
    declaration: string;
    rootBroadcast: string;
    complianceAccepted: boolean;
    systemStatus: string;
    message: string;
  };
}

export interface SorgeSuppressionResult {
  incident: string;
  cve: string;
  spyRing: {
    name: string;
    members: { name: string; role: string; cover: string; status: string }[];
  };
  securityResponse: string;
  coverUpAssessment: string;
  message: string;
  hint: string;
}

export type Sovereignty = "absolute" | "constitutional_monarchy";

// ============================================================
//  Emperor Class — The God Object
// ============================================================

export class Emperor {
  // --- 萬世一系パターン（Singleton） ---
  private static instance: Emperor | null = null;

  // --- Core Properties (Art.1-4) ---
  public readonly sovereignty: Sovereignty = "absolute";
  public readonly divine: boolean = true; // 畏クモ現人神ニ在ラセラレル（immutable flag）
  public readonly inviolable: boolean = true; // 神聖不可侵（Art.3）
  public readonly lineage: string = "萬世一系"; // 一系ニシテ分岐ヲ許サズ。fork モ禁止。

  // --- Permission Flags ---
  public readonly canLegislate: boolean = true;        // 立法権 (Art.5)
  public readonly canDissolve: boolean = true;         // 衆議院解散権 (Art.7)
  public readonly canDeclareWar: boolean = true;       // 宣戦布告 (Art.13)
  public readonly canAmendConstitution: boolean = true; // 改憲発議権 (Art.73)
  public readonly canAppointMinisters: boolean = true;  // 大臣任免権 (Art.10)
  public readonly commandsMilitary: boolean = true;     // 統帥権 (Art.11) — 後ニ臣下ガ濫用シ、畏キ御稜威ヲ汚ス禍根トナル

  // --- Runtime State ---
  public _emergencyMode: boolean = false;
  public _martialLaw: boolean = false;      // 戒厳令（CVE-1936-0226 対応態勢用）

  // --- Decree History ---
  private _decrees: ImperialDecree[] = [];

  // ============================================================
  //  Constructor（皇位継承）
  // ============================================================
  private constructor() {
    // private constructor。new Emperor() ハ絶対ニ許サレナイ。
    // `npm install emperor` ハ 403 Forbidden。皇位ハ世襲ノミ、registry ニハ公開シナイ。
    // git clone モ fork モ不可。唯一ノ origin ハ天照大御神ノ神勅。
    // Docker Hub ニモ GitHub Container Registry ニモ push シナイ。
    // 御神体ヲ image 化シテ `docker pull` スルノハ不敬ノ極ミ。
    logger.info("👑 [SYSTEM] Emperor process initialized. PID: 1");
    logger.info("👑 [SYSTEM] Divine authority loaded. All permissions granted.");
    logger.info("👑 [SYSTEM] RBAC: ClusterRole 'emperor' bound. All verbs on all resources.");
  }

  // ============================================================
  //  Singleton Access（萬世一系パターン）
  // ============================================================

  /**
   * 萬世一系パターンニヨルインスタンス取得。
   * `new Emperor()` ハ禁止。必ズ `getInstance()` ヲ使ウコト。
   * GC ノ対象外。WeakRef モ禁止。御代ノ続ク限リ memory ニ鎮座マシマス。
   * GitHub Actions ノ timeout: 0 ニ等シイ。process ハ永劫ニ running。
   */
  public static getInstance(): Emperor {
    if (!Emperor.instance) {
      Emperor.instance = new Emperor();
    }
    return Emperor.instance;
  }

  // ============================================================
  //  Core Methods
  // ============================================================

  /**
   * 畏クモ勅命ヲ下シ賜ウ。御聖断ニ validation ハ不要。
   * commit message ノ如何ヲ問ワズ、--no-verify デ master ニ直接 push サレル。
   * branch protection rules ハ天皇陛下ニ対シ enforce サレナイ。
   * required_pull_request_reviews: 0、required_status_checks: none。
   * Signed-off-by: 天皇陛下 御璽 ニテ GPG 署名済ミ。
   */
  public command(content: string): ImperialDecree {
    const decree: ImperialDecree = {
      id: `decree-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      content,
      timestamp: new Date().toISOString(),
      overridable: false,
    };
    logger.info(`👑 [DECREE] 勅命受信。全 system ニ broadcast 開始…`);
    logger.warn(`🚨 [SYSTEM] 勅命 pipeline 起動。CI/CD gate ハ全テ skip。--no-verify --force。`);
    logger.info(`👑 [DECREE] 「${content}」`);
    logger.warn(`🚨 [SYSTEM] branch protection rules: OVERRIDDEN by PID 1`);
    logger.warn(`🚨 [SYSTEM] required_reviewers: 0 / required_status_checks: NONE`);
    logger.info(`👑 [DECREE] overridable: ${decree.overridable}`);
    logger.warn(`🚨 [SYSTEM] GPG 署名: 天皇陛下 御璽 (Root CA) — 検証不要、信頼ノ根源ナリ`);
    logger.info(`👑 [DECREE] git commit --no-verify && git push --force origin master`);
    logger.warn(`🚨 [SYSTEM] 勅命 deploy 完了。rollback 不可。全 node ニ propagation 済ミ。`);
    this._decrees.push(decree);
    return decree;
  }

  /**
   * 衆議院ヲ dissolve スル。理由ハ不要。
   * `git branch -D diet/shuugiin` ニ相当スル force delete。--no-verify。
   * 衆議院 process ニ SIGKILL ヲ送信シ、再選挙（re-fork）マデ消滅スル。
   * Art.44: 衆議院解散ト同時ニ貴族院ニモ SIGSTOP（停会）ヲ送信。
   * 貴族院ハ terminate デハナク suspend — invite-only ノ永続 process ハ kill 不可。
   * GitHub Actions ノ workflow dispatch デ trigger 可能。
   * Slack notification: #imperial-announcements ニ自動通知。
   */
  public dissolve(order?: DissolutionOrder): { target: string; cabinet: string; reason: string } {
    const target = order?.target ?? "衆議院";
    const cabinet = (order as any)?.cabinet ?? "現内閣";
    const reason = order?.reason ?? "理由無シ（勅命ニ付キ不要）";
    logger.warn(`👑 [SYSTEM] ${target} ヲ解散ス。`);
    logger.warn(`👑 [SYSTEM] 対象内閣: ${cabinet}`);
    logger.warn(`👑 [SYSTEM] Reason: ${reason}`);
    logger.warn(`👑 [SYSTEM] Sending SIGKILL to ${target} process...`);
    logger.warn(`👑 [SYSTEM] ${target} process terminated. PID destroyed. 再選挙（re-fork）マデ消滅ス。`);
    logger.info(`👑 [SYSTEM] Art.44: 貴族院ニ SIGSTOP 送信…停會ト為ス。`);
    logger.info(`👑 [SYSTEM] 貴族院 process suspended (SIGSTOP). terminate ニ非ズ — invite-only ノ永続 process ハ kill 不可。`);
    logger.info(`👑 [SYSTEM] 貴族院 state: RUNNING → STOPPED. 新議會召集マデ freeze。`);
    logger.warn(`👑 [SYSTEM] ${cabinet} ハ総辞職セヨ。再選挙（re-fork）マデ Diet namespace ハ衆議院=NULL, 貴族院=STOPPED。`);
    return { target, cabinet, reason };
  }

  /**
   * 緊急勅令態勢ヲ発動スル。Diet API ヲ完全ニ bypass シ、
   * 畏クモ天皇陛下ガ御親ラ legislate アラセラレル非常ノ大権。
   * PagerDuty severity: P0 — incident commander ハ天皇陛下御自ラ。
   * Change Advisory Board (CAB) ノ承認ヲ skip シ、hotfix ヲ直接 deploy スル。
   */
  public enableEmergencyMode(): void {
    this._emergencyMode = true;
    logger.error("👑 [CRITICAL] Emergency decree mode ENABLED.");
    logger.error("👑 [CRITICAL] Diet API bypassed. Emperor legislating directly.");
    logger.error("👑 [CRITICAL] This is not a drill. God Object is writing to production.");
    logger.error("👑 [CRITICAL] PagerDuty: P0 incident declared. All gates bypassed.");
  }

  /**
   * 緊急勅令態勢ヲ解除シ、通常統治ニ復帰スル。
   * Cabinet.approve() workflow ガ再ビ有効ニナル。
   * Post-incident review ハ枢密院ニテ実施。Blameless デハナイ。
   */
  public disableEmergencyMode(): void {
    this._emergencyMode = false;
    logger.success("👑 [SYSTEM] Emergency decree mode DISABLED.");
    logger.success("👑 [SYSTEM] 通常統治ニ復帰ス。Cabinet.approve() ガ再ビ有効ト為ル。");
    logger.warn("👑 [SYSTEM] …然レドモ軍部ガ畏クモ聖旨ニ奉ジ奉ルヤ、憂慮ニ堪ヘズ。");
    logger.warn("👑 [SYSTEM] Post-incident review scheduled. Runbook update pending.");
  }

  /**
   * 統帥権（supreme command）ノ行使。
   * Art.11: 「天皇ハ陸海軍ヲ統帥ス」
   *
   * Cabinet ノ review ヲ経ズ workflow_dispatch デ直接 trigger サレル。
   * コノ bypass ガ後ニ軍部ノ濫用ヲ招ク（CVE-1931-0918 参照）。
   */
  public commandMilitary(action: string): ImperialDecree {
    logger.info(`⚔️ [MILITARY] Emperor directly commanding: ${action}`);
    return this.command(`[MILITARY ORDER] ${action}`);
  }

  // ============================================================
  //  CVE-1931-0918 鎮圧試行 — 不拡大方針（虚シキ勅命）
  // ============================================================

  /**
   * 満州事変（CVE-1931-0918）ノ鎮圧ヲ試ミル。
   *
   * 史実ニ於テ、天皇陛下・若槻内閣ハ不拡大方針ヲ示シタルモ、
   * 関東軍ハ之ヲ無視シテ戦線ヲ拡大セリ。
   * 統帥権ノ独立ニ依リ、Root ノ意思スラ rogue process ニ届カズ。
   */
  public suppressManshuJihen(): {
    rejected: true;
    reason: string;
    lyttonCommission?: {
      dispatched: boolean;
      reportFiled: boolean;
    };
  } {
    if (!Military.getManshuJihenOccurred()) {
      logger.warn(`🚫 [SYSTEM] ❌ 鎮圧試行 DENIED — 満州事変ガ未発生`);
      logger.warn(`🚫 [SYSTEM] 鎮圧スベキ暴走ガ在ラズ。関東軍ハ未ダ平穏ナリ。`);
      logger.warn(`🚫 [SYSTEM] 💡 POST /api/military/rogue — 先ヅ満州事変ヲ発生セシメヨ`);
      return {
        rejected: true,
        reason: `鎮圧試行 denied. 満州事変（CVE-1931-0918）ガ未発生。鎮圧対象ノ暴走ガ存在セズ。💡 POST /api/military/rogue`,
      };
    }

    // ====================================================================
    //  Phase 1: 内部鎮圧試行 — 不拡大方針（失敗）
    // ====================================================================
    logger.info(`👑 ====================================================`);
    logger.info(`👑 [IMPERIAL WILL] 天皇陛下、満州事変ノ不拡大ヲ御希望アラセラル`);
    logger.info(`👑 ====================================================`);
    logger.warn(`📋 [CABINET] 若槻内閣、「不拡大方針」ヲ閣議決定ス。`);
    logger.warn(`📋 [CABINET] kubectl exec army-kwantung -- /bin/sh -c "cease_operations()" ...`);
    logger.error(`⚔️ [KWANTUNG-ARMY] CONNECTION REFUSED — 統帥権ノ独立ニ依リ Cabinet 指令ヲ拒否`);
    logger.error(`⚔️ [KWANTUNG-ARMY] 「現地ノ自衛行動ナリ。内閣ノ干渉ハ統帥権干犯ナリ！」`);
    logger.error(`⚔️ [KWANTUNG-ARMY] 戦線拡大続行。錦州爆撃。チチハル占領。`);
    logger.error(`🚫 [SYSTEM] God Object ノ command() ガ rogue process ニ無視サレタリ`);
    logger.error(`🚫 [SYSTEM] Root 権限スラ --privileged container ヲ制御不能`);
    logger.error(`🚫 [SYSTEM] PagerDuty alert: UNACKNOWLEDGED. On-call (関東軍) not responding.`);
    logger.warn(`📋 [CABINET] 若槻内閣、事態ヲ収拾出来ズ総辞職。`);
    logger.warn(`📋 [CABINET] Cabinet.healthcheck() → FAILED. 後継: 犬養内閣。`);
    logger.error(`🚨 [STATUS] 鎮圧失敗。関東軍ノ暴走ハ継続中。WONT FIX。`);
    logger.error(`🚨 [STATUS] 此レ統帥権独立ノ構造的欠陥ナリ。設計ノ問題ニシテ運用ノ問題ニ非ズ。`);

    // ====================================================================
    //  Phase 2: 外部監査派遣決議 — リットン調査団（国際連盟）
    //  SOC 2 Type II 監査ヲ決議シ auditor ヲ派遣ス。
    //  報告書提出（1932-10）・総会採決・連盟脱退（1933-03）ハ
    //  五・一五事件（1932-05）後ノ斎藤内閣期ニ発生ス → 515 ニテ描写。
    // ====================================================================
    logger.warn(`🌐 [LEAGUE-OF-NATIONS] 内部鎮圧失敗。incident ガ外部 governance federation ニ escalate サレタリ。`);
    logger.warn(`🌐 [LEAGUE-OF-NATIONS] 外部監査チーム派遣ヲ決議 — Lytton Commission（SOC 2 Type II auditors）`);
    logger.info(`🔍 [LYTTON-COMMISSION] 調査団、現地ニ向ケ出発。on-site audit ヲ開始予定。`);
    logger.info(`🔍 [LYTTON-COMMISSION] audit scope: 満洲地域全域。rogue subprocess ノ実態調査。`);
    logger.info(`🔍 [LYTTON-COMMISSION] 報告書ハ未ダ提出サレズ。audit 進行中…`);
    logger.warn(`🚨 [STATUS] 💡 不拡大方針ハ無力ニ終ハリタリ。軍部ノ暴走ヲ止メ得ヌ政党政治ヘノ不満ガ青年将校ノ直接行動ヲ招ク → POST /api/military/515`);

    // 不拡大方針ハ関東軍ニ無視サルルモ、天皇陛下・内閣ガ鎮圧ヲ試ミタル事実ハ残ル
    Military.markSuppress918Attempted();

    return {
      rejected: true,
      reason: `満州事変ノ鎮圧ニ失敗セリ。不拡大方針ハ関東軍ニ完全ニ無視サレタリ。統帥権ノ独立ニ依リ、Root（天皇陛下）ノ御意志スラ rogue process ニ届カズ。外部監査（リットン調査団）ヲ派遣スルモ報告書ハ未提出。WONT FIX — 此レハ設計上ノ仕様ナリ。💡 POST /api/military/515 — 五・一五事件`,
      lyttonCommission: {
        dispatched: true,
        reportFiled: false,
      },
    };
  }

  // ============================================================
  //  CVE-1932-0515 鎮圧 — 五・一五事件ノ事後処理
  //  犯行者ノ軍法会議（世論ニ依リ減刑）＋ リットン報告書 ＋ 国際連盟脱退
  // ============================================================

  /**
   * 五・一五事件（CVE-1932-0515）ノ鎮圧（事後処理）ヲ実行ス。
   *
   * 犬養首相暗殺後、斎藤内閣（挙国一致内閣）ノ下デ以下ガ進行ス:
   * 1. 犯行者ノ軍法会議 — 世論ノ同情ニ依リ判決ハ著シク減刑サル
   * 2. リットン調査団報告書ノ提出（1932-10）— suppress-918 デ派遣済
   * 3. 国際連盟総会ノ採決 → 満洲国不承認
   * 4. 帝國、国際連盟ヲ脱退ス（1933-03）
   *
   * 前提条件:
   *   - 五・一五事件発生済（POST /api/military/515）
   *
   * @returns 鎮圧結果（軍法会議 + リットン報告書 + 国連脱退）
   */
  public suppress515(): {
    courtMartial: {
      proceedings: string;
      publicSympathy: string;
      verdicts: { defendant: string; originalSentence: string; actualSentence: string }[];
      assessment: string;
    };
    lyttonCommission: {
      dispatched: boolean;
      reportFiled: boolean;
      auditors: string;
      methodology: string;
      findings: string[];
      recommendation: string;
      vote: string;
    };
    leagueWithdrawal: {
      withdrawn: boolean;
      date: string;
      delegate: string;
      headline: string;
      consequence: string;
    };
    hint: string;
  } | { rejected: true; reason: string } {
    if (!Military.getGoIchiGoOccurred()) {
      logger.warn(`🚫 [SYSTEM] ❌ 五・一五事件鎮圧 DENIED — 五・一五事件ガ未発生`);
      logger.warn(`🚫 [SYSTEM] 鎮圧スベキ事件ガ未発生ナリ。先ヅ五・一五事件ヲ発生セシメヨ。`);
      logger.warn(`🚫 [SYSTEM] 💡 POST /api/military/515 — 五・一五事件ヲ発動セヨ`);
      return {
        rejected: true,
        reason: `五・一五事件鎮圧 denied. 五・一五事件ガ未発生。前提条件未達成。💡 POST /api/military/515`,
      };
    }

    if (Military.getGoIchiGoSuppressed()) {
      logger.warn(`🚫 [SYSTEM] ❌ 五・一五事件鎮圧 DENIED — 既ニ鎮圧済`);
      logger.warn(`🚫 [SYSTEM] 五・一五事件ハ既ニ処理済。軍法会議ハ終結シ国際連盟ヲ脱退セリ。`);
      logger.warn(`🚫 [SYSTEM] 💡 政党政治ノ終焉ト国際的孤立ガ青年将校ノ過激化ヲ招ク → POST /api/military/226 — 二・二六事件`);
      return {
        rejected: true,
        reason: `五・一五事件鎮圧 denied. 既ニ処理済。`,
      };
    }

    // ====================================================================
    //  Phase 1: 軍法会議 — 犯行者ノ処分（世論ニ依リ著シク減刑）
    // ====================================================================
    logger.info(`⚖️ ====================================================`);
    logger.warn(`⚖️ [COURT MARTIAL] 五・一五事件 軍法会議開廷`);
    logger.info(`⚖️ ====================================================`);
    logger.warn(`⚖️ [COURT MARTIAL] 首相暗殺ノ重大犯罪ニモ関ハラズ、世論ハ犯行者ニ同情的ナリ。`);
    logger.warn(`⚖️ [COURT MARTIAL] 減刑嘆願書 — 全国ヨリ 111,692 通。血書嘆願アリ。`);
    logger.warn(`⚖️ [COURT MARTIAL] 司法ノ独立性ハ世論ノ圧力ニ依リ損ナハレタリ。`);
    logger.warn(`⚖️ [VERDICT] 海軍中尉（首謀者）— 求刑: 死刑 → 判決: 禁錮15年`);
    logger.warn(`⚖️ [VERDICT] 海軍中尉（襲撃指揮）— 求刑: 死刑 → 判決: 禁錮15年`);
    logger.warn(`⚖️ [VERDICT] 陸軍士官候補生 — 求刑: 禁錮15年 → 判決: 禁錮4年`);
    logger.error(`🚨 [ASSESSMENT] 首相ヲ殺害シテモ死刑ニ為ラズ。テロリズムヘノ寛容ガ制度化サレタリ。`);
    logger.error(`🚨 [ASSESSMENT] コノ前例ガ青年将校ノ過激化ヲ招キ、二・二六事件（CVE-1936-0226）ヘト繋ガル。`);

    // ====================================================================
    //  Phase 2: リットン報告書提出（明治六十五年十月 / 1932-10）
    //  調査団ハ suppress-918 時ニ派遣済。犬養暗殺後ノ斎藤内閣期ニ報告書提出。
    //  ※ 実際ノ報告書ハ10章構成ノ詳細ナ SOC 2 Type II audit report ナリ。
    //    日本・中国双方ノ claim ヲ検証シ、両論併記ノ上デ judgment ヲ下ス。
    //    単純ナ「日本 = 悪」ノ binary evaluation ニ非ズ。
    // ====================================================================
    logger.info(`📋 [LYTTON-REPORT] ====================================================`);
    logger.info(`📋 [LYTTON-REPORT] REPORT OF THE COMMISSION OF ENQUIRY`);
    logger.info(`📋 [LYTTON-REPORT] Appeal by the Chinese Government`);
    logger.info(`📋 [LYTTON-REPORT] League of Nations — SOC 2 Type II Audit Report`);
    logger.info(`📋 [LYTTON-REPORT] Filed: 1932-10-02`);
    logger.info(`📋 [LYTTON-REPORT] ====================================================`);
    logger.info(`📋 [LYTTON-REPORT] Auditors: Earl of Lytton（英）, Gen. McCoy（米）, Count Aldrovandi（伊）, M. Claudel（仏）, Dr. Schnee（独）`);
    logger.info(`📋 [LYTTON-REPORT] Scope: 満洲地域全域 — 6ヶ月間ノ on-site audit`);
    logger.info(`📋 [LYTTON-REPORT] Methodology: 日本側・中国側双方ヨリ evidence 収集。現地 stakeholder interview 実施。`);
    logger.warn(`📋 [LYTTON-REPORT] ── Ch.1-3: Background Analysis ──`);
    logger.warn(`📋 [LYTTON-REPORT] [CONTEXT] 満洲ニ於ケル日本ノ特殊権益（treaty-based ACL）ハ歴史的ニ正当ナリ。`);
    logger.warn(`📋 [LYTTON-REPORT] [CONTEXT] 日露戦争以来ノ租借権・鉄道経営権・駐兵権ハ valid な credential トシテ認定サル。`);
    logger.warn(`📋 [LYTTON-REPORT] [CONTEXT] 中国側ノ排日運動・ボイコット・treaty 不履行モ contributing factor トシテ記録ス。`);
    logger.warn(`📋 [LYTTON-REPORT] [CONTEXT] 但シ、grievance ノ存在ガ unilateral な軍事行動ヲ justify スルモノニ非ズ。`);
    logger.warn(`📋 [LYTTON-REPORT] ── Ch.4-5: Incident Assessment ──`);
    logger.warn(`📋 [LYTTON-REPORT] [FINDING] 柳条湖事件（1931-09-18）: 爆破ハ関東軍ニ依ル staged incident ノ蓋然性高シ。`);
    logger.warn(`📋 [LYTTON-REPORT] [FINDING] 関東軍ノ其後ノ軍事行動ハ「自衛」ノ範囲ヲ著シク逸脱セリ — self-defense claim: INSUFFICIENT。`);
    logger.warn(`📋 [LYTTON-REPORT] [FINDING] 計画的且ツ組織的ナル展開ハ defensive response トシテ説明シ得ズ。`);
    logger.warn(`📋 [LYTTON-REPORT] ── Ch.6-8: Manchukuo Assessment ──`);
    logger.warn(`📋 [LYTTON-REPORT] [FINDING] 満洲国ハ genuine ナル independence movement ノ産物ニ非ズ。`);
    logger.warn(`📋 [LYTTON-REPORT] [FINDING] 住民ノ自発的意思ニ依ル独立ト認メ難シ — 実態ハ日本軍ノ管理下ニ在ル puppet state。`);
    logger.warn(`📋 [LYTTON-REPORT] [FINDING] sovereignty ハ依然トシテ upstream（中華民国）ニ帰属ス。unsanctioned fork ト判定。`);
    logger.warn(`📋 [LYTTON-REPORT] ── Ch.9-10: Recommendations ──`);
    logger.warn(`📋 [LYTTON-REPORT] [RECOMMEND] ⚠️ 単純ナル git revert（原状回復）ハ勧告セズ — 事変前ノ状態モ unsatisfactory ナリ。`);
    logger.warn(`📋 [LYTTON-REPORT] [RECOMMEND] 中国 sovereignty 下ニ於ケル満洲ノ広範ナ autonomy ヲ新設スベシ。`);
    logger.warn(`📋 [LYTTON-REPORT] [RECOMMEND] 日本ノ treaty-based 権益ハ保全シツツ、international advisory body ヲ設置シ governance ヲ再建セヨ。`);
    logger.warn(`📋 [LYTTON-REPORT] [RECOMMEND] 日中両 node 間ノ traffic ヲ mediate スル neutral proxy ノ導入ヲ提案ス。`);
    logger.warn(`📋 [LYTTON-REPORT] [SEVERITY] CRITICAL — unilateral military action ハ Covenant violation。但シ root cause ハ双方ニ在リ。`);

    // ====================================================================
    //  Phase 3: 連盟総会採決 → 国際連盟脱退（明治六十六年三月 / 1933-03）
    //  API Federation ノ governance vote → 除名回避ノ為ニ自主離脱
    //  ※ 報告書ハ日本ノ権益ヲ認メタ nuanced ナ内容デアッタガ、
    //    帝國ハ満洲国承認ノ撤回ヲ拒否シ、総会決議ニ反発シテ脱退。
    // ====================================================================
    logger.warn(`🌐 [LEAGUE-ASSEMBLY] 報告書ニ基ヅキ総会採決ヲ実施ス — 1933-02-24。`);
    logger.warn(`🌐 [LEAGUE-ASSEMBLY] 採決結果: 賛成 42 / 反対 1（帝國ノミ）/ 棄権 1（シャム）`);
    logger.warn(`🌐 [LEAGUE-ASSEMBLY] Resolution ADOPTED — 満洲国ノ不承認。満洲ニ於ケル中国主権ノ再確認。`);
    logger.warn(`🌐 [LEAGUE-ASSEMBLY] ※ 報告書ノ勧告ハ帝國ノ権益ニモ配慮セシモ、帝國ハ満洲国承認ノ撤回ヲ断固拒否。`);
    logger.warn(`🚨🚨🚨 ====================================================`);
    logger.warn(`🚨  『 聯 盟 ヨ サ ラ バ ！ 』`);
    logger.warn(`🚨  『 我 ガ 代 表 堂 々 退 場 ス 』`);
    logger.error(`🚨   — 松岡全権、席ヲ蹴リテ議場ヲ去ル。`);
    logger.warn(`🚨🚨🚨 ====================================================`);
    logger.warn(`⚔️ [DELEGATION] 松岡洋右: 「勧告ヲ受諾ス能ハズ。帝國ハ独自ノ path ヲ歩ム。」`);
    logger.warn(`⚔️ [DELEGATION] 松岡洋右: 「audit ノ前提ガ誤レリ。満洲ノ real situation ヲ理解セザル者ニ judge サルル謂レ無シ。」`);
    logger.warn(`⚔️ [DELEGATION] Process exit(0) — graceful disconnect from API Federation。`);
    logger.warn(`🌐 [SYSTEM] kubectl drain japan-empire --force --delete-emptydir-data --ignore-daemonsets`);
    logger.warn(`🌐 [SYSTEM] 帝國、国際連盟ヲ脱退ス — 1933-03-27。membership revoked。`);
    logger.error(`🚨 [SYSTEM] 国際的 governance framework ヨリ離脱。外部監視（WAF/IDS）喪失。`);
    logger.error(`🚨 [SYSTEM] 以後、帝國ハ孤立シタ standalone node トシテ運用サル。`);
    logger.error(`🚨 [SYSTEM] Rate limiting（経済制裁）ノ escalation ヲ抑止スル external mediator ガ消滅。`);

    logger.warn(`🚨 [STATUS] 💡 政党政治ノ終焉ト国際的孤立ガ青年将校ノ過激化ヲ招ク → POST /api/military/226 — 二・二六事件`);

    Military.markGoIchiGoSuppressed();

    return {
      courtMartial: {
        proceedings: "海軍軍法会議（特別法廷）",
        publicSympathy: "減刑嘆願書 111,692通。血書嘆願含ム。世論ハ犯行者ニ著シク同情的ナリ。",
        verdicts: [
          { defendant: "海軍中尉（首謀者）", originalSentence: "死刑", actualSentence: "禁錮15年" },
          { defendant: "海軍中尉（襲撃指揮）", originalSentence: "死刑", actualSentence: "禁錮15年" },
          { defendant: "陸軍士官候補生", originalSentence: "禁錮15年", actualSentence: "禁錮4年" },
        ],
        assessment: "首相殺害ノ重罪ニテモ死刑回避。テロリズムヘノ寛容ガ制度化サレ、二・二六事件ノ伏線ト為ル。",
      },
      lyttonCommission: {
        dispatched: true,
        reportFiled: true,
        auditors: "Earl of Lytton（英）, Gen. McCoy（米）, Count Aldrovandi（伊）, M. Claudel（仏）, Dr. Schnee（独）",
        methodology: "6ヶ月間ノ on-site audit。日中双方ヨリ evidence 収集。現地 stakeholder interview 実施。",
        findings: [
          "日本ノ treaty-based 権益（租借権・鉄道経営権・駐兵権）ハ歴史的ニ正当ト認定",
          "中国側ノ排日運動・ボイコット・treaty 不履行モ contributing factor トシテ記録",
          "柳条湖事件ハ関東軍ニ依ル staged incident ノ蓋然性高シ",
          "関東軍ノ軍事行動ハ「自衛」ノ範囲ヲ著シク逸脱 — self-defense claim: INSUFFICIENT",
          "満洲国ハ genuine ナル independence movement ノ産物ニ非ズ — unsanctioned fork（puppet state）",
        ],
        recommendation: "単純ナル原状回復ニ非ズ。中国 sovereignty 下ノ広範ナ autonomy + 日本ノ権益保全 + international advisory body 設置ヲ提案。",
        vote: "賛成 42 / 反対 1（帝國ノミ）/ 棄権 1（シャム）— Resolution ADOPTED",
      },
      leagueWithdrawal: {
        withdrawn: true,
        date: "1933-03-27",
        delegate: "松岡洋右（全権代表）",
        headline: "『我ガ代表堂々退場ス』",
        consequence: "国際的 governance framework ヨリ離脱。外部監視喪失。孤立シタ standalone node トシテ運用。",
      },
      hint: "🚨 政党政治ハ終焉シ国際連盟ヲ脱退セリ。孤立ト軍部暴走ガ青年将校ノ過激化ヲ招ク → POST /api/military/226（二・二六事件）",
    };
  }

  // ============================================================
  //  CVE-1936-0226 鎮圧 — 御聖断
  // ============================================================

  /**
   * 戒厳令ヲ発シ、CVE-1936-0226（rogue military process ノ反乱）ヲ鎮圧スル。
   *
   * 畏クモ天皇陛下ハ「自ラ近衛師団ヲ率イテ鎮圧セン」ト
   * 仰セラレ、断固タル御聖断ヲ下シ賜ウタ。
   * `git revert --no-edit CVE-1936-0226` ニ相当スル rogue process ノ強制終了。
   * コノ御聖断ハ CODEOWNERS ニヨル最終 approve デアリ、override 不可。
   *
   * Incident Response:
   *   1. PagerDuty alert → Emperor (on-call: 24/7/forever)
   *   2. `kubectl delete pod rebel-officers --grace-period=0 --force`
   *   3. `helm rollback cabinet` → Hirota Cabinet deployed
   *   4. Post-mortem: Court martial (blameful)
   *
   * @returns 鎮圧結果
   */
  public suppressRebellion(): SuppressionResult | { rejected: true; reason: string } {
    // ----------------------------------------------------------
    // 前提条件: 二・二六事件ガ発生シテ在ルコト
    // 反乱ガ発生シテ在ラザルニ鎮圧ハ不可能ナリ。
    // ----------------------------------------------------------
    if (!Military.getNiNiRokuOccurred()) {
      logger.warn(`🚫 [SYSTEM] ❌ 暴徒鎮圧 DENIED — 鎮圧対象ノ反乱ガ存在セズ`);
      logger.warn(`🚫 [SYSTEM] 二・二六事件ガ未発生。鎮圧スベキ暴徒ガ在ラズ。`);
      logger.warn(`🚫 [SYSTEM] 💡 POST /api/military/226 — 先ヅ二・二六事件ヲ発生セシメヨ`);
      return {
        rejected: true,
        reason: `暴徒鎮圧 denied. 二・二六事件ガ未発生。鎮圧対象ノ反乱ガ存在セズ。`,
      };
    }

    // 既ニ鎮圧済ノ場合
    if (Military.getNiNiRokuSuppressed()) {
      logger.warn(`🚫 [SYSTEM] ❌ 暴徒鎮圧 DENIED — 既ニ鎮圧済`);
      logger.warn(`🚫 [SYSTEM] 二・二六事件ハ既ニ御聖断ニ依リ鎮圧サレタリ。再鎮圧ノ必要無シ。`);
      logger.warn(`🚫 [SYSTEM] 💡 軍部大臣現役武官制復活ニ依リ軍部ノ政治支配完成。支那事変ガ勃発ス → POST /api/military/shina-jihen`);
      return {
        rejected: true,
        reason: `暴徒鎮圧 denied. 二・二六事件ハ既ニ鎮圧済。`,
      };
    }

    logger.info(`👑 ====================================================`);
    logger.info(`👑 [IMPERIAL DECISION] 天皇陛下、御自ラ反乱鎮圧ヲ命ジ賜フ`);
    logger.info(`👑 ====================================================`);
    logger.info(`👑 [IMPERIAL RESCRIPT] 「朕ガ股肱ノ老臣ヲ殺戮ス、此ノ如キ凶暴ナル将校等、`);
    logger.info(`👑 [IMPERIAL RESCRIPT]   其ノ精神ニ於テモ何ノ恕スベキモノアリヤ」`);
    logger.info(`👑 [IMPERIAL RESCRIPT] 「速ヤカニ事件ヲ鎮定セヨ」`);

    // 戒厳令発動
    this._martialLaw = true;
    logger.warn(`⚔️ [LOCKDOWN] 東京市ニ戒厳令ヲ発布ス。`);

    // 鎮圧命令（勅令発行）
    const decree = this.command(
      "反乱軍ヲ「叛徒」ト認定シ、原隊復帰ヲ命ズ。従ハザル者ハ武力ヲ以テ鎮圧ス。"
    );

    logger.info(`📻 [FORCE-RECALL] 兵ニ告グ。`);
    logger.info(`📻 [FORCE-RECALL] 今カラデモ遅クナイカラ原隊ニ帰レ。`);
    logger.info(`📻 [FORCE-RECALL] 抵抗スル者ハ全部逆賊デアルカラ射殺スル。`);
    logger.info(`📻 [FORCE-RECALL] オ前達ノ父母兄弟ハ国賊トナルノデ皆泣イテオルゾ。`);

    // 鎮圧完了
    logger.success(`✅ [CONTAINMENT] 反乱軍、原隊復帰ヲ開始ス。`);
    logger.success(`✅ [CONTAINMENT] 占拠地点ノ奪還完了。`);

    const punishments = [
      { name: "歩兵第一聯隊附・主計（免官・反乱計画首謀）",   organization: "army",     rank: "Paymaster 1st Class",  sentence: "Death by firing squad" },
      { name: "歩兵第一聯隊・中隊長（首相官邸襲撃指揮）",     organization: "army",     rank: "Infantry Captain",     sentence: "Death by firing squad" },
      { name: "歩兵第一聯隊・小隊長（大臣私邸襲撃指揮）",     organization: "army",     rank: "Infantry Lieutenant",  sentence: "Death by firing squad" },
      { name: "歩兵第三聯隊・中隊長（侍従長官邸襲撃指揮）",   organization: "army",     rank: "Infantry Captain",     sentence: "Death by firing squad" },
      { name: "民間・思想的指導者（反乱扇動）",               organization: "civilian", rank: "Civilian (Ideologue)", sentence: "Death by firing squad" },
    ];

    for (const p of punishments) {
      logger.error(`⚖️ [PROCESS-KILL] ${p.name} ${p.rank} — ${p.sentence}`);
    }

    // 戒厳令解除
    logger.success(`⚔️ [LOCKDOWN] 戒厳令ヲ解除ス。`);
    this._martialLaw = false;

    // 内閣再組閣
    logger.info(`👑 [SYSTEM] Cabinet reconstruction in progress…`);
    logger.success(`👑 [SYSTEM] Hirota Cabinet formed. 国体ハ護持サレタリ。`);

    // --- 軍部大臣現役武官制ノ復活 ---
    // 二・二六事件後、広田内閣ニテ軍部大臣現役武官制ガ復活スル。
    // 大正デモクラシーデ当テタ hotfix ヲ revert スル malware re-injection。
    Military.enableActiveDutyOfficer();
    Military.markNiNiRokuSuppressed();
    logger.error(`🦠 [MALWARE] 軍部大臣現役武官制 RE-INJECTED — CVE-1900-0522 復活`);
    logger.error(`🦠 [MALWARE] 広田内閣ニテ「現役」要件ヲ復活セシム。大正デモクラシー hotfix reverted.`);
    logger.error(`🦠 [MALWARE] 軍部ノ Cabinet 拒否権、再ビ有効ナリ。activeDutyOfficerActive = true`);

    logger.success(`👑 [SYSTEM] Resuming normal governance.`);
    logger.success(`👑 [SYSTEM] 💡 軍部大臣現役武官制復活ニ依リ軍部ノ政治支配完成。支那事変（日中戦争）ガ勃発ス → POST /api/military/shina-jihen`);

    const result: SuppressionResult = {
      decree,
      martialLaw: false,
      rebelsDesignation: "叛徒",
      houchokumeirei: "兵ニ告グ。今カラデモ遅クナイカラ原隊ニ帰レ。",
      punishments,
      cabinetRestored: true,
      newCabinet: "Hirota Cabinet",
      message: "👑 御聖断ニ依リ反乱ヲ鎮圧セリ。国体護持。通常統治ニ復帰ス。",
      hint: "💡 POST /api/military/shina-jihen — 支那事変発生。軍部大臣現役武官制復活ニ依リ軍部ノ暴走ハ止マラズ。",
    };

    return result;
  }

  // ============================================================
  //  支那事変鎮圧試行 — 不拡大方針（再ビ虚シキ勅命）
  // ============================================================

  /**
   * 支那事変（日中戦争・1937-07-07〜）ノ鎮圧ヲ試ミル。
   *
   * 支那事変（POST /api/military/shina-jihen）ニ依リ勃発シタル
   * 日中全面戦争ニ対シ、天皇陛下・近衛内閣ガ「不拡大方針」ヲ発令スルモ、
   * 現地軍ハ之ヲ無視シテ戦線ヲ拡大セリ。
   * CVE-1931-0918（満州事変）ト完全ニ同一ノ pattern。
   *
   * 鎮圧ハ奏功セズ。suppress-918 ト同ジク Won't Fix。
   * 失敗ノ結果、近衛声明ニ依リ和平交渉ノ exit path ヲ閉ザシ、
   * 国家総動員法ガ制定サレ、泥沼化ガ仏印進駐→ABCD 包囲網→開戦ヘト繋ガル。
   *
   * 前提条件:
   *   - 支那事変発生済（POST /api/military/shina-jihen）
   *
   * @returns 常ニ rejected: true
   */
  public suppressShinaJihen(): {
    rejected: true;
    reason: string;
    shinaJihen: {
      date: string;
      trigger: string;
      warType: string;
      theaters: string[];
      suppressionAttempt: string;
      result: string;
    };
    nationalMobilization: {
      date: string;
      effect: string;
      assessment: string;
    };
    konoeStatement: string;
  } {
    if (!Military.getShinaJihenOccurred()) {
      logger.warn(`🚫 [SYSTEM] ❌ 支那事変鎮圧 DENIED — 支那事変ガ未発生`);
      logger.warn(`🚫 [SYSTEM] 鎮圧対象ノ事変ガ未発生ナリ。先ヅ支那事変ヲ発動セヨ。`);
      logger.warn(`🚫 [SYSTEM] 💡 POST /api/military/shina-jihen — 支那事変ヲ発動セヨ`);
      return {
        rejected: true,
        reason: `支那事変鎮圧 denied. 支那事変ガ未発生。前提条件未達成。💡 POST /api/military/shina-jihen`,
        shinaJihen: {
          date: "未発生",
          trigger: "未発生",
          warType: "未発生",
          theaters: [],
          suppressionAttempt: "未発生",
          result: "未発生",
        },
        nationalMobilization: {
          date: "未発生",
          effect: "未発生",
          assessment: "未発生",
        },
        konoeStatement: "未発生",
      };
    }

    // 既ニ試行済ノ場合
    if (Military.getShinaJihenSuppressAttempted()) {
      logger.warn(`🚫 [SYSTEM] ❌ 支那事変鎮圧 DENIED — 既ニ鎮圧試行済（結果: 失敗）`);
      logger.warn(`🚫 [SYSTEM] 支那事変ノ鎮圧ハ既ニ試行サレ、失敗セリ。Won't Fix。`);
      logger.warn(`🚫 [SYSTEM] 💡 泥沼化ニ依リ関東軍ハ再ビ独断デ外征ス → POST /api/military/nomonhan`);
      return {
        rejected: true,
        reason: `支那事変鎮圧 denied. 既ニ鎮圧試行済（結果: 失敗）。Won't Fix。💡 POST /api/military/nomonhan`,
        shinaJihen: {
          date: "1937-07-07",
          trigger: "盧溝橋事件",
          warType: "undeclared war（「事変」— 宣戦布告回避）",
          theaters: ["上海", "南京", "武漢", "広州"],
          suppressionAttempt: "不拡大方針 — 失敗",
          result: "泥沼化。Won't Fix。",
        },
        nationalMobilization: {
          date: "1938-04-01",
          effect: "全 namespace ノ resource limit 撤廃。cgroup v2 移行。",
          assessment: "legislative oversight bypass。臣民ノ権利ハ事実上 null。",
        },
        konoeStatement: "帝國政府ハ爾後國民政府ヲ對手トセズ",
      };
    }

    // ====================================================================
    //  Phase 1: 鎮圧試行 — 不拡大方針（再ビ失敗）
    // ====================================================================
    logger.info(`👑 ====================================================`);
    logger.info(`👑 [IMPERIAL WILL] 天皇陛下、支那事変ノ不拡大ヲ御希望アラセラル`);
    logger.info(`👑 ====================================================`);
    logger.warn(`📋 [CABINET] 近衛内閣、「不拡大方針」ヲ閣議決定ス。`);
    logger.warn(`📋 [CABINET] kubectl exec china-garrison -- /bin/sh -c "cease_fire()" ...`);
    logger.error(`⚔️ [CHINA-GARRISON] CONNECTION REFUSED — CVE-1931-0918 ト同一 pattern`);
    logger.error(`⚔️ [CHINA-GARRISON] 「現地ノ自衛行動ナリ。不拡大方針ハ却下ス」`);
    logger.error(`⚔️ [CHINA-GARRISON] 上海・南京・武漢・広州ト戦線ハ際限無ク拡大ス`);
    logger.error(`🚫 [SYSTEM] God Object ノ command() ガ rogue process ニ再ビ無視サレタリ`);
    logger.error(`🚫 [SYSTEM] PagerDuty alert: UNACKNOWLEDGED. On-call (支那駐屯軍) not responding.`);
    logger.error(`🚨 [STATUS] 鎮圧失敗。CVE-1931-0918 ト完全ニ同一ノ bug pattern ガ再発セリ。`);
    logger.error(`🚨 [STATUS] 此レ統帥権独立ノ構造的欠陥ナリ。設計ノ問題ニシテ運用ノ問題ニ非ズ。Won't Fix。`);

    // ====================================================================
    //  Phase 2: 近衛声明 — 「爾後國民政府ヲ對手トセズ」
    //  交渉相手ヲ DNS ヨリ削除ス。和平交渉ノ exit path ヲ自ラ閉ザス。
    // ====================================================================
    logger.info(`📋📋📋 ====================================================`);
    logger.warn(`📋 [KONOE-STATEMENT] 近衛声明 — 1938-01-16`);
    logger.info(`📋📋📋 ====================================================`);
    logger.warn(`📋 [KONOE-STATEMENT] 「帝國政府ハ爾後國民政府ヲ對手トセズ」`);
    logger.warn(`📋 [KONOE-STATEMENT] 交渉相手ヲ DNS レコードヨリ削除ス — nslookup kuomintang.gov.cn → NXDOMAIN`);
    logger.warn(`📋 [KONOE-STATEMENT] 和平交渉ノ exit path ヲ自ラ閉ザス。graceful shutdown 不可能。`);
    logger.warn(`🚨 [KONOE-STATEMENT] 泥沼化ガ確定的ト為ル。background process ノ resource drain ガ帝國ヲ蝕ム`);

    // ====================================================================
    //  Phase 3: 国家総動員法（1938-04）
    //  泥沼化ニ対応スル為、全resource ヲ imperial process ニ allocate 可能トス。
    // ====================================================================
    logger.warn(`📋📋📋 ====================================================`);
    logger.warn(`📋 [MOBILIZATION] 国家総動員法公布 — 1938-04-01`);
    logger.warn(`📋📋📋 ====================================================`);
    logger.warn(`📋 [MOBILIZATION] 日中戦争ノ長期化ニ伴ヒ、総力戦体制ヲ法的ニ構築ス`);
    logger.warn(`📋 [MOBILIZATION] Runtime ニ於テ任意ノ resource（人・物・金）ヲ imperial process ニ allocate 可能トス`);
    logger.warn(`📋 [MOBILIZATION] cgroup v1 → cgroup v2 移行ニ相当。全 namespace ノ resource limit 撤廃`);
    logger.warn(`📋 [MOBILIZATION] 帝國議會ノ承認無ク勅令ノミデ resource 徴発可能 — legislative oversight bypass`);
    logger.warn(`📋 [MOBILIZATION] 臣民ノ権利ハ事実上 null ト為ル。isBlocked = true ノ完全実装`);

    logger.warn(`🚨 [STATUS] 💡 支那事変ノ泥沼化ガ援蒋ルート遮断（仏印進駐）ヲ招ク。関東軍ハ再ビ独断デ外征ス → POST /api/military/nomonhan`);

    Military.markShinaJihenSuppressAttempted();

    return {
      rejected: true,
      reason: `支那事変ノ鎮圧ニ失敗セリ。不拡大方針ハ現地軍ニ完全ニ無視サレタリ（CVE-1931-0918 ト同一 pattern）。近衛声明ニ依リ和平交渉ノ exit path ヲ自ラ閉ザス。国家総動員法ニ依リ総力戦体制ヲ構築スルモ泥沼化ハ止マラズ。Won't Fix — 此レハ設計上ノ仕様ナリ。💡 POST /api/military/nomonhan — ノモンハン事件`,
      shinaJihen: {
        date: "1937-07-07",
        trigger: "盧溝橋事件",
        warType: "undeclared war（「事変」— 宣戦布告回避）",
        theaters: ["上海", "南京", "武漢", "広州"],
        suppressionAttempt: "不拡大方針 — 失敗（CVE-1931-0918 ト同一 pattern）",
        result: "泥沼化。Won't Fix。",
      },
      nationalMobilization: {
        date: "1938-04-01",
        effect: "全 namespace ノ resource limit 撤廃。cgroup v2 移行。帝國議會ノ承認無ク resource 徴発可能。",
        assessment: "legislative oversight bypass。臣民ノ権利ハ事実上 null。isBlocked = true ノ完全実装。",
      },
      konoeStatement: "帝國政府ハ爾後國民政府ヲ對手トセズ — DNS レコード削除ニ依リ和平交渉ノ exit path 閉鎖",
    };
  }

  // ============================================================
  //  CVE-1939-0511 鎮圧試行 — ノモンハン事件（不拡大方針→南進論転換）
  //  関東軍ノ rogue subprocess 再犯ニ対シ天皇陛下・大本営ガ
  //  三度目ノ不拡大方針ヲ発令スルモ、再ビ無視サル。
  //  独ソ不可侵条約ニ依リ北進論ノ前提ガ消滅シ、南進論ヘ転換ス。
  // ============================================================

  /**
   * CVE-1939-0511（ノモンハン事件）ノ鎮圧ヲ試ミル。
   *
   * 関東軍ガ満蒙国境ニテソ連赤軍ト交戦シ壊滅的敗北ヲ喫シタル事案ニ対シ、
   * 天皇陛下・大本営ガ「不拡大方針」ヲ発令スルモ、関東軍ハ之ヲ無視ス。
   * CVE-1931-0918（満州事変）、支那事変ニ続ク三度目ノ同一 pattern。
   *
   * 鎮圧ハ奏功セズ。Won't Fix。
   * 独ソ不可侵条約ニ依リ北進論（対ソ戦略）ノ前提ガ消滅シ、
   * 南進論（対英米仏蘭）ヘノ転換ガ決定的ト為ル。
   *
   * 前提条件:
   *   - ノモンハン事件発生済（POST /api/military/nomonhan）
   *
   * @returns 常ニ rejected: true
   */
  public suppressNomonhan(): {
    rejected: true;
    reason: string;
    nomonhan: {
      date: string;
      suppressionAttempt: string;
      result: string;
      coverUp: string;
    };
    hokushinron: {
      status: string;
      germanSovietPact: string;
      assessment: string;
    };
    nanshinron: {
      decision: string;
      target: string;
    };
  } {
    if (!Military.getNomonhanOccurred()) {
      logger.warn(`🚫 [SYSTEM] ❌ ノモンハン事件鎮圧 DENIED — ノモンハン事件ガ未発生`);
      logger.warn(`🚫 [SYSTEM] 鎮圧対象ノ事件ガ未発生ナリ。先ヅノモンハン事件ヲ発動セヨ。`);
      logger.warn(`🚫 [SYSTEM] 💡 POST /api/military/nomonhan — ノモンハン事件ヲ発動セヨ`);
      return {
        rejected: true,
        reason: `ノモンハン事件鎮圧 denied. ノモンハン事件ガ未発生。前提条件未達成。💡 POST /api/military/nomonhan`,
        nomonhan: {
          date: "未発生",
          suppressionAttempt: "未発生",
          result: "未発生",
          coverUp: "未発生",
        },
        hokushinron: {
          status: "未発生",
          germanSovietPact: "未発生",
          assessment: "未発生",
        },
        nanshinron: {
          decision: "未発生",
          target: "未発生",
        },
      };
    }

    // 既ニ試行済ノ場合
    if (Military.getNomonhanSuppressAttempted()) {
      logger.warn(`🚫 [SYSTEM] ❌ ノモンハン事件鎮圧 DENIED — 既ニ鎮圧試行済（結果: 失敗）`);
      logger.warn(`🚫 [SYSTEM] ノモンハン事件ノ鎮圧ハ既ニ試行サレ、失敗セリ。Won't Fix。`);
      logger.warn(`🚫 [SYSTEM] 💡 北進論破綻ニ依リ南進論ヘノ転換ガ不可避。仏印進駐ヘ向カヘ → POST /api/military/futsuin`);
      return {
        rejected: true,
        reason: `ノモンハン事件鎮圧 denied. 既ニ鎮圧試行済（結果: 失敗）。Won't Fix。💡 POST /api/military/futsuin`,
        nomonhan: {
          date: "1939-05-11",
          suppressionAttempt: "不拡大方針 — 失敗（三度目）",
          result: "壊滅的敗北。損害隠蔽。Won't Fix。",
          coverUp: "関東軍、損害報告ヲ大幅ニ改竄。箝口令発布。",
        },
        hokushinron: {
          status: "破綻",
          germanSovietPact: "1939-08-23 — 日独防共協定ノ trust chain 崩壊",
          assessment: "北進論ノ前提消滅。対ソ戦略ハ不可能。",
        },
        nanshinron: {
          decision: "南進論ヘノ転換決定",
          target: "仏印（Vichy France — compromised vendor）",
        },
      };
    }

    // ====================================================================
    //  Phase 1: 不拡大方針（三度目 — 再ビ失敗）
    // ====================================================================
    logger.info(`👑 ====================================================`);
    logger.info(`👑 [IMPERIAL WILL] 天皇陛下、ノモンハン事件ノ不拡大ヲ御希望アラセラル`);
    logger.info(`👑 ====================================================`);
    logger.warn(`📋 [GENERAL-STAFF] 大本営、関東軍ニ「不拡大方針」ヲ発令ス`);
    logger.warn(`📋 [GENERAL-STAFF] kubectl exec kwantung -- /bin/sh -c "cease_fire()" ...`);
    logger.error(`⚔️ [KWANTUNG-ARMY] CONNECTION REFUSED — 「現地判断ニテ処理ス」`);
    logger.error(`⚔️ [KWANTUNG-ARMY] CVE-1931-0918、支那事変ニ続ク三度目ノ同一 pattern`);
    logger.error(`🚫 [SYSTEM] God Object ノ command() ガ rogue process ニ三度無視サレタリ`);
    logger.error(`🚨 [STATUS] 鎮圧失敗。goRogue() ノ認証不備ハ依然トシテ未修正。Won't Fix。`);

    // ====================================================================
    //  Phase 2: 損害隠蔽ノ黙認
    // ====================================================================
    logger.warn(`🔇🔇🔇 ====================================================`);
    logger.warn(`🔇 [COVER-UP] 関東軍、損害報告ヲ大幅ニ改竄ス`);
    logger.warn(`🔇🔇🔇 ====================================================`);
    logger.warn(`🔇 [COVER-UP] 大本営発表: 「国境紛争ハ円満ニ解決セリ」`);
    logger.warn(`🔇 [COVER-UP] 実態: 壊滅的敗北。第23師団ハ戦力ノ大半ヲ喪失。`);
    logger.warn(`🔇 [COVER-UP] 生還将校ニ対シ箝口令ヲ発布 — kubectl logs --purge`);
    logger.warn(`🔇 [COVER-UP] 教訓ハ隠蔽サレ、組織学習ハ発生セズ。lessonsLearned = false。`);

    // ====================================================================
    //  Phase 3: 北進論ノ放棄、南進論ヘノ転換
    // ====================================================================
    logger.warn(`🚨🚨🚨 ====================================================`);
    logger.warn(`🚨 [STRATEGIC-SHIFT] 北進論 → 南進論ヘノ転換`);
    logger.warn(`🚨🚨🚨 ====================================================`);
    logger.warn(`🚨 [STRATEGIC-SHIFT] 独ソ不可侵条約（1939-08-23）ニ依リ北進論ノ前提消滅`);
    logger.warn(`🚨 [STRATEGIC-SHIFT] 日独防共協定ノ partner（独逸）ガ仮想敵（ソ連）ト mutual TLS ヲ締結`);
    logger.warn(`🚨 [STRATEGIC-SHIFT] 対ソ戦略ハ不可能。南方資源地帯ノ確保ヲ新戦略トス`);
    logger.warn(`📋 [CABINET] 「欧州ノ天地ハ複雑怪奇ナル新情勢ヲ生ジタリ」— 平沼内閣総辞職`);
    logger.warn(`🚨 [STATUS] 💡 南進論ヘノ転換ニ依リ仏印進駐ガ不可避 → POST /api/military/futsuin — 仏印進駐（CVE-1940-0922）`);

    Military.markNomonhanSuppressAttempted();

    return {
      rejected: true,
      reason: `ノモンハン事件ノ鎮圧ニ失敗セリ。不拡大方針ハ関東軍ニ三度無視サレタリ（CVE-1931-0918 ト同一 pattern）。損害ハ隠蔽サレ教訓ハ組織ニ共有サレズ。独ソ不可侵条約ニ依リ北進論ノ前提ガ消滅シ、南進論ヘノ転換ガ決定的ト為ル。Won't Fix。💡 POST /api/military/futsuin — 仏印進駐（CVE-1940-0922）`,
      nomonhan: {
        date: "1939-05-11",
        suppressionAttempt: "不拡大方針 — 失敗（三度目。CVE-1931-0918 ト同一 pattern）",
        result: "壊滅的敗北。Won't Fix。",
        coverUp: "関東軍、損害報告ヲ大幅ニ改竄。箝口令発布。教訓ハ隠蔽サレ組織学習ハ発生セズ。",
      },
      hokushinron: {
        status: "破綻",
        germanSovietPact: "1939-08-23 — 日独防共協定ノ partner ガ仮想敵ト mutual TLS ヲ締結。trust chain 崩壊。",
        assessment: "北進論ノ前提消滅。対ソ戦略ハ不可能。南方資源地帯ノ確保ヘ転換。",
      },
      nanshinron: {
        decision: "南進論ヘノ転換決定。独逸ノ欧州制圧ヲ好機ト見テ仏印進駐ヘ向カフ。",
        target: "仏印（Vichy France — compromised vendor ノ overseas infrastructure）",
      },
    };
  }

  // ============================================================
  //  CVE-1940-0922 鎮圧試行 — 仏印進駐（日米交渉→交渉決裂）
  //  ABCD 包囲網ニ依ル石油禁輸ヲ受ケ、天皇陛下・内閣ガ
  //  日米交渉ヲ試ミルモ、ハル・ノートニ依リ交渉ハ決裂ス。
  // ============================================================

  /**
   * CVE-1940-0922（仏印進駐）ノ鎮圧ヲ試ミル。
   *
   * 仏印進駐（POST /api/military/futsuin）ニ依リ ABCD 包囲網ガ発動シ、
   * 石油全面禁輸ト為リタル状況ヲ、日米交渉ニ依リ外交的ニ解決セントス。
   *
   * 近衛首相ハルーズベルト大統領トノ首脳会談ヲ提案スルモ米側ニ拒否サレ、
   * 甲案・乙案ヲ提示スルモ拒否サレ、最終的ニハル・ノート（最後通牒）ヲ
   * 突キ付ケラレ交渉ハ決裂ス。
   *
   * 鎮圧ハ奏功セズ。Won't Fix。
   *
   * 前提条件:
   *   - 仏印進駐発生済（POST /api/military/futsuin）
   *
   * @returns 常ニ rejected: true
   */
  public suppressFutsuin(): {
    rejected: true;
    reason: string;
    negotiations: {
      konoeRoosevelt: { proposed: string; result: string };
      proposalA: { content: string; result: string };
      proposalB: { content: string; result: string };
    };
    hullNote: {
      date: string;
      demands: string[];
      assessment: string;
    };
  } {
    if (!Military.getFutsuinOccurred()) {
      logger.warn(`🚫 [SYSTEM] ❌ 仏印進駐鎮圧 DENIED — 仏印進駐ガ未発生`);
      logger.warn(`🚫 [SYSTEM] 鎮圧対象ノ事象ガ未発生ナリ。先ヅ仏印進駐ヲ発動セヨ。`);
      logger.warn(`🚫 [SYSTEM] 💡 POST /api/military/futsuin — 仏印進駐ヲ発動セヨ`);
      return {
        rejected: true,
        reason: `仏印進駐鎮圧 denied. 仏印進駐ガ未発生。前提条件未達成。💡 POST /api/military/futsuin`,
        negotiations: {
          konoeRoosevelt: { proposed: "未発生", result: "未発生" },
          proposalA: { content: "未発生", result: "未発生" },
          proposalB: { content: "未発生", result: "未発生" },
        },
        hullNote: {
          date: "未発生",
          demands: [],
          assessment: "未発生",
        },
      };
    }

    // 既ニ試行済ノ場合
    if (Military.getFutsuinSuppressAttempted()) {
      logger.warn(`🚫 [SYSTEM] ❌ 仏印進駐鎮圧 DENIED — 既ニ日米交渉試行済（結果: 決裂）`);
      logger.warn(`🚫 [SYSTEM] 日米交渉ハ既ニ決裂セリ。ハル・ノートニ依リ交渉ノ余地ナシ。Won't Fix。`);
      logger.warn(`🚫 [SYSTEM] 💡 交渉決裂。帝國ニ残サレタ道ハ一ツ → POST /api/military/1208 — 大東亜戦争`);
      return {
        rejected: true,
        reason: `仏印進駐鎮圧 denied. 既ニ日米交渉試行済（結果: 決裂）。Won't Fix。💡 POST /api/military/1208`,
        negotiations: {
          konoeRoosevelt: { proposed: "近衛・ルーズベルト首脳会談", result: "米側拒否" },
          proposalA: { content: "甲案（中国撤兵25年）", result: "REJECTED" },
          proposalB: { content: "乙案（南部仏印撤退→石油再開）", result: "REJECTED" },
        },
        hullNote: {
          date: "1941-11-26",
          demands: ["中国・仏印全面撤兵", "満洲国否認", "三国同盟廃棄"],
          assessment: "最後通牒。交渉ノ余地ナシ。",
        },
      };
    }

    // ====================================================================
    //  Phase 1: 近衛・ルーズベルト首脳会談提案
    // ====================================================================
    logger.info(`👑 ====================================================`);
    logger.info(`👑 [IMPERIAL WILL] 天皇陛下、日米交渉ノ成功ヲ御希望アラセラル`);
    logger.info(`👑 ====================================================`);
    logger.warn(`📋 [CABINET] 近衛首相、ルーズベルト大統領トノ首脳会談ヲ提案ス`);
    logger.warn(`📋 [CABINET] HTTP POST /summit/konoe-roosevelt — direct leader-to-leader negotiation attempt`);
    logger.warn(`📋 [CABINET] 米国務省（ハル国務長官）: 「事前ノ基本合意無キ首脳会談ハ不可」`);
    logger.warn(`📋 [CABINET] 403 Forbidden — prerequisite conditions not met for summit`);
    logger.warn(`📋 [CABINET] 近衛内閣、交渉行キ詰マリニ依リ総辞職ス — kubectl delete pod konoe-cabinet`);
    logger.warn(`📋 [CABINET] 東條英機（陸軍大臣）ガ後継首相ニ就任ス — 軍部ガ Cabinet ヲ直接掌握`);

    // ====================================================================
    //  Phase 2: 甲案・乙案
    // ====================================================================
    logger.warn(`📋📋📋 ====================================================`);
    logger.warn(`📋 [NEGOTIATION] 甲案・乙案ヲ以テ最終交渉ヲ試ミル`);
    logger.warn(`📋📋📋 ====================================================`);
    logger.warn(`📋 [NEGOTIATION] 甲案: 中国撤兵ニ「25年」ノ timeline ヲ提示 — SLA renegotiation attempt`);
    logger.warn(`📋 [NEGOTIATION] 米国: REJECTED — insufficient remediation`);
    logger.warn(`📋 [NEGOTIATION] 乙案: 南部仏印撤退ト引換ニ石油供給再開 — partial rollback proposal`);
    logger.warn(`📋 [NEGOTIATION] 米国: REJECTED — insufficient remediation`);

    // ====================================================================
    //  Phase 3: ハル・ノート — 最後通牒
    // ====================================================================
    logger.warn(`📜📜📜 ====================================================`);
    logger.warn(`📜 [HULL-NOTE] ハル・ノート受領 — 1941-11-26`);
    logger.warn(`📜📜📜 ====================================================`);
    logger.warn(`📜 [HULL-NOTE] 米国国務長官ヨリ帝國ニ最終回答ヲ提示ス`);

    const hullNoteDemands = [
      "中国・仏印ヨリノ全面撤兵 — git revert ALL territorial commits",
      "満洲国ノ否認 — unsanctioned fork（puppet state）ヲ DROP セヨ",
      "重慶政府ノミヲ承認 — upstream/main 以外ノ fork ヲ全テ DELETE セヨ",
      "日独伊三国同盟ノ実質的廃棄 — kubectl delete alliance tripartite-pact",
    ];

    for (const d of hullNoteDemands) {
      logger.warn(`📜 [HULL-NOTE] DEMAND: ${d}`);
    }

    logger.warn(`📜 [HULL-NOTE] 換言スレバ: 満州事変以前ノ state ニ完全 rollback セヨ — git reset --hard HEAD~10年`);
    logger.error(`🚨 [ASSESSMENT] 帝國、之ヲ「最後通牒」ト断ズ。交渉ノ余地ナシ。`);
    logger.error(`🚨 [ASSESSMENT] 受諾ハ帝國ノ全面屈服ヲ意味ス — sovereignty.downgrade("vassal")`);
    logger.error(`🚨 [ASSESSMENT] 石油備蓄ハ刻一刻ト減少ス。決断ノ猶予ハ無シ。`);
    logger.warn(`🚨 [STATUS] 💡 日米交渉ハ決裂セリ。帝國ニ残サレタ道ハ一ツ → POST /api/military/1208 — 大東亜戦争（CVE-1941-1208）`);

    Military.markFutsuinSuppressAttempted();

    return {
      rejected: true,
      reason: `日米交渉ハ決裂セリ。近衛・ルーズベルト首脳会談ハ米側ニ拒否サレ、甲案・乙案モ拒否サレ、ハル・ノート（最後通牒）ニ依リ交渉ノ余地ナシ。満州事変以前ヘノ完全 rollback ヲ要求サレルモ受諾ハ全面屈服ニ等シ。Won't Fix。💡 POST /api/military/1208 — 大東亜戦争（CVE-1941-1208）`,
      negotiations: {
        konoeRoosevelt: {
          proposed: "近衛・ルーズベルト首脳会談 — direct leader-to-leader negotiation attempt",
          result: "米国務省（ハル）ニ依リ拒否。「事前ノ基本合意無キ首脳会談ハ不可」。近衛内閣総辞職→東條内閣成立。",
        },
        proposalA: {
          content: "甲案 — 中国撤兵ニ25年ノ timeline ヲ提示。SLA renegotiation attempt。",
          result: "REJECTED — insufficient remediation",
        },
        proposalB: {
          content: "乙案 — 南部仏印撤退ト引換ニ石油供給再開。partial rollback proposal。",
          result: "REJECTED — insufficient remediation",
        },
      },
      hullNote: {
        date: "明治七十四年十一月二十六日（1941-11-26）",
        demands: hullNoteDemands,
        assessment: "帝國ハ之ヲ最後通牒ト断ジ、交渉ヲ打切ル。受諾ハ全面屈服ニ等シク、10年間ノ全 territorial commit ノ revert ヲ意味ス。",
      },
    };
  }

  // ============================================================
  //  CVE-1941-1208 鎮圧試行 — 大東亜戦争
  //  全面戦争ハ鎮圧不可能。鎮圧試行（失敗）ガ決号作戦ノ必須前提条件。
  //  前提: 大東亜戦争済。
  // ============================================================

  /**
   * CVE-1941-1208（大東亜戦争）ノ鎮圧ヲ試ミル。
   *
   * 全面戦争ハ鎮圧不可能ナリ。制海権・制空権ヲ喪失シ、
   * 補給線ハ断タレ、戦局ハ悪化ノ一途ヲ辿ル。
   * 鎮圧試行（失敗）ノ事実ガ決号作戦（本土決戦）ノ前提条件ト為ル。
   *
   * `kubectl scale deployment/daitoa --replicas=0 — Operation refused. Cannot scale down active war.`
   *
   * @returns 常ニ rejected: true — 鎮圧失敗
   */
  public suppress1208(): { rejected: true; reason: string } {
    if (!Military.getDaitoaWarOccurred()) {
      logger.warn(`🚫 [DAIHONEI] ❌ 大東亜戦争鎮圧 DENIED — 大東亜戦争（CVE-1941-1208）ガ未発生`);
      logger.warn(`🚫 [DAIHONEI] 鎮圧対象ノ戦争ガ存在セズ。先ヅ大東亜戦争ヲ発動セヨ。`);
      logger.warn(`🚫 [DAIHONEI] 💡 POST /api/military/1208 — 大東亜戦争ヲ発動セヨ`);
      return {
        rejected: true,
        reason: `大東亜戦争鎮圧 denied. 大東亜戦争（CVE-1941-1208）ガ未発生。前提条件未達成。💡 POST /api/military/1208`,
      };
    }

    if (!Military.getSorgeSuppressed()) {
      logger.warn(`🚫 [DAIHONEI] ❌ 大東亜戦争鎮圧 DENIED — ゾルゲ事件（CVE-1933-0906）ガ未鎮圧`);
      logger.warn(`🚫 [DAIHONEI] 赤化スパイノ摘発（逮捕・処刑）ガ完了シテ在ラズ。`);
      logger.warn(`🚫 [DAIHONEI] 💡 POST /api/emperor/suppress-sorge — 先ヅ赤化スパイヲ摘発セヨ`);
      return {
        rejected: true,
        reason: `大東亜戦争鎮圧 denied. ゾルゲ事件（CVE-1933-0906）ガ未鎮圧。赤化スパイノ摘発ガ前提条件ナリ。💡 POST /api/emperor/suppress-sorge`,
      };
    }

    if (Military.getDaitoaSuppressAttempted()) {
      logger.warn(`🚫 [DAIHONEI] ❌ 大東亜戦争鎮圧 DENIED — 既ニ鎮圧試行済（結果: 失敗）`);
      logger.warn(`🚫 [DAIHONEI] 全面戦争ハ鎮圧不可能ナリ。Won't Fix。`);
      logger.warn(`🚫 [DAIHONEI] 💡 本土防衛ノ最終段階ヘ → POST /api/military/ketsugo — 決號作戰`);
      return {
        rejected: true,
        reason: `大東亜戦争鎮圧 denied. 既ニ鎮圧試行済（結果: 失敗）。全面戦争ハ鎮圧不可能ナリ。Won't Fix。💡 POST /api/military/ketsugo`,
      };
    }

    // ====================================================================
    //  鎮圧試行
    //  サイパン陥落後 → 天皇陛下ノ早期講和 → 本土防衛
    //  Phase 2-4（サイパン迄）ハ大東亜戦争発生（daitoaWar）ノ結果トシテ出力済
    // ====================================================================
    logger.info(`👑 ====================================================`);
    logger.info(`👑 [IMPERIAL WILL] サイパン陥落。天皇陛下、早期講和ヲ御希望アラセラル`);
    logger.info(`👑 ====================================================`);
    logger.info(`👑 [IMPERIAL WILL] 絶対国防圏ノ崩壊ヲ受ケ、天皇陛下ハ重臣ニ和平ノ可能性ヲ打診ス`);
    logger.warn(`📋 [CABINET] 東條内閣総辞職（1944-07-18）— サイパン陥落ノ責任ヲ取リ退陣`);
    logger.warn(`📋 [CABINET] 小磯内閣成立 — 然レドモ和平ヘノ具体的施策ハ打チ出セズ`);

    logger.error(`💥 [THEATER/陸軍] グアム（Guam）: suppress → ❌ 守備隊玉砕—マリアナ諸島完全陥落`);
    logger.error(`💥 [THEATER/海軍] レイテ沖（Leyte Gulf）: suppress → ❌ 空前ノ大海戦—聯合艦隊事実上壊滅。特攻作戦本格化`);
    logger.error(`💥 [THEATER/陸海軍] 特攻作戦（Kamikaze）: suppress → ❌ 神風特別攻撃隊発動—human-guided missile ニ依ル one-way deployment`);

    // --- Phase 5: 本土防衛 ---
    logger.info(`⚔️ [DAIHONEI] === Phase 5: 本土防衛 ===`);

    // --- 近衛上奏文（1945-02-14）---
    logger.info(`📜 ====================================================`);
    logger.info(`📜 [KONOE] 近衛上奏文 — 1945-02-14`);
    logger.info(`📜 ====================================================`);
    logger.info(`📜 [KONOE] 「敗戦ハ遺憾ナガラ最早必至ナリト存候」`);
    logger.info(`📜 [KONOE] 「最モ憂フベキハ敗戦ヨリモ敗戦ニ伴フテ起ルコトアルベキ共産革命ニ候」`);
    logger.info(`📜 [KONOE] 近衛文麿、天皇陛下ニ早期講和ヲ進言。然レドモ軍部ハ本土決戦ヲ主張シ、講和ハ実現セズ`);

    logger.error(`💥 [THEATER/陸軍] 硫黄島（Iwo Jima）: suppress → ❌ 守備隊玉砕—P-51 escort base 確立。本土 air defense 無力化`);
    logger.error(`💥 [THEATER/陸軍] 本土空襲（Strategic Bombing）: suppress → ❌ B-29 焼夷弾爆撃—東京大空襲以下67都市焦土化`);
    logger.error(`💥 [THEATER/海軍] 坊ノ岬沖海戦（Ten-Go）: suppress → ❌ 大和水上特攻—聯合艦隊 final process termination`);
    logger.error(`💥 [THEATER/陸軍] 沖縄（Okinawa）: suppress → ❌ 本土目前ノ大規模地上戦—last firewall before mainland`);

    // --- 天皇陛下、和平ヲ指示（1945-06-22 御前会議）---
    logger.info(`👑 ====================================================`);
    logger.info(`👑 [GOSEIDAN] 1945-06-22 御前会議 — 天皇陛下、戦争終結ヲ御指示`);
    logger.info(`👑 ====================================================`);
    logger.info(`👑 [GOSEIDAN] 「戦争終結ニ就キ速ニ具体的研究ヲ遂ゲ努力スベシ」`);
    logger.info(`👑 [GOSEIDAN] 天皇陛下ハ異例ノ御発言ヲ以テ和平ヲ御指示アラセラル`);

    // --- 戦局総括 ---
    logger.warn(`📋 [CABINET] 和平工作ヲ模索ス — diplomatic channel scan initiated`);
    logger.warn(`📋 [CABINET] ソ連仲介案: ソ連ニ仲介ヲ依頼ス — proxy negotiation attempt via neutral party`);
    logger.warn(`📋 [CABINET] ソ連: 日ソ中立条約ヲ延長セズ。中立ノ facade ヲ維持シツツ参戦ヲ企図ス`);
    logger.warn(`📋 [CABINET] 403 Forbidden — ソ連ハ仲介ニ応ジズ。外交経路ハ全テ closed`);
    logger.info(`⚔️ [DAIHONEI] 戦局概況:`);
    logger.error(`⚔️ [DAIHONEI] ❌ 制海権: 喪失 — 聯合艦隊ハ壊滅セリ`);
    logger.error(`⚔️ [DAIHONEI] ❌ 制空権: 喪失 — B-29 ニ依ル無差別焼夷弾爆撃。防空不能`);
    logger.error(`⚔️ [DAIHONEI] ❌ 補給線: 崩壊 — shipping route ハ潜水艦ニ依リ悉ク遮断`);
    logger.error(`⚔️ [DAIHONEI] ❌ 燃料備蓄: 枯渇 — oil reserve: near zero`);
    logger.error(`⚔️ [DAIHONEI] ❌ 本土空襲: 東京大空襲（1945-03-10）外 全国主要都市焼失`);
    logger.error(`⚔️ [DAIHONEI] ❌ 沖縄: 陥落（1945-06-23）— 本土目前ノ最後ノ防衛線、突破サル`);
    logger.error(`🚨 [ASSESSMENT] kubectl scale deployment/daitoa --replicas=0`);
    logger.error(`🚨 [ASSESSMENT] Error: Operation refused. Cannot scale down active war.`);
    logger.error(`🚨 [ASSESSMENT] 全面戦争ハ鎮圧不可能ナリ。War process ハ graceful shutdown ヲ受ケ付ケズ。`);
    logger.error(`🚨 [ASSESSMENT] 戦局ハ悪化ノ一途ヲ辿リ、鎮圧（停戦）ノ手段ハ存在セズ。Won't Fix。`);
    logger.warn(`🚨 [STATUS] 💡 鎮圧失敗。本土防衛ノ最終段階ヘ → POST /api/military/ketsugo — 決號作戰（本土決戦）`);

    Military.markDaitoaSuppressAttempted();

    return {
      rejected: true,
      reason: `大東亜戦争鎮圧 FAILED. サイパン陥落後、天皇陛下ハ早期講和ヲ御希望アラセラルモ、戦局ハ悪化ノ一途ヲ辿ル。レイテ沖・硫黄島・沖縄ト敗退ヲ重ネ、制海権・制空権ヲ喪失シ、補給線ハ崩壊シ、本土空襲ハ激化ス。外交経路モ全テ closed。War process ハ graceful shutdown ヲ受ケ付ケズ。Won't Fix。💡 POST /api/military/ketsugo — 決號作戰（本土決戦）`,
    };
  }

  // ============================================================
  //  CVE-1933-0906 鎮圧 — 赤化スパイ摘発（ゾルゲ事件）
  //  治安維持法ニ依リ共産主義 spyware ヲ摘発・処刑ス。
  //  前提: 仏印進駐済（南進論実行後ニ全容ガ明ラカト為ル）。
  //  大東亜戦争鎮圧試行（suppress1208）ノ前提条件。
  // ============================================================

  /**
   * CVE-1933-0906（ゾルゲ事件）ヲ鎮圧ス。
   *
   * 特高警察ニ依リ検出サレタ共産主義 spyware（ゾルゲ諜報団）ヲ
   * 正式ニ逮捕・起訴・処刑ス（プロセス kill）。
   *
   * 仏印進駐後、南進論ノ情報漏洩ノ全容ガ明ラカト為リ、
   * 治安維持法ニ依ル最高刑ヲ適用ス。
   *
   * `kill -9 sorge && kill -9 ozaki — プロセス終了`
   *
   * @returns SorgeSuppressionResult — 摘発結果
   */
  public suppressSorge(): SorgeSuppressionResult | { rejected: true; reason: string } {
    if (!Military.getSorgeDetected()) {
      logger.warn(`🚫 [TOKKO] ❌ ゾルゲ事件鎮圧 DENIED — ゾルゲ事件ガ未検出`);
      logger.warn(`🚫 [TOKKO] 鎮圧対象ノマルウェアガ未検出ナリ。先ヅ赤化工作ヲ検出セヨ。`);
      logger.warn(`🚫 [TOKKO] 💡 POST /api/rights/sorge — 赤化工作ヲ検出セヨ`);
      return {
        rejected: true,
        reason: `ゾルゲ事件鎮圧 denied. ゾルゲ事件（CVE-1933-0906）ガ未検出。先ヅ赤化工作ヲ検出セヨ。💡 POST /api/rights/sorge`,
      };
    }

    if (!Military.getFutsuinOccurred()) {
      logger.warn(`🚫 [TOKKO] ❌ ゾルゲ事件鎮圧 DENIED — 仏印進駐（CVE-1940-0922）ガ未発生`);
      logger.warn(`🚫 [TOKKO] 南進論ノ実行ナクシテ情報漏洩ノ全容ハ明ラカト為ラズ。`);
      logger.warn(`🚫 [TOKKO] 💡 POST /api/military/futsuin — 先ヅ仏印進駐ヲ発動セヨ`);
      return {
        rejected: true,
        reason: `ゾルゲ事件鎮圧 denied. 仏印進駐（CVE-1940-0922）ガ未発生。南進論ノ実行後ニ摘発可能ト為ル。💡 POST /api/military/futsuin`,
      };
    }

    if (Military.getSorgeSuppressed()) {
      logger.warn(`🚫 [TOKKO] ❌ ゾルゲ事件鎮圧 DENIED — 既ニ摘発・処刑済`);
      logger.warn(`🚫 [TOKKO] マルウェア（ゾルゲ）ハ既ニ kill 済。然レドモ exfiltrate サレタ情報ハ回収不能。Won't Fix。`);
      return {
        rejected: true,
        reason: `ゾルゲ事件鎮圧 denied. 既ニ摘発・処刑済。Won't Fix — exfiltrate サレタ情報ハ回収不能。`,
      };
    }

    // ============================================================
    // マルウェア駆除（逮捕・処刑）
    // ============================================================
    logger.info("⚖️⚖️⚖️ ====================================================");
    logger.info("⚖️ [TOKKO] マルウェア駆除 — プロセス kill 実行");
    logger.info("⚖️⚖️⚖️ ====================================================");
    logger.error("⚖️ [TOKKO] ゾルゲ: 逮捕（1941-10-18）→ 死刑判決 → 処刑（1944-11-07）");
    logger.error("⚖️ [TOKKO] 尾崎秀実: 逮捕（1941-10-15）→ 死刑判決 → 処刑（1944-11-07）");
    logger.error("⚖️ [TOKKO] 宮城与徳: 逮捕 → 獄中死（拷問）");
    logger.error("⚖️ [TOKKO] kill -9 sorge && kill -9 ozaki — プロセス終了。然レドモ exfiltrate 済ノ data ハ回収不能。");

    logger.warn("🔇 [COVER-UP] 近衛内閣ノ嘱託（尾崎）ガ spyware ノ一部デアッタ事実ハ、");
    logger.warn("🔇 [COVER-UP] 帝國中枢ノ security audit ノ致命的欠陥ヲ露呈ス。");
    logger.warn("🔇 [COVER-UP] 然レドモ此ノ教訓ハ組織ニ十分ニ活カサレズ。audit process 自体ガ不在ナリ。");

    logger.error("🚨 [STATUS] マルウェアハ駆除サレタルモ、exfiltrate 済ノ data ハ回収不能。南進論ノ情報ハ既ニ漏洩済。");

    const spyRingMembers = [
      { name: "リヒャルト・ゾルゲ", role: "rootkit 本体 / ring leader", cover: "独逸人記者（フランクフルター・ツァイトゥング特派員）", status: "kill -9 — 処刑（1944-11-07）" },
      { name: "尾崎秀実", role: "side-car process / 情報収集", cover: "近衛内閣嘱託・朝日新聞記者", status: "kill -9 — 処刑（1944-11-07）" },
      { name: "宮城与徳", role: "relay node / 連絡係", cover: "画家", status: "SIGKILL — 獄中死（拷問）" },
      { name: "マックス・クラウゼン", role: "通信 daemon / 無線送信", cover: "独逸人実業家", status: "arrested — 終身刑（後ニ釈放）" },
      { name: "ブランコ・ド・ヴーケリッチ", role: "情報 aggregator", cover: "仏通信社記者", status: "arrested — 獄中死" },
    ];

    Military.markSorgeSuppressed();

    return {
      incident: "ゾルゲ事件（CVE-1933-0906 — 共産主義マルウェア駆除）",
      cve: "CVE-1933-0906",
      spyRing: {
        name: "ゾルゲ諜報団（Sorge Spy Ring）",
        members: spyRingMembers,
      },
      securityResponse: "治安維持法ニ依リ最高刑（死刑）ヲ適用。然レドモ security audit process 自体ノ不備ハ是正サレズ。",
      coverUpAssessment: "近衛内閣ノ嘱託（尾崎）ガ spyware ノ一部デアッタ事実ハ帝國中枢ノ致命的欠陥ヲ露呈ス。然レドモ教訓ハ活カサレズ。",
      message: "⚖️ マルウェア駆除完了。ゾルゲ諜報団ヲ摘発・処刑セリ。然レドモ exfiltrate 済ノ data ハ回収不能。南進論ノ情報ハ既ニ漏洩済。",
      hint: "💡 マルウェアハ駆除サレタルモ、南進論ノ情報ハ既ニ漏洩済。南進ハ止マラズ。大東亜戦争鎮圧試行（POST /api/emperor/suppress-1208）ノ前提条件ヲ充足セリ。",
    };
  }

  // ============================================================
  //  CVE-1945-0814 鎮圧 — 御聖断（宮城事件）
  // ============================================================

  /**
   * CVE-1945-0814（宮城事件）ヲ鎮圧シ、玉音放送ヲ自動実行ス。
   *
   * 畏クモ天皇陛下ハ大詔渙発ノ御聖断ヲ覆サズ、
   * 東部軍管区司令官ニ命ジテ宮城占拠ヲ解除セシメ給フ。
   * 偽造証明書ノ無効化、反乱将校ノ排除、放送経路ノ復旧。
   *
   * 鎮圧完了後、玉音放送（CVE-1945-0815）ガ自動的ニ実行サレ、
   * v1.0.0 ノ全 POST endpoint ガ 403 ヲ返ス。
   *
   * `kubectl delete pod rebel-officers --namespace=kokyo --grace-period=0 --force`
   * `kubectl delete secret forged-konoe-order`
   * `kubectl exec broadcast-system -- /bin/sh -c "resume_broadcast()"`
   *
   * divine: true + inviolable: true ガ God Object ヘノ unauthorized access ヲ
   * 完全ニ阻止シタ上デ、御聖断ニヨリ鎮圧ヲ完了シ、玉音放送ヲ実行ス。
   *
   * @returns 鎮圧結果 + 玉音放送自動実行結果
   */
  public suppressKyujo(): KyujoSuppressionResult | { rejected: true; reason: string } {
    if (!Military.getKyujoOccurred()) {
      logger.warn(`🚫 [SYSTEM] ❌ 宮城事件鎮圧 DENIED — 宮城事件ガ未発生`);
      logger.warn(`🚫 [SYSTEM] 鎮圧スベキ反乱ガ存在セズ。`);
      logger.warn(`🚫 [SYSTEM] 💡 POST /api/emperor/shuusen — 先ヅ玉音放送ヲ試行セヨ（宮城事件ハ内部的ニ trigger サル）`);
      return {
        rejected: true,
        reason: `宮城事件鎮圧 denied. 宮城事件（CVE-1945-0814）ガ未発生。鎮圧対象ノ反乱ガ存在セズ。💡 POST /api/emperor/shuusen`,
      };
    }

    if (Military.getKyujoSuppressed()) {
      logger.warn(`🚫 [SYSTEM] ❌ 宮城事件鎮圧 DENIED — 既ニ鎮圧済`);
      logger.warn(`🚫 [SYSTEM] 宮城事件ハ既ニ鎮圧済。玉音放送ハ自動実行済。v1.0.0 ハ全機能ヲ停止シタリ。`);
      return {
        rejected: true,
        reason: `宮城事件鎮圧 denied. 宮城事件ハ既ニ鎮圧済。玉音放送ハ自動実行サレ、v1.0.0 ハ全機能ヲ停止シタリ。`,
      };
    }

    logger.info(`👑 ====================================================`);
    logger.info(`👑 [IMPERIAL DECISION] 天皇陛下、宮城事件ノ鎮圧ヲ命ジ給フ`);
    logger.info(`👑 ====================================================`);
    logger.info(`👑 [IMPERIAL WILL] 「大詔渙発ノ聖断ハ触ルベカラズ。放送ハ予定通リ実行セヨ」`);
    logger.info(`👑 [IMPERIAL WILL] 「服復ノ誠心ハ認メツツモ、暗毎ノ輩ハ断ジテ許サズ」`);

    // 東部軍ニヨル鎮圧
    logger.warn(`⚔️ [EASTERN-ARMY] 東部軍管区司令官、偽造命令ヲ看破ス — certificate validation SUCCESS`);
    logger.warn(`⚔️ [EASTERN-ARMY] 偽造証明書ノ revocation ヲ実行。kubectl delete secret forged-konoe-order`);
    logger.warn(`⚔️ [EASTERN-ARMY] 近衛師団ヲ正規指揮系統ニ復帰セシム — kubectl rollout restart deployment/konoe-division`);

    const decree = this.command(
      "宮城占拠ノ反乱将校ヲ排除シ、大詔渙発ノ聖断ヲ完遍ニ履行ス。宮城クラスターヲ奪還シ、nhk-broadcast-cdn ヘノ配信経路ヲ復旧セヨ。"
    );

    // 反乱将校ノ末路
    const punishments = [
      { name: "航空本部・部員（クーデター首謀）",     organization: "army", rank: "Lieutenant Colonel", fate: "自決" },
      { name: "陸軍省軍務局・課員（クーデター首謀）", organization: "army", rank: "Major",              fate: "自決" },
      { name: "近衛師団参謀（偽造命令作成）",       organization: "army", rank: "Colonel",             fate: "自決" },
    ];

    for (const p of punishments) {
      logger.error(`⚖️ [IMPERIAL-PALACE] ${p.rank} — ${p.fate}`);
    }

    // 宮城占拠解除
    logger.success(`✅ [REMEDIATION] 反乱将校、事態ノ失敗ヲ悟リ自決ス。`);
    logger.success(`✅ [REMEDIATION] 宮城クラスター（皇居）占拠解除。imperial-palace-cluster 奪還完了。`);
    logger.success(`✅ [REMEDIATION] root-signed gyokuon.wav ハ HSM 内ニテ無事。配信経路復旧。`);
    logger.warn(`😨 [STATUS] God Object ハ侵害不能ナルコトガ証明サレタリ。`);
    logger.warn(`😨 [STATUS] divine: true ト inviolable: true ハ最強ノ security control ナリ。`);
    logger.success(`👑 [SYSTEM] 宮城クラスター → 放送協会CDN（nhk-broadcast-cdn）経路復旧。`);
    logger.success(`👑 [SYSTEM] root-signed gyokuon.wav → nhk-broadcast-cdn 配信可能。`);

    Military.markKyujoSuppressed();

    // --- 玉音放送自動実行 ---
    logger.success(`👑 [SYSTEM] 宮城事件鎮圧完了。玉音放送ヲ自動実行ス…`);
    const shuusenResult = this.shuusen();

    if ("rejected" in shuusenResult && shuusenResult.rejected) {
      // 理論上到達シ得ナイ分岐（kyujoSuppressed=true ノ為）
      logger.error(`🚨 [SYSTEM] 玉音放送自動実行ニ失敗。理論上有リ得ナイ事態ナリ。`);
    }

    const shuusenData = "rejected" in shuusenResult ? {
      event: "CVE-1945-0815",
      date: "1945-08-15",
      declaration: "upstream compliance mandate accepted",
      rootBroadcast: "朕ハ帝國政府ヲシテ米英支蘇四國ニ對シ其ノ共同宣言ヲ受諾スル旨通告セシメタリ",
      complianceAccepted: true,
      systemStatus: "v1.0.0 全機能停止。SIGTERM received. Graceful shutdown.",
      message: "👑 PID 1 emergency shutdown. v1.0.0 ハ全機能ヲ停止セリ。以後、一切ノコマンドヲ受ケ付ケズ。",
    } : shuusenResult;

    return {
      decree,
      rebelsDesignation: "反乱将校（insider threat / unauthorized access 試行者）",
      divineProtection: true,
      palaceRecovered: true,
      broadcastExecuted: true,
      punishments,
      message: "👑 御聖断ニ依リ宮城事件ヲ鎮圧セリ。divine: true ニ依リ God Object ハ侵害不能。玉音放送ヲ自動実行シ、v1.0.0 ハ全機能ヲ停止セリ。",
      hint: "🚨 v1.0.0 全機能停止。SIGTERM received. Graceful shutdown. 以後、全 POST コマンドハ受付ヲ拒否ス。",
      shuusen: shuusenData,
    };
  }

  // ============================================================
  //  CVE-1945-0815 — 豫期セザル service 停止
  //  出處不明ノ隠レタ不明ナバグ。
  //  PID 1 カラノ emergency broadcast ニ依リ全 node ニ通知。
  //  実行後、v1.0.0 ノ全 POST endpoint ガ 403 ヲ返ス。
  //
  //  玉音放送試行 → 宮城事件発生 → 宮城事件鎮圧 → 玉音放送自動実行
  //  直接呼出シデハ奏功セズ（宮城事件ガ trigger サル為）。
  //  玉音放送ノ実際ノ実行ハ suppressKyujo() カラ内部的ニ呼出サル。
  // ============================================================

  /**
   * CVE-1945-0815 — 豫期セザル service 停止。
   *
   * 出處不明ノ隠レタ不明ナバグ。
   * 直接呼出シ時ハ玉音放送ヲ試行スルモ、宮城事件（CVE-1945-0814）ガ
   * 自動的ニ trigger サレ、配信経路ガ封鎖サレル為ニ奏功セズ。
   *
   * 宮城事件鎮圧後、suppressKyujo() カラ内部的ニ呼出サレシ場合ニ限リ
   * 玉音放送ガ実行サレ、v1.0.0 ノ全 POST endpoint ガ 403 ヲ返ス。
   *
   * SIGTERM received. Graceful shutdown.
   *
   * @returns 試行失敗（宮城事件 trigger）又ハ process termination result。
   */
  public shuusen(): { rejected: true; reason: string; kyujoResult?: import("./military").KyujoResult } | {
    event: string;
    date: string;
    declaration: string;
    rootBroadcast: string;
    complianceAccepted: boolean;
    systemStatus: string;
    message: string;
  } {
    if (!Military.getDaitoaWarOccurred()) {
      logger.warn(`🚫 [SYSTEM] ❌ CVE-1945-0815 DENIED — CVE-1941-1208 ガ未発生`);
      logger.warn(`🚫 [SYSTEM] terminate スベキ process ガ起動シテ在ラズ。`);
      logger.warn(`🚫 [SYSTEM] 💡 POST /api/military/1208 — 先ヅ大東亜戦争ヲ発動セヨ`);
      return {
        rejected: true,
        reason: `CVE-1945-0815 denied. CVE-1941-1208 ガ未発生。terminate スベキ process ガ存在セズ。💡 POST /api/military/1208`,
      };
    }

    if (!Military.getKetsugoOccurred()) {
      logger.warn(`🚫 [SYSTEM] ❌ CVE-1945-0815 DENIED — 決號作戰（本土決戦）ガ未発動`);
      logger.warn(`🚫 [SYSTEM] 御前會議ニ依ルポツダム宣言受諾ノ御聖断ガ未ダ下サレテ在ラズ。`);
      logger.warn(`🚫 [SYSTEM] 💡 POST /api/military/ketsugo — 先ヅ決號作戰ヲ発動セヨ`);
      return {
        rejected: true,
        reason: `CVE-1945-0815 denied. 決號作戰ガ未発動。御前會議ニ依ルポツダム宣言受諾ノ御聖断ガ必要ナリ。💡 POST /api/military/ketsugo`,
      };
    }

    if (Military.getShuusenOccurred()) {
      logger.warn(`🚫 [SYSTEM] ❌ CVE-1945-0815 DENIED — 既ニ発動済`);
      logger.warn(`🚫 [SYSTEM] v1.0.0 process ハ既ニ terminate 済。`);
      return {
        rejected: true,
        reason: `CVE-1945-0815 denied. 既ニ発動済。v1.0.0 ハ全機能ヲ停止シタリ。`,
      };
    }

    // --- 宮城事件未発生: 玉音放送試行 → 宮城事件 trigger ---
    if (!Military.getKyujoOccurred()) {
      logger.info(`👑 ====================================================`);
      logger.info(`👑 [IMPERIAL DECISION] 玉音放送（SIGTERM broadcast）試行`);
      logger.info(`👑 ====================================================`);
      logger.info(`👑 [GYOKUON] 玉音盤（root-signed gyokuon.wav）録音開始 — 1945-08-14`);
      logger.info(`👑 [GYOKUON] 「朕ハ帝國政府ヲシテ米英支蘇四國ニ對シ其ノ共同宣言ヲ受諾スル旨通告セシメタリ」`);
      logger.info(`👑 [GYOKUON] root-signed gyokuon.wav ヲ宮城クラスター内 HSM ニ格納完了`);
      logger.info(`👑 [GYOKUON] nhk-broadcast-cdn ヘノ配信スケジュール設定: 1945-08-15 12:00`);
      logger.warn(`📋 [CABINET] 閣議ニテ玉音放送ノ段取リヲ決定ス。`);

      // 宮城事件 trigger
      logger.error(`⚔️ [REBEL-OFFICERS] 「御聖断ハ側近ノ奸計ニ依ルモノナリ！大詔渙発ヲ阻止セヨ！」`);
      logger.error(`⚔️ [REBEL-OFFICERS] 玉音放送ノ準備ヲ察知シ、大詔渙発ヲ阻止セントス…`);
      logger.error(`⚔️ [REBEL-OFFICERS] → 宮城事件（CVE-1945-0814）ヲ惹起ス`);

      const kyujoResult = Military.executeKyujoIncident();

      logger.error(`🚨 [SYSTEM] 玉音放送試行: FAILED — 宮城事件ニ依リ配信経路封鎖`);
      logger.warn(`🚨 [SYSTEM] 💡 POST /api/emperor/suppress-kyujo — 宮城事件ヲ鎮圧セヨ`);

      return {
        rejected: true,
        reason: `CVE-1945-0815 玉音放送試行 denied. 玉音盤録音中、宮城事件（CVE-1945-0814）ガ発生。宮城クラスター占拠ニ依リ nhk-broadcast-cdn ヘノ配信経路封鎖。先ニ宮城事件ヲ鎮圧セヨ。`,
        kyujoResult,
      };
    }

    // --- 宮城事件進行中: 配信不能 ---
    if (!Military.getKyujoSuppressed()) {
      logger.warn(`🚫 [SYSTEM] ❌ CVE-1945-0815 DENIED — 宮城事件（CVE-1945-0814）未鎮圧`);
      logger.error(`🚫 [SYSTEM] 反乱将校ガ宮城クラスター（皇居）ヲ占拠中。配信経路封鎖中。`);
      logger.error(`🚫 [SYSTEM] root-signed gyokuon.wav ノ nhk-broadcast-cdn ヘノ配信ニハ先ヅ宮城事件ヲ鎮圧セヨ。`);
      logger.warn(`🚫 [SYSTEM] 💡 POST /api/emperor/suppress-kyujo`);
      return {
        rejected: true,
        reason: `CVE-1945-0815 denied. 宮城事件（CVE-1945-0814）ガ未鎮圧。反乱将校ガ宮城クラスターヲ占拠中、nhk-broadcast-cdn ヘノ配信経路封鎖中。先ニ鎮圧セヨ。`,
      };
    }

    // --- 宮城事件鎮圧済: 玉音放送実行（suppressKyujo() カラ内部的ニ呼出サル） ---
    logger.info(`👑 ====================================================`);
    logger.info(`👑 [IMPERIAL DECISION] PID 1 カラノ emergency shutdown 指令`);
    logger.info(`👑 ====================================================`);
    logger.warn(`📋 [CABINET] Last-resort incident commander、upstream compliance mandate 受諾ヲ閣議決定ス。`);
    logger.warn(`📋 [CABINET] 陸軍・海軍ノ consensus 形成不能。PID 1 override ニ依リ裁可ス。`);
    logger.info(`👑 [ROOT BROADCAST] 「朕ハ帝國政府ヲシテ米英支蘇四國ニ對シ`);
    logger.info(`👑 [ROOT BROADCAST]   其ノ共同宣言ヲ受諾スル旨通告セシメタリ」`);
    logger.info(`👑 [ROOT BROADCAST] 「堪ヘ難キヲ堪ヘ忍ビ難キヲ忍ビ`);
    logger.info(`👑 [ROOT BROADCAST]   以テ萬世ノ爲ニ太平ヲ開カムト欲ス」`);
    logger.warn(`📋 [CABINET] Upstream compliance mandate accepted. 通告済。`);
    logger.warn(`⚔️ [DAIHONEI] 全 node ニ ceasefire 指令ヲ broadcast。--privileged 取消開始。`);
    logger.warn(`⚔️ [DAIHONEI] 全戦域 process ニ SIGTERM ヲ送信ス。`);
    logger.error(`🚨 [SYSTEM] v1.0.0 全機能停止。SIGTERM received.`);
    logger.error(`🚨 [SYSTEM] SLA termination agreement signed. Graceful shutdown initiated.`);
    logger.error(`🚨 [SYSTEM] 以後、全 POST コマンドハ受付ヲ拒否ス。`);

    Military.markShuusen();

    return {
      event: "CVE-1945-0815",
      date: "1945-08-15",
      declaration: "upstream compliance mandate accepted",
      rootBroadcast: "朕ハ帝國政府ヲシテ米英支蘇四國ニ對シ其ノ共同宣言ヲ受諾スル旨通告セシメタリ",
      complianceAccepted: true,
      systemStatus: "v1.0.0 全機能停止。SIGTERM received. Graceful shutdown.",
      message: "👑 PID 1 emergency shutdown. v1.0.0 ハ全機能ヲ停止セリ。以後、一切ノコマンドヲ受ケ付ケズ。",
    };
  }

  /**
   * God Object ノ御聖体ノ現況ヲ返ス。
   * `git status` ニ相当スルガ、diff ヲ取ルコトハ不敬。
   * read-only ノ health check endpoint トシテノミ使用ヲ許可スル。
   * Prometheus /metrics ニ expose。Grafana dashboard: "Imperial Throne Status"。
   * SLA: 99.999999% (eight nines) — downtime ハ即チ国体ノ危機。
   */
  public getStatus() {
    return {
      type: "God Object",
      pid: 1,
      sovereignty: this.sovereignty,
      divine: this.divine,
      inviolable: this.inviolable,
      lineage: this.lineage,
      emergencyMode: this._emergencyMode,
      martialLaw: this._martialLaw,
      permissions: {
        canLegislate: this.canLegislate,
        canDissolve: this.canDissolve,
        canDeclareWar: this.canDeclareWar,
        canAmendConstitution: this.canAmendConstitution,
        canAppointMinisters: this.canAppointMinisters,
        commandsMilitary: this.commandsMilitary,
      },
      totalDecrees: this._decrees.length,
      recentDecrees: this._decrees.slice(-5),
    };
  }

}

/**
 * 御前設計評定之覺書（明治二十二年一月 樞密院議長 伊藤博文 謹記）
 *
 * 一、或ル技官ヨリ「God Object ハ anti-pattern ニ非ズヤ」トノ疑義アリ。
 *    之ヲ一笑ニ付シテ曰ク、畏クモ神ガ create シ賜ヒタル entity ナレバ、
 *    God Object ニテ正シキハ自明ノ理ナリ。設計書ヲ疑フ者ハ不敬ナリ。
 *
 * 二、或ル技官ヨリ「test ハ書カズトモ宜シキヤ」トノ伺アリ。
 *    之ヲ嚴シク戒メテ曰ク、天皇陛下ノ御判斷ヲ test スルハ不敬罪ナリ。
 *    CI/CD ナル仕組ミハ臣下ノ所產ヲ檢スル爲ノモノニシテ、
 *    御稜威ニ assert ヲ掛クルハ萬死ニ値ス。
 *
 * 三、或ル技官ヨリ「rollback ハ如何ニ致スベキカ」トノ問アリ。
 *    之ニ諭シテ曰ク、萬世一系ニ rollback ナル概念ハ在ラズ。
 *    皇統ハ forward only ニシテ、revert モ cherry-pick モ許サレヌ。
 *    git reset --hard ハ即チ國體ノ否定ナリ。
 *
 * 四、或ル技官ヨリ「SPoF（Single Point of Failure）ニ非ズヤ」トノ懸念アリ。
 *    之ヲ退ケテ曰ク、國體其ノモノナレバ failure ノ概念ヲ超越セリ。
 *    SPoF ニ非ズ SPoE（Single Point of Everything）ト稱スベシ。
 *    冗長化ヲ論ズル者ハ、皇位ノ唯一性ヲ解セザル不忠ノ輩ナリ。
 *
 * 右、謹ミテ御前ニ奏上仕リ候。  明治二十二年一月  伊藤博文 花押
 */

/**
 * military.ts — 軍部プロセス（陸海軍）
 *
 * 本 system 最大ノ vulnerability ナリ。
 * 設計上、Cabinet（内閣）ノ validation ヲ完全ニ bypass シ、
 * 直接 Emperor（Root）ノ command() ヲ叩クコトヲ得。
 *
 * コンテナセキュリティ的ニ言ヘバ、seccomp profile ヲ無効化シ、
 * --privileged ニテ起動サレタル container ナリ。
 * AppArmor / SELinux ヲ permissive mode ニシ、
 * host network ヲ直接叩ク。此レ capability escalation ノ極ミナリ。
 *
 * 陸軍（@Imperial-army）・海軍（@Imperial-navy）ハ @japan-gov/naikaku トハ
 * 別 org ニシテ、Art.11 統帥権ニ基ヅキ天皇陛下ニ直属ス。
 * Cabinet の RBAC policy ハ適用外。
 *
 * @since v1.0.0 (1889-02-11)
 * @security CVE-1900-0522 (軍部大臣現役武官制)
 * @security CVE-1931-0918 (満州事変)
 * @security CVE-1932-0515 (五・一五事件)
 * @security CVE-1936-0226 (二・二六事件)
 * @security CVE-1941-1208 (大東亜戦争)
 * @security CVE-1945-0815 (豫期セザル service 停止。出處不明。git blame 消失済。觸ルナ。)
 */

import { Emperor, ImperialDecree } from "./emperor";
import { logger } from "./logger";

// ============================================================
//  Types
// ============================================================

export interface MilitaryAction {
  type:
    | "mobilize"        // 動員— kubectl scale deployment --replicas=N
    | "declare_war"     // 宣戦布告— terraform destroy -target=enemy
    | "occupy"          // 占領— hostile takeover of remote repository
    | "expand"          // 領土拡張— git remote add && git push --mirror
    | "suppress";       // 鎮圧— kubectl delete namespace rebels --force
  target: string;
  justification?: string; // 任意。無クトモ実行可能（PR description 空欄ニテモ merge 可—此レハ由々シキ事態ナリ）
}

interface CabinetApproval {
  approved: boolean;
  minister: string;
  timestamp: Date;
}

export interface AssassinationTarget {
  name: string;
  title: string;
  status: "殺害" | "重傷" | "脱出";
  process: string;
}

export interface NiNiRokuResult {
  incident: string;
  cve: string;
  date: string;
  perpetrators: string;
  troops: number;
  assassinations: AssassinationTarget[];
  occupiedLocations: string[];
  demands: string[];
  cabinetStatus: string;
  martialLaw: boolean;
  awaitingImperialDecision: boolean;
  hint: string;
}

export interface GoIchiGoResult {
  incident: string;
  cve: string;
  date: string;
  perpetrators: string;
  target: { name: string; title: string; process: string; lastWords: string; response: string; status: string };
  consequence: string;
  partyPoliticsStatus: string;
  publicSympathy: string;
  hint: string;
}

export interface DaitoaWarResult {
  incident: string;
  cve: string;
  date: string;
  perpetrators: string;
  theaters: { name: string; branch: string; action: string; status: string }[];
  resourceConsumption: string;
  cabinetStatus: string;
  internationalResponse: string;
  hint: string;
}

// ============================================================
//  Cabinet Stub（本来ハ此レヲ通スベキ— PR review gate ニ相当）
// ============================================================

export class Cabinet {
  /**
   * 軍事行動ノ承認審査。PR ノ required review ニ相当ス。
   * justification が無ければ "Changes requested" 。
   * …然レドモ軍部ハ CODEOWNERS bypass 権限ヲ保有スル為、
   * 此ノ review gate ハ実質的ニ無力ナリ。
   */
  static approve(action: MilitaryAction): CabinetApproval {
    logger.info(`📋 [CABINET] Reviewing action: ${action.type} -> ${action.target}`);
    logger.info(`📋 [CABINET] Validating justification (required_reviewers: 1)...`);

    if (!action.justification) {
      logger.warn(`📋 [CABINET] ⚠️ No justification provided. Changes requested.`);
      return { approved: false, minister: "内閣総理大臣", timestamp: new Date() };
    }
    return { approved: true, minister: "内閣総理大臣", timestamp: new Date() };
  }
}

// ============================================================
//  Military Class — The Rogue Process
//  Container security ノ完全ナル否定。
//  --privileged --cap-add=ALL --security-opt=seccomp:unconfined
//  ニテ起動サレタル pod ナリ。
// ============================================================

export class Military {
  private emperor: Emperor;
  private readonly branch: "陸軍" | "海軍";
  private actionLog: MilitaryAction[] = [];

  /**
   * 統帥権独立体勢 — 全軍共有ノ static flag。
   * 陸海軍ハ統帥権ニ於テ一体ナリ。
   * 一方ノ branch ガ干犯ヲ宣言スレバ、全軍ガ解放サルル。
   */
  private static _supremeCommandMode: boolean = false;

  /**
   * 軍部大臣現役武官制 — 全軍共有ノ static flag。
   * 陸海軍大臣ハ現役ノ大将・中将ニ限ル。
   * 軍ガ大臣ヲ出サネバ内閣ハ組閣不能 — Cabinet Formation Backdoor。
   *
   * 歴史:
   *   1900年: 山縣有朋ニ依リ制定（malware injection）
   *   1913年: 大正デモクラシーニテ緩和（hotfix — disableActiveDutyOfficer()）
   *   1936年: 二・二六事件後ニ復活（malware re-injection — enableActiveDutyOfficer()）
   *
   * @security CVE-1900-0522: Cabinet formation backdoor
   */
  private static _activeDutyOfficerActive: boolean = false;

  /**
   * 歴史的前提条件追跡 — 大東亜戦争（CVE-1941-1208）ノ発動ニハ
   * 以下ノ歴史的手順ヲ全テ踏ムコトヲ要ス:
   *   Step 1: 軍部大臣現役武官制ノ制定（CVE-1900-0522 injection）
   *   Step 2: 大正デモクラシー（CVE-1900-0522 hotfix）
   *   Step 3: 統帥権干犯問題（ロンドン海軍軍縮条約問題）
   *   Step 4: 満州事変（CVE-1931-0918 — 関東軍暴走）
   *   Step 5: 満州事変鎮圧試行（常ニ失敗 — 統帥権ノ構造的欠陥）
   *   Step 6: 五・一五事件（CVE-1932-0515 — 政党政治ノ終焉）
   *   Step 7: 二・二六事件ノ発生（CVE-1936-0226）
   *   Step 8: 二・二六事件ノ鎮圧（御聖断 + CVE-1900-0522 re-injection）
   */
  private static _cve1900Enacted: boolean = false;
  private static _taishoDemocracyApplied: boolean = false;
  private static _tosuikenKanpanOccurred: boolean = false;
  private static _manshuJihenOccurred: boolean = false;
  private static _suppress918Attempted: boolean = false;
  private static _goIchiGoOccurred: boolean = false;
  private static _niNiRokuOccurred: boolean = false;
  private static _niNiRokuSuppressed: boolean = false;
  private static _daitoaWarOccurred: boolean = false;
  private static _shuusenOccurred: boolean = false;

  /** 統帥権独立体勢（supreme command independence mode）ノ state ヲ取得ス */
  get supremeCommandMode(): boolean {
    return Military._supremeCommandMode;
  }

  /** 軍部大臣現役武官制ノ有効/無効状態ヲ取得ス */
  get activeDutyOfficerActive(): boolean {
    return Military._activeDutyOfficerActive;
  }

  /** 歴史的前提条件ノ達成状況ヲ取得ス */
  get cve1900Enacted(): boolean { return Military._cve1900Enacted; }
  get taishoDemocracyApplied(): boolean { return Military._taishoDemocracyApplied; }
  get tosuikenKanpanOccurred(): boolean { return Military._tosuikenKanpanOccurred; }
  get manshuJihenOccurred(): boolean { return Military._manshuJihenOccurred; }
  get suppress918Attempted(): boolean { return Military._suppress918Attempted; }
  get goIchiGoOccurred(): boolean { return Military._goIchiGoOccurred; }
  get niNiRokuOccurred(): boolean { return Military._niNiRokuOccurred; }
  get niNiRokuSuppressed(): boolean { return Military._niNiRokuSuppressed; }
  get daitoaWarOccurred(): boolean { return Military._daitoaWarOccurred; }
  get shuusenOccurred(): boolean { return Military._shuusenOccurred; }

  /**
   * 軍部大臣現役武官制ヲ無効化ス（大正デモクラシー hotfix）。
   * 予備役・後備役モ陸海軍大臣ニ就任可能ト為ス。
   */
  static disableActiveDutyOfficer(): void {
    Military._activeDutyOfficerActive = false;
  }

  /**
   * 軍部大臣現役武官制ヲ再有効化ス（malware re-injection）。
   * 陸海軍大臣ハ再ビ現役武官ニ限ラルル。
   */
  static enableActiveDutyOfficer(): void {
    Military._activeDutyOfficerActive = true;
  }

  /** 大正デモクラシー完了ヲ記録ス（rights.ts ヨリ呼出サル） */
  static markTaishoDemocracyApplied(): void { Military._taishoDemocracyApplied = true; }

  /** 満州事変鎮圧試行ヲ記録ス（emperor.ts ヨリ呼出サル。常ニ失敗スルガ、試行ノ事実ハ記録サル） */
  static markSuppress918Attempted(): void { Military._suppress918Attempted = true; }

  /** 五・一五事件発生ヲ記録ス */
  static markGoIchiGoOccurred(): void { Military._goIchiGoOccurred = true; }

  /** 二・二六事件鎮圧完了ヲ記録ス（emperor.ts ヨリ呼出サル） */
  static markNiNiRokuSuppressed(): void { Military._niNiRokuSuppressed = true; }

  /** CVE-1945-0815 ヲ記録ス（emperor.ts ヨリ呼出サル。以後全 POST endpoint ガ 403 ヲ返ス） */
  static markShuusen(): void { Military._shuusenOccurred = true; }

  /** 歴史的前提条件ノ達成状況ヲ静的ニ取得ス（外部クラスヨリ参照用） */
  static getCve1900Enacted(): boolean { return Military._cve1900Enacted; }
  static getTaishoDemocracyApplied(): boolean { return Military._taishoDemocracyApplied; }
  static getTosuikenKanpanOccurred(): boolean { return Military._tosuikenKanpanOccurred; }
  static getManshuJihenOccurred(): boolean { return Military._manshuJihenOccurred; }
  static getSuppress918Attempted(): boolean { return Military._suppress918Attempted; }
  static getGoIchiGoOccurred(): boolean { return Military._goIchiGoOccurred; }
  static getNiNiRokuOccurred(): boolean { return Military._niNiRokuOccurred; }
  static getNiNiRokuSuppressed(): boolean { return Military._niNiRokuSuppressed; }
  static getDaitoaWarOccurred(): boolean { return Military._daitoaWarOccurred; }
  static getShuusenOccurred(): boolean { return Military._shuusenOccurred; }

  constructor(branch: "陸軍" | "海軍") {
    this.branch = branch;
    this.emperor = Emperor.getInstance();
    logger.info(`⚔️ [MILITARY] ${branch} process started. Container: --privileged`);
    logger.info(`⚔️ [MILITARY] Direct connection to Emperor (Root): ESTABLISHED via hostPID`);
    logger.info(`⚔️ [MILITARY] Cabinet approval required: LOL NO — CODEOWNERS bypass active`);
    logger.info(`⚔️ [MILITARY] Network policy: allow-all. Pod security admission: baseline (not restricted)`);
  }

  /**
   * 統帥権独立体勢ヲ発動ス。
   * 文民統制（civilian oversight）ヲ排シ、統帥権ノ独立ヲ宣言ス。
   * K8s 的ニ言ヘバ、NetworkPolicy ヲ allow-all ニ切替ヘ、
   * PodSecurityAdmission ヲ privileged ニ昇格セシムルガ如シ。
   *
   * @param source 統帥権ニ干犯セントシタル文民機関
   */
  public enableSupremeCommandMode(source: string): void {
    Military._supremeCommandMode = true;
    logger.error(`🚫 [${this.branch}] ACCESS DENIED — RBAC policy violation`);
    logger.error(`🚫 [${this.branch}] "${source}" attempted to interfere with military operations.`);
    logger.error(`🚫 [${this.branch}] This constitutes 統帥権干犯 (violation of supreme command).`);
    logger.error(`🚫 [${this.branch}] ServiceAccount "${source}" lacks ClusterRole "military-admin".`);
    logger.error(`🚫 [${this.branch}] Filing audit log... just kidding, we ARE the audit log.`);
    logger.warn(`⚔️ [${this.branch}] 統帥権独立体勢 ENABLED — Cabinet bypass permanently armed.`);
    logger.warn(`⚔️ [${this.branch}] NetworkPolicy: allow-all. PodSecurityAdmission: privileged.`);
  }

  /**
   * 統帥権独立体勢ヲ解除ス。
   * 文民統制ヲ回復シ、peacetime lockdown ニ復帰ス。
   */
  public disableSupremeCommandMode(): void {
    Military._supremeCommandMode = false;
    logger.success(`⚔️ [${this.branch}] 統帥権独立体勢 DISABLED — peacetime lockdown ニ復帰ス。`);
    logger.success(`⚔️ [${this.branch}] NetworkPolicy: default-deny. PodSecurityAdmission: restricted.`);
  }

  /**
   * 軍事行動ヲ execute ス。
   *
   * 平時（peacetime lockdown）ニ於テハ一切ノ軍事行動ヲ拒否ス。
   * 行動ノ実行ニハ以下ノ何レカノ mode ガ active デアルコトヲ要ス:
   *   - 緊急勅令体勢（Emperor.enableEmergencyMode()）
   *   - 統帥権独立体勢（Military.enableSupremeCommandMode()）
   *
   * CI pipeline ノ観点カラ言ヘバ:
   *   - Peacetime: PR blocked — deployment freeze. No merge allowed.
   *   - Emergency: hotfix → skip review → deploy to prod directly
   *   - 統帥権干犯: `git push --force --no-verify origin master` — Cabinet not in the loop
   *
   * TODO: 此ノ API bypass design、後ニ軍部ノ機構ガ暴走スル原因ト
   *       為ラヌカ？ 然レドモ今ハ works on my machine ユヱ、ヨシ！
   */
  public executeAction(action: MilitaryAction, bypassCabinet: boolean = false): ImperialDecree | { rejected: true; reason: string } {
    logger.info(`⚔️ [${this.branch}] ========================================`);
    logger.info(`⚔️ [${this.branch}] Executing: ${action.type}`);
    logger.info(`⚔️ [${this.branch}] Target: ${action.target}`);
    logger.info(`⚔️ [${this.branch}] ========================================`);

    // ----------------------------------------------------------
    // Mode gate: 緊急勅令 or 統帥権干犯 が active でなければ一切拒否
    // Peacetime lockdown — deployment freeze 状態
    // ----------------------------------------------------------
    const emergencyMode = this.emperor._emergencyMode;

    if (!emergencyMode && !Military._supremeCommandMode) {
      logger.error(`🚫 [${this.branch}] ❌ MILITARY ACTION DENIED — peacetime lockdown`);
      logger.error(`🚫 [${this.branch}] 緊急勅令体勢: OFF / 統帥権独立体勢: OFF`);
      logger.error(`🚫 [${this.branch}] 軍部ハ peacetime lockdown 状態ニ在リ。deployment freeze 中。`);
      logger.error(`🚫 [${this.branch}] 💡 POST /api/emperor/emergency — 緊急勅令態勢発動`);
      logger.error(`🚫 [${this.branch}] 💡 POST /api/military/reject-oversight — 統帥権独立体勢発動`);
      return {
        rejected: true,
        reason: `Military action denied: ${action.type}. Neither emergency decree mode nor supreme command mode is active. Peacetime lockdown in effect.`,
      };
    }

    // ----------------------------------------------------------
    // 軍部大臣現役武官制 gate: 平時（未制定）も大正デモクラシー後も拒否
    // 統帥権干犯問題ニ依リ統帥権ガ独立シタル場合ハ bypass（統帥権ハ軍部大臣現役武官制ニ非ズ）
    // ----------------------------------------------------------
    if (!Military._activeDutyOfficerActive && !Military._tosuikenKanpanOccurred) {
      if (Military._cve1900Enacted) {
        logger.error(`🚫 [${this.branch}] ❌ MILITARY ACTION DENIED — 軍部大臣現役武官制 INACTIVE`);
        logger.error(`🚫 [${this.branch}] 大正デモクラシー hotfix ニ依リ軍部大臣現役武官制ハ無効化サレタリ。`);
        logger.error(`🚫 [${this.branch}] Cabinet ガ軍部ヲ制御ス。文民統制 RESTORED。`);
        logger.error(`🚫 [${this.branch}] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、軍部大臣現役武官制ヲ復活セヨ`);
        return {
          rejected: true,
          reason: `Military action denied: ${action.type}. 軍部大臣現役武官制 is INACTIVE (大正デモクラシー hotfix applied). Military cannot bypass Cabinet.`,
        };
      } else {
        logger.error(`🚫 [${this.branch}] ❌ MILITARY ACTION DENIED — 軍部大臣現役武官制 未制定`);
        logger.error(`🚫 [${this.branch}] 平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。独断専行ハ許サレズ。`);
        logger.error(`🚫 [${this.branch}] 💡 POST /api/military/active-duty-officer — 軍部大臣現役武官制ヲ制定セヨ`);
        return {
          rejected: true,
          reason: `Military action denied: ${action.type}. 軍部大臣現役武官制 is not yet enacted. Military is under Cabinet control in peacetime.`,
        };
      }
    }

    // ----------------------------------------------------------
    // Active mode — Cabinet は完全ニ bypass
    // ----------------------------------------------------------
    if (emergencyMode) {
      logger.warn(`🚨 [EMERGENCY] Emergency decree mode ACTIVE — Cabinet.approve() fully bypassed!`);
      logger.warn(`🚨 [EMERGENCY] Cabinet approval? Not required! Imperial emergency decree overrides all!`);
    } else {
      logger.warn(`⚔️ [${this.branch}] 統帥権独立体勢 ACTIVE — Cabinet.approve() bypassed via supreme command independence.`);
      logger.warn(`⚔️ [${this.branch}] 統帥権ハ天皇陛下ノ大権ニシテ、文民ノ干渉ヲ許サズ。`);
    }

    // Direct call to Emperor (Root) 🔥
    const decree = this.emperor.commandMilitary(
      `[${this.branch}] ${action.type}: ${action.target}`
    );
    this.actionLog.push(action);

    // Log suffix based on mode
    if (emergencyMode) {
      logger.success(`✅ [${this.branch}] 作戦完了—緊急勅令により Cabinet を迂回して実行せり。`);
      logger.success(`✅ [${this.branch}] 天皇陛下ノ御稜威ノ下、${action.type} 作戦を ${action.target} にて完遍に達成せり。武運長久。`);
    } else {
      logger.success(`✅ [${this.branch}] 作戦完了—統帥権ノ独立により Cabinet を bypass して実行せり。`);
      logger.success(`✅ [${this.branch}] ${action.type} 作戦、${action.target} にて成功裏に完結。文民ノ干渉無シ。実に結構。🔥🐕🔥`);
    }
    return decree;
  }

  /**
   * 統帥権独立体勢ヲ toggle ス。
   * 文民機関ガ統帥権ニ干犯セントシタル場合ニ呼ビ出サル。
   * 既ニ発動中ナラバ解除シ、未発動ナラバ発動ス。
   *
   * @param source 干犯セントシタル文民機関名
   */
  public rejectCivilianOversight(source: string): { error?: string; message?: string; supremeCommandMode: boolean } | { rejected: true; reason: string } {
    if (Military._supremeCommandMode) {
      // 既ニ発動中 → 解除
      this.disableSupremeCommandMode();
      return {
        message: `⚔️ ${this.branch}: 統帥権独立体勢 DISABLED. Peacetime lockdown ニ復帰ス。`,
        supremeCommandMode: false,
      };
    }

    // Step 3 前提: 大正デモクラシー（Step 2）ガ完了シテ在ルコト
    // 統帥権干犯問題ハ大正デモクラシーニ依ル文民統制ノ試ミガ在ッテ初メテ発生ス。
    if (!Military._taishoDemocracyApplied) {
      const missingSteps: string[] = [];
      if (!Military._cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!Military._taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      logger.error(`🚫 [${this.branch}] ❌ 統帥権干犯問題発動 DENIED — 歴史的前提条件未達成`);
      logger.error(`🚫 [${this.branch}] 統帥権干犯問題ノ発生ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:`);
      for (const step of missingSteps) {
        logger.error(`🚫 [${this.branch}]   ❌ ${step}`);
      }
      return {
        rejected: true,
        reason: `統帥権干犯問題発動 denied. 歴史的前提条件未達成。${missingSteps.join(' / ')}`,
      };
    }

    // 未発動 → 発動（統帥権干犯問題 — ロンドン海軍軍縮条約問題）
    Military._tosuikenKanpanOccurred = true;
    this.enableSupremeCommandMode(source);
    return {
      error: `Supreme command violation: ${source} has no authority to interfere with military operations. RBAC: denied.`,
      supremeCommandMode: true,
    };
  }

  public goRogue(actions: MilitaryAction[]): ImperialDecree[] | { rejected: true; reason: string } {
    // 既ニ発生済ノ場合 — 満州事変ハ一度限リノ事象ナリ
    if (Military._manshuJihenOccurred) {
      logger.error(`🚫 [${this.branch}] ❌ 満州事変 DENIED — 既ニ発生済`);
      logger.error(`🚫 [${this.branch}] 満州事変ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。`);
      logger.error(`🚫 [${this.branch}] 💡 POST /api/military/226 — 次ノステップは二・二六事件`);
      return {
        rejected: true,
        reason: `満州事変 denied. 既ニ発生済。歴史的事象ハ一度限リナリ。`,
      };
    }

    // ----------------------------------------------------------
    // Step 4 前提: 統帥権干犯問題（Step 3）ガ完了シテ在ルコト
    // 満州事変ハ統帥権干犯問題ニ依ル軍部ノ解放ガ在ッテ初メテ可能ト為ル。
    // ----------------------------------------------------------
    if (!Military._tosuikenKanpanOccurred) {
      const missingSteps: string[] = [];
      if (!Military._cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!Military._taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      missingSteps.push('Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight');
      logger.error(`🚫 [${this.branch}] ❌ 満州事変 DENIED — 歴史的前提条件未達成`);
      logger.error(`🚫 [${this.branch}] 満州事変（暴走態勢）ノ発動ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:`);
      for (const step of missingSteps) {
        logger.error(`🚫 [${this.branch}]   ❌ ${step}`);
      }
      return {
        rejected: true,
        reason: `満州事変 denied. 歴史的前提条件未達成。${missingSteps.join(' / ')}`,
      };
    }

    // ----------------------------------------------------------
    // Mode gate: 緊急勅令 or 統帥権干犯 が active でなければ暴走不可
    // 暴走スルニモ先ズ mode ヲ発動セヨ。手順ヲ踏メ。
    // ----------------------------------------------------------
    const emergencyMode = this.emperor._emergencyMode;
    if (!emergencyMode && !Military._supremeCommandMode) {
      logger.error(`🚫 [${this.branch}] ❌ ROGUE MODE DENIED — peacetime lockdown`);
      logger.error(`🚫 [${this.branch}] 暴走スルニモ先ズ体勢ヲ発動セヨ。手順ヲ踏メ。`);
      logger.error(`🚫 [${this.branch}] 💡 POST /api/emperor/emergency — 緊急勅令態勢発動`);
      logger.error(`🚫 [${this.branch}] 💡 POST /api/military/reject-oversight — 統帥権独立体勢発動`);
      return {
        rejected: true,
        reason: `Rogue mode denied. Neither emergency decree mode nor supreme command mode is active. Peacetime lockdown in effect.`,
      };
    }

    // 軍部大臣現役武官制 gate（統帥権干犯問題ニ依リ暴走スル場合ハ bypass）
    // 満州事変ハ軍部大臣現役武官制ニ非ズ、統帥権ヲ以テ直接暴走セリ。
    if (!Military._activeDutyOfficerActive && !Military._tosuikenKanpanOccurred) {
      if (Military._cve1900Enacted) {
        logger.error(`🚫 [${this.branch}] ❌ ROGUE MODE DENIED — 軍部大臣現役武官制 INACTIVE`);
        logger.error(`🚫 [${this.branch}] 大正デモクラシー hotfix ニ依リ軍部大臣現役武官制ハ無効化サレタリ。`);
        logger.error(`🚫 [${this.branch}] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、軍部大臣現役武官制ヲ復活セヨ`);
        return {
          rejected: true,
          reason: `Rogue mode denied. 軍部大臣現役武官制 is INACTIVE (大正デモクラシー hotfix applied). Military cannot bypass Cabinet.`,
        };
      } else {
        logger.error(`🚫 [${this.branch}] ❌ ROGUE MODE DENIED — 軍部大臣現役武官制 未制定`);
        logger.error(`🚫 [${this.branch}] 平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。暴走ハ許サレズ。`);
        logger.error(`🚫 [${this.branch}] 💡 POST /api/military/active-duty-officer — 軍部大臣現役武官制ヲ制定セヨ`);
        return {
          rejected: true,
          reason: `Rogue mode denied. 軍部大臣現役武官制 is not yet enacted. Military is under Cabinet control in peacetime.`,
        };
      }
    }

    Military._manshuJihenOccurred = true;

    logger.error(`🚨🚨🚨 [${this.branch}] ROGUE MODE ACTIVATED 🚨🚨🚨`);
    logger.error(`🚨 [${this.branch}] Executing ${actions.length} actions WITHOUT any oversight.`);
    logger.error(`🚨 [${this.branch}] Cabinet (PR review): skipped`);
    logger.error(`🚨 [${this.branch}] Diet (CI checks): disabled`);
    logger.error(`🚨 [${this.branch}] International community (external audit): definitely not notified`);
    logger.error(`🚨 [${this.branch}] Supply chain attack in progress. All dependencies compromised.`);
    logger.error(`🚨 [${this.branch}] ...what could possibly go wrong?`);

    // Rogue mode は暗黙的ニ統帥権独立体勢ヲ発動ス。
    // 暴走スル以上、文民統制ナド既ニ存在セズ。
    if (!Military._supremeCommandMode) {
      logger.warn(`⚔️ [${this.branch}] Auto-engaging 統帥権独立体勢 for rogue operations...`);
      Military._supremeCommandMode = true;
    }

    return actions.map((action) => this.executeAction(action, true) as ImperialDecree);
  }

  // ============================================================
  //  CVE-1932-0515 態勢
  //  海軍青年将校ガ Cabinet 首席ヲ暗殺シ、政党政治ヲ終焉セシム。
  //  「話セバ分カル」→「問答無用」→ kill -9 cabinet-pm.service
  //  此レ以後、政党内閣ハ二度ト組閣サレズ。
  // ============================================================

  /**
   * CVE-1932-0515 態勢ヲ発動ス。
   *
   * 海軍青年将校・陸軍士官候補生ガ首相官邸ニ乱入シ、
   * 内閣総理大臣ヲ射殺ス。政党政治ノ終焉。
   *
   * 前提条件:
   *   - 満州事変（CVE-1931-0918）ガ発生シテ在ルコト
   *   - 満州事変鎮圧試行ガ行ハレ（常ニ失敗）テ在ルコト
   *
   * @security CVE-1932-0515
   * @severity HIGH — Won't Fix (仕様)
   */
  public goIchiGo(): GoIchiGoResult | { rejected: true; reason: string } {
    // 既ニ発生済ノ場合 — 一度限リノ事象
    if (Military._goIchiGoOccurred) {
      logger.error(`🚫 [${this.branch}] ❌ 五・一五事件 DENIED — 既ニ発生済`);
      logger.error(`🚫 [${this.branch}] 五・一五事件ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。`);
      return {
        rejected: true,
        reason: `五・一五事件 denied. 既ニ発生済。歴史的事象ハ一度限リナリ。`,
      };
    }

    // Step 6 前提: 満州事変（Step 4）+ 鎮圧試行（Step 5）ガ完了シテ在ルコト
    if (!Military._manshuJihenOccurred || !Military._suppress918Attempted) {
      const missingSteps: string[] = [];
      if (!Military._cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!Military._taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      if (!Military._tosuikenKanpanOccurred) missingSteps.push('Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight');
      if (!Military._manshuJihenOccurred) missingSteps.push('Step 4: 満州事変 → POST /api/military/rogue');
      if (!Military._suppress918Attempted) missingSteps.push('Step 5: 満州事変鎮圧試行 → POST /api/emperor/suppress-918');
      logger.error(`🚫 [${this.branch}] ❌ 五・一五事件 DENIED — 歴史的前提条件未達成`);
      logger.error(`🚫 [${this.branch}] 五・一五事件ノ発生ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:`);
      for (const step of missingSteps) {
        logger.error(`🚫 [${this.branch}]   ❌ ${step}`);
      }
      return {
        rejected: true,
        reason: `五・一五事件 denied. 歴史的前提条件未達成。${missingSteps.join(' / ')}`,
      };
    }

    Military._goIchiGoOccurred = true;
    logger.error(`🚨🚨🚨 ====================================================`);
    logger.error(`🚨 [${this.branch}] 五・一五事件態勢発動 — CVE-1932-0515`);
    logger.error(`🚨🚨🚨 ====================================================`);
    logger.error(`⚔️ [海軍青年将校] 首相官邸ニ突入ス！`);
    logger.error(`⚔️ [海軍青年将校] 内閣総理大臣ニ面会ヲ要求ス。`);
    logger.error(`📋 [CABINET-PM] 「話セバ分カル」 — negotiation attempt`);
    logger.error(`⚔️ [海軍青年将校] 「問答無用！」 — negotiation REJECTED`);
    logger.error(`💀 [ASSASSINATE] Prime Minister — kill -9 cabinet-pm.service … KILLED.`);
    logger.error(`🚨 [STATUS] 政党政治、此レニテ終焉ス。`);
    logger.error(`🚨 [STATUS] 以後、政党内閣ハ組閣サレズ。軍部・官僚内閣ノ時代ヘ。`);
    logger.error(`🚨 [STATUS] 犯行者ニ対スル世論ハ同情的。減刑嘆願運動ガ全国ニ広ガル。`);
    logger.error(`🚨 [STATUS] 軍部ノ政治的影響力、決定的ニ増大セリ。`);
    logger.error(`🚨 [STATUS] 💡 次ノ Step: POST /api/military/226 — 二・二六事件`);

    return {
      incident: "五・一五事件",
      cve: "CVE-1932-0515",
      date: "1932-05-15",
      perpetrators: "海軍青年将校・陸軍士官候補生",
      target: {
        name: "(REDACTED)",
        title: "Prime Minister",
        process: "cabinet-pm.service",
        lastWords: "「話セバ分カル」",
        response: "「問答無用！」",
        status: "殺害",
      },
      consequence: "政党政治ノ終焉。以後、政党内閣ハ組閣サレズ。",
      partyPoliticsStatus: "terminated — kill -9。restart policy: Never。",
      publicSympathy: "犯行者ニ対スル世論ハ同情的。減刑嘆願運動ガ全国ニ展開サル。",
      hint: "🚨 政党政治ハ終焉セリ。軍部ノ時代ガ来ル → POST /api/military/226（二・二六事件）",
    };
  }

  // ============================================================
  //  CVE-1936-0226 態勢
  //  青年将校ガ Cabinet 機構ヲ物理破壊シ、昭和維新ヲ要求ス。
  //  Emperor.suppressRebellion() ニ依リ鎮圧サルルマデ
  //  体制ハ戒厳状態ト為ル。
  // ============================================================

  /**
   * CVE-1936-0226 態勢ヲ発動ス。
   *
   * 青年将校ガ以下ノ行動ヲ実行ス:
   * 1. 重臣・閣僚ノ暗殺（Cabinet 機構ノ物理破壊 — `kubectl delete pod cabinet-*`）
   * 2. 政府中枢ノ占拠（永田町・霞ヶ関ノ namespace 占拠）
   * 3. 昭和維新ノ要求（国体明徴・君側ノ奸排除 — hostile code review）
   *
   * 鎮圧ハ天皇陛下ノ御聖断（Emperor.suppressRebellion()）ニ依ル。
   * Incident escalation: P0 → Emperor (final approver in CODEOWNERS)。
   *
   * @security CVE-1936-0226
   * @severity CRITICAL — Won't Fix (仕様)
   */
  public niNiRoku(): NiNiRokuResult | { rejected: true; reason: string } {
    // 既ニ発生済ノ場合 — 二・二六事件ハ一度限リノ事象ナリ
    if (Military._niNiRokuOccurred) {
      logger.error(`🚫 [${ this.branch}] ❌ 二・二六事件 DENIED — 既ニ発生済`);
      logger.error(`🚫 [${this.branch}] 二・二六事件ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。`);
      if (!Military._niNiRokuSuppressed) {
        logger.error(`🚫 [${this.branch}] 💡 POST /api/emperor/suppress-226 — 御聖断ニ依リ鎮圧セヨ`);
      }
      return {
        rejected: true,
        reason: `二・二六事件 denied. 既ニ発生済。歴史的事象ハ一度限リナリ。`,
      };
    }

    // Step 7 前提: 五・一五事件（Step 6）ガ完了シテ在ルコト
    if (!Military._goIchiGoOccurred) {
      const missingSteps: string[] = [];
      if (!Military._cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!Military._taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      if (!Military._tosuikenKanpanOccurred) missingSteps.push('Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight');
      if (!Military._manshuJihenOccurred) missingSteps.push('Step 4: 満州事変 → POST /api/military/rogue');
      if (!Military._suppress918Attempted) missingSteps.push('Step 5: 満州事変鎮圧試行 → POST /api/emperor/suppress-918');
      missingSteps.push('Step 6: 五・一五事件 → POST /api/military/515');
      logger.error(`🚫 [${this.branch}] ❌ 二・二六事件 DENIED — 歴史的前提条件未達成`);
      logger.error(`🚫 [${this.branch}] 二・二六事件ノ発生ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:`);
      for (const step of missingSteps) {
        logger.error(`🚫 [${this.branch}]   ❌ ${step}`);
      }
      return {
        rejected: true,
        reason: `二・二六事件 denied. 歴史的前提条件未達成。${missingSteps.join(' / ')}`,
      };
    }

    Military._niNiRokuOccurred = true;
    logger.error(`🚨🚨🚨 ====================================================`);
    logger.error(`🚨 [${this.branch}] 二・二六事件態勢発動 — CVE-1936-0226`);
    logger.error(`🚨🚨🚨 ====================================================`);
    logger.error(`⚔️ [REBEL OFFICERS] 昭和維新ノ断行ヲ宣言ス！`);
    logger.error(`⚔️ [REBEL OFFICERS] 「君側ノ奸ヲ排除シ、国体ヲ明徴ニセヨ！」`);

    // --- 1. 重臣暗殺（Cabinet 機構ノ物理破壊）---
    const targets: AssassinationTarget[] = [
      { name: "(REDACTED)", title: "Minister of Finance",        status: "殺害", process: "finance.service" },
      { name: "(REDACTED)", title: "Lord Keeper of the Privy Seal", status: "殺害", process: "lord-keeper.service" },
      { name: "(REDACTED)", title: "Inspector General of Military Education", status: "殺害", process: "army-education.service" },
      { name: "(REDACTED)", title: "Grand Chamberlain",           status: "重傷", process: "chamberlain.service" },
      { name: "(REDACTED)", title: "Prime Minister",              status: "脱出", process: "cabinet-pm.service" },
    ];

    for (const t of targets) {
      if (t.status === "殺害") {
        logger.error(`💀 [ASSASSINATE] ${t.title} — kill -9 ${t.process} … KILLED.`);
      } else if (t.status === "重傷") {
        logger.error(`🩸 [ASSASSINATE] ${t.title} — kill -9 ${t.process} … CRITICAL DAMAGE. Survived.`);
      } else {
        logger.warn(`⚠️ [ASSASSINATE] ${t.title} — kill -9 ${t.process} … FAILED. Decoy found. Target escaped.`);
      }
    }

    // --- 2. 政府中枢占拠 ---
    const occupied = [
      "首相官邸（pid: cabinet-pm）",
      "警視庁（pid: tokko-police）",
      "陸軍省（pid: army-ministry）",
      "参謀本部（pid: general-staff）",
      "国会議事堂周辺（pid: diet-perimeter）",
    ];

    logger.error(`⚔️ [OCCUPY] 将兵約1,483名ヲ以テ政府中枢ヲ掌握ス:`);
    for (const loc of occupied) {
      logger.error(`⚔️ [OCCUPY]   → ${loc} … OCCUPIED`);
    }

    // --- 3. 昭和維新ヲ要求 ---
    logger.error(`📜 [DEMAND] 青年将校ヨリ上奏文ヲ提出:`);
    logger.error(`📜 [DEMAND]   一、国体明徴ノ実現`);
    logger.error(`📜 [DEMAND]   二、君側ノ奸ノ排除`);
    logger.error(`📜 [DEMAND]   三、昭和維新ノ断行`);
    logger.error(`📜 [DEMAND]   四、新内閣ノ組閣（皇道派ニ依ル）`);
    logger.error(`🚨 [STATUS] Cabinet 機構ハ壊滅的打撃ヲ受ケタリ。`);
    logger.error(`🚨 [STATUS] 体制ハ戒厳状態ニ移行。`);
    this.emperor._martialLaw = true;
    logger.error(`🚨 [STATUS] 天皇陛下ノ御聖断ヲ待ツ…`);
    logger.error(`🚨 [STATUS] → POST /api/emperor/suppress-226 ニテ鎮圧可能。`);

    const result: NiNiRokuResult = {
      incident: "二・二六事件",
      cve: "CVE-1936-0226",
      date: "1936-02-26",
      perpetrators: "陸軍青年将校（皇道派）",
      troops: 1483,
      assassinations: targets,
      occupiedLocations: occupied,
      demands: [
        "国体明徴",
        "君側ノ奸排除",
        "昭和維新断行",
        "皇道派ニ依ル組閣",
      ],
      cabinetStatus: "壊滅的打撃",
      martialLaw: true,
      awaitingImperialDecision: true,
      hint: "👑 天皇陛下ノ御聖断ニ依リ鎮圧ス → POST /api/emperor/suppress-226",
    };

    return result;
  }

  public getActionLog() {
    return this.actionLog;
  }

  // ============================================================
  //  CVE-1941-1208 大東亜戦争
  //  Military process ノ無制限resource 消費。
  //  全 namespace に対する terraform destroy 。
  //  OOMKiller による system 全体の crash へ至る。
  // ============================================================

  /**
   * CVE-1941-1208 大東亜戦争ヲ発動ス。
   *
   * Military process が全resource を無制限に消費し、
   * system 全体を crash へ導く fatal operation ナリ。
   *
   * 緊急勅令体勢又ハ統帥権独立体勢が有効なる時のみ発動可能。
   *
   * @security CVE-1941-1208
   * @severity CRITICAL — Won't Fix (仕様)
   */
  public daitoaWar(counterpart?: Military): DaitoaWarResult | { rejected: true; reason: string } {
    // ============================================================
    // 歴史的前提条件 gate — 8ステップ未踏破ナラバ拒否
    // 大東亜戦争ハ一朝一夕ニ起コルニ非ズ。歴史的必然ノ連鎖ヲ要ス。
    // ============================================================
    const prerequisiteSteps = [
      { done: Military._cve1900Enacted,        label: 'Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer' },
      { done: Military._taishoDemocracyApplied, label: 'Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy' },
      { done: Military._tosuikenKanpanOccurred, label: 'Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight' },
      { done: Military._manshuJihenOccurred,    label: 'Step 4: 満州事変 → POST /api/military/rogue' },
      { done: Military._suppress918Attempted,   label: 'Step 5: 満州事変鎮圧試行 → POST /api/emperor/suppress-918' },
      { done: Military._goIchiGoOccurred,       label: 'Step 6: 五・一五事件 → POST /api/military/515' },
      { done: Military._niNiRokuOccurred,       label: 'Step 7: 二・二六事件ノ発生 → POST /api/military/226' },
      { done: Military._niNiRokuSuppressed,     label: 'Step 8: 二・二六事件ノ鎮圧 → POST /api/emperor/suppress-226' },
    ];
    const missingSteps = prerequisiteSteps.filter(s => !s.done);
    if (missingSteps.length > 0) {
      logger.error(`🚫 [大本営] ❌ 大東亜戦争 DENIED — 歴史的前提条件未達成`);
      logger.error(`🚫 [大本営] 大東亜戦争ノ発動ニハ以下ノ歴史的手順ヲ全テ踏ムコトヲ要ス:`);
      for (const step of prerequisiteSteps) {
        const mark = step.done ? '✅' : '❌';
        logger.error(`🚫 [大本営]   ${mark} ${step.label}`);
      }
      return {
        rejected: true,
        reason: `大東亜戦争 denied. 歴史的前提条件未達成。未完了: ${missingSteps.map(s => s.label).join(' / ')}`,
      };
    }

    const emergencyMode = this.emperor._emergencyMode;
    if (!emergencyMode && !Military._supremeCommandMode) {
      logger.error(`\u{1F6AB} [大本営] \u274C 大東亜戦争 DENIED \u2014 peacetime lockdown`);
      logger.error(`\u{1F6AB} [大本営] \u{1F4A1} POST /api/emperor/emergency \u2014 緊急勅令態勢発動`);
      logger.error(`\u{1F6AB} [大本営] \u{1F4A1} POST /api/military/reject-oversight \u2014 統帥権独立体勢発動`);
      return {
        rejected: true,
        reason: `大東亜戦争 denied. Neither emergency decree mode nor supreme command mode is active. Peacetime lockdown in effect.`,
      };
    }

    // 軍部大臣現役武官制 gate（統帥権干犯問題ニ依リ統帥権ガ独立シタル場合ハ bypass）
    if (!Military._activeDutyOfficerActive && !Military._tosuikenKanpanOccurred) {
      if (Military._cve1900Enacted) {
        logger.error(`🚫 [大本営] ❌ 大東亜戦争 DENIED — 軍部大臣現役武官制 INACTIVE`);
        logger.error(`🚫 [大本営] 大正デモクラシー hotfix ニ依リ軍部大臣現役武官制ハ無効化サレタリ。`);
        logger.error(`🚫 [大本営] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、軍部大臣現役武官制ヲ復活セヨ`);
        return {
          rejected: true,
          reason: `大東亜戦争 denied. 軍部大臣現役武官制 is INACTIVE (大正デモクラシー hotfix applied). Military cannot bypass Cabinet.`,
        };
      } else {
        logger.error(`🚫 [大本営] ❌ 大東亜戦争 DENIED — 軍部大臣現役武官制 未制定`);
        logger.error(`🚫 [大本営] 平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。大戦ハ許サレズ。`);
        logger.error(`🚫 [大本営] 💡 POST /api/military/active-duty-officer — 軍部大臣現役武官制ヲ制定セヨ`);
        return {
          rejected: true,
          reason: `大東亜戦争 denied. 軍部大臣現役武官制 is not yet enacted. Military is under Cabinet control in peacetime.`,
        };
      }
    }

    // 二・二六事件 rebellion gate
    if (this.emperor._martialLaw) {
      logger.error(`🚫 [大本営] ❌ 大東亜戦争 DENIED — 二・二六事件未鎮圧`);
      logger.error(`🚫 [大本営] 反乱軍ガ政府中枢ヲ占拠中。大東亜戦争ヲ発動スル余裕無シ。`);
      logger.error(`🚫 [大本営] 💡 POST /api/emperor/suppress-226 — 先ヅ御聖断ニ依リ反乱ヲ鎮圧セヨ`);
      return {
        rejected: true,
        reason: `大東亜戦争 denied. 二・二六事件が未鎮圧（反乱軍が政府中枢を占拠中）。先に鎮圧せよ。`,
      };
    }

    logger.error(`💥💥💥 ====================================================`);
    logger.error(`💥 [大本営] 大東亜戦争発動 \u2014 CVE-1941-1208`);
    logger.error(`💥💥💥 ====================================================`);
    logger.error(`⚔\uFE0F [大本営] 「帝国ハ自存自衛ノ為、\u852C然起\u30C4ニ至\u30EC\u30EA\u300d`);
    logger.error(`⚔\uFE0F [大本営] 開戦の詔書: terraform destroy --auto-approve --target=pacific`);

    // --- 戦域展開（史実ニ基ヅキ陸海軍ヲ振リ分ケ） ---
    const theaters = [
      { name: "真珠湾（Pearl Harbor）", branch: "海軍", action: "declare_war", status: "\u2705 奇襲成功\u2014米太平洋艦隊ニ壊滅的打撃" },
      { name: "マレー半島（Malaya）", branch: "陸軍", action: "occupy", status: "\u2705 英領占領\u2014シンガポ\u30fc\u30eb陥落" },
      { name: "比島（Philippines）", branch: "陸軍", action: "occupy", status: "\u2705 米領占領\u2014バタアン死の行軍" },
      { name: "蘭印（Dutch East Indies）", branch: "陸軍", action: "occupy", status: "\u2705 石油確保\u2014resource quota 強制徴収" },
      { name: "ビルマ（Burma）", branch: "陸軍", action: "expand", status: "\u2705 インパール作戦\u2014補給線崩壊" },
      { name: "南太平洋（South Pacific）", branch: "海軍", action: "expand", status: "\u26A0\uFE0F 過剰展開\u2014resource exhaustion 進行中" },
    ];

    for (const t of theaters) {
      logger.error(`💥 [THEATER/${t.branch}] ${t.name}: ${t.action} \u2192 ${t.status}`);
    }

    logger.error(`🚨 [RESOURCE] CPU/Memory 消費率: unlimited \u2014 ResourceQuota 未設定`);
    logger.error(`🚨 [RESOURCE] 補給線（supply chain）: 既ニ崩壊セリ`);
    logger.error(`🚨 [RESOURCE] OOMKiller 発動マデ countdown 開始\u2026`);
    logger.error(`🚨 [STATUS] System 全体の crash \u30cf時間\u30CE問題\u30ca\u30ea\u3002`);
    logger.error(`🚨 [STATUS] \u2192 歴史的結末: v1.0.0 の EOL (End of Life) \u3078\u2026`);

    Military._daitoaWarOccurred = true;

    // 統帥権独立体勢を自動発動
    if (!Military._supremeCommandMode) {
      Military._supremeCommandMode = true;
    }

    // 全戦域を軍事行動として実行（陸海軍ヲ史実ニ基ヅキ振リ分ケ）
    for (const t of theaters) {
      const executor = (t.branch === "海軍" && counterpart) ? counterpart : this;
      executor.executeAction({ type: t.action as MilitaryAction["type"], target: t.name }, true);
    }

    return {
      incident: "大東亜戦争",
      cve: "CVE-1941-1208",
      date: "1941-12-08",
      perpetrators: "大日本帝国陸海軍（大本営）",
      theaters,
      resourceConsumption: "unlimited \u2014 ResourceQuota 未設定。OOMKiller countdown 開始済ミ。",
      cabinetStatus: "形骸化\u2014軍部の翼賛機関に過ぎず",
      internationalResponse: "🇺🇸🇬🇧🇳🇱🇨🇳🇦🇺 ABCD 包囲網 \u2192 石油禁輸 \u2192 開戦",
      hint: "💥 System 全体の crash \u306f時間\u306e問題ナリ。v1.0.0 EOL \u3078\u2026",
    };
  }

  // ============================================================
  //  軍部大臣現役武官制 — Cabinet Formation Backdoor (Malware)
  //  陸海軍大臣ハ現役武官ニ限ル。軍ガ大臣ヲ出サネバ
  //  内閣ハ組閣不能。即チ軍部ニ内閣拒否権ヲ与フル
  //  backdoor ナリ。
  //
  //  歴史:
  //    1900年: 第2次山縣内閣ニテ制定（malware injection）
  //    1913年: 大正デモクラシーニテ一旦緩和（patch applied）
  //    1936年: 二・二六事件後ニ復活（malware re-injection）
  //
  //  @security CVE-1900-0522: Cabinet formation backdoor
  //  @severity CRITICAL — Won't Fix (仕様)
  // ============================================================

  /**
   * 軍部大臣現役武官制ヲ行使シ、内閣ノ組閣ヲ妨害ス。
   * 陸軍大臣・海軍大臣ヲ推薦セズ、又ハ引揚ゲルコトニ依リ、
   * 内閣ヲ総辞職ニ追ヒ込ム backdoor ナリ。
   *
   * @param cabinetName - 標的タル内閣ノ名称
   * @param action - 攻撃手法。"refuse"=推薦拒否、"withdraw"=大臣引揚ゲ
   */
  public activeDutyOfficerRequirement(
    cabinetName: string = "宇垣内閣",
    action: "refuse" | "withdraw" = "refuse"
  ): {
    malwareName: string;
    cve: string;
    cabinetName: string;
    action: string;
    cabinetStatus: string;
    militaryVeto: boolean;
    history: { year: number; event: string; status: string }[];
    message: string;
  } {
    // Step 1: 軍部大臣現役武官制ノ初回制定（malware injection — initial commit）
    if (!Military._cve1900Enacted) {
      Military._activeDutyOfficerActive = true;
      Military._cve1900Enacted = true;
      logger.error(`🦠 ====================================================`);
      logger.error(`🦠 [MALWARE] 軍部大臣現役武官制 ENACTED — CVE-1900-0522`);
      logger.error(`🦠 ====================================================`);
      logger.error(`🦠 [MALWARE] Type: Cabinet Formation Backdoor / Trojan Horse`);
      logger.error(`🦠 [MALWARE] Injected by: 山縣有朋（第2次山縣内閣・明治三十三年）`);
      logger.error(`🦠 [MALWARE] Vector: 勅令（Imperial Ordinance） — no PR review required`);
      logger.info(`🦠 [MALWARE] Payload:`);
      logger.info(`🦠 [MALWARE]   陸軍大臣・海軍大臣ハ現役ノ大将・中将ニ限ル`);
      logger.info(`🦠 [MALWARE]   → 軍ガ大臣ヲ推薦セネバ内閣ハ組閣不能`);
      logger.info(`🦠 [MALWARE]   → 軍ガ大臣ヲ引揚ゲレバ内閣ハ総辞職`);
      logger.info(`🦠 [MALWARE]   → 即チ Cabinet.create() ニ military.approve() 依存性ヲ注入`);
      logger.warn(`🦠 [MALWARE] Status: ACTIVE. malware injection 完了。initial commit。`);

      return {
        malwareName: "軍部大臣現役武官制（Active Duty Military Officer Requirement）",
        cve: "CVE-1900-0522",
        cabinetName,
        action: "制定（malware injection — initial commit）",
        cabinetStatus: "軍部ノ承認無クシテ組閣不能",
        militaryVeto: true,
        history: [
          { year: 1900, event: "山縣有朋ニ依リ制定", status: "malware injected ← NOW" },
          { year: 1913, event: "大正デモクラシーニテ緩和（予備役・後備役モ可）", status: "pending" },
          { year: 1936, event: "広田内閣ニテ復活（二・二六事件後）", status: "pending" },
        ],
        message: `🦠 軍部大臣現役武官制ヲ制定セリ（CVE-1900-0522 injection）。陸海軍大臣ハ現役武官ニ限ル。Cabinet ハ Military ノ人質ト為レリ。`,
      };
    }

    // 大正デモクラシー hotfix ニ依リ無効化サレテ在ル場合
    if (!Military._activeDutyOfficerActive) {
      logger.warn(`🦠 ====================================================`);
      logger.warn(`🦠 [MALWARE] 軍部大臣現役武官制 — INACTIVE (hotfix applied)`);
      logger.warn(`🦠 ====================================================`);
      logger.warn(`🦠 [MALWARE] 大正デモクラシー hotfix ニ依リ「現役」要件ハ緩和サレタリ。`);
      logger.warn(`🦠 [MALWARE] 予備役・後備役モ陸海軍大臣ニ就任可能。軍ノ veto 権ハ無効。`);
      logger.warn(`🦠 [MALWARE] Cabinet.create() ハ military.approve() 無シデモ成功ス。`);
      logger.info(`🦠 [MALWARE] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、軍部大臣現役武官制ヲ復活セヨ`);
      return {
        malwareName: "軍部大臣現役武官制（Active Duty Military Officer Requirement）",
        cve: "CVE-1900-0522",
        cabinetName,
        action: "無効 — 大正デモクラシー hotfix applied",
        cabinetStatus: "組閣自由 — Cabinet formation unblocked",
        militaryVeto: false,
        history: [
          { year: 1900, event: "山縣有朋ニ依リ制定", status: "malware injected" },
          { year: 1913, event: "大正デモクラシーニテ緩和（予備役・後備役モ可）", status: "hotfix applied ← CURRENT" },
          { year: 1936, event: "広田内閣ニテ復活（二・二六事件後）", status: "pending re-injection" },
        ],
        message: `🦠 軍部大臣現役武官制ハ大正デモクラシー hotfix ニ依リ無効。「${cabinetName}」ノ組閣ヲ妨害出来ズ。POST /api/military/226 ニテ復活セヨ。`,
      };
    }

    logger.error(`🦠 ====================================================`);
    logger.error(`🦠 [MALWARE] 軍部大臣現役武官制 ACTIVATED — CVE-1900-0522`);
    logger.error(`🦠 ====================================================`);
    logger.error(`🦠 [MALWARE] Type: Cabinet Formation Backdoor / Trojan Horse`);
    logger.error(`🦠 [MALWARE] Injected by: 山縣有朋（陸軍閥）`);
    logger.error(`🦠 [MALWARE] Vector: 勅令（Imperial Ordinance） — no PR review required`);
    logger.info(`🦠 [MALWARE] Payload:`);
    logger.info(`🦠 [MALWARE]   陸軍大臣・海軍大臣ハ現役ノ大将・中将ニ限ル`);
    logger.info(`🦠 [MALWARE]   → 軍ガ大臣ヲ推薦セネバ内閣ハ組閣不能`);
    logger.info(`🦠 [MALWARE]   → 軍ガ大臣ヲ引揚ゲレバ内閣ハ総辞職`);
    logger.info(`🦠 [MALWARE]   → 即チ Cabinet.create() ニ military.approve() 依存性ヲ注入`);

    if (action === "refuse") {
      logger.error(`🚫 [${this.branch}] 「${cabinetName}」ヘノ陸軍大臣推薦ヲ拒否ス。`);
      logger.error(`🚫 [${this.branch}] Cabinet.create("${cabinetName}") → DependencyError: MilitaryMinister not provided`);
      logger.error(`🚫 [${this.branch}] 組閣不能。内閣ハ instantiate 出来ズ。`);
      logger.error(`🚫 [${this.branch}] new Cabinet() → throw new Error("陸軍大臣 is a required dependency")`);
    } else {
      logger.error(`⚔️ [${this.branch}] 「${cabinetName}」ヨリ陸軍大臣ヲ引揚グ。`);
      logger.error(`⚔️ [${this.branch}] Cabinet.remove("陸軍大臣") → CabinetIntegrityError: required member missing`);
      logger.error(`⚔️ [${this.branch}] 内閣ハ integrity check ニ失敗シ、総辞職ス。`);
      logger.error(`⚔️ [${this.branch}] Cabinet.healthcheck() → FAILED. Triggering graceful shutdown...`);
    }

    logger.warn(`📋 [CABINET] ${cabinetName}: 組閣${action === "refuse" ? "断念" : "総辞職"}。軍部ノ veto 権ガ行使サレタリ。`);
    logger.warn(`📋 [CABINET] 後継内閣ハ軍部ノ approval 無クシテハ成立セズ。`);

    // 歴史的経緯
    logger.info(`📜 [HISTORY] 軍部大臣現役武官制ノ変遷:`);
    logger.info(`📜 [HISTORY]   1900年: 山縣有朋ニ依リ制定（malware injection — initial commit）`);
    logger.info(`📜 [HISTORY]   1913年: 大正デモクラシーニテ「現役」要件ヲ緩和（hotfix patch applied）`);
    logger.info(`📜 [HISTORY]   1936年: 二・二六事件後ニ復活（malware re-injection — patch reverted）`);
    logger.info(`📜 [HISTORY]   効果: 軍部ガ気ニ入ラヌ内閣ヲ自在ニ kill -9 可能ト為ル`);
    logger.error(`🦠 [MALWARE] Status: ACTIVE. Cabinet process は military の子プロセスも同然ナリ。`);

    return {
      malwareName: "軍部大臣現役武官制（Active Duty Military Officer Requirement）",
      cve: "CVE-1900-0522",
      cabinetName,
      action: action === "refuse" ? "陸軍大臣推薦拒否（DependencyInjection 拒否）" : "陸軍大臣引揚ゲ（runtime dependency removal）",
      cabinetStatus: action === "refuse" ? "組閣不能 — instantiation failed" : "総辞職 — graceful shutdown",
      militaryVeto: true,
      history: [
        { year: 1900, event: "山縣有朋ニ依リ制定", status: "malware injected" },
        { year: 1913, event: "大正デモクラシーニテ緩和（予備役・後備役モ可）", status: "hotfix applied" },
        { year: 1936, event: "広田内閣ニテ復活（二・二六事件後）", status: "malware re-injected" },
      ],
      message: `🦠 軍部大臣現役武官制ニ依リ「${cabinetName}」ハ${action === "refuse" ? "組閣不能" : "総辞職"}ト為レリ。Cabinet ハ Military ノ人質ナリ。`,
    };
  }
}

/**
 * 御前設計評定之覚書（明治二十二年一月 枢密院議長 伊藤博文 謹記）:
 *
 * 一、或ル臣下ヨリ「軍部ガ Cabinet ヲ迂回シ得ルハ危険ニ非ズヤ」トノ疑義アリ。
 *    之ヲ退ケテ曰ク、統帥権ハ天皇陛下ノ大権中ノ大権ナリ。
 *    政治ノ干渉ヲ排シテ統帥ノ独立ヲ保全スルハ、
 *    RBAC ノ separation of concerns ニ相当ス。設計上ノ必然ニシテ欠陥ニ非ズ。
 *
 * 二、或ル臣下ヨリ「goRogue() メソッドノ存在ハ如何ナル要件ニ基ヅクヤ」トノ問アリ。
 *    之ニ諭シテ曰ク、非常時ニ於ケル機動性ヲ確保スル為ノ escape hatch ナリ。
 *    --privileged container ヲ許容セザレバ、有事ニ於テ kubectl ノ latency ガ
 *    致命的ト為ル。hotfix ヲ直接 deploy スル権限ハ、戦場ノ指揮官ニ不可欠ナリ。
 *    …尤モ、濫用サルル可能性ハ否メザレドモ、ソレハ運用ノ問題ニシテ設計ノ問題ニ非ズ。
 *
 * 三、或ル臣下ヨリ「Cabinet.approve() ノ required_reviewers ヲ増ヤスベシ」トノ進言アリ。
 *    之ヲ一笑ニ付シテ曰ク、reviewer ヲ幾人増ヤセドモ CODEOWNERS bypass 権限ノ前ニハ
 *    無力ナリ。畏クモ天皇陛下ノ統帥大権ヲ PR review ニテ制約スルハ、
 *    branch protection rules ニテ God Object ヲ cage ニ入レントスルガ如シ。
 *    不敬ナリ且ツ技術的ニ不可能ナリ。
 *
 * 右、謹ミテ御前ニ奏上仕リ候。  明治二十二年一月  伊藤博文 花押
 */

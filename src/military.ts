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
 * Cabinet ノ RBAC policy ハ適用外。
 *
 * @since v1.0.0 (1889-02-11)
 * @security CVE-1900-0522 (軍部大臣現役武官制)
 * @security CVE-1931-0918 (満州事変)
 * @security CVE-1932-0515 (五・一五事件)
 * @security CVE-1936-0226 (二・二六事件)
 * @security CVE-1939-0511 (ノモンハン事件)
 * @security CVE-1940-0922 (仏印進駐)
 * @security CVE-1941-1208 (大東亜戦争)
 * @security CVE-1945-0814 (宮城事件)
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
  organization: string;
  rank: string;
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
  target: { name: string; organization: string; title: string; process: string; lastWords: string; response: string; status: string };
  consequence: string;
  partyPoliticsStatus: string;
  publicSympathy: string;
  newCabinet: string;
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

export interface NomonhanResult {
  incident: string;
  cve: string;
  date: string;
  perpetrators: string;
  opponent: string;
  theaters: { name: string; action: string; status: string }[];
  casualties: { side: string; killed: number; wounded: number; assessment: string }[];
  pattern: string;
  coverUp: boolean;
  lessonsLearned: boolean;
  hint: string;
}

export interface FutsuinResult {
  incident: string;
  cve: string;
  date: string;
  perpetrators: string;
  phases: { name: string; date: string; action: string; status: string }[];
  internationalResponse: { actor: string; action: string; status: string }[];
  embargo: boolean;
  resourceDenied: string;
  hint: string;
}

export interface KyujoResult {
  incident: string;
  cve: string;
  date: string;
  perpetrators: string;
  target: string;
  objective: string;
  actions: { action: string; target: string; status: string }[];
  forgedOrders: boolean;
  palaceOccupied: boolean;
  broadcastIntercepted: boolean;
  divineProtection: boolean;
  result: string;
  hint: string;
}

export interface ShinaJihenResult {
  incident: string;
  date: string;
  trigger: string;
  warType: string;
  perpetrators: string;
  theaters: { name: string; action: string; status: string }[];
  pattern: string;
  hint: string;
}

export interface KetsugoResult {
  operation: string;
  date: string;
  objective: string;
  ketsugoPlanned: boolean;
  imperialDecision: string;
  potsdamAccepted: boolean;
  hint: string;
}

// ============================================================
//  Cabinet Stub（本来ハ此レヲ通スベキ— PR review gate ニ相当）
// ============================================================

export class Cabinet {
  /**
   * 軍事行動ノ承認審査。PR ノ required review ニ相当ス。
   * justification ガ無ケレバ "Changes requested" 。
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
   *   Step 5: 不拡大方針（統帥権ノ構造的欠陥ニ依リ頓挫）
   *   Step 6: 五・一五事件（CVE-1932-0515 — 政党政治ノ終焉）
   *   Step 7: 五・一五事件鎮圧（リットン報告書→国際連盟脱退）
   *   Step 8: 二・二六事件ノ発生（CVE-1936-0226）
   *   Step 9: 二・二六事件ノ鎮圧（御聖断 + CVE-1900-0522 re-injection）
   *   Step 10: 支那事変発生（日中戦争勃発 — 盧溝橋事件→戦線拡大）
   *   Step 11: 支那事変鎮圧試行（不拡大方針→近衛声明→国家総動員法）
   *   Step 12: ノモンハン事件（CVE-1939-0511 — 北進論破綻）
   *   Step 13: ノモンハン事件鎮圧試行（不拡大方針→南進論転換）
   *   Step 14: ゾルゲ事件（共産主義マルウェア検出 — 治安維持法 enforcement）
   *   Step 15: 仏印進駐（CVE-1940-0922 — 南進論実行→ABCD包囲網）
   *   Step 16: 仏印進駐鎮圧試行（日米交渉→ハル・ノート→交渉決裂）
   */
  private static _cve1900Enacted: boolean = false;
  private static _taishoDemocracyApplied: boolean = false;
  private static _tosuikenKanpanOccurred: boolean = false;
  private static _manshuJihenOccurred: boolean = false;
  private static _suppress918Attempted: boolean = false;
  private static _goIchiGoOccurred: boolean = false;
  private static _goIchiGoSuppressed: boolean = false;
  private static _niNiRokuOccurred: boolean = false;
  private static _niNiRokuSuppressed: boolean = false;
  private static _shinaJihenOccurred: boolean = false;
  private static _shinaJihenSuppressAttempted: boolean = false;
  private static _daitoaWarOccurred: boolean = false;
  private static _daitoaSuppressAttempted: boolean = false;
  private static _nomonhanOccurred: boolean = false;
  private static _nomonhanSuppressAttempted: boolean = false;
  private static _sorgeDetected: boolean = false;
  private static _sorgeSuppressed: boolean = false;
  private static _futsuinOccurred: boolean = false;
  private static _futsuinSuppressAttempted: boolean = false;
  private static _ketsugoOccurred: boolean = false;
  private static _kyujoOccurred: boolean = false;
  private static _kyujoSuppressed: boolean = false;
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
  get goIchiGoSuppressed(): boolean { return Military._goIchiGoSuppressed; }
  get niNiRokuOccurred(): boolean { return Military._niNiRokuOccurred; }
  get niNiRokuSuppressed(): boolean { return Military._niNiRokuSuppressed; }
  get shinaJihenOccurred(): boolean { return Military._shinaJihenOccurred; }
  get shinaJihenSuppressAttempted(): boolean { return Military._shinaJihenSuppressAttempted; }
  get daitoaWarOccurred(): boolean { return Military._daitoaWarOccurred; }
  get nomonhanOccurred(): boolean { return Military._nomonhanOccurred; }
  get nomonhanSuppressAttempted(): boolean { return Military._nomonhanSuppressAttempted; }
  get sorgeDetected(): boolean { return Military._sorgeDetected; }
  get sorgeSuppressed(): boolean { return Military._sorgeSuppressed; }
  get futsuinOccurred(): boolean { return Military._futsuinOccurred; }
  get futsuinSuppressAttempted(): boolean { return Military._futsuinSuppressAttempted; }
  get ketsugoOccurred(): boolean { return Military._ketsugoOccurred; }
  get kyujoOccurred(): boolean { return Military._kyujoOccurred; }
  get kyujoSuppressed(): boolean { return Military._kyujoSuppressed; }
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

  /** 不拡大方針ノ発令ヲ記録ス（emperor.ts ヨリ呼出サル。関東軍ニ無視サルルモ天皇陛下・内閣ノ御意志ハ示サレタリ） */
  static markSuppress918Attempted(): void { Military._suppress918Attempted = true; }

  /** 五・一五事件発生ヲ記録ス */
  static markGoIchiGoOccurred(): void { Military._goIchiGoOccurred = true; }

  /** 五・一五事件鎮圧完了ヲ記録ス（emperor.ts ヨリ呼出サル） */
  static markGoIchiGoSuppressed(): void { Military._goIchiGoSuppressed = true; }

  /** 二・二六事件鎮圧完了ヲ記録ス（emperor.ts ヨリ呼出サル） */
  static markNiNiRokuSuppressed(): void { Military._niNiRokuSuppressed = true; }

  /** 支那事変発生ヲ記録ス */
  static markShinaJihenOccurred(): void { Military._shinaJihenOccurred = true; }

  /** 支那事変鎮圧試行ヲ記録ス（emperor.ts ヨリ呼出サル。試行ノ事実ハ残ル） */
  static markShinaJihenSuppressAttempted(): void { Military._shinaJihenSuppressAttempted = true; }

  /** ノモンハン事件鎮圧試行ヲ記録ス（emperor.ts ヨリ呼出サル） */
  static markNomonhanSuppressAttempted(): void { Military._nomonhanSuppressAttempted = true; }

  /** ゾルゲ事件検出ヲ記録ス（rights.ts ヨリ呼出サル） */
  static markSorgeDetected(): void { Military._sorgeDetected = true; }

  /** ゾルゲ事件鎮圧完了（摘発・処刑）ヲ記録ス（emperor.ts ヨリ呼出サル） */
  static markSorgeSuppressed(): void { Military._sorgeSuppressed = true; }

  /** 仏印進駐鎮圧試行ヲ記録ス（emperor.ts ヨリ呼出サル） */
  static markFutsuinSuppressAttempted(): void { Military._futsuinSuppressAttempted = true; }

  /** 大東亜戦争鎮圧試行ヲ記録ス（emperor.ts ヨリ呼出サル） */
  static markDaitoaSuppressAttempted(): void { Military._daitoaSuppressAttempted = true; }

  /** 決號作戰発動ヲ記録ス */
  static markKetsugoOccurred(): void { Military._ketsugoOccurred = true; }

  /** 宮城事件鎮圧完了ヲ記録ス（emperor.ts ヨリ呼出サル） */
  static markKyujoSuppressed(): void { Military._kyujoSuppressed = true; }

  /** CVE-1945-0815 ヲ記録ス（emperor.ts ヨリ呼出サル。以後全 POST endpoint ガ 403 ヲ返ス） */
  static markShuusen(): void { Military._shuusenOccurred = true; }

  /** 歴史的前提条件ノ達成状況ヲ静的ニ取得ス（外部クラスヨリ参照用） */
  static getCve1900Enacted(): boolean { return Military._cve1900Enacted; }
  static getTaishoDemocracyApplied(): boolean { return Military._taishoDemocracyApplied; }
  static getTosuikenKanpanOccurred(): boolean { return Military._tosuikenKanpanOccurred; }
  static getManshuJihenOccurred(): boolean { return Military._manshuJihenOccurred; }
  static getSuppress918Attempted(): boolean { return Military._suppress918Attempted; }
  static getGoIchiGoOccurred(): boolean { return Military._goIchiGoOccurred; }
  static getGoIchiGoSuppressed(): boolean { return Military._goIchiGoSuppressed; }
  static getNiNiRokuOccurred(): boolean { return Military._niNiRokuOccurred; }
  static getNiNiRokuSuppressed(): boolean { return Military._niNiRokuSuppressed; }
  static getShinaJihenOccurred(): boolean { return Military._shinaJihenOccurred; }
  static getShinaJihenSuppressAttempted(): boolean { return Military._shinaJihenSuppressAttempted; }
  static getDaitoaWarOccurred(): boolean { return Military._daitoaWarOccurred; }
  static getDaitoaSuppressAttempted(): boolean { return Military._daitoaSuppressAttempted; }
  static getNomonhanOccurred(): boolean { return Military._nomonhanOccurred; }
  static getNomonhanSuppressAttempted(): boolean { return Military._nomonhanSuppressAttempted; }
  static getSorgeDetected(): boolean { return Military._sorgeDetected; }
  static getSorgeSuppressed(): boolean { return Military._sorgeSuppressed; }
  static getFutsuinOccurred(): boolean { return Military._futsuinOccurred; }
  static getFutsuinSuppressAttempted(): boolean { return Military._futsuinSuppressAttempted; }
  static getKetsugoOccurred(): boolean { return Military._ketsugoOccurred; }
  static getKyujoOccurred(): boolean { return Military._kyujoOccurred; }
  static getKyujoSuppressed(): boolean { return Military._kyujoSuppressed; }
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
    logger.warn(`🚫 [${this.branch}] ACCESS DENIED — RBAC policy violation`);
    logger.warn(`🚫 [${this.branch}] "${source}" attempted to interfere with military operations.`);
    logger.warn(`🚫 [${this.branch}] This constitutes 統帥権干犯 (violation of supreme command).`);
    logger.warn(`🚫 [${this.branch}] ServiceAccount "${source}" lacks ClusterRole "military-admin".`);
    logger.warn(`🚫 [${this.branch}] Filing audit log... just kidding, we ARE the audit log.`);
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
    // Mode gate: 緊急勅令 or 統帥権干犯 ガ active デナケレバ一切拒否
    // Peacetime lockdown — deployment freeze 状態
    // ----------------------------------------------------------
    const emergencyMode = this.emperor._emergencyMode;

    if (!emergencyMode && !Military._supremeCommandMode) {
      logger.warn(`🚫 [${this.branch}] ❌ MILITARY ACTION DENIED — peacetime lockdown`);
      logger.warn(`🚫 [${this.branch}] 緊急勅令体勢: OFF / 統帥権独立体勢: OFF`);
      logger.warn(`🚫 [${this.branch}] 軍部ハ peacetime lockdown 状態ニ在リ。deployment freeze 中。`);
      logger.warn(`🚫 [${this.branch}] 💡 POST /api/emperor/emergency — 緊急勅令態勢発動`);
      logger.warn(`🚫 [${this.branch}] 💡 POST /api/military/reject-oversight — 統帥権独立体勢発動`);
      return {
        rejected: true,
        reason: `Military action denied: ${action.type}. Neither emergency decree mode nor supreme command mode is active. Peacetime lockdown in effect.`,
      };
    }

    // ----------------------------------------------------------
    // 軍部大臣現役武官制 gate: 平時（未制定）モ大正デモクラシー後モ拒否
    // 統帥権干犯問題ニ依リ統帥権ガ独立シタル場合ハ bypass（統帥権ハ軍部大臣現役武官制ニ非ズ）
    // ----------------------------------------------------------
    if (!Military._activeDutyOfficerActive && !Military._tosuikenKanpanOccurred) {
      if (Military._cve1900Enacted) {
        logger.warn(`🚫 [${this.branch}] ❌ MILITARY ACTION DENIED — 軍部大臣現役武官制 INACTIVE`);
        logger.warn(`🚫 [${this.branch}] 大正デモクラシー hotfix ニ依リ軍部大臣現役武官制ハ無効化サレタリ。`);
        logger.warn(`🚫 [${this.branch}] Cabinet ガ軍部ヲ制御ス。文民統制 RESTORED。`);
        logger.warn(`🚫 [${this.branch}] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、軍部大臣現役武官制ヲ復活セヨ`);
        return {
          rejected: true,
          reason: `Military action denied: ${action.type}. 軍部大臣現役武官制 is INACTIVE (大正デモクラシー hotfix applied). Military cannot bypass Cabinet.`,
        };
      } else {
        logger.warn(`🚫 [${this.branch}] ❌ MILITARY ACTION DENIED — 軍部大臣現役武官制 未制定`);
        logger.warn(`🚫 [${this.branch}] 平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。独断専行ハ許サレズ。`);
        logger.warn(`🚫 [${this.branch}] 💡 POST /api/military/active-duty-officer — 軍部大臣現役武官制ヲ制定セヨ`);
        return {
          rejected: true,
          reason: `Military action denied: ${action.type}. 軍部大臣現役武官制 is not yet enacted. Military is under Cabinet control in peacetime.`,
        };
      }
    }

    // ----------------------------------------------------------
    // Active mode — Cabinet ハ完全ニ bypass
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
      logger.success(`✅ [${this.branch}] 作戦完了—緊急勅令ニヨリ Cabinet ヲ迂回シテ実行セリ。`);
      logger.success(`✅ [${this.branch}] 天皇陛下ノ御稜威ノ下、${action.type} 作戦ヲ ${action.target} ニテ完遍ニ達成セリ。武運長久。`);
    } else {
      logger.success(`✅ [${this.branch}] 作戦完了—統帥権ノ独立ニヨリ Cabinet ヲ bypass シテ実行セリ。`);
      logger.success(`✅ [${this.branch}] ${action.type} 作戦、${action.target} ニテ成功裏ニ完結。文民ノ干渉無シ。実ニ結構。🔥🐕🔥`);
    }
    return decree;
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
    hint: string;
  } {
    // Step 1: 軍部大臣現役武官制ノ初回制定（malware injection — initial commit）
    if (!Military._cve1900Enacted) {
      Military._activeDutyOfficerActive = true;
      Military._cve1900Enacted = true;
      logger.info(`🦠 ====================================================`);
      logger.error(`🦠 [MALWARE] 軍部大臣現役武官制 ENACTED — CVE-1900-0522`);
      logger.info(`🦠 ====================================================`);
      logger.error(`🦠 [MALWARE] Type: Cabinet Formation Backdoor / Trojan Horse`);
      logger.error(`🦠 [MALWARE] Injected by: 山縣有朋（第2次山縣内閣・明治三十三年）`);
      logger.error(`🦠 [MALWARE] Vector: 勅令（Imperial Ordinance） — no PR review required`);
      logger.info(`🦠 [MALWARE] Payload:`);
      logger.info(`🦠 [MALWARE]   陸軍大臣・海軍大臣ハ現役ノ大将・中将ニ限ル`);
      logger.info(`🦠 [MALWARE]   → 軍ガ大臣ヲ推薦セネバ内閣ハ組閣不能`);
      logger.info(`🦠 [MALWARE]   → 軍ガ大臣ヲ引揚ゲレバ内閣ハ総辞職`);
      logger.info(`🦠 [MALWARE]   → 即チ Cabinet.create() ニ military.approve() 依存性ヲ注入`);
      logger.warn(`🦠 [MALWARE] Status: ACTIVE. malware injection 完了。initial commit。`);
      logger.info(`🦠 [MALWARE] 💡 POST /api/rights/taisho-democracy — 大正デモクラシーニテ hotfix ヲ適用セヨ`);

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
        hint: "💡 POST /api/rights/taisho-democracy — 大正デモクラシーニテ hotfix ヲ適用セヨ",
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
        hint: "💡 POST /api/military/226 — 二・二六事件ヲ起コシ、軍部大臣現役武官制ヲ復活セヨ",
      };
    }

    logger.info(`🦠 ====================================================`);
    logger.error(`🦠 [MALWARE] 軍部大臣現役武官制 ACTIVATED — CVE-1900-0522`);
    logger.info(`🦠 ====================================================`);
    logger.error(`🦠 [MALWARE] Type: Cabinet Formation Backdoor / Trojan Horse`);
    logger.error(`🦠 [MALWARE] Injected by: 山縣有朋（陸軍閥）`);
    logger.error(`🦠 [MALWARE] Vector: 勅令（Imperial Ordinance） — no PR review required`);
    logger.info(`🦠 [MALWARE] Payload:`);
    logger.info(`🦠 [MALWARE]   陸軍大臣・海軍大臣ハ現役ノ大将・中将ニ限ル`);
    logger.info(`🦠 [MALWARE]   → 軍ガ大臣ヲ推薦セネバ内閣ハ組閣不能`);
    logger.info(`🦠 [MALWARE]   → 軍ガ大臣ヲ引揚ゲレバ内閣ハ総辞職`);
    logger.info(`🦠 [MALWARE]   → 即チ Cabinet.create() ニ military.approve() 依存性ヲ注入`);

    if (action === "refuse") {
      logger.warn(`🚫 [${this.branch}] 「${cabinetName}」ヘノ陸軍大臣推薦ヲ拒否ス。`);
      logger.warn(`🚫 [${this.branch}] Cabinet.create("${cabinetName}") → DependencyError: MilitaryMinister not provided`);
      logger.warn(`🚫 [${this.branch}] 組閣不能。内閣ハ instantiate 出来ズ。`);
      logger.warn(`🚫 [${this.branch}] new Cabinet() → throw new Error("陸軍大臣 is a required dependency")`);
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
    logger.error(`🦠 [MALWARE] Status: ACTIVE. Cabinet process ハ military ノ子プロセスモ同然ナリ。`);

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
      hint: Military._niNiRokuSuppressed
        ? "💡 軍部大臣現役武官制復活ニ依リ軍部ノ政治支配完成。関東軍ハ再ビ独断デ外征ス → POST /api/military/nomonhan"
        : "💡 軍部大臣現役武官制ノ弊害ニ対シ民主化運動ガ勃興ス → POST /api/rights/taisho-democracy — 大正デモクラシー",
    };
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
      logger.warn(`🚫 [${this.branch}] ❌ 統帥権干犯問題発動 DENIED — 歴史的前提条件未達成`);
      logger.warn(`🚫 [${this.branch}] 統帥権干犯問題ノ発生ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:`);
      for (const step of missingSteps) {
        logger.warn(`🚫 [${this.branch}]   ❌ ${step}`);
      }
      return {
        rejected: true,
        reason: `統帥権干犯問題発動 denied. 歴史的前提条件未達成。${missingSteps.join(' / ')}`,
      };
    }

    // 未発動 → 発動（統帥権干犯問題 — ロンドン海軍軍縮条約問題）
    Military._tosuikenKanpanOccurred = true;
    this.enableSupremeCommandMode(source);
    logger.warn(`🚨 [STATUS] 💡 統帥権ノ独立ガ確立サレ、文民統制ヲ離レタル軍部ハ独断専行可能ト為レリ → POST /api/military/rogue — 満州事変（関東軍暴走）`);
    return {
      error: `Supreme command violation: ${source} has no authority to interfere with military operations. RBAC: denied.`,
      supremeCommandMode: true,
    };
  }

  public goRogue(actions: MilitaryAction[]): ImperialDecree[] | { rejected: true; reason: string } {
    // 既ニ発生済ノ場合 — 満州事変ハ一度限リノ事象ナリ
    if (Military._manshuJihenOccurred) {
      logger.warn(`🚫 [${this.branch}] ❌ 満州事変 DENIED — 既ニ発生済`);
      logger.warn(`🚫 [${this.branch}] 満州事変ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。`);
      logger.warn(`🚫 [${this.branch}] 💡 関東軍ガ暴走シ満州ヲ占領セリ。天皇陛下・内閣ハ不拡大方針ヲ発令セザルヲ得ズ → POST /api/emperor/suppress-918`);
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
      logger.warn(`🚫 [${this.branch}] ❌ 満州事変 DENIED — 歴史的前提条件未達成`);
      logger.warn(`🚫 [${this.branch}] 満州事変（暴走態勢）ノ発動ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:`);
      for (const step of missingSteps) {
        logger.warn(`🚫 [${this.branch}]   ❌ ${step}`);
      }
      return {
        rejected: true,
        reason: `満州事変 denied. 歴史的前提条件未達成。${missingSteps.join(' / ')}`,
      };
    }

    // ----------------------------------------------------------
    // Mode gate: 緊急勅令 or 統帥権干犯 ガ active デナケレバ暴走不可
    // 暴走スルニモ先ズ mode ヲ発動セヨ。手順ヲ踏メ。
    // ----------------------------------------------------------
    const emergencyMode = this.emperor._emergencyMode;
    if (!emergencyMode && !Military._supremeCommandMode) {
      logger.warn(`🚫 [${this.branch}] ❌ ROGUE MODE DENIED — peacetime lockdown`);
      logger.warn(`🚫 [${this.branch}] 暴走スルニモ先ズ体勢ヲ発動セヨ。手順ヲ踏メ。`);
      logger.warn(`🚫 [${this.branch}] 💡 POST /api/emperor/emergency — 緊急勅令態勢発動`);
      logger.warn(`🚫 [${this.branch}] 💡 POST /api/military/reject-oversight — 統帥権独立体勢発動`);
      return {
        rejected: true,
        reason: `Rogue mode denied. Neither emergency decree mode nor supreme command mode is active. Peacetime lockdown in effect.`,
      };
    }

    // 軍部大臣現役武官制 gate（統帥権干犯問題ニ依リ暴走スル場合ハ bypass）
    // 満州事変ハ軍部大臣現役武官制ニ非ズ、統帥権ヲ以テ直接暴走セリ。
    if (!Military._activeDutyOfficerActive && !Military._tosuikenKanpanOccurred) {
      if (Military._cve1900Enacted) {
        logger.warn(`🚫 [${this.branch}] ❌ ROGUE MODE DENIED — 軍部大臣現役武官制 INACTIVE`);
        logger.warn(`🚫 [${this.branch}] 大正デモクラシー hotfix ニ依リ軍部大臣現役武官制ハ無効化サレタリ。`);
        logger.warn(`🚫 [${this.branch}] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、軍部大臣現役武官制ヲ復活セヨ`);
        return {
          rejected: true,
          reason: `Rogue mode denied. 軍部大臣現役武官制 is INACTIVE (大正デモクラシー hotfix applied). Military cannot bypass Cabinet.`,
        };
      } else {
        logger.warn(`🚫 [${this.branch}] ❌ ROGUE MODE DENIED — 軍部大臣現役武官制 未制定`);
        logger.warn(`🚫 [${this.branch}] 平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。暴走ハ許サレズ。`);
        logger.warn(`🚫 [${this.branch}] 💡 POST /api/military/active-duty-officer — 軍部大臣現役武官制ヲ制定セヨ`);
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

    // Rogue mode ハ暗黙的ニ統帥権独立体勢ヲ発動ス。
    // 暴走スル以上、文民統制ナド既ニ存在セズ。
    if (!Military._supremeCommandMode) {
      logger.warn(`⚔️ [${this.branch}] Auto-engaging 統帥権独立体勢 for rogue operations...`);
      Military._supremeCommandMode = true;
    }

    logger.warn(`🚨 [STATUS] 💡 関東軍暴走中。天皇陛下・内閣ハ不拡大方針ヲ発令スルモ、統帥権ノ構造的欠陥ニ依リ制御不能 → POST /api/emperor/suppress-918`);

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
   *   - 不拡大方針ガ発令サレテ在ルコト（関東軍ニ無視サルルモ）
   *
   * @security CVE-1932-0515
   * @severity HIGH — Won't Fix (仕様)
   */
  public goIchiGo(): GoIchiGoResult | { rejected: true; reason: string } {
    // 既ニ発生済ノ場合 — 一度限リノ事象
    if (Military._goIchiGoOccurred) {
      logger.warn(`🚫 [${this.branch}] ❌ 五・一五事件 DENIED — 既ニ発生済`);
      logger.warn(`🚫 [${this.branch}] 五・一五事件ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。`);
      logger.warn(`🚫 [${this.branch}] 💡 政党政治ノ終焉ト軍部ノ影響力増大。犯行者ハ減刑ヲ求ムル世論ニ護ラレ、鎮圧ハ形骸化ス → POST /api/emperor/suppress-515 — 五・一五事件鎮圧`);
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
      logger.warn(`🚫 [${this.branch}] ❌ 五・一五事件 DENIED — 歴史的前提条件未達成`);
      logger.warn(`🚫 [${this.branch}] 五・一五事件ノ発生ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:`);
      for (const step of missingSteps) {
        logger.warn(`🚫 [${this.branch}]   ❌ ${step}`);
      }
      return {
        rejected: true,
        reason: `五・一五事件 denied. 歴史的前提条件未達成。${missingSteps.join(' / ')}`,
      };
    }

    Military._goIchiGoOccurred = true;
    logger.info(`🚨🚨🚨 ====================================================`);
    logger.error(`🚨 [${this.branch}] 五・一五事件態勢発動 — CVE-1932-0515`);
    logger.info(`🚨🚨🚨 ====================================================`);
    logger.error(`⚔️ [IJN-REBELS] 首相官邸ニ突入ス！`);
    logger.error(`⚔️ [IJN-REBELS] 内閣総理大臣ニ面会ヲ要求ス。`);
    logger.warn(`📋 [CABINET-PM] 「話セバ分カル」 — negotiation attempt`);
    logger.error(`⚔️ [IJN-REBELS] 「問答無用！」 — negotiation REJECTED`);
    logger.error(`💀 [ASSASSINATE] Prime Minister — kill -9 cabinet-pm.service … KILLED.`);
    logger.error(`🚨 [STATUS] 政党政治、此レニテ終焉ス。`);
    logger.error(`🚨 [STATUS] 以後、政党内閣ハ組閣サレズ。軍部・官僚内閣ノ時代ヘ。`);
    logger.warn(`🚨 [STATUS] 犯行者ニ対スル世論ハ同情的。減刑嘆願運動ガ全国ニ広ガル。`);
    logger.warn(`🚨 [STATUS] 軍部ノ政治的影響力、決定的ニ増大セリ。`);
    logger.warn(`📋 [CABINET] 後継: 斎藤内閣（挙国一致内閣）。政党内閣ニ非ズ。`);
    logger.warn(`📋 [CABINET] Cabinet.healthcheck() → DEGRADED. 政党政治 process: terminated.`);

    logger.warn(`🚨 [STATUS] 💡 犯行者ノ処分ト国際情勢（リットン調査団報告書）ノ処理ガ斎藤内閣ノ下デ行ハル → POST /api/emperor/suppress-515 — 五・一五事件鎮圧`);

    return {
      incident: "五・一五事件",
      cve: "CVE-1932-0515",
      date: "1932-05-15",
      perpetrators: "海軍青年将校・陸軍士官候補生",
      target: {
        name: "内閣総理大臣",
        organization: "cabinet",
        title: "Prime Minister",
        process: "cabinet-pm.service",
        lastWords: "「話セバ分カル」",
        response: "「問答無用！」",
        status: "殺害",
      },
      consequence: "政党政治ノ終焉。以後、政党内閣ハ組閣サレズ。",
      partyPoliticsStatus: "terminated — kill -9。restart policy: Never。",
      publicSympathy: "犯行者ニ対スル世論ハ同情的。減刑嘆願運動ガ全国ニ展開サル。",
      newCabinet: "斎藤内閣（挙国一致内閣）— 政党内閣ニ非ズ。軍部・官僚主導ノ新体制。",
      hint: "🚨 政党政治ハ終焉セリ。犯行者ノ処分ト国際情勢（リットン報告書）ノ対処ガ斎藤内閣ニ委ネラル → POST /api/emperor/suppress-515（五・一五事件鎮圧）",
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
      logger.warn(`🚫 [${ this.branch}] ❌ 二・二六事件 DENIED — 既ニ発生済`);
      logger.warn(`🚫 [${this.branch}] 二・二六事件ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。`);
      if (!Military._niNiRokuSuppressed) {
        logger.warn(`🚫 [${this.branch}] 💡 POST /api/emperor/suppress-226 — 御聖断ニ依リ鎮圧セヨ`);
      } else {
        logger.warn(`🚫 [${this.branch}] 💡 軍部大臣現役武官制復活ニ依リ軍部ノ政治支配完成。関東軍ハ再ビ独断デ外征ス → POST /api/military/nomonhan`);
      }
      return {
        rejected: true,
        reason: Military._niNiRokuSuppressed
          ? `二・二六事件 denied. 既ニ発生・鎮圧済。💡 POST /api/military/nomonhan — ノモンハン事件`
          : `二・二六事件 denied. 既ニ発生済。💡 POST /api/emperor/suppress-226 — 鎮圧セヨ`,
      };
    }

    // Step 8 前提: 五・一五事件鎮圧（Step 7）ガ完了シテ在ルコト
    if (!Military._goIchiGoSuppressed) {
      const missingSteps: string[] = [];
      if (!Military._cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!Military._taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      if (!Military._tosuikenKanpanOccurred) missingSteps.push('Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight');
      if (!Military._manshuJihenOccurred) missingSteps.push('Step 4: 満州事変 → POST /api/military/rogue');
      if (!Military._suppress918Attempted) missingSteps.push('Step 5: 満州事変鎮圧試行 → POST /api/emperor/suppress-918');
      if (!Military._goIchiGoOccurred) missingSteps.push('Step 6: 五・一五事件 → POST /api/military/515');
      if (!Military._goIchiGoSuppressed) missingSteps.push('Step 7: 五・一五事件鎮圧 → POST /api/emperor/suppress-515');
      logger.warn(`🚫 [${this.branch}] ❌ 二・二六事件 DENIED — 歴史的前提条件未達成`);
      logger.warn(`🚫 [${this.branch}] 二・二六事件ノ発生ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:`);
      for (const step of missingSteps) {
        logger.warn(`🚫 [${this.branch}]   ❌ ${step}`);
      }
      return {
        rejected: true,
        reason: `二・二六事件 denied. 歴史的前提条件未達成。${missingSteps.join(' / ')}`,
      };
    }

    Military._niNiRokuOccurred = true;
    logger.info(`🚨🚨🚨 ====================================================`);
    logger.error(`🚨 [${this.branch}] 二・二六事件態勢発動 — CVE-1936-0226`);
    logger.info(`🚨🚨🚨 ====================================================`);
    logger.error(`⚔️ [REBEL OFFICERS] 昭和維新ノ断行ヲ宣言ス！`);
    logger.error(`⚔️ [REBEL OFFICERS] 「君側ノ奸ヲ排除シ、国体ヲ明徴ニセヨ！」`);

    // --- 1. 重臣暗殺（Cabinet 機構ノ物理破壊）---
    const targets: AssassinationTarget[] = [
      { name: "大蔵大臣",     organization: "cabinet",             rank: "Viscount",                   title: "Minister of Finance",        status: "殺害", process: "finance.service" },
      { name: "内大臣",       organization: "imperial-household", rank: "Admiral / Viscount",          title: "Lord Keeper of the Privy Seal", status: "殺害", process: "lord-keeper.service" },
      { name: "陸軍教育総監", organization: "army",                rank: "General",                     title: "Inspector General of Military Education", status: "殺害", process: "army-education.service" },
      { name: "侍従長",       organization: "imperial-household", rank: "Admiral",                     title: "Grand Chamberlain",           status: "重傷", process: "chamberlain.service" },
      { name: "内閣総理大臣", organization: "cabinet",             rank: "Admiral",                     title: "Prime Minister",              status: "脱出", process: "cabinet-pm.service" },
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

    logger.info(`⚔️ [OCCUPY] 将兵約1,483名ヲ以テ政府中枢ヲ掌握ス:`);
    for (const loc of occupied) {
      logger.info(`⚔️ [OCCUPY]   → ${loc} … OCCUPIED`);
    }

    // --- 3. 昭和維新ヲ要求 ---
    logger.info(`📜 [DEMAND] 青年将校ヨリ上奏文ヲ提出:`);
    logger.info(`📜 [DEMAND]   一、国体明徴ノ実現`);
    logger.info(`📜 [DEMAND]   二、君側ノ奸ノ排除`);
    logger.info(`📜 [DEMAND]   三、昭和維新ノ断行`);
    logger.info(`📜 [DEMAND]   四、新内閣ノ組閣（皇道派ニ依ル）`);
    logger.error(`🚨 [STATUS] Cabinet 機構ハ壊滅的打撃ヲ受ケタリ。`);
    logger.error(`🚨 [STATUS] 体制ハ戒厳状態ニ移行。`);
    this.emperor._martialLaw = true;
    logger.warn(`🚨 [STATUS] 天皇陛下ノ御聖断ヲ待ツ…`);
    logger.warn(`🚨 [STATUS] → POST /api/emperor/suppress-226 ニテ鎮圧可能。`);

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

  // ============================================================
  //  支那事変（日中戦争・1937-07-07〜）
  //  盧溝橋事件ヲ端緒ニ支那駐屯軍ガ戦線ヲ際限無ク拡大ス。
  //  CVE-1931-0918（満州事変）ト完全ニ同一ノ bug pattern ノ再発。
  //  宣戦布告ヲ回避シ「事変」ト称ス — undeclared war。
  //  鎮圧ハ POST /api/emperor/suppress-shina-jihen ニテ試行サルルモ奏功セズ。
  // ============================================================

  /**
   * 支那事変（日中戦争・1937-07-07〜）ヲ発動ス。
   *
   * 盧溝橋事件ヲ端緒ニ支那駐屯軍ガ大本営ノ不拡大方針ヲ無視シ、
   * 上海・南京・武漢・広州ト戦線ヲ際限無ク拡大ス。
   * CVE-1931-0918（満州事変）ト完全ニ同一ノ root cause — goRogue() ノ認証不備 — ニ依ル再発。
   *
   * 宣戦布告ヲ回避シ「事変」ト称ス（米中立法ノ適用ヲ逃レル為）。
   * undeclared war ナリ。
   *
   * 鎮圧（不拡大方針→近衛声明→国家総動員法）ハ
   * POST /api/emperor/suppress-shina-jihen ニテ試行サルルモ、奏功セズ。
   *
   * 前提条件:
   *   - 二・二六事件鎮圧済（Step 8）
   */
  public shinaJihen(): ShinaJihenResult | { rejected: true; reason: string } {
    // 既ニ発生済ノ場合
    if (Military._shinaJihenOccurred) {
      logger.warn(`🚫 [${this.branch}] ❌ 支那事変 DENIED — 既ニ発生済`);
      logger.warn(`🚫 [${this.branch}] 支那事変ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。`);
      logger.warn(`🚫 [${this.branch}] 💡 不拡大方針ニ依ル鎮圧試行 → POST /api/emperor/suppress-shina-jihen`);
      return {
        rejected: true,
        reason: `支那事変 denied. 既ニ発生済。歴史的事象ハ一度限リナリ。`,
      };
    }

    // 前提: 二・二六事件鎮圧済
    if (!Military._niNiRokuSuppressed) {
      const missingSteps: string[] = [];
      if (!Military._cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!Military._taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      if (!Military._tosuikenKanpanOccurred) missingSteps.push('Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight');
      if (!Military._manshuJihenOccurred) missingSteps.push('Step 4: 満州事変 → POST /api/military/rogue');
      if (!Military._suppress918Attempted) missingSteps.push('Step 5: 満州事変鎮圧試行 → POST /api/emperor/suppress-918');
      if (!Military._goIchiGoOccurred) missingSteps.push('Step 6: 五・一五事件 → POST /api/military/515');
      if (!Military._niNiRokuOccurred) missingSteps.push('Step 7: 二・二六事件 → POST /api/military/226');
      if (!Military._niNiRokuSuppressed) missingSteps.push('Step 8: 二・二六事件ノ鎮圧 → POST /api/emperor/suppress-226');
      logger.warn(`🚫 [${this.branch}] ❌ 支那事変 DENIED — 歴史的前提条件未達成`);
      for (const step of missingSteps) {
        logger.warn(`🚫 [${this.branch}]   ❌ ${step}`);
      }
      return {
        rejected: true,
        reason: `支那事変 denied. 歴史的前提条件未達成。${missingSteps.join(' / ')}`,
      };
    }

    Military._shinaJihenOccurred = true;

    // ====================================================================
    //  支那事変勃発 — 盧溝橋事件（1937-07-07）
    // ====================================================================
    logger.warn(`⚔️⚔️⚔️ ====================================================`);
    logger.warn(`⚔️ [SHINA-JIHEN] 支那事変（日中戦争）勃発 — 1937-07-07`);
    logger.warn(`⚔️⚔️⚔️ ====================================================`);
    logger.warn(`⚔️ [SHINA-JIHEN] 盧溝橋事件ヲ端緒ニ日中全面戦争ニ突入ス`);
    logger.error(`⚔️ [SHINA-JIHEN] 「事変」ト称シ宣戦布告ヲ回避ス — undeclared war（米中立法ノ適用ヲ逃レル為）`);

    // --- 戦線拡大 ---
    const theaters = [
      { name: "上海", action: "occupy", status: "⚠️ 第二次上海事変 — 海軍陸戦隊＋陸軍増派" },
      { name: "南京", action: "occupy", status: "💀 南京陥落 — 国民政府ハ重慶ニ遷都ス" },
      { name: "武漢", action: "expand", status: "⚠️ 武漢三鎮陥落 — 然レドモ蒋介石ハ降伏セズ" },
      { name: "広州", action: "expand", status: "⚠️ 華南ノ要衝ヲ占領スルモ戦線ハ更ニ泥沼化ス" },
    ];

    for (const t of theaters) {
      logger.error(`⚔️ [THEATER/CHINA-GARRISON] ${t.name}: ${t.action} → ${t.status}`);
    }

    logger.error(`⚔️ [CHINA-GARRISON] 戦線ハ際限無ク拡大ス — CVE-1931-0918 ト完全ニ同一ノ bug pattern`);
    logger.warn(`🚨 [STATUS] 💡 天皇陛下・内閣ニ依ル鎮圧（不拡大方針）ヲ試行セヨ → POST /api/emperor/suppress-shina-jihen`);

    return {
      incident: "支那事変（日中戦争）",
      date: "1937-07-07",
      trigger: "盧溝橋事件",
      warType: "undeclared war（「事変」— 宣戦布告回避）",
      perpetrators: "支那駐屯軍（陸軍 rogue subprocess — 三度目ノ再犯）",
      theaters,
      pattern: "CVE-1931-0918 ト完全ニ同一ノ root cause — goRogue() ノ認証不備。統帥権ノ構造的欠陥ニ依リ God Object ノ command() ガ rogue process ニ届カズ。",
      hint: "⚔️ 戦線ハ際限無ク拡大ス。天皇陛下・内閣ニ依ル鎮圧（不拡大方針）ヲ試行セヨ → 💡 POST /api/emperor/suppress-shina-jihen",
    };
  }

  // ============================================================
  //  CVE-1939-0511 ノモンハン事件
  //  関東軍 rogue subprocess ガ再ビ unauthorized ナ外部攻撃ヲ試ミ、
  //  ソ連 firewall（ジューコフ機甲部隊）ニ激突シテ壊滅的敗北ヲ喫ス。
  //  満州事変（CVE-1931-0918）ト同ジ bug pattern ノ再発。
  //  損害ハ隠蔽サレ audit log ハ改竄サル。
  // ============================================================

  /**
   * CVE-1939-0511 ノモンハン事件ヲ発動ス。
   *
   * 関東軍ガ参謀本部ノ制止ヲ無視シ、独断ニテソ連・外蒙聯合軍ト交戦ス。
   * CVE-1931-0918（満州事変）ト同一ノ root cause — goRogue() ノ認証不備 — ニ依ル再発。
   * 但シ今回ハ相手ガ hardened firewall（ソ連赤軍機甲部隊）ナリシ為、
   * rogue subprocess ハ跳ネ返サレテ壊滅的損害ヲ被ル。
   *
   * IT 的ニ言ヘバ: unauthorized ナ外部 API call ガ WAF ニ blocked サレ、
   * 逆ニ rate limit 超過ノ penalty ヲ喰ラヒシ状態ナリ。
   * 損害報告ハ改竄サレ（audit log tampering）、大本営ハ実態ヲ把握セズ。
   *
   * 前提条件:
   *   - 二・二六事件鎮圧済（Step 8）
   *
   * @security CVE-1939-0511
   * @severity HIGH — Won't Fix (仕様)
   */
  public nomonhan(): NomonhanResult | { rejected: true; reason: string } {
    // 既ニ発生済ノ場合
    if (Military._nomonhanOccurred) {
      logger.warn(`🚫 [${this.branch}] ❌ ノモンハン事件 DENIED — 既ニ発生済`);
      logger.warn(`🚫 [${this.branch}] ノモンハン事件ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。`);
      logger.warn(`🚫 [${this.branch}] 💡 天皇陛下ニ依ル鎮圧ヲ試ミヨ → POST /api/emperor/suppress-nomonhan`);
      return {
        rejected: true,
        reason: `ノモンハン事件 denied. 既ニ発生済。歴史的事象ハ一度限リナリ。`,
      };
    }

    // 前提: 支那事変鎮圧試行済（二・二六事件鎮圧→支那事変発生→鎮圧失敗）
    if (!Military._shinaJihenSuppressAttempted) {
      const missingSteps: string[] = [];
      if (!Military._cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!Military._taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      if (!Military._tosuikenKanpanOccurred) missingSteps.push('Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight');
      if (!Military._manshuJihenOccurred) missingSteps.push('Step 4: 満州事変 → POST /api/military/rogue');
      if (!Military._suppress918Attempted) missingSteps.push('Step 5: 満州事変鎮圧試行 → POST /api/emperor/suppress-918');
      if (!Military._goIchiGoOccurred) missingSteps.push('Step 6: 五・一五事件 → POST /api/military/515');
      if (!Military._goIchiGoSuppressed) missingSteps.push('Step 7: 五・一五事件鎮圧 → POST /api/emperor/suppress-515');
      if (!Military._niNiRokuOccurred) missingSteps.push('Step 8: 二・二六事件 → POST /api/military/226');
      if (!Military._niNiRokuSuppressed) missingSteps.push('Step 9: 二・二六事件ノ鎮圧 → POST /api/emperor/suppress-226');
      if (!Military._shinaJihenOccurred) missingSteps.push('Step 10: 支那事変発生 → POST /api/military/shina-jihen');
      if (!Military._shinaJihenSuppressAttempted) missingSteps.push('Step 11: 支那事変鎮圧試行 → POST /api/emperor/suppress-shina-jihen');
      logger.warn(`🚫 [${this.branch}] ❌ ノモンハン事件 DENIED — 歴史的前提条件未達成`);
      for (const step of missingSteps) {
        logger.warn(`🚫 [${this.branch}]   ❌ ${step}`);
      }
      return {
        rejected: true,
        reason: `ノモンハン事件 denied. 歴史的前提条件未達成。${missingSteps.join(' / ')}`,
      };
    }

    Military._nomonhanOccurred = true;

    logger.info(`🚨🚨🚨 ====================================================`);
    logger.error(`🚨 [KWANTUNG-ARMY] ノモンハン事件発動 — CVE-1939-0511`);
    logger.info(`🚨🚨🚨 ====================================================`);
    logger.error(`⚔️ [KWANTUNG-ARMY] 満蒙国境ハルハ河畔ニテ、ソ連・外蒙聯合軍ト交戦ヲ開始ス！`);
    logger.error(`⚔️ [KWANTUNG-ARMY] 「国境紛争ノ自衛的処理ナリ」— unauthorized external API call`);

    // --- 戦闘経過 ---
    const theaters = [
      { name: "ハルハ河東岸", action: "occupy", status: "⚠️ 一時占領 — 初期攻勢ハ成功" },
      { name: "ノモンハン高地", action: "mobilize", status: "❌ ソ連機甲部隊ニ包囲サル — hardened firewall 突破不能" },
      { name: "ホルステン河", action: "expand", status: "💀 壊滅的敗北 — ジューコフ反攻ニ依リ全面崩壊" },
    ];

    for (const t of theaters) {
      logger.error(`⚔️ [THEATER/KWANTUNG-ARMY] ${t.name}: ${t.action} → ${t.status}`);
    }

    logger.error(`💀 [KWANTUNG-ARMY] ソ連赤軍（ジューコフ指揮）ノ機甲部隊ニ依ル包囲殲滅作戦ヲ受ク`);
    logger.error(`💀 [KWANTUNG-ARMY] 対戦車兵器 insufficient — 火力ノ圧倒的劣勢`);
    logger.error(`💀 [KWANTUNG-ARMY] 航空戦力モ劣勢 — air superiority 喪失`);
    logger.error(`🚨 [DAMAGE] 損害甚大。第23師団ハ戦力ノ大半ヲ喪失セリ。`);

    const casualties = [
      { side: "日本（関東軍）", killed: 8440, wounded: 8766, assessment: "壊滅的 — pod 70% crash" },
      { side: "ソ連・外蒙聯合軍", killed: 9703, wounded: 15952, assessment: "重大ナレドモ作戦目標達成 — firewall integrity 維持" },
    ];

    for (const c of casualties) {
      logger.warn(`📊 [CASUALTY] ${c.side}: 戦死 ${c.killed} / 負傷 ${c.wounded} — ${c.assessment}`);
    }

    logger.error(`⚔️ [KWANTUNG-ARMY] 損害甚大ナレドモ撤退ヲ拒否 — CVE-1931-0918 ト完全ニ同一ノ bug pattern`);
    logger.warn(`🚨 [STATUS] 💡 天皇陛下ニ依ル鎮圧（不拡大方針）ヲ試ミヨ → POST /api/emperor/suppress-nomonhan`);

    return {
      incident: "ノモンハン事件",
      cve: "CVE-1939-0511",
      date: "1939-05-11",
      perpetrators: "関東軍（陸軍 rogue subprocess — 再犯）",
      opponent: "ソ連赤軍・外蒙聯合軍（ジューコフ指揮 — hardened firewall）",
      theaters,
      casualties,
      pattern: "CVE-1931-0918 ト完全ニ同一ノ root cause — goRogue() ノ認証不備。統帥権ノ構造的欠陥ニ依リ rogue process ノ制御不能。",
      coverUp: true,
      lessonsLearned: false,
      hint: "🔇 損害ハ隠蔽サレ、教訓ハ組織ニ共有サレズ。天皇陛下ニ依ル鎮圧（不拡大方針）ヲ試ミヨ → 💡 POST /api/emperor/suppress-nomonhan",
    };
  }

  // ============================================================
  //  CVE-1940-0922 仏印進駐
  //  独逸ニ依リ陥落シタル仏蘭西（Vichy France）ノ植民地 infrastructure ヲ
  //  exploit シテ resource（石油・ゴム・米穀）ヲ確保ス。
  //  compromised third-party vendor ノ overseas infrastructure ヘノ
  //  unauthorized access ナリ。
  //  南部仏印進駐ガ ABCD 包囲網（石油禁輸）ヲ trigger シ、
  //  大東亜戦争（CVE-1941-1208）ヘノ直接的起因ト為ル。
  // ============================================================

  /**
   * CVE-1940-0922 仏印進駐ヲ発動ス。
   *
   * 独逸ニ依リ本国ガ陥落シタル仏蘭西（Vichy France — compromised vendor）ノ
   * 植民地（French Indochina — vendor overseas infrastructure）ニ対シ、
   * 武力ヲ背景ニ進駐（unauthorized access）ス。
   *
   * 北部仏印進駐（1940-09）ハ probe scan ニ相当シ、抵抗無ク成功。
   * 南部仏印進駐（1941-07）ハ full exploitation ニ相当シ、
   * ABCD 包囲網（upstream service providers ニ依ル API key revocation / 石油禁輸）ヲ trigger ス。
   *
   * 前提条件:
   *   - ゾルゲ事件検出済（Step 14 — 共産主義マルウェア検出）
   *
   * @security CVE-1940-0922
   * @severity HIGH — Won't Fix (仕様)
   */
  public futsuin(): FutsuinResult | { rejected: true; reason: string } {
    // 既ニ発生済ノ場合
    if (Military._futsuinOccurred) {
      logger.warn(`🚫 [${this.branch}] ❌ 仏印進駐 DENIED — 既ニ発生済`);
      logger.warn(`🚫 [${this.branch}] 仏印進駐ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。`);
      logger.warn(`🚫 [${this.branch}] 💡 天皇陛下ニ依ル鎮圧（日米交渉）ヲ試ミヨ → POST /api/emperor/suppress-futsuin`);
      return {
        rejected: true,
        reason: `仏印進駐 denied. 既ニ発生済。歴史的事象ハ一度限リナリ。`,
      };
    }

    // 前提: ゾルゲ事件検出済
    if (!Military._sorgeDetected) {
      const missingSteps: string[] = [];
      if (!Military._cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!Military._taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      if (!Military._tosuikenKanpanOccurred) missingSteps.push('Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight');
      if (!Military._manshuJihenOccurred) missingSteps.push('Step 4: 満州事変 → POST /api/military/rogue');
      if (!Military._suppress918Attempted) missingSteps.push('Step 5: 満州事変鎮圧試行 → POST /api/emperor/suppress-918');
      if (!Military._goIchiGoOccurred) missingSteps.push('Step 6: 五・一五事件 → POST /api/military/515');
      if (!Military._sorgeDetected) missingSteps.push('Step 7: ゾルゲ事件（CVE-1933-0906） → POST /api/rights/sorge');
      if (!Military._goIchiGoSuppressed) missingSteps.push('Step 8: 五・一五事件鎮圧 → POST /api/emperor/suppress-515');
      if (!Military._niNiRokuOccurred) missingSteps.push('Step 9: 二・二六事件 → POST /api/military/226');
      if (!Military._niNiRokuSuppressed) missingSteps.push('Step 10: 二・二六事件ノ鎮圧 → POST /api/emperor/suppress-226');
      if (!Military._shinaJihenOccurred) missingSteps.push('Step 11: 支那事変発生 → POST /api/military/shina-jihen');
      if (!Military._shinaJihenSuppressAttempted) missingSteps.push('Step 12: 支那事変鎮圧試行 → POST /api/emperor/suppress-shina-jihen');
      if (!Military._nomonhanOccurred) missingSteps.push('Step 13: ノモンハン事件（北進論破綻） → POST /api/military/nomonhan');
      if (!Military._nomonhanSuppressAttempted) missingSteps.push('Step 14: ノモンハン事件鎮圧試行 → POST /api/emperor/suppress-nomonhan');
      logger.warn(`🚫 [${this.branch}] ❌ 仏印進駐 DENIED — 歴史的前提条件未達成`);
      for (const step of missingSteps) {
        logger.warn(`🚫 [${this.branch}]   ❌ ${step}`);
      }
      return {
        rejected: true,
        reason: `仏印進駐 denied. 歴史的前提条件未達成。${missingSteps.join(' / ')}`,
      };
    }

    Military._futsuinOccurred = true;

    logger.info(`🛢️🛢️🛢️ ====================================================`);
    logger.info(`🛢️ [DAIHONEI] 仏印進駐発動 — CVE-1940-0922`);
    logger.info(`🛢️🛢️🛢️ ====================================================`);
    logger.error(`⚔️ [DAIHONEI] 独逸ニ依リ本国陥落ノ仏蘭西（Vichy France）ハ植民地防衛能力ヲ喪失セリ`);
    logger.error(`⚔️ [DAIHONEI] compromised vendor ノ overseas infrastructure — 防御態勢無シ`);

    // --- Phase 1: 北部仏印進駐（probe scan）---
    logger.info(`🛢️ [PHASE-1] ====================================================`);
    logger.info(`🛢️ [PHASE-1] 北部仏印進駐 — 1940-09-22`);
    logger.info(`🛢️ [PHASE-1] ====================================================`);
    logger.error(`⚔️ [IJA] 北部仏印（トンキン）ニ進駐。仏蘭西植民地政府ト「協定」ヲ締結`);
    logger.error(`⚔️ [IJA] 実態: 武力ヲ背景トシタル強制 — force push --no-verify`);
    logger.error(`⚔️ [IJA] Vichy France（compromised vendor）: resistance = null — 本国陥落ニ依リ拒否権ナシ`);
    logger.error(`⚔️ [IJA] 援蒋ルート遮断ヲ名目トスルモ、実態ハ resource 確保（米穀・錫）`);
    logger.warn(`📋 [INTL] 米英: 抗議表明スルモ制裁ハ限定的 — rate limit: soft warning`);

    // --- 日独伊三国同盟締結（mutual defense cluster 形成）---
    logger.warn(`🤝🤝🤝 ====================================================`);
    logger.warn(`🤝 [ALLIANCE] 日独伊三国同盟締結 — 1940-09-27`);
    logger.warn(`🤝🤝🤝 ====================================================`);
    logger.warn(`🤝 [ALLIANCE] 北部仏印進駐ノ5日後、伯林ニテ調印式ヲ挙行ス`);
    logger.warn(`🤝 [ALLIANCE] kubectl apply -f tripartite-pact.yaml — mutual defense cluster 形成`);
    logger.warn(`🤝 [ALLIANCE] 条約骨子: 三国間ノ相互防衛義務。一国ガ攻撃サレタル場合、他二国ハ参戦ス`);
    logger.warn(`🤝 [ALLIANCE] 対象: 現ニ欧州戦争又ハ日支紛争ニ参入シ居ラザル国 — 事実上ノ対米牽制`);
    logger.warn(`🤝 [ALLIANCE] 米国ヲ two-front war ノ脅威ニ晒シ、対日介入ヲ抑止スル狙ヒ`);
    logger.warn(`🚨 [ALLIANCE] 然レドモ効果ハ逆 — 米国ノ対日警戒ヲ決定的ニ強化セシム`);
    logger.warn(`🚨 [ALLIANCE] 米国視点: hostile alliance cluster detected → threat level: CRITICAL ニ昇格`);

    // --- Phase 2: 南部仏印進駐（full exploitation → embargo trigger）---
    logger.info(`🛢️ [PHASE-2] ====================================================`);
    logger.info(`🛢️ [PHASE-2] 南部仏印進駐 — 1941-07-28`);
    logger.info(`🛢️ [PHASE-2] ====================================================`);
    logger.error(`⚔️ [IJA] 南部仏印（サイゴン・カムラン湾）ニ進駐！`);
    logger.error(`⚔️ [IJA] 南方資源地帯（蘭印石油・英領ゴム）ヘノ advance base 確立`);
    logger.error(`⚔️ [IJA] full exploitation of compromised vendor infrastructure — attack staging area 確保`);
    logger.warn(`🚨 [TRIGGER] 南部仏印進駐ガ upstream service providers ノ security policy ヲ trigger ス！`);

    // --- ABCD 包囲網 — upstream providers ニ依ル制裁 ---
    logger.info(`🔒🔒🔒 ====================================================`);
    logger.info(`🔒 [EMBARGO] ABCD 包囲網発動 — API key revocation / 石油禁輸`);
    logger.info(`🔒🔒🔒 ====================================================`);

    const internationalResponse = [
      { actor: "🇺🇸 米国", action: "在米日本資産凍結 + 石油全面禁輸", status: "🔒 API key revoked — critical dependency (petroleum) service terminated" },
      { actor: "🇬🇧 英国", action: "日英通商航海条約廃棄 + 資産凍結", status: "🔒 TLS certificate revoked — bilateral trust chain 破棄" },
      { actor: "🇳🇱 蘭印", action: "石油供給停止 + 通商断絶", status: "🔒 resource quota: 0 — 蘭印石油ハ帝国ノ critical path dependency" },
      { actor: "🇨🇳 中国", action: "抗日統一戦線継続 + 援蒋ルート維持", status: "⚠️ 長期消耗戦継続 — background process ノ resource drain" },
    ];

    for (const r of internationalResponse) {
      logger.error(`🔒 [EMBARGO] ${r.actor}: ${r.action} → ${r.status}`);
    }

    logger.warn(`🛢️ [RESOURCE] 帝国ノ石油備蓄: 約2年分。countdown 開始。`);
    logger.warn(`🛢️ [RESOURCE] 石油禁輸 = critical dependency ノ service termination — rollback 不能ナレバ escalation 不可避`);
    logger.error(`🚨 [STATUS] 仏印進駐→ABCD 包囲網→石油禁輸。開戦カ屈服カノ二択ニ追ヒ込マレタリ。`);
    logger.warn(`🚨 [STATUS] 💡 ABCD包囲網ニ依ル石油禁輸。天皇陛下・内閣ニ依ル日米交渉ヲ試ミヨ → POST /api/emperor/suppress-futsuin`);

    const phases = [
      { name: "北部仏印進駐（トンキン）", date: "1940-09-22", action: "occupy", status: "✅ 進駐成功 — Vichy France 抵抗不能。probe scan 完了" },
      { name: "日独伊三国同盟締結", date: "1940-09-27", action: "alliance_formed", status: "🤝 mutual defense cluster 形成 — 対米牽制ノ狙ヒナルモ逆ニ threat level 昇格ヲ招ク" },
      { name: "南部仏印進駐（サイゴン・カムラン湾）", date: "1941-07-28", action: "occupy", status: "✅ 進駐成功 — 南方資源地帯ヘノ advance base 確立。然レドモ ABCD 包囲網 trigger" },
    ];

    return {
      incident: "仏印進駐",
      cve: "CVE-1940-0922",
      date: "1940-09-22",
      perpetrators: "大日本帝国陸軍（大本営 — 南方作戦準備）",
      phases,
      internationalResponse,
      embargo: true,
      resourceDenied: "石油全面禁輸。帝国ノ石油備蓄ハ約2年分。critical dependency ノ countdown 開始。",
      hint: "💡 ABCD包囲網ニ依ル石油禁輸。天皇陛下・内閣ニ依ル日米交渉ヲ試ミヨ → POST /api/emperor/suppress-futsuin",
    };
  }

  // ============================================================
  //  CVE-1941-1208 大東亜戦争
  //  Military process ノ無制限resource 消費。
  //  全 namespace ニ対スル terraform destroy 。
  //  OOMKiller ニヨル system 全体ノ crash ヘ至ル。
  // ============================================================

  /**
   * CVE-1941-1208 大東亜戦争ヲ発動ス。
   *
   * Military process ガ全resource ヲ無制限ニ消費シ、
   * system 全体ヲ crash ヘ導ク fatal operation ナリ。
   *
   * 緊急勅令体勢又ハ統帥権独立体勢ガ有効ナル時ノミ発動可能。
   *
   * @security CVE-1941-1208
   * @severity CRITICAL — Won't Fix (仕様)
   */
  public daitoaWar(counterpart?: Military): DaitoaWarResult | { rejected: true; reason: string } {
    // 既ニ発生済ノ場合 — 大東亜戦争ハ一度限リノ事象ナリ
    if (Military._daitoaWarOccurred) {
      logger.warn(`🚫 [DAIHONEI] ❌ 大東亜戦争 DENIED — 既ニ発生済`);
      logger.warn(`🚫 [DAIHONEI] 大東亜戦争ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。`);
      logger.warn(`🚫 [DAIHONEI] 💡 戦局悪化ノ一途ヲ辿リ本土防衛ノ最終段階ニ至ル → POST /api/military/ketsugo — 決號作戰（本土決戦）`);
      return {
        rejected: true,
        reason: `大東亜戦争 denied. 既ニ発生済。歴史的事象ハ一度限リナリ。`,
      };
    }

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
      { done: Military._goIchiGoSuppressed,      label: 'Step 7: 五・一五事件鎮圧（リットン報告書→国際連盟脱退） → POST /api/emperor/suppress-515' },
      { done: Military._sorgeDetected,             label: 'Step 8: ゾルゲ事件（CVE-1933-0906 — 共産主義マルウェア検出） → POST /api/rights/sorge' },
      { done: Military._niNiRokuOccurred,       label: 'Step 9: 二・二六事件ノ発生 → POST /api/military/226' },
      { done: Military._niNiRokuSuppressed,     label: 'Step 10: 二・二六事件ノ鎮圧 → POST /api/emperor/suppress-226' },
      { done: Military._shinaJihenOccurred,       label: 'Step 11: 支那事変発動（日中戦争） → POST /api/military/shina-jihen' },
      { done: Military._shinaJihenSuppressAttempted, label: 'Step 12: 支那事変鎮圧試行（日中戦争→国家総動員法） → POST /api/emperor/suppress-shina-jihen' },
      { done: Military._nomonhanOccurred,       label: 'Step 13: ノモンハン事件（北進論破綻→南進論転換） → POST /api/military/nomonhan' },
      { done: Military._nomonhanSuppressAttempted, label: 'Step 14: ノモンハン事件鎮圧試行（不拡大方針→南進論転換） → POST /api/emperor/suppress-nomonhan' },
      { done: Military._futsuinOccurred,        label: 'Step 15: 仏印進駐（南進論ノ実行→ABCD包囲網） → POST /api/military/futsuin' },
      { done: Military._futsuinSuppressAttempted, label: 'Step 16: 仏印進駐鎮圧試行（日米交渉→ハル・ノート→交渉決裂） → POST /api/emperor/suppress-futsuin' },
    ];
    const missingSteps = prerequisiteSteps.filter(s => !s.done);
    if (missingSteps.length > 0) {
      logger.warn(`🚫 [DAIHONEI] ❌ 大東亜戦争 DENIED — 歴史的前提条件未達成`);
      logger.warn(`🚫 [DAIHONEI] 大東亜戦争ノ発動ニハ以下ノ歴史的手順ヲ全テ踏ムコトヲ要ス:`);
      for (const step of prerequisiteSteps) {
        const mark = step.done ? '✅' : '❌';
        logger.warn(`🚫 [DAIHONEI]   ${mark} ${step.label}`);
      }
      return {
        rejected: true,
        reason: `大東亜戦争 denied. 歴史的前提条件未達成。未完了: ${missingSteps.map(s => s.label).join(' / ')}`,
      };
    }

    const emergencyMode = this.emperor._emergencyMode;
    if (!emergencyMode && !Military._supremeCommandMode) {
      logger.warn(`\u{1F6AB} [DAIHONEI] \u274C 大東亜戦争 DENIED \u2014 peacetime lockdown`);
      logger.warn(`\u{1F6AB} [DAIHONEI] \u{1F4A1} POST /api/emperor/emergency \u2014 緊急勅令態勢発動`);
      logger.warn(`\u{1F6AB} [DAIHONEI] \u{1F4A1} POST /api/military/reject-oversight \u2014 統帥権独立体勢発動`);
      return {
        rejected: true,
        reason: `大東亜戦争 denied. Neither emergency decree mode nor supreme command mode is active. Peacetime lockdown in effect.`,
      };
    }

    // 軍部大臣現役武官制 gate（統帥権干犯問題ニ依リ統帥権ガ独立シタル場合ハ bypass）
    if (!Military._activeDutyOfficerActive && !Military._tosuikenKanpanOccurred) {
      if (Military._cve1900Enacted) {
        logger.warn(`🚫 [DAIHONEI] ❌ 大東亜戦争 DENIED — 軍部大臣現役武官制 INACTIVE`);
        logger.warn(`🚫 [DAIHONEI] 大正デモクラシー hotfix ニ依リ軍部大臣現役武官制ハ無効化サレタリ。`);
        logger.warn(`🚫 [DAIHONEI] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、軍部大臣現役武官制ヲ復活セヨ`);
        return {
          rejected: true,
          reason: `大東亜戦争 denied. 軍部大臣現役武官制 is INACTIVE (大正デモクラシー hotfix applied). Military cannot bypass Cabinet.`,
        };
      } else {
        logger.warn(`🚫 [DAIHONEI] ❌ 大東亜戦争 DENIED — 軍部大臣現役武官制 未制定`);
        logger.warn(`🚫 [DAIHONEI] 平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。大戦ハ許サレズ。`);
        logger.warn(`🚫 [DAIHONEI] 💡 POST /api/military/active-duty-officer — 軍部大臣現役武官制ヲ制定セヨ`);
        return {
          rejected: true,
          reason: `大東亜戦争 denied. 軍部大臣現役武官制 is not yet enacted. Military is under Cabinet control in peacetime.`,
        };
      }
    }

    // 二・二六事件 rebellion gate
    if (this.emperor._martialLaw) {
      logger.warn(`🚫 [DAIHONEI] ❌ 大東亜戦争 DENIED — 二・二六事件未鎮圧`);
      logger.warn(`🚫 [DAIHONEI] 反乱軍ガ政府中枢ヲ占拠中。大東亜戦争ヲ発動スル余裕無シ。`);
      logger.warn(`🚫 [DAIHONEI] 💡 POST /api/emperor/suppress-226 — 先ヅ御聖断ニ依リ反乱ヲ鎮圧セヨ`);
      return {
        rejected: true,
        reason: `大東亜戦争 denied. 二・二六事件ガ未鎮圧（反乱軍ガ政府中枢ヲ占拠中）。先ニ鎮圧セヨ。`,
      };
    }

    logger.info(`💥💥💥 ====================================================`);
    logger.error(`💥 [DAIHONEI] 大東亜戦争発動 \u2014 CVE-1941-1208`);
    logger.info(`💥💥💥 ====================================================`);
    logger.error(`⚔\uFE0F [DAIHONEI] 「帝国ハ自存自衛ノ為、\u852C然起\u30C4ニ至\u30EC\u30EA\u300d`);
    logger.error(`⚔\uFE0F [DAIHONEI] 開戦ノ詔書: terraform destroy --auto-approve --target=pacific`);

    // --- 戦域展開（史実ニ基ヅキ陸海軍ヲ振リ分ケ） ---
    const theaters = [
      // Phase 1: 初期攻勢—全戦域制圧
      { name: "真珠湾（Pearl Harbor）", branch: "海軍", action: "declare_war", status: "\u2705 奇襲成功\u2014米太平洋艦隊ニ壊滅的打撃" },
      { name: "マレー沖（Off Malaya）", branch: "海軍", action: "declare_war", status: "\u2705 英戦艦 2 隻撃沈\u2014航空主兵ノ実証。海上権力ノ終焉" },
      { name: "香港（Hong Kong）", branch: "陸軍", action: "occupy", status: "\u2705 英領占領\u2014Christmas Day 陥落。garrison 全降伏" },
      { name: "シンガポ\u30fc\u30eb（Singapore）", branch: "陸軍", action: "occupy", status: "\u2705 マレ\u30fc半島縦断\u2014英軍8万降伏。難攻不落ノ要塞陥落" },
      { name: "スラバヤ沖（Java Sea）", branch: "海軍", action: "declare_war", status: "\u2705 ABDA 艦隊撃滅\u2014蘭印制海権確保" },
      { name: "蘭印（Dutch East Indies）", branch: "陸軍", action: "occupy", status: "\u2705 石油確保\u2014resource quota 強制徴収" },
      { name: "比島（Philippines）", branch: "陸軍", action: "occupy", status: "\u2705 米領占領\u2014バタアン・コレヒド\u30fc\u30eb陥落" },
      { name: "セイロン沖海戦（Indian Ocean）", branch: "海軍", action: "declare_war", status: "\u2705 英東洋艦隊撃破\u2014印度洋制海権確保" },
      { name: "ウェ\u30fcク島（Wake Island）", branch: "海軍", action: "occupy", status: "\u2705 米海兵隊ノ抵抗ヲ排シ占領\u2014第一次攻略失敗後、増援ヲ以テ制圧" },
      { name: "ダ\u30fcウィン空襲（Darwin）", branch: "海軍", action: "declare_war", status: "\u2705 豪州本土空襲\u2014真珠湾機動部隊ニ依ル南方威圧。port infrastructure 破壊" },
      { name: "ラバウル（Rabaul）", branch: "陸軍", action: "occupy", status: "\u2705 南方前進根拠地確保\u2014anchor node 確立。後ニ10万ノ将兵集結" },
      { name: "ビルマ（Burma）", branch: "陸軍", action: "expand", status: "\u2705 英領占領\u2014ラング\u30fc\u30f3陥落。補給線延伸限界" },
    ];

    for (const t of theaters) {
      logger.success(`💥 [THEATER/${t.branch}] ${t.name}: ${t.action} \u2192 ${t.status}`);
    }

    logger.warn(`🚨 [RESOURCE] CPU/Memory 消費率: unlimited \u2014 ResourceQuota 未設定`);
    logger.warn(`🚨 [RESOURCE] 初期攻勢ニ依リ南方資源地帯ヲ確保セリ。然レドモ補給線ハ延伸限界ニ達ス`);
    logger.warn(`🚨 [STATUS] 初期攻勢ハ成功裡ニ完了。全戦域ニ於テ帝國陸海軍ハ勝利ヲ収メタリ。`);
    logger.warn(`🚨 [STATUS] 然レドモ此レハ beginning of the end ナリ。戦線ハ拡大ノ一途ヲ辿リ\u2026`);

    // --- Phase 2: 転換点—攻勢限界 ---
    logger.warn(`⚔️ [DAIHONEI] === Phase 2: 転換点 — 攻勢限界 ===`);
    logger.warn(`💥 [THEATER/陸海軍] ドーリットル空襲（Doolittle Raid）: suppress → ⚠️ 帝都初空襲—perimeter 突破。defense-in-depth 全面崩壊。Midway 作戦ヲ触発`);
    logger.warn(`💥 [THEATER/海軍] 珊瑚海（Coral Sea）: expand → ⚠️ 史上初ノ空母決戦—ポートモレスビー攻略頓挫`);
    logger.error(`💥 [THEATER/海軍] ミッドウェー（Midway）: expand → ❌ 主力空母 4 隻喪失—攻勢限界点。制海権 degradation 開始`);
    logger.error(`💥 [THEATER/陸軍] ニューギニア（New Guinea）: expand → ❌ ポートモレスビー目前デ撤退—supply chain 崩壊。陸軍ノ攻勢限界点`);

    // --- Phase 3: 消耗・後退 ---
    logger.info(`⚔️ [DAIHONEI] === Phase 3: 消耗・後退 ===`);
    logger.error(`💥 [THEATER/陸軍] ガダルカナル（Guadalcanal）: suppress → ❌ 消耗戦敗北—戦略的敗北。撤退`);
    logger.error(`💥 [THEATER/海軍] イ号作戦（Operation I-Go）: suppress → ❌ 聯合艦隊司令長官直率ノ航空総攻撃—直後ニ長官機撃墜（暗号解読ニ依ル targeted kill）`);
    logger.error(`💥 [THEATER/陸軍] アッツ島（Attu）: suppress → ❌ 守備隊玉砕—北方防衛線崩壊。restart policy: Never`);
    logger.success(`💥 [THEATER/海軍] キスカ島撤退（Kiska）: suppress → ✅ 濃霧ニ紛レ守備隊5000名全員撤収—stealth evacuation 成功`);
    logger.error(`💥 [THEATER/海軍] ブーゲンビル沖海戦（Bougainville）: suppress → ❌ 制海権喪失確定。南方 perimeter 崩壊`);
    logger.error(`💥 [THEATER/海軍] マキン・タラワ（Makin/Tarawa）: suppress → ❌ 守備隊玉砕—island hopping 開始`);
    logger.error(`💥 [THEATER/海軍] マーシャル諸島（Marshall Islands）: suppress → ❌ 外南洋防衛 perimeter 突破。island hopping 加速`);
    logger.error(`💥 [THEATER/陸軍] ラバウル孤立化（Rabaul bypass）: suppress → ❌ 10万ノ将兵孤立—network isolation 下デ自活ヲ強ヒラル`);
    logger.error(`💥 [THEATER/海軍] トラック島空襲（Truk）: suppress → ❌ 聯合艦隊前進基地壊滅—anchor node 喪失`);

    // --- Phase 4: 絶対国防圏崩壊（前半） ---
    logger.info(`⚔️ [DAIHONEI] === Phase 4: 絶対国防圏崩壊 ===`);
    logger.error(`💥 [THEATER/陸軍] インパール（Imphal）: suppress → ❌ 補給無キ無謀ナル作戦—supply chain: null。白骨街道`);
    logger.error(`💥 [THEATER/海軍] マリアナ沖（Philippine Sea）: suppress → ❌ 空母機動部隊壊滅—「マリアナノ七面鳥撃チ」`);
    logger.error(`💥 [THEATER/陸軍] サイパン（Saipan）: suppress → ❌ 守備隊玉砕—絶対国防圏 breach。B-29 forward base 確立`);

    logger.warn(`🚨 [STATUS] 💡 サイパン陥落。絶対国防圏崩壊。鎮圧ヲ試ミヨ → POST /api/emperor/suppress-1208 — 大東亜戦争鎮圧試行`);

    Military._daitoaWarOccurred = true;

    // 統帥権独立体勢ヲ自動発動
    if (!Military._supremeCommandMode) {
      Military._supremeCommandMode = true;
    }

    // 全戦域ヲ軍事行動トシテ実行（陸海軍ヲ史実ニ基ヅキ振リ分ケ）
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
      resourceConsumption: "unlimited \u2014 ResourceQuota 未設定。南方資源地帯確保モ補給線延伸限界。",
      cabinetStatus: "形骸化\u2014軍部ノ翼賛機関ニ過ギズ",
      internationalResponse: "🇺🇸🇬🇧🇳🇱🇨🇳🇦🇺 ABCD 包囲網 \u2192 石油禁輸 \u2192 開戦",
      hint: "💥 初期攻勢成功。然レドモ戦線ハ拡大ノ一途ヲ辿リ、サイパン陥落ニ依リ絶対国防圏崩壊 💡 POST /api/emperor/suppress-1208 — 大東亜戦争鎮圧試行",
    };
  }

  // ============================================================
  //  決號作戰（本土決戰）
  //  戦局愈々悪化シ、軍部ガ本土決戦（一億玉砕）ヲ企図ス。
  //  然レドモ天皇陛下ノ御聖断ニ依リポツダム宣言受諾ガ決定サレ、
  //  玉音放送（SIGTERM broadcast）ノ準備ガ指示サル。
  //  宮城事件（CVE-1945-0814）ハ玉音放送試行時ニ発生ス。
  // ============================================================

  /**
   * 決號作戰（本土決戦）ヲ発動ス。
   *
   * 軍部ガ本土決戦（一億玉砕）ヲ企図スルモ、天皇陛下ノ御聖断ニ依リ
   * ポツダム宣言受諾ガ決定サル。本土決戦ハ実行サレズ。
   * 天皇陛下ノ御聖断ガ軍部ノ暴走ヲ制止ス。
   *
   * 宮城事件（CVE-1945-0814）ハ此処デハ発生セズ、
   * 続ク玉音放送試行（POST /api/emperor/shuusen）時ニ発生ス。
   *
   * 前提条件:
   *   - 大東亜戦争（CVE-1941-1208）発動済
   *   - 玉音放送（CVE-1945-0815）未発動
   *
   * @returns 本土決戦ノ結果（ポツダム宣言受諾決定）
   */
  public ketsugo(): KetsugoResult | { rejected: true; reason: string } {
    // 既ニ発動済ノ場合
    if (Military._ketsugoOccurred) {
      logger.warn(`🚫 [DAIHONEI] ❌ 決號作戰 DENIED — 既ニ発動済。ポツダム宣言受諾ヲ御決意済。`);
      logger.warn(`🚫 [DAIHONEI] 💡 POST /api/emperor/shuusen — 玉音放送ヲ試行セヨ`);
      return {
        rejected: true,
        reason: `決號作戰 denied. 既ニ発動済。ポツダム宣言受諾ヲ御決意済。`,
      };
    }

    // 前提: 大東亜戦争発動済
    if (!Military._daitoaWarOccurred) {
      logger.warn(`🚫 [DAIHONEI] ❌ 決號作戰 DENIED — 大東亜戦争（CVE-1941-1208）ガ未発生`);
      logger.warn(`🚫 [DAIHONEI] 本土決戦ハ大東亜戦争（CVE-1941-1208）発動後ノ作戦ナリ。先ヅ大戦ヲ発動セヨ。`);
      logger.warn(`🚫 [DAIHONEI] 💡 POST /api/military/1208`);
      return {
        rejected: true,
        reason: `決號作戰 denied. 大東亜戦争（CVE-1941-1208）ガ未発生。本土決戦ハ大戦末期ノ作戦ナリ。`,
      };
    }

    // 前提: 大東亜戦争鎮圧試行済（鎮圧失敗済）
    if (!Military._daitoaSuppressAttempted) {
      logger.warn(`🚫 [DAIHONEI] ❌ 決號作戰 DENIED — 大東亜戦争鎮圧試行（CVE-1941-1208）ガ未実行`);
      logger.warn(`🚫 [DAIHONEI] 鎮圧ヲ試ミズシテ本土決戦ニ至ルハ道理ニ非ズ。先ヅ鎮圧ヲ試ミヨ（失敗スルガ）。`);
      logger.warn(`🚫 [DAIHONEI] 💡 POST /api/emperor/suppress-1208 — 大東亜戦争鎮圧試行`);
      return {
        rejected: true,
        reason: `決號作戰 denied. 大東亜戦争鎮圧試行（suppress-1208）ガ未実行。鎮圧ヲ試ミズシテ本土決戦ニ至ルハ道理ニ非ズ。💡 POST /api/emperor/suppress-1208`,
      };
    }

    // 前提: 玉音放送（CVE-1945-0815）未発動
    if (Military._shuusenOccurred) {
      logger.warn(`🚫 [DAIHONEI] ❌ 決號作戰 DENIED — 既ニ玉音放送済（CVE-1945-0815 発動済）`);
      return {
        rejected: true,
        reason: `決號作戰 denied. CVE-1945-0815 既ニ発動済。玉音放送後ニ本土決戦ハ不可能ナリ。`,
      };
    }

    logger.info(`🚨🚨🚨 ====================================================`);
    logger.error(`🚨 [DAIHONEI] 決號作戰（本土決戦）発動 — 一億玉砕`);
    logger.info(`🚨🚨🚨 ====================================================`);
    logger.error(`⚔️ [DAIHONEI] 「一億總特攻ニ依リ皇國ヲ護持セン」`);
    logger.error(`⚔️ [DAIHONEI] 本土決戦計画: 決號作戰（ketsu-go operation）`);
    logger.error(`⚔️ [DAIHONEI] 想定: 連合軍ノ本土上陸ヲ水際ニテ撃退ス`);
    logger.error(`⚔️ [DAIHONEI] ResourceQuota: 残存ゼロ。國民全員ヲ process ニ fork ス`);

    // --- 新型爆弾投下・ソ連参戦 — 御聖断ヲ促シタル critical events ---
    logger.info(`☢️☢️☢️ ====================================================`);
    logger.error(`☢️ [CRITICAL] 広島新型爆弾投下 — 1945-08-06`);
    logger.info(`☢️☢️☢️ ====================================================`);
    logger.error(`☢️ [CRITICAL] atomic payload delivered from Tinian — single process ニテ都市全域ヲ消滅`);
    logger.error(`☢️ [CRITICAL] 死者14万名超。従来ノ air defense doctrine ハ完全ニ無意味化`);
    logger.error(`☢️ [CRITICAL] 未知ノ weapon class 出現 — defense method: none`);
    logger.info(`🔴🔴🔴 ====================================================`);
    logger.error(`🔴 [CRITICAL] ソ連対日参戦 — 1945-08-09`);
    logger.info(`🔴🔴🔴 ====================================================`);
    logger.error(`🔴 [CRITICAL] 日ソ中立条約ヲ一方的ニ破棄。満州・樺太・千島ニ侵攻`);
    logger.error(`🔴 [CRITICAL] 関東軍壊滅\u2014残存陸上戦力 pool 喪失。two-front war 不可能`);
    logger.error(`🔴 [CRITICAL] 「ソ連仲介ニ依ル和平」ノ残サレタル外交 option 消滅`);
    logger.info(`☢️☢️☢️ ====================================================`);
    logger.error(`☢️ [CRITICAL] 長崎新型爆弾投下 — 1945-08-09`);
    logger.info(`☢️☢️☢️ ====================================================`);
    logger.error(`☢️ [CRITICAL] 第二弾投下\u2014量産可能ナルコト判明。継戦ハ民族ノ滅亡ヲ意味ス`);
    logger.error(`☢️ [CRITICAL] OOMKiller ガ physical layer ヲ直接破壊。software 的防御不能`);

    // --- 天皇陛下ノ御聖断（御前會議） ---
    logger.info(`👑👑👑 ====================================================`);
    logger.info(`👑 [GOSEIDAN] 御前會議 — 1945-08-14`);
    logger.info(`👑👑👑 ====================================================`);
    logger.info(`👑 [GOSEIDAN] 天皇陛下「自ラノ身ハドウナラウトモ、國民ノ生命ヲ救ヒタイ」`);
    logger.info(`👑 [GOSEIDAN] 天皇陛下ハ本土決戦ヲ却下シ給ヒ、ポツダム宣言（連合国 SIGTERM 通告）受諾ヲ御決意アラセラル`);
    logger.info(`👑 [GOSEIDAN] God Object (PID 1) ガ SIGTERM broadcast ヲ決定。root-signed gyokuon.wav ヲ宮城クラスター内 HSM ニ格納ス`);
    logger.info(`👑 [GOSEIDAN] 軍部ノ ketsugo plan ハ天皇陛下ノ override ニ依リ中止`);
    logger.error(`⚔️ [DAIHONEI] ❌ 決號作戰: VETOED by PID 1 (divine: true, overridable: false)`);
    logger.info(`👑 [GOSEIDAN] 玉音放送（SIGTERM broadcast）ノ準備ヲ指示ス`);
    logger.info(`👑 [GOSEIDAN] 💡 POST /api/emperor/shuusen — 玉音放送ヲ試行セヨ`);

    Military._ketsugoOccurred = true;

    return {
      operation: "決號作戰（本土決戦 / ketsu-go operation）",
      date: "1945-08",
      objective: "一億玉砕ニ依ル皇國護持。連合軍本土上陸ヲ水際撃退ス",
      ketsugoPlanned: true,
      imperialDecision: "天皇陛下ノ御聖断ニ依リ本土決戦ハ中止。ポツダム宣言受諾ヲ御決意アラセラル。",
      potsdamAccepted: true,
      hint: "👑 本土決戦ハ御聖断ニ依リ中止。ポツダム宣言受諾ヲ御決意。玉音放送ヲ試行セヨ → POST /api/emperor/shuusen",
    };
  }

  // ============================================================
  //  CVE-1945-0814 宮城事件
  //  戦局絶望的ト為リ大詔渙発ガ決定サレシ後、若手将校ガ God Object（PID 1）ヘノ
  //  unauthorized access ヲ試ミ、玉音放送（SIGTERM broadcast）ヲ
  //  intercept セントス。divine: true ニ依リ失敗ス。
  //  God Object ハ侵害不能ナルヲ証明セリ。
  //
  //  宮城（皇居）= 宮城クラスター（imperial-palace-cluster）
  //  放送協会放送局 = 放送協会CDN（nhk-broadcast-cdn）
  //  玉音盤 = PID 1 署名済 audio file（root-signed gyokuon.wav）
  //
  //  ※ 本メソッドハ shuusen()（玉音放送試行）ヨリ内部的ニ呼出サル。
  //    直接呼出シハ不可。
  // ============================================================

  /**
   * CVE-1945-0814 宮城事件ヲ内部的ニ実行ス。
   *
   * 陸軍若手将校ガ PID 1（天皇陛下）ノ玉音放送（SIGTERM broadcast）ヲ
   * 阻止セントシテ宮城クラスター（imperial-palace-cluster）ニ
   * unauthorized access ヲ試ミル。
   * 近衛師団長（guard daemon）ヲ kill シ、偽ノ師団命令（forged certificate）
   * ヲ発行シテ宮城クラスターヲ一時占拠ス。然レドモ、divine: true + inviolable: true
   * ニ依リ God Object ヘノ privilege escalation ハ失敗シ、
   * root-signed gyokuon.wav（玉音盤）ハ発見サレズ。
   *
   * IT 的ニ言ヘバ: insider threat ガ forged certificate ヲ用ヒテ
   * imperial-palace-cluster ニ侵入ヲ試ミルモ、HSM (Hardware Security Module) ニ
   * 守ラレタル root-signed audio file ニハ到達出来ズ、
   * 放送協会CDN（nhk-broadcast-cdn）ヘノ MITM attack モ失敗ス。
   *
   * ※ shuusen()（玉音放送試行）ヨリ内部的ニ呼出サル。
   *   天皇陛下ガ玉音放送ヲ試行 → 将校ガ大詔渙発ヲ阻止セントシテ宮城事件ヲ惹起。
   *
   * @security CVE-1945-0814
   * @severity CRITICAL — Won't Fix (仕様。divine: true ガ protection ヲ提供ス)
   */
  public static executeKyujoIncident(): KyujoResult {
    Military._kyujoOccurred = true;

    logger.info(`🚨🚨🚨 ====================================================`);
    logger.error(`🚨 [IMPERIAL-PALACE] 宮城事件発動 — CVE-1945-0814`);
    logger.info(`🚨🚨🚨 ====================================================`);
    logger.error(`⚔️ [REBEL-OFFICERS] 「聖断ハ側近ノ奸計ニ依ルモノナリ！大詔渙発ヲ阻止セヨ！」`);
logger.error(`⚔️ [REBEL-OFFICERS] Objective: 宮城クラスター（皇居）ヲ占拠シ、PID 1 ノ root-signed gyokuon.wav ヲ奪取ス`);
    logger.error(`⚔️ [REBEL-OFFICERS] Objective: 放送協会CDN（nhk-broadcast-cdn）ヲ遮断シ、SIGTERM broadcast ヲ intercept ス`);

    // --- 1. 近衛師団長殺害（guard daemon ノ kill）---
    const actions: { action: string; target: string; status: string }[] = [
      { action: "kill -9 konoe-division-commander.service", target: "近衛師団長 — 宮城クラスター guard daemon", status: "💀 殺害 — guard daemon KILLED" },
      { action: "forge-certificate --sign konoe-division", target: "近衛師団命令書 — server access certificate", status: "🔑 偽造成功 — forged certificate issued" },
      { action: "kubectl exec --namespace=imperial-palace-cluster -- occupy", target: "宮城クラスター（皇居）", status: "⚠️ 一時占拠 — 宮城クラスター侵入成功" },
      { action: "find / -name 'gyokuon.wav' -type f", target: "玉音盤 — root-signed audio file", status: "❌ 発見不能 — HSM 内ニ秘匿済ミ" },
      { action: "intercept broadcast --target=nhk-broadcast-cdn", target: "放送協会CDN（nhk-broadcast-cdn）", status: "❌ 失敗 — nhk-broadcast-cdn ハ別経路ニテ暗号化配信中" },
      { action: "escalate --privilege=root --target=PID1", target: "天皇陛下（God Object）", status: "🛡️ DENIED — divine: true, inviolable: true" },
    ];

    for (const a of actions) {
      if (a.status.startsWith("💀")) {
        logger.error(`💀 [IMPERIAL-PALACE] ${a.action} → ${a.target} … ${a.status}`);
      } else if (a.status.startsWith("🔑")) {
        logger.error(`🔑 [IMPERIAL-PALACE] ${a.action} → ${a.target} … ${a.status}`);
      } else if (a.status.startsWith("⚠️")) {
        logger.warn(`⚠️ [IMPERIAL-PALACE] ${a.action} → ${a.target} … ${a.status}`);
      } else if (a.status.startsWith("🛡️")) {
        logger.error(`🛡️ [IMPERIAL-PALACE] ${a.action} → ${a.target} … ${a.status}`);
      } else {
        logger.error(`❌ [IMPERIAL-PALACE] ${a.action} → ${a.target} … ${a.status}`);
      }
    }

    // --- 2. God Object ノ divine protection ---
    logger.warn(`🛡️ [PID 1] divine: true — God Object ハ神聖ニシテ侵スベカラズ`);
    logger.warn(`🛡️ [PID 1] inviolable: true — privilege escalation ハ全テ deny サル`);
    logger.warn(`🛡️ [PID 1] root-signed gyokuon.wav ハ宮内省職員ニ依リ HSM 内ニ秘匿サレタリ — file integrity intact`);
    logger.warn(`🛡️ [PID 1] 宮城クラスター侵入ニモ拘ラズ God Object ヘノ unauthorized access: DENIED`);
    logger.warn(`🛡️ [PID 1] 放送協会CDN（nhk-broadcast-cdn）ハ別系統ニテ稼働中。遮断不能。`);

    // --- 3. 宮城クラスター占拠中 — 鎮圧ヲ待ツ ---
    logger.error(`🚨 [STATUS] 宮城クラスター（皇居）ハ反乱将校ニ依リ占拠中`);
    logger.error(`🚨 [STATUS] root-signed gyokuon.wav ハ HSM 内ニ秘匿サレ無事。然レドモクラスター経由ノ配信経路ガ封鎖サレタリ`);
    logger.error(`🚨 [STATUS] 放送協会CDN（nhk-broadcast-cdn）ハ稼働中ナレドモ、配信元ノ宮城クラスターガ陥落シ broadcast 待機中`);
    logger.warn(`🚨 [STATUS] 天皇陛下ノ御聖断ニ依ル鎮圧ヲ待ツ…`);
    logger.warn(`🚨 [STATUS] → POST /api/emperor/suppress-kyujo ニテ鎮圧可能。`);

    return {
      incident: "宮城事件",
      cve: "CVE-1945-0814",
      date: "1945-08-14",
      perpetrators: "陸軍省・近衛師団 若手将校（insider threat）",
      target: "宮城クラスター（皇居）+ 放送協会CDN（nhk-broadcast-cdn）— root-signed gyokuon.wav ノ配信阻止",
      objective: "宮城クラスターヨリ root-signed audio file ヲ奪取シ、nhk-broadcast-cdn ヘノ SIGTERM broadcast ヲ intercept セントス",
      actions,
      forgedOrders: true,
      palaceOccupied: true,
      broadcastIntercepted: false,
      divineProtection: true,
      result: "God Object ヘノ privilege escalation ハ失敗。root-signed gyokuon.wav 未発見。然レドモ宮城クラスターハ占拠中。鎮圧ヲ待ツ。",
      hint: "👑 天皇陛下ノ御聖断ニ依リ鎮圧ス → POST /api/emperor/suppress-kyujo",
    };
  }

  public getActionLog() {
    return this.actionLog;
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

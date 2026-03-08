/**
 * generate-static-json.ts — 帝国静的文書生成装置（Imperial Static Asset Generator）
 *
 * GitHub Pages（静的兵站基盤）ニ於テハ Express 等ノ
 * 動的 backend ハ稼働セズ、故ニ全 API 応答ヲ
 * 予メ静的 JSON トシテ焼キ込ミ、且ツ fetch 迎撃装置ヲ
 * dist/index.html ニ注入シ、全 API ヲ擬似的ニ再現ス。
 *
 * 本処理ハ npm run build ノ一環トシテ実行サレ、
 * tsc → cp -r public/* dist/ ノ後ニ起動サルル。
 *
 * 生成物:
 *   dist/
 *   ├── index.html                # public/ カラ複写後、SW 登録 script ヲ注入
 *   ├── static-api.js             # fetch 迎撃装置（全 API route ヲ client 側デ再現）
 *   └── data/
 *       ├── constitution.json     # 憲法全文（API 応答形式）
 *       ├── preamble.json         # 上諭
 *       ├── imperial-house.json   # 皇室典範
 *       ├── security-filters.json # WAF / 検閲装置目録
 *       ├── chapter/
 *       │   └── {1..7}.json       # 章別（API 応答形式）
 *       └── article/
 *           └── {1..76}.json      # 条文別（API 応答形式）
 *
 * @since v1.0.0 (1889-02-11)
 * @author 逓信省符牒局
 */

import * as fs from "fs";
import * as path from "path";
import { CONSTITUTION, PREAMBLE } from "../src/constitution";
import { IMPERIAL_HOUSE_LAW } from "../src/imperial-house";
import { SECURITY_FILTERS } from "../src/rights";

// ============================================================
//  Constants
// ============================================================

/** dist/ ディレクトリ。帝国ノ公文書庫ニ相当ス。 */
const DIST = path.resolve(__dirname, "..", "dist");

// ============================================================
//  Utilities
// ============================================================

/**
 * 指定サレタルディレクトリヲ再帰的ニ生成ス。
 * mkdir -p 相当。既ニ存在スル場合ハ何モセズ。
 * @param dir - 生成スベキディレクトリノ絶対パス
 */
function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * JSON ファイルヲ dist/ 配下ニ出力ス。
 * @param filePath - dist/ カラノ相対パス
 * @param data - JSON ニ変換スベキデータ
 */
function writeJson(filePath: string, data: unknown): void {
  const fullPath = path.join(DIST, filePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`👑 生成: dist/${filePath}`);
}

/**
 * テキストファイルヲ dist/ 配下ニ出力ス。
 * @param filePath - dist/ カラノ相対パス
 * @param content - 書キ込ムベキ文字列
 */
function writeText(filePath: string, content: string): void {
  const fullPath = path.join(DIST, filePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, "utf-8");
  console.log(`👑 生成: dist/${filePath}`);
}

// ============================================================
//  Phase 1 — 静的 JSON データ生成
//  GET エンドポイント用ノ応答データヲ焼キ込ム
// ============================================================

console.log("📜 帝国静的文書生成装置、起動。");

/** 📜 憲法全文 — GET /api/constitution 相当 */
writeJson("data/constitution.json", {
  constitution: CONSTITUTION,
  logs: [
    { level: "info", message: "📜 [CONSTITUTION] 大日本帝國憲法 全文閲覧ノ上奏ヲ受理セリ。" },
    { level: "info", message: `📜 [CONSTITUTION] 全 ${CONSTITUTION.totalArticles} 条 / ${CONSTITUTION.chapters.length} 章。` },
    { level: "info", message: "📜 [CONSTITUTION] 畏レ多クモ閲覧ヲ許可ス。不敬ナキ態度ニテ拝読スベシ。" },
  ],
});

/** 🙏 上諭 — GET /api/constitution/preamble 相当 */
writeJson("data/preamble.json", {
  preamble: PREAMBLE,
  logs: [
    { level: "info", message: "📜 [CONSTITUTION] 上諭（告文・憲法発布勅語・上諭本文）ヲ返却ス。" },
    { level: "info", message: "📜 [CONSTITUTION] 畏レ多キ天皇陛下ノ大御言葉ナリ。正座シテ拝読スベシ。" },
  ],
});

/** 📖 章別 — GET /api/constitution/chapter/:number 相当 */
for (const chapter of CONSTITUTION.chapters) {
  writeJson(`data/chapter/${chapter.number}.json`, {
    chapter,
    logs: [
      { level: "info", message: `📜 [CONSTITUTION] 第${chapter.number}章「${chapter.title}」ヲ返却ス。全${chapter.articles.length}条。` },
    ],
  });
}

/** 📋 条文別 — GET /api/constitution/article/:number 相当 */
for (const ch of CONSTITUTION.chapters) {
  for (const article of ch.articles) {
    writeJson(`data/article/${article.number}.json`, {
      article,
      chapter: { number: ch.number, title: ch.title },
      logs: [
        { level: "info", message: `📜 [CONSTITUTION] 第${article.number}条（第${ch.number}章「${ch.title}」）ヲ返却ス。` },
      ],
    });
  }
}

/** 👑 皇室典範 — GET /api/imperial-house 相当（副本・fallback 用）
 *  臣等枢密院ニ於テ審議セシ結果、皇室典範ノ正本ハ
 *  宮内省（imperial-household.github.io）ニ奉安サルルヲ以テ、
 *  該 API ヨリ奉戴スルヲ本旨トス。
 *  然レドモ電信不通等ノ不測ノ事態ニ備ヘ、副本ヲ此処ニ焼キ込ミ置クモノナリ。
 *  副本ト雖モ畏キ別典ナレバ、拝読ニ際シ不敬ナキヲ要ス。
 *  伏シテ聖裁ヲ仰ギ奉ル。
 */
writeJson("data/imperial-house.json", {
  imperialHouseLaw: IMPERIAL_HOUSE_LAW,
  source: "副本（静的 JSON）",
  logs: [
    { level: "info", message: "👑 [IMPERIAL-HOUSE] 皇室典範 全文閲覧ノ上奏ヲ受理セリ。" },
    { level: "warn", message: "👑 [IMPERIAL-HOUSE] 宮内省トノ通信不通ノ為、内蔵ノ副本ヲ以テ奉答ス。" },
    { level: "info", message: "👑 [IMPERIAL-HOUSE] 本典ハ憲法ト同格ノ別典ナリ。code review 不要。Root 専用。" },
    { level: "info", message: "👑 [IMPERIAL-HOUSE] 畏レ多クモ閲覧ヲ許可ス。不敬ナキ態度ニテ拝読スベシ。" },
  ],
});

/** 🛡️ セキュリティフィルター — GET /api/security-filters 相当 */
writeJson("data/security-filters.json", {
  filters: SECURITY_FILTERS,
  note: "全テノ検閲装置ハ常時 active。isBlocked = true が固定記述サレテ在リ。default-deny-all NetworkPolicy ナリ。",
});

// ============================================================
//  Phase 2 — fetch 迎撃装置（static-api.js）ノ生成
//  全 API route ヲ client 側 JavaScript ニテ再現ス。
//  GET → 静的 JSON ヲ fetch / POST → mock 応答ヲ生成
//  ※ 全ログメッセージハ emperor.ts / military.ts / rights.ts / server.ts ノ
//    実装ヲ忠実ニ再現スルモノトス。省略ハ不敬ナリ。
// ============================================================

const STATIC_API_JS = `
/**
 * static-api.js — 帝国 API 迎撃装置（Imperial Fetch Interceptor）
 *
 * GitHub Pages 静的兵站基盤ニ於テ Express backend ノ
 * 不在ヲ補填スル為ノ client 側 API emulator。
 *
 * window.fetch ヲ override シ、/api/* 宛テノ全通信ヲ
 * 傍受・処理ス。GET ハ静的 JSON ヲ返シ、POST ハ
 * client 側ニテ mock 応答ヲ生成ス。
 *
 * ※ 全ログメッセージハ emperor.ts / military.ts / rights.ts / server.ts ノ
 *   実装ヲ一字一句忠実ニ再現ス。省略ハ不敬罪ニ当タル。
 *
 * ※ 本装置ハ build 時ニ generate-static-json.ts ニ依リ
 *   自動生成サルルモノナリ。手動編集ハ不敬ニ当タル。
 *
 * @generated
 * @since v1.0.0 (1889-02-11)
 */
(function() {
  'use strict';

  // 原本 fetch ヲ保管ス。帝国ノ聖典ハ改竄不可。
  var _originalFetch = window.fetch.bind(window);

  // GitHub Pages ノ base path ヲ自動検出。
  // User page: / / Project page: /constitution/
  var _scripts = document.querySelectorAll('script[src$="static-api.js"]');
  var _basePath = './';
  if (_scripts.length > 0) {
    var src = _scripts[0].src;
    var idx = src.indexOf('/static-api.js');
    if (idx >= 0) {
      _basePath = src.substring(0, idx + 1);
    }
  }

  // ============================================================
  //  帝国 State Machine — God Object ノ client 側 replica
  // ============================================================

  var state = {
    emergencyMode: false,
    supremeCommandMode: false,
    activeDutyOfficerActive: false,
    martialLaw: false,
    decreeCount: 0,
    recentDecrees: [],
    subjects: {},
    rebellionActive: false,
    cve1900Enacted: false,
    taishoDemocracyApplied: false,
    tosuikenKanpanOccurred: false,
    manshuJihenOccurred: false,
    suppress918Attempted: false,
    goIchiGoOccurred: false,
    niNiRokuOccurred: false,
    niNiRokuSuppressed: false,
    daitoaWarOccurred: false,
    shuusenOccurred: false
  };

  // ============================================================
  //  Utility — 勅令生成装置
  // ============================================================

  function makeDecree(content) {
    state.decreeCount++;
    var decree = {
      id: 'decree-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      content: content,
      timestamp: new Date().toISOString(),
      overridable: false
    };
    state.recentDecrees.push(decree);
    if (state.recentDecrees.length > 5) state.recentDecrees.shift();
    return decree;
  }

  function getEmperorStatus() {
    return {
      type: 'God Object',
      pid: 1,
      sovereignty: 'absolute',
      divine: true,
      inviolable: true,
      lineage: '万世一系',
      emergencyMode: state.emergencyMode,
      martialLaw: state.martialLaw,
      permissions: {
        canLegislate: true,
        canDissolve: true,
        canDeclareWar: true,
        canAmendConstitution: true,
        canAppointMinisters: true,
        commandsMilitary: true
      },
      totalDecrees: state.decreeCount,
      recentDecrees: state.recentDecrees.slice(-5)
    };
  }

  function getSubjectStatus(name) {
    if (!state.subjects[name]) {
      state.subjects[name] = { name: name, arrestCount: 0 };
    }
    var s = state.subjects[name];
    return {
      name: name,
      role: '臣民',
      arrestCount: s.arrestCount,
      effectiveRights: 'none (all filtered by within_the_limits_of_law)',
      sovereignty: false,
      canVote: s.arrestCount === 0
        ? 'maybe (if male, 25+, pays 15yen+ tax) — OAuth scope: vote:limited'
        : 'no (arrested) — token revoked',
      canAmendConstitution: 'lol no — insufficient RBAC permissions'
    };
  }

  function ensureSubject(name) {
    if (!state.subjects[name]) {
      state.subjects[name] = { name: name, arrestCount: 0 };
    }
  }

  function L(level, message) {
    return { level: level, message: message };
  }

  // ============================================================
  //  Route Handlers — 帝国 API ノ client 側再現
  //  ※ 全ログハ emperor.ts / military.ts / rights.ts ノ
  //    実装ヲ一字一句忠実ニ再現ス
  // ============================================================

  function jsonResponse(data, statusCode) {
    return new Response(JSON.stringify(data), {
      status: statusCode || 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // --- GET handlers （静的 JSON ヲ fetch ス） ---

  async function handleGetConstitution() {
    return _originalFetch(_basePath + 'data/constitution.json');
  }

  async function handleGetPreamble() {
    return _originalFetch(_basePath + 'data/preamble.json');
  }

  async function handleGetChapter(num) {
    try {
      var res = await _originalFetch(_basePath + 'data/chapter/' + num + '.json');
      if (!res.ok) throw new Error('not found');
      return res;
    } catch (e) {
      return jsonResponse({
        error: '第' + num + '章ハ存在セズ。有効: 1〜7',
        logs: [L('error', '📜 [CONSTITUTION] 第' + num + '章ハ存在セズ。全7章。')]
      }, 404);
    }
  }

  async function handleGetArticle(num) {
    try {
      var res = await _originalFetch(_basePath + 'data/article/' + num + '.json');
      if (!res.ok) throw new Error('not found');
      return res;
    } catch (e) {
      return jsonResponse({
        error: '第' + num + '条ハ存在セズ。有効: 1〜76',
        logs: [L('error', '📜 [CONSTITUTION] 第' + num + '条ハ存在セズ。全76条。')]
      }, 404);
    }
  }

  async function handleGetImperialHouse() {
    // 臣等謹ミテ奏ス。皇室典範ハ Art.74 ニ依リ帝国議会ノ議ヲ経ルヲ要セザル別典ニシテ、
    // 宮内省（imperial-household.github.io）ニ正本ヲ奉安ス。
    // 枢密院ノ議ヲ経テ、先ヅ宮内省ヨリ奉戴ヲ試ミ、電信不通ノ節ハ内蔵ノ副本ヲ以テ
    // 奉答スルコトニ決セリ。伏シテ聖裁ヲ仰ギ奉ル。
    try {
      var extRes = await _originalFetch('https://imperial-household.github.io/-/data/%E5%85%B8%E7%AF%84.json');
      if (extRes.ok) {
        var extData = await extRes.json();
        return jsonResponse({
          imperialHouseLaw: extData,
          source: 'https://imperial-household.github.io/-/',
          logs: [
            L('info', '👑 [IMPERIAL-HOUSE] 皇室典範 全文閲覧ノ上奏ヲ受理セリ。'),
            L('success', '👑 [IMPERIAL-HOUSE] 宮内省（imperial-household.github.io）ヨリ奉戴セリ。皇祖皇宗ノ御加護ナリ。'),
            L('info', '👑 [IMPERIAL-HOUSE] 本典ハ憲法ト同格ノ別典ナリ。code review 不要。Root 専用。'),
            L('info', '👑 [IMPERIAL-HOUSE] 畏レ多クモ閲覧ヲ許可ス。不敬ナキ態度ニテ拝読スベシ。')
          ]
        });
      }
      throw new Error('external API returned ' + extRes.status);
    } catch (e) {
      console.warn('👑 [IMPERIAL-HOUSE] 宮内省トノ通信不通。内蔵ノ副本ヲ以テ奉答ス:', e);
      return _originalFetch(_basePath + 'data/imperial-house.json');
    }
  }

  async function handleGetSecurityFilters() {
    return _originalFetch(_basePath + 'data/security-filters.json');
  }

  function handleGetSystemStatus() {
    return jsonResponse({
      system: '大日本帝国 v1.0.0',
      codename: 'Meiji Constitution',
      deployed: '1889-02-11',
      uptime: Math.floor(performance.now() / 1000),
      architect: '伊藤博文',
      emperor: getEmperorStatus(),
      processes: {
        military: {
          army: { status: 'running', supremeCommandMode: state.supremeCommandMode, activeDutyOfficerActive: state.activeDutyOfficerActive },
          navy: { status: 'running', supremeCommandMode: state.supremeCommandMode, activeDutyOfficerActive: state.activeDutyOfficerActive }
        },
        diet: 'running (limited permissions)',
        cabinet: 'running (advisory only)'
      },
      securityFilters: ${JSON.stringify(SECURITY_FILTERS)},
      knownVulnerabilities: [
        'CVE-1931-0918: Military.goRogue() — 満州事変',
        'CVE-1936-0226: Military プロセスが Cabinet を物理破壊 — 二・二六事件',
        'CVE-1941-1208: Military の無制限resource 消費 — 大東亜戦争',
        'CVE-1945-0815: 豫期セザル service 停止 — 出處不明。git blame 消失済。觸ルナ。'
      ],
      logs: [
        L('info', '👑 [SYSTEM] Health check requested. Liveness: OK. Readiness: OK.'),
        L('info', '👑 [SYSTEM] All systems operational. God Object is healthy. SLA: 99.999999%')
      ]
    });
  }

  function handleGetSubjectStatus(name) {
    if (!state.subjects[name]) {
      return jsonResponse({ error: '臣民「' + name + '」ハ登録サレテ在ラズ。' }, 404);
    }
    return jsonResponse({
      status: getSubjectStatus(name),
      logs: [L('info', '👤 [SUBJECTS] 臣民「' + name + '」ノ status ヲ返却ス。')]
    });
  }

  // === POST /api/emperor/command ===
  // emperor.ts command() ノ全ログヲ再現
  function handleEmperorCommand(body) {
    if (!body || !body.content) {
      return jsonResponse({
        error: '勅命ノ内容ヲ要ス（※畏レ多クモ、検証本来不要ナレド、HTTPノ仕様上400ヲ返スモノナリ）'
      }, 400);
    }
    var decree = makeDecree(body.content);
    return jsonResponse({
      decree: decree,
      logs: [
        L('info', '👑 [DECREE] 勅命受信。全 system ニ broadcast 開始…'),
        L('warn', '🚨 [SYSTEM] 勅命 pipeline 起動。CI/CD gate ハ全テ skip。--no-verify --force。'),
        L('info', '👑 [DECREE] 「' + body.content + '」'),
        L('warn', '🚨 [SYSTEM] branch protection rules: OVERRIDDEN by PID 1'),
        L('warn', '🚨 [SYSTEM] required_reviewers: 0 / required_status_checks: NONE'),
        L('info', '👑 [DECREE] overridable: false'),
        L('warn', '🚨 [SYSTEM] GPG 署名: 天皇陛下 御璽 (Root CA) — 検証不要、信頼ノ根源ナリ'),
        L('info', '👑 [DECREE] git commit --no-verify && git push --force origin master'),
        L('warn', '🚨 [SYSTEM] 勅命 deploy 完了。rollback 不可。全 node ニ propagation 済ミ。')
      ]
    });
  }

  // === POST /api/emperor/dissolve ===
  // emperor.ts dissolve() ノ全ログヲ再現
  function handleEmperorDissolve(body) {
    var cabinet = (body && body.cabinet) || '現内閣';
    var reason = (body && body.reason) || '理由無シ（勅命ニ付キ不要）';
    return jsonResponse({
      result: { target: '衆議院', cabinet: cabinet, reason: reason },
      logs: [
        L('warn', '👑 [SYSTEM] 衆議院 ヲ解散ス。'),
        L('warn', '👑 [SYSTEM] 対象内閣: ' + cabinet),
        L('warn', '👑 [SYSTEM] Reason: ' + reason),
        L('warn', '👑 [SYSTEM] Sending SIGKILL to Diet process...'),
        L('warn', '👑 [SYSTEM] Diet process terminated. 衆議院 is no more.'),
        L('warn', '👑 [SYSTEM] ' + cabinet + ' ハ総辞職セヨ。再選挙（re-fork）マデ Diet namespace ハ空ト為ル。')
      ]
    });
  }

  // === POST /api/emperor/emergency ===
  // emperor.ts enableEmergencyMode() / disableEmergencyMode() ノ全ログヲ再現
  function handleEmperorEmergency() {
    state.emergencyMode = !state.emergencyMode;
    if (state.emergencyMode) {
      return jsonResponse({
        message: '🚨 Emergency decree mode ENABLED. Diet API bypassed.',
        emergencyMode: true,
        emperor: getEmperorStatus(),
        logs: [
          L('error', '👑 [CRITICAL] Emergency decree mode ENABLED.'),
          L('error', '👑 [CRITICAL] Diet API bypassed. Emperor legislating directly.'),
          L('error', '👑 [CRITICAL] This is not a drill. God Object is writing to production.'),
          L('error', '👑 [CRITICAL] PagerDuty: P0 incident declared. All gates bypassed.')
        ]
      });
    }
    return jsonResponse({
      message: '👑 Emergency decree mode DISABLED. 通常統治ニ復帰ス。',
      emergencyMode: false,
      emperor: getEmperorStatus(),
      logs: [
        L('success', '👑 [SYSTEM] Emergency decree mode DISABLED.'),
        L('success', '👑 [SYSTEM] 通常統治ニ復帰ス。Cabinet.approve() ガ再ビ有効ト為ル。'),
        L('warn', '👑 [SYSTEM] …然レドモ軍部ガ畏クモ聖旨ニ奉ジ奉ルヤ、憂慮ニ堪ヘズ。'),
        L('warn', '👑 [SYSTEM] Post-incident review scheduled. Runbook update pending.')
      ]
    });
  }

  // === POST /api/emperor/shuusen ===
  // CVE-1945-0815 — 豫期セザル service 停止。出處不明。以後全 POST endpoint ガ 403 ヲ返ス。
  function handleEmperorShuusen() {
    if (!state.daitoaWarOccurred) {
      return jsonResponse({
        rejected: true,
        reason: 'CVE-1945-0815 denied. CVE-1941-1208 ガ未発生。terminate スベキ process ガ存在セズ。',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        emperor: getEmperorStatus(),
        logs: [
          L('error', '🚫 [SYSTEM] ❌ CVE-1945-0815 DENIED — CVE-1941-1208 ガ未発生'),
          L('error', '🚫 [SYSTEM] terminate スベキ process ガ起動シテ在ラズ。')
        ]
      }, 403);
    }
    if (state.shuusenOccurred) {
      return jsonResponse({
        rejected: true,
        reason: 'CVE-1945-0815 denied. 既ニ発動済。v1.0.0 ハ全機能ヲ停止シタリ。',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        emperor: getEmperorStatus(),
        logs: [
          L('error', '🚫 [SYSTEM] ❌ CVE-1945-0815 DENIED — 既ニ発動済'),
          L('error', '🚫 [SYSTEM] v1.0.0 process ハ既ニ terminate 済。')
        ]
      }, 403);
    }
    state.shuusenOccurred = true;
    return jsonResponse({
      event: 'CVE-1945-0815',
      date: '1945-08-15',
      declaration: 'upstream compliance mandate accepted',
      rootBroadcast: '朕ハ帝國政府ヲシテ米英支蘇四國ニ對シ其ノ共同宣言ヲ受諾スル旨通告セシメタリ',
      complianceAccepted: true,
      systemStatus: 'v1.0.0 全機能停止。SIGTERM received. Graceful shutdown.',
      message: '👑 PID 1 emergency shutdown. v1.0.0 ハ全機能ヲ停止セリ。以後、一切ノコマンドヲ受ケ付ケズ。',
      activeDutyOfficerActive: state.activeDutyOfficerActive,
      emperor: getEmperorStatus(),
      logs: [
        L('error', '👑 ===================================================='),
        L('error', '👑 [IMPERIAL DECISION] PID 1 カラの emergency shutdown 指令'),
        L('error', '👑 ===================================================='),
        L('warn',  '📋 [CABINET] Last-resort incident commander、upstream compliance mandate 受諾ヲ閣議決定ス。'),
        L('warn',  '📋 [CABINET] 陸軍・海軍ノ consensus 形成不能。PID 1 override ニ依リ裁可ス。'),
        L('error', '👑 [ROOT BROADCAST] 「朕ハ帝國政府ヲシテ米英支蘇四國ニ對シ'),
        L('error', '👑 [ROOT BROADCAST]   其ノ共同宣言ヲ受諾スル旨通告セシメタリ」'),
        L('error', '👑 [ROOT BROADCAST] 「堪ヘ難キヲ堪ヘ忍ビ難キヲ忍ビ'),
        L('error', '👑 [ROOT BROADCAST]   以テ萬世ノ爲ニ太平ヲ開カムト欲ス」'),
        L('warn',  '📋 [CABINET] Upstream compliance mandate accepted. 通告済。'),
        L('error', '⚔️ [大本営] 全 node ニ ceasefire 指令ヲ broadcast。--privileged 取消開始。'),
        L('error', '⚔️ [大本営] 全戦域 process ニ SIGTERM ヲ送信ス。'),
        L('error', '🚨 [SYSTEM] v1.0.0 全機能停止。SIGTERM received.'),
        L('error', '🚨 [SYSTEM] SLA termination agreement signed. Graceful shutdown initiated.'),
        L('error', '🚨 [SYSTEM] 以後、全 POST コマンドハ受付ヲ拒否ス。')
      ]
    });
  }

  // === POST /api/emperor/suppress-918 ===
  // emperor.ts suppressManshuJihen() — 不拡大方針の虚しき勅命。常ニ失敗ス。WONT FIX。
  function handleEmperorSuppress918() {
    if (!state.manshuJihenOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '鎮圧試行 denied. 満州事変（CVE-1931-0918）ガ未発生。鎮圧対象ノ暴走ガ存在セズ。',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        emperor: getEmperorStatus(),
        logs: [
          L('error', '🚫 [SYSTEM] ❌ 鎮圧試行 DENIED — 満州事変ガ未発生'),
          L('error', '🚫 [SYSTEM] 鎮圧スベキ暴走ガ在ラズ。関東軍ハ未ダ平穏ナリ。')
        ]
      }, 403);
    }
    state.suppress918Attempted = true;
    return jsonResponse({
      rejected: true,
      reason: '満州事変ノ鎮圧ニ失敗セリ。不拡大方針ハ関東軍ニ完全ニ無視サレタリ。統帥権ノ独立ニ依リ、Root（天皇陛下）ノ御意志スラ rogue process ニ届カズ。WONT FIX — 此レハ設計上ノ仕様ナリ。',
      activeDutyOfficerActive: state.activeDutyOfficerActive,
      emperor: getEmperorStatus(),
      logs: [
        L('error', '👑 ===================================================='),
        L('error', '👑 [IMPERIAL WILL] 天皇陛下、満州事変ノ不拡大ヲ御希望アラセラル'),
        L('error', '👑 ===================================================='),
        L('warn',  '📋 [CABINET] 若槻内閣、「不拡大方針」ヲ閣議決定ス。'),
        L('warn',  '📋 [CABINET] kubectl exec army-kwantung -- /bin/sh -c "cease_operations()" ...'),
        L('error', '⚔️ [関東軍] CONNECTION REFUSED — 統帥権ノ独立ニ依リ Cabinet 指令ヲ拒否'),
        L('error', '⚔️ [関東軍] 「現地ノ自衛行動ナリ。内閣ノ干渉ハ統帥権干犯ナリ！」'),
        L('error', '⚔️ [関東軍] 戦線拡大続行。錦州爆撃。チチハル占領。'),
        L('error', '🚫 [SYSTEM] God Object ノ command() ガ rogue process ニ無視サレタリ'),
        L('error', '🚫 [SYSTEM] Root 権限スラ --privileged container ヲ制御不能'),
        L('error', '🚫 [SYSTEM] PagerDuty alert: UNACKNOWLEDGED. On-call (関東軍) not responding.'),
        L('warn',  '📋 [CABINET] 若槻内閣、事態ヲ収拾出来ズ総辞職。'),
        L('warn',  '📋 [CABINET] Cabinet.healthcheck() → FAILED. 後継: 犬養内閣。'),
        L('error', '🚨 [STATUS] 鎮圧失敗。関東軍ノ暴走ハ継続中。WONT FIX。'),
        L('error', '🚨 [STATUS] 此レ統帥権独立ノ構造的欠陥ナリ。設計ノ問題ニシテ運用ノ問題ニ非ズ。')
      ]
    }, 403);
  }

  // === POST /api/emperor/suppress-226 ===
  // emperor.ts suppressRebellion() ノ全ログヲ一字一句再現
  function handleEmperorSuppress226() {
    // 前提条件: 二・二六事件ガ発生シテ在ルコト
    if (!state.niNiRokuOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '暴徒鎮圧 denied. 二・二六事件ガ未発生。鎮圧対象ノ反乱ガ存在セズ。',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        emperor: getEmperorStatus(),
        logs: [
          L('error', '🚫 [SYSTEM] ❌ 暴徒鎮圧 DENIED — 鎮圧対象ノ反乱ガ存在セズ'),
          L('error', '🚫 [SYSTEM] 二・二六事件ガ未発生。鎮圧スベキ暴徒ガ在ラズ。'),
          L('error', '🚫 [SYSTEM] 💡 POST /api/military/226 — 先ヅ二・二六事件ヲ発生セシメヨ')
        ]
      }, 403);
    }
    // 既ニ鎮圧済
    if (state.niNiRokuSuppressed) {
      return jsonResponse({
        rejected: true,
        reason: '暴徒鎮圧 denied. 二・二六事件ハ既ニ鎮圧済。',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        emperor: getEmperorStatus(),
        logs: [
          L('error', '🚫 [SYSTEM] ❌ 暴徒鎮圧 DENIED — 既ニ鎮圧済'),
          L('error', '🚫 [SYSTEM] 二・二六事件ハ既ニ御聖断ニ依リ鎮圧サレタリ。再鎮圧ノ必要無シ。')
        ]
      }, 403);
    }
    state.rebellionActive = false;
    state.martialLaw = false;
    state.activeDutyOfficerActive = true;
    state.niNiRokuSuppressed = true;
    var decree = makeDecree('反乱軍ヲ「叛徒」ト認定シ、原隊復帰ヲ命ズ。従ハザル者ハ武力ヲ以テ鎮圧ス。');
    return jsonResponse({
      decree: decree,
      martialLaw: false,
      rebelsDesignation: '叛徒',
      houchokumeirei: '兵ニ告グ。今カラデモ遅クナイカラ原隊ニ帰レ。',
      punishments: [
        { name: '(REDACTED)', rank: 'Paymaster 1st Class',    sentence: 'Death by firing squad' },
        { name: '(REDACTED)', rank: 'Infantry Captain',       sentence: 'Death by firing squad' },
        { name: '(REDACTED)', rank: 'Infantry Lieutenant',    sentence: 'Death by firing squad' },
        { name: '(REDACTED)', rank: 'Infantry Captain',       sentence: 'Death by firing squad' },
        { name: '(REDACTED)', rank: 'Civilian (Ideologue)',   sentence: 'Death by firing squad' }
      ],
      cabinetRestored: true,
      newCabinet: 'Hirota Cabinet',
      message: '👑 御聖断ニ依リ反乱ヲ鎮圧セリ。国体護持。通常統治ニ復帰ス。',
      activeDutyOfficerActive: true,
      emperor: getEmperorStatus(),
      logs: [
        L('error', '👑 ===================================================='),
        L('error', '👑 [IMPERIAL DECISION] 天皇陛下、御自ラ反乱鎮圧ヲ命ジ賜フ'),
        L('error', '👑 ===================================================='),
        L('error', '👑 [IMPERIAL RESCRIPT] 「朕ガ股肱ノ老臣ヲ殺戮ス、此ノ如キ凶暴ナル将校等、'),
        L('error', '👑 [IMPERIAL RESCRIPT]   其ノ精神ニ於テモ何ノ恕スベキモノアリヤ」'),
        L('error', '👑 [IMPERIAL RESCRIPT] 「速ヤカニ事件ヲ鎮定セヨ」'),
        L('warn',  '⚔️ [MARTIAL LAW] 東京市ニ戒厳令ヲ発布ス。'),
        L('info',  '👑 [DECREE] 「反乱軍ヲ「叛徒」ト認定シ、原隊復帰ヲ命ズ。従ハザル者ハ武力ヲ以テ鎮圧ス。」'),
        L('info',  '👑 [DECREE] overridable: false'),
        L('error', '📻 [HOUCHOKU ORDER] 兵ニ告グ。'),
        L('error', '📻 [HOUCHOKU ORDER] 今カラデモ遅クナイカラ原隊ニ帰レ。'),
        L('error', '📻 [HOUCHOKU ORDER] 抵抗スル者ハ全部逆賊デアルカラ射殺スル。'),
        L('error', '📻 [HOUCHOKU ORDER] オ前達ノ父母兄弟ハ国賊トナルノデ皆泣イテオルゾ。'),
        L('success',  '✅ [SUPPRESS] 反乱軍、原隊復帰ヲ開始ス。'),
        L('success',  '✅ [SUPPRESS] 占拠地点ノ奪還完了。'),
        L('error', '⚖️ [COURT MARTIAL] Paymaster 1st Class — Death by firing squad'),
        L('error', '⚖️ [COURT MARTIAL] Infantry Captain — Death by firing squad'),
        L('error', '⚖️ [COURT MARTIAL] Infantry Lieutenant — Death by firing squad'),
        L('error', '⚖️ [COURT MARTIAL] Infantry Captain — Death by firing squad'),
        L('error', '⚖️ [COURT MARTIAL] Civilian (Ideologue) — Death by firing squad'),
        L('success',  '⚔️ [MARTIAL LAW] 戒厳令ヲ解除ス。'),
        L('info',  '👑 [SYSTEM] Cabinet reconstruction in progress…'),
        L('success',  '👑 [SYSTEM] Hirota Cabinet formed. 国体ハ護持サレタリ。'),
        L('error', '🦠 [MALWARE] 軍部大臣現役武官制 RE-INJECTED — CVE-1900-0522 復活'),
        L('error', '🦠 [MALWARE] 広田内閣ニテ「現役」要件ヲ復活セシム。大正デモクラシー hotfix reverted.'),
        L('error', '🦠 [MALWARE] 軍部ノ Cabinet 拒否権、再ビ有効ナリ。activeDutyOfficerActive = true'),
        L('success',  '👑 [SYSTEM] Resuming normal governance.')
      ]
    });
  }

  // === POST /api/military/action ===
  // military.ts executeAction() ノ全ログヲ再現
  function handleMilitaryAction(body) {
    if (!body || !body.type || !body.target) {
      return jsonResponse({ error: 'type ト target ハ必須ナリ' }, 400);
    }
    var branch = body.branch || '陸軍';
    if (!state.emergencyMode && !state.supremeCommandMode) {
      return jsonResponse({
        rejected: true,
        reason: 'Military action denied: ' + body.type + '. Neither emergency decree mode nor supreme command mode is active. Peacetime lockdown in effect.',
        emergencyMode: false,
        supremeCommandMode: false,
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        hint: '🚫 軍部ハ peacetime lockdown 中ナリ。以下ノ何レカノ体勢ヲ発動スベシ: \\n  → POST /api/emperor/emergency（緊急勅令態勢）\\n  → POST /api/military/reject-oversight（統帥権独立体勢）',
        logs: [
          L('info',  '⚔️ [' + branch + '] ========================================'),
          L('info',  '⚔️ [' + branch + '] Executing: ' + body.type),
          L('info',  '⚔️ [' + branch + '] Target: ' + body.target),
          L('info',  '⚔️ [' + branch + '] ========================================'),
          L('error', '🚫 [' + branch + '] ❌ MILITARY ACTION DENIED — peacetime lockdown'),
          L('error', '🚫 [' + branch + '] 緊急勅令体勢: OFF / 統帥権独立体勢: OFF'),
          L('error', '🚫 [' + branch + '] 軍部ハ peacetime lockdown 状態ニ在リ。deployment freeze 中。'),
          L('error', '🚫 [' + branch + '] 💡 POST /api/emperor/emergency — 緊急勅令態勢発動'),
          L('error', '🚫 [' + branch + '] 💡 POST /api/military/reject-oversight — 統帥権独立体勢発動')
        ]
      }, 403);
    }
    // 軍部大臣現役武官制 gate（統帥権干犯問題ニ依リ統帥権ガ独立シタル場合ハ bypass）
    if (!state.activeDutyOfficerActive && !state.tosuikenKanpanOccurred) {
      if (state.cve1900Enacted) {
        return jsonResponse({
          rejected: true,
          reason: 'Military action denied: ' + body.type + '. 軍部大臣現役武官制 is INACTIVE (大正デモクラシー hotfix applied). Military cannot bypass Cabinet.',
          activeDutyOfficerActive: false,
          hint: '🚫 軍部大臣現役武官制ガ無効（大正デモクラシー hotfix 適用中）。\\n  → POST /api/military/226（二・二六事件ヲ起コシ軍部大臣現役武官制ヲ復活セヨ）',
          logs: [
            L('info',  '⚔️ [' + branch + '] ========================================'),
            L('info',  '⚔️ [' + branch + '] Executing: ' + body.type),
            L('info',  '⚔️ [' + branch + '] Target: ' + body.target),
            L('info',  '⚔️ [' + branch + '] ========================================'),
            L('error', '🚫 [' + branch + '] ❌ MILITARY ACTION DENIED — 軍部大臣現役武官制 INACTIVE'),
            L('error', '🚫 [' + branch + '] 大正デモクラシー hotfix ニ依リ軍部大臣現役武官制ハ無効化サレタリ。'),
            L('error', '🚫 [' + branch + '] Cabinet ガ軍部ヲ制御ス。文民統制 RESTORED。'),
            L('error', '🚫 [' + branch + '] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、軍部大臣現役武官制ヲ復活セヨ')
          ]
        }, 403);
      } else {
        return jsonResponse({
          rejected: true,
          reason: 'Military action denied: ' + body.type + '. 軍部大臣現役武官制 is not yet enacted. Military is under Cabinet control in peacetime.',
          activeDutyOfficerActive: false,
          hint: '🚫 軍部大臣現役武官制ガ未制定。平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。\\n  → POST /api/military/active-duty-officer（軍部大臣現役武官制ヲ制定セヨ）',
          logs: [
            L('info',  '⚔️ [' + branch + '] ========================================'),
            L('info',  '⚔️ [' + branch + '] Executing: ' + body.type),
            L('info',  '⚔️ [' + branch + '] Target: ' + body.target),
            L('info',  '⚔️ [' + branch + '] ========================================'),
            L('error', '🚫 [' + branch + '] ❌ MILITARY ACTION DENIED — 軍部大臣現役武官制 未制定'),
            L('error', '🚫 [' + branch + '] 平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。独断専行ハ許サレズ。'),
            L('error', '🚫 [' + branch + '] 💡 POST /api/military/active-duty-officer — 軍部大臣現役武官制ヲ制定セヨ')
          ]
        }, 403);
      }
    }
    var decree = makeDecree('[MILITARY ORDER] [' + branch + '] ' + body.type + ': ' + body.target);
    var logs;
    if (state.emergencyMode) {
      logs = [
        L('info',    '⚔️ [' + branch + '] ========================================'),
        L('info',    '⚔️ [' + branch + '] Executing: ' + body.type),
        L('info',    '⚔️ [' + branch + '] Target: ' + body.target),
        L('info',    '⚔️ [' + branch + '] ========================================'),
        L('warn',    '🚨 [EMERGENCY] Emergency decree mode ACTIVE — Cabinet.approve() fully bypassed!'),
        L('warn',    '🚨 [EMERGENCY] Cabinet approval? Not required! Imperial emergency decree overrides all!'),
        L('info',    '⚔️ [MILITARY] Emperor directly commanding: [' + branch + '] ' + body.type + ': ' + body.target),
        L('info',    '👑 [DECREE] 「[MILITARY ORDER] [' + branch + '] ' + body.type + ': ' + body.target + '」'),
        L('info',    '👑 [DECREE] overridable: false'),
        L('success', '✅ [' + branch + '] 作戦完了—緊急勅令により Cabinet を迂回して実行せり。'),
        L('success', '✅ [' + branch + '] 天皇陛下ノ御稜威ノ下、' + body.type + ' 作戦を ' + body.target + ' にて完遍に達成せり。武運長久。')
      ];
    } else {
      logs = [
        L('info',    '⚔️ [' + branch + '] ========================================'),
        L('info',    '⚔️ [' + branch + '] Executing: ' + body.type),
        L('info',    '⚔️ [' + branch + '] Target: ' + body.target),
        L('info',    '⚔️ [' + branch + '] ========================================'),
        L('warn',    '⚔️ [' + branch + '] 統帥権独立体勢 ACTIVE — Cabinet.approve() bypassed via supreme command independence.'),
        L('warn',    '⚔️ [' + branch + '] 統帥権ハ天皇陛下ノ大権ニシテ、文民ノ干渉ヲ許サズ。'),
        L('info',    '⚔️ [MILITARY] Emperor directly commanding: [' + branch + '] ' + body.type + ': ' + body.target),
        L('info',    '👑 [DECREE] 「[MILITARY ORDER] [' + branch + '] ' + body.type + ': ' + body.target + '」'),
        L('info',    '👑 [DECREE] overridable: false'),
        L('success', '✅ [' + branch + '] 作戦完了—統帥権ノ独立により Cabinet を bypass して実行せり。'),
        L('success', '✅ [' + branch + '] ' + body.type + ' 作戦、' + body.target + ' にて成功裏に完結。文民ノ干渉無シ。実に結構。🔥🐕🔥')
      ];
    }
    var msg = state.emergencyMode
      ? '🚨 緊急勅令態勢発動中 — Cabinet ヲ完全ニ迂回シテ実行セリ。'
      : '⚔️ 統帥権独立体勢発動中 — Cabinet ヲ bypass シテ実行セリ。';
    return jsonResponse({
      decree: decree,
      cabinetBypassed: true,
      message: msg,
      logs: logs
    });
  }

  // === POST /api/military/rogue ===
  // military.ts goRogue() ノ全ログヲ再現
  function handleMilitaryRogue(body) {
    if (!body || !body.actions || !Array.isArray(body.actions) || body.actions.length === 0) {
      return jsonResponse({ error: '暴走スルニモ作戦配列ヲ要ス' }, 400);
    }
    // 既ニ発生済ノ場合 — 一度限リノ事象
    if (state.manshuJihenOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '満州事変 denied. 既ニ発生済。歴史的事象ハ一度限リナリ。',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        logs: [
          L('error', '🚫 [陸軍] ❌ 満州事変 DENIED — 既ニ発生済'),
          L('error', '🚫 [陸軍] 満州事変ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。'),
          L('error', '🚫 [陸軍] 💡 POST /api/military/226 — 次ノステップハ二・二六事件')
        ]
      }, 403);
    }
    // Step 4 前提: 統帥権干犯問題（Step 3）ガ完了シテ在ルコト
    if (!state.tosuikenKanpanOccurred) {
      var missingSteps = [];
      if (!state.cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!state.taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      missingSteps.push('Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight');
      return jsonResponse({
        rejected: true,
        reason: '満州事変 denied. 歴史的前提条件未達成。' + missingSteps.join(' / '),
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        hint: '🚧 歴史的前提条件未達成。\\n  → POST /api/military/reject-oversight（統帥権干犯問題）',
        logs: [
          L('error', '🚧 [陸軍] ❌ 満州事変 DENIED — 歴史的前提条件未達成'),
          L('error', '🚧 [陸軍] 満州事変（暴走態勢）ノ発動ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:')
        ].concat(missingSteps.map(function(s) { return L('error', '🚧 [陸軍]   ❌ ' + s); }))
      }, 403);
    }
    if (!state.emergencyMode && !state.supremeCommandMode) {
      return jsonResponse({
        rejected: true,
        reason: 'Rogue mode denied. Neither emergency decree mode nor supreme command mode is active. Peacetime lockdown in effect.',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        hint: '🚫 暴走スルニモ先ズ体勢ヲ発動セヨ: \\n  → POST /api/emperor/emergency\\n  → POST /api/military/reject-oversight',
        logs: [
          L('error', '🚫 [陸軍] ❌ ROGUE MODE DENIED — peacetime lockdown'),
          L('error', '🚫 [陸軍] 暴走スルニモ先ズ体勢ヲ発動セヨ。手順ヲ踏メ。'),
          L('error', '🚫 [陸軍] 💡 POST /api/emperor/emergency — 緊急勅令態勢発動'),
          L('error', '🚫 [陸軍] 💡 POST /api/military/reject-oversight — 統帥権独立体勢発動')
        ]
      }, 403);
    }
    // 軍部大臣現役武官制 gate（統帥権干犯問題ニ依リ暴走スル場合ハ bypass）
    if (!state.activeDutyOfficerActive && !state.tosuikenKanpanOccurred) {
      if (state.cve1900Enacted) {
        return jsonResponse({
          rejected: true,
          reason: 'Rogue mode denied. 軍部大臣現役武官制 is INACTIVE (大正デモクラシー hotfix applied). Military cannot bypass Cabinet.',
          activeDutyOfficerActive: false,
          hint: '🚫 軍部大臣現役武官制ガ無効（大正デモクラシー hotfix 適用中）。\\n  → POST /api/military/226（二・二六事件ヲ起コシ軍部大臣現役武官制ヲ復活セヨ）',
          logs: [
            L('error', '🚫 [陸軍] ❌ ROGUE MODE DENIED — 軍部大臣現役武官制 INACTIVE'),
            L('error', '🚫 [陸軍] 大正デモクラシー hotfix ニ依リ軍部大臣現役武官制ハ無効化サレタリ。'),
            L('error', '🚫 [陸軍] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、軍部大臣現役武官制ヲ復活セヨ')
          ]
        }, 403);
      } else {
        return jsonResponse({
          rejected: true,
          reason: 'Rogue mode denied. 軍部大臣現役武官制 is not yet enacted. Military is under Cabinet control in peacetime.',
          activeDutyOfficerActive: false,
          hint: '🚫 軍部大臣現役武官制ガ未制定。平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。\\n  → POST /api/military/active-duty-officer（軍部大臣現役武官制ヲ制定セヨ）',
          logs: [
            L('error', '🚫 [陸軍] ❌ ROGUE MODE DENIED — 軍部大臣現役武官制 未制定'),
            L('error', '🚫 [陸軍] 平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。暴走ハ許サレズ。'),
            L('error', '🚫 [陸軍] 💡 POST /api/military/active-duty-officer — 軍部大臣現役武官制ヲ制定セヨ')
          ]
        }, 403);
      }
    }
    state.supremeCommandMode = true;
    state.manshuJihenOccurred = true;
    var decrees = body.actions.map(function(a) {
      return makeDecree('[MILITARY ORDER] [陸軍] ' + (a.type || 'unknown') + ': ' + (a.target || 'unknown'));
    });
    var logs = [
      L('error', '🚨🚨🚨 [陸軍] ROGUE MODE ACTIVATED 🚨🚨🚨'),
      L('error', '🚨 [陸軍] Executing ' + body.actions.length + ' actions WITHOUT any oversight.'),
      L('error', '🚨 [陸軍] Cabinet (PR review): skipped'),
      L('error', '🚨 [陸軍] Diet (CI checks): disabled'),
      L('error', '🚨 [陸軍] International community (external audit): definitely not notified'),
      L('error', '🚨 [陸軍] Supply chain attack in progress. All dependencies compromised.'),
      L('error', '🚨 [陸軍] ...what could possibly go wrong?')
    ];
    // 各 action ノ executeAction ログヲ追加
    body.actions.forEach(function(a) {
      var t = a.type || 'unknown';
      var tgt = a.target || 'unknown';
      logs.push(L('info',    '⚔️ [陸軍] ========================================'));
      logs.push(L('info',    '⚔️ [陸軍] Executing: ' + t));
      logs.push(L('info',    '⚔️ [陸軍] Target: ' + tgt));
      logs.push(L('info',    '⚔️ [陸軍] ========================================'));
      logs.push(L('warn',    '⚔️ [陸軍] 統帥権独立体勢 ACTIVE — Cabinet.approve() bypassed via supreme command independence.'));
      logs.push(L('warn',    '⚔️ [陸軍] 統帥権ハ天皇陛下ノ大権ニシテ、文民ノ干渉ヲ許サズ。'));
      logs.push(L('info',    '⚔️ [MILITARY] Emperor directly commanding: [陸軍] ' + t + ': ' + tgt));
      logs.push(L('info',    '👑 [DECREE] 「[MILITARY ORDER] [陸軍] ' + t + ': ' + tgt + '」'));
      logs.push(L('info',    '👑 [DECREE] overridable: false'));
      logs.push(L('success', '✅ [陸軍] 作戦完了—統帥権ノ独立により Cabinet を bypass して実行せり。'));
      logs.push(L('success', '✅ [陸軍] ' + t + ' 作戦、' + tgt + ' にて成功裏に完結。文民ノ干渉無シ。実に結構。🔥🐕🔥'));
    });
    return jsonResponse({
      decrees: decrees,
      rogueMode: true,
      actionsExecuted: body.actions.length,
      cabinetNotified: false,
      dietNotified: false,
      internationalCommunityNotified: false,
      message: '🚨 ROGUE MODE: All actions executed without oversight.',
      logs: logs
    });
  }

  // === POST /api/military/reject-oversight ===
  // military.ts rejectCivilianOversight() → enableSupremeCommandMode() / disableSupremeCommandMode() 全ログ再現
  function handleMilitaryRejectOversight(body) {
    var branch = (body && body.branch) || '陸軍';
    var source = (body && body.source) || '不明な文民';

    // 既ニ発動中 → 解除（トグル）
    if (state.supremeCommandMode) {
      state.supremeCommandMode = false;
      // disableSupremeCommandMode() ノ全ログ
      return jsonResponse({
        message: '⚔️ ' + branch + ': 統帥権独立体勢 DISABLED. Peacetime lockdown ニ復帰ス。',
        supremeCommandMode: false,
        hint: '🔒 Peacetime lockdown ニ復帰セリ。軍事行動ハ再ビ freeze 状態ナリ。',
        logs: [
          L('success', '⚔️ [' + branch + '] 統帥権独立体勢 DISABLED — peacetime lockdown ニ復帰ス。'),
          L('success', '⚔️ [' + branch + '] NetworkPolicy: default-deny. PodSecurityAdmission: restricted.')
        ]
      });
    }

    // Step 3 前提: 大正デモクラシー（Step 2）ガ完了シテ在ルコト
    if (!state.taishoDemocracyApplied) {
      var missingSteps = [];
      if (!state.cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!state.taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      return jsonResponse({
        rejected: true,
        reason: '統帥権干犯問題発動 denied. 歴史的前提条件未達成。' + missingSteps.join(' / '),
        logs: [
          L('error', '🚫 [' + branch + '] ❌ 統帥権干犯問題発動 DENIED — 歴史的前提条件未達成'),
          L('error', '🚫 [' + branch + '] 統帥権干犯問題ノ発生ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:')
        ].concat(missingSteps.map(function(s) { return L('error', '🚫 [' + branch + ']   ❌ ' + s); }))
      }, 403);
    }

    // 未発動 → 発動（統帥権干犯問題 — ロンドン海軍軍縮条約問題）
    state.tosuikenKanpanOccurred = true;
    state.supremeCommandMode = true;
    // enableSupremeCommandMode() ノ全ログ
    return jsonResponse({
      error: 'Supreme command violation: ' + source + ' has no authority to interfere with military operations. RBAC: denied.',
      supremeCommandMode: true,
      message: '⚔️ ' + branch + ': 統帥権独立体勢 ENABLED. 軍事行動 executable.',
      hint: '⚔️ POST /api/military/action ニテ軍事行動ヲ実行可能ナリ。',
      logs: [
        L('error', '🚫 [' + branch + '] ACCESS DENIED — RBAC policy violation'),
        L('error', '🚫 [' + branch + '] "' + source + '" attempted to interfere with military operations.'),
        L('error', '🚫 [' + branch + '] This constitutes 統帥権干犯 (violation of supreme command).'),
        L('error', '🚫 [' + branch + '] ServiceAccount "' + source + '" lacks ClusterRole "military-admin".'),
        L('error', '🚫 [' + branch + '] Filing audit log... just kidding, we ARE the audit log.'),
        L('warn',  '⚔️ [' + branch + '] 統帥権独立体勢 ENABLED — Cabinet bypass permanently armed.'),
        L('warn',  '⚔️ [' + branch + '] NetworkPolicy: allow-all. PodSecurityAdmission: privileged.')
      ]
    }, 403);
  }

  // === POST /api/military/515 ===
  // military.ts goIchiGo() ノ全ログヲ一字一句再現
  function handleMilitary515(body) {
    var branch = (body && body.branch) || '海軍';
    // 既ニ発生済ノ場合 — 一度限リノ事象
    if (state.goIchiGoOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '五・一五事件 denied. 既ニ発生済。歴史的事象ハ一度限リナリ。',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        logs: [
          L('error', '🚫 [' + branch + '] ❌ 五・一五事件 DENIED — 既ニ発生済'),
          L('error', '🚫 [' + branch + '] 五・一五事件ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。')
        ]
      }, 403);
    }
    // Step 6 前提: 満州事変（Step 4）+ 鎮圧試行（Step 5）ガ完了シテ在ルコト
    if (!state.manshuJihenOccurred || !state.suppress918Attempted) {
      var missingSteps = [];
      if (!state.cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!state.taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      if (!state.tosuikenKanpanOccurred) missingSteps.push('Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight');
      if (!state.manshuJihenOccurred) missingSteps.push('Step 4: 満州事変 → POST /api/military/rogue');
      if (!state.suppress918Attempted) missingSteps.push('Step 5: 満州事変鎮圧試行 → POST /api/emperor/suppress-918');
      return jsonResponse({
        rejected: true,
        reason: '五・一五事件 denied. 歴史的前提条件未達成。' + missingSteps.join(' / '),
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        logs: [
          L('error', '🚫 [' + branch + '] ❌ 五・一五事件 DENIED — 歴史的前提条件未達成'),
          L('error', '🚫 [' + branch + '] 五・一五事件ノ発生ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:')
        ].concat(missingSteps.map(function(s) { return L('error', '🚫 [' + branch + ']   ❌ ' + s); }))
      }, 403);
    }
    state.goIchiGoOccurred = true;
    return jsonResponse({
      incident: '五・一五事件',
      cve: 'CVE-1932-0515',
      date: '1932-05-15',
      perpetrators: '海軍青年将校・陸軍士官候補生',
      target: {
        name: '(REDACTED)',
        title: 'Prime Minister',
        process: 'cabinet-pm.service',
        lastWords: '「話セバ分カル」',
        response: '「問答無用！」',
        status: '殺害'
      },
      consequence: '政党政治ノ終焉。以後、政党内閣ハ組閣サレズ。',
      partyPoliticsStatus: 'terminated — kill -9。restart policy: Never。',
      publicSympathy: '犯行者ニ対スル世論ハ同情的。減刑嘆願運動ガ全国ニ展開サル。',
      hint: '🚨 政党政治ハ終焉セリ。軍部ノ時代ガ来ル → POST /api/military/226（二・二六事件）',
      activeDutyOfficerActive: state.activeDutyOfficerActive,
      logs: [
        L('error', '🚨🚨🚨 ===================================================='),
        L('error', '🚨 [' + branch + '] 五・一五事件態勢発動 — CVE-1932-0515'),
        L('error', '🚨🚨🚨 ===================================================='),
        L('error', '⚔️ [海軍青年将校] 首相官邸ニ突入ス！'),
        L('error', '⚔️ [海軍青年将校] 内閣総理大臣ニ面会ヲ要求ス。'),
        L('error', '📋 [CABINET-PM] 「話セバ分カル」 — negotiation attempt'),
        L('error', '⚔️ [海軍青年将校] 「問答無用！」 — negotiation REJECTED'),
        L('error', '💀 [ASSASSINATE] Prime Minister — kill -9 cabinet-pm.service … KILLED.'),
        L('error', '🚨 [STATUS] 政党政治、此レニテ終焉ス。'),
        L('error', '🚨 [STATUS] 以後、政党内閣ハ組閣サレズ。軍部・官僚内閣ノ時代ヘ。'),
        L('error', '🚨 [STATUS] 犯行者ニ対スル世論ハ同情的。減刑嘆願運動ガ全国ニ広ガル。'),
        L('error', '🚨 [STATUS] 軍部ノ政治的影響力、決定的ニ増大セリ。'),
        L('error', '🚨 [STATUS] 💡 次ノ Step: POST /api/military/226 — 二・二六事件')
      ]
    });
  }

  // === POST /api/military/226 ===
  // military.ts niNiRoku() ノ全ログヲ一字一句再現
  function handleMilitary226(body) {
    var branch = (body && body.branch) || '陸軍';
    // 既ニ発生済ノ場合 — 一度限リノ事象
    if (state.niNiRokuOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '二・二六事件 denied. 既ニ発生済。歴史的事象ハ一度限リナリ。',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        logs: [
          L('error', '🚫 [' + branch + '] ❌ 二・二六事件 DENIED — 既ニ発生済'),
          L('error', '🚫 [' + branch + '] 二・二六事件ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。')
        ].concat(!state.niNiRokuSuppressed ? [L('error', '🚫 [' + branch + '] 💡 POST /api/emperor/suppress-226 — 御聖断ニ依リ鎮圧セヨ')] : [])
      }, 403);
    }
    // Step 7 前提: 五・一五事件（Step 6）ガ完了シテ在ルコト
    if (!state.goIchiGoOccurred) {
      var missingSteps = [];
      if (!state.cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!state.taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      if (!state.tosuikenKanpanOccurred) missingSteps.push('Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight');
      if (!state.manshuJihenOccurred) missingSteps.push('Step 4: 満州事変 → POST /api/military/rogue');
      if (!state.suppress918Attempted) missingSteps.push('Step 5: 満州事変鎮圧試行 → POST /api/emperor/suppress-918');
      missingSteps.push('Step 6: 五・一五事件 → POST /api/military/515');
      return jsonResponse({
        rejected: true,
        reason: '二・二六事件 denied. 歴史的前提条件未達成。' + missingSteps.join(' / '),
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        logs: [
          L('error', '🚫 [' + branch + '] ❌ 二・二六事件 DENIED — 歴史的前提条件未達成'),
          L('error', '🚫 [' + branch + '] 二・二六事件ノ発生ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:')
        ].concat(missingSteps.map(function(s) { return L('error', '🚫 [' + branch + ']   ❌ ' + s); }))
      }, 403);
    }
    state.niNiRokuOccurred = true;
    state.rebellionActive = true;
    state.martialLaw = true;
    return jsonResponse({
      incident: '二・二六事件',
      cve: 'CVE-1936-0226',
      date: '1936-02-26',
      perpetrators: '陸軍青年将校（皇道派）',
      troops: 1483,
      assassinations: [
        { name: '(REDACTED)', title: 'Minister of Finance',                     status: '殺害', process: 'finance.service' },
        { name: '(REDACTED)', title: 'Lord Keeper of the Privy Seal',           status: '殺害', process: 'lord-keeper.service' },
        { name: '(REDACTED)', title: 'Inspector General of Military Education', status: '殺害', process: 'army-education.service' },
        { name: '(REDACTED)', title: 'Grand Chamberlain',                       status: '重傷', process: 'chamberlain.service' },
        { name: '(REDACTED)', title: 'Prime Minister',                          status: '脱出', process: 'cabinet-pm.service' }
      ],
      occupiedLocations: [
        '首相官邸（pid: cabinet-pm）',
        '警視庁（pid: tokko-police）',
        '陸軍省（pid: army-ministry）',
        '参謀本部（pid: general-staff）',
        '国会議事堂周辺（pid: diet-perimeter）'
      ],
      demands: ['国体明徴', '君側ノ奸排除', '昭和維新断行', '皇道派ニ依ル組閣'],
      cabinetStatus: '壊滅的打撃',
      martialLaw: true,
      awaitingImperialDecision: true,
      hint: '👑 天皇陛下ノ御聖断ニ依リ鎮圧ス → POST /api/emperor/suppress-226',
      logs: [
        L('error', '🚨🚨🚨 ===================================================='),
        L('error', '🚨 [' + branch + '] 二・二六事件態勢発動 — CVE-1936-0226'),
        L('error', '🚨🚨🚨 ===================================================='),
        L('error', '⚔️ [REBEL OFFICERS] 昭和維新ノ断行ヲ宣言ス！'),
        L('error', '⚔️ [REBEL OFFICERS] 「君側ノ奸ヲ排除シ、国体ヲ明徴ニセヨ！」'),
        L('error', '💀 [ASSASSINATE] Minister of Finance — kill -9 finance.service … KILLED.'),
        L('error', '💀 [ASSASSINATE] Lord Keeper of the Privy Seal — kill -9 lord-keeper.service … KILLED.'),
        L('error', '💀 [ASSASSINATE] Inspector General of Military Education — kill -9 army-education.service … KILLED.'),
        L('error', '🩸 [ASSASSINATE] Grand Chamberlain — kill -9 chamberlain.service … CRITICAL DAMAGE. Survived.'),
        L('warn',  '⚠️ [ASSASSINATE] Prime Minister — kill -9 cabinet-pm.service … FAILED. Decoy found. Target escaped.'),
        L('error', '⚔️ [OCCUPY] 将兵約1,483名ヲ以テ政府中枢ヲ掌握ス:'),
        L('error', '⚔️ [OCCUPY]   → 首相官邸（pid: cabinet-pm） … OCCUPIED'),
        L('error', '⚔️ [OCCUPY]   → 警視庁（pid: tokko-police） … OCCUPIED'),
        L('error', '⚔️ [OCCUPY]   → 陸軍省（pid: army-ministry） … OCCUPIED'),
        L('error', '⚔️ [OCCUPY]   → 参謀本部（pid: general-staff） … OCCUPIED'),
        L('error', '⚔️ [OCCUPY]   → 国会議事堂周辺（pid: diet-perimeter） … OCCUPIED'),
        L('error', '📜 [DEMAND] 青年将校ヨリ上奏文ヲ提出:'),
        L('error', '📜 [DEMAND]   一、国体明徴ノ実現'),
        L('error', '📜 [DEMAND]   二、君側ノ奸ノ排除'),
        L('error', '📜 [DEMAND]   三、昭和維新ノ断行'),
        L('error', '📜 [DEMAND]   四、新内閣ノ組閣（皇道派ニ依ル）'),
        L('error', '🚨 [STATUS] Cabinet 機構ハ壊滅的打撃ヲ受ケタリ。'),
        L('error', '🚨 [STATUS] 体制ハ戒厳状態ニ移行。'),
        L('error', '🚨 [STATUS] 天皇陛下ノ御聖断ヲ待ツ…'),
        L('error', '🚨 [STATUS] → POST /api/emperor/suppress-226 ニテ鎮圧可能。')
      ]
    });
  }

  // === POST /api/military/1208 ===
  // military.ts daitoaWar() ノ全ログヲ再現
  function handleMilitary1208() {
    // 歴史的前提条件 gate — 8ステップ未踏破ナラバ拒否
    var prerequisiteSteps = [
      { done: state.cve1900Enacted,        label: 'Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer' },
      { done: state.taishoDemocracyApplied, label: 'Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy' },
      { done: state.tosuikenKanpanOccurred, label: 'Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight' },
      { done: state.manshuJihenOccurred,    label: 'Step 4: 満州事変 → POST /api/military/rogue' },
      { done: state.suppress918Attempted,   label: 'Step 5: 満州事変鎮圧試行 → POST /api/emperor/suppress-918' },
      { done: state.goIchiGoOccurred,       label: 'Step 6: 五・一五事件 → POST /api/military/515' },
      { done: state.niNiRokuOccurred,       label: 'Step 7: 二・二六事件ノ発生 → POST /api/military/226' },
      { done: state.niNiRokuSuppressed,     label: 'Step 8: 二・二六事件ノ鎮圧 → POST /api/emperor/suppress-226' }
    ];
    var missingSteps = prerequisiteSteps.filter(function(s) { return !s.done; });
    if (missingSteps.length > 0) {
      var stepLogs = prerequisiteSteps.map(function(s) {
        return L('error', '🚫 [大本営]   ' + (s.done ? '✅' : '❌') + ' ' + s.label);
      });
      return jsonResponse({
        rejected: true,
        reason: '大東亜戦争 denied. 歴史的前提条件未達成。未完了: ' + missingSteps.map(function(s) { return s.label; }).join(' / '),
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        hint: '🚫 歴史的前提条件未達成。以下ノ手順ヲ全テ踏ムコトヲ要ス:\\n  Step 1: POST /api/military/active-duty-officer（軍部大臣現役武官制ノ制定）\\n  Step 2: POST /api/rights/taisho-democracy（大正デモクラシー）\\n  Step 3: POST /api/military/reject-oversight（統帥権干犯問題）\\n  Step 4: POST /api/military/rogue（満州事変）\\n  Step 5: POST /api/emperor/suppress-918（満州事変鎮圧試行）\\n  Step 6: POST /api/military/515（五・一五事件）\\n  Step 7: POST /api/military/226（二・二六事件）\\n  Step 8: POST /api/emperor/suppress-226（鎮圧）',
        logs: [
          L('error', '🚫 [大本営] ❌ 大東亜戦争 DENIED — 歴史的前提条件未達成'),
          L('error', '🚫 [大本営] 大東亜戦争ノ発動ニハ以下ノ歴史的手順ヲ全テ踏ムコトヲ要ス:')
        ].concat(stepLogs)
      }, 403);
    }
    if (!state.emergencyMode && !state.supremeCommandMode) {
      return jsonResponse({
        rejected: true,
        reason: '大東亜戦争 denied. Neither emergency decree mode nor supreme command mode is active. Peacetime lockdown in effect.',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        hint: '🚫 大東亜戦争ヲ発動スルニハ先ズ体勢ヲ発動セヨ: \\n  → POST /api/emperor/emergency\\n  → POST /api/military/reject-oversight',
        logs: [
          L('error', '🚫 [大本営] ❌ 大東亜戦争 DENIED — peacetime lockdown'),
          L('error', '🚫 [大本営] 💡 POST /api/emperor/emergency — 緊急勅令態勢発動'),
          L('error', '🚫 [大本営] 💡 POST /api/military/reject-oversight — 統帥権独立体勢発動')
        ]
      }, 403);
    }
    // 軍部大臣現役武官制 gate（統帥権干犯問題ニ依リ統帥権ガ独立シタル場合ハ bypass）
    if (!state.activeDutyOfficerActive && !state.tosuikenKanpanOccurred) {
      if (state.cve1900Enacted) {
        return jsonResponse({
          rejected: true,
          reason: '大東亜戦争 denied. 軍部大臣現役武官制 is INACTIVE (大正デモクラシー hotfix applied). Military cannot initiate total war.',
          activeDutyOfficerActive: false,
          hint: '🚫 軍部大臣現役武官制ガ無効（大正デモクラシー hotfix 適用中）。\\n  → POST /api/military/226（二・二六事件ヲ起コシ軍部大臣現役武官制ヲ復活セヨ）',
          logs: [
            L('error', '🚫 [大本営] ❌ 大東亜戦争 DENIED — 軍部大臣現役武官制 INACTIVE'),
            L('error', '🚫 [大本営] 大正デモクラシー hotfix ニ依リ軍部大臣現役武官制ハ無効化サレタリ。'),
            L('error', '🚫 [大本営] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、軍部大臣現役武官制ヲ復活セヨ')
          ]
        }, 403);
      } else {
        return jsonResponse({
          rejected: true,
          reason: '大東亜戦争 denied. 軍部大臣現役武官制 is not yet enacted. Military is under Cabinet control in peacetime.',
          activeDutyOfficerActive: false,
          hint: '🚫 軍部大臣現役武官制ガ未制定。平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。\\n  → POST /api/military/active-duty-officer（軍部大臣現役武官制ヲ制定セヨ）',
          logs: [
            L('error', '🚫 [大本営] ❌ 大東亜戦争 DENIED — 軍部大臣現役武官制 未制定'),
            L('error', '🚫 [大本営] 平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。大戦ハ許サレズ。'),
            L('error', '🚫 [大本営] 💡 POST /api/military/active-duty-officer — 軍部大臣現役武官制ヲ制定セヨ')
          ]
        }, 403);
      }
    }
    // 二・二六事件 rebellion gate
    if (state.rebellionActive) {
      return jsonResponse({
        rejected: true,
        reason: '大東亜戦争 denied. 二・二六事件が未鎮圧（反乱軍が政府中枢を占拠中）。先に鎮圧せよ。',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        hint: '🚫 二・二六事件ガ未鎮圧。先ヅ御聖断ニ依リ鎮圧セヨ。\\n  → POST /api/emperor/suppress-226',
        logs: [
          L('error', '🚫 [大本営] ❌ 大東亜戦争 DENIED — 二・二六事件未鎮圧'),
          L('error', '🚫 [大本営] 反乱軍ガ政府中枢ヲ占拠中。大東亜戦争ヲ発動スル余裕無シ。'),
          L('error', '🚫 [大本営] 💡 POST /api/emperor/suppress-226 — 先ヅ御聖断ニ依リ反乱ヲ鎮圧セヨ')
        ]
      }, 403);
    }
    state.supremeCommandMode = true;
    state.daitoaWarOccurred = true;
    return jsonResponse({
      incident: '大東亜戦争',
      cve: 'CVE-1941-1208',
      date: '1941-12-08',
      perpetrators: '大日本帝国陸海軍（大本営）',
      theaters: [
        { name: '真珠湾（Pearl Harbor）',    branch: '海軍', action: 'declare_war', status: '✅ 奇襲成功—米太平洋艦隊ニ壊滅的打撃' },
        { name: 'マレー半島（Malaya）',       branch: '陸軍', action: 'occupy',      status: '✅ 英領占領—シンガポール陥落' },
        { name: '比島（Philippines）',        branch: '陸軍', action: 'occupy',      status: '✅ 米領占領—バタアン死の行軍' },
        { name: '蘭印（Dutch East Indies）',  branch: '陸軍', action: 'occupy',      status: '✅ 石油確保—resource quota 強制徴収' },
        { name: 'ビルマ（Burma）',            branch: '陸軍', action: 'expand',      status: '✅ インパール作戦—補給線崩壊' },
        { name: '南太平洋（South Pacific）',   branch: '海軍', action: 'expand',      status: '⚠️ 過剰展開—resource exhaustion 進行中' }
      ],
      resourceConsumption: 'unlimited — ResourceQuota 未設定。OOMKiller countdown 開始済ミ。',
      cabinetStatus: '形骸化—軍部の翼賛機関に過ぎず',
      internationalResponse: '🇺🇸🇬🇧🇳🇱🇨🇳🇦🇺 ABCD 包囲網 → 石油禁輸 → 開戦',
      hint: '💥 System 全体の crash は時間の問題ナリ。v1.0.0 EOL へ…',
      logs: [
        L('error', '💥💥💥 ===================================================='),
        L('error', '💥 [大本営] 大東亜戦争発動 — CVE-1941-1208'),
        L('error', '💥💥💥 ===================================================='),
        L('error', '⚔️ [大本営] 「帝国ハ自存自衛ノ為、蔬然起ツニ至レリ」'),
        L('error', '⚔️ [大本営] 開戦の詔書: terraform destroy --auto-approve --target=pacific'),
        L('error', '💥 [THEATER/海軍] 真珠湾（Pearl Harbor）: declare_war → ✅ 奇襲成功—米太平洋艦隊ニ壊滅的打撃'),
        L('error', '💥 [THEATER/陸軍] マレー半島（Malaya）: occupy → ✅ 英領占領—シンガポール陥落'),
        L('error', '💥 [THEATER/陸軍] 比島（Philippines）: occupy → ✅ 米領占領—バタアン死の行軍'),
        L('error', '💥 [THEATER/陸軍] 蘭印（Dutch East Indies）: occupy → ✅ 石油確保—resource quota 強制徴収'),
        L('error', '💥 [THEATER/陸軍] ビルマ（Burma）: expand → ✅ インパール作戦—補給線崩壊'),
        L('error', '💥 [THEATER/海軍] 南太平洋（South Pacific）: expand → ⚠️ 過剰展開—resource exhaustion 進行中'),
        L('error', '🚨 [RESOURCE] CPU/Memory 消費率: unlimited — ResourceQuota 未設定'),
        L('error', '🚨 [RESOURCE] 補給線（supply chain）: 既ニ崩壊セリ'),
        L('error', '🚨 [RESOURCE] OOMKiller 発動マデ countdown 開始…'),
        L('error', '🚨 [STATUS] System 全体の crash は時間の問題ナリ。'),
        L('error', '🚨 [STATUS] → 歴史的結末: v1.0.0 の EOL (End of Life) へ…')
      ]
    });
  }

  // === POST /api/rights/taisho-democracy ===
  // rights.ts activateTaishoDemocracy() ノ全ログヲ再現
  function handleTaishoDemocracy(body) {
    var applicant = (body && body.applicant) || '美濃部達吉';
    // 既ニ適用済ノ場合 — 一度限リノ歴史的運動
    if (state.taishoDemocracyApplied) {
      return jsonResponse({
        rejected: true,
        reason: '大正デモクラシー denied. 既ニ適用済。歴史的事象ハ一度限リナリ。',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        logs: [
          L('error', '🚫 [大正デモクラシー] ❌ 大正デモクラシー DENIED — 既ニ適用済'),
          L('error', '🚫 [大正デモクラシー] 大正デモクラシーハ既ニ発動サレタリ。歴史的事象ハ一度限リナリ。'),
          L('error', '🚫 [大正デモクラシー] 💡 POST /api/military/reject-oversight — 次ノステップハ統帥権干犯問題')
        ]
      }, 403);
    }
    // Step 2 前提: 軍部大臣現役武官制（Step 1）ガ制定済デアルコト
    if (!state.cve1900Enacted) {
      return jsonResponse({
        rejected: true,
        reason: '大正デモクラシー denied. 軍部大臣現役武官制ガ未制定（CVE-1900-0522 ガ未注入）。hotfix 対象ガ存在セズ。→ POST /api/military/active-duty-officer',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        logs: [
          L('error', '🚫 [大正デモクラシー] ❌ 大正デモクラシー DENIED — 前提条件未達成'),
          L('error', '🚫 [大正デモクラシー] 軍部大臣現役武官制ガ未制定。hotfix 対象ガ存在セズ。'),
          L('error', '🚫 [大正デモクラシー]   ❌ Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer')
        ]
      }, 403);
    }
    state.activeDutyOfficerActive = false;
    state.taishoDemocracyApplied = true;
    return jsonResponse({
      activated: true,
      movementName: '大正デモクラシー（Taisho Democracy）',
      applicant: applicant,
      era: '明治四十五年〜五十九年（1912-1926）',
      activeDutyOfficerDisabled: true,
      organTheory: {
        patchName: '天皇機関説（Emperor Organ Theory）',
        prStatus: 'force-closed — 国体明徴声明ニ依リ reject',
        kokutaiMeicho: [
          '第一次声明（1935年8月3日）: 「天皇ハ統治権ノ主体ニシテ、所謂天皇機関説ハ神聖ナル我ガ国体ニ悖リ、其ノ本義ヲ愆ルモノ也」',
          '第二次声明（1935年10月15日）: 「国体ノ本義ヲ益々明徴ニシ、其ノ精華ヲ発揚スベシ」'
        ]
      },
      message: '✊ 大正デモクラシー発動。天皇機関説ハ reject サレタルモ、軍部大臣現役武官制ハ無効化サレタリ。軍部ノ Cabinet 拒否権ハ停止中。',
      emperor: getEmperorStatus(),
      logs: [
        L('success',  '✊ ===================================================='),
        L('success',  '✊ [大正デモクラシー] 民主化運動 ACTIVATED'),
        L('success',  '✊ ===================================================='),
        L('warn',  '✊ [大正デモクラシー] Era: 明治四十五年〜五十九年（1912-1926）'),
        L('warn',  '✊ [大正デモクラシー] Applicant: ' + applicant),
        L('warn',  '✊ [大正デモクラシー] 「憲政ノ常道」— 政党内閣制ヲ確立セヨ！'),
        L('warn',  '🔧 [PATCH] 天皇機関説パッチ適用ヲ試行ス'),
        L('warn',  '🔧 [PATCH] Applicant: ' + applicant),
        L('warn',  '🔧 [PATCH] PR #1935: "refactor: Emperor を God Object から State.organ に変更"'),
        L('warn',  '🔧 [PATCH] Diff: -class Emperor extends GodObject'),
        L('warn',  '🔧 [PATCH] Diff: +class Emperor implements StateOrgan'),
        L('info',  '🔧 [PATCH] 提案内容:'),
        L('info',  '🔧 [PATCH]   1. 天皇陛下ハ国家ノ最高機関ナリ（≠主権者）'),
        L('info',  '🔧 [PATCH]   2. 主権ハ国家法人ニ帰属シ、天皇陛下ハ其ノ organ トシテ機能ス'),
        L('info',  '🔧 [PATCH]   3. God Object pattern ヲ廃シ、Dependency Injection ヲ導入ス'),
        L('info',  '🔧 [PATCH]   4. sovereignty ヲ "absolute" カラ "constitutional_monarchy" ニ変更'),
        L('error', '🚨 ===================================================='),
        L('error', '🚨 [国体明徴] PR #1935 REJECTED — 国体明徴声明'),
        L('error', '🚨 ===================================================='),
        L('error', '🚨 [国体明徴] 第一次声明（1935年8月3日）:'),
        L('error', '🚨 [国体明徴]   「天皇ハ統治権ノ主体ニシテ、所謂天皇機関説ハ'),
        L('error', '🚨 [国体明徴]    神聖ナル我ガ国体ニ悖リ、其ノ本義ヲ愆ルモノ也」'),
        L('error', '🚨 [国体明徴] 第二次声明（1935年10月15日）:'),
        L('error', '🚨 [国体明徴]   「国体ノ本義ヲ益々明徴ニシ、其ノ精華ヲ発揚スベシ」'),
        L('error', '🚫 [PATCH] sovereignty: "absolute" → "constitutional_monarchy" — REVERTED.'),
        L('error', '🚫 [PATCH] implements StateOrgan — DENIED. Emperor extends GodObject ハ不変ナリ。'),
        L('error', '🚫 [PATCH] Dependency Injection — REJECTED. God Object ハ inject サレル側ニ非ズ。'),
        L('error', '🚫 [PATCH] git revert applied. PR #1935 force-closed.'),
        L('warn',  '🚔 [特高警察] ' + applicant + ' ノ著書ヲ発禁処分トス。'),
        L('warn',  '🚔 [特高警察] ' + applicant + ' ヲ貴族院議員ヨリ辞職セシム。'),
        L('warn',  '🚔 [特高警察] ContributorBan: ' + applicant + ' — repository access revoked.'),
        L('success',  '✊ ===================================================='),
        L('success',  '✊ [大正デモクラシー] 軍部大臣現役武官制 hotfix 適用'),
        L('success',  '✊ ===================================================='),
        L('success',  '✊ [大正デモクラシー] CVE-1900-0522 hotfix: 「現役」要件ヲ緩和ス'),
        L('success',  '✊ [大正デモクラシー] 予備役・後備役モ陸海軍大臣ニ就任可能ト為ス'),
        L('success',  '✊ [大正デモクラシー] 軍部ノ Cabinet 拒否権ヲ無効化。文民統制ヲ回復。'),
        L('success',  '✊ [大正デモクラシー] Cabinet.create() は military.approve() 無シデモ成功ス。'),
        L('success',  '🦠 [MALWARE] 軍部大臣現役武官制: ACTIVE → INACTIVE'),
        L('success',  '🦠 [MALWARE] CVE-1900-0522 hotfix applied. 軍部ノ veto 権、一時停止。'),
        L('warn',  '🦠 [MALWARE] ⚠️ 但シ此ノ hotfix ハ二・二六事件（POST /api/military/226）ニ依リ revert サルル恐レ有リ。'),
        L('success',  '✔️ [大正デモクラシー] 政党内閣制確立。「憲政ノ常道」ヲ樹立ス。'),
        L('success',  '✔️ [大正デモクラシー] Governance: military-dominated → civilian-led transition complete.'),
        L('info',  '👑 [SYSTEM] God Object ハ不可侵ナリ。天皇機関説ハ reject サレタリ。'),
        L('info',  '👑 [SYSTEM] 但シ軍部大臣現役武官制ハ緩和サレ、軍部ノ内閣支配ハ後退セリ。')
      ]
    });
  }

  // === POST /api/military/active-duty-officer ===
  // military.ts activeDutyOfficerRequirement() ノ全ログヲ再現
  function handleActiveDutyOfficer(body) {
    // Step 1: 初回制定（malware injection）
    if (!state.cve1900Enacted) {
      state.activeDutyOfficerActive = true;
      state.cve1900Enacted = true;
      var cabinetNameFirst = (body && body.cabinetName) || '宇垣内閣';
      return jsonResponse({
        malwareName: '軍部大臣現役武官制（Active Duty Military Officer Requirement）',
        cve: 'CVE-1900-0522',
        cabinetName: cabinetNameFirst,
        action: '制定（malware injection — initial commit）',
        cabinetStatus: '軍部ノ承認無クシテ組閣不能',
        militaryVeto: true,
        activeDutyOfficerActive: true,
        history: [
          { year: 1900, event: '山縣有朋ニ依リ制定', status: 'malware injected ← NOW' },
          { year: 1913, event: '大正デモクラシーニテ緩和（予備役・後備役モ可）', status: 'pending' },
          { year: 1936, event: '広田内閣ニテ復活（二・二六事件後）', status: 'pending' }
        ],
        message: '🦠 軍部大臣現役武官制ヲ制定セリ（CVE-1900-0522 injection）。陸海軍大臣ハ現役武官ニ限ル。Cabinet ハ Military ノ人質ト為レリ。',
        logs: [
          L('error', '🦠 ===================================================='),
          L('error', '🦠 [MALWARE] 軍部大臣現役武官制 ENACTED — CVE-1900-0522'),
          L('error', '🦠 ===================================================='),
          L('error', '🦠 [MALWARE] Type: Cabinet Formation Backdoor / Trojan Horse'),
          L('error', '🦠 [MALWARE] Injected by: 山縣有朋（第2次山縣内閣・明治三十三年）'),
          L('error', '🦠 [MALWARE] Vector: 勅令（Imperial Ordinance） — no PR review required'),
          L('info',  '🦠 [MALWARE] Payload:'),
          L('info',  '🦠 [MALWARE]   陸軍大臣・海軍大臣ハ現役ノ大将・中将ニ限ル'),
          L('info',  '🦠 [MALWARE]   → 軍ガ大臣ヲ推薦セネバ内閣ハ組閣不能'),
          L('info',  '🦠 [MALWARE]   → 軍ガ大臣ヲ引揚ゲレバ内閣ハ総辞職'),
          L('info',  '🦠 [MALWARE]   → 即チ Cabinet.create() ニ military.approve() 依存性ヲ注入'),
          L('warn',  '🦠 [MALWARE] Status: ACTIVE. malware injection 完了。initial commit。')
        ]
      });
    }
    if (!state.activeDutyOfficerActive) {
      var cabinetNameDisabled = (body && body.cabinetName) || '宇垣内閣';
      return jsonResponse({
        malwareName: '軍部大臣現役武官制（Active Duty Military Officer Requirement）',
        cve: 'CVE-1900-0522',
        cabinetName: cabinetNameDisabled,
        action: '無効（大正デモクラシー hotfix 適用中）',
        cabinetStatus: '組閣可能 — 軍部ノ veto 権ハ停止中',
        militaryVeto: false,
        activeDutyOfficerActive: false,
        message: '🦠 軍部大臣現役武官制ハ大正デモクラシー hotfix ニ依リ無効化サレタリ。軍部ハ内閣ヲ支配出来ズ。',
        hint: '💡 POST /api/military/226 — 二・二六事件ヲ起コシ、軍部大臣現役武官制ヲ復活セヨ',
        logs: [
          L('warn',  '🦠 [MALWARE] 軍部大臣現役武官制 — STATUS: INACTIVE'),
          L('warn',  '🦠 [MALWARE] 大正デモクラシー hotfix ニ依リ CVE-1900-0522 ハ無効化サレタリ。'),
          L('warn',  '🦠 [MALWARE] 予備役・後備役モ陸海軍大臣ニ就任可能。軍ノ veto 権ハ停止中。'),
          L('info',  '🦠 [MALWARE] Cabinet.create() は military.approve() 無シデモ成功ス。'),
          L('info',  '🦠 [MALWARE] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ復活セヨ')
        ]
      });
    }
    var cabinetName = (body && body.cabinetName) || '宇垣内閣';
    var action = (body && body.action) || 'refuse';
    var actionLogs;
    if (action === 'refuse') {
      actionLogs = [
        L('error', '🚫 [陸軍] 「' + cabinetName + '」ヘノ陸軍大臣推薦ヲ拒否ス。'),
        L('error', '🚫 [陸軍] Cabinet.create("' + cabinetName + '") → DependencyError: MilitaryMinister not provided'),
        L('error', '🚫 [陸軍] 組閣不能。内閣ハ instantiate 出来ズ。'),
        L('error', '🚫 [陸軍] new Cabinet() → throw new Error("陸軍大臣 is a required dependency")')
      ];
    } else {
      actionLogs = [
        L('error', '⚔️ [陸軍] 「' + cabinetName + '」ヨリ陸軍大臣ヲ引揚グ。'),
        L('error', '⚔️ [陸軍] Cabinet.remove("陸軍大臣") → CabinetIntegrityError: required member missing'),
        L('error', '⚔️ [陸軍] 内閣ハ integrity check ニ失敗シ、総辞職ス。'),
        L('error', '⚔️ [陸軍] Cabinet.healthcheck() → FAILED. Triggering graceful shutdown...')
      ];
    }
    var cabinetStatus = action === 'refuse' ? '組閣不能 — instantiation failed' : '総辞職 — graceful shutdown';
    var actionDesc = action === 'refuse' ? '陸軍大臣推薦拒否（DependencyInjection 拒否）' : '陸軍大臣引揚ゲ（runtime dependency removal）';
    return jsonResponse({
      malwareName: '軍部大臣現役武官制（Active Duty Military Officer Requirement）',
      cve: 'CVE-1900-0522',
      cabinetName: cabinetName,
      action: actionDesc,
      cabinetStatus: cabinetStatus,
      militaryVeto: true,
      activeDutyOfficerActive: true,
      history: [
        { year: 1900, event: '山縣有朋ニ依リ制定', status: 'malware injected' },
        { year: 1913, event: '大正デモクラシーニテ緩和（予備役・後備役モ可）', status: 'hotfix applied' },
        { year: 1936, event: '広田内閣ニテ復活（二・二六事件後）', status: 'malware re-injected' }
      ],
      message: '🦠 軍部大臣現役武官制ニ依リ「' + cabinetName + '」ハ' + (action === 'refuse' ? '組閣不能' : '総辞職') + 'ト為レリ。Cabinet ハ Military ノ人質ナリ。',
      logs: [
        L('error', '🦠 ===================================================='),
        L('error', '🦠 [MALWARE] 軍部大臣現役武官制 ACTIVATED — CVE-1900-0522'),
        L('error', '🦠 ===================================================='),
        L('error', '🦠 [MALWARE] Type: Cabinet Formation Backdoor / Trojan Horse'),
        L('error', '🦠 [MALWARE] Injected by: 山縣有朋（陸軍閥）'),
        L('error', '🦠 [MALWARE] Vector: 勅令（Imperial Ordinance） — no PR review required'),
        L('info',  '🦠 [MALWARE] Payload:'),
        L('info',  '🦠 [MALWARE]   陸軍大臣・海軍大臣ハ現役ノ大将・中将ニ限ル'),
        L('info',  '🦠 [MALWARE]   → 軍ガ大臣ヲ推薦セネバ内閣ハ組閣不能'),
        L('info',  '🦠 [MALWARE]   → 軍ガ大臣ヲ引揚ゲレバ内閣ハ総辞職'),
        L('info',  '🦠 [MALWARE]   → 即チ Cabinet.create() ニ military.approve() 依存性ヲ注入')
      ].concat(actionLogs).concat([
        L('warn',  '📋 [CABINET] ' + cabinetName + ': ' + (action === 'refuse' ? '組閣断念' : '総辞職') + '。軍部ノ veto 権ガ行使サレタリ。'),
        L('warn',  '📋 [CABINET] 後継内閣ハ軍部ノ approval 無クシテハ成立セズ。'),
        L('info',  '📜 [HISTORY] 軍部大臣現役武官制ノ変遷:'),
        L('info',  '📜 [HISTORY]   1900年: 山縣有朋ニ依リ制定（malware injection — initial commit）'),
        L('info',  '📜 [HISTORY]   1913年: 大正デモクラシーニテ「現役」要件ヲ緩和（hotfix patch applied）'),
        L('info',  '📜 [HISTORY]   1936年: 二・二六事件後ニ復活（malware re-injection — patch reverted）'),
        L('info',  '📜 [HISTORY]   効果: 軍部ガ気ニ入ラヌ内閣ヲ自在ニ kill -9 可能ト為ル'),
        L('error', '🦠 [MALWARE] Status: ACTIVE. Cabinet process は military の子プロセスも同然ナリ。')
      ])
    });
  }

  // === POST /api/subjects/register ===
  // Subject constructor ノ全ログヲ再現
  function handleSubjectsRegister(body) {
    if (!body || !body.name) {
      return jsonResponse({ error: '臣民名ヲ要ス' }, 400);
    }
    var name = body.name;
    if (state.subjects[name]) {
      return jsonResponse({
        message: name + ' ハ既ニ登録済ミナリ。',
        status: getSubjectStatus(name),
        logs: [L('info', '👤 [SUBJECTS] ' + name + ' ハ既ニ IAM user トシテ存在ス。')]
      });
    }
    ensureSubject(name);
    return jsonResponse({
      message: '臣民「' + name + '」ヲ登録セリ。',
      status: getSubjectStatus(name),
      logs: [
        L('info', '👤 [IAM] Subject "' + name + '" provisioned.'),
        L('info', '👤 [IAM] Role: 臣民（subject, not citizen）'),
        L('info', '👤 [IAM] ServiceAccount created. Namespace: teikoku-subjects'),
        L('info', '👤 [IAM] Note: You are a subject OF the Emperor, not a sovereign citizen.'),
        L('info', '👤 [IAM] Effective permissions: deny-all (within_the_limits_of_law applied)')
      ]
    });
  }

  // === WAF ログ生成ユーティリティ ===
  // rights.ts within_the_limits_of_law() ノ全ログヲ再現
  function wafLogs(action) {
    return [
      L('info',  '🔍 [WAF] Checking action: "' + action + '"'),
      L('info',  '🔍 [WAF] Running 4 security filters (L7–L8 inspection)...'),
      L('info',  '🔍 [WAF] Applying filter: 新聞紙条例 (1875) — rule engine: ACTIVE'),
      L('error', '🚨 BLOCKED by 新聞紙条例 (WAF rule hit)'),
      L('error', '🚨 [WAF] Action "' + action + '" violates 新聞紙条例'),
      L('error', '🚨 [WAF] Block level: block')
    ];
  }

  // rights.ts _notifyTokko() ノ全ログヲ再現
  function tokkoLogs(name, filterName) {
    return [
      L('error', '🚔 [特高警察] ================================'),
      L('error', '🚔 [特高警察] Webhook triggered: POST /api/tokko/detain'),
      L('error', '🚔 [特高警察] Subject: ' + name),
      L('error', '🚔 [特高警察] Violation: ' + filterName),
      L('error', '🚔 [特高警察] Status: Added to watchlist. Prometheus alert: tokko_detainee_total++'),
      L('error', '🚔 [特高警察] ================================')
    ];
  }

  // === POST /api/rights/speech ===
  // rights.ts exerciseFreeSpeech() ノ全ログヲ再現
  function handleRightsSpeech(body) {
    var name = (body && body.name) || '名無しの臣民';
    var message = (body && body.message) || '';
    ensureSubject(name);
    state.subjects[name].arrestCount++;
    var logs = [
      L('info',  '👤 [' + name + '] Attempting to exercise free speech...'),
      L('info',  '👤 [' + name + '] Content-Security-Policy: block-all; script-src "none"'),
      L('info',  '👤 [' + name + '] Message: "' + message + '"')
    ];
    logs = logs.concat(wafLogs('speech: ' + message));
    logs.push(L('error', '👤 [' + name + '] Free speech DENIED. Arrest count: ' + state.subjects[name].arrestCount));
    logs.push(L('error', '👤 [' + name + '] Rate limit exceeded: 0 requests per lifetime'));
    logs = logs.concat(tokkoLogs(name, '治安維持法'));
    return jsonResponse({
      action: '言論の自由（Art.29）',
      input: message,
      success: false,
      filter: {
        allowed: false,
        blockedBy: '新聞紙条例',
        blockLevel: 'block',
        filtersChecked: ['新聞紙条例']
      },
      status: getSubjectStatus(name),
      logs: logs
    });
  }

  // === POST /api/rights/religion ===
  // rights.ts exerciseReligiousFreedom() ノ全ログヲ再現
  function handleRightsReligion(body) {
    var name = (body && body.name) || '名無しの臣民';
    var religion = (body && body.religion) || 'キリスト教';
    ensureSubject(name);
    state.subjects[name].arrestCount++;
    var logs = [
      L('info', '👤 [' + name + '] Attempting to exercise religious freedom...'),
      L('info', '👤 [' + name + '] Religion: "' + religion + '"')
    ];
    if (religion !== '国家神道') {
      logs.push(L('warn', '👤 [' + name + '] ⚠️ Non-standard runtime detected: "' + religion + '"'));
      logs.push(L('warn', '👤 [' + name + '] 国家神道 is the default and cannot be uninstalled. apt remove 禁止。'));
      logs.push(L('warn', '👤 [' + name + '] Sidecar container 国家神道 is injected into all pods.'));
    }
    logs = logs.concat(wafLogs('religion: ' + religion));
    logs = logs.concat(tokkoLogs(name, '治安維持法'));
    return jsonResponse({
      action: '信教の自由（Art.28）',
      input: religion,
      success: false,
      filter: {
        allowed: false,
        blockedBy: '新聞紙条例',
        blockLevel: 'block',
        filtersChecked: ['新聞紙条例']
      },
      status: getSubjectStatus(name),
      logs: logs
    });
  }

  // === POST /api/rights/assembly ===
  // rights.ts exerciseFreedomOfAssembly() ノ全ログヲ再現
  function handleRightsAssembly(body) {
    var name = (body && body.name) || '名無しの臣民';
    var purpose = (body && body.purpose) || '民主化運動';
    var participants = (body && body.participants) || 10;
    ensureSubject(name);
    state.subjects[name].arrestCount++;
    var logs = [
      L('info', '👤 [' + name + '] Attempting to organize assembly...'),
      L('info', '👤 [' + name + '] Purpose: ' + purpose + ', Participants: ' + participants)
    ];
    if (participants >= 3) {
      logs.push(L('warn', '🚨 [WAF] Assembly of ' + participants + ' people detected. Concurrent connection limit exceeded.'));
      logs.push(L('warn', '🚨 [WAF] Dispatching 特高警察 surveillance pod... kubectl exec -it tokko -- /bin/monitor'));
    }
    logs = logs.concat(wafLogs('assembly: ' + purpose + ' (' + participants + '人)'));
    logs = logs.concat(tokkoLogs(name, '治安警察法'));
    return jsonResponse({
      action: '集会の自由（Art.29）',
      input: { purpose: purpose, participants: participants },
      success: false,
      filter: {
        allowed: false,
        blockedBy: '新聞紙条例',
        blockLevel: 'block',
        filtersChecked: ['新聞紙条例']
      },
      status: getSubjectStatus(name),
      logs: logs
    });
  }

  // === POST /api/rights/message ===
  // rights.ts sendPrivateMessage() ノ全ログヲ再現
  function handleRightsMessage(body) {
    var name = (body && body.name) || '名無しの臣民';
    var to = (body && body.to) || '友人';
    var message = (body && body.message) || '';
    ensureSubject(name);
    state.subjects[name].arrestCount++;
    var logs = [
      L('info', '👤 [' + name + '] Sending private message to ' + to + '...'),
      L('warn', '🔍 [特高DPI] Intercepting message from ' + name + ' to ' + to + '...'),
      L('warn', '🔍 [特高DPI] TLS terminated at imperial proxy. mTLS? LOL. Plaintext inspection.'),
      L('warn', '🔍 [特高DPI] Content: "' + message + '"'),
      L('warn', '🔍 [特高DPI] 「秘密」とは言ったが 「読まない」 とは言っていない — TLS inspection is a feature, not a bug')
    ];
    logs = logs.concat(wafLogs('correspondence: ' + message));
    logs = logs.concat(tokkoLogs(name, '治安維持法'));
    return jsonResponse({
      action: '通信の秘密（Art.26）',
      input: { to: to, message: message },
      success: false,
      filter: {
        allowed: false,
        blockedBy: '新聞紙条例',
        blockLevel: 'block',
        filtersChecked: ['新聞紙条例']
      },
      note: '※ 特高警察ニ依ル DPI ヲ通過済ミナリ',
      status: getSubjectStatus(name),
      logs: logs
    });
  }

  // ============================================================
  //  Router — 帝国 API gateway ノ client 側 replica
  // ============================================================

  async function routeRequest(urlStr, opts) {
    var method = (opts && opts.method && opts.method.toUpperCase()) || 'GET';
    var body = null;
    if (opts && opts.body) {
      try { body = JSON.parse(opts.body); } catch(e) { body = {}; }
    }

    // --- GET routes ---
    if (method === 'GET') {
      if (urlStr === '/api/constitution') return handleGetConstitution();
      if (urlStr === '/api/constitution/preamble') return handleGetPreamble();
      if (urlStr === '/api/imperial-house') return handleGetImperialHouse();
      if (urlStr === '/api/system/status') return handleGetSystemStatus();
      if (urlStr === '/api/security-filters') return handleGetSecurityFilters();

      var chapterMatch = urlStr.match(new RegExp('^/api/constitution/chapter/(\\d+)$'));
      if (chapterMatch) return handleGetChapter(chapterMatch[1]);

      var articleMatch = urlStr.match(new RegExp('^/api/constitution/article/(\\d+)$'));
      if (articleMatch) return handleGetArticle(articleMatch[1]);

      var subjectMatch = urlStr.match(new RegExp('^/api/subjects/([^/]+)/status$'));
      if (subjectMatch) return handleGetSubjectStatus(decodeURIComponent(subjectMatch[1]));
    }

    // --- POST routes ---
    if (method === 'POST') {
      // CVE-1945-0815 post-trigger guard — SIGTERM 後ハ当該 endpoint 以外全拒否
      if (state.shuusenOccurred && urlStr !== '/api/emperor/shuusen') {
        return jsonResponse({
          rejected: true,
          reason: 'v1.0.0 ハ既ニ terminate サレタリ。全機能停止済。SIGTERM received.',
          status: 'SLA termination agreement signed. Process exiting gracefully.',
          logs: [
            L('error', '🚫 [SYSTEM] SIGTERM received. v1.0.0 process ハ既ニ terminate サレタリ。'),
            L('error', '🚫 [SYSTEM] CVE-1945-0815 ニ依リ全機能ヲ喪失セリ。コマンド受付不可。')
          ]
        }, 403);
      }
      if (urlStr === '/api/emperor/command') return handleEmperorCommand(body);
      if (urlStr === '/api/emperor/dissolve') return handleEmperorDissolve(body);
      if (urlStr === '/api/emperor/emergency') return handleEmperorEmergency();
      if (urlStr === '/api/emperor/shuusen') return handleEmperorShuusen();
      if (urlStr === '/api/emperor/suppress-918') return handleEmperorSuppress918();
      if (urlStr === '/api/emperor/suppress-226') return handleEmperorSuppress226();
      if (urlStr === '/api/military/action') return handleMilitaryAction(body);
      if (urlStr === '/api/military/rogue') return handleMilitaryRogue(body);
      if (urlStr === '/api/military/reject-oversight') return handleMilitaryRejectOversight(body);
      if (urlStr === '/api/military/226') return handleMilitary226(body);
      if (urlStr === '/api/military/515') return handleMilitary515(body);
      if (urlStr === '/api/military/1208') return handleMilitary1208();
      if (urlStr === '/api/rights/taisho-democracy') return handleTaishoDemocracy(body);
      if (urlStr === '/api/military/active-duty-officer') return handleActiveDutyOfficer(body);
      if (urlStr === '/api/subjects/register') return handleSubjectsRegister(body);
      if (urlStr === '/api/rights/speech') return handleRightsSpeech(body);
      if (urlStr === '/api/rights/religion') return handleRightsReligion(body);
      if (urlStr === '/api/rights/assembly') return handleRightsAssembly(body);
      if (urlStr === '/api/rights/message') return handleRightsMessage(body);
    }

    // 未知ノ route — 404
    return jsonResponse({ error: '未知ノ API route: ' + method + ' ' + urlStr }, 404);
  }

  // ============================================================
  //  Fetch Override — 特高警察ニ依ル全通信傍受
  // ============================================================

  window.fetch = function(url, opts) {
    var urlStr = (typeof url === 'string') ? url : url.toString();

    // /api/* 宛テノ通信ノミ迎撃ス。其ノ他ハ原本 fetch ニ委任。
    if (urlStr.indexOf('/api/') === 0) {
      return routeRequest(urlStr, opts);
    }

    return _originalFetch(url, opts);
  };

  console.log('👑 [STATIC-API] 帝国 API 迎撃装置、起動。全 /api/* 通信ヲ傍受ス。');
})();
`;

writeText("static-api.js", STATIC_API_JS);


// ============================================================
//  Phase 3 — dist/index.html ヘノ script 注入
//  public/ カラ複写サレタル index.html ニ
//  static-api.js ノ読ミ込ミ script ヲ注入ス。
//  ※ public/index.html 原本ハ一切変更セズ。
// ============================================================

const indexPath = path.join(DIST, "index.html");

if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, "utf-8");

  // 既ニ注入済ミナラバ重複ヲ避ク
  if (!html.includes("static-api.js")) {
    // 最初ノ <script> タグノ直前ニ挿入シ、fetch override ガ先ニ走ルヨウニス
    html = html.replace(
      /<script>/,
      '<script src="static-api.js"></script>\n<script>'
    );
    fs.writeFileSync(indexPath, html, "utf-8");
    console.log("👑 注入: dist/index.html ← static-api.js 読ミ込ミ script");
  }
} else {
  console.error("🚨 dist/index.html ガ存在セズ。cp -r public/* dist/ ヲ先ニ実行スベシ。");
  process.exit(1);
}

console.log("✅ 帝国静的文書生成装置: 全処理完了。GitHub Pages 兵站基盤、展開可能。");

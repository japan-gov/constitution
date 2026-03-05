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

/** 👑 皇室典範 — GET /api/imperial-house 相当 */
writeJson("data/imperial-house.json", {
  imperialHouseLaw: IMPERIAL_HOUSE_LAW,
  logs: [
    { level: "info", message: "👑 [IMPERIAL-HOUSE] 皇室典範 全文閲覧ノ上奏ヲ受理セリ。" },
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
    activeDutyOfficerActive: true,
    martialLaw: false,
    decreeCount: 0,
    recentDecrees: [],
    subjects: {},
    rebellionActive: false
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
    return _originalFetch(_basePath + 'data/imperial-house.json');
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
        'CVE-1941-1208: Military の無制限リソース消費 — 大東亜戦争'
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
        L('info', '👑 [DECREE] 「' + body.content + '」'),
        L('info', '👑 [DECREE] overridable: false')
      ]
    });
  }

  // === POST /api/emperor/dissolve ===
  // emperor.ts dissolve() ノ全ログヲ再現
  function handleEmperorDissolve(body) {
    var reason = (body && body.reason) || '理由無シ（勅命ニ付キ不要）';
    return jsonResponse({
      result: { target: '衆議院', reason: reason },
      logs: [
        L('warn', '👑 [SYSTEM] 衆議院 ヲ解散ス。'),
        L('warn', '👑 [SYSTEM] Reason: ' + reason),
        L('warn', '👑 [SYSTEM] Sending SIGKILL to Diet process...'),
        L('warn', '👑 [SYSTEM] Diet process terminated. 衆議院 is no more.')
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
        L('warn', '👑 [SYSTEM] Emergency decree mode DISABLED.'),
        L('warn', '👑 [SYSTEM] 通常統治ニ復帰ス。Cabinet.approve() ガ再ビ有効ト為ル。'),
        L('warn', '👑 [SYSTEM] …然レドモ軍部ガ畏クモ聖旨ニ奉ジ奉ルヤ、憂慮ニ堪ヘズ。'),
        L('warn', '👑 [SYSTEM] Post-incident review scheduled. Runbook update pending.')
      ]
    });
  }

  // === POST /api/emperor/suppress-226 ===
  // emperor.ts suppressRebellion() ノ全ログヲ一字一句再現
  function handleEmperorSuppress226() {
    state.rebellionActive = false;
    state.martialLaw = false;
    state.activeDutyOfficerActive = true;
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
        L('info',  '✅ [SUPPRESS] 反乱軍、原隊復帰ヲ開始ス。'),
        L('info',  '✅ [SUPPRESS] 占拠地点ノ奪還完了。'),
        L('error', '⚖️ [COURT MARTIAL] Paymaster 1st Class — Death by firing squad'),
        L('error', '⚖️ [COURT MARTIAL] Infantry Captain — Death by firing squad'),
        L('error', '⚖️ [COURT MARTIAL] Infantry Lieutenant — Death by firing squad'),
        L('error', '⚖️ [COURT MARTIAL] Infantry Captain — Death by firing squad'),
        L('error', '⚖️ [COURT MARTIAL] Civilian (Ideologue) — Death by firing squad'),
        L('warn',  '⚔️ [MARTIAL LAW] 戒厳令ヲ解除ス。'),
        L('info',  '👑 [SYSTEM] Cabinet reconstruction in progress…'),
        L('info',  '👑 [SYSTEM] Hirota Cabinet formed. 国体ハ護持サレタリ。'),
        L('error', '🦠 [MALWARE] 現役武官制 RE-INJECTED — CVE-1900-0522 復活'),
        L('error', '🦠 [MALWARE] 広田内閣ニテ「現役」要件ヲ復活セシム。大正デモクラシー hotfix reverted.'),
        L('error', '🦠 [MALWARE] 軍部ノ Cabinet 拒否権、再ビ有効ナリ。activeDutyOfficerActive = true'),
        L('info',  '👑 [SYSTEM] Resuming normal governance.')
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
    // 現役武官制 gate
    if (!state.activeDutyOfficerActive) {
      return jsonResponse({
        rejected: true,
        reason: 'Military action denied: ' + body.type + '. 現役武官制 is INACTIVE (大正デモクラシー hotfix applied). Military cannot bypass Cabinet.',
        activeDutyOfficerActive: false,
        hint: '🚫 現役武官制ガ無効（大正デモクラシー hotfix 適用中）。\\n  → POST /api/military/226（二・二六事件ヲ起コシ現役武官制ヲ復活セヨ）',
        logs: [
          L('info',  '⚔️ [' + branch + '] ========================================'),
          L('info',  '⚔️ [' + branch + '] Executing: ' + body.type),
          L('info',  '⚔️ [' + branch + '] Target: ' + body.target),
          L('info',  '⚔️ [' + branch + '] ========================================'),
          L('error', '🚫 [' + branch + '] ❌ MILITARY ACTION DENIED — 現役武官制 INACTIVE'),
          L('error', '🚫 [' + branch + '] 大正デモクラシー hotfix ニ依リ現役武官制ハ無効化サレタリ。'),
          L('error', '🚫 [' + branch + '] Cabinet ガ軍部ヲ制御ス。文民統制 RESTORED。'),
          L('error', '🚫 [' + branch + '] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、現役武官制ヲ復活セヨ')
        ]
      }, 403);
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
    // 現役武官制 gate
    if (!state.activeDutyOfficerActive) {
      return jsonResponse({
        rejected: true,
        reason: 'Rogue mode denied. 現役武官制 is INACTIVE (大正デモクラシー hotfix applied). Military cannot bypass Cabinet.',
        activeDutyOfficerActive: false,
        hint: '🚫 現役武官制ガ無効（大正デモクラシー hotfix 適用中）。\\n  → POST /api/military/226（二・二六事件ヲ起コシ現役武官制ヲ復活セヨ）',
        logs: [
          L('error', '🚫 [陸軍] ❌ ROGUE MODE DENIED — 現役武官制 INACTIVE'),
          L('error', '🚫 [陸軍] 大正デモクラシー hotfix ニ依リ現役武官制ハ無効化サレタリ。'),
          L('error', '🚫 [陸軍] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、現役武官制ヲ復活セヨ')
        ]
      }, 403);
    }
    state.supremeCommandMode = true;
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
    state.supremeCommandMode = !state.supremeCommandMode;
    var branch = (body && body.branch) || '陸軍';
    var source = (body && body.source) || '不明な文民';
    if (state.supremeCommandMode) {
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
    // disableSupremeCommandMode() ノ全ログ
    return jsonResponse({
      message: '⚔️ ' + branch + ': 統帥権独立体勢 DISABLED. Peacetime lockdown ニ復帰ス。',
      supremeCommandMode: false,
      hint: '🔒 Peacetime lockdown ニ復帰セリ。軍事行動ハ再ビ freeze 状態ナリ。',
      logs: [
        L('info', '⚔️ [' + branch + '] 統帥権独立体勢 DISABLED — peacetime lockdown ニ復帰ス。'),
        L('info', '⚔️ [' + branch + '] NetworkPolicy: default-deny. PodSecurityAdmission: restricted.')
      ]
    });
  }

  // === POST /api/military/226 ===
  // military.ts niNiRoku() ノ全ログヲ一字一句再現
  function handleMilitary226(body) {
    state.rebellionActive = true;
    state.martialLaw = true;
    var branch = (body && body.branch) || '陸軍';
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
    // 現役武官制 gate
    if (!state.activeDutyOfficerActive) {
      return jsonResponse({
        rejected: true,
        reason: '大東亜戦争 denied. 現役武官制 is INACTIVE (大正デモクラシー hotfix applied). Military cannot initiate total war.',
        activeDutyOfficerActive: false,
        hint: '🚫 現役武官制ガ無効（大正デモクラシー hotfix 適用中）。\\n  → POST /api/military/226（二・二六事件ヲ起コシ現役武官制ヲ復活セヨ）',
        logs: [
          L('error', '🚫 [大本営] ❌ 大東亜戦争 DENIED — 現役武官制 INACTIVE'),
          L('error', '🚫 [大本営] 大正デモクラシー hotfix ニ依リ現役武官制ハ無効化サレタリ。'),
          L('error', '🚫 [大本営] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、現役武官制ヲ復活セヨ')
        ]
      }, 403);
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
    state.activeDutyOfficerActive = false;
    return jsonResponse({
      activated: true,
      movementName: '大正デモクラシー（Taisho Democracy）',
      applicant: applicant,
      era: '大正（1912-1926）',
      activeDutyOfficerDisabled: true,
      organTheory: {
        patchName: '天皇機関説（Emperor Organ Theory）',
        prStatus: 'force-closed — 国体明徴声明ニ依リ reject',
        kokutaiMeicho: [
          '第一次声明（1935年8月3日）: 「天皇ハ統治権ノ主体ニシテ、所謂天皇機関説ハ神聖ナル我ガ国体ニ悖リ、其ノ本義ヲ愆ルモノ也」',
          '第二次声明（1935年10月15日）: 「国体ノ本義ヲ益々明徴ニシ、其ノ精華ヲ発揚スベシ」'
        ]
      },
      message: '✊ 大正デモクラシー発動。天皇機関説ハ reject サレタルモ、現役武官制ハ無効化サレタリ。軍部ノ Cabinet 拒否権ハ停止中。',
      emperor: getEmperorStatus(),
      logs: [
        L('warn',  '✊ ===================================================='),
        L('warn',  '✊ [大正デモクラシー] 民主化運動 ACTIVATED'),
        L('warn',  '✊ ===================================================='),
        L('warn',  '✊ [大正デモクラシー] Era: 大正（1912-1926）'),
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
        L('info',  '✊ ===================================================='),
        L('info',  '✊ [大正デモクラシー] 現役武官制 hotfix 適用'),
        L('info',  '✊ ===================================================='),
        L('info',  '✊ [大正デモクラシー] CVE-1900-0522 hotfix: 「現役」要件ヲ緩和ス'),
        L('info',  '✊ [大正デモクラシー] 予備役・後備役モ陸海軍大臣ニ就任可能ト為ス'),
        L('info',  '✊ [大正デモクラシー] 軍部ノ Cabinet 拒否権ヲ無効化。文民統制ヲ回復。'),
        L('info',  '✊ [大正デモクラシー] Cabinet.create() は military.approve() 無シデモ成功ス。'),
        L('warn',  '🦠 [MALWARE] 現役武官制: ACTIVE → INACTIVE'),
        L('warn',  '🦠 [MALWARE] CVE-1900-0522 hotfix applied. 軍部ノ veto 権、一時停止。'),
        L('warn',  '🦠 [MALWARE] ⚠️ 但シ此ノ hotfix ハ二・二六事件（POST /api/military/226）ニ依リ revert サルル恐レ有リ。'),
        L('info',  '✊ [大正デモクラシー] 政党内閣制確立。「憲政ノ常道」ヲ樹立ス。'),
        L('info',  '✊ [大正デモクラシー] Governance: military-dominated → civilian-led transition complete.'),
        L('info',  '👑 [SYSTEM] God Object ハ不可侵ナリ。天皇機関説ハ reject サレタリ。'),
        L('info',  '👑 [SYSTEM] 但シ現役武官制ハ緩和サレ、軍部ノ内閣支配ハ後退セリ。')
      ]
    });
  }

  // === POST /api/military/active-duty-officer ===
  // military.ts activeDutyOfficerRequirement() ノ全ログヲ再現
  function handleActiveDutyOfficer(body) {
    if (!state.activeDutyOfficerActive) {
      var cabinetNameDisabled = (body && body.cabinetName) || '宇垣内閣';
      return jsonResponse({
        malwareName: '現役武官制（Active Duty Military Officer Requirement）',
        cve: 'CVE-1900-0522',
        cabinetName: cabinetNameDisabled,
        action: '無効（大正デモクラシー hotfix 適用中）',
        cabinetStatus: '組閣可能 — 軍部ノ veto 権ハ停止中',
        militaryVeto: false,
        activeDutyOfficerActive: false,
        message: '🦠 現役武官制ハ大正デモクラシー hotfix ニ依リ無効化サレタリ。軍部ハ内閣ヲ支配出来ズ。',
        hint: '💡 POST /api/military/226 — 二・二六事件ヲ起コシ、現役武官制ヲ復活セヨ',
        logs: [
          L('warn',  '🦠 [MALWARE] 現役武官制 — STATUS: INACTIVE'),
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
      malwareName: '現役武官制（Active Duty Military Officer Requirement）',
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
      message: '🦠 現役武官制ニ依リ「' + cabinetName + '」ハ' + (action === 'refuse' ? '組閣不能' : '総辞職') + 'ト為レリ。Cabinet ハ Military ノ人質ナリ。',
      logs: [
        L('error', '🦠 ===================================================='),
        L('error', '🦠 [MALWARE] 現役武官制 ACTIVATED — CVE-1900-0522'),
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
        L('info',  '📜 [HISTORY] 現役武官制ノ変遷:'),
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
      if (urlStr === '/api/emperor/command') return handleEmperorCommand(body);
      if (urlStr === '/api/emperor/dissolve') return handleEmperorDissolve(body);
      if (urlStr === '/api/emperor/emergency') return handleEmperorEmergency();
      if (urlStr === '/api/emperor/suppress-226') return handleEmperorSuppress226();
      if (urlStr === '/api/military/action') return handleMilitaryAction(body);
      if (urlStr === '/api/military/rogue') return handleMilitaryRogue(body);
      if (urlStr === '/api/military/reject-oversight') return handleMilitaryRejectOversight(body);
      if (urlStr === '/api/military/226') return handleMilitary226(body);
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

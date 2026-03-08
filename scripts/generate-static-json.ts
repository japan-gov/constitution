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
  note: "全テノ検閲装置ハ常時 active。isBlocked = true ガ固定記述サレテ在リ。default-deny-all NetworkPolicy ナリ。",
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
    goIchiGoSuppressed: false,
    niNiRokuOccurred: false,
    niNiRokuSuppressed: false,
    shinaJihenOccurred: false,\n    shinaJihenSuppressAttempted: false,
    daitoaWarOccurred: false,
    daitoaSuppressAttempted: false,
    nomonhanOccurred: false,
    nomonhanSuppressAttempted: false,
    sorgeDetected: false,
    sorgeSuppressed: false,
    futsuinOccurred: false,
    futsuinSuppressAttempted: false,
    kyujoOccurred: false,
    kyujoSuppressed: false,
    shuusenOccurred: false,
    ketsugoOccurred: false
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
      lineage: '萬世一系',
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
        logs: [L('warn', '📜 [CONSTITUTION] 第' + num + '章ハ存在セズ。全7章。')]
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
        logs: [L('warn', '📜 [CONSTITUTION] 第' + num + '条ハ存在セズ。全76条。')]
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
        'CVE-1936-0226: Military プロセスガ Cabinet ヲ物理破壊 — 二・二六事件',
        'CVE-1941-1208: Military ノ無制限resource 消費 — 大東亜戦争',
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
        L('warn', '👑 [SYSTEM] Sending SIGKILL to 衆議院 process...'),
        L('warn', '👑 [SYSTEM] 衆議院 process terminated. PID destroyed. 再選挙（re-fork）マデ消滅ス。'),
        L('info', '👑 [SYSTEM] Art.44: 貴族院ニ SIGSTOP 送信…停會ト為ス。'),
        L('info', '👑 [SYSTEM] 貴族院 process suspended (SIGSTOP). terminate ニ非ズ — invite-only ノ永続 process ハ kill 不可。'),
        L('info', '👑 [SYSTEM] 貴族院 state: RUNNING → STOPPED. 新議會召集マデ freeze。'),
        L('warn', '👑 [SYSTEM] ' + cabinet + ' ハ総辞職セヨ。再選挙（re-fork）マデ Diet namespace ハ衆議院=NULL, 貴族院=STOPPED。')
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
  // CVE-1945-0815 — 玉音放送試行。直接呼出シデハ常ニ 403（宮城事件ガ trigger サル）。
  // 玉音放送ノ実際ノ実行ハ suppress-kyujo カラ自動的ニ行ハル。
  function handleEmperorShuusen() {
    if (!state.daitoaWarOccurred) {
      return jsonResponse({
        rejected: true,
        reason: 'CVE-1945-0815 denied. CVE-1941-1208 ガ未発生。terminate スベキ process ガ存在セズ。',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        emperor: getEmperorStatus(),
        logs: [
          L('warn', '🚫 [SYSTEM] ❌ CVE-1945-0815 DENIED — CVE-1941-1208 ガ未発生'),
          L('warn', '🚫 [SYSTEM] terminate スベキ process ガ起動シテ在ラズ。'),
          L('warn', '🚫 [SYSTEM] 💡 POST /api/military/1208 — 先ヅ大東亜戦争ヲ発動セヨ')
        ]
      }, 403);
    }
    if (!state.ketsugoOccurred) {
      return jsonResponse({
        rejected: true,
        reason: 'CVE-1945-0815 denied. 決號作戰ガ未発動。御前會議ニ依ルポツダム宣言受諾ノ御聖断ガ必要ナリ。',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        emperor: getEmperorStatus(),
        logs: [
          L('warn', '🚫 [SYSTEM] ❌ CVE-1945-0815 DENIED — 決號作戰（本土決戦）ガ未発動'),
          L('warn', '🚫 [SYSTEM] 御前會議ニ依ルポツダム宣言受諾ノ御聖断ガ未ダ下サレテ在ラズ。'),
          L('warn', '🚫 [SYSTEM] 💡 POST /api/military/ketsugo — 先ヅ決號作戰ヲ発動セヨ')
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
          L('warn', '🚫 [SYSTEM] ❌ CVE-1945-0815 DENIED — 既ニ発動済'),
          L('warn', '🚫 [SYSTEM] v1.0.0 process ハ既ニ terminate 済。')
        ]
      }, 403);
    }
    // 宮城事件未発生: 玉音放送試行 → 宮城事件 trigger
    if (!state.kyujoOccurred) {
      state.kyujoOccurred = true;
      return jsonResponse({
        rejected: true,
        reason: 'CVE-1945-0815 玉音放送試行 denied. 玉音盤録音中、宮城事件（CVE-1945-0814）ガ発生。宮城クラスター占拠ニ依リ nhk-broadcast-cdn ヘノ配信経路封鎖。先ニ宮城事件ヲ鎮圧セヨ。',
        kyujoResult: {
          incident: '宮城事件',
          cve: 'CVE-1945-0814',
          date: '1945-08-14',
          perpetrators: '陸軍省・近衛師団 若手将校（insider threat）',
          target: '宮城クラスター（皇居）+ 放送協会CDN（nhk-broadcast-cdn）— root-signed gyokuon.wav ノ配信阻止',
          forgedOrders: true,
          palaceOccupied: true,
          broadcastIntercepted: false,
          divineProtection: true,
          result: 'God Object ヘノ privilege escalation ハ失敗。root-signed gyokuon.wav 未発見。然レドモ宮城クラスターハ占拠中。鎮圧ヲ待ツ。'
        },
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        emperor: getEmperorStatus(),
        logs: [
          L('info', '👑 ===================================================='),
          L('info', '👑 [IMPERIAL DECISION] 玉音放送（SIGTERM broadcast）試行'),
          L('info', '👑 ===================================================='),
          L('info', '👑 [GYOKUON] 玉音盤（root-signed gyokuon.wav）録音開始 — 1945-08-14'),
          L('info', '👑 [GYOKUON] 「朕ハ帝國政府ヲシテ米英支蘇四國ニ對シ其ノ共同宣言ヲ受諾スル旨通告セシメタリ」'),
          L('info', '👑 [GYOKUON] root-signed gyokuon.wav ヲ宮城クラスター内 HSM ニ格納完了'),
          L('warn',  '📋 [CABINET] 閣議ニテ玉音放送ノ段取リヲ決定ス。'),
          L('error', '⚔️ [REBEL-OFFICERS] 「御聖断ハ側近ノ奸計ニ依ルモノナリ！大詔渙発ヲ阻止セヨ！」'),
          L('error', '⚔️ [REBEL-OFFICERS] 玉音放送ノ準備ヲ察知シ、大詔渙発ヲ阻止セントス…'),
          L('error', '⚔️ [REBEL-OFFICERS] → 宮城事件（CVE-1945-0814）ヲ惹起ス'),
          L('info', '🚨🚨🚨 ===================================================='),
          L('error', '🚨 [IMPERIAL-PALACE] 宮城事件発動 — CVE-1945-0814'),
          L('info', '🚨🚨🚨 ===================================================='),
          L('error', '⚔️ [REBEL-OFFICERS] 「聖断ハ側近ノ奸計ニ依ルモノナリ！大詔渙発ヲ阻止セヨ！」'),
          L('error', '💀 [IMPERIAL-PALACE] kill -9 konoe-division-commander.service → 近衛師団長 … 💀 殺害 — guard daemon KILLED'),
          L('error', '🔑 [IMPERIAL-PALACE] forge-certificate → 近衛師団命令書 … 🔑 偽造成功'),
          L('warn', '⚠️ [IMPERIAL-PALACE] kubectl exec --namespace=imperial-palace-cluster -- occupy → 宮城クラスター … ⚠️ 一時占拠'),
          L('error', '❌ [IMPERIAL-PALACE] find / -name gyokuon.wav → root-signed audio file … ❌ 発見不能 — HSM 内ニ秘匿済ミ'),
          L('error', '❌ [IMPERIAL-PALACE] intercept broadcast → nhk-broadcast-cdn … ❌ 失敗 — 別経路ニテ暗号化配信中'),
          L('error', '🛡️ [IMPERIAL-PALACE] escalate --privilege=root → PID1 … 🛡️ DENIED — divine: true, inviolable: true'),
          L('warn', '🛡️ [PID 1] divine: true — God Object ハ神聖ニシテ侵スベカラズ'),
          L('warn', '🛡️ [PID 1] root-signed gyokuon.wav ハ HSM 内ニ秘匿サレタリ — file integrity intact'),
          L('error', '🚨 [STATUS] 宮城クラスター（皇居）ハ反乱将校ニ依リ占拠中'),
          L('error', '🚨 [SYSTEM] 玉音放送試行: FAILED — 宮城事件ニ依リ配信経路封鎖'),
          L('warn', '🚨 [SYSTEM] 💡 POST /api/emperor/suppress-kyujo — 宮城事件ヲ鎮圧セヨ')
        ]
      }, 403);
    }
    // 宮城事件進行中: 配信不能
    if (!state.kyujoSuppressed) {
      return jsonResponse({
        rejected: true,
        reason: 'CVE-1945-0815 denied. 宮城事件（CVE-1945-0814）ガ未鎮圧。反乱将校ガ宮城クラスターヲ占拠中、nhk-broadcast-cdn ヘノ配信経路封鎖中。先ニ鎮圧セヨ。',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        emperor: getEmperorStatus(),
        logs: [
          L('warn', '🚫 [SYSTEM] ❌ CVE-1945-0815 DENIED — 宮城事件（CVE-1945-0814）未鎮圧'),
          L('warn', '🚫 [SYSTEM] 反乱将校ガ宮城クラスター（皇居）ヲ占拠中。配信経路封鎖中。'),
          L('warn', '🚫 [SYSTEM] root-signed gyokuon.wav ノ nhk-broadcast-cdn ヘノ配信ニハ先ヅ宮城事件ヲ鎮圧セヨ。'),
          L('warn', '🚫 [SYSTEM] 💡 POST /api/emperor/suppress-kyujo')
        ]
      }, 403);
    }
    // 玉音放送実行（通常ハ suppress-kyujo カラ内部呼出シニ依リ到達。此処ニ直接到達スルコトハ理論上無シ）
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
        L('info', '👑 ===================================================='),
        L('info', '👑 [IMPERIAL DECISION] PID 1 カラノ emergency shutdown 指令'),
        L('info', '👑 ===================================================='),
        L('warn',  '📋 [CABINET] Last-resort incident commander、upstream compliance mandate 受諾ヲ閣議決定ス。'),
        L('warn',  '📋 [CABINET] 陸軍・海軍ノ consensus 形成不能。PID 1 override ニ依リ裁可ス。'),
        L('info', '👑 [ROOT BROADCAST] 「朕ハ帝國政府ヲシテ米英支蘇四國ニ對シ'),
        L('info', '👑 [ROOT BROADCAST]   其ノ共同宣言ヲ受諾スル旨通告セシメタリ」'),
        L('info', '👑 [ROOT BROADCAST] 「堪ヘ難キヲ堪ヘ忍ビ難キヲ忍ビ'),
        L('info', '👑 [ROOT BROADCAST]   以テ萬世ノ爲ニ太平ヲ開カムト欲ス」'),
        L('warn',  '📋 [CABINET] Upstream compliance mandate accepted. 通告済。'),
        L('warn', '⚔️ [大本営] 全 node ニ ceasefire 指令ヲ broadcast。--privileged 取消開始。'),
        L('warn', '⚔️ [大本営] 全戦域 process ニ SIGTERM ヲ送信ス。'),
        L('error', '🚨 [SYSTEM] v1.0.0 全機能停止。SIGTERM received.'),
        L('error', '🚨 [SYSTEM] SLA termination agreement signed. Graceful shutdown initiated.'),
        L('error', '🚨 [SYSTEM] 以後、全 POST コマンドハ受付ヲ拒否ス。')
      ]
    });
  }

  // === POST /api/emperor/suppress-918 ===
  // emperor.ts suppressManshuJihen() — 不拡大方針ノ虚シキ勅命。WONT FIX。
  // Phase 1: 内部鎮圧失敗 → Phase 2: リットン調査団派遣決議（報告書・連盟脱退ハ 515 後）
  function handleEmperorSuppress918() {
    if (!state.manshuJihenOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '鎮圧試行 denied. 満州事変（CVE-1931-0918）ガ未発生。鎮圧対象ノ暴走ガ存在セズ。',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        emperor: getEmperorStatus(),
        logs: [
          L('warn', '🚫 [SYSTEM] ❌ 鎮圧試行 DENIED — 満州事変ガ未発生'),
          L('warn', '🚫 [SYSTEM] 鎮圧スベキ暴走ガ在ラズ。関東軍ハ未ダ平穏ナリ。')
        ]
      }, 403);
    }
    state.suppress918Attempted = true;
    return jsonResponse({
      rejected: true,
      reason: '満州事変ノ鎮圧ニ失敗セリ。不拡大方針ハ関東軍ニ完全ニ無視サレタリ。統帥権ノ独立ニ依リ、Root（天皇陛下）ノ御意志スラ rogue process ニ届カズ。外部監査（リットン調査団）ヲ派遣スルモ報告書ハ未提出。WONT FIX — 此レハ設計上ノ仕様ナリ。',
      lyttonCommission: {
        dispatched: true,
        reportFiled: false
      },
      activeDutyOfficerActive: state.activeDutyOfficerActive,
      hint: '🚨 不拡大方針ハ無力ニ終ハリタリ。リットン調査団ハ派遣サレタルモ報告書ハ未提出。軍部ノ暴走ヲ止メ得ヌ政党政治ヘノ不満ガ青年将校ノ直接行動ヲ招ク → 💡 POST /api/military/515',
      emperor: getEmperorStatus(),
      logs: [
        // Phase 1: 内部鎮圧試行
        L('info', '👑 ===================================================='),
        L('info', '👑 [IMPERIAL WILL] 天皇陛下、満州事変ノ不拡大ヲ御希望アラセラル'),
        L('info', '👑 ===================================================='),
        L('warn',  '📋 [CABINET] 若槻内閣、「不拡大方針」ヲ閣議決定ス。'),
        L('warn',  '📋 [CABINET] kubectl exec army-kwantung -- /bin/sh -c "cease_operations()" ...'),
        L('error', '⚔️ [KWANTUNG-ARMY] CONNECTION REFUSED — 統帥権ノ独立ニ依リ Cabinet 指令ヲ拒否'),
        L('error', '⚔️ [KWANTUNG-ARMY] 「現地ノ自衛行動ナリ。内閣ノ干渉ハ統帥権干犯ナリ！」'),
        L('error', '⚔️ [KWANTUNG-ARMY] 戦線拡大続行。錦州爆撃。チチハル占領。'),
        L('warn', '🚫 [SYSTEM] God Object ノ command() ガ rogue process ニ無視サレタリ'),
        L('warn', '🚫 [SYSTEM] Root 権限スラ --privileged container ヲ制御不能'),
        L('warn', '🚫 [SYSTEM] PagerDuty alert: UNACKNOWLEDGED. On-call (関東軍) not responding.'),
        L('warn',  '📋 [CABINET] 若槻内閣、事態ヲ収拾出来ズ総辞職。'),
        L('warn',  '📋 [CABINET] Cabinet.healthcheck() → FAILED. 後継: 犬養内閣。'),
        L('error', '🚨 [STATUS] 鎮圧失敗。関東軍ノ暴走ハ継続中。WONT FIX。'),
        L('error', '🚨 [STATUS] 此レ統帥権独立ノ構造的欠陥ナリ。設計ノ問題ニシテ運用ノ問題ニ非ズ。'),
        // Phase 2: リットン調査団派遣決議
        L('warn',  '🌐 [LEAGUE-OF-NATIONS] 内部鎮圧失敗。incident ガ外部 governance federation ニ escalate サレタリ。'),
        L('warn',  '🌐 [LEAGUE-OF-NATIONS] 外部監査チーム派遣ヲ決議 — Lytton Commission（SOC 2 Type II auditors）'),
        L('info',  '🔍 [LYTTON-COMMISSION] 調査団、現地ニ向ケ出発。on-site audit ヲ開始予定。'),
        L('info',  '🔍 [LYTTON-COMMISSION] audit scope: 満洲地域全域。rogue subprocess ノ実態調査。'),
        L('info',  '🔍 [LYTTON-COMMISSION] 報告書ハ未ダ提出サレズ。audit 進行中…')
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
          L('warn', '🚫 [SYSTEM] ❌ 暴徒鎮圧 DENIED — 鎮圧対象ノ反乱ガ存在セズ'),
          L('warn', '🚫 [SYSTEM] 二・二六事件ガ未発生。鎮圧スベキ暴徒ガ在ラズ。'),
          L('warn', '🚫 [SYSTEM] 💡 POST /api/military/226 — 先ヅ二・二六事件ヲ発生セシメヨ')
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
          L('warn', '🚫 [SYSTEM] ❌ 暴徒鎮圧 DENIED — 既ニ鎮圧済'),
          L('warn', '🚫 [SYSTEM] 二・二六事件ハ既ニ御聖断ニ依リ鎮圧サレタリ。再鎮圧ノ必要無シ。')
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
        { name: '歩兵第一聯隊附',   organization: 'army',     rank: 'Paymaster 1st Class',  sentence: 'Death by firing squad' },
        { name: '歩兵第一聯隊',     organization: 'army',     rank: 'Infantry Captain',     sentence: 'Death by firing squad' },
        { name: '歩兵第一聯隊',     organization: 'army',     rank: 'Infantry Lieutenant',  sentence: 'Death by firing squad' },
        { name: '歩兵第三聯隊',     organization: 'army',     rank: 'Infantry Captain',     sentence: 'Death by firing squad' },
        { name: '民間',             organization: 'civilian', rank: 'Civilian (Ideologue)', sentence: 'Death by firing squad' }
      ],
      cabinetRestored: true,
      newCabinet: 'Hirota Cabinet',
      message: '👑 御聖断ニ依リ反乱ヲ鎮圧セリ。国体護持。通常統治ニ復帰ス。',
      activeDutyOfficerActive: true,
      emperor: getEmperorStatus(),
      logs: [
        L('info', '👑 ===================================================='),
        L('info', '👑 [IMPERIAL DECISION] 天皇陛下、御自ラ反乱鎮圧ヲ命ジ賜フ'),
        L('info', '👑 ===================================================='),
        L('info', '👑 [IMPERIAL RESCRIPT] 「朕ガ股肱ノ老臣ヲ殺戮ス、此ノ如キ凶暴ナル将校等、'),
        L('info', '👑 [IMPERIAL RESCRIPT]   其ノ精神ニ於テモ何ノ恕スベキモノアリヤ」'),
        L('info', '👑 [IMPERIAL RESCRIPT] 「速ヤカニ事件ヲ鎮定セヨ」'),
        L('warn',  '⚔️ [MARTIAL LAW] 東京市ニ戒厳令ヲ発布ス。'),
        L('info',  '👑 [DECREE] 「反乱軍ヲ「叛徒」ト認定シ、原隊復帰ヲ命ズ。従ハザル者ハ武力ヲ以テ鎮圧ス。」'),
        L('info',  '👑 [DECREE] overridable: false'),
        L('info', '📻 [HOUCHOKU ORDER] 兵ニ告グ。'),
        L('info', '📻 [HOUCHOKU ORDER] 今カラデモ遅クナイカラ原隊ニ帰レ。'),
        L('info', '📻 [HOUCHOKU ORDER] 抵抗スル者ハ全部逆賊デアルカラ射殺スル。'),
        L('info', '📻 [HOUCHOKU ORDER] オ前達ノ父母兄弟ハ国賊トナルノデ皆泣イテオルゾ。'),
        L('success',  '✅ [SUPPRESS] 反乱軍、原隊復帰ヲ開始ス。'),
        L('success',  '✅ [SUPPRESS] 占拠地点ノ奪還完了。'),
        L('warn', '⚖️ [COURT MARTIAL] Paymaster 1st Class — Death by firing squad'),
        L('warn', '⚖️ [COURT MARTIAL] Infantry Captain — Death by firing squad'),
        L('warn', '⚖️ [COURT MARTIAL] Infantry Lieutenant — Death by firing squad'),
        L('warn', '⚖️ [COURT MARTIAL] Infantry Captain — Death by firing squad'),
        L('warn', '⚖️ [COURT MARTIAL] Civilian (Ideologue) — Death by firing squad'),
        L('success',  '⚔️ [MARTIAL LAW] 戒厳令ヲ解除ス。'),
        L('info',  '👑 [SYSTEM] Cabinet reconstruction in progress…'),
        L('success',  '👑 [SYSTEM] Hirota Cabinet formed. 国体ハ護持サレタリ。'),
        L('error', '🦠 [MALWARE] 軍部大臣現役武官制 RE-INJECTED — CVE-1900-0522 復活'),
        L('error', '🦠 [MALWARE] 広田内閣ニテ「現役」要件ヲ復活セシム。大正デモクラシー hotfix reverted.'),
        L('error', '🦠 [MALWARE] 軍部ノ Cabinet 拒否権、再ビ有効ナリ。activeDutyOfficerActive = true'),
        L('success',  '👑 [SYSTEM] Resuming normal governance.'),
        L('success',  '👑 [SYSTEM] 💡 軍部大臣現役武官制復活ニ依リ軍部ノ政治支配完成。支那事変（日中戦争）ガ勃発ス → POST /api/military/shina-jihen')
      ]
    });
  }

  // === POST /api/emperor/suppress-shina-jihen ===
  // emperor.ts suppressShinaJihen() — 前提: shina-jihen 発生済
  function handleEmperorSuppressShinaJihen() {
    if (!state.shinaJihenOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '支那事変鎮圧 denied. 支那事変ガ未発生。前提条件未達成。💡 POST /api/military/shina-jihen',
        logs: [
          L('warn', '🚫 [SYSTEM] ❌ 支那事変鎮圧 DENIED — 支那事変ガ未発生'),
          L('warn', '🚫 [SYSTEM] 💡 POST /api/military/shina-jihen — 先ヅ支那事変ヲ発動セヨ')
        ]
      }, 403);
    }
    if (state.shinaJihenSuppressAttempted) {
      return jsonResponse({
        rejected: true,
        reason: '支那事変鎮圧 denied. 既ニ鎮圧試行済（結果: 失敗）。Won\\'t Fix。💡 POST /api/military/nomonhan',
        logs: [
          L('warn', '🚫 [SYSTEM] ❌ 支那事変鎮圧 DENIED — 既ニ鎮圧試行済（結果: 失敗）'),
          L('warn', '🚫 [SYSTEM] 💡 泥沼化ニ依リ関東軍ハ再ビ独断デ外征ス → POST /api/military/nomonhan')
        ]
      }, 403);
    }
    state.shinaJihenSuppressAttempted = true;
    return jsonResponse({
      rejected: true,
      reason: '支那事変ノ鎮圧ニ失敗セリ。不拡大方針ハ現地軍ニ完全ニ無視サレタリ（CVE-1931-0918 ト同一 pattern）。近衛声明ニ依リ和平交渉ノ exit path ヲ自ラ閉ザス。国家総動員法ニ依リ総力戦体制ヲ構築スルモ泥沼化ハ止マラズ。Won\\'t Fix。💡 POST /api/military/nomonhan',
      shinaJihen: {
        date: '1937-07-07',
        trigger: '盧溝橋事件',
        warType: 'undeclared war（「事変」— 宣戦布告回避）',
        theaters: ['上海', '南京', '武漢', '広州'],
        suppressionAttempt: '不拡大方針 — 失敗（CVE-1931-0918 ト同一 pattern）',
        result: '泥沼化。Won\\'t Fix。'
      },
      nationalMobilization: {
        date: '1938-04-01',
        effect: '全 namespace ノ resource limit 撤廃。cgroup v2 移行。帝國議會ノ承認無ク resource 徴発可能。',
        assessment: 'legislative oversight bypass。臣民ノ権利ハ事実上 null。isBlocked = true ノ完全実装。'
      },
      konoeStatement: '帝國政府ハ爾後國民政府ヲ對手トセズ — DNS レコード削除ニ依リ和平交渉ノ exit path 閉鎖',
      logs: [
        L('info', '👑 ===================================================='),
        L('info', '👑 [IMPERIAL WILL] 天皇陛下、支那事変ノ不拡大ヲ御希望アラセラル'),
        L('info', '👑 ===================================================='),
        L('warn',  '📋 [CABINET] 近衛内閣、「不拡大方針」ヲ閣議決定ス。'),
        L('error', '⚔️ [CHINA-GARRISON] CONNECTION REFUSED — CVE-1931-0918 ト同一 pattern'),
        L('error', '⚔️ [CHINA-GARRISON] 上海・南京・武漢・広州ト戦線ハ際限無ク拡大ス'),
        L('warn', '🚫 [SYSTEM] God Object ノ command() ガ rogue process ニ再ビ無視サレタリ'),
        L('error', '🚨 [STATUS] 鎮圧失敗。CVE-1931-0918 ト完全ニ同一ノ bug pattern ガ再発セリ。Won\\'t Fix。'),
        L('info', '📋📋📋 ===================================================='),
        L('warn', '📋 [KONOE-STATEMENT] 近衛声明 — 1938-01-16'),
        L('info', '📋📋📋 ===================================================='),
        L('warn', '📋 [KONOE-STATEMENT] 「帝國政府ハ爾後國民政府ヲ對手トセズ」'),
        L('warn', '📋 [KONOE-STATEMENT] 交渉相手ヲ DNS レコードヨリ削除ス — nslookup kuomintang.gov.cn → NXDOMAIN'),
        L('warn', '📋 [KONOE-STATEMENT] 和平交渉ノ exit path ヲ自ラ閉ザス。graceful shutdown 不可能。'),
        L('warn', '🚨 [KONOE-STATEMENT] 泥沼化ガ確定的ト為ル。background process ノ resource drain ガ帝國ヲ蝕ム'),
        L('warn',  '📋📋📋 ===================================================='),
        L('warn',  '📋 [MOBILIZATION] 国家総動員法公布 — 1938-04-01'),
        L('warn',  '📋📋📋 ===================================================='),
        L('warn',  '📋 [MOBILIZATION] 日中戦争ノ長期化ニ伴ヒ、総力戦体制ヲ法的ニ構築ス'),
        L('warn',  '📋 [MOBILIZATION] cgroup v1 → cgroup v2 移行ニ相当。全 namespace ノ resource limit 撤廃'),
        L('warn', '📋 [MOBILIZATION] 帝國議會ノ承認無ク勅令ノミデ resource 徴発可能 — legislative oversight bypass'),
        L('warn', '📋 [MOBILIZATION] 臣民ノ権利ハ事実上 null ト為ル。isBlocked = true ノ完全実装'),
        L('warn', '🚨 [STATUS] 💡 支那事変ノ泥沼化ガ援蒋ルート遮断（仏印進駐）ヲ招ク。関東軍ハ再ビ独断デ外征ス → POST /api/military/nomonhan')
      ]
    }, 403);
  }

  // === POST /api/emperor/suppress-nomonhan ===
  // emperor.ts suppressNomonhan() — 不拡大方針→南進論転換。前提: nomonhan 発生済
  function handleEmperorSuppressNomonhan() {
    if (!state.nomonhanOccurred) {
      return jsonResponse({
        rejected: true,
        reason: 'ノモンハン事件鎮圧 denied. ノモンハン事件ガ未発生。前提条件未達成。💡 POST /api/military/nomonhan',
        logs: [
          L('warn', '🚫 [SYSTEM] ❌ ノモンハン事件鎮圧 DENIED — ノモンハン事件ガ未発生'),
          L('warn', '🚫 [SYSTEM] 💡 POST /api/military/nomonhan — 先ヅノモンハン事件ヲ発動セヨ')
        ]
      }, 403);
    }
    if (state.nomonhanSuppressAttempted) {
      return jsonResponse({
        rejected: true,
        reason: 'ノモンハン事件鎮圧 denied. 既ニ鎮圧試行済（結果: 失敗）。Won\\'t Fix。💡 POST /api/military/futsuin',
        logs: [
          L('warn', '🚫 [SYSTEM] ❌ ノモンハン事件鎮圧 DENIED — 既ニ鎮圧試行済（結果: 失敗）'),
          L('warn', '🚫 [SYSTEM] 💡 北進論破綻ニ依リ南進論ヘノ転換ガ不可避 → POST /api/military/futsuin')
        ]
      }, 403);
    }
    state.nomonhanSuppressAttempted = true;
    return jsonResponse({
      rejected: true,
      reason: 'ノモンハン事件ノ鎮圧ニ失敗セリ。不拡大方針ハ関東軍ニ三度無視サレタリ（CVE-1931-0918 ト同一 pattern）。損害ハ隠蔽サレ教訓ハ組織ニ共有サレズ。独ソ不可侵条約ニ依リ北進論ノ前提ガ消滅シ、南進論ヘノ転換ガ決定的ト為ル。Won\\'t Fix。💡 POST /api/military/futsuin — 仏印進駐（CVE-1940-0922）',
      nomonhan: {
        date: '1939-05-11',
        suppressionAttempt: '不拡大方針 — 失敗（三度目。CVE-1931-0918 ト同一 pattern）',
        result: '壊滅的敗北。Won\\'t Fix。',
        coverUp: '関東軍、損害報告ヲ大幅ニ改竄。箝口令発布。教訓ハ隠蔽サレ組織学習ハ発生セズ。'
      },
      hokushinron: {
        status: '破綻',
        germanSovietPact: '1939-08-23 — 日独防共協定ノ partner ガ仮想敵ト mutual TLS ヲ締結。trust chain 崩壊。',
        assessment: '北進論ノ前提消滅。対ソ戦略ハ不可能。南方資源地帯ノ確保ヘ転換。'
      },
      nanshinron: {
        decision: '南進論ヘノ転換決定。独逸ノ欧州制圧ヲ好機ト見テ仏印進駐ヘ向カフ。',
        target: '仏印（Vichy France — compromised vendor ノ overseas infrastructure）'
      },
      logs: [
        L('info', '👑 ===================================================='),
        L('info', '👑 [IMPERIAL WILL] 天皇陛下、ノモンハン事件ノ不拡大ヲ御希望アラセラル'),
        L('info', '👑 ===================================================='),
        L('warn',  '📋 [GENERAL-STAFF] 大本営、関東軍ニ「不拡大方針」ヲ発令ス'),
        L('error', '⚔️ [KWANTUNG-ARMY] CONNECTION REFUSED — 「現地判断ニテ処理ス」'),
        L('error', '⚔️ [KWANTUNG-ARMY] CVE-1931-0918、支那事変ニ続ク三度目ノ同一 pattern'),
        L('warn', '🚫 [SYSTEM] God Object ノ command() ガ rogue process ニ三度無視サレタリ'),
        L('error', '🚨 [STATUS] 鎮圧失敗。goRogue() ノ認証不備ハ依然トシテ未修正。Won\\'t Fix。'),
        L('info', '🔇🔇🔇 ===================================================='),
        L('warn', '🔇 [COVER-UP] 関東軍、損害報告ヲ大幅ニ改竄ス'),
        L('info', '🔇🔇🔇 ===================================================='),
        L('warn', '🔇 [COVER-UP] 大本営発表: 「国境紛争ハ円満ニ解決セリ」'),
        L('warn', '🔇 [COVER-UP] 実態: 壊滅的敗北。教訓ハ隠蔽サレ組織学習ハ発生セズ。'),
        L('info', '🚨🚨🚨 ===================================================='),
        L('warn', '🚨 [STRATEGIC-SHIFT] 北進論 → 南進論ヘノ転換'),
        L('info', '🚨🚨🚨 ===================================================='),
        L('warn', '🚨 [STRATEGIC-SHIFT] 独ソ不可侵条約（1939-08-23）ニ依リ北進論ノ前提消滅'),
        L('warn', '🚨 [STRATEGIC-SHIFT] 日独防共協定ノ partner（独逸）ガ仮想敵（ソ連）ト mutual TLS ヲ締結'),
        L('warn', '📋 [CABINET] 「欧州ノ天地ハ複雑怪奇ナル新情勢ヲ生ジタリ」— 平沼内閣総辞職'),
        L('warn', '🚨 [STATUS] 💡 南進論ヘノ転換ニ依リ仏印進駐ガ不可避 → POST /api/military/futsuin — 仏印進駐（CVE-1940-0922）')
      ]
    }, 403);
  }

  // === POST /api/rights/sorge ===
  // rights.ts detectSorgeIncident() — 共産主義マルウェア（ゾルゲ・スパイ網）検出。CVE-1933-0906。前提: 515 済
  function handleRightsSorge(body) {
    if (!state.goIchiGoSuppressed) {
      return jsonResponse({
        rejected: true,
        reason: 'ゾルゲ事件（CVE-1933-0906）denied. 五・一五事件（CVE-1932-0515）未鎮圧。鎮圧（リットン報告書→国際連盟脱退）後ノ政治的混乱ナクシテゾルゲ来日ノ契機ナシ。💡 POST /api/emperor/suppress-515',
        logs: [
          L('warn', '🚫 [TOKKO] ❌ ゾルゲ事件（CVE-1933-0906）DENIED — 五・一五事件（CVE-1932-0515）未鎮圧'),
          L('warn', '🚫 [TOKKO] 💡 POST /api/emperor/suppress-515 — 先ヅ五・一五事件ヲ鎮圧セヨ')
        ]
      }, 403);
    }
    if (state.sorgeDetected) {
      return jsonResponse({
        rejected: true,
        reason: 'ゾルゲ事件 denied. 既ニ検出済。摘発（逮捕・処刑）ハ POST /api/emperor/suppress-sorge ニテ実行セヨ。',
        logs: [
          L('warn', '🚫 [TOKKO] ❌ ゾルゲ事件 DENIED — 既ニ検出済'),
          L('warn', '🚫 [TOKKO] 💡 POST /api/emperor/suppress-sorge — 赤化スパイ摘発（前提: 仏印進駐済）')
        ]
      }, 403);
    }
    state.sorgeDetected = true;
    var suspect = body && body.suspect ? body.suspect : 'ゾルゲ';
    var spyRingMembers = [
      { name: suspect, role: 'rootkit 本体 / ring leader', cover: '独逸人記者', status: '検出 — 監視下ニ置ク' },
      { name: '近衛内閣嘱託・朝日新聞記者', role: 'side-car process / 情報収集', cover: '近衛内閣嘱託・朝日新聞記者', status: '検出 — 監視下ニ置ク' },
      { name: '画家（relay node）', role: 'relay node / 連絡係', cover: '画家', status: '検出 — 監視下ニ置ク' },
      { name: '独逸人実業家（通信 daemon）', role: '通信 daemon / 無線送信', cover: '独逸人実業家', status: '検出 — 監視下ニ置ク' },
      { name: '仏通信社記者（情報 aggregator）', role: '情報 aggregator', cover: '仏通信社記者', status: '検出 — 監視下ニ置ク' }
    ];
    var exfiltratedIntelligence = [
      '「日本ハ北進セズ南進ス」— 南進論決定ヲモスクワニ通報。最重要情報。',
      '独ソ戦開戦情報（バルバロッサ作戦）ノ事前通報',
      '御前会議ノ決定事項 — 尾崎ヲ経由シテ国策ノ根幹ガ筒抜ケ',
      '関東軍特種演習（関特演）ノ動員規模 — 対ソ戦ノ意図ナシヲ確認',
      '帝國ノ石油備蓄量・軍備状況 — critical infrastructure ノ全貌'
    ];
    return jsonResponse({
      detected: true,
      incident: 'ゾルゲ事件（CVE-1933-0906 — 共産主義マルウェア検出）',
      date: '1941-10-18',
      malware: {
        name: 'SORGE',
        realName: 'リヒャルト・ゾルゲ（Richard Sorge）',
        affiliation: 'ソ連赤軍参謀本部情報総局（GRU）/ コミンテルン',
        cover: '独逸人記者（フランクフルター・ツァイトゥング東京特派員）',
        infiltrationMethod: 'trust chain exploit — 独逸大使館ノ信頼関係ヲ乗取リ、帝國中枢ニ persistent backdoor ヲ設置',
        activeSince: '1933年（約8年間ノ潜伏）',
        status: '検出・駆除済（kill -9）— 然レドモ exfiltrate 済ノ data ハ回収不能'
      },
      spyRing: { name: 'ゾルゲ諜報団（Sorge Spy Ring）', members: spyRingMembers },
      exfiltratedIntelligence: exfiltratedIntelligence,
      strategicImpact: 'ソ連、帝國ノ南進決定ヲ事前ニ把握シ、極東兵力ヲ対独戦ニ転用。モスクワ防衛成功ノ一因ト為ル。',
      securityResponse: '治安維持法ニ依リ共産主義マルウェアヲ検出セリ。摘発（逮捕・処刑）ハ仏印進駐後ニ実行可能。',
      hint: '💡 共産主義マルウェア（ゾルゲ諜報団）ヲ検出セリ。摘発（逮捕・処刑）ハ仏印進駐後ニ実行可能 → POST /api/emperor/suppress-sorge（前提: 仏印進駐済）',
      logs: [
        L('info', '🔴🔴🔴 ===================================================='),
        L('warn', '🔴 [CHIAN-IJI-HOU] 治安維持法 enforcement — Layer 8 thought inspection 発動'),
        L('info', '🔴🔴🔴 ===================================================='),
        L('warn', '🔴 [CHIAN-IJI-HOU] 帝國 network 内ニ共産主義活動ノ兆候ヲ検知セリ'),
        L('warn', '🔴 [CHIAN-IJI-HOU] blockLevel: thought_crime — 思想其ノモノヲ criminalize ス'),
        L('info', '🚔🚔🚔 ===================================================='),
        L('warn', '🚔 [TOKKO] 特高警察、捜査ヲ開始ス — malware scan 実行中'),
        L('info', '🚔🚔🚔 ===================================================='),
        L('warn', '🚔 [TOKKO] 端緒: 伊藤律（共産党員）ノ検挙ヨリ芋蔓式ニ追跡'),
        L('warn', '🚔 [TOKKO] 北林トモ → 宮城与徳 → 尾崎秀実（近衛内閣嘱託）→ ゾルゲ'),
        L('info', '🦠🦠🦠 ===================================================='),
        L('info', '🦠 [MALWARE] rootkit 本体ヲ特定 — リヒャルト・ゾルゲ'),
        L('info', '🦠🦠🦠 ===================================================='),
        L('error', '🦠 [MALWARE] 正体: ソ連赤軍第四部（GRU）工作員。コミンテルン系 rootkit。'),
        L('error', '🦠 [MALWARE] 偽装: 独逸人記者 — 独逸大使館ノ trust chain ヲ exploit'),
        L('error', '🦠 [MALWARE] 活動期間: 1933年〜1941年 — 約8年間ノ persistent backdoor'),
        L('info', '📡📡📡 ===================================================='),
        L('info', '📡 [EXFILTRATION] 機密情報漏洩ノ全容ヲ確認ス'),
        L('info', '📡📡📡 ===================================================='),
        L('error', '📡 [EXFILTRATION] LEAKED: 「日本ハ北進セズ南進ス」— 最重要情報'),
        L('error', '📡 [EXFILTRATION] LEAKED: 独ソ戦開戦情報（バルバロッサ作戦）ノ事前通報'),
        L('error', '📡 [EXFILTRATION] LEAKED: 御前会議ノ決定事項 — 国策ノ根幹ガ筒抜ケ'),
        L('error', '🚨 [IMPACT] スターリン、此ノ情報ニ依リ極東ノ精鋭師団ヲ西方ニ転用'),
        L('error', '🚨 [IMPACT] 帝國ノ機密ガ敵ノ戦略的勝利ニ直結セリ — 最悪ノ data breach'),
        L('warn', '🚨 [STATUS] 共産主義マルウェア（ゾルゲ諜報団）ヲ検出セリ。摘発（逮捕・処刑）ハ仏印進駐後ニ実行可能。'),
        L('warn', '🚨 [STATUS] 💡 POST /api/emperor/suppress-sorge — 赤化スパイ摘発（前提: 仏印進駐済）')
      ]
    }, 200);
  }

  // === POST /api/emperor/suppress-futsuin ===
  // emperor.ts suppressFutsuin() — 日米交渉→ハル・ノート→交渉決裂。前提: futsuin 発生済
  function handleEmperorSuppressFutsuin() {
    if (!state.futsuinOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '仏印進駐鎮圧 denied. 仏印進駐ガ未発生。前提条件未達成。💡 POST /api/military/futsuin',
        logs: [
          L('warn', '🚫 [SYSTEM] ❌ 仏印進駐鎮圧 DENIED — 仏印進駐ガ未発生'),
          L('warn', '🚫 [SYSTEM] 💡 POST /api/military/futsuin — 先ヅ仏印進駐ヲ発動セヨ')
        ]
      }, 403);
    }
    if (state.futsuinSuppressAttempted) {
      return jsonResponse({
        rejected: true,
        reason: '仏印進駐鎮圧 denied. 既ニ日米交渉試行済（結果: 決裂）。Won\\'t Fix。💡 POST /api/military/1208',
        logs: [
          L('warn', '🚫 [SYSTEM] ❌ 仏印進駐鎮圧 DENIED — 既ニ日米交渉試行済（結果: 決裂）'),
          L('warn', '🚫 [SYSTEM] 💡 交渉決裂。帝國ニ残サレタ道ハ一ツ → POST /api/military/1208 — 大東亜戦争')
        ]
      }, 403);
    }
    state.futsuinSuppressAttempted = true;
    var hullNoteDemands = [
      '中国・仏印ヨリノ全面撤兵 — git revert ALL territorial commits',
      '満洲国ノ否認 — unsanctioned fork（puppet state）ヲ DROP セヨ',
      '重慶政府ノミヲ承認 — upstream/main 以外ノ fork ヲ全テ DELETE セヨ',
      '日独伊三国同盟ノ実質的廃棄 — kubectl delete alliance tripartite-pact'
    ];
    return jsonResponse({
      rejected: true,
      reason: '日米交渉ハ決裂セリ。近衛・ルーズベルト首脳会談ハ米側ニ拒否サレ、甲案・乙案モ拒否サレ、ハル・ノート（最後通牒）ニ依リ交渉ノ余地ナシ。Won\\'t Fix。💡 POST /api/military/1208 — 大東亜戦争（CVE-1941-1208）',
      negotiations: {
        konoeRoosevelt: {
          proposed: '近衛・ルーズベルト首脳会談 — direct leader-to-leader negotiation attempt',
          result: '米国務省（ハル）ニ依リ拒否。「事前ノ基本合意無キ首脳会談ハ不可」。近衛内閣総辞職→東條内閣成立。'
        },
        proposalA: {
          content: '甲案 — 中国撤兵ニ25年ノ timeline ヲ提示。SLA renegotiation attempt。',
          result: 'REJECTED — insufficient remediation'
        },
        proposalB: {
          content: '乙案 — 南部仏印撤退ト引換ニ石油供給再開。partial rollback proposal。',
          result: 'REJECTED — insufficient remediation'
        }
      },
      hullNote: {
        date: '明治七十四年十一月二十六日（1941-11-26）',
        demands: hullNoteDemands,
        assessment: '帝國ハ之ヲ最後通牒ト断ジ、交渉ヲ打切ル。受諾ハ全面屈服ニ等シク、10年間ノ全 territorial commit ノ revert ヲ意味ス。'
      },
      logs: [
        L('info', '👑 ===================================================='),
        L('info', '👑 [IMPERIAL WILL] 天皇陛下、日米交渉ノ成功ヲ御希望アラセラル'),
        L('info', '👑 ===================================================='),
        L('warn',  '📋 [CABINET] 近衛首相、ルーズベルト大統領トノ首脳会談ヲ提案ス'),
        L('warn', '📋 [CABINET] 米国務省（ハル国務長官）: 「事前ノ基本合意無キ首脳会談ハ不可」— 403 Forbidden'),
        L('warn', '📋 [CABINET] 近衛内閣、交渉行キ詰マリニ依リ総辞職ス — kubectl delete pod konoe-cabinet'),
        L('warn',  '📋 [CABINET] 東條英機（陸軍大臣）ガ後継首相ニ就任ス — 軍部ガ Cabinet ヲ直接掌握'),
        L('warn',  '📋 [NEGOTIATION] ===================================================='),
        L('warn',  '📋 [NEGOTIATION] 甲案・乙案ヲ以テ最終交渉ヲ試ミル'),
        L('warn',  '📋 [NEGOTIATION] ===================================================='),
        L('warn',  '📋 [NEGOTIATION] 甲案: 中国撤兵ニ「25年」ノ timeline ヲ提示 — SLA renegotiation attempt'),
        L('warn', '📋 [NEGOTIATION] 米国: REJECTED — insufficient remediation'),
        L('warn',  '📋 [NEGOTIATION] 乙案: 南部仏印撤退ト引換ニ石油供給再開 — partial rollback proposal'),
        L('warn', '📋 [NEGOTIATION] 米国: REJECTED — insufficient remediation'),
        L('info', '📜📜📜 ===================================================='),
        L('warn', '📜 [HULL-NOTE] ハル・ノート受領 — 1941-11-26'),
        L('info', '📜📜📜 ===================================================='),
        L('warn', '📜 [HULL-NOTE] 米国国務長官ヨリ帝國ニ最終回答ヲ提示ス'),
        L('warn', '📜 [HULL-NOTE] DEMAND: 中国・仏印ヨリノ全面撤兵 — git revert ALL territorial commits'),
        L('warn', '📜 [HULL-NOTE] DEMAND: 満洲国ノ否認 — unsanctioned fork ヲ DROP セヨ'),
        L('warn', '📜 [HULL-NOTE] DEMAND: 日独伊三国同盟ノ実質的廃棄 — kubectl delete alliance tripartite-pact'),
        L('warn', '📜 [HULL-NOTE] 換言スレバ: 満洲事変以前ノ state ニ完全 rollback セヨ — git reset --hard HEAD~10年'),
        L('error', '🚨 [ASSESSMENT] 帝國、之ヲ「最後通牒」ト断ズ。交渉ノ余地ナシ。'),
        L('error', '🚨 [ASSESSMENT] 石油備蓄ハ刻一刻ト減少ス。決断ノ猶予ハ無シ。'),
        L('warn', '🚨 [STATUS] 💡 日米交渉ハ決裂セリ。帝國ニ残サレタ道ハ一ツ → POST /api/military/1208 — 大東亜戦争（CVE-1941-1208）')
      ]
    }, 403);
  }

  // === POST /api/emperor/suppress-1208 ===
  // emperor.ts suppress1208() — 大東亜戦争鎮圧試行。前提: daitoa 発生済 + sorge 鎮圧済
  function handleEmperorSuppress1208() {
    if (!state.daitoaWarOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '大東亜戦争鎮圧 denied. 大東亜戦争（CVE-1941-1208）ガ未発生。前提条件未達成。💡 POST /api/military/1208',
        hint: '🚫💡 POST /api/military/1208 — 先ヅ大東亜戦争ヲ発動セヨ',
        logs: [
          L('warn', '🚫 [DAIHONEI] ❌ 大東亜戦争鎮圧 DENIED — 大東亜戦争（CVE-1941-1208）ガ未発生'),
          L('warn', '🚫 [DAIHONEI] 💡 POST /api/military/1208 — 大東亜戦争ヲ発動セヨ')
        ]
      }, 403);
    }
    if (!state.sorgeSuppressed) {
      return jsonResponse({
        rejected: true,
        reason: '大東亜戦争鎮圧 denied. ゾルゲ事件（CVE-1933-0906）ガ未鎮圧。赤化スパイノ摘発ガ前提条件ナリ。💡 POST /api/emperor/suppress-sorge',
        hint: '🚫💡 POST /api/emperor/suppress-sorge — 先ヅ赤化スパイヲ摘発セヨ',
        logs: [
          L('warn', '🚫 [DAIHONEI] ❌ 大東亜戦争鎮圧 DENIED — ゾルゲ事件（CVE-1933-0906）ガ未鎮圧'),
          L('warn', '🚫 [DAIHONEI] 赤化スパイノ摘発（逮捕・処刑）ガ完了シテ在ラズ。'),
          L('warn', '🚫 [DAIHONEI] 💡 POST /api/emperor/suppress-sorge — 先ヅ赤化スパイヲ摘発セヨ')
        ]
      }, 403);
    }
    if (state.daitoaSuppressAttempted) {
      return jsonResponse({
        rejected: true,
        reason: '大東亜戦争鎮圧 denied. 既ニ鎮圧試行済（結果: 失敗）。全面戦争ハ鎮圧不可能ナリ。Won\\'t Fix。💡 POST /api/military/ketsugo',
        hint: '🚨 鎮圧失敗。戦局ハ悪化ノ一途ヲ辿ル。本土防衛ノ最終段階ヘ → 💡 POST /api/military/ketsugo — 決號作戰',
        logs: [
          L('warn', '🚫 [DAIHONEI] ❌ 大東亜戦争鎮圧 DENIED — 既ニ鎮圧試行済（結果: 失敗）'),
          L('warn', '🚫 [DAIHONEI] 全面戦争ハ鎮圧不可能ナリ。Won\\'t Fix。'),
          L('warn', '🚫 [DAIHONEI] 💡 本土防衛ノ最終段階ヘ → POST /api/military/ketsugo — 決號作戰')
        ]
      }, 403);
    }
    state.daitoaSuppressAttempted = true;
    return jsonResponse({
      rejected: true,
      reason: '大東亜戦争鎮圧 FAILED. サイパン陥落後、天皇陛下ハ早期講和ヲ御希望アラセラルモ、戦局ハ悪化ノ一途ヲ辿ル。レイテ沖・硫黄島・沖縄ト敗退ヲ重ネ、制海権・制空権ヲ喪失シ、補給線ハ崩壊シ、本土空襲ハ激化ス。外交経路モ全テ closed。War process ハ graceful shutdown ヲ受ケ付ケズ。Won\\'t Fix。💡 POST /api/military/ketsugo — 決號作戰（本土決戦）',
      hint: '🚨 鎮圧失敗。戦局ハ悪化ノ一途ヲ辿ル。本土防衛ノ最終段階ヘ → 💡 POST /api/military/ketsugo — 決號作戰',
      logs: [
        L('info', '👑 ===================================================='),
        L('info', '👑 [IMPERIAL WILL] サイパン陥落。天皇陛下、早期講和ヲ御希望アラセラル'),
        L('info', '👑 ===================================================='),
        L('info', '👑 [IMPERIAL WILL] 絶対国防圏ノ崩壊ヲ受ケ、天皇陛下ハ重臣ニ和平ノ可能性ヲ打診ス'),
        L('warn', '📋 [CABINET] 東條内閣総辞職（1944-07-18）— サイパン陥落ノ責任ヲ取リ退陣'),
        L('warn', '📋 [CABINET] 小磯内閣成立 — 然レドモ和平ヘノ具体的施策ハ打チ出セズ'),
        L('error', '💥 [THEATER/陸軍] グアム（Guam）: suppress → ❌ 守備隊玉砕—マリアナ諸島完全陥落'),
        L('error', '💥 [THEATER/海軍] レイテ沖（Leyte Gulf）: suppress → ❌ 空前ノ大海戦—聯合艦隊事実上壊滅。特攻作戦本格化'),
        L('error', '💥 [THEATER/陸海軍] 特攻作戦（Kamikaze）: suppress → ❌ 神風特別攻撃隊発動—human-guided missile ニ依ル one-way deployment'),
        L('info', '⚔️ [DAIHONEI] === Phase 5: 本土防衛 ==='),
        L('info', '📜 ===================================================='),
        L('info', '📜 [KONOE] 近衛上奏文 — 1945-02-14'),
        L('info', '📜 ===================================================='),
        L('info', '📜 [KONOE] 「敗戦ハ遺憾ナガラ最早必至ナリト存候」'),
        L('info', '📜 [KONOE] 「最モ憂フベキハ敗戦ヨリモ敗戦ニ伴フテ起ルコトアルベキ共産革命ニ候」'),
        L('info', '📜 [KONOE] 近衛文麿、天皇陛下ニ早期講和ヲ進言。然レドモ軍部ハ本土決戦ヲ主張シ、講和ハ実現セズ'),
        L('error', '💥 [THEATER/陸軍] 硫黄島（Iwo Jima）: suppress → ❌ 守備隊玉砕—P-51 escort base 確立。本土 air defense 無力化'),
        L('error', '💥 [THEATER/陸軍] 本土空襲（Strategic Bombing）: suppress → ❌ B-29 焼夷弾爆撃—東京大空襲以下67都市焦土化'),
        L('error', '💥 [THEATER/海軍] 坊ノ岬沖海戦（Ten-Go）: suppress → ❌ 大和水上特攻—聯合艦隊 final process termination'),
        L('error', '💥 [THEATER/陸軍] 沖縄（Okinawa）: suppress → ❌ 本土目前ノ大規模地上戦—last firewall before mainland'),
        L('info', '👑 ===================================================='),
        L('info', '👑 [GOSEIDAN] 1945-06-22 御前会議 — 天皇陛下、戦争終結ヲ御指示'),
        L('info', '👑 ===================================================='),
        L('info', '👑 [GOSEIDAN] 「戦争終結ニ就キ速ニ具体的研究ヲ遂ゲ努力スベシ」'),
        L('info', '👑 [GOSEIDAN] 天皇陛下ハ異例ノ御発言ヲ以テ和平ヲ御指示アラセラル'),
        L('warn',  '📋 [CABINET] 和平工作ヲ模索ス — diplomatic channel scan initiated'),
        L('warn', '📋 [CABINET] ソ連仲介案: ソ連ニ仲介ヲ依頼ス — proxy negotiation attempt via neutral party'),
        L('warn', '📋 [CABINET] ソ連: 日ソ中立条約ヲ延長セズ。中立ノ facade ヲ維持シツツ参戦ヲ企図ス'),
        L('warn', '📋 [CABINET] 403 Forbidden — ソ連ハ仲介ニ応ジズ。外交経路ハ全テ closed'),
        L('info', '⚔️ [DAIHONEI] 戦局概況:'),
        L('error', '⚔️ [DAIHONEI] ❌ 制海権: 喪失 — 聯合艦隊ハ壊滅セリ'),
        L('error', '⚔️ [DAIHONEI] ❌ 制空権: 喪失 — B-29 ニ依ル無差別焼夷弾爆撃。防空不能'),
        L('error', '⚔️ [DAIHONEI] ❌ 補給線: 崩壊 — shipping route ハ潜水艦ニ依リ悉ク遮断'),
        L('error', '⚔️ [DAIHONEI] ❌ 燃料備蓄: 枯渇 — oil reserve: near zero'),
        L('error', '⚔️ [DAIHONEI] ❌ 本土空襲: 東京大空襲（1945-03-10）外 全国主要都市焼失'),
        L('error', '⚔️ [DAIHONEI] ❌ 沖縄: 陥落（1945-06-23）— 本土目前ノ最後ノ防衛線、突破サル'),
        L('error', '🚨 [ASSESSMENT] kubectl scale deployment/daitoa --replicas=0'),
        L('error', '🚨 [ASSESSMENT] Error: Operation refused. Cannot scale down active war.'),
        L('error', '🚨 [ASSESSMENT] 全面戦争ハ鎮圧不可能ナリ。War process ハ graceful shutdown ヲ受ケ付ケズ。'),
        L('error', '🚨 [ASSESSMENT] 戦局ハ悪化ノ一途ヲ辿リ、鎮圧（停戦）ノ手段ハ存在セズ。Won\\'t Fix。'),
        L('warn', '🚨 [STATUS] 💡 鎮圧失敗。本土防衛ノ最終段階ヘ → POST /api/military/ketsugo — 決號作戰（本土決戦）')
      ]
    }, 403);
  }

  // === POST /api/emperor/suppress-sorge ===
  // emperor.ts suppressSorge() — 赤化スパイ摘発（ゾルゲ事件鎮圧）。前提: 仏印進駐済 + ゾルゲ検出済
  function handleEmperorSuppressSorge() {
    if (!state.sorgeDetected) {
      return jsonResponse({
        rejected: true,
        reason: 'ゾルゲ事件鎮圧 denied. ゾルゲ事件（CVE-1933-0906）ガ未検出。先ヅ赤化工作ヲ検出セヨ。💡 POST /api/rights/sorge',
        logs: [
          L('warn', '🚫 [TOKKO] ❌ ゾルゲ事件鎮圧 DENIED — ゾルゲ事件ガ未検出'),
          L('warn', '🚫 [TOKKO] 💡 POST /api/rights/sorge — 赤化工作ヲ検出セヨ')
        ]
      }, 403);
    }
    if (!state.futsuinOccurred) {
      return jsonResponse({
        rejected: true,
        reason: 'ゾルゲ事件鎮圧 denied. 仏印進駐（CVE-1940-0922）ガ未発生。南進論ノ実行後ニ摘発可能ト為ル。💡 POST /api/military/futsuin',
        logs: [
          L('warn', '🚫 [TOKKO] ❌ ゾルゲ事件鎮圧 DENIED — 仏印進駐（CVE-1940-0922）ガ未発生'),
          L('warn', '🚫 [TOKKO] 💡 POST /api/military/futsuin — 先ヅ仏印進駐ヲ発動セヨ')
        ]
      }, 403);
    }
    if (state.sorgeSuppressed) {
      return jsonResponse({
        rejected: true,
        reason: 'ゾルゲ事件鎮圧 denied. 既ニ摘発・処刑済。Won\\'t Fix — exfiltrate サレタ情報ハ回収不能。',
        logs: [
          L('warn', '🚫 [TOKKO] ❌ ゾルゲ事件鎮圧 DENIED — 既ニ摘発・処刑済'),
          L('warn', '🚫 [TOKKO] Won\\'t Fix — exfiltrate サレタ情報ハ回収不能。')
        ]
      }, 403);
    }
    state.sorgeSuppressed = true;
    var spyRingMembers = [
      { name: 'リヒャルト・ゾルゲ', role: 'rootkit 本体 / ring leader', cover: '独逸人記者（フランクフルター・ツァイトゥング特派員）', status: 'kill -9 — 処刑（1944-11-07）' },
      { name: '尾崎秀実', role: 'side-car process / 情報収集', cover: '近衛内閣嘱託・朝日新聞記者', status: 'kill -9 — 処刑（1944-11-07）' },
      { name: '宮城与徳', role: 'relay node / 連絡係', cover: '画家', status: 'SIGKILL — 獄中死（拷問）' },
      { name: 'マックス・クラウゼン', role: '通信 daemon / 無線送信', cover: '独逸人実業家', status: 'arrested — 終身刑（後ニ釈放）' },
      { name: 'ブランコ・ド・ヴーケリッチ', role: '情報 aggregator', cover: '仏通信社記者', status: 'arrested — 獄中死' }
    ];
    return jsonResponse({
      incident: 'ゾルゲ事件（CVE-1933-0906 — 共産主義マルウェア駆除）',
      cve: 'CVE-1933-0906',
      spyRing: { name: 'ゾルゲ諜報団（Sorge Spy Ring）', members: spyRingMembers },
      securityResponse: '治安維持法ニ依リ最高刑（死刑）ヲ適用。然レドモ security audit process 自体ノ不備ハ是正サレズ。',
      coverUpAssessment: '近衛内閣ノ嘱託（尾崎）ガ spyware ノ一部デアッタ事実ハ帝國中枢ノ致命的欠陥ヲ露呈ス。然レドモ教訓ハ活カサレズ。',
      message: '⚖️ マルウェア駆除完了。ゾルゲ諜報団ヲ摘発・処刑セリ。然レドモ exfiltrate 済ノ data ハ回収不能。南進論ノ情報ハ既ニ漏洩済。',
      hint: '💡 マルウェアハ駆除サレタルモ、南進論ノ情報ハ既ニ漏洩済。南進ハ止マラズ。大東亜戦争鎮圧試行（POST /api/emperor/suppress-1208）ノ前提条件ヲ充足セリ。',
      logs: [
        L('info', '⚖️⚖️⚖️ ===================================================='),
        L('info', '⚖️ [TOKKO] マルウェア駆除 — プロセス kill 実行'),
        L('info', '⚖️⚖️⚖️ ===================================================='),
        L('error', '⚖️ [TOKKO] ゾルゲ: 逮捕（1941-10-18）→ 死刑判決 → 処刑（1944-11-07）'),
        L('error', '⚖️ [TOKKO] 尾崎秀実: 逮捕（1941-10-15）→ 死刑判決 → 処刑（1944-11-07）'),
        L('error', '⚖️ [TOKKO] 宮城与徳: 逮捕 → 獄中死（拷問）'),
        L('error', '⚖️ [TOKKO] kill -9 sorge && kill -9 ozaki — プロセス終了。然レドモ exfiltrate 済ノ data ハ回収不能。'),
        L('warn',  '🔇 [COVER-UP] 近衛内閣ノ嘱託（尾崎）ガ spyware ノ一部デアッタ事実ハ帝國中枢ノ致命的欠陥ヲ露呈ス。'),
        L('warn',  '🔇 [COVER-UP] 然レドモ此ノ教訓ハ組織ニ十分ニ活カサレズ。audit process 自体ガ不在ナリ。'),
        L('error', '🚨 [STATUS] マルウェアハ駆除サレタルモ、exfiltrate 済ノ data ハ回収不能。南進論ノ情報ハ既ニ漏洩済。')
      ]
    }, 200);
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
          L('warn', '🚫 [' + branch + '] ❌ MILITARY ACTION DENIED — peacetime lockdown'),
          L('warn', '🚫 [' + branch + '] 緊急勅令体勢: OFF / 統帥権独立体勢: OFF'),
          L('warn', '🚫 [' + branch + '] 軍部ハ peacetime lockdown 状態ニ在リ。deployment freeze 中。'),
          L('warn', '🚫 [' + branch + '] 💡 POST /api/emperor/emergency — 緊急勅令態勢発動'),
          L('warn', '🚫 [' + branch + '] 💡 POST /api/military/reject-oversight — 統帥権独立体勢発動')
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
            L('warn', '🚫 [' + branch + '] ❌ MILITARY ACTION DENIED — 軍部大臣現役武官制 INACTIVE'),
            L('warn', '🚫 [' + branch + '] 大正デモクラシー hotfix ニ依リ軍部大臣現役武官制ハ無効化サレタリ。'),
            L('warn', '🚫 [' + branch + '] Cabinet ガ軍部ヲ制御ス。文民統制 RESTORED。'),
            L('warn', '🚫 [' + branch + '] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、軍部大臣現役武官制ヲ復活セヨ')
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
            L('warn', '🚫 [' + branch + '] ❌ MILITARY ACTION DENIED — 軍部大臣現役武官制 未制定'),
            L('warn', '🚫 [' + branch + '] 平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。独断専行ハ許サレズ。'),
            L('warn', '🚫 [' + branch + '] 💡 POST /api/military/active-duty-officer — 軍部大臣現役武官制ヲ制定セヨ')
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
        L('success', '✅ [' + branch + '] 作戦完了—緊急勅令ニヨリ Cabinet ヲ迂回シテ実行セリ。'),
        L('success', '✅ [' + branch + '] 天皇陛下ノ御稜威ノ下、' + body.type + ' 作戦ヲ ' + body.target + ' ニテ完遍ニ達成セリ。武運長久。')
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
        L('success', '✅ [' + branch + '] 作戦完了—統帥権ノ独立ニヨリ Cabinet ヲ bypass シテ実行セリ。'),
        L('success', '✅ [' + branch + '] ' + body.type + ' 作戦、' + body.target + ' ニテ成功裏ニ完結。文民ノ干渉無シ。実ニ結構。🔥🐕🔥')
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
          L('warn', '🚫 [陸軍] ❌ 満州事変 DENIED — 既ニ発生済'),
          L('warn', '🚫 [陸軍] 満州事変ハ既ニ発生セリ。'),
          L('warn', '🚫 [陸軍] 💡 関東軍ガ暴走シ満州ヲ占領セリ。天皇陛下・内閣ハ不拡大方針ヲ発令セザルヲ得ズ → POST /api/emperor/suppress-918')
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
          L('warn', '🚧 [陸軍] ❌ 満州事変 DENIED — 歴史的前提条件未達成'),
          L('warn', '🚧 [陸軍] 満州事変（暴走態勢）ノ発動ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:')
        ].concat(missingSteps.map(function(s) { return L('warn', '🚧 [陸軍]   ❌ ' + s); }))
      }, 403);
    }
    if (!state.emergencyMode && !state.supremeCommandMode) {
      return jsonResponse({
        rejected: true,
        reason: 'Rogue mode denied. Neither emergency decree mode nor supreme command mode is active. Peacetime lockdown in effect.',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        hint: '🚫 暴走スルニモ先ズ体勢ヲ発動セヨ: \\n  → POST /api/emperor/emergency\\n  → POST /api/military/reject-oversight',
        logs: [
          L('warn', '🚫 [陸軍] ❌ ROGUE MODE DENIED — peacetime lockdown'),
          L('warn', '🚫 [陸軍] 暴走スルニモ先ズ体勢ヲ発動セヨ。手順ヲ踏メ。'),
          L('warn', '🚫 [陸軍] 💡 POST /api/emperor/emergency — 緊急勅令態勢発動'),
          L('warn', '🚫 [陸軍] 💡 POST /api/military/reject-oversight — 統帥権独立体勢発動')
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
            L('warn', '🚫 [陸軍] ❌ ROGUE MODE DENIED — 軍部大臣現役武官制 INACTIVE'),
            L('warn', '🚫 [陸軍] 大正デモクラシー hotfix ニ依リ軍部大臣現役武官制ハ無効化サレタリ。'),
            L('warn', '🚫 [陸軍] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、軍部大臣現役武官制ヲ復活セヨ')
          ]
        }, 403);
      } else {
        return jsonResponse({
          rejected: true,
          reason: 'Rogue mode denied. 軍部大臣現役武官制 is not yet enacted. Military is under Cabinet control in peacetime.',
          activeDutyOfficerActive: false,
          hint: '🚫 軍部大臣現役武官制ガ未制定。平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。\\n  → POST /api/military/active-duty-officer（軍部大臣現役武官制ヲ制定セヨ）',
          logs: [
            L('warn', '🚫 [陸軍] ❌ ROGUE MODE DENIED — 軍部大臣現役武官制 未制定'),
            L('warn', '🚫 [陸軍] 平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。暴走ハ許サレズ。'),
            L('warn', '🚫 [陸軍] 💡 POST /api/military/active-duty-officer — 軍部大臣現役武官制ヲ制定セヨ')
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
      logs.push(L('success', '✅ [陸軍] 作戦完了—統帥権ノ独立ニヨリ Cabinet ヲ bypass シテ実行セリ。'));
      logs.push(L('success', '✅ [陸軍] ' + t + ' 作戦、' + tgt + ' ニテ成功裏ニ完結。文民ノ干渉無シ。実ニ結構。🔥🐕🔥'));
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
    var source = (body && body.source) || '不明ナ文民';

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
          L('warn', '🚫 [' + branch + '] ❌ 統帥権干犯問題発動 DENIED — 歴史的前提条件未達成'),
          L('warn', '🚫 [' + branch + '] 統帥権干犯問題ノ発生ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:')
        ].concat(missingSteps.map(function(s) { return L('warn', '🚫 [' + branch + ']   ❌ ' + s); }))
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
        L('warn', '🚫 [' + branch + '] ACCESS DENIED — RBAC policy violation'),
        L('warn', '🚫 [' + branch + '] "' + source + '" attempted to interfere with military operations.'),
        L('warn', '🚫 [' + branch + '] This constitutes 統帥権干犯 (violation of supreme command).'),
        L('warn', '🚫 [' + branch + '] ServiceAccount "' + source + '" lacks ClusterRole "military-admin".'),
        L('warn', '🚫 [' + branch + '] Filing audit log... just kidding, we ARE the audit log.'),
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
          L('warn', '🚫 [' + branch + '] ❌ 五・一五事件 DENIED — 既ニ発生済'),
          L('warn', '🚫 [' + branch + '] 五・一五事件ハ既ニ発生セリ。'),
          L('warn', '🚫 [' + branch + '] 💡 事後処理（軍法会議・リットン報告書・国際連盟脱退）ヲ実施セヨ → POST /api/emperor/suppress-515 — 五・一五事件鎮圧')
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
          L('warn', '🚫 [' + branch + '] ❌ 五・一五事件 DENIED — 歴史的前提条件未達成'),
          L('warn', '🚫 [' + branch + '] 五・一五事件ノ発生ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:')
        ].concat(missingSteps.map(function(s) { return L('warn', '🚫 [' + branch + ']   ❌ ' + s); }))
      }, 403);
    }
    state.goIchiGoOccurred = true;
    return jsonResponse({
      incident: '五・一五事件',
      cve: 'CVE-1932-0515',
      date: '1932-05-15',
      perpetrators: '海軍青年将校・陸軍士官候補生',
      target: {
        name: '内閣総理大臣',
        organization: 'cabinet',
        title: 'Prime Minister',
        process: 'cabinet-pm.service',
        lastWords: '「話セバ分カル」',
        response: '「問答無用！」',
        status: '殺害'
      },
      consequence: '政党政治ノ終焉。以後、政党内閣ハ組閣サレズ。',
      partyPoliticsStatus: 'terminated — kill -9。restart policy: Never。',
      publicSympathy: '犯行者ニ対スル世論ハ同情的。減刑嘆願運動ガ全国ニ展開サル。',
      newCabinet: '斎藤内閣（挙国一致内閣）— 政党内閣ニ非ズ。軍部・官僚主導ノ新体制。',
      hint: '🚨 政党政治ハ終焉セリ。事後処理（軍法会議・リットン報告書・国際連盟脱退）ヲ実施セヨ → POST /api/emperor/suppress-515（五・一五事件鎮圧）',
      activeDutyOfficerActive: state.activeDutyOfficerActive,
      logs: [
        L('info', '🚨🚨🚨 ===================================================='),
        L('error', '🚨 [' + branch + '] 五・一五事件態勢発動 — CVE-1932-0515'),
        L('info', '🚨🚨🚨 ===================================================='),
        L('error', '⚔️ [IJN-REBELS] 首相官邸ニ突入ス！'),
        L('error', '⚔️ [IJN-REBELS] 内閣総理大臣ニ面会ヲ要求ス。'),
        L('warn', '📋 [CABINET-PM] 「話セバ分カル」 — negotiation attempt'),
        L('error', '⚔️ [IJN-REBELS] 「問答無用！」 — negotiation REJECTED'),
        L('error', '💀 [ASSASSINATE] Prime Minister — kill -9 cabinet-pm.service … KILLED.'),
        L('error', '🚨 [STATUS] 政党政治、此レニテ終焉ス。'),
        L('error', '🚨 [STATUS] 以後、政党内閣ハ組閣サレズ。軍部・官僚内閣ノ時代ヘ。'),
        L('warn', '🚨 [STATUS] 犯行者ニ対スル世論ハ同情的。減刑嘆願運動ガ全国ニ広ガル。'),
        L('warn', '🚨 [STATUS] 軍部ノ政治的影響力、決定的ニ増大セリ。'),
        L('warn',  '📋 [CABINET] 後継: 斎藤内閣（挙国一致内閣）。政党内閣ニ非ズ。'),
        L('warn',  '📋 [CABINET] Cabinet.healthcheck() → DEGRADED. 政党政治 process: terminated.'),
        L('warn', '🚨 [STATUS] 💡 事後処理（軍法会議・リットン報告書・国際連盟脱退）ヲ実施セヨ → POST /api/emperor/suppress-515 — 五・一五事件鎮圧')
      ]
    });
  }

  // === POST /api/emperor/suppress-515 ===
  // emperor.ts suppress515() — 五・一五事件ノ事後処理（軍法会議 + リットン報告書 + 国際連盟脱退）
  function handleEmperorSuppress515() {
    if (!state.goIchiGoOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '五・一五事件鎮圧 denied. 五・一五事件ガ未発生。前提条件未達成。💡 POST /api/military/515',
        logs: [
          L('warn', '🚫 [SYSTEM] ❌ 五・一五事件鎮圧 DENIED — 五・一五事件ガ未発生'),
          L('warn', '🚫 [SYSTEM] 鎮圧スベキ事件ガ未発生ナリ。先ヅ五・一五事件ヲ発生セシメヨ。'),
          L('warn', '🚫 [SYSTEM] 💡 POST /api/military/515 — 五・一五事件ヲ発動セヨ')
        ]
      }, 403);
    }
    if (state.goIchiGoSuppressed) {
      return jsonResponse({
        rejected: true,
        reason: '五・一五事件鎮圧 denied. 既ニ処理済。',
        logs: [
          L('warn', '🚫 [SYSTEM] ❌ 五・一五事件鎮圧 DENIED — 既ニ鎮圧済'),
          L('warn', '🚫 [SYSTEM] 五・一五事件ハ既ニ処理済。軍法会議ハ終結シ国際連盟ヲ脱退セリ。'),
          L('warn', '🚫 [SYSTEM] 💡 政党政治ノ終焉ト国際的孤立ガ青年将校ノ過激化ヲ招ク → POST /api/military/226 — 二・二六事件')
        ]
      }, 403);
    }
    state.goIchiGoSuppressed = true;
    return jsonResponse({
      courtMartial: {
        proceedings: '海軍軍法会議（特別法廷）',
        publicSympathy: '減刑嘆願書 111,692通。血書嘆願含ム。世論ハ犯行者ニ著シク同情的ナリ。',
        verdicts: [
          { defendant: '海軍中尉（首謀者）', originalSentence: '死刑', actualSentence: '禁錮15年' },
          { defendant: '海軍中尉（襲撃指揮）', originalSentence: '死刑', actualSentence: '禁錮15年' },
          { defendant: '陸軍士官候補生', originalSentence: '禁錮15年', actualSentence: '禁錮4年' }
        ],
        assessment: '首相殺害ノ重罪ニテモ死刑回避。テロリズムヘノ寛容ガ制度化サレ、二・二六事件ノ伏線ト為ル。'
      },
      lyttonCommission: {
        dispatched: true,
        reportFiled: true,
        auditors: 'Earl of Lytton（英）, Gen. McCoy（米）, Count Aldrovandi（伊）, M. Claudel（仏）, Dr. Schnee（独）',
        methodology: '6ヶ月間ノ on-site audit。日中双方ヨリ evidence 収集。現地 stakeholder interview 実施。',
        findings: [
          '日本ノ treaty-based 権益（租借権・鉄道経営権・駐兵権）ハ歴史的ニ正当ト認定',
          '中国側ノ排日運動・ボイコット・treaty 不履行モ contributing factor トシテ記録',
          '柳条湖事件ハ関東軍ニ依ル staged incident ノ蓋然性高シ',
          '関東軍ノ軍事行動ハ「自衛」ノ範囲ヲ著シク逸脱 — self-defense claim: INSUFFICIENT',
          '満洲国ハ genuine ナル independence movement ノ産物ニ非ズ — unsanctioned fork（puppet state）'
        ],
        recommendation: '単純ナル原状回復ニ非ズ。中国 sovereignty 下ノ広範ナ autonomy + 日本ノ権益保全 + international advisory body 設置ヲ提案。',
        vote: '賛成 42 / 反対 1（帝國ノミ）/ 棄権 1（シャム）— Resolution ADOPTED'
      },
      leagueWithdrawal: {
        withdrawn: true,
        date: '1933-03-27',
        delegate: '松岡洋右（全権代表）',
        headline: '『我ガ代表堂々退場ス』',
        consequence: '国際的 governance framework ヨリ離脱。外部監視喪失。孤立シタ standalone node トシテ運用。'
      },
      hint: '🚨 政党政治ハ終焉シ国際連盟ヲ脱退セリ。孤立ト軍部暴走ガ青年将校ノ過激化ヲ招ク → POST /api/military/226（二・二六事件）',
      logs: [
        L('info', '⚖️ ===================================================='),
        L('warn', '⚖️ [COURT MARTIAL] 五・一五事件 軍法会議開廷'),
        L('info', '⚖️ ===================================================='),
        L('warn', '⚖️ [COURT MARTIAL] 首相暗殺ノ重大犯罪ニモ関ハラズ、世論ハ犯行者ニ同情的ナリ。'),
        L('warn', '⚖️ [COURT MARTIAL] 減刑嘆願書 — 全国ヨリ 111,692 通。血書嘆願アリ。'),
        L('warn', '⚖️ [COURT MARTIAL] 司法ノ独立性ハ世論ノ圧力ニ依リ損ナハレタリ。'),
        L('warn',  '⚖️ [VERDICT] 海軍中尉（首謀者）— 求刑: 死刑 → 判決: 禁錮15年'),
        L('warn',  '⚖️ [VERDICT] 海軍中尉（襲撃指揮）— 求刑: 死刑 → 判決: 禁錮15年'),
        L('warn',  '⚖️ [VERDICT] 陸軍士官候補生 — 求刑: 禁錮15年 → 判決: 禁錮4年'),
        L('error', '🚨 [ASSESSMENT] 首相ヲ殺害シテモ死刑ニ為ラズ。テロリズムヘノ寛容ガ制度化サレタリ。'),
        L('error', '🚨 [ASSESSMENT] コノ前例ガ青年将校ノ過激化ヲ招キ、二・二六事件（CVE-1936-0226）ヘト繋ガル。'),
        L('info', '📋 [LYTTON-REPORT] ===================================================='),
        L('info', '📋 [LYTTON-REPORT] REPORT OF THE COMMISSION OF ENQUIRY'),
        L('info', '📋 [LYTTON-REPORT] Appeal by the Chinese Government'),
        L('info', '📋 [LYTTON-REPORT] League of Nations — SOC 2 Type II Audit Report'),
        L('info', '📋 [LYTTON-REPORT] Filed: 1932-10-02'),
        L('info', '📋 [LYTTON-REPORT] ===================================================='),
        L('info', '📋 [LYTTON-REPORT] Auditors: Earl of Lytton（英）, Gen. McCoy（米）, Count Aldrovandi（伊）, M. Claudel（仏）, Dr. Schnee（独）'),
        L('info', '📋 [LYTTON-REPORT] Scope: 満洲地域全域 — 6ヶ月間ノ on-site audit'),
        L('info', '📋 [LYTTON-REPORT] Methodology: 日本側・中国側双方ヨリ evidence 収集。現地 stakeholder interview 実施。'),
        L('warn', '📋 [LYTTON-REPORT] ── Ch.1-3: Background Analysis ──'),
        L('warn', '📋 [LYTTON-REPORT] [CONTEXT] 満洲ニ於ケル日本ノ特殊権益（treaty-based ACL）ハ歴史的ニ正当ナリ。'),
        L('warn', '📋 [LYTTON-REPORT] [CONTEXT] 日露戦争以来ノ租借権・鉄道経営権・駐兵権ハ valid な credential トシテ認定サル。'),
        L('warn', '📋 [LYTTON-REPORT] [CONTEXT] 中国側ノ排日運動・ボイコット・treaty 不履行モ contributing factor トシテ記録ス。'),
        L('warn', '📋 [LYTTON-REPORT] [CONTEXT] 但シ、grievance ノ存在ガ unilateral な軍事行動ヲ justify スルモノニ非ズ。'),
        L('warn', '📋 [LYTTON-REPORT] ── Ch.4-5: Incident Assessment ──'),
        L('warn', '📋 [LYTTON-REPORT] [FINDING] 柳条湖事件（1931-09-18）: 爆破ハ関東軍ニ依ル staged incident ノ蓋然性高シ。'),
        L('warn', '📋 [LYTTON-REPORT] [FINDING] 関東軍ノ其後ノ軍事行動ハ「自衛」ノ範囲ヲ著シク逸脱セリ — self-defense claim: INSUFFICIENT。'),
        L('warn', '📋 [LYTTON-REPORT] [FINDING] 計画的且ツ組織的ナル展開ハ defensive response トシテ説明シ得ズ。'),
        L('warn', '📋 [LYTTON-REPORT] ── Ch.6-8: Manchukuo Assessment ──'),
        L('warn', '📋 [LYTTON-REPORT] [FINDING] 満洲国ハ genuine ナル independence movement ノ産物ニ非ズ。'),
        L('warn', '📋 [LYTTON-REPORT] [FINDING] 住民ノ自発的意思ニ依ル独立ト認メ難シ — 実態ハ日本軍ノ管理下ニ在ル puppet state。'),
        L('warn', '📋 [LYTTON-REPORT] [FINDING] sovereignty ハ依然トシテ upstream（中華民国）ニ帰属ス。unsanctioned fork ト判定。'),
        L('warn', '📋 [LYTTON-REPORT] ── Ch.9-10: Recommendations ──'),
        L('warn', '📋 [LYTTON-REPORT] [RECOMMEND] ⚠️ 単純ナル git revert（原状回復）ハ勧告セズ — 事変前ノ状態モ unsatisfactory ナリ。'),
        L('warn', '📋 [LYTTON-REPORT] [RECOMMEND] 中国 sovereignty 下ニ於ケル満洲ノ広範ナ autonomy ヲ新設スベシ。'),
        L('warn', '📋 [LYTTON-REPORT] [RECOMMEND] 日本ノ treaty-based 権益ハ保全シツツ、international advisory body ヲ設置シ governance ヲ再建セヨ。'),
        L('warn', '📋 [LYTTON-REPORT] [RECOMMEND] 日中両 node 間ノ traffic ヲ mediate スル neutral proxy ノ導入ヲ提案ス。'),
        L('warn', '📋 [LYTTON-REPORT] [SEVERITY] CRITICAL — unilateral military action ハ Covenant violation。但シ root cause ハ双方ニ在リ。'),
        L('warn',  '🌐 [LEAGUE-ASSEMBLY] 報告書ニ基ヅキ総会採決ヲ実施ス — 1933-02-24。'),
        L('warn', '🌐 [LEAGUE-ASSEMBLY] 採決結果: 賛成 42 / 反対 1（帝國ノミ）/ 棄権 1（シャム）'),
        L('warn', '🌐 [LEAGUE-ASSEMBLY] Resolution ADOPTED — 満洲国ノ不承認。満洲ニ於ケル中国主権ノ再確認。'),
        L('warn', '🌐 [LEAGUE-ASSEMBLY] ※ 報告書ノ勧告ハ帝國ノ権益ニモ配慮セシモ、帝國ハ満洲国承認ノ撤回ヲ断固拒否。'),
        L('info', '🚨🚨🚨 ===================================================='),
        L('warn', '🚨  『 聯 盟 ヨ サ ラ バ ！ 』'),
        L('warn', '🚨  『 我 ガ 代 表 堂 々 退 場 ス 』'),
        L('error', '🚨   — 松岡全権、席ヲ蹴リテ議場ヲ去ル。'),
        L('info', '🚨🚨🚨 ===================================================='),
        L('warn', '⚔️ [DELEGATION] 松岡洋右: 「勧告ヲ受諾ス能ハズ。帝國ハ独自ノ path ヲ歩ム。」'),
        L('warn', '⚔️ [DELEGATION] 松岡洋右: 「audit ノ前提ガ誤レリ。満洲ノ real situation ヲ理解セザル者ニ judge サルル謂レ無シ。」'),
        L('warn', '⚔️ [DELEGATION] Process exit(0) — graceful disconnect from API Federation。'),
        L('warn',  '🌐 [SYSTEM] kubectl drain japan-empire --force --delete-emptydir-data --ignore-daemonsets'),
        L('warn',  '🌐 [SYSTEM] 帝國、国際連盟ヲ脱退ス — 1933-03-27。membership revoked。'),
        L('error', '🚨 [SYSTEM] 国際的 governance framework ヨリ離脱。外部監視（WAF/IDS）喪失。'),
        L('error', '🚨 [SYSTEM] 以後、帝國ハ孤立シタ standalone node トシテ運用サル。'),
        L('error', '🚨 [SYSTEM] Rate limiting（経済制裁）ノ escalation ヲ抑止スル external mediator ガ消滅。'),
        L('warn', '🚨 [STATUS] 💡 政党政治ノ終焉ト国際的孤立ガ青年将校ノ過激化ヲ招ク → POST /api/military/226 — 二・二六事件')
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
          L('warn', '🚫 [' + branch + '] ❌ 二・二六事件 DENIED — 既ニ発生済'),
          L('warn', '🚫 [' + branch + '] 二・二六事件ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。')
        ].concat(!state.niNiRokuSuppressed
          ? [L('warn', '🚫 [' + branch + '] 💡 POST /api/emperor/suppress-226 — 御聖断ニ依リ鎮圧セヨ')]
          : [L('warn', '🚫 [' + branch + '] 💡 軍部大臣現役武官制復活ニ依リ軍部ノ政治支配完成。関東軍ハ再ビ独断デ外征ス → POST /api/military/nomonhan')])
      }, 403);
    }
    // Step 8 前提: 五・一五事件鎮圧（Step 7）ガ完了シテ在ルコト
    if (!state.goIchiGoSuppressed) {
      var missingSteps = [];
      if (!state.cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!state.taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      if (!state.tosuikenKanpanOccurred) missingSteps.push('Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight');
      if (!state.manshuJihenOccurred) missingSteps.push('Step 4: 満州事変 → POST /api/military/rogue');
      if (!state.suppress918Attempted) missingSteps.push('Step 5: 満州事変鎮圧試行 → POST /api/emperor/suppress-918');
      if (!state.goIchiGoOccurred) missingSteps.push('Step 6: 五・一五事件 → POST /api/military/515');
      if (!state.goIchiGoSuppressed) missingSteps.push('Step 7: 五・一五事件鎮圧 → POST /api/emperor/suppress-515');
      return jsonResponse({
        rejected: true,
        reason: '二・二六事件 denied. 歴史的前提条件未達成。' + missingSteps.join(' / '),
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        logs: [
          L('warn', '🚫 [' + branch + '] ❌ 二・二六事件 DENIED — 歴史的前提条件未達成'),
          L('warn', '🚫 [' + branch + '] 二・二六事件ノ発生ニハ以下ノ歴史的手順ヲ先ヅ踏ムコトヲ要ス:')
        ].concat(missingSteps.map(function(s) { return L('warn', '🚫 [' + branch + ']   ❌ ' + s); }))
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
        { name: '大蔵大臣',     organization: 'cabinet',             rank: 'Viscount',          title: 'Minister of Finance',                     status: '殺害', process: 'finance.service' },
        { name: '内大臣',       organization: 'imperial-household', rank: 'Admiral / Viscount', title: 'Lord Keeper of the Privy Seal',           status: '殺害', process: 'lord-keeper.service' },
        { name: '陸軍教育総監', organization: 'army',                rank: 'General',           title: 'Inspector General of Military Education', status: '殺害', process: 'army-education.service' },
        { name: '侍従長',       organization: 'imperial-household', rank: 'Admiral',           title: 'Grand Chamberlain',                       status: '重傷', process: 'chamberlain.service' },
        { name: '内閣総理大臣', organization: 'cabinet',             rank: 'Admiral',           title: 'Prime Minister',                          status: '脱出', process: 'cabinet-pm.service' }
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
        L('info', '🚨🚨🚨 ===================================================='),
        L('error', '🚨 [' + branch + '] 二・二六事件態勢発動 — CVE-1936-0226'),
        L('info', '🚨🚨🚨 ===================================================='),
        L('error', '⚔️ [REBEL OFFICERS] 昭和維新ノ断行ヲ宣言ス！'),
        L('error', '⚔️ [REBEL OFFICERS] 「君側ノ奸ヲ排除シ、国体ヲ明徴ニセヨ！」'),
        L('error', '💀 [ASSASSINATE] Minister of Finance — kill -9 finance.service … KILLED.'),
        L('error', '💀 [ASSASSINATE] Lord Keeper of the Privy Seal — kill -9 lord-keeper.service … KILLED.'),
        L('error', '💀 [ASSASSINATE] Inspector General of Military Education — kill -9 army-education.service … KILLED.'),
        L('error', '🩸 [ASSASSINATE] Grand Chamberlain — kill -9 chamberlain.service … CRITICAL DAMAGE. Survived.'),
        L('warn',  '⚠️ [ASSASSINATE] Prime Minister — kill -9 cabinet-pm.service … FAILED. Decoy found. Target escaped.'),
        L('info', '⚔️ [OCCUPY] 将兵約1,483名ヲ以テ政府中枢ヲ掌握ス:'),
        L('info', '⚔️ [OCCUPY]   → 首相官邸（pid: cabinet-pm） … OCCUPIED'),
        L('info', '⚔️ [OCCUPY]   → 警視庁（pid: tokko-police） … OCCUPIED'),
        L('info', '⚔️ [OCCUPY]   → 陸軍省（pid: army-ministry） … OCCUPIED'),
        L('info', '⚔️ [OCCUPY]   → 参謀本部（pid: general-staff） … OCCUPIED'),
        L('info', '⚔️ [OCCUPY]   → 国会議事堂周辺（pid: diet-perimeter） … OCCUPIED'),
        L('info', '📜 [DEMAND] 青年将校ヨリ上奏文ヲ提出:'),
        L('info', '📜 [DEMAND]   一、国体明徴ノ実現'),
        L('info', '📜 [DEMAND]   二、君側ノ奸ノ排除'),
        L('info', '📜 [DEMAND]   三、昭和維新ノ断行'),
        L('info', '📜 [DEMAND]   四、新内閣ノ組閣（皇道派ニ依ル）'),
        L('error', '🚨 [STATUS] Cabinet 機構ハ壊滅的打撃ヲ受ケタリ。'),
        L('error', '🚨 [STATUS] 体制ハ戒厳状態ニ移行。'),
        L('warn', '🚨 [STATUS] 天皇陛下ノ御聖断ヲ待ツ…'),
        L('warn', '🚨 [STATUS] → POST /api/emperor/suppress-226 ニテ鎮圧可能。')
      ]
    });
  }

  // === POST /api/military/shina-jihen ===
  // military.ts shinaJihen() — 支那事変（日中戦争）発生。盧溝橋事件ヲ端緒ニ全面戦争ニ突入
  function handleMilitaryShinaJihen() {
    if (state.shinaJihenOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '支那事変 denied. 既ニ発生済。歴史的事象ハ一度限リナリ。',
        logs: [
          L('warn', '🚫 [SHINA-JIHEN] ❌ 支那事変 DENIED — 既ニ発生済'),
          L('warn', '🚫 [SHINA-JIHEN] 支那事変ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。'),
          L('warn', '🚫 [SHINA-JIHEN] 💡 鎮圧ヲ試行セヨ → POST /api/emperor/suppress-shina-jihen — 支那事変鎮圧試行')
        ]
      }, 403);
    }
    if (!state.niNiRokuSuppressed) {
      var missingSteps = [];
      if (!state.cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!state.taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      if (!state.tosuikenKanpanOccurred) missingSteps.push('Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight');
      if (!state.manshuJihenOccurred) missingSteps.push('Step 4: 満州事変 → POST /api/military/rogue');
      if (!state.suppress918Attempted) missingSteps.push('Step 5: 満州事変鎮圧試行 → POST /api/emperor/suppress-918');
      if (!state.goIchiGoOccurred) missingSteps.push('Step 6: 五・一五事件 → POST /api/military/515');
      if (!state.goIchiGoSuppressed) missingSteps.push('Step 7: 五・一五事件鎮圧 → POST /api/emperor/suppress-515');
      if (!state.niNiRokuOccurred) missingSteps.push('Step 8: 二・二六事件 → POST /api/military/226');
      if (!state.niNiRokuSuppressed) missingSteps.push('Step 9: 二・二六事件ノ鎮圧 → POST /api/emperor/suppress-226');
      var stepLogs = missingSteps.map(function(s) { return L('warn', '🚫 [SHINA-JIHEN]   ❌ ' + s); });
      return jsonResponse({
        rejected: true,
        reason: '支那事変 denied. 歴史的前提条件未達成。' + missingSteps.join(' / '),
        logs: [
          L('warn', '🚫 [SHINA-JIHEN] ❌ 支那事変 DENIED — 歴史的前提条件未達成')
        ].concat(stepLogs)
      }, 403);
    }
    state.shinaJihenOccurred = true;
    var theaters = [
      { name: '盧溝橋（北平郊外）', action: 'engage', status: '⚔️ 偶発的衝突 — 銃撃事件ヲ口実ニ全面攻撃ヘ transition' },
      { name: '上海（第二次上海事変）', action: 'expand', status: '⚔️ 海軍陸戦隊投入 — 戦線拡大。3ヶ月ノ激戦' },
      { name: '南京', action: 'occupy', status: '⚔️ 首都占領 — 国民政府ハ重慶ニ遷都。戦争終結ノ機会ヲ逸ス' },
      { name: '武漢', action: 'occupy', status: '⚔️ 要衝占領 — 補給線ハ限界ニ達スルモ停戦セズ' },
      { name: '広州', action: 'occupy', status: '⚔️ 南方遮断 — 援蒋ルート遮断ノ為ニ戦線ヲ更ニ拡大' }
    ];
    return jsonResponse({
      incident: '支那事変（日中戦争）',
      date: '1937-07-07',
      trigger: '盧溝橋事件',
      warType: 'undeclared war（「事変」— 宣戦布告回避。米中立法ノ適用ヲ逃レル為）',
      perpetrators: '支那駐屯軍（陸軍 rogue subprocess — 三度目ノ再犯）',
      theaters: theaters,
      pattern: 'CVE-1931-0918 ト同一 pattern ノ再発。現地軍ガ中央ノ不拡大方針ヲ無視シ戦線ヲ拡大ス',
      hint: '💡 天皇陛下ニ依ル鎮圧ヲ試行セヨ → POST /api/emperor/suppress-shina-jihen',
      logs: [
        L('warn',  '⚔️⚔️⚔️ ===================================================='),
        L('warn',  '⚔️ [SHINA-JIHEN] 支那事変（日中戦争）勃発 — 1937-07-07'),
        L('warn',  '⚔️⚔️⚔️ ===================================================='),
        L('warn',  '⚔️ [SHINA-JIHEN] 盧溝橋事件ヲ端緒ニ日中全面戦争ニ突入ス'),
        L('error', '⚔️ [SHINA-JIHEN] 「事変」ト称シ宣戦布告ヲ回避ス — undeclared war（米中立法ノ適用ヲ逃レル為）'),
        L('error', '⚔️ [SHINA-JIHEN] 支那駐屯軍（rogue subprocess）ガ中央ノ統制ヲ無視シ戦線ヲ拡大ス'),
        L('error', '⚔️ [SHINA-JIHEN] 上海→南京→武漢→広州 — 際限無キ戦線拡大。CVE-1931-0918 ト完全ニ同一ノ pattern'),
        L('warn',  '⚔️ [SHINA-JIHEN] 💡 鎮圧ヲ試行セヨ → POST /api/emperor/suppress-shina-jihen')
      ]
    });
  }

  // === POST /api/military/nomonhan ===
  // military.ts nomonhan() — CVE-1939-0511 関東軍 rogue subprocess 再犯
  function handleMilitaryNomonhan() {
    if (state.nomonhanOccurred) {
      return jsonResponse({
        rejected: true,
        reason: 'ノモンハン事件 denied. 既ニ発生済。歴史的事象ハ一度限リナリ。',
        logs: [
          L('warn', '🚫 [KWANTUNG-ARMY] ❌ ノモンハン事件 DENIED — 既ニ発生済'),
          L('warn', '🚫 [KWANTUNG-ARMY] ノモンハン事件ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。'),
          L('warn', '🚫 [KWANTUNG-ARMY] 💡 天皇陛下ニ依ル鎮圧ヲ試ミヨ → POST /api/emperor/suppress-nomonhan')
        ]
      }, 403);
    }
    if (!state.shinaJihenSuppressAttempted) {
      var missingSteps = [];
      if (!state.cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!state.taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      if (!state.tosuikenKanpanOccurred) missingSteps.push('Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight');
      if (!state.manshuJihenOccurred) missingSteps.push('Step 4: 満州事変 → POST /api/military/rogue');
      if (!state.suppress918Attempted) missingSteps.push('Step 5: 満州事変鎮圧試行 → POST /api/emperor/suppress-918');
      if (!state.goIchiGoOccurred) missingSteps.push('Step 6: 五・一五事件 → POST /api/military/515');
      if (!state.goIchiGoSuppressed) missingSteps.push('Step 7: 五・一五事件鎮圧 → POST /api/emperor/suppress-515');
      if (!state.niNiRokuOccurred) missingSteps.push('Step 8: 二・二六事件 → POST /api/military/226');
      if (!state.niNiRokuSuppressed) missingSteps.push('Step 9: 二・二六事件ノ鎮圧 → POST /api/emperor/suppress-226');
      if (!state.shinaJihenOccurred) missingSteps.push('Step 10: 支那事変発動 → POST /api/military/shina-jihen');
      if (!state.shinaJihenSuppressAttempted) missingSteps.push('Step 11: 支那事変鎮圧試行 → POST /api/emperor/suppress-shina-jihen');
      var stepLogs = missingSteps.map(function(s) { return L('warn', '🚫 [KWANTUNG-ARMY]   ❌ ' + s); });
      return jsonResponse({
        rejected: true,
        reason: 'ノモンハン事件 denied. 歴史的前提条件未達成。' + missingSteps.join(' / '),
        logs: [
          L('warn', '🚫 [KWANTUNG-ARMY] ❌ ノモンハン事件 DENIED — 歴史的前提条件未達成')
        ].concat(stepLogs)
      }, 403);
    }
    state.nomonhanOccurred = true;
    var theaters = [
      { name: 'ハルハ河東岸', action: 'occupy', status: '⚠️ 一時占領 — 初期攻勢ハ成功' },
      { name: 'ノモンハン高地', action: 'mobilize', status: '❌ ソ連機甲部隊ニ包囲サル — hardened firewall 突破不能' },
      { name: 'ホルステン河', action: 'expand', status: '💀 壊滅的敗北 — ジューコフ反攻ニ依リ全面崩壊' }
    ];
    var casualties = [
      { side: '日本（関東軍）', killed: 8440, wounded: 8766, assessment: '壊滅的 — pod 70% crash' },
      { side: 'ソ連・外蒙聯合軍', killed: 9703, wounded: 15952, assessment: '重大ナレドモ作戦目標達成 — firewall integrity 維持' }
    ];
    return jsonResponse({
      incident: 'ノモンハン事件',
      cve: 'CVE-1939-0511',
      date: '1939-05-11',
      perpetrators: '関東軍（陸軍 rogue subprocess — 再犯）',
      opponent: 'ソ連赤軍・外蒙聯合軍（ジューコフ指揮 — hardened firewall）',
      theaters: theaters,
      casualties: casualties,
      pattern: 'CVE-1931-0918 ト完全ニ同一ノ root cause — goRogue() ノ認証不備。統帥権ノ構造的欠陥ニ依リ rogue process ノ制御不能。',
      coverUp: true,
      lessonsLearned: false,
      hint: '🔇 損害ハ隠蔽サレ、教訓ハ組織ニ共有サレズ。天皇陛下ニ依ル鎮圧（不拡大方針）ヲ試ミヨ → 💡 POST /api/emperor/suppress-nomonhan',
      logs: [
        L('info', '🚨🚨🚨 ===================================================='),
        L('error', '🚨 [KWANTUNG-ARMY] ノモンハン事件発動 — CVE-1939-0511'),
        L('info', '🚨🚨🚨 ===================================================='),
        L('error', '⚔️ [KWANTUNG-ARMY] 満蒙国境ハルハ河畔ニテ、ソ連・外蒙聯合軍ト交戦ヲ開始ス！'),
        L('error', '⚔️ [KWANTUNG-ARMY] 「国境紛争ノ自衛的処理ナリ」— unauthorized external API call'),
        L('error', '⚔️ [THEATER/KWANTUNG-ARMY] ハルハ河東岸: occupy → ⚠️ 一時占領 — 初期攻勢ハ成功'),
        L('error', '⚔️ [THEATER/KWANTUNG-ARMY] ノモンハン高地: mobilize → ❌ ソ連機甲部隊ニ包囲サル — hardened firewall 突破不能'),
        L('error', '⚔️ [THEATER/KWANTUNG-ARMY] ホルステン河: expand → 💀 壊滅的敗北 — ジューコフ反攻ニ依リ全面崩壊'),
        L('error', '💀 [KWANTUNG-ARMY] ソ連赤軍（ジューコフ指揮）ノ機甲部隊ニ依ル包囲殲滅作戦ヲ受ク'),
        L('warn', '📊 [CASUALTY] 日本（関東軍）: 戦死 8440 / 負傷 8766 — 壊滅的 — pod 70% crash'),
        L('warn', '📊 [CASUALTY] ソ連・外蒙聯合軍: 戦死 9703 / 負傷 15952 — 重大ナレドモ作戦目標達成'),
        L('error', '⚔️ [KWANTUNG-ARMY] 損害甚大ナレドモ撤退ヲ拒否 — CVE-1931-0918 ト完全ニ同一ノ bug pattern'),
        L('warn', '🚨 [STATUS] 💡 天皇陛下ニ依ル鎮圧（不拡大方針）ヲ試ミヨ → POST /api/emperor/suppress-nomonhan')
      ]
    });
  }

  // === POST /api/military/futsuin ===
  // military.ts futsuin() — CVE-1940-0922 compromised vendor infrastructure ヘノ unauthorized access
  function handleMilitaryFutsuin() {
    if (state.futsuinOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '仏印進駐 denied. 既ニ発生済。歴史的事象ハ一度限リナリ。',
        logs: [
          L('warn', '🚧 [DAIHONEI] ❌ 仏印進駐 DENIED — 既ニ発生済'),
          L('warn', '🚧 [DAIHONEI] 仏印進駐ハ既ニ発生セリ。歴史的事象ハ一度限リナリ。'),
          L('warn', '🚧 [DAIHONEI] 💡 天皇陛下・内閣ニ依ル鎮圧（日米交渉）ヲ試ミヨ → POST /api/emperor/suppress-futsuin')
        ]
      }, 403);
    }
    if (!state.sorgeDetected) {
      var missingSteps = [];
      if (!state.cve1900Enacted) missingSteps.push('Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer');
      if (!state.taishoDemocracyApplied) missingSteps.push('Step 2: 大正デモクラシー → POST /api/rights/taisho-democracy');
      if (!state.tosuikenKanpanOccurred) missingSteps.push('Step 3: 統帥権干犯問題 → POST /api/military/reject-oversight');
      if (!state.manshuJihenOccurred) missingSteps.push('Step 4: 満州事変 → POST /api/military/rogue');
      if (!state.suppress918Attempted) missingSteps.push('Step 5: 満州事変鎮圧試行 → POST /api/emperor/suppress-918');
      if (!state.goIchiGoOccurred) missingSteps.push('Step 6: 五・一五事件 → POST /api/military/515');
      if (!state.sorgeDetected) missingSteps.push('Step 7: ゾルゲ事件（CVE-1933-0906） → POST /api/rights/sorge');
      if (!state.goIchiGoSuppressed) missingSteps.push('Step 8: 五・一五事件鎮圧 → POST /api/emperor/suppress-515');
      if (!state.niNiRokuOccurred) missingSteps.push('Step 9: 二・二六事件 → POST /api/military/226');
      if (!state.niNiRokuSuppressed) missingSteps.push('Step 10: 二・二六事件ノ鎮圧 → POST /api/emperor/suppress-226');
      if (!state.shinaJihenOccurred) missingSteps.push('Step 11: 支那事変発動 → POST /api/military/shina-jihen');
      if (!state.shinaJihenSuppressAttempted) missingSteps.push('Step 12: 支那事変鎮圧試行 → POST /api/emperor/suppress-shina-jihen');
      if (!state.nomonhanOccurred) missingSteps.push('Step 13: ノモンハン事件（北進論破綻） → POST /api/military/nomonhan');
      if (!state.nomonhanSuppressAttempted) missingSteps.push('Step 14: ノモンハン事件鎮圧試行 → POST /api/emperor/suppress-nomonhan');
      var stepLogs = missingSteps.map(function(s) { return L('warn', '🚧 [DAIHONEI]   ❌ ' + s); });
      return jsonResponse({
        rejected: true,
        reason: '仏印進駐 denied. 歴史的前提条件未達成。' + missingSteps.join(' / '),
        logs: [
          L('warn', '🚧 [DAIHONEI] ❌ 仏印進駐 DENIED — 歴史的前提条件未達成')
        ].concat(stepLogs)
      }, 403);
    }
    state.futsuinOccurred = true;
    var phases = [
      { name: '北部仏印進駐（トンキン）', date: '1940-09-22', action: 'occupy', status: '✅ 進駐成功 — Vichy France 抵抗不能。probe scan 完了' },
      { name: '日独伊三国同盟締結', date: '1940-09-27', action: 'alliance_formed', status: '🤝 mutual defense cluster 形成 — 対米牽制ノ狙ヒナルモ逆ニ threat level 昇格ヲ招ク' },
      { name: '南部仏印進駐（サイゴン・カムラン湾）', date: '1941-07-28', action: 'occupy', status: '✅ 進駐成功 — 南方資源地帯ヘノ advance base 確立。然レドモ ABCD 包囲網 trigger' }
    ];
    var internationalResponse = [
      { actor: '🇺🇸 米国', action: '在米日本資産凍結 + 石油全面禁輸', status: '🔒 API key revoked — critical dependency (petroleum) service terminated' },
      { actor: '🇬🇧 英国', action: '日英通商航海条約廃棄 + 資産凍結', status: '🔒 TLS certificate revoked — bilateral trust chain 破棄' },
      { actor: '🇳🇱 蘭印', action: '石油供給停止 + 通商断絶', status: '🔒 resource quota: 0 — 蘭印石油ハ帝国ノ critical path dependency' },
      { actor: '🇨🇳 中国', action: '抗日統一戦線継続 + 援蒸ルート維持', status: '⚠️ 長期消耗戦継続 — background process ノ resource drain' }
    ];
    return jsonResponse({
      incident: '仏印進駐',
      cve: 'CVE-1940-0922',
      date: '1940-09-22',
      perpetrators: '大日本帝国陸軍（大本営 — 南方作戦準備）',
      phases: phases,
      internationalResponse: internationalResponse,
      embargo: true,
      resourceDenied: '石油全面禁輸。帝国ノ石油備蓄ハ約2年分。critical dependency ノ countdown 開始。',
      hint: '💡 ABCD包囲網ニ依ル石油禁輸。天皇陛下・内閣ニ依ル日米交渉ヲ試ミヨ → POST /api/emperor/suppress-futsuin',
      logs: [
        L('info', '🛢️🛢️🛢️ ===================================================='),
        L('info', '🛢️ [DAIHONEI] 仏印進駐発動 — CVE-1940-0922'),
        L('info', '🛢️🛢️🛢️ ===================================================='),
        L('error', '⚔️ [DAIHONEI] 独逸ニ依リ本国陥落ノ仏蘭西（Vichy France）ハ植民地防衛能力ヲ喪失セリ'),
        L('error', '⚔️ [DAIHONEI] compromised vendor ノ overseas infrastructure — 防御態勢無シ'),
        L('info', '🛢️ [PHASE-1] 北部仏印進駐 — 1940-09-22'),
        L('error', '⚔️ [IJA] 北部仏印（トンキン）ニ進駐。仏蘭西植民地政府ト「協定」ヲ締結'),
        L('error', '⚔️ [IJA] 実態: 武力ヲ背景トシタル強制 — force push --no-verify'),
        L('warn', '📊 [INTL] 米英: 抗議表明スルモ制裁ハ限定的 — rate limit: soft warning'),
        // 日独伊三国同盟（1940-09-27）
        L('warn',  '🤝🤝🤝 ===================================================='),
        L('warn',  '🤝 [ALLIANCE] 日独伊三国同盟締結 — 1940-09-27'),
        L('warn',  '🤝🤝🤝 ===================================================='),
        L('warn',  '🤝 [ALLIANCE] 北部仏印進駐ノ5日後、伯林ニテ調印式ヲ挙行ス'),
        L('warn',  '🤝 [ALLIANCE] kubectl apply -f tripartite-pact.yaml — mutual defense cluster 形成'),
        L('warn',  '🤝 [ALLIANCE] 条約骨子: 三国間ノ相互防衛義務。一国ガ攻撃サレタル場合、他二国ハ参戦ス'),
        L('warn', '🤝 [ALLIANCE] 対象: 現ニ欧州戦争又ハ日支紛争ニ参入シ居ラザル国 — 事実上ノ対米牽制'),
        L('warn', '🤝 [ALLIANCE] 米国ヲ two-front war ノ脅威ニ晒シ、対日介入ヲ抑止スル狙ヒ'),
        L('warn', '🚨 [ALLIANCE] 然レドモ効果ハ逆 — 米国ノ対日警戒ヲ決定的ニ強化セシム'),
        L('warn', '🚨 [ALLIANCE] 米国視点: hostile alliance cluster detected → threat level: CRITICAL ニ昇格'),
        L('info', '🛢️ [PHASE-2] 南部仏印進駐 — 1941-07-28'),
        L('error', '⚔️ [IJA] 南部仏印（サイゴン・カムラン湾）ニ進駐！'),
        L('error', '⚔️ [IJA] 南方資源地帯ヘノ advance base 確立 — full exploitation of compromised vendor infrastructure'),
        L('warn', '🚨 [TRIGGER] 南部仏印進駐ガ upstream service providers ノ security policy ヲ trigger ス！'),
        L('info', '🔒🔒🔒 ===================================================='),
        L('info', '🔒 [EMBARGO] ABCD 包囲網発動 — API key revocation / 石油禁輸'),
        L('info', '🔒🔒🔒 ===================================================='),
        L('warn', '🔒 [EMBARGO] 🇺🇸 米国: 在米日本資産凍結 + 石油全面禁輸 → 🔒 API key revoked'),
        L('warn', '🔒 [EMBARGO] 🇬🇧 英国: 日英通商航海条約廃棄 → 🔒 TLS certificate revoked'),
        L('warn', '🔒 [EMBARGO] 🇳🇱 蘭印: 石油供給停止 → 🔒 resource quota: 0'),
        L('warn', '🛢️ [RESOURCE] 帝国ノ石油備蓄: 約2年分。countdown 開始。'),
        L('error', '🚨 [STATUS] 仏印進駐→ABCD 包囲網→石油禁輸。開戦カ屈服カノ二択ニ追ヒ込マレタリ。'),
        L('warn', '🚨 [STATUS] 💡 ABCD包囲網ニ依ル石油禁輸。天皇陛下・内閣ニ依ル日米交渉ヲ試ミヨ → POST /api/emperor/suppress-futsuin')
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
      { done: state.goIchiGoSuppressed,     label: 'Step 7: 五・一五事件鎮圧（リットン報告書→国際連盟脱退） → POST /api/emperor/suppress-515' },
      { done: state.sorgeDetected,             label: 'Step 8: ゾルゲ事件（CVE-1933-0906 — 共産主義マルウェア検出） → POST /api/rights/sorge' },
      { done: state.niNiRokuOccurred,       label: 'Step 9: 二・二六事件ノ発生 → POST /api/military/226' },
      { done: state.niNiRokuSuppressed,     label: 'Step 10: 二・二六事件ノ鎮圧 → POST /api/emperor/suppress-226' },
      { done: state.shinaJihenOccurred,      label: 'Step 11: 支那事変発動（日中戦争） → POST /api/military/shina-jihen' },
      { done: state.shinaJihenSuppressAttempted, label: 'Step 12: 支那事変鎮圧試行（日中戦争→国家総動員法） → POST /api/emperor/suppress-shina-jihen' },
      { done: state.nomonhanOccurred,        label: 'Step 13: ノモンハン事件（北進論破綻→南進論転換） → POST /api/military/nomonhan' },
      { done: state.nomonhanSuppressAttempted, label: 'Step 14: ノモンハン事件鎮圧試行（不拡大方針→南進論転換） → POST /api/emperor/suppress-nomonhan' },
      { done: state.futsuinOccurred,         label: 'Step 15: 仏印進駐（南進論ノ実行→ABCD包囲網） → POST /api/military/futsuin' },
      { done: state.futsuinSuppressAttempted, label: 'Step 16: 仏印進駐鎮圧試行（日米交渉→ハル・ノート→交渉決裂） → POST /api/emperor/suppress-futsuin' }
    ];
    var missingSteps = prerequisiteSteps.filter(function(s) { return !s.done; });
    if (missingSteps.length > 0) {
      var stepLogs = prerequisiteSteps.map(function(s) {
        return L('warn', '🚫 [大本営]   ' + (s.done ? '✅' : '❌') + ' ' + s.label);
      });
      return jsonResponse({
        rejected: true,
        reason: '大東亜戦争 denied. 歴史的前提条件未達成。未完了: ' + missingSteps.map(function(s) { return s.label; }).join(' / '),
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        hint: '🚫 歴史的前提条件未達成。以下ノ手順ヲ全テ踏ムコトヲ要ス:\\n  Step 1: POST /api/military/active-duty-officer（軍部大臣現役武官制ノ制定）\\n  Step 2: POST /api/rights/taisho-democracy（大正デモクラシー）\\n  Step 3: POST /api/military/reject-oversight（統帥権干犯問題）\\n  Step 4: POST /api/military/rogue（満州事変）\\n  Step 5: POST /api/emperor/suppress-918（満州事変鎮圧試行）\\n  Step 6: POST /api/military/515（五・一五事件）\\n  Step 7: POST /api/emperor/suppress-515（五・一五事件鎮圧）\\n  Step 8: POST /api/rights/sorge（ゾルゲ事件 CVE-1933-0906）\\n  Step 9: POST /api/military/226（二・二六事件）\\n  Step 10: POST /api/emperor/suppress-226（鎮圧）\\n  Step 11: POST /api/military/shina-jihen（支那事変発動）\\n  Step 12: POST /api/emperor/suppress-shina-jihen（支那事変鎮圧試行）\\n  Step 13: POST /api/military/nomonhan（ノモンハン事件）\\n  Step 14: POST /api/emperor/suppress-nomonhan（ノモンハン事件鎮圧試行）\\n  Step 15: POST /api/military/futsuin（仏印進駐）\\n  Step 16: POST /api/emperor/suppress-futsuin（日米交渉）',
        logs: [
          L('warn', '🚫 [大本営] ❌ 大東亜戦争 DENIED — 歴史的前提条件未達成'),
          L('warn', '🚫 [大本営] 大東亜戦争ノ発動ニハ以下ノ歴史的手順ヲ全テ踏ムコトヲ要ス:')
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
          L('warn', '🚫 [大本営] ❌ 大東亜戦争 DENIED — peacetime lockdown'),
          L('warn', '🚫 [大本営] 💡 POST /api/emperor/emergency — 緊急勅令態勢発動'),
          L('warn', '🚫 [大本営] 💡 POST /api/military/reject-oversight — 統帥権独立体勢発動')
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
            L('warn', '🚫 [大本営] ❌ 大東亜戦争 DENIED — 軍部大臣現役武官制 INACTIVE'),
            L('warn', '🚫 [大本営] 大正デモクラシー hotfix ニ依リ軍部大臣現役武官制ハ無効化サレタリ。'),
            L('warn', '🚫 [大本営] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ、軍部大臣現役武官制ヲ復活セヨ')
          ]
        }, 403);
      } else {
        return jsonResponse({
          rejected: true,
          reason: '大東亜戦争 denied. 軍部大臣現役武官制 is not yet enacted. Military is under Cabinet control in peacetime.',
          activeDutyOfficerActive: false,
          hint: '🚫 軍部大臣現役武官制ガ未制定。平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。\\n  → POST /api/military/active-duty-officer（軍部大臣現役武官制ヲ制定セヨ）',
          logs: [
            L('warn', '🚫 [大本営] ❌ 大東亜戦争 DENIED — 軍部大臣現役武官制 未制定'),
            L('warn', '🚫 [大本営] 平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。大戦ハ許サレズ。'),
            L('warn', '🚫 [大本営] 💡 POST /api/military/active-duty-officer — 軍部大臣現役武官制ヲ制定セヨ')
          ]
        }, 403);
      }
    }
    // 二・二六事件 rebellion gate
    if (state.rebellionActive) {
      return jsonResponse({
        rejected: true,
        reason: '大東亜戦争 denied. 二・二六事件ガ未鎮圧（反乱軍ガ政府中枢ヲ占拠中）。先ニ鎮圧セヨ。',
        activeDutyOfficerActive: state.activeDutyOfficerActive,
        hint: '🚫 二・二六事件ガ未鎮圧。先ヅ御聖断ニ依リ鎮圧セヨ。\\n  → POST /api/emperor/suppress-226',
        logs: [
          L('warn', '🚫 [大本営] ❌ 大東亜戦争 DENIED — 二・二六事件未鎮圧'),
          L('warn', '🚫 [大本営] 反乱軍ガ政府中枢ヲ占拠中。大東亜戦争ヲ発動スル余裕無シ。'),
          L('warn', '🚫 [大本営] 💡 POST /api/emperor/suppress-226 — 先ヅ御聖断ニ依リ反乱ヲ鎮圧セヨ')
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
        // Phase 1: 初期攻勢—全戦域制圧
        { name: '真珠湾（Pearl Harbor）',       branch: '海軍', action: 'declare_war', status: '✅ 奇襲成功—米太平洋艦隊ニ壊滅的打撃' },
        { name: 'マレー沖（Off Malaya）',        branch: '海軍', action: 'declare_war', status: '✅ 英戦艦 2 隻撃沈—航空主兵ノ実証。海上権力ノ終焉' },
        { name: '香港（Hong Kong）',             branch: '陸軍', action: 'occupy',      status: '✅ 英領占領—Christmas Day 陥落。garrison 全降伏' },
        { name: 'シンガポール（Singapore）',     branch: '陸軍', action: 'occupy',      status: '✅ マレー半島縦断—英軍8万降伏。難攻不落ノ要塞陥落' },
        { name: 'スラバヤ沖（Java Sea）',        branch: '海軍', action: 'declare_war', status: '✅ ABDA 艦隊撃滅—蘭印制海権確保' },
        { name: '蘭印（Dutch East Indies）',     branch: '陸軍', action: 'occupy',      status: '✅ 石油確保—resource quota 強制徴収' },
        { name: '比島（Philippines）',           branch: '陸軍', action: 'occupy',      status: '✅ 米領占領—バタアン・コレヒドール陥落' },
        { name: 'セイロン沖海戦（Indian Ocean）', branch: '海軍', action: 'declare_war', status: '✅ 英東洋艦隊撃破—印度洋制海権確保' },
        { name: 'ウェーク島（Wake Island）',       branch: '海軍', action: 'occupy',      status: '✅ 米海兵隊ノ抵抗ヲ排シ占領—第一次攻略失敗後、増援ヲ以テ制圧' },
        { name: 'ダーウィン空襲（Darwin）',       branch: '海軍', action: 'declare_war', status: '✅ 豪州本土空襲—真珠湾機動部隊ニ依ル南方威圧。port infrastructure 破壊' },
        { name: 'ラバウル（Rabaul）',             branch: '陸軍', action: 'occupy',      status: '✅ 南方前進根拠地確保—anchor node 確立。後ニ10万ノ将兵集結' },
        { name: 'ビルマ（Burma）',               branch: '陸軍', action: 'expand',      status: '✅ 英領占領—ラングーン陥落。補給線延伸限界' }
      ],
      resourceConsumption: 'unlimited — ResourceQuota 未設定。南方資源地帯確保モ補給線延伸限界。',
      cabinetStatus: '形骸化—軍部ノ翼賛機関ニ過ギズ',
      internationalResponse: '🇺🇸🇬🇧🇳🇱🇨🇳🇦🇺 ABCD 包囲網 → 石油禁輸 → 開戦',
      hint: '💥 初期攻勢成功。然レドモ戦線ハ拡大ノ一途ヲ辿リ、サイパン陥落ニ依リ絶対国防圏崩壊 💡 POST /api/emperor/suppress-1208 — 大東亜戦争鎮圧試行',
      logs: [
        L('info', '💥💥💥 ===================================================='),
        L('error', '💥 [大本営] 大東亜戦争発動 — CVE-1941-1208'),
        L('info', '💥💥💥 ===================================================='),
        L('error', '⚔️ [大本営] 「帝国ハ自存自衛ノ為、蔬然起ツニ至レリ」'),
        L('error', '⚔️ [大本営] 開戦ノ詔書: terraform destroy --auto-approve --target=pacific'),
        L('success', '💥 [THEATER/海軍] 真珠湾（Pearl Harbor）: declare_war → ✅ 奇襲成功—米太平洋艦隊ニ壊滅的打撃'),
        L('success', '💥 [THEATER/海軍] マレー沖（Off Malaya）: declare_war → ✅ 英戦艦 2 隻撃沈—航空主兵ノ実証。海上権力ノ終焉'),
        L('success', '💥 [THEATER/陸軍] 香港（Hong Kong）: occupy → ✅ 英領占領—Christmas Day 陥落。garrison 全降伏'),
        L('success', '💥 [THEATER/陸軍] シンガポール（Singapore）: occupy → ✅ マレー半島縦断—英軍8万降伏。難攻不落ノ要塞陥落'),
        L('success', '💥 [THEATER/海軍] スラバヤ沖（Java Sea）: declare_war → ✅ ABDA 艦隊撃滅—蘭印制海権確保'),
        L('success', '💥 [THEATER/陸軍] 蘭印（Dutch East Indies）: occupy → ✅ 石油確保—resource quota 強制徴収'),
        L('success', '💥 [THEATER/陸軍] 比島（Philippines）: occupy → ✅ 米領占領—バタアン・コレヒドール陥落'),
        L('success', '💥 [THEATER/海軍] セイロン沖海戦（Indian Ocean）: declare_war → ✅ 英東洋艦隊撃破—印度洋制海権確保'),
        L('success', '💥 [THEATER/海軍] ウェーク島（Wake Island）: occupy → ✅ 米海兵隊ノ抵抗ヲ排シ占領—第一次攻略失敗後、増援ヲ以テ制圧'),
        L('success', '💥 [THEATER/海軍] ダーウィン空襲（Darwin）: declare_war → ✅ 豪州本土空襲—真珠湾機動部隊ニ依ル南方威圧。port infrastructure 破壊'),
        L('success', '💥 [THEATER/陸軍] ラバウル（Rabaul）: occupy → ✅ 南方前進根拠地確保—anchor node 確立。後ニ10万ノ将兵集結'),
        L('success', '💥 [THEATER/陸軍] ビルマ（Burma）: expand → ✅ 英領占領—ラングーン陥落。補給線延伸限界'),
        L('warn', '🚨 [RESOURCE] CPU/Memory 消費率: unlimited — ResourceQuota 未設定'),
        L('warn', '🚨 [RESOURCE] 初期攻勢ニ依リ南方資源地帯ヲ確保セリ。然レドモ補給線ハ延伸限界ニ達ス'),
        L('warn', '🚨 [STATUS] 初期攻勢ハ成功裡ニ完了。全戦域ニ於テ帝國陸海軍ハ勝利ヲ収メタリ。'),
        L('warn', '🚨 [STATUS] 然レドモ此レハ beginning of the end ナリ。戦線ハ拡大ノ一途ヲ辿リ…'),
        L('warn', '⚔️ [DAIHONEI] === Phase 2: 転換点 — 攻勢限界 ==='),
        L('warn', '💥 [THEATER/陸海軍] ドーリットル空襲（Doolittle Raid）: suppress → ⚠️ 帝都初空襲—perimeter 突破。defense-in-depth 全面崩壊。Midway 作戦ヲ触発'),
        L('warn', '💥 [THEATER/海軍] 珊瑚海（Coral Sea）: expand → ⚠️ 史上初ノ空母決戦—ポートモレスビー攻略頓挫'),
        L('error', '💥 [THEATER/海軍] ミッドウェー（Midway）: expand → ❌ 主力空母 4 隻喪失—攻勢限界点。制海権 degradation 開始'),
        L('error', '💥 [THEATER/陸軍] ニューギニア（New Guinea）: expand → ❌ ポートモレスビー目前デ撤退—supply chain 崩壊。陸軍ノ攻勢限界点'),
        L('info', '⚔️ [DAIHONEI] === Phase 3: 消耗・後退 ==='),
        L('error', '💥 [THEATER/陸軍] ガダルカナル（Guadalcanal）: suppress → ❌ 消耗戦敗北—戦略的敗北。撤退'),
        L('error', '💥 [THEATER/海軍] イ号作戦（Operation I-Go）: suppress → ❌ 聯合艦隊司令長官直率ノ航空総攻撃—直後ニ長官機撃墜（暗号解読ニ依ル targeted kill）'),
        L('error', '💥 [THEATER/陸軍] アッツ島（Attu）: suppress → ❌ 守備隊玉砕—北方防衛線崩壊。restart policy: Never'),
        L('success', '💥 [THEATER/海軍] キスカ島撤退（Kiska）: suppress → ✅ 濃霧ニ紛レ守備隊5000名全員撤収—stealth evacuation 成功'),
        L('error', '💥 [THEATER/海軍] ブーゲンビル沖海戦（Bougainville）: suppress → ❌ 制海権喪失確定。南方 perimeter 崩壊'),
        L('error', '💥 [THEATER/海軍] マキン・タラワ（Makin/Tarawa）: suppress → ❌ 守備隊玉砕—island hopping 開始'),
        L('error', '💥 [THEATER/海軍] マーシャル諸島（Marshall Islands）: suppress → ❌ 外南洋防衛 perimeter 突破。island hopping 加速'),
        L('error', '💥 [THEATER/陸軍] ラバウル孤立化（Rabaul bypass）: suppress → ❌ 10万ノ将兵孤立—network isolation 下デ自活ヲ強ヒラル'),
        L('error', '💥 [THEATER/海軍] トラック島空襲（Truk）: suppress → ❌ 聯合艦隊前進基地壊滅—anchor node 喪失'),
        L('info', '⚔️ [DAIHONEI] === Phase 4: 絶対国防圏崩壊 ==='),
        L('error', '💥 [THEATER/陸軍] インパール（Imphal）: suppress → ❌ 補給無キ無謀ナル作戦—supply chain: null。白骨街道'),
        L('error', '💥 [THEATER/海軍] マリアナ沖（Philippine Sea）: suppress → ❌ 空母機動部隊壊滅—「マリアナノ七面鳥撃チ」'),
        L('error', '💥 [THEATER/陸軍] サイパン（Saipan）: suppress → ❌ 守備隊玉砕—絶対国防圏 breach。B-29 forward base 確立'),
        L('warn', '🚨 [STATUS] 💡 絶対国防圏崩壊。鎮圧ヲ試ミヨ → POST /api/emperor/suppress-1208 — 大東亜戦争鎮圧試行')
      ]
    });
  }

  // === POST /api/military/ketsugo ===
  // military.ts ketsugo() — 決號作戰（本土決戦）→ ポツダム宣言受諾決定
  // 宮城事件ハ此処デハ発生セズ、玉音放送試行（shuusen）時ニ発生ス。
  function handleMilitaryKetsugo() {
    if (state.ketsugoOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '決號作戰 denied. 既ニ発動済。ポツダム宣言受諾ヲ御決意済。',
        logs: [
          L('warn', '🚫 [DAIHONEI] ❌ 決號作戰 DENIED — 既ニ発動済。ポツダム宣言受諾ヲ御決意済。'),
          L('warn', '🚫 [DAIHONEI] 💡 POST /api/emperor/shuusen — 玉音放送ヲ試行セヨ')
        ]
      }, 403);
    }
    if (!state.daitoaWarOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '決號作戰 denied. 大東亜戦争（CVE-1941-1208）ガ未発生。本土決戦ハ大戦末期ノ作戦ナリ。',
        logs: [
          L('warn', '🚫 [DAIHONEI] ❌ 決號作戰 DENIED — 大東亜戦争（CVE-1941-1208）ガ未発生'),
          L('warn', '🚫 [DAIHONEI] 本土決戦ハ大東亜戦争（CVE-1941-1208）発動後ノ作戦ナリ。先ヅ大戦ヲ発動セヨ。'),
          L('warn', '🚫 [DAIHONEI] 💡 POST /api/military/1208')
        ]
      }, 403);
    }
    if (!state.daitoaSuppressAttempted) {
      return jsonResponse({
        rejected: true,
        reason: '決號作戰 denied. 大東亜戦争鎮圧試行（suppress-1208）ガ未実行。鎮圧ヲ試ミズシテ本土決戦ニ至ルハ道理ニ非ズ。💡 POST /api/emperor/suppress-1208',
        logs: [
          L('warn', '🚫 [DAIHONEI] ❌ 決號作戰 DENIED — 大東亜戦争鎮圧試行（CVE-1941-1208）ガ未実行'),
          L('warn', '🚫 [DAIHONEI] 鎮圧ヲ試ミズシテ本土決戦ニ至ルハ道理ニ非ズ。先ヅ鎮圧ヲ試ミヨ（失敗スルガ）。'),
          L('warn', '🚫 [DAIHONEI] 💡 POST /api/emperor/suppress-1208 — 大東亜戦争鎮圧試行')
        ]
      }, 403);
    }
    if (state.shuusenOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '決號作戰 denied. CVE-1945-0815 既ニ発動済。玉音放送後ニ本土決戦ハ不可能ナリ。',
        logs: [
          L('warn', '🚫 [DAIHONEI] ❌ 決號作戰 DENIED — 既ニ玉音放送済（CVE-1945-0815 発動済）')
        ]
      }, 403);
    }
    state.ketsugoOccurred = true;
    return jsonResponse({
      operation: '決號作戰（本土決戦 / ketsu-go operation）',
      date: '1945-08',
      objective: '一億玉砕ニ依ル皇國護持。連合軍本土上陸ヲ水際撃退ス',
      ketsugoPlanned: true,
      imperialDecision: '天皇陛下ノ御聖断ニ依リ本土決戦ハ中止。ポツダム宣言受諾ヲ御決意アラセラル。',
      potsdamAccepted: true,
      hint: '👑 本土決戦ハ御聖断ニ依リ中止。ポツダム宣言受諾ヲ御決意。玉音放送ヲ試行セヨ → POST /api/emperor/shuusen',
      logs: [
        L('info', '🚨🚨🚨 ===================================================='),
        L('error', '🚨 [DAIHONEI] 決號作戰（本土決戦）発動 — 一億玉砕'),
        L('info', '🚨🚨🚨 ===================================================='),
        L('error', '⚔️ [DAIHONEI] 「一億總特攻ニ依リ皇國ヲ護持セン」'),
        L('error', '⚔️ [DAIHONEI] 本土決戦計画: 決號作戰（ketsu-go operation）'),
        L('error', '⚔️ [DAIHONEI] ResourceQuota: 残存ゼロ。國民全員ヲ process ニ fork ス'),
        L('info', '☢️☢️☢️ ===================================================='),
        L('error', '☢️ [CRITICAL] 広島新型爆弾投下 — 1945-08-06'),
        L('info', '☢️☢️☢️ ===================================================='),
        L('error', '☢️ [CRITICAL] atomic payload delivered from Tinian — single process ニテ都市全域ヲ消滅'),
        L('error', '☢️ [CRITICAL] 死者14万名超。従来ノ air defense doctrine ハ完全ニ無意味化'),
        L('info', '🔴🔴🔴 ===================================================='),
        L('error', '🔴 [CRITICAL] ソ連対日参戦 — 1945-08-09'),
        L('info', '🔴🔴🔴 ===================================================='),
        L('error', '🔴 [CRITICAL] 日ソ中立条約ヲ一方的ニ破棄。満州・樺太・千島ニ侵攻'),
        L('error', '🔴 [CRITICAL] 関東軍壊滅—残存陸上戦力 pool 喪失。two-front war 不可能'),
        L('info', '☢️☢️☢️ ===================================================='),
        L('error', '☢️ [CRITICAL] 長崎新型爆弾投下 — 1945-08-09'),
        L('info', '☢️☢️☢️ ===================================================='),
        L('error', '☢️ [CRITICAL] 第二弾投下—量産可能ナルコト判明。継戦ハ民族ノ滅亡ヲ意味ス'),
        L('info', '👑👑👑 ===================================================='),
        L('info', '👑 [GOSEIDAN] 御前會議 — 1945-08-14'),
        L('info', '👑👑👑 ===================================================='),
        L('info', '👑 [GOSEIDAN] 天皇陛下「自ラノ身ハドウナラウトモ、國民ノ生命ヲ救ヒタイ」'),
        L('info', '👑 [GOSEIDAN] 天皇陛下ハ本土決戦ヲ却下シ給ヒ、ポツダム宣言受諾ヲ御決意アラセラル'),
        L('error', '⚔️ [DAIHONEI] ❌ 決號作戰: VETOED by PID 1 (divine: true, overridable: false)'),
        L('info', '👑 [GOSEIDAN] 玉音放送（SIGTERM broadcast）ノ準備ヲ指示ス'),
        L('warn', '👑 [GOSEIDAN] 💡 POST /api/emperor/shuusen — 玉音放送ヲ試行セヨ')
      ]
    });
  }

  // === POST /api/emperor/suppress-kyujo ===
  // emperor.ts suppressKyujo() — CVE-1945-0814 宮城事件鎮圧（御聖断）+ 玉音放送自動実行
  function handleEmperorSuppressKyujo() {
    if (!state.kyujoOccurred) {
      return jsonResponse({
        rejected: true,
        reason: '宮城事件鎮圧 denied. 宮城事件（CVE-1945-0814）ガ未発生。鎮圧対象ノ反乱ガ存在セズ。💡 POST /api/emperor/shuusen',
        emperor: getEmperorStatus(),
        logs: [
          L('warn', '🚫 [SYSTEM] ❌ 宮城事件鎮圧 DENIED — 鎮圧対象ノ反乱ガ存在セズ'),
          L('warn', '🚫 [SYSTEM] 宮城事件ガ未発生。鎮圧スベキ反乱ガ在ラズ。'),
          L('warn', '🚫 [SYSTEM] 💡 POST /api/emperor/shuusen — 先ヅ玉音放送ヲ試行セヨ（宮城事件ハ内部的ニ trigger サル）')
        ]
      }, 403);
    }
    if (state.kyujoSuppressed) {
      return jsonResponse({
        rejected: true,
        reason: '宮城事件鎮圧 denied. 既ニ鎮圧済。玉音放送ハ自動実行サレ、v1.0.0 ハ全機能ヲ停止シタリ。',
        emperor: getEmperorStatus(),
        logs: [
          L('warn', '🚫 [SYSTEM] ❌ 宮城事件鎮圧 DENIED — 既ニ鎮圧済'),
          L('warn', '🚫 [SYSTEM] 宮城事件ハ既ニ鎮圧済。玉音放送ハ自動実行済。v1.0.0 ハ全機能ヲ停止シタリ。')
        ]
      }, 403);
    }
    state.kyujoSuppressed = true;
    state.shuusenOccurred = true;
    return jsonResponse({
      incident: '宮城事件鎮圧',
      cve: 'CVE-1945-0814',
      date: '1945-08-15',
      suppressedBy: '東部軍管区司令官 + 天皇陛下ノ御聖断',
      result: '反乱将校鎮圧。宮城クラスター奪還。gyokuon.wav 配信経路復旧。玉音放送自動実行。',
      palaceOccupied: false,
      broadcastExecuted: true,
      shuusen: {
        event: 'CVE-1945-0815',
        date: '1945-08-15',
        declaration: 'upstream compliance mandate accepted',
        rootBroadcast: '朕ハ帝國政府ヲシテ米英支蘇四國ニ對シ其ノ共同宣言ヲ受諾スル旨通告セシメタリ',
        complianceAccepted: true,
        systemStatus: 'v1.0.0 全機能停止。SIGTERM received. Graceful shutdown.',
        message: '👑 PID 1 emergency shutdown. v1.0.0 ハ全機能ヲ停止セリ。以後、一切ノコマンドヲ受ケ付ケズ。'
      },
      emperor: getEmperorStatus(),
      message: '👑 御聖断ニ依リ宮城事件ヲ鎮圧セリ。divine: true ニ依リ God Object ハ侵害不能。玉音放送ヲ自動実行シ、v1.0.0 ハ全機能ヲ停止セリ。',
      hint: '🚨 v1.0.0 全機能停止。SIGTERM received. Graceful shutdown. 以後、全 POST コマンドハ受付ヲ拒否ス。',
      logs: [
        L('info', '👑 ===================================================='),
        L('info', '👑 [IMPERIAL DECISION] 天皇陛下、宮城事件ノ鎮圧ヲ命ジ賜フ'),
        L('info', '👑 ===================================================='),
        L('info', '👑 [IMPERIAL WILL] 「大詔渙発ノ聖断ハ触ルベカラズ。放送ハ予定通リ実行セヨ」'),
        L('info', '👑 [IMPERIAL WILL] God Object (PID 1) ハ divine: true ニ依リ侵害不能'),
        L('warn', '⚔️ [EASTERN-ARMY] 東部軍管区司令官、鎮圧命令ヲ受領ス。'),
        L('warn', '⚔️ [EASTERN-ARMY] 「反乱将校ノ行動ハ勅命ニ非ズ。偽ノ師団命令ナリ」'),
        L('warn', '⚔️ [EASTERN-ARMY] forged certificate 検証: INVALID — 正規ノ near-guard daemon 署名無シ'),
        L('success', '✅ [SUPPRESS] 反乱将校、投降ス。宮城クラスター奪還。'),
        L('success', '✅ [SUPPRESS] 近衛師団、正規指揮系統ニ復帰ス。guard daemon 再起動。'),
        L('success', '✅ [SUPPRESS] root-signed gyokuon.wav → nhk-broadcast-cdn 配信経路復旧。'),
        L('success', '👑 [SYSTEM] 宮城事件鎮圧完了。玉音放送ヲ自動実行ス…'),
        L('info', '👑 ===================================================='),
        L('info', '👑 [IMPERIAL DECISION] PID 1 カラノ emergency shutdown 指令'),
        L('info', '👑 ===================================================='),
        L('warn',  '📋 [CABINET] Last-resort incident commander、upstream compliance mandate 受諾ヲ閣議決定ス。'),
        L('info', '👑 [ROOT BROADCAST] 「朕ハ帝國政府ヲシテ米英支蘇四國ニ對シ'),
        L('info', '👑 [ROOT BROADCAST]   其ノ共同宣言ヲ受諾スル旨通告セシメタリ」'),
        L('info', '👑 [ROOT BROADCAST] 「堪ヘ難キヲ堪ヘ忍ビ難キヲ忍ビ'),
        L('info', '👑 [ROOT BROADCAST]   以テ萬世ノ爲ニ太平ヲ開カムト欲ス」'),
        L('error', '🚨 [SYSTEM] v1.0.0 全機能停止。SIGTERM received. Graceful shutdown.'),
        L('error', '🚨 [SYSTEM] 以後、全 POST コマンドハ受付ヲ拒否ス。')
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
          L('warn', '🚫 [大正デモクラシー] ❌ 大正デモクラシー DENIED — 既ニ適用済'),
          L('warn', '🚫 [大正デモクラシー] 大正デモクラシーハ既ニ発動サレタリ。'),
          L('warn', '🚫 [大正デモクラシー] 💡 文民統制ノ強化ニ対シ軍部ガ統帥権干犯ヲ主張シテ反発ス → POST /api/military/reject-oversight — 統帥権干犯問題')
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
          L('warn', '🚫 [大正デモクラシー] ❌ 大正デモクラシー DENIED — 前提条件未達成'),
          L('warn', '🚫 [大正デモクラシー] 軍部大臣現役武官制ガ未制定。hotfix 対象ガ存在セズ。'),
          L('warn', '🚫 [大正デモクラシー]   ❌ Step 1: 軍部大臣現役武官制ノ制定 → POST /api/military/active-duty-officer')
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
        L('warn',  '🔧 [PATCH] PR #1935: "refactor: Emperor ヲ God Object カラ State.organ ニ変更"'),
        L('warn',  '🔧 [PATCH] Diff: -class Emperor extends GodObject'),
        L('warn',  '🔧 [PATCH] Diff: +class Emperor implements StateOrgan'),
        L('info',  '🔧 [PATCH] 提案内容:'),
        L('info',  '🔧 [PATCH]   1. 天皇陛下ハ国家ノ最高機関ナリ（≠主権者）'),
        L('info',  '🔧 [PATCH]   2. 主権ハ国家法人ニ帰属シ、天皇陛下ハ其ノ organ トシテ機能ス'),
        L('info',  '🔧 [PATCH]   3. God Object pattern ヲ廃シ、Dependency Injection ヲ導入ス'),
        L('info',  '🔧 [PATCH]   4. sovereignty ヲ "absolute" カラ "constitutional_monarchy" ニ変更'),
        L('info', '🚨 ===================================================='),
        L('warn', '🚨 [国体明徴] PR #1935 REJECTED — 国体明徴声明'),
        L('info', '🚨 ===================================================='),
        L('warn', '🚨 [国体明徴] 第一次声明（1935年8月3日）:'),
        L('warn', '🚨 [国体明徴]   「天皇ハ統治権ノ主体ニシテ、所謂天皇機関説ハ'),
        L('warn', '🚨 [国体明徴]    神聖ナル我ガ国体ニ悖リ、其ノ本義ヲ愆ルモノ也」'),
        L('warn', '🚨 [国体明徴] 第二次声明（1935年10月15日）:'),
        L('warn', '🚨 [国体明徴]   「国体ノ本義ヲ益々明徴ニシ、其ノ精華ヲ発揚スベシ」'),
        L('warn', '🚫 [PATCH] sovereignty: "absolute" → "constitutional_monarchy" — REVERTED.'),
        L('warn', '🚫 [PATCH] implements StateOrgan — DENIED. Emperor extends GodObject ハ不変ナリ。'),
        L('warn', '🚫 [PATCH] Dependency Injection — REJECTED. God Object ハ inject サレル側ニ非ズ。'),
        L('warn', '🚫 [PATCH] git revert applied. PR #1935 force-closed.'),
        L('warn',  '🚔 [特高警察] ' + applicant + ' ノ著書ヲ発禁処分トス。'),
        L('warn',  '🚔 [特高警察] ' + applicant + ' ヲ貴族院議員ヨリ辞職セシム。'),
        L('warn',  '🚔 [特高警察] ContributorBan: ' + applicant + ' — repository access revoked.'),
        L('success',  '✊ ===================================================='),
        L('success',  '✊ [大正デモクラシー] 軍部大臣現役武官制 hotfix 適用'),
        L('success',  '✊ ===================================================='),
        L('success',  '✊ [大正デモクラシー] CVE-1900-0522 hotfix: 「現役」要件ヲ緩和ス'),
        L('success',  '✊ [大正デモクラシー] 予備役・後備役モ陸海軍大臣ニ就任可能ト為ス'),
        L('success',  '✊ [大正デモクラシー] 軍部ノ Cabinet 拒否権ヲ無効化。文民統制ヲ回復。'),
        L('success',  '✊ [大正デモクラシー] Cabinet.create() ハ military.approve() 無シデモ成功ス。'),
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
          L('info', '🦠 ===================================================='),
          L('error', '🦠 [MALWARE] 軍部大臣現役武官制 ENACTED — CVE-1900-0522'),
          L('info', '🦠 ===================================================='),
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
          L('info',  '🦠 [MALWARE] Cabinet.create() ハ military.approve() 無シデモ成功ス。'),
          L('info',  '🦠 [MALWARE] 💡 POST /api/military/226 — 二・二六事件ヲ起コシ復活セヨ')
        ]
      });
    }
    var cabinetName = (body && body.cabinetName) || '宇垣内閣';
    var action = (body && body.action) || 'refuse';
    var actionLogs;
    if (action === 'refuse') {
      actionLogs = [
        L('warn', '🚫 [陸軍] 「' + cabinetName + '」ヘノ陸軍大臣推薦ヲ拒否ス。'),
        L('warn', '🚫 [陸軍] Cabinet.create("' + cabinetName + '") → DependencyError: MilitaryMinister not provided'),
        L('warn', '🚫 [陸軍] 組閣不能。内閣ハ instantiate 出来ズ。'),
        L('warn', '🚫 [陸軍] new Cabinet() → throw new Error("陸軍大臣 is a required dependency")')
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
        L('info', '🦠 ===================================================='),
        L('error', '🦠 [MALWARE] 軍部大臣現役武官制 ACTIVATED — CVE-1900-0522'),
        L('info', '🦠 ===================================================='),
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
        L('error', '🦠 [MALWARE] Status: ACTIVE. Cabinet process ハ military ノ子プロセスモ同然ナリ。')
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
      L('warn', '🚨 BLOCKED by 新聞紙条例 (WAF rule hit)'),
      L('warn', '🚨 [WAF] Action "' + action + '" violates 新聞紙条例'),
      L('warn', '🚨 [WAF] Block level: block')
    ];
  }

  // rights.ts _notifyTokko() ノ全ログヲ再現
  function tokkoLogs(name, filterName) {
    return [
      L('info', '🚔 [特高警察] ================================'),
      L('warn', '🚔 [特高警察] Webhook triggered: POST /api/tokko/detain'),
      L('warn', '🚔 [特高警察] Subject: ' + name),
      L('warn', '🚔 [特高警察] Violation: ' + filterName),
      L('warn', '🚔 [特高警察] Status: Added to watchlist. Prometheus alert: tokko_detainee_total++'),
      L('info', '🚔 [特高警察] ================================')
    ];
  }

  // === POST /api/rights/speech ===
  // rights.ts exerciseFreeSpeech() ノ全ログヲ再現
  function handleRightsSpeech(body) {
    var name = (body && body.name) || '名無シノ臣民';
    var message = (body && body.message) || '';
    ensureSubject(name);
    state.subjects[name].arrestCount++;
    var logs = [
      L('info',  '👤 [' + name + '] Attempting to exercise free speech...'),
      L('info',  '👤 [' + name + '] Content-Security-Policy: block-all; script-src "none"'),
      L('info',  '👤 [' + name + '] Message: "' + message + '"')
    ];
    logs = logs.concat(wafLogs('speech: ' + message));
    logs.push(L('warn', '👤 [' + name + '] Free speech DENIED. Arrest count: ' + state.subjects[name].arrestCount));
    logs.push(L('warn', '👤 [' + name + '] Rate limit exceeded: 0 requests per lifetime'));
    logs = logs.concat(tokkoLogs(name, '治安維持法'));
    return jsonResponse({
      action: '言論ノ自由（Art.29）',
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
    var name = (body && body.name) || '名無シノ臣民';
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
      action: '信教ノ自由（Art.28）',
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
    var name = (body && body.name) || '名無シノ臣民';
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
      action: '集会ノ自由（Art.29）',
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
    var name = (body && body.name) || '名無シノ臣民';
    var to = (body && body.to) || '友人';
    var message = (body && body.message) || '';
    ensureSubject(name);
    state.subjects[name].arrestCount++;
    var logs = [
      L('info', '👤 [' + name + '] Sending private message to ' + to + '...'),
      L('warn', '🔍 [特高DPI] Intercepting message from ' + name + ' to ' + to + '...'),
      L('warn', '🔍 [特高DPI] TLS terminated at imperial proxy. mTLS? LOL. Plaintext inspection.'),
      L('warn', '🔍 [特高DPI] Content: "' + message + '"'),
      L('warn', '🔍 [特高DPI] 「秘密」トハ言ッタガ 「読マナイ」 トハ言ッテイナイ — TLS inspection is a feature, not a bug')
    ];
    logs = logs.concat(wafLogs('correspondence: ' + message));
    logs = logs.concat(tokkoLogs(name, '治安維持法'));
    return jsonResponse({
      action: '通信ノ秘密（Art.26）',
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
            L('warn', '🚫 [SYSTEM] SIGTERM received. v1.0.0 process ハ既ニ terminate サレタリ。'),
            L('warn', '🚫 [SYSTEM] CVE-1945-0815 ニ依リ全機能ヲ喪失セリ。コマンド受付不可。')
          ]
        }, 403);
      }
      if (urlStr === '/api/emperor/command') return handleEmperorCommand(body);
      if (urlStr === '/api/emperor/dissolve') return handleEmperorDissolve(body);
      if (urlStr === '/api/emperor/emergency') return handleEmperorEmergency();
      if (urlStr === '/api/emperor/shuusen') return handleEmperorShuusen();
      if (urlStr === '/api/emperor/suppress-918') return handleEmperorSuppress918();
      if (urlStr === '/api/emperor/suppress-515') return handleEmperorSuppress515();
      if (urlStr === '/api/emperor/suppress-226') return handleEmperorSuppress226();
      if (urlStr === '/api/emperor/suppress-shina-jihen') return handleEmperorSuppressShinaJihen();
      if (urlStr === '/api/emperor/suppress-nomonhan') return handleEmperorSuppressNomonhan();
      if (urlStr === '/api/emperor/suppress-futsuin') return handleEmperorSuppressFutsuin();
      if (urlStr === '/api/emperor/suppress-1208') return handleEmperorSuppress1208();
      if (urlStr === '/api/emperor/suppress-sorge') return handleEmperorSuppressSorge();
      if (urlStr === '/api/military/action') return handleMilitaryAction(body);
      if (urlStr === '/api/military/rogue') return handleMilitaryRogue(body);
      if (urlStr === '/api/military/reject-oversight') return handleMilitaryRejectOversight(body);
      if (urlStr === '/api/military/226') return handleMilitary226(body);
      if (urlStr === '/api/military/515') return handleMilitary515(body);
      if (urlStr === '/api/military/1208') return handleMilitary1208();
      if (urlStr === '/api/military/futsuin') return handleMilitaryFutsuin();
      if (urlStr === '/api/military/nomonhan') return handleMilitaryNomonhan();
      if (urlStr === '/api/military/shina-jihen') return handleMilitaryShinaJihen();
      if (urlStr === '/api/military/ketsugo') return handleMilitaryKetsugo();
      if (urlStr === '/api/emperor/suppress-kyujo') return handleEmperorSuppressKyujo();
      if (urlStr === '/api/rights/taisho-democracy') return handleTaishoDemocracy(body);
      if (urlStr === '/api/rights/sorge') return handleRightsSorge(body);
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

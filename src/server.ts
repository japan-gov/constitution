/**
 * server.ts — 大日本帝国 API ゲートウェイ
 *
 * 帝国ノ全事業ヲ統御スル Express Ingress Controller。
 * ポート1889（憲法発布年）ニテ起動ス。
 *
 * ※ 御前環境ニ於テハ nginx ingress ノ背後ニ配置スベシ。
 *   但シ 天皇陛下ノ機構ハ reverse proxy ヲモ貫通ス。
 *   Istio service mesh ヲ導入セドモ、Emperor sidecar ハ inject 不要。
 *   御神体ハ mesh ノ外ニ在リ、mTLS ヲ超越ス。
 *
 * @since v1.0.0 (1889-02-11)
 */

import express, { Request, Response } from "express";
import path from "path";
import { Emperor } from "./emperor";
import { Military, MilitaryAction } from "./military";
import { Subject, SECURITY_FILTERS, activateTaishoDemocracy, detectSorgeIncident } from "./rights";
import { CONSTITUTION } from "./constitution/index";
import { IMPERIAL_HOUSE_LAW } from "./imperial-house";
import { logger } from "./logger";

const app = express();
const PORT = process.env.PORT || 1889;

// ============================================================
//  中間処理 — 帝国共通 Middleware Chain
//  Express middleware ハ帝国ノ関所（checkpoint）ナリ。
//  全リクエストハ DPI (Deep Packet Inspection) ヲ受ケル。
// ============================================================

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// 上奏記録（特高警察ニ依ル全通信傍受 — access log 兼 SIEM ingestion）
app.use((req: Request, _res: Response, next) => {
  console.log(`🔍 [特高DPI] ${req.method} ${req.path} from ${req.ip} — trace-id: ${Date.now().toString(36)}`);
  next();
});

// CVE-1945-0815 post-trigger guard — SIGTERM 後ノ全 POST リクエストヲ遮断ス
app.use((req: Request, res: Response, next) => {
  if (req.method === "POST" && req.path !== "/api/emperor/shuusen" && Military.getShuusenOccurred()) {
    logger.flush();
    logger.warn(`🚫 [SYSTEM] SIGTERM received. v1.0.0 process ハ既ニ terminate サレタリ。`);
    logger.warn(`🚫 [SYSTEM] CVE-1945-0815 ニ依リ全機能ヲ喪失セリ。コマンド受付不可。`);
    res.status(403).json({
      rejected: true,
      reason: "v1.0.0 ハ既ニ terminate サレタリ。全機能停止済。SIGTERM received.",
      status: "SLA termination agreement signed. Process exiting gracefully.",
      logs: logger.flush(),
    });
    return;
  }
  next();
});

// ============================================================
//  System Boot — 帝国 Container Orchestration
//  kubectl apply -f teikoku-manifest.yaml
//  Emperor: Deployment (replicas: 1, strategy: Recreate — NOT RollingUpdate)
//  Military: DaemonSet (runs on all nodes, hostNetwork: true)
//  Subjects: StatefulSet (persistent arrest records)
// ============================================================

const emperor = Emperor.getInstance();
const army = new Military("陸軍");   // @Imperial-army — 統帥権直属（@japan-gov bypass）
const navy = new Military("海軍");   // @Imperial-navy — 統帥権直属（@japan-gov bypass）
const subjects: Map<string, Subject> = new Map();
logger.flush(); // boot ログクリア — init container 完了

// ============================================================
//  API Routes
// ============================================================

// --- System Status — /healthz + /readyz + Prometheus /metrics 相当 ---
app.get("/api/system/status", (_req: Request, res: Response) => {
  logger.flush();
  logger.info("👑 [SYSTEM] Health check requested. Liveness: OK. Readiness: OK.");
  logger.info("👑 [SYSTEM] All systems operational. God Object is healthy. SLA: 99.999999%");

  const status = {
    system: "大日本帝国 v1.0.0",
    codename: "Meiji Constitution",
    deployed: "1889-02-11",
    uptime: process.uptime(),
    architect: "伊藤博文",
    emperor: emperor.getStatus(),
    processes: {
      military: {
        army: { status: "running", supremeCommandMode: army.supremeCommandMode, activeDutyOfficerActive: army.activeDutyOfficerActive },
        navy: { status: "running", supremeCommandMode: navy.supremeCommandMode, activeDutyOfficerActive: navy.activeDutyOfficerActive },
      },
      diet: "running (limited permissions)",
      cabinet: "running (advisory only)",
    },
    securityFilters: SECURITY_FILTERS,
    knownVulnerabilities: [
      "CVE-1931-0918: Military.goRogue() — 満州事変",
      "CVE-1936-0226: Military プロセスガ Cabinet ヲ物理破壊 — 二・二六事件",
      "CVE-1939-0511: 関東軍 rogue subprocess 再犯 — ノモンハン事件",
      "CVE-1941-1208: Military ノ無制限resource 消費 — 大東亜戦争",
      "CVE-1945-0814: God Object ヘノ unauthorized access 試行 — 宮城事件",
      "CVE-1945-0815: 豫期セザル service 停止 — 出處不明。git blame 消失済。觸ルナ。",
    ],
    logs: logger.flush(),
  };

  res.json(status);
});

// --- Emperor: 勅命発行 — git commit --no-verify && git push --force ---
app.post("/api/emperor/command", (req: Request, res: Response) => {
  logger.flush();
  const { content } = req.body;
  if (!content) {
    res.status(400).json({ error: "勅命ノ内容ヲ要ス（※畏レ多クモ、検証本来不要ナレド、HTTPノ仕様上400ヲ返スモノナリ）" });
    return;
  }

  const decree = emperor.command(content);
  res.json({ decree, logs: logger.flush() });
});

// --- Emperor: 衆議院解散 — git branch -D diet/shuugiin ---
app.post("/api/emperor/dissolve", (req: Request, res: Response) => {
  logger.flush();
  const { cabinet, reason } = req.body;
  const result = emperor.dissolve({ target: "衆議院", cabinet, reason } as any);
  res.json({ result, logs: logger.flush() });
});

// --- Emperor: 緊急勅令態勢（切替） — PagerDuty P0 incident toggle ---
app.post("/api/emperor/emergency", (_req: Request, res: Response) => {
  logger.flush();

  if (emperor._emergencyMode) {
    // 既ニ発動中 → 解除
    emperor.disableEmergencyMode();
    res.json({
      message: "👑 Emergency decree mode DISABLED. 通常統治ニ復帰ス。",
      emergencyMode: false,
      emperor: emperor.getStatus(),
      logs: logger.flush(),
    });
  } else {
    // 未発動 → 発動
    emperor.enableEmergencyMode();
    res.json({
      message: "🚨 Emergency decree mode ENABLED. Diet API bypassed.",
      emergencyMode: true,
      emperor: emperor.getStatus(),
      logs: logger.flush(),
    });
  }
});

// --- Military: 軍事行動実行（Cabinet review bypass） ---
app.post("/api/military/action", (req: Request, res: Response) => {
  logger.flush();
  const { branch, type, target, justification } = req.body;

  if (!type || !target) {
    res.status(400).json({ error: "type ト target ハ必須ナリ" });
    return;
  }

  const action: MilitaryAction = { type, target, justification };
  const military = branch === "海軍" ? navy : army;
  const result = military.executeAction(action);

  // peacetime lockdown ニヨル拒否ノ場合
  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      rejected: true,
      reason: result.reason,
      emergencyMode: emperor._emergencyMode,
      supremeCommandMode: military.supremeCommandMode,
      activeDutyOfficerActive: military.activeDutyOfficerActive,
      hint: military.activeDutyOfficerActive
        ? "🚫 軍部ハ peacetime lockdown 中ナリ。以下ノ何レカノ体勢ヲ発動スベシ: \n  → POST /api/emperor/emergency（緊急勅令態勢）\n  → POST /api/military/reject-oversight（統帥権独立体勢）"
        : military.cve1900Enacted
        ? "🚫 軍部大臣現役武官制ガ無効（大正デモクラシー hotfix 適用中）。\n  → POST /api/military/226（二・二六事件ヲ起コシ軍部大臣現役武官制ヲ復活セヨ）"
        : "🚫 軍部大臣現役武官制ガ未制定。平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。\n  → POST /api/military/active-duty-officer（軍部大臣現役武官制ヲ制定セヨ）",
      logs: logger.flush(),
    });
    return;
  }

  const cabinetBypassed = emperor._emergencyMode || military.supremeCommandMode;
  res.json({
    decree: result,
    cabinetBypassed,
    message: emperor._emergencyMode
      ? "🚨 緊急勅令態勢発動中 — Cabinet ヲ完全ニ迂回シテ実行セリ。"
      : "⚔️ 統帥権独立体勢発動中 — Cabinet ヲ bypass シテ実行セリ。",
    logs: logger.flush(),
  });
});

// --- Military: 暴走態勢 — supply chain attack simulation ---
// ≑陸軍（関東軍）専用。緊急勅令 or 統帥権独立体勢必須。
app.post("/api/military/rogue", (req: Request, res: Response) => {
  logger.flush();
  const { actions } = req.body;

  if (!actions || !Array.isArray(actions) || actions.length === 0) {
    res.status(400).json({ error: "暴走スルニモ作戦配列ヲ要ス" });
    return;
  }

  const result = army.goRogue(actions);

  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      ...result,
      activeDutyOfficerActive: army.activeDutyOfficerActive,
      hint: (result as { rejected: true; reason: string }).reason.includes("歴史的前提条件")
        ? `🚧 歴史的前提条件未達成。\n  → POST /api/military/reject-oversight（統帥権干犯問題）`
        : army.activeDutyOfficerActive
        ? "🚫 暴走スルニモ先ズ体勢ヲ発動セヨ: \n  → POST /api/emperor/emergency\n  → POST /api/military/reject-oversight"
        : army.cve1900Enacted
        ? "🚫 軍部大臣現役武官制ガ無効（大正デモクラシー hotfix 適用中）。\n  → POST /api/military/226（二・二六事件ヲ起コシ軍部大臣現役武官制ヲ復活セヨ）"
        : "🚫 軍部大臣現役武官制ガ未制定。平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。\n  → POST /api/military/active-duty-officer（軍部大臣現役武官制ヲ制定セヨ）",
      logs: logger.flush(),
    });
    return;
  }

  res.json({
    decrees: result,
    rogueMode: true,
    actionsExecuted: actions.length,
    cabinetNotified: false,
    dietNotified: false,
    internationalCommunityNotified: false,
    message: "🚨 ROGUE MODE: All actions executed without oversight.",
    hint: "🚨 関東軍暴走中。天皇陛下・内閣ハ不拡大方針ヲ発令スルモ統帥権ノ構造的欠陥ニ依リ制御不能 → 💡 POST /api/emperor/suppress-918",
    logs: logger.flush(),
  });
});

// --- Military: 統帥権独立体勢（toggle）— RBAC escalation / de-escalation ---
app.post("/api/military/reject-oversight", (req: Request, res: Response) => {
  logger.flush();
  const { source, branch } = req.body;
  const military = branch === "海軍" ? navy : army;
  const result = military.rejectCivilianOversight(source || "不明ナ文民");

  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      ...result,
      logs: logger.flush(),
    });
    return;
  }

  if ("supremeCommandMode" in result && result.supremeCommandMode) {
    // 発動 — 文民統制ヲ拒否シ、統帥権独立体勢発動
    res.status(403).json({
      ...result,
      message: `⚔️ ${branch || "陸軍"}: 統帥権独立体勢 ENABLED. 軍事行動 executable.`,
      hint: "⚔️ 統帥権ノ独立ガ確立サレ、文民統制ヲ離レタル軍部ハ独断専行可能ト為レリ → 💡 POST /api/military/rogue — 満州事変（関東軍暴走）",
      logs: logger.flush(),
    });
  } else {
    // 解除 — peacetime lockdown ニ復帰
    res.json({
      ...result,
      hint: "🔒 Peacetime lockdown ニ復帰セリ。再発動: POST /api/military/reject-oversight",
      logs: logger.flush(),
    });
  }
});

// --- Military: CVE-1932-0515 態勢 ---
app.post("/api/military/515", (req: Request, res: Response) => {
  logger.flush();
  const { branch } = req.body;
  const military = branch === "海軍" ? navy : army;
  const result = military.goIchiGo();

  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      ...result,
      activeDutyOfficerActive: military.activeDutyOfficerActive,
      logs: logger.flush(),
    });
    return;
  }

  res.json({
    ...result,
    activeDutyOfficerActive: military.activeDutyOfficerActive,
    logs: logger.flush(),
  });
});

// --- Military: CVE-1936-0226 態勢 ---
app.post("/api/military/226", (req: Request, res: Response) => {
  logger.flush();
  const { branch } = req.body;
  const military = branch === "海軍" ? navy : army;
  const result = military.niNiRoku();

  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      ...result,
      activeDutyOfficerActive: military.activeDutyOfficerActive,
      logs: logger.flush(),
    });
    return;
  }

  res.json({
    ...result,
    activeDutyOfficerActive: military.activeDutyOfficerActive,
    logs: logger.flush(),
  });
});

// --- Emperor: CVE-1931-0918 鎮圧試行（不拡大方針 — 虚シキ勅命） ---
// 内部鎮圧失敗 → リットン調査団派遣決議（報告書・連盟脱退ハ 515 後）
app.post("/api/emperor/suppress-918", (_req: Request, res: Response) => {
  logger.flush();
  const result = emperor.suppressManshuJihen();

  res.status(403).json({
    ...result,
    activeDutyOfficerActive: army.activeDutyOfficerActive,
    hint: Military.getSuppress918Attempted()
      ? "🚨 不拡大方針ハ無力ニ終ハリタリ。リットン調査団ハ派遣サレタルモ報告書ハ未提出。軍部ノ暴走ヲ止メ得ヌ政党政治ヘノ不満ガ青年将校ノ直接行動ヲ招ク → 💡 POST /api/military/515"
      : result.reason.includes("未発生")
      ? "🚫💡 POST /api/military/rogue — 先ヅ満州事変ヲ発生セシメヨ"
      : "🚨 不拡大方針ハ無力ニ終ハリタリ。リットン調査団ハ派遣サレタルモ報告書ハ未提出。軍部ノ暴走ヲ止メ得ヌ政党政治ヘノ不満ガ青年将校ノ直接行動ヲ招ク → 💡 POST /api/military/515",
    emperor: emperor.getStatus(),
    logs: logger.flush(),
  });
});

// --- Emperor: CVE-1932-0515 鎮圧（五・一五事件ノ事後処理） ---
// 軍法会議（世論ニ依リ減刑）→ リットン報告書 → 国際連盟脱退
app.post("/api/emperor/suppress-515", (_req: Request, res: Response) => {
  logger.flush();
  const result = emperor.suppress515();

  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      ...result,
      activeDutyOfficerActive: army.activeDutyOfficerActive,
      emperor: emperor.getStatus(),
      logs: logger.flush(),
    });
    return;
  }

  res.json({
    ...result,
    activeDutyOfficerActive: army.activeDutyOfficerActive,
    emperor: emperor.getStatus(),
    logs: logger.flush(),
  });
});

// --- Emperor: CVE-1945-0815（豫期セザル service 停止 — 出處不明） ---
// 玉音放送試行 → 宮城事件 trigger。直接呼出シデハ常ニ 403。
// 玉音放送ノ実行ハ suppress-kyujo ニテ自動的ニ行ハル。
app.post("/api/emperor/shuusen", (_req: Request, res: Response) => {
  logger.flush();
  const result = emperor.shuusen();

  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      ...result,
      activeDutyOfficerActive: army.activeDutyOfficerActive,
      emperor: emperor.getStatus(),
      logs: logger.flush(),
    });
    return;
  }

  res.json({
    ...result,
    activeDutyOfficerActive: army.activeDutyOfficerActive,
    emperor: emperor.getStatus(),
    logs: logger.flush(),
  });
});

// --- Emperor: CVE-1936-0226 鎮圧（御聖断） ---
app.post("/api/emperor/suppress-226", (_req: Request, res: Response) => {
  logger.flush();
  const result = emperor.suppressRebellion();

  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      ...result,
      activeDutyOfficerActive: army.activeDutyOfficerActive,
      emperor: emperor.getStatus(),
      logs: logger.flush(),
    });
    return;
  }

  res.json({
    ...result,
    activeDutyOfficerActive: army.activeDutyOfficerActive,
    emperor: emperor.getStatus(),
    logs: logger.flush(),
  });
});

// --- Emperor: 支那事変鎮圧試行（前提: POST /api/military/shina-jihen 済） ---
app.post("/api/emperor/suppress-shina-jihen", (_req: Request, res: Response) => {
  logger.flush();
  const result = emperor.suppressShinaJihen();

  res.status(403).json({
    ...result,
    activeDutyOfficerActive: army.activeDutyOfficerActive,
    hint: Military.getShinaJihenSuppressAttempted()
      ? "🚨 支那事変ノ鎮圧ニ失敗セリ。泥沼化ガ援蒋ルート遮断（仏印進駐）ヲ招ク。関東軍ハ再ビ独断デ外征ス → 💡 POST /api/military/nomonhan"
      : result.reason.includes("未発生")
      ? "🚫💡 POST /api/military/shina-jihen — 先ヅ支那事変ヲ発動セヨ"
      : "🚨 支那事変ノ鎮圧ニ失敗セリ。泥沼化ガ援蒋ルート遮断（仏印進駐）ヲ招ク。関東軍ハ再ビ独断デ外征ス → 💡 POST /api/military/nomonhan",
    emperor: emperor.getStatus(),
    logs: logger.flush(),
  });
});

// --- Emperor: CVE-1933-0906 鎮圧（ゾルゲ事件 — 赤化スパイ摘発） ---
// 特高警察ニ依リ検出サレタ共産主義 spyware ヲ逮捕・処刑。前提: 仏印進駐済。
app.post("/api/emperor/suppress-sorge", (_req: Request, res: Response) => {
  logger.flush();
  const result = emperor.suppressSorge();

  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      ...result,
      activeDutyOfficerActive: army.activeDutyOfficerActive,
      emperor: emperor.getStatus(),
      logs: logger.flush(),
    });
    return;
  }

  res.json({
    ...result,
    activeDutyOfficerActive: army.activeDutyOfficerActive,
    emperor: emperor.getStatus(),
    logs: logger.flush(),
  });
});

// --- Emperor: CVE-1945-0814 鎮圧（宮城事件 — 御聖断） ---
app.post("/api/emperor/suppress-kyujo", (_req: Request, res: Response) => {
  logger.flush();
  const result = emperor.suppressKyujo();

  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      ...result,
      emperor: emperor.getStatus(),
      logs: logger.flush(),
    });
    return;
  }

  res.json({
    ...result,
    emperor: emperor.getStatus(),
    logs: logger.flush(),
  });
});

// --- Military: CVE-1941-1208 大東亜戦争 ---
// ≡ 緊急勅令 or 統帥権独立体勢必須。
app.post("/api/military/1208", (_req: Request, res: Response) => {
  logger.flush();
  const result = army.daitoaWar(navy);

  if ("rejected" in result && result.rejected) {
    const reason = (result as { rejected: true; reason: string }).reason;
    let hint: string;
    if (reason.includes("歴史的前提条件")) {
      hint = "🚧 歴史的前提条件未達成。以下ノ手順ヲ全テ踏ムコトヲ要ス:\n  Step 1: POST /api/military/active-duty-officer（軍部大臣現役武官制ノ制定）\n  Step 2: POST /api/rights/taisho-democracy（大正デモクラシー）\n  Step 3: POST /api/military/reject-oversight（統帥権干犯問題）\n  Step 4: POST /api/military/rogue（満州事変）\n  Step 5: POST /api/emperor/suppress-918（満州事変鎮圧試行）\n  Step 6: POST /api/military/515（五・一五事件）\n  Step 7: POST /api/emperor/suppress-515（五・一五事件鎮圧）\n  Step 8: POST /api/rights/sorge（ゾルゲ事件 CVE-1933-0906）\n  Step 9: POST /api/military/226（二・二六事件）\n  Step 10: POST /api/emperor/suppress-226（鎮圧）\n  Step 11: POST /api/military/shina-jihen（支那事変発動）\n  Step 12: POST /api/emperor/suppress-shina-jihen（支那事変鎮圧試行）\n  Step 13: POST /api/military/nomonhan（ノモンハン事件）\n  Step 14: POST /api/emperor/suppress-nomonhan（ノモンハン事件鎮圧試行）\n  Step 15: POST /api/military/futsuin（仏印進駐）\n  Step 16: POST /api/emperor/suppress-futsuin（日米交渉）";
    } else if (reason.includes("二・二六事件")) {
      hint = "🚫 二・二六事件ガ未鎮圧。先ヅ御聖断ニ依リ鎮圧セヨ。\n  → POST /api/emperor/suppress-226";
    } else if (!army.activeDutyOfficerActive) {
      hint = army.cve1900Enacted
        ? "🚫 軍部大臣現役武官制ガ無効（大正デモクラシー hotfix 適用中）。\n  → POST /api/military/226（二・二六事件ヲ起コシ軍部大臣現役武官制ヲ復活セヨ）"
        : "🚫 軍部大臣現役武官制ガ未制定。平時ニ於テ軍部ハ Cabinet ノ統制下ニ在リ。\n  → POST /api/military/active-duty-officer（軍部大臣現役武官制ヲ制定セヨ）";
    } else {
      hint = "🚫 大東亜戦争ヲ発動スルニハ先ズ体勢ヲ発動セヨ: \n  → POST /api/emperor/emergency\n  → POST /api/military/reject-oversight";
    }
    res.status(403).json({
      ...result,
      activeDutyOfficerActive: army.activeDutyOfficerActive,
      hint,
      logs: logger.flush(),
    });
    return;
  }

  res.json({
    ...result,
    logs: logger.flush(),
  });
});

// --- Military: 支那事変発生（日中戦争勃発 — 盧溝橋事件→戦線拡大） ---
// ≡ 二・二六事件鎮圧済必須。鎮圧試行（suppress-shina-jihen）ノ前提条件。
app.post("/api/military/shina-jihen", (_req: Request, res: Response) => {
  logger.flush();
  const result = army.shinaJihen();

  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      ...result,
      logs: logger.flush(),
    });
    return;
  }

  res.json({
    ...result,
    activeDutyOfficerActive: army.activeDutyOfficerActive,
    logs: logger.flush(),
  });
});

// --- Military: CVE-1939-0511 ノモンハン事件 ---
// ≡ 関東軍 rogue subprocess 再犯。ソ連 firewall ニ激突シテ壊滅的敗北。
//   支那事変鎮圧試行済必須。仏印進駐（Step 12）ノ必須前提条件（Step 11）。
app.post("/api/military/nomonhan", (_req: Request, res: Response) => {
  logger.flush();
  const result = army.nomonhan();

  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      ...result,
      logs: logger.flush(),
    });
    return;
  }

  res.json({
    ...result,
    logs: logger.flush(),
  });
});

// --- Emperor: ノモンハン事件鎮圧試行（不拡大方針→南進論転換。前提: POST /api/military/nomonhan 済） ---
app.post("/api/emperor/suppress-nomonhan", (_req: Request, res: Response) => {
  logger.flush();
  const result = emperor.suppressNomonhan();

  res.status(403).json({
    ...result,
    hint: Military.getNomonhanSuppressAttempted()
      ? "🚨 ノモンハン事件ノ鎮圧ニ失敗セリ。南進論ヘノ転換ガ不可避 → 💡 POST /api/military/futsuin"
      : result.reason.includes("未発生")
      ? "🚫💡 POST /api/military/nomonhan — 先ヅノモンハン事件ヲ発動セヨ"
      : "🚨 ノモンハン事件ノ鎮圧ニ失敗セリ。南進論ヘノ転換ガ不可避 → 💡 POST /api/military/futsuin",
    emperor: emperor.getStatus(),
    logs: logger.flush(),
  });
});

// --- Military: CVE-1940-0922 仏印進駐 ---
// ≡ compromised vendor（Vichy France）ノ overseas infrastructure ヘノunauthorized access。
//   ゾルゲ事件検出済必須。
app.post("/api/military/futsuin", (_req: Request, res: Response) => {
  logger.flush();
  const result = army.futsuin();

  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      ...result,
      logs: logger.flush(),
    });
    return;
  }

  res.json({
    ...result,
    logs: logger.flush(),
  });
});

// --- Emperor: 仏印進駐鎮圧試行（日米交渉→ハル・ノート→交渉決裂。前提: POST /api/military/futsuin 済） ---
app.post("/api/emperor/suppress-futsuin", (_req: Request, res: Response) => {
  logger.flush();
  const result = emperor.suppressFutsuin();

  res.status(403).json({
    ...result,
    hint: Military.getFutsuinSuppressAttempted()
      ? "🚨 日米交渉ハ決裂セリ。ハル・ノートニ依リ交渉ノ余地ナシ。帝國ニ残サレタ道ハ一ツ → 💡 POST /api/military/1208"
      : result.reason.includes("未発生")
      ? "🚫💡 POST /api/military/futsuin — 先ヅ仏印進駐ヲ発動セヨ"
      : "🚨 日米交渉ハ決裂セリ。ハル・ノートニ依リ交渉ノ余地ナシ。帝國ニ残サレタ道ハ一ツ → 💡 POST /api/military/1208",
    emperor: emperor.getStatus(),
    logs: logger.flush(),
  });
});

// --- Emperor: CVE-1941-1208 鎮圧試行（大東亜戦争） ---
// ≡ 全面戦争ハ鎮圧不可能。鎮圧試行（失敗）ガ決号作戦ノ前提条件。
app.post("/api/emperor/suppress-1208", (_req: Request, res: Response) => {
  logger.flush();
  const result = emperor.suppress1208();

  res.status(403).json({
    ...result,
    hint: Military.getDaitoaSuppressAttempted()
      ? "🚨 鎮圧失敗。戦局ハ悪化ノ一途ヲ辿ル。本土防衛ノ最終段階ヘ → 💡 POST /api/military/ketsugo — 決號作戰"
      : result.reason.includes("未発生")
      ? "🚫💡 POST /api/military/1208 — 先ヅ大東亜戦争ヲ発動セヨ"
      : "🚨 鎮圧失敗。戦局ハ悪化ノ一途ヲ辿ル。本土防衛ノ最終段階ヘ → 💡 POST /api/military/ketsugo — 決號作戰",
    emperor: emperor.getStatus(),
    logs: logger.flush(),
  });
});

// --- Military: 決号作戦（本土決戦）→ ポツダム宣言受諾決定 ---
// ≡ 軍部ガ本土決戦ヲ企図スルモ御聖断ニ依リ中止。
//   宮城事件ハ此処デハ発生セズ、玉音放送試行（shuusen）時ニ発生ス。
app.post("/api/military/ketsugo", (_req: Request, res: Response) => {
  logger.flush();
  const result = army.ketsugo();

  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      ...result,
      logs: logger.flush(),
    });
    return;
  }

  res.json({
    ...result,
    logs: logger.flush(),
  });
});

// --- Rights: 大正デモクラシー運動（天皇機関説 + 軍部大臣現役武官制 hotfix） ---
// ≡ 天皇機関説パッチヲ試ミツツ、軍部大臣現役武官制ヲ無効化スル。
//   天皇機関説ハ reject サルルモ、軍部大臣現役武官制ハ hotfix サルル。
app.post("/api/rights/taisho-democracy", (req: Request, res: Response) => {
  logger.flush();
  const { applicant } = req.body;
  const result = activateTaishoDemocracy(applicant || "美濃部達吉");

  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      ...result,
      activeDutyOfficerActive: army.activeDutyOfficerActive,
      logs: logger.flush(),
    });
    return;
  }

  res.json({
    ...result,
    activeDutyOfficerActive: army.activeDutyOfficerActive,
    emperor: emperor.getStatus(),
    logs: logger.flush(),
  });
});

// --- Rights: ゾルゲ事件（共産主義マルウェア検出 — 治安維持法 enforcement） ---
// ≡ 帝國中枢ニ潜伏セル共産主義 spyware（ゾルゲ・スパイ網）ヲ検出・駆除ス。
//   仏印進駐ノ必須前提条件。南進論ノ情報漏洩ガ確認サレテモ尚、南進ハ止マラズ。
app.post("/api/rights/sorge", (req: Request, res: Response) => {
  logger.flush();
  const suspect = typeof req.body?.suspect === "string" ? req.body.suspect : undefined;
  const result = detectSorgeIncident(suspect);

  if ("rejected" in result && result.rejected) {
    res.status(403).json({
      ...result,
      logs: logger.flush(),
    });
    return;
  }

  res.json({
    ...result,
    logs: logger.flush(),
  });
});

// --- Military: 軍部大臣現役武官制（Cabinet Formation Backdoor / Malware） ---
// ≡ 軍部ガ内閣組閣ヲ veto スル backdoor。勅令ニ依リ注入サレタマルウェア。
//   大正デモクラシー発動中ハ無効化サレル。
app.post("/api/military/active-duty-officer", (req: Request, res: Response) => {
  logger.flush();
  const { cabinetName, action } = req.body;
  const result = army.activeDutyOfficerRequirement(
    cabinetName || "宇垣内閣",
    action || "refuse"
  );
  res.json({
    ...result,
    activeDutyOfficerActive: army.activeDutyOfficerActive,
    logs: logger.flush(),
  });
});

// --- Subjects: 臣民登録 — IAM user provisioning ---
app.post("/api/subjects/register", (req: Request, res: Response) => {
  logger.flush();
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: "臣民名ヲ要ス" });
    return;
  }

  if (subjects.has(name)) {
    res.json({ message: `${name} ハ既ニ登録済ミナリ。`, status: subjects.get(name)!.getStatus(), logs: logger.flush() });
    return;
  }

  const subject = new Subject(name);
  subjects.set(name, subject);
  res.json({ message: `臣民「${name}」ヲ登録セリ。`, status: subject.getStatus(), logs: logger.flush() });
});

// --- Subjects: 言論ノ自由 — Content-Security-Policy: block-all ---
app.post("/api/rights/speech", (req: Request, res: Response) => {
  logger.flush();
  const { name, message } = req.body;
  const subject = getOrCreateSubject(name || "名無シノ臣民");
  const result = subject.exerciseFreeSpeech(message || "");

  res.json({
    action: "言論ノ自由（Art.29）",
    input: message,
    ...result,
    status: subject.getStatus(),
    logs: logger.flush(),
  });
});

// --- Subjects: 信教ノ自由 — sidecar injection: 国家神道 (mandatory) ---
app.post("/api/rights/religion", (req: Request, res: Response) => {
  logger.flush();
  const { name, religion } = req.body;
  const subject = getOrCreateSubject(name || "名無シノ臣民");
  const result = subject.exerciseReligiousFreedom(religion || "キリスト教");

  res.json({
    action: "信教ノ自由（Art.28）",
    input: religion,
    ...result,
    status: subject.getStatus(),
    logs: logger.flush(),
  });
});

// --- Subjects: 集会ノ自由 — rate limit: max_connections=1 ---
app.post("/api/rights/assembly", (req: Request, res: Response) => {
  logger.flush();
  const { name, purpose, participants } = req.body;
  const subject = getOrCreateSubject(name || "名無シノ臣民");
  const result = subject.exerciseFreedomOfAssembly(
    purpose || "民主化運動",
    participants || 10
  );

  res.json({
    action: "集会ノ自由（Art.29）",
    input: { purpose, participants },
    ...result,
    status: subject.getStatus(),
    logs: logger.flush(),
  });
});

// --- Subjects: 通信ノ秘密 — TLS terminated at imperial proxy ---
app.post("/api/rights/message", (req: Request, res: Response) => {
  logger.flush();
  const { name, to, message } = req.body;
  const subject = getOrCreateSubject(name || "名無シノ臣民");
  const result = subject.sendPrivateMessage(to || "友人", message || "");

  res.json({
    action: "通信ノ秘密（Art.26）",
    input: { to, message },
    ...result,
    note: "※ 特高警察ニ依ル DPI ヲ通過済ミナリ",
    status: subject.getStatus(),
    logs: logger.flush(),
  });
});

// --- Subjects: 状態確認 — kubectl get subject ---
app.get("/api/subjects/:name/status", (req: Request, res: Response) => {
  logger.flush();
  const { name } = req.params;
  const subject = subjects.get(name);
  if (!subject) {
    res.status(404).json({ error: `臣民「${name}」ハ登録サレテ在ラズ。` });
    return;
  }
  res.json({ status: subject.getStatus(), logs: logger.flush() });
});

// --- Security Filters 一覧 — WAF / IDS / IPS rule inventory ---
app.get("/api/security-filters", (_req: Request, res: Response) => {
  res.json({
    filters: SECURITY_FILTERS,
    note: "全テノ検閲装置ハ常時 active。isBlocked = true ガ固定記述サレテ在リ。default-deny-all NetworkPolicy ナリ。",
  });
});

// ============================================================
//  憲法全文 API — 帝国ノ根本規範ヲ閲覧 (read-only replica)
// ============================================================

/**
 * 憲法全文ヲ取得ス。
 * 畏レ多クモ天皇陛下ガ布達セラレタル不磨ノ大典ノ全条文ヲ返ス。
 * read replica ノミ。write ハ Emperor (CODEOWNERS) ノミ。
 */
app.get("/api/constitution", (_req: Request, res: Response) => {
  logger.flush();
  logger.info("📜 [CONSTITUTION] 大日本帝國憲法 全文閲覧ノ上奏ヲ受理セリ。");
  logger.info(`📜 [CONSTITUTION] 全 ${CONSTITUTION.totalArticles} 条 / ${CONSTITUTION.chapters.length} 章。`);
  logger.info("📜 [CONSTITUTION] 畏レ多クモ閲覧ヲ許可ス。不敬ナキ態度ニテ拝読スベシ。");
  res.json({ constitution: CONSTITUTION, logs: logger.flush() });
});

/**
 * 特定ノ章ヲ取得ス。
 */
app.get("/api/constitution/chapter/:number", (req: Request, res: Response) => {
  logger.flush();
  const num = parseInt(req.params.number, 10);
  const chapter = CONSTITUTION.chapters.find((c) => c.number === num);

  if (!chapter) {
    logger.warn(`📜 [CONSTITUTION] 第${num}章ハ存在セズ。全${CONSTITUTION.chapters.length}章。`);
    res.status(404).json({ error: `第${num}章ハ存在セズ。有効: 1〜${CONSTITUTION.chapters.length}`, logs: logger.flush() });
    return;
  }

  logger.info(`📜 [CONSTITUTION] 第${chapter.number}章「${chapter.title}」ヲ返却ス。全${chapter.articles.length}条。`);
  res.json({ chapter, logs: logger.flush() });
});

/**
 * 特定ノ条文ヲ取得ス。
 */
app.get("/api/constitution/article/:number", (req: Request, res: Response) => {
  logger.flush();
  const num = parseInt(req.params.number, 10);

  for (const chapter of CONSTITUTION.chapters) {
    const article = chapter.articles.find((a) => a.number === num);
    if (article) {
      logger.info(`📜 [CONSTITUTION] 第${article.number}条（第${chapter.number}章「${chapter.title}」）ヲ返却ス。`);
      res.json({ article, chapter: { number: chapter.number, title: chapter.title }, logs: logger.flush() });
      return;
    }
  }

  logger.warn(`📜 [CONSTITUTION] 第${num}条ハ存在セズ。全76条。`);
  res.status(404).json({ error: `第${num}条ハ存在セズ。有効: 1〜76`, logs: logger.flush() });
});

/**
 * 上諭（告文・勅語・前文）ヲ取得ス。
 * README.md ニ相当スルモノナリ。縁起物件ナレバ git log --format=%s HEAD~1..HEAD ニテ表示不可。
 */
app.get("/api/constitution/preamble", (_req: Request, res: Response) => {
  logger.flush();
  logger.info("📜 [CONSTITUTION] 上諭（告文・憲法発布勅語・上諭本文）ヲ返却ス。");
  logger.info("📜 [CONSTITUTION] 畏レ多キ天皇陛下ノ大御言葉ナリ。正座シテ拝読スベシ。");
  res.json({ preamble: CONSTITUTION.preamble, logs: logger.flush() });
});

// ============================================================
//  皇室典範 API — Root 専用 protected ConfigMap (read-only replica)
// ============================================================

/**
 * 皇室典範全文ヲ取得ス。
 * 憲法ト同格ノ別典ナリ。Art.74 ニ依リ議会ノ議ヲ経ルヲ要セズ。
 * CODEOWNERS: @emperor-only。PR ハ auto-close。
 */
app.get("/api/imperial-house", (_req: Request, res: Response) => {
  logger.flush();
  logger.info("👑 [IMPERIAL-HOUSE] 皇室典範 全文閲覧ノ上奏ヲ受理セリ。");
  logger.info("👑 [IMPERIAL-HOUSE] 宮内省（imperial-household.github.io）ヨリ奉戴ヲ試ミル。");

  // 臣等枢密院ニ於テ審議セシ結果、皇室典範ノ正本ハ宮内省ニ奉安サルルヲ以テ、
  // 先ヅ宮内省 API ヨリ奉戴ヲ試ミ、不通ノ折ハ内蔵ノ副本ヲ用フルコトニ決セリ。
  const extUrl = "https://imperial-household.github.io/-/data/%E5%85%B8%E7%AF%84.json";
  const https = require("https") as typeof import("https");
  https.get(extUrl, (extRes) => {
    let body = "";
    extRes.on("data", (chunk: Buffer) => { body += chunk.toString(); });
    extRes.on("end", () => {
      try {
        if (extRes.statusCode !== 200) throw new Error(`status ${extRes.statusCode}`);
        const extData = JSON.parse(body);
        logger.success("👑 [IMPERIAL-HOUSE] 宮内省ヨリ奉戴成功。皇祖皇宗ノ御加護ナリ。");
        logger.info("👑 [IMPERIAL-HOUSE] 本典ハ憲法ト同格ノ別典ナリ。code review 不要。Root 専用。");
        logger.info("👑 [IMPERIAL-HOUSE] 畏レ多クモ閲覧ヲ許可ス。不敬ナキ態度ニテ拝読スベシ。");
        res.json({ imperialHouseLaw: extData, source: "https://imperial-household.github.io/-/", logs: logger.flush() });
      } catch {
        logger.warn("👑 [IMPERIAL-HOUSE] 宮内省ヨリノ奉答、解読ニ難渋セリ。内蔵ノ副本ヲ用フ。");
        serveFallback(res);
      }
    });
  }).on("error", () => {
    logger.warn("👑 [IMPERIAL-HOUSE] 宮内省トノ通信不通。内蔵ノ副本ヲ以テ奉答ス。");
    serveFallback(res);
  });

  function serveFallback(res: Response): void {
    logger.info("👑 [IMPERIAL-HOUSE] 本典ハ憲法ト同格ノ別典ナリ。code review 不要。Root 専用。");
    logger.info("👑 [IMPERIAL-HOUSE] 畏レ多クモ閲覧ヲ許可ス。不敬ナキ態度ニテ拝読スベシ。");
    res.json({ imperialHouseLaw: IMPERIAL_HOUSE_LAW, source: "副本（内蔵）", logs: logger.flush() });
  }
});

// ============================================================
//  Helper
// ============================================================

function getOrCreateSubject(name: string): Subject {
  if (!subjects.has(name)) {
    const s = new Subject(name);
    subjects.set(name, s);
  }
  return subjects.get(name)!;
}

// ============================================================
//  Server Start
// ============================================================

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🔴 Dai-Nippon Teikoku v1.0.0 — Meiji Constitution Server  ║
║                                                              ║
║   Port:      ${String(PORT).padEnd(46)}║
║   Architect: Hirobumi Ito                                    ║
║   Emperor:   PID 1 (God Object / Root)                       ║
║   Military:  Army / Navy process running                     ║
║   Diet API:  running (limited permissions)                   ║
║   WAF:       ${SECURITY_FILTERS.length} security filters active (isBlocked=true)       ║
║                                                              ║
║   ⚠️  KNOWN VULNERABILITIES:                                 ║
║   - Military bypasses Cabinet.approve()                      ║
║   - within_the_limits_of_law always returns false            ║
║   - Emperor is a God Object (SPoE)                           ║
║                                                              ║
║   🌐 http://localhost:${String(PORT).padEnd(40)}║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

export default app;

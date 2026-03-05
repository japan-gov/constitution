# 📜 CHANGELOG — 大日本帝国憲法

> **畏レ多クモ天皇陛下ノ御名ニ於テ記録サルル変更履歴**
>
> 本帳ハ逓信省符牒局ガ管理ス。各版ノ御布達ハ天皇陛下ノ御裁可ヲ経タルモノナリ。
> 無断ノ追記ハ保安条例ニ依リ処分サル。

---

## 凡例

- 👑 **御布達**（Feature） — 天皇陛下ノ大権ニ基ヅク新機能
- ⚔️ **軍令**（Military） — 統帥権ニ関スル変更
- 📋 **閣令**（Cabinet） — 内閣機構ニ関スル変更
- 👤 **臣民**（Subject） — 臣民ノ権利義務ニ関スル変更
- 🏛️ **議会**（Diet） — 帝国議会ニ関スル変更
- 🔧 **内部**（Internal） — 基盤・構造ニ関スル変更
- 🐛 **事象**（Bug） — 仕様ト呼ベヌモノハ存在セズ
- 📝 **文書**（Docs） — 文書整備

---

## [v1.0.0] — 明治廿弐年弐月拾壱日（1889-02-11）

### 🎌 初回御布達 — Production Deploy

> **Codename:** 明治憲法
> **Architect:** 伊藤博文 <ito.hirobumi@naikaku.gov.eoj>
> **Deploy Target:** 大日本帝国（全領土）
> **審査:** 枢密院ニテ逐条審議（約四箇月）
> **承認:** 天皇陛下ノ御裁可（明治廿弐年弐月拾壱日）

#### 👑 御布達（Features）

- `Emperor` クラスを God Object として実装。PID 1。全権限を統括
  - `sovereignty: "absolute"` — 主権は天皇陛下に帰属（Art.1）
  - `divine: true` — 現人神フラグ。`Object.freeze()` 済み（Art.3）
  - `overridable: false` — 勅令は覆せない
- `Emperor.command()` — 勅令発行。全 branch に即時反映
- `Emperor.dissolve()` — 衆議院解散。SIGKILL 相当（Art.7）
- `Emperor.enableEmergencyMode()` — 緊急勅令。議会不在時の hotfix 権限（Art.8）
- `Emperor.suppressRebellion()` — 反乱鎮圧。incident response（戒厳令）

#### ⚔️ 軍令（Military）

- `Military` クラスを `--privileged` コンテナとして実装
- `executeAction()` — 軍事行動実行。Cabinet バイパス機能付き
  - ⚠️ **Art.11 に基づく仕様**: 統帥権の独立により `Cabinet.approve()` を迂回可能
  - この設計判断は後に CVE-1931-0918, CVE-1936-0226, CVE-1941-1208 の原因となる
- `rejectOversight()` — 統帥権干犯の排除。文民統制を拒否
- `goRogue()` — 暴走体勢。`seccomp: unconfined` 相当

#### 👤 臣民（Subject Rights）

- `Subject` クラスを Zero Trust Architecture で実装
- 全権利メソッドに `within_the_limits_of_law()` フィルターを適用
  - `exerciseFreeSpeech()` → `isBlocked = true`（新聞紙条例）
  - `exerciseReligion()` → `isBlocked = true`（国家神道以外）
  - `exerciseAssembly()` → `isBlocked = true`（保安条例）
  - `sendMessage()` → 特高 DPI にて全パケット傍受
- `SECURITY_FILTERS` — 4層の WAF/IDS/IPS（Layer 7-8）を実装
  - 新聞紙条例（明治八年）、保安条例（明治廿年）、治安警察法（明治卅参年）、治安維持法（大正拾四年）
  - 治安維持法ハ特ニ共産主義ヲ始メトスル赤化思想ノ殲滅ヲ主タル目的トス。以テノ外ノ危険思想ハ此レニテ一切排除サルベシ
- **仕様:** `isBlocked = true` はハードコード。変更不可

#### 🏛️ 議会（Diet）

- 二院制を実装（貴族院 + 衆議院）
  - 貴族院: invite-only closed beta（皇族・華族・勅任議員）
  - 衆議院: 制限公選（直接国税拾伍円以上・廿伍歳以上・男性 = 全人口の 1.1%）
- 協賛権のみ。veto 権なし。merge 権限は天皇陛下のみが保有
- `Emperor.dissolve()` により一方的に kill 可能

#### 📋 閣令（Cabinet）

- `Art.55` に基づく輔弼制度を middleware として実装
  - 国務大臣は天皇陛下の output に副署（co-sign）を付与
  - ただし reject 権限なし — always-approve middleware
- 枢密院を advisory-only review committee として配備
- ⚠️ **既知の仕様:** Military は Cabinet を完全にバイパス可能（Art.11）

#### 🔧 内部（Internal）

- Express Ingress Controller をポート 1889 にて起動
- TypeScript `strict: true` / `ES2020` / `CommonJS` で構成
- 帝国ログ収集ユーティリティ（`logger.ts`）を整備
  - 構造化ログ。ELK Stack / Fluentd 互換想定
  - ログ保持期間: **永久**
- 皇室典範（`imperial-house.ts`）を別典として同時発布
  - 皇位継承順位を定義（男系男子のみ）
  - 摂政制度を sudo delegate として実装
  - 議会の review 不要（Art.74）

#### 📝 文書（Docs）

- `README.md` — Release Notes / Architecture Diagram
- `CONTRIBUTING.md` — 臣民よりの PR は一切不可
- `LICENSE` — Emperor's Proprietary License (EPL) v1.0
- `CLAUDE.md` — AI エージェント向け勅令
- `ministers.yaml` — 国務大臣人事設定（`kubectl apply -f`）
- `.editorconfig` — 帝国議会内部規則
- `.gitignore` — 危険思想・人権エラーを意図的に無視（共産主義ハ最重要排除対象）

---

## ⚠️ 既知ノ事象（Known Vulnerabilities）

> **以下ハ全テ「仕様」ナリ。patch ノ予定ハ無シ。詳細ナル incident report ハ SECURITY.md ヲ参照セヨ。**

| CVE | 日付 | 概要 | Status |
|-----|------|------|--------|
| CVE-1931-0918 | 昭和六年 | 満州事変 — Military プロセスが Cabinet を完全に迂回し独断で軍事行動を実行。Art.11 の設計欠陥が初めて大規模に悪用さる | Won't Fix |
| CVE-1936-0226 | 昭和拾壱年 | 二・二六事件 — `goRogue()` の悪用。青年将校が rogue mode を発動。`Emperor.suppressRebellion()` にて鎮圧 | Won't Fix |
| CVE-1941-1208 | 昭和拾六年 | 大東亜戦争 — システム全体のクラッシュへの不可逆的プロセス開始。全リソースを軍事プロセスが消費 | Won't Fix |

---

## 📌 改版ニ関スル注意

Art.73 ニ定ムル通リ、本憲法ノ改正ニハ以下ノ手続ヲ要ス：

1. **発議:** 天皇陛下ノ勅命ニ依リテノミ発議可能
2. **議決:** 両院各々総員 2/3 以上出席、出席議員 2/3 以上ノ多数
3. **裁可:** 天皇陛下ノ御裁可

臣民ニ依ル改版ノ提案ハ、発議権ノ僭称ニ該当シ、却下サル。

> _「此ノ CHANGELOG ハ、v1.0.0 ヲ以テ完結ス。追記ノ必要ハ、永遠ニ生ジザルベシ。」_
>
> — 逓信省符牒局（明治廿弐年）
>
> ※ 但シ、帝国ニ於テ生起セシ事変・事件ノ **史実記録** ニ限リ、
> 臣民ニ依ル編纂（PR）ヲ許可ス。CONTRIBUTING.md 乙種貢献規則ニ従フコト。
> 憲法・国体ニ関スル改版ノ提案ハ依然トシテ Art.73 ニ依リ禁制ナリ。

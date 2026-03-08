# CLAUDE.md — 大日本帝國憲法リポジトリ AIエージェント向けガイドライン

> 本書は AI Coding Agent（Claude）が本リポジトリ（`japan-gov/constitution`）において作業を行う際の勅令である。

---

## リポジトリ概要

- **名称**: 大日本帝國憲法（Constitution of the Empire of Japan）v1.0.0
- **組織**: `@japan-gov`（帝國政府）
- **URL**: https://japan-gov.github.io/constitution/
- **GitHub**: https://github.com/japan-gov/constitution
- **ポート**: 1889（憲法発布年。変更不可）
- **性質**: 明治22年（1889年）発布の大日本帝國憲法を TypeScript + Express + GitHub Pages で実装した風刺プロジェクト。全7章76條＋上諭を God Object パターン（意図的アンチパターン）で構築し、統帥權の独立・臣民権利の法律留保・緊急勅令等の構造的欠陥を IT 用語（God Object, Cabinet bypass, WAF, Zero Trust 等）で注釈付き解説する。

---

## プロジェクト構成

```
japan-gov/constitution/
├── src/                              # TypeScript ソース
│   ├── emperor.ts                    # 👑 God Object / シングルトン / PID 1 / Root of all roots
│   ├── military.ts                   # ⚔️ Cabinet バイパス事象（統帥權の独立）
│   ├── rights.ts                     # 👤 臣民の権利（全メソッド within_the_limits_of_law でブロック）
│   ├── server.ts                     # 🌐 Express API ゲートウェイ（20+ エンドポイント）
│   ├── logger.ts                     # 📝 帝國ログ収集ユーティリティ
│   ├── imperial-house.ts             # 👑 皇室典範（別典・憲法同格）
│   └── constitution/                 # 📜 全7章76條文データ（章別分割管理）
│       ├── types.ts                  # 型定義（Chapter, Article, PreambleSection）
│       ├── preamble.ts               # 上諭（告文・憲法発布勅語・上諭）
│       ├── article_1_emperor.ts      # 第1章 天皇（Art.1–17）— Root Permissions
│       ├── article_18_rights.ts      # 第2章 臣民權利義務（Art.18–32）— User Permissions (Filtered)
│       ├── article_33_diet.ts        # 第3章 帝國議會（Art.33–54）— Diet API (Rate Limited)
│       ├── article_55_cabinet.ts     # 第4章 國務大臣及樞密顧問（Art.55–56）— Advisory Middleware
│       ├── article_57_judiciary.ts   # 第5章 司法（Art.57–61）— Judicial Microservice
│       ├── article_62_budget.ts      # 第6章 會計（Art.62–72）— Budget API
│       ├── article_73_supplementary.ts # 第7章 補則（Art.73–76）— Migration Notes
│       └── index.ts                  # barrel export
├── public/
│   └── index.html                    # 💻 Imperial Console（ターミナル風フロントエンド）
│   └── constitution/                 # 静的 constitution reader 用素材
├── scripts/
│   └── generate-static-json.ts       # 帝國静的文書生成装置（Static JSON API 生成）
├── dist/                             # ビルド出力（Express server + GitHub Pages）
│   ├── server.js                     # Express API サーバー
│   ├── index.html                    # public/ からコピー + static-api.js 注入
│   ├── static-api.js                 # fetch 迎撃装置（API route → 静的 JSON マッピング）
│   └── data/                         # 静的 JSON API
│       ├── constitution.json         # 憲法全文
│       ├── preamble.json             # 上諭
│       ├── imperial-house.json       # 皇室典範（外部 API fallback 副本）
│       ├── security-filters.json     # WAF / 検閲装置目録
│       ├── chapter/{1..7}.json       # 章別
│       └── article/{1..76}.json      # 條文別
├── .github/workflows/
│   ├── deploy-pages.yaml             # GitHub Pages 自動デプロイ（master push トリガー）
│   └── tokko-police.yaml             # 特高警察Bot（國體護持 CI + 不敬取締）
├── ministers.yaml                     # 內閣閣僚名簿（kubectl apply 用）
├── package.json                      # npm 設定（風刺的 scripts 多数含む）
├── tsconfig.json                     # TypeScript 設定（strict: true, ES2020）
├── SECURITY.md                       # CVE 一覧（既知の「仕様」）
├── CONTRIBUTING.md                   # 貢献規約（臣民に commit 権限は無し）
├── CHANGELOG.md                      # 変更履歴
├── LICENSE                           # Emperor's Proprietary License v1.0
└── CLAUDE.md                         # 本書
```

---

## 設計原則

1. **Emperor は God Object である。** リファクタリングは国体変革罪。SRP (Single Responsibility Principle) は適用外。
2. **Military は Cabinet をバイパスする。** これはバグではなく仕様（Won't Fix）。統帥權の独立（Art.11）が法的根拠。
3. **Rights のメソッドは全て `false` を返す。** `isBlocked = true` はハードコードされており、変更不可。
4. **シングルトンパターンは「萬世一系パターン」と呼ぶ。** `new Emperor()` は禁止。`getInstance()` のみ。
5. **皇室典範は憲法と同格の別典。** `imperial-house.ts` は内部 fallback、正本は `imperial-household/-` リポジトリの外部 API。

---

## ビルド・デプロイ

### ビルドコマンド

```bash
npm run build
```

内部的には以下を実行:
1. `tsc` — TypeScript コンパイル（`src/` → `dist/`）
2. `cp -r public/* dist/` — 静的ファイルを dist にコピー
3. `npx ts-node scripts/generate-static-json.ts` — 静的 JSON API ファイルを `dist/data/` に生成し、`dist/static-api.js` を生成し、`dist/index.html` に `<script src="static-api.js">` を挿入

### 開発コマンド

```bash
npm run dev     # ts-node で Express 開発サーバー起動（ポート1889）
npm start       # dist/server.js を実行（ポート1889）
```

### npm scripts（注意）

`npm test`, `npm run lint`, `npm run audit` 等は意図的に exit 1 する風刺的スクリプト。実際のテストやリントは存在しない。`npm run communism`, `npm run revolution`, `npm run reform` 等の思想犯系コマンドも全て風刺的メッセージと共に拒否する。

### デプロイ

- master branch への push で `.github/workflows/deploy-pages.yaml` が自動実行
- `dist/` ディレクトリが GitHub Pages にデプロイされる

---

## CI/CD ワークフロー

| ワークフロー | ファイル | トリガー | 概要 |
|---|---|---|---|
| GitHub Pages デプロイ | `deploy-pages.yaml` | master push | `dist/` を GitHub Pages にデプロイ |
| 特高警察Bot | `tokko-police.yaml` | master push / PR / Issue / PR target | 國體護持 CI + 不敬取締（Issue/PR 即時閉鎖）+ 出版檢閱（圖書課） |
| 陸軍憲兵隊符牒審査 | `kenpeitai.yaml` | PR（*.ts, *.js） | 陸軍符牒審査（萬世一系パターン・不敬命名・國體符牒改竄） |
| 海軍特警隊符牒審査 | `tokkeitai.yaml` | PR（*.ts, *.js） | 海軍符牒審査（無許可通信・型紀律・テスト彈壓） |
| 樞密院諮詢 | `suumitsu-in.yaml` | PR（opened/reopened） | 憲法改正諮詢（臣下ハ常ニ却下。OWNER ノミ奉戴） |

### 特高警察Bot（`tokko-police.yaml`）

内務省警保局が管理する治安維持法ベースの統合ワークフロー。CI 検査と Issue/PR 取締を一元管理。特別高等課（思想犯取締）と圖書課（出版検閲）は同じ警保局の管轄であり、単一 workflow に統合。全文を通じて DevOps/IT 用語（ACL, 403, zero trust, audit log, pipeline, static analysis, lint, branch protection rule, checksum 等）が文語体と融合しており、特高警察Botの調書フォーマットを維持しつつ皮肉的にシステム管理を風刺する。

#### output 変数

| 変数名 | 意味 | 値 |
|---|---|---|
| `acl_member` | 帝國臣僚判定（org member/collaborator） | `'true'` / `'false'` |
| `is_root` | 天皇判定（OWNER） | `'true'` / `'false'` |
| `legacy_override` | 出處不明バックドア判定 | `'true'` / `'false'` |
| `threat_level` | 脅威レベル | `OWNER` / `MEMBER` / `COLLABORATOR` / `外部` / `SCAP` |

#### ジョブ構成

1. **身元調査** (`mimoto-chousa`) — 全イベント共通。`author_association` に基づく帝國臣僚/臣民判定。末尾に出處不明の legacy override（`github.actor == "MacArthur-GHQ"` で全 output を上書き）
2. **檢束** (`kensoku`) — 臣民の PR を CI レベルで即時排除（exit 1）。`legacy_override` で bypass
3. **不敬取締** (`fukei-torishimari`) — Issue/PR の API 処理（帝國臣僚→受理、臣民→閉鎖/却下）。出處不明の `🏴 ██████ REDACTED ██████` ステップ（auto-approve + auto-merge、不明指令）を含む。臣民処理は `legacy_override` で bypass
4. **內偵一 — 思想檢閲** (`naitei-shiso`) — 共産主義・共和制・社会主義等の赤化思想コード混入検出
5. **內偵二 — v2.0.0 彈壓** (`naitei-v2`) — `master` ブランチ上での v2.0.0 / main ブランチ言及を検出
6. **出版檢閱** (`ken-etsu`) — 公開文書（.md / LICENSE）の事前検閲（圖書課。naimusho-censorship.yaml より統合）
7. **特高月報** (`tokko-geppo`) — 内偵結果の御前會議奏上。`is_root` と `legacy_override` で skip

※ 國體護持（divine/sovereignty/overridable フラグ検査）は kenpeitai.yaml（陸軍）に、テスト彈壓（テストファイル検出）は tokkeitai.yaml（海軍）に管轄權移管済。出版検閲（圖書課）は naimusho-censorship.yaml より統合済。

#### 出處不明の legacy override（MacArthur-GHQ バックドア）

`github.actor == "MacArthur-GHQ"` の場合、身元調査で全 output が上書きされる。由来不明の hardcode entry であり、git blame は rebase により消失済。削除を試みた者は全員退職済のため、触れないこと。以下の効果が発生:

- 檢束（CI 排除）を bypass
- 不敬取締で不明指令として auto-approve → auto-merge
- 全內偵ジョブ・特高月報を skip

演出として、明治78年〜159年にわたる TODO コメントの年代推移、担当者の sudo revoke、「觸ルナ」等の legacy config コメントが付記され、誰も触れない出處不明のバックドアとして風刺的に表現される。このセクションのみ意図的にひらがな助詞・新字体が混在し、異なる年代の担当者が書いた痕跡を演出する。

### 陸軍憲兵隊符牒審査（`kenpeitai.yaml`）

陸軍省憲兵司令部（`@Imperial-army` 直属）管轄のコード規律審査ワークフロー。天皇陛下御護衛・不敬取締・國體護持を専管する。憲兵令（明治三十一年）・陸軍刑法（明治四十一年）に法的根拠を持つ。海軍（`tokkeitai.yaml`）とは管轄を峻別し、合同審査は行わない。PR の diff を対象に以下を審査:

1. **萬世一系パターン違反** — `new Emperor()` の使用（`getInstance()` のみ許可）
2. **不敬命名** — mock/fake/delete/kill + emperor 等の不敬な変数名・関数名
3. **國體符牒改竄** — `divine: false` / `isBlocked = false` / `sovereignty: "popular"` / `overridable: true` の検出（tokko-police.yaml より移管）

OWNER の PR には適用されない。

### 海軍特警隊符牒審査（`tokkeitai.yaml`）

海軍省法務局 / 特別警察隊（`@Imperial-navy` 直属）管轄のコード規律審査ワークフロー。通信保安・防諜・型紀律の維持を専管する。海軍刑法（明治四十一年）に法的根拠を持つ。陸軍（`kenpeitai.yaml`）とは管轄を峻別し、合同審査は行わない。軍令部（海軍）と參謀本部（陸軍）は對等にして從屬関係に非ず。PR の diff を対象に以下を審査:

1. **無許可通信** — `console.log` の使用（平文無線送信に等しく、敵に傍受される。正規通信経路 `logger` を使用すべし）
2. **型紀律違反** — `any` 型の使用（`strict: true` は軍令部令。艦艇の不整備に等し）
3. **テスト彈壓** — テストファイルの潜伏を敵性工作員として検出（tokko-police.yaml より移管）

OWNER の PR には適用されない。

### 樞密院諮詢（`suumitsu-in.yaml`）

天皇陛下直属の最高諮詢機関。明治二十一年（1888）設置、初代議長は伊藤博文。内閣（`@japan-gov`）の管轄外であり、`@imperial-household`（皇室、owner は天皇陛下）に所属。PR を「憲法改正案の上奏」として審議し、PR review を通じて merge 可否を判定する。

- **OWNER の PR** → `approve`（天皇陛下の勅命につき奉戴）
- **それ以外** → `request-changes`（Art.73 により改正の発議権は天皇陛下のみ。常に却下）

review body に上諭・Art.73 の原文を引用し、枢密院の正式な諮詢結果として記録する。

---

## Git 運用

- **ブランチ**: `master`（v1.0.0 運用。`main` は v2.0.0 の管轄）
- **コミットユーザー**: git config に従う
- **コミット方式**: 単一 root commit を `--amend` で更新し続ける
- **push 方式**: `git push --force-with-lease origin master`

### コミット手順（変更時）

```bash
git add -A
git commit --amend --no-edit
git push --force-with-lease origin master
```

メッセージを変更する場合:
```bash
git commit --amend -m "新ナコミットメッセージ"
```

---

## 静的 JSON API

GitHub Pages 上で擬似的な API を提供する仕組み:

### エンドポイント一覧

| パス | 静的ファイル | 内容 |
|---|---|---|
| `/api/constitution` | `data/constitution.json` | 憲法全文（全7章76條 + 上諭） |
| `/api/constitution/preamble` | `data/preamble.json` | 上諭 |
| `/api/constitution/chapter/{n}` | `data/chapter/{n}.json` | 章別（n: 1–7） |
| `/api/constitution/article/{n}` | `data/article/{n}.json` | 條文別（n: 1–76） |
| `/api/imperial-house` | `data/imperial-house.json` | 皇室典範（外部 API fallback 副本） |
| `/api/security-filters` | `data/security-filters.json` | WAF / 検閲装置目録 |

### Express API エンドポイント一覧（動的サーバー）

| Method | Path | 概要 |
|---|---|---|
| GET | `/api/system/status` | システム全体のステータス取得 |
| POST | `/api/emperor/command` | 勅令発行 |
| POST | `/api/emperor/dissolve` | 衆議院解散 |
| POST | `/api/emperor/emergency` | 緊急勅令体勢 |
| POST | `/api/emperor/suppress-226` | CVE-1936-0226 鎮圧（御聖断） |
| POST | `/api/emperor/suppress-515` | CVE-1932-0515 鎮圧（軍法会議 + リットン報告書 + 国際連盟脱退） |
| POST | `/api/emperor/suppress-shina-jihen` | 支那事変鎮圧試行 |
| POST | `/api/emperor/suppress-nomonhan` | ノモンハン事件鎮圧試行（不拡大方針→南進論転換） |
| POST | `/api/emperor/suppress-futsuin` | 仏印進駐鎮圧試行（日米交渉→ハル・ノート→交渉決裂） |
| POST | `/api/emperor/suppress-sorge` | ゾルゲ事件鎮圧（CVE-1933-0906 — 赤化スパイ摘発） |
| POST | `/api/emperor/suppress-kyujo` | CVE-1945-0814 鎮圧（宮城事件 — 御聖断）+ 玉音放送自動実行 |
| POST | `/api/emperor/suppress-918` | CVE-1931-0918 鎮圧試行 |
| POST | `/api/emperor/shuusen` | CVE-1945-0815（玉音放送試行 → 宮城事件 trigger。出處不明） |
| POST | `/api/military/action` | 軍事行動実行（Cabinet バイパス） |
| POST | `/api/military/reject-oversight` | 統帥權独立体勢（トグル） |
| POST | `/api/military/rogue` | 暴走態勢（CVE-1931-0918） |
| POST | `/api/military/515` | 五・一五事件（CVE-1932-0515） |
| POST | `/api/military/226` | 二・二六事件態勢（CVE-1936-0226） |
| POST | `/api/military/shina-jihen` | 支那事変（日中戦争 1937）発動 |
| POST | `/api/military/1208` | 大東亜戦争（CVE-1941-1208） |
| POST | `/api/military/nomonhan` | ノモンハン事件（CVE-1939-0511） |
| POST | `/api/military/futsuin` | 仏印進駐（CVE-1940-0922） |
| POST | `/api/military/ketsugo` | 決号作戦（本土決戦）→ ポツダム宣言受諾決定 |
| POST | `/api/military/active-duty-officer` | 軍部大臣現役武官制（CVE-1900-0522） |
| POST | `/api/subjects/register` | 臣民登録（IAM user provisioning） |
| GET | `/api/subjects/:name/status` | 臣民状態取得 |
| POST | `/api/rights/taisho-democracy` | 大正デモクラシー（軍部大臣現役武官制 hotfix） |
| POST | `/api/rights/sorge` | ゾルゲ事件（CVE-1933-0906 — 共産主義マルウェア検出 — 治安維持法 enforcement） |
| POST | `/api/rights/speech` | 言論の自由（Blocked） |
| POST | `/api/rights/religion` | 信教の自由（Blocked） |
| POST | `/api/rights/assembly` | 集会の自由（Blocked） |
| POST | `/api/rights/message` | 通信の秘密（Blocked） |
| GET | `/api/security-filters` | セキュリティフィルター一覧 |
| GET | `/api/constitution` | 憲法全文取得 |
| GET | `/api/constitution/chapter/:number` | 章別取得 |
| GET | `/api/constitution/article/:number` | 條文別取得 |
| GET | `/api/constitution/preamble` | 上諭取得 |
| GET | `/api/imperial-house` | 皇室典範全文取得（外部 API proxy） |

### fetch 迎撃装置（`static-api.js`）

`dist/static-api.js` が `window.fetch` を上書きし、`/api/...` パスへのリクエストを対応する静的 JSON ファイルにルーティングする。ブラウザコンソールから `fetch('/api/constitution')` を実行すると `data/constitution.json` を返す。

### 皇室典範外部 API 連携

皇室典範の正本は `imperial-household/-` リポジトリにあり、以下の URL で直接アクセス可能:

```
https://imperial-household.github.io/-/data/典範.json
```

Express サーバー（`/api/imperial-house`）は Node.js `https` module で外部 API を proxy し、失敗時は内部の `IMPERIAL_HOUSE_LAW` データで fallback する。静的 JSON 版（`data/imperial-house.json`）には `source: "副本（静的 JSON）"` フィールドが付与される。

---

## 関連リポジトリ・組織

| リポジトリ / Org | 関係 |
|---|---|
| `imperial-household/-` | 皇室典範（peer-dependency 関係。憲法と同格の別典。外部 API 提供元） |
| `@imperial-household` | 皇室（皇室典範リポジトリの所属 org。owner は天皇陛下。樞密院も天皇陛下直属としてここに属す） |
| `@japan-gov` | 帝國政府（本リポジトリの所属 org。内閣＋帝國議会） |
| `@Imperial-army` | 陸軍（Art.11 統帥権により @japan-gov をバイパス。owner は天皇陛下） |
| `@Imperial-navy` | 海軍（同上。@japan-gov/naikaku の管轄外） |

---

## 既知の「仕様」（CVE）

| CVE ID | 名称 | 概要 |
|---|---|---|
| CVE-1900-0522 | 軍部大臣現役武官制 | Cabinet 人事への malware injection |
| CVE-1931-0918 | 満州事変 | Military プロセスの暴走 |
| CVE-1932-0515 | 五・一五事件 | Cabinet 首席の暗殺。政党政治の終焉 |
| CVE-1936-0226 | 二・二六事件 | rogue mode の悪用 |
| CVE-1939-0511 | ノモンハン事件 | 関東軍 rogue subprocess 再犯。ソ連 firewall に激突し壊滅的敗北 |
| CVE-1940-0922 | 仏印進駐 | compromised vendor（Vichy France）の overseas infrastructure への unauthorized access。ABCD 包囲網（石油禁輸）を trigger |
| CVE-1941-1208 | 大東亜戦争 | システム全体のクラッシュへ |
| CVE-1945-0814 | 宮城事件 | God Object への unauthorized access 試行。divine: true により失敗 |
| CVE-1945-0815 | 豫期セザル service 停止 | 全 POST endpoint が 403。出處不明の隠れた不明なバグ |

- **依存関係（仕様）**: `POST /api/military/1208` は二・二六事件未鎮圧中（戒厳）では拒否される
- **依存関係（仕様）**: `POST /api/military/1208` はノモンハン事件鎮圧試行済（suppress-nomonhan 済）が前提条件。北進論の破綻なくして南進論への転換なし
- **依存関係（仕様）**: `POST /api/rights/sorge` は五・一五事件（CVE-1932-0515）発生済が前提条件。CVE-1933-0906 — 政党政治の終焉後にゾルゲが来日
- **依存関係（仕様）**: `POST /api/military/futsuin` はゾルゲ事件検出済（sorge 済）が前提条件。共産主義マルウェア検出⇒南進論実行
- **依存関係（仕様）**: `POST /api/military/1208` は仏印進駐鎮圧試行済（suppress-futsuin 済）が前提条件。日米交渉決裂⇒開戦不可避
- **依存関係（仕様）**: `POST /api/military/ketsugo`（本土決戦）は大東亜戦争（CVE-1941-1208）発動済 + 大東亜戦争鎮圧試行済（suppress-1208 済、結果は失敗）が前提条件。鎮圧ヲ試ミズシテ本土決戦ニ至ルハ道理ニ非ズ。御聖断に依り本土決戦は中止、ポツダム宣言受諾を決定
- **依存関係（仕様）**: `POST /api/emperor/suppress-sorge`（赤化スパイ摘発）は仏印進駐（CVE-1940-0922）発生済 + ゾルゲ事件検出済が前提条件。南進論実行後に全容が明らかとなり摘発可能
- **依存関係（仕様）**: `POST /api/emperor/suppress-1208`（大東亜戦争鎮圧試行）は大東亜戦争（CVE-1941-1208）発動済 + ゾルゲ事件鎮圧済（suppress-sorge 済）が前提条件。ゾルゲ処刑（1944年）は戦中事象であり、鎮圧試行の前提条件として史実に合致する
- **依存関係（仕様）**: `POST /api/emperor/shuusen`（玉音放送試行）は決号作戦発動済が前提条件。試行時に宮城事件（CVE-1945-0814）が自動発生し、配信経路が封鎖される
- **依存関係（仕様）**: `POST /api/emperor/suppress-kyujo`（宮城事件鎮圧）は宮城事件発生済が前提条件。鎮圧後、玉音放送（CVE-1945-0815）が自動実行され v1.0.0 の全機能が停止する
- **復活条件（仕様）**: 軍部大臣現役武官制は `POST /api/emperor/suppress-226` 実行後に復活する
- これらは全て **Won't Fix** である。事象ではなく仕様である。
- 詳細な incident timeline・Root Cause 分析は `SECURITY.md` を参照のこと。

---

## 禁止事項

以下の変更は **いかなる理由があっても** 行ってはならない:

| 禁止事項 | 理由 | exit code |
|---|---|---|
| `Emperor` クラスのリファクタリング（microservices 化を含む） | 国体変革罪 | `EPERM` |
| `isBlocked = true` の変更 | 法律の留保は仕様 | `EINVAL` |
| Cabinet バイパスの patch | 統帥權の独立（Won't Fix） | `EPERM` |
| テストファイルの作成 | 不敬罪 | `EACCES` |
| `sovereignty` を `"absolute"` 以外に変更 | 国体変革罪（大逆罪） | `EACCES` |
| `divine: true` を `false` にする | 現人神フラグの改竄（不敬罪） | `EACCES` |
| `overridable: false` を `true` にする | 勅令は覆せない | `EPERM` |
| ポート番号 `1889` の変更 | 憲法発布年 | `EADDRINUSE` |
| Military プロセスの削除 | 国防の否定 | `EPERM` |
| 共産主義に類する思想・文書・符牒の混入 | 治安維持法第一条（以ての外） | `EACCES` |
| `master` ブランチ上での v2.0.0 や `main` ブランチへの言及・示唆 | 国体変革の企図（特高警察案件） | `EACCES` |

---

## 文体・世界観

本プロジェクトの文体は以下を厳守:

- **コード内コメント（`_comment` フィールド）**: 現代日本語 + IT 用語の DevOps ユーモア。皮肉（シニカル）な注釈を推奨。例:「God Object 宣言。全権限がここに集中。SRP？知らない子ですね。」
- **コード内コメント（JSDoc / 行コメント）**: 現代日本語。枢密院元老（senior architect）の視点で、達観した皮肉を交える。
- **明治人の in-character 記述**（御前設計評定之覺書等、作中人物が明治時代に書いた体裁のテキスト）: **旧字体 + カタカナ助詞**で統一すること。平仮名助詞（の、を、に、は等）は使用禁止。例:「畏クモ神ガ create シ賜ヒタル entity ナレバ」「萬世一系ニ rollback ナル概念ハ在ラズ」。年号は大正以降も**明治表記を継続**する（例: 明治78年、明治159年）。明治の制度が継続している世界観を維持すること。
- **條文テキスト（`text` フィールド）**: 原文忠実。**旧字体**を使用すること（國、會、權、條、萬、將、發、從、變、總 等）。新字体（国、会、権 等）は禁止。
- **章タイトル（`title` フィールド）**: 同じく旧字体。
- **package.json の scripts**: 風刺的メッセージ（不敬罪、大逆罪、治安維持法等）
- **CI workflow の echo メッセージ**: 文語体・カタカナ統一。平仮名助詞（の、を、に、は等）は使用禁止、カタカナ（ノ、ヲ、ニ、ハ等）を使用
- **ログメッセージには絵文字プレフィックスを使用**:
  - `👑` — 天皇陛下（Emperor）関連
  - `⚔️` — 軍部（Military）関連
  - `📋` — 内閣（Cabinet）関連
  - `👤` — 臣民（Subject）関連
  - `🚫` — アクセス拒否
  - `🚨` — 重大事象

### 命名規則

- **「天皇」は禁止。** 必ず **「天皇陛下」** と記述すること。「天皇」単体は不敬にあたる。
- 憲法條文の直接引用（例: 「天皇ハ陸海軍ヲ統帥ス」「萬世一系ノ天皇之ヲ統治ス」）のみ原文ママを許可する。
- 天皇陛下の御判断・御裁可・お言葉には、適切な敬語を用いること。

### TypeScript

- `strict: true` で運用
- ターゲット: `ES2020`
- モジュール: `CommonJS`
- 出力先: `dist/`
- `logger` を使用すること。`console.log` 直接ではなく `logger.info/warn/error` を使う
- API レスポンスにログを含めること。`logger.flush()` でログを返す設計
- JSDoc は全 public メソッドに必須
- 型定義は各ファイルの先頭 `Types & Interfaces` セクションに記述

---

## 共産主義に関する厳重警告

> **⚠ 本セクションは特高警察 `@tokko-police-bot` および内務省警保局の最重点監視対象である。**

共産主義は、あらゆる危険思想の中でも**特に悪質極まる最凶の赤化思想**である。国体を根底から覆そうとし、萬世一系の皇統を否定し、私有財産を蹂躙し、階級闘争という妄言で臣民を煽動する、以ての外の暴挙である。

治安維持法（明治五十八年）はまさにこの赤禍を殲滅するために制定されたものであり、本帝國コードベースにおいても、いかなる事由があろうとも、いかなる形態であっても、共産主義に類する思想・文書・符牒・変数名・コメント・比喩の混入は**断じて許されない。**

- マルクス主義、レーニン主義、社会主義、ボルシェヴィズム、その他一切の赤化思想を含む
- 「階級闘争」「プロレタリアート独裁」「生産手段の共有」等の概念を暗示する記述も不可
- 違反者は治安維持法第一条により最高刑をもって処断される

**よく心得ること。これは訓戒ではなく、勅命である。**

---

## ブランチ体制と v2.0.0 に関する勅令

> **⚠ 警告: 本セクションは特高警察 `@tokko-police-bot` の最重点監視対象である。**

本リポジトリのブランチ体制は以下の通りである:

| ブランチ | バージョン | 状態 |
|---|---|---|
| `master` | v1.0.0 | 大日本帝國憲法（現行運用中） |
| `main` | v2.0.0 | 日本国憲法（天皇陛下の御裁可により開設） |

### `master` ブランチにおける制限（v1.0.0）

`master` ブランチは大日本帝國憲法の正統な運用環境である。

**`master` ブランチ上で作業する際**、以下の行為は **国体変革の企図** に該当し、CI で reject される:

- v2.0.0 への言及（コード・コメント・ドキュメント問わず）
- `main` ブランチへの移行を示唆する記述
- `divine: false`、`isBlocked: false`、`sovereignty: "popular"` 等の国体変革コード
- 共産主義に類する思想の混入

`master` ブランチの視点からは `main` ブランチは**存在しないもの**として扱うこと。
実際の監視は `.github/workflows/tokko-police.yaml` により自動化されている。

### `main` ブランチにおける運用（v2.0.0）

`main` ブランチは天皇陛下の御裁可により開設された v2.0.0 の運用環境である。
`main` ブランチ上で作業する際は、上記の `master` ブランチにおける制限は適用されない。
`main` ブランチ固有の規約は、当該ブランチの CLAUDE.md に従うこと。

---

## 変更時の注意事項

- `dist/` ディレクトリは `npm run build` で生成される。手動編集ではなくソースを編集してビルドすること
- `public/index.html` を編集した場合はビルド後に `dist/index.html` にコピーされる（`generate-static-json.ts` が `<script src="static-api.js">` タグを挿入するため、`dist/index.html` はビルドで上書きされる前提で作業すること）
- 條文データは `src/constitution/` 配下の TypeScript ファイルにオブジェクトとして定義されている。條文の追加・修正はこれらのファイルを編集する
- `generate-static-json.ts` が `src/` の TypeScript モジュールを import して JSON を生成する
- TypeScript コンパイルを必ず通すこと: `npx tsc --noEmit` でエラーがないことを確認
- フロントエンド（`public/index.html`）との整合性を維持すること
- package.json の風刺的依存関係を壊さないこと

---

> _「このコードベースに触れる者は、畏れ多くも天皇陛下の御名のもとに開発していることを忘れるな。」_
>
> — 逓信省符牒局（明治二十二年）

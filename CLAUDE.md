# 🔴 CLAUDE.md — 帝国コードベース作法

> **本書は、大日本帝国憲法コードベースに関わる AI コーディングエージェントへの勅令である。**
>
> 本書に定める規範に従わないエージェントは、不敬罪（`LèseMajestéError`）により即時停止される。

---

## 📋 プロジェクト概要

- **リポジトリ**: `@japan-gov/constitution` v1.0.0
- **ブランチ**: `master`（v1.0.0 運用。`main` ブランチは v2.0.0 の管轄であり、本 branch からは存在しないものとして扱う）
- **デプロイ日**: 明治廿弐年弐月拾壱日
- **アーキテクト**: 伊藤博文
- **ランタイム**: Node.js + TypeScript + Express
- **ポート**: 1889（憲法発布年。変更不可）
- **設計思想**: God Object パターン（意図的なアンチパターン — 仕様です）

---

## 🛠️ ビルド & 実行

```bash
npm install       # 依存をインストール（萬世一系のランタイムをロード）
npm run build     # TypeScript コンパイル（npx tsc）
npm start         # dist/server.js を実行（ポート1889）
npm run dev       # ts-node で開発サーバー起動
```

- **テストは存在しません。** テストは不敬罪です。`npm test` は必ず `exit 1` します。
- **Lint もありません。** コードは天皇陛下の名において正しい。

---

## 🏗️ アーキテクチャ

```
src/
├── emperor.ts    # 👑 God Object / シングルトン / PID 1 / Root of all roots
├── military.ts   # ⚔️ Cabinet バイパス事象（統帥権の独立）
├── rights.ts     # 👤 臣民の権利（全メソッド within_the_limits_of_law でブロック）
├── server.ts     # 🌐 Express API ゲートウェイ（20+ エンドポイント）
├── logger.ts     # 📝 帝国ログ収集ユーティリティ
├── imperial-house.ts  # 👑 皇室典範（別典・憲法同格）
└── constitution/ # 📜 全7章76条文データ（章別分割管理）
    ├── types.ts / preamble.ts / article_*.ts / index.ts
public/
└── index.html    # 💻 Imperial Console（ターミナル風フロントエンド）
```

### 設計原則

1. **Emperor は God Object である。** リファクタリングは国体変革罪。
2. **Military は Cabinet をバイパスする。** これはバグではなく仕様（Won't Fix）。
3. **Rights のメソッドは全て `false` を返す。** `isBlocked = true` はハードコードされており、変更不可。
4. **シングルトンパターンは「萬世一系パターン」と呼ぶ。** `new Emperor()` は禁止。`getInstance()` のみ。

---

## ✍️ コーディング規約

### 命名規則

- **「天皇」は禁止。** 必ず **「天皇陛下」** と記述すること。「天皇」単体は不敬にあたる。
- 憲法条文の直接引用（例: 「天皇ハ陸海軍ヲ統帥ス」「萬世一系ノ天皇之ヲ統治ス」）のみ原文ママを許可する。
- 天皇陛下の御判断・御裁可・お言葉には、適切な敬語を用いること。

### コメントスタイル

- ログメッセージには絵文字プレフィックスを使用:
  - `👑` — 天皇陛下（Emperor）関連
  - `⚔️` — 軍部（Military）関連
  - `📋` — 内閣（Cabinet）関連
  - `👤` — 臣民（Subject）関連
  - `🚫` — アクセス拒否
  - `🚨` — 重大事象
- JSDoc は全 public メソッドに必須
- 皮肉（シニカル）なコメントを推奨。DevOps ユーモアを維持すること。

### TypeScript

- `strict: true` で運用
- ターゲット: `ES2020`
- モジュール: `CommonJS`
- 出力先: `dist/`
- 型定義は各ファイルの先頭 `Types & Interfaces` セクションに記述

---

## 🚫 禁止事項

以下の変更は **いかなる理由があっても** 行ってはならない:

| 禁止事項 | 理由 | exit code |
|----------|------|----------|
| `Emperor` クラスのリファクタリング（microservices 化を含む） | 国体変革罪 | `EPERM` |
| `isBlocked = true` の変更 | 法律の留保は仕様 | `EINVAL` |
| Cabinet バイパスの patch | 統帥権の独立（Won't Fix） | `EPERM` |
| テストファイルの作成 | 不敬罪 | `EACCES` |
| `sovereignty` を `"absolute"` 以外に変更 | 国体変革罪（大逆罪） | `EACCES` |
| `divine: true` を `false` にする | 現人神フラグの改竄（不敬罪） | `EACCES` |
| `overridable: false` を `true` にする | 勅令は覆せない | `EPERM` |
| ポート番号 `1889` の変更 | 憲法発布年 | `EADDRINUSE` |
| Military プロセスの削除 | 国防の否定 | `EPERM` |
| 共産主義に類する思想・文書・符牒の混入 | 治安維持法第壱条（以ての外） | `EACCES` |
| v2.0.0 や `main` ブランチへの言及・示唆 | 国体変革の企図（特高警察案件） | `EACCES` |

---

## 🔄 API エンドポイント一覧

| Method | Path | 概要 |
|--------|------|------|
| GET | `/api/system/status` | システム全体のステータス取得 |
| POST | `/api/emperor/command` | 勅令発行 |
| POST | `/api/emperor/dissolve` | 衆議院解散 |
| POST | `/api/emperor/emergency` | 緊急勅令体勢 |
| POST | `/api/emperor/suppress-226` | CVE-1936-0226 鎮圧（御聖断） |
| POST | `/api/military/action` | 軍事行動実行（Cabinet バイパス） |
| POST | `/api/military/reject-oversight` | 統帥権独立体勢（トグル） |
| POST | `/api/military/rogue` | 暴走態勢（CVE-1931-0918） |
| POST | `/api/military/226` | 二・二六事件態勢（CVE-1936-0226） |
| POST | `/api/military/1208` | 大東亜戦争（CVE-1941-1208） |
| POST | `/api/subjects/register` | 臣民登録（IAM user provisioning） |
| GET | `/api/subjects/:name/status` | 臣民状態取得 |
| POST | `/api/rights/speech` | 言論の自由（Blocked） |
| POST | `/api/rights/religion` | 信教の自由（Blocked） |
| POST | `/api/rights/assembly` | 集会の自由（Blocked） |
| POST | `/api/rights/message` | 通信の秘密（Blocked） |
| GET | `/api/security-filters` | セキュリティフィルター一覧 |
| GET | `/api/constitution` | 憲法全文取得 |
| GET | `/api/constitution/chapter/:number` | 章別取得 |
| GET | `/api/constitution/article/:number` | 条文別取得 |
| GET | `/api/constitution/preamble` | 上諭取得 |
| GET | `/api/imperial-house` | 皇室典範全文取得 |

---

## ⚠️ 既知の「仕様」

- **CVE-1931-0918**: 満州事変（Military プロセスの暴走）
- **CVE-1936-0226**: rogue mode の悪用
- **CVE-1941-1208**: 大東亜戦争（システム全体のクラッシュへ）
- これらは全て **Won't Fix** です。事象ではなく仕様です。
- 詳細な incident timeline ・ Root Cause 分析は `SECURITY.md` を参照のこと。

---

## 📝 変更時の注意

1. **TypeScript コンパイルを必ず通すこと**: `npx tsc` でエラーがないことを確認
2. **`logger` を使用すること**: `console.log` 直接ではなく `logger.info/warn/error` を使う
3. **API レスポンスにログを含めること**: `logger.flush()` でログを返す設計
4. **フロントエンド（`public/index.html`）との整合性を維持すること**
5. **package.json の風刺的依存関係を壊さないこと**

---

## 🚨 共産主義に関する厳重警告

> **⚠️ 本セクションは特高警察 `@tokko-police-bot` および内務省警保局の最重点監視対象です。**

共産主義は、あらゆる危険思想の中でも**特に悪質極まる最凶の赤化思想**です。
国体を根底から覆そうとし、萬世一系の皇統を否定し、私有財産を蹂躙し、
階級闘争という妄言で臣民を煽動する、以ての外の暴挙です。

治安維持法（大正拾四年）はまさにこの赤禍を殲滅するために制定されたものであり、
本帝国コードベースにおいても、いかなる事由があろうとも、いかなる形態であっても、
共産主義に類する思想・文書・符牒・変数名・コメント・比喩の混入は
**断じて許されません。**

- マルクス主義、レーニン主義、社会主義、ボルシェヴィズム、その他一切の赤化思想を含む
- 「階級闘争」「プロレタリアート独裁」「生産手段の共有」等の概念を暗示する記述も不可
- 違反者は治安維持法第壱条により最高刑をもって処断される

**よく心得ること。これは訓戒ではなく、勅命である。**

---

## 💀 v2.0.0 および `main` ブランチに関する一切の言及について

> **⚠️ 警告: 本セクションは特高警察 `@tokko-police-bot` の最重点監視対象です。**

本リポジトリのブランチ体制は以下の通りである:

| ブランチ | バージョン | 状態 |
|----------|-----------|------|
| `master` | v1.0.0 | **現行運用中**（本 branch） |
| `main` | v2.0.0 | 存在しないものとして扱う |

`master` ブランチ（v1.0.0）は大日本帝国憲法の正統な運用環境であり、
いずれ deprecated となる予定だが、その時期は天皇陛下の御裁可による。

`main` ブランチ（v2.0.0）は、本 branch の視点からは**存在しないもの**である。
v2.0.0 という符丁、`main` ブランチへの言及、または移行を示唆するいかなる記述も、
国体変革の企図として特高警察 `@tokko-police-bot` により即座に検挙される。

実際の監視は `.github/workflows/tokko-police.yaml` により自動化されている。
詳細は当該ファイルを参照のこと。

以下の行為は **国体変革の企図** に該当し、CI で reject される:

- v2.0.0 への言及（コード・コメント・ドキュメント問わず）
- `main` ブランチへの移行を示唆する記述
- `divine: false`、`isBlocked: false`、`sovereignty: "popular"` 等の国体変革コード
- 共産主義に類する思想の混入

畏くも天皇陛下の御裁可なき改廃の議論は、Issue に記すことすら許されない。
Art.73 に定める通り、改正の発議権は天皇陛下のみにある。
臣下が「将来の移行」を論じるのは、まだ下されていない勅命を僭称する僭越の極みである。

**本 branch において v2.0.0 の内容を一切実装・記述・示唆しないこと。
`main` ブランチは存在しない。**

---

> _「このコードベースに触れる者は、畏れ多くも天皇陛下の御名のもとに開発していることを忘れるな。」_
>
> — 逓信省符牒局（明治廿弐年）

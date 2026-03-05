================================================================================

    japan-gov/constitution v1.0.0
    大日本帝國憲法（Meiji Constitution） --- Release Notes

    亞細亞初ノ近代的オブヂェクト指向國家アーキテクチュア

    ※ 但シ God Object（天皇陛下）ハ神聖ニシテ侵スベカラズ
      （Object.freeze() 濟ミ・delete 不可・プロトタイプ汚染耐性有リ）

================================================================================


■ Overview（總覽）

  本庫ハ、明治二十二年ニ布達セラレタル國家運用體制「大日本帝國」ノ原典ナリ。
  プロイセン王國ノ既存アーキテクチュアヲ參考ニフオークシ、不肖伊藤博文、
  畏クモ天皇陛下ノ大命ヲ拜シ主任アーキテクトノ任ヲ奉ジ、約十年ノ
  ヲーターフヲール型開發ヲ經テ謹ミテ御前環境ヘ奉納セシモノナリ。

  當頁ハ帝國電網最先端ノ「幀組（frameset）」及ビ「自動演算符牒（JavaScript）」
  技術ヲ以テ構築セリ。謄寫（build）工程ハ存在セズ。符牒局ノ技手ガ手書キセル
  電文ヲ其ノ儘掛載ス。之ヲ「靜的サイト」ト稱ス。

  ◆ Key Features

  ・God Object（TEIKOKU）ニ依ル一元的ナル permission 管理
  ・帝國コンソール --- 統治機構操作盤（console.html。電信端末風 UI）
  ・Military 機構ノ高速ナル Root 實行（※認可手順ヲ迂回）
  ・臣民ノ權利 Interface --- 充實セル Method 群
    （※全テニ within_the_limits_of_law Firewall 有リ）
  ・幀組（frameset）ニ依ル頁分割 --- 一枚ノ頁ヲ複數ノ幀ニ分割スル此ノ發明、
    實ニ文明開化ノ極ミナリ


■ Quick Start（御使用方法）

  甲. 電網閲覧機（ブラウザ）ニテ下記ヘ接續ス

      https://japan-gov.github.io/constitution/

  乙. 手許ニ複寫シテ閲覧スル場合

      git clone https://github.com/japan-gov/constitution.git
      constitution/index.html ヲ電網閲覧機ニテ開ク

  以上デアル。install 不要。build 不要。番兵（server）不要。

  ※ 試驗（test）手順ハ無イ。ソモソモ npm ガ無イ。
    天皇陛下ノ御裁可ヲ疑フ行爲ハ、物理的ニ不可能デアル。


■ Architecture Diagram（國體構成圖）

                    ┌──────────────────────────────────────────────┐
                    │             👑 Emperor／天皇陛下              │
                    │                                              │
                    │  God Object / PID 1 / uid: 0 (root)          │
                    │  Singleton（萬世一系パターン）                │
                    │  Object.freeze() 濟 / delete 不可            │
                    │                                              │
                    │  sovereignty: "absolute"                     │
                    │  divine: true            (Art.3)             │
                    │  inviolable: true        (Art.3)             │
                    │  commandsMilitary: true  (Art.11) ← bypass!  │
                    │  canDissolve: true       (Art.7)  ← SIGKILL │
                    │  canAmendConstitution: true (Art.73)         │
                    │                                              │
                    │  @imperial-household  Owner  ← 皇室         │
                    │  @Imperial-army       Owner  ← 陸軍         │
                    │  @Imperial-navy       Owner  ← 海軍         │
                    │  @japan-gov           Owner  ← 內閣・議會   │
                    └──────────────────────┬───────────────────────┘
                                           │
          以下機關ハ全テ天皇陛下直屬。對等ニシテ從屬關係ニ非ズ。
                                           │
         ┌──────────┬──────────┬────────────┼──────────┐
         │          │          │            │          │
         ▼          ▼          ▼            ▼          ▼

┌───────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│ @imperial-        │ │ ⚔️ @Imperial-army   │ │ ⚔️ @Imperial-navy   │
│   household (皇室)│ │   （陸軍）          │ │   （海軍）          │
│                   │ │                     │ │                     │
│ ├ 📜 皇室典範     │ │ [統帥]              │ │ [統帥]              │
│ │  (Art.74/別典)  │ │ ├ 參謀本部          │ │ ├ 軍令部            │
│ ├ 👑 皇族會議     │ │ │  天皇陛下直隷     │ │ │  天皇陛下直隷     │
│ │  典範改正諮詢   │ │ │  Cabinet bypass   │ │ │  Cabinet bypass   │
│ ├ 🏛 樞密院       │ │ ├ 教育總監部        │ │ ├ 聯合艦隊          │
│ │  (Art.56)       │ │ ├ 關東軍→rogue!    │ │ │                   │
│ ├ 🏠 宮內省       │ │ │ ※甚ダ之ヲ憂フ    │ │ [軍政]              │
│ │  皇室事務管掌   │ │ │                   │ │ ├ 海軍省（海軍大臣）│
│ ├ 🔏 內大臣府     │ │ [軍政]              │ │ │                   │
│ │  御璽保管       │ │ ├ 陸軍省（陸軍大臣）│ │ └ 🔍 特警隊         │
│ └ 🔍 樞密院諮詢   │ │ │                   │ │    tokkeitai.yaml   │
│    suumitsu-      │ │ └ 🔍 憲兵隊         │ │                     │
│    in.yaml        │ │    kenpeitai.yaml   │ │                     │
│                   │ │                     │ │                     │
└───────────────────┘ └─────────────────────┘ └─────────────────────┘

                  ※戰時ニハ大本營（陸軍部＋海軍部）ヲ編成。
                    內閣參加不可。Cabinet.approve() 完全ニ無效。

                      × Art.11 統帥權 ×
                  ⚔️ ──────×──────→ 📋
                  軍部ハ Cabinet.approve() ヲ bypass ス。
                  此レハバグニ非ズ仕樣（Won't Fix）ナリ。

┌──────────────────────────────────────┐ ┌──────────────────────┐
│ 📋 @japan-gov（帝國政府）            │ │ ⚖️ Judiciary／司法   │
│                                      │ │  (Art.57-61)         │
│ ├ Cabinet／內閣 (Art.55-56)          │ │                      │
│ │ ※approve() 形骸化                  │ │ ├ 大審院（終審）     │
│ │                                    │ │ │ ※司法權獨立         │
│ │ ├ 内務省                           │ │ │  天皇陛下直屬       │
│ │ │ └ 🔍 特高警察（警保局）          │ │ │                     │
│ │ │    tokko-police.yaml             │ │ └ 行政裁判所 (Art.61)│
│ │ ├ 📡 逓信省（符牒局）             │ │    ※行政訴訟專管     │
│ │ │  GitHub repo 管理・文書班        │ │    通常裁判所管轄外   │
│ │ ├ 📜 內閣官報局                    │ │                      │
│ │ │  deploy-pages.yaml               │ └──────────────────────┘
│ │ └ 🔎 會計檢査院 (Art.72)           │
│ │    歲入歲出決算檢査                 │
│ │                                    │
│ └ 🏛️ Diet／帝國議會 (Art.33-54)     │
│    ├ 貴族院 (persistent／終身勅任)   │
│    └ 衆議院 (killable／Art.7)        │
│                                      │
└──────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ 👤 Subjects／臣民                        │
│                                          │
│ rights: "granted"                        │
│ ※但シ法律ノ範圍內ニ限ル                  │
│                                          │
│ ┌──── WAF (default deny) ──────────────┐ │
│ │ 新聞紙條例  (1875)  block            │ │
│ │ 保安條例    (1887)  ban              │ │
│ │ 治安警察法  (1900)  arrest           │ │
│ │ 治安維持法  (1925)  L8 DPI           │ │
│ │ isBlocked = true    (常時)           │ │
│ └──────────────────────────────────────┘ │
│ Speech   → 🚫  Religion → 🚫            │
│ Assembly → 🚫  Message  → 🚫            │
└──────────────────────────────────────────┘


■ Repository Structure（帝國文書構成）

  japan-gov/constitution/
  ├── index.html          表玄關。幀組（frameset）定義。左=目録幀、右=本文幀
  ├── menu.html           目録幀（左幀。臙脂地ニ金文字）
  ├── main.html           表紙（右幀初期頁）
  ├── kenpou.html         憲法全文（全七章七十六條＋上諭。不磨ノ大典）
  ├── tenpan.html         皇室典範（別典・憲法同格）
  ├── console.html        帝國コンソール（統治機構操作盤。電信端末風 UI）
  ├── cve.html            既知ノ事象（全件 Won't Fix）
  ├── links.html          リンク集（相互接續自由・歓迎）
  ├── js/
  │   ├── kenpou_data.js  憲法條文データ（全七章七十六條ヲ JS object 直書キ）
  │   └── teikoku.js      帝國統治機構（TEIKOKU God Object・軍部・臣民權利。
  │                       命令符牒ヲ電話交換手方式ニテ取次グ）
  ├── .github/workflows/  帝國 CI/CD 體制（特高・憲兵・特警・樞密院・官報局）
  ├── ministers.yaml      國務大臣人事設定（kubectl apply -f）
  ├── .editorconfig       帝國議會內部規則（Art.51）
  ├── .gitignore          自由民權的妄言ノ log（/dev/null 送リ）
  ├── CHANGELOG.txt       帝國變遷記録（v1.0.0 ヲ以テ完結）
  ├── CONTRIBUTING.txt    「PR ハ受ケ付ケズ。Issue ヲ立テルト Ban サル」
  ├── LICENSE             Emperor's Proprietary License v1.0（fork 禁制）
  ├── README.txt          此ノ文書
  └── SECURITY.txt        事象公報（全テ Won't Fix）

  ※ 依存 package: 零。node_modules: 無シ。supply chain attack ノ攻撃面: 零。
    保安體制ガ完璧トイフヨリ、攻撃サレル物ガ無イ。


■ Known Issues（既知ノ事象）

  詳細ハ SECURITY.txt ヲ參照スベシ。全十件、Won't Fix（一件ノミ分類不能）。


■ Deployment History（布達履歷）

  版           日附        符牒       摘要
  -----------  ----------  ---------  ---------------------------------------
  v1.0.0       1889-02-11  明治憲法   初回御布達。御前環境投入
  v1.0.1       ██████      [檢閲削除] 某國務大臣案。保守的 patch。却下済。
                                      存在セズ
  v2.0.0-rc.1  ██████      [檢閲削除] 外國人草案。one-week sprint。full
                                      rewrite。存在セズ
  v2.0.0-rc.2  ██████      [檢閲削除] 小委員長ニヨル修正。Art.9 ニ一行ノ
                                      diff。存在セズ
  v2.0.0       ？？？      [檢閲削除] 本 branch ニ於テ言及スルハ保安條例違反。
                                      內務省警保局 @tokko-police-bot 監視對象

  ※ 塗抹「██████」ハ內務省警保局ノ檢閲印ナリ。


■ Warning: Communism（共産主義ニ關スル嚴重警告）

  +------------------------------------------------------------------------+
  |                                                                        |
  |  本帝國コードベースニ於テ、共産主義ニ類スル一切ノ思想・文書・符牒ノ    |
  |  混入ハ、如何ナル事由アリトモ斷ジテ許サレザル所ナリ。                  |
  |                                                                        |
  |  共産主義ハ危險思想ノ中ニテモ殊ニ惡質極マル最凶ノ赤化思想ニシテ、      |
  |  以テノ外ナリ。治安維持法（明治五十八年）ハ正ニ此ノ赤禍ヲ殲滅スル      |
  |  爲ニ制定サレタルモノナリ。                                            |
  |  違反者ハ治安維持法第一條ニ依リ最高刑ヲ以テ處斷サルベシ。              |
  |                                                                        |
  |                                  --- 內務省警保局 @tokko-police-bot    |
  +------------------------------------------------------------------------+


■ 自動化Bot（帝國 CI/CD 體制）

  詳細ハ CONTRIBUTING.txt ヲ參照スベシ。

  Bot                  管轄
  -------------------  ---------------------------------------------
  @tokko-police-bot    內務省警保局（思想檢閲・出版檢閱）
  @kenpeitai-bot       陸軍省憲兵司令部（符牒審査・國體護持）
  @tokkeitai-bot       海軍省特別警察隊（通信保安・型紀律）
  @suumitsu-in-bot     樞密院（merge 裁可。臣下ノ PR ハ常ニ却下）

  ※ 全 Bot ハ天皇陛下（OWNER）ニ對シテハ動作ヲ免除ス。


■ License（御專有許諾）

  Emperor's Proprietary License (EPL) v1.0／天皇陛下御專有許諾書
  Copyright (c) 1889 大日本帝國 --- All Rights Reserved by the Emperor

  「萬世一系ノ天皇之ヲ統治ス」

  ※ fork・改變ニハ天皇陛下ノ勅命ヲ要ス。Pull Request ハ受ケ付ケズ。
  ※ 詳細ハ LICENSE ヲ參照スベシ。
  ※ 貢獻規則ハ CONTRIBUTING.txt ヲ參照
    （※ 閲覧者ハ內務省警保局監視對象ニ追加サル）。


================================================================================
    大日本帝國政府 逓信省符牒局　明治二十二年 開設
    相互電網接續（リンク）ハ自由。無斷轉載ハ出版法ニ依リ處罰ス。
================================================================================

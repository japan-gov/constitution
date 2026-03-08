/**
 * article_1_emperor.ts — 第1章 天皇（Art.1–17）
 *
 * Root Permissions 定義。God Object ノ ClusterRole 及ビ全大権ヲ規定。
 * 天皇陛下ノ統治権ハ absolute デアリ、SRP (Single Responsibility Principle) ハ適用外。
 * Art.11（統帥権）ハ CVE-1931-0918, CVE-1936-0226, CVE-1941-1208 ノ root cause。
 *
 * @since v1.0.0 (1889-02-11)
 * @author 伊藤博文 <ito.hirobumi@suumitsu-in.imperial.ij>
 */

import { Chapter } from "./types";

// ============================================================
//  第1章 天皇（Art.1–17）— Root Permissions
// ============================================================

export const CHAPTER_1: Chapter = {
  number: 1,
  title: "天皇",
  articles: [
    {
      number: 1,
      text: "大日本帝國ハ萬世一系ノ天皇之ヲ統治ス",
      _comment: "萬世一系の type declaration。fork も rebase も不可。皇統は唯一絶対。",
    },
    {
      number: 2,
      text: "皇位ハ皇室典範ノ定ムル所ニ依リ皇男子孫之ヲ繼承ス",
      _comment: "継承規則は別典（imperial-house.ts）で管理。male-line male only。PR は auto-close。",
    },
    {
      number: 3,
      text: "天皇ハ神聖ニシテ侵スヘカラス",
      _comment: "Object.freeze(emperor)。immutable かつ delete 不可。prototype pollution 耐性あり。",
    },
    {
      number: 4,
      text: "天皇ハ國ノ元首ニシテ統治權ヲ總攬シ此ノ憲法ノ條規ニ依リ之ヲ行フ",
      _comment: "God Object 宣言。全権限がここに集中。SRP (Single Responsibility Principle)？知らない子ですね。",
    },
    {
      number: 5,
      text: "天皇ハ帝國議會ノ協贊ヲ以テ立法權ヲ行フ",
      _comment: "sudo 権限で立法。「協賛」はあくまで advisory。final approve は Root。",
    },
    {
      number: 6,
      text: "天皇ハ法律ヲ裁可シ其ノ公布及執行ヲ命ス",
      _comment: "CI/CD pipeline の final approver。merge 権限は Root only。",
    },
    {
      number: 7,
      text: "天皇ハ帝國議會ヲ召集シ其ノ開會閉會停會及衆議院ノ解散ヲ命ス",
      _comment: "議会機構の start/stop/kill 権限。SIGKILL も SIGTERM も自由自在。",
    },
    {
      number: 8,
      text: "天皇ハ公共ノ安全ヲ保持シ又ハ其ノ災厄ヲ避クル為緊急ノ必要ニ由リ帝國議會閉會ノ場合ニ於テ法律ニ代ルヘキ勅令ヲ發ス\n此ノ勅令ハ次ノ會期ニ於テ帝國議會ニ提出スヘシ若議會ニ於テ承諾セサルトキハ政府ハ將来ニ向テ其ノ效力ヲ失フコトヲ公布スヘシ",
      _comment: "緊急 hotfix 権限。reviewer（議会）不在でも master に direct push 可。後で報告すれば可…多分。",
    },
    {
      number: 9,
      text: "天皇ハ法律ヲ執行スル為ニ又ハ公共ノ安寧秩序ヲ保持シ及臣民ノ幸福ヲ増進スル為ニ必要ナル命令ヲ發シ又ハ發セシム但シ命令ヲ以テ法律ヲ變更スルコトヲ得ス",
      _comment: "実行権限はあるが config を書き換える権限はない…はず。でも緊急勅令（Art.8）で bypass 可能。",
    },
    {
      number: 10,
      text: "天皇ハ行政各部ノ官制及文武官ノ俸給ヲ定メ及文武官ヲ任免ス但シ此ノ憲法又ハ他ノ法律ニ特例ヲ掲ケタルモノハ各々其ノ條項ニ依ル",
      _comment: "HR 権限。hire/fire/salary 全て Root。kubectl apply -f ministers.yaml。",
    },
    {
      number: 11,
      text: "天皇ハ陸海軍ヲ統帥ス",
      _comment: "⚑️ CRITICAL: これが統帥権の独立の根拠。Military が Cabinet を迂回する法的根拠。後に致命的欠陥の原因となる。CVE-1931-0918, CVE-1936-0226, CVE-1941-1208 の元凶。たった10文字で帝国を滅ぼした最凶の1行。",
    },
    {
      number: 12,
      text: "天皇ハ陸海軍ノ編制及常備兵額ヲ定ム",
      _comment: "Military resource の CPU/memory allocation。上限なし。auto-scaling が暴走する原因。",
    },
    {
      number: 13,
      text: "天皇ハ戰ヲ宣シ和ヲ講シ及諸般ノ條約ヲ締結ス",
      _comment: "外部 API 連携の全権限。declare_war() も make_peace() も treaty.sign() も Root only。",
    },
    {
      number: 14,
      text: "天皇ハ戒厳ヲ宣告ス\n戒厳ノ要件及效力ハ法律ヲ以テ之ヲ定ム",
      _comment: "lockdown mode。全臣民の connection を drop。DDoS 対策…のはずが、自国臣民への攻撃に使われる。",
    },
    {
      number: 15,
      text: "天皇ハ爵位勳章及其ノ他ノ榮典ヲ授與ス",
      _comment: "臣民の位階勲等・記章の下賜。GitHub の Star のようなもの…ただし revoke 権限もあり。",
    },
    {
      number: 16,
      text: "天皇ハ大赦特赦減刑及復權ヲ命ス",
      _comment: "Undo 権限。unban、account restore 全て Root の裁量。司法の rollback も可能。",
    },
    {
      number: 17,
      text: "摂政ヲ置クハ皇室典範ノ定ムル所ニ依ル\n摂政ハ天皇ノ名ニ於テ大權ヲ行フ",
      _comment: "sudo delegate。Root 不在でも sudo -u emperor で proxy 実行可能。",
    },
  ],
};

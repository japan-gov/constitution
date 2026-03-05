/**
 * generate-static-json.ts — 帝国静的文書生成装置（Imperial Static Asset Generator）
 *
 * TypeScript ニ刻マレタル憲法条文データヲ JSON 形式ニテ
 * dist/ 配下ニ出力スル為ノ逓信省公用工具。
 *
 * GitHub Pages（静的兵站基盤）ニ於テハ Express 等ノ
 * 動的 backend ハ稼働セズ、故ニ全 API 応答ヲ
 * 予メ静的 JSON トシテ焼キ込ム必要アリ。
 *
 * 本処理ハ npm run build ノ一環トシテ実行サレ、
 * tsc ニ依ル transpile 完了後ニ起動サルル。
 *
 * 出力先:
 *   dist/
 *   ├── constitution/
 *   │   ├── constitution.json          # 全文（全7章76条 + 上諭）
 *   │   ├── preamble.json              # 上諭（告文・勅語・前文）
 *   │   ├── chapter/{1..7}.json        # 章別
 *   │   └── article/{1..76}.json       # 条文別
 *   └── imperial-house.json            # 皇室典範（別典・憲法同格）
 *
 * @since v1.0.0 (1889-02-11)
 * @author 逓信省符牒局
 */

import * as fs from "fs";
import * as path from "path";
import { CONSTITUTION, PREAMBLE } from "../src/constitution";
import { IMPERIAL_HOUSE_LAW } from "../src/imperial-house";

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
 * 帝国ノ公文書ハ UTF-8 ニテ記述サルルモノトス。
 * @param filePath - dist/ カラノ相対パス
 * @param data - JSON ニ変換スベキデータ
 */
function writeJson(filePath: string, data: unknown): void {
  const fullPath = path.join(DIST, filePath);
  ensureDir(path.dirname(fullPath));
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`👑 生成: dist/${filePath}`);
}

// ============================================================
//  Main — 静的文書生成
// ============================================================

/** 📜 憲法全文（全7章76条 + 上諭） */
writeJson("constitution/constitution.json", CONSTITUTION);

/** 🙏 上諭（告文・憲法発布勅語・上諭本文） */
writeJson("constitution/preamble.json", PREAMBLE);

/** 📖 章別データ（第1章〜第7章） */
for (const chapter of CONSTITUTION.chapters) {
  writeJson(`constitution/chapter/${chapter.number}.json`, chapter);
}

/** 📋 条文別データ（第1条〜第76条） */
for (const chapter of CONSTITUTION.chapters) {
  for (const article of chapter.articles) {
    writeJson(`constitution/article/${article.number}.json`, article);
  }
}

/** 👑 皇室典範（別典・憲法同格。Art.74 ニ依リ独立文書トシテ管理ス） */
writeJson("imperial-house.json", IMPERIAL_HOUSE_LAW);

console.log("✅ 帝国静的文書生成装置: 全文書ノ焼キ込ミ完了。");

/**
 * logger.ts — 帝国記録蒐集装置（Imperial Structured Logging Pipeline）
 *
 * console.log ノ代ハリニ記録ヲ捕捉シ、
 * API 応答トシテ返却スル為ノ帝国公用補助工具。
 *
 * 本来ナラバ ELK Stack (Elasticsearch + Logstash + Kibana) ヲ
 * 導入スベキ所ナレドモ、帝国ニ於テハ特高警察ガ SIEM ヲ兼ネル。
 * Structured logging 形式 (JSON) ニテ出力シ、
 * Fluentd / Fluent Bit ニ依ル log aggregation ニ対応ス。
 *
 * Log retention policy: 永久保存。purge 不可。
 * 臣民ノ発言記録ハ特高警察ノ証拠物件ナレバ、TTL ハ Infinity ナリ。
 *
 * 特高警察モ活用中ナリ。
 */

export interface LogEntry {
  level: "info" | "warn" | "error" | "success";
  message: string;
  timestamp: string;
}

class ImperialLogger {
  private logs: LogEntry[] = [];

  /** info — 通常ノ上奏記録。severity: INFO。Grafana: green。 */
  public info(message: string): void {
    this.logs.push({ level: "info", message, timestamp: new Date().toISOString() });
  }

  /** warn — 憂慮スベキ事象。severity: WARNING。Slack #imperial-alerts。 */
  public warn(message: string): void {
    this.logs.push({ level: "warn", message, timestamp: new Date().toISOString() });
  }

  /** error — 重大事象。severity: ERROR。PagerDuty P1 以上。 */
  public error(message: string): void {
    this.logs.push({ level: "error", message, timestamp: new Date().toISOString() });
  }

  /** success — 作戦成功。severity: SUCCESS。Grafana: green。戦果報告に相当ス。 */
  public success(message: string): void {
    this.logs.push({ level: "success", message, timestamp: new Date().toISOString() });
  }

  /**
   * 蓄積サレタル記録ヲ drain シテ返却ス。
   * Fluentd forward output 相当。呼ビ出シ後、buffer ハ flush サルル。
   */
  public flush(): LogEntry[] {
    const captured = [...this.logs];
    this.logs = [];
    return captured;
  }

  /** buffer ノ read replica。drain セズニ閲覧ス。tail -f 相当。 */
  public peek(): LogEntry[] {
    return [...this.logs];
  }
}

// 帝国唯一ノ全域共有実体（singleton — 帝国ニ私的ナル記録ハ存在セズ）
// centralized logging: 全 namespace ノ log ヲ一元蒐集ス。
export const logger = new ImperialLogger();

/**
 * ファイル解析関連の型定義
 */

/**
 * LINEトーク履歴のメッセージ
 */
export interface Message {
  /** メッセージの日付 */
  date: Date;
  /** 時刻（HH:MM形式） */
  time: string;
  /** ユーザー名 */
  user: string;
  /** メッセージ本文 */
  content: string;
  /** 元の行データ */
  rawLine: string;
}

/**
 * 日付範囲
 */
export interface DateRange {
  /** 開始日 */
  start: Date;
  /** 終了日 */
  end: Date;
}

/**
 * ファイル抽出結果
 */
export interface ExtractionResult {
  /** 抽出されたテキスト内容 */
  content: string;
  /** 元のメッセージ数 */
  originalMessageCount: number;
  /** 抽出後のメッセージ数 */
  extractedMessageCount: number;
}

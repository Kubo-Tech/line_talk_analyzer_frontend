/**
 * ファイル解析ユーティリティ
 * LINEトーク履歴ファイルの解析と期間抽出を行う
 */

import { DateRange, ExtractionResult, Message } from '@/types/file';

/**
 * 日付行の正規表現パターン
 * 例: 2024/08/01(木), 2024/8/1(木)
 */
const DATE_PATTERN = /^(\d{4})\/(\d{1,2})\/(\d{1,2})\(.+\)$/;

/**
 * メッセージ行の正規表現パターン
 * タブ文字で区切られた形式: HH:MM\tユーザー名\tメッセージ本文
 */
const MESSAGE_PATTERN = /^(\d{1,2}):(\d{2})\t(.+?)\t(.+)$/;

/**
 * メタメッセージのパターン（カウント対象外）
 */
const META_PATTERNS = [
  /^\[スタンプ\]$/,
  /^\[写真\]$/,
  /^\[動画\]$/,
  /^\[ファイル\]$/,
  /^\[アルバム\]$/,
  /^\[ノート\]$/,
  /^\[通話\]/,
  /が参加しました。$/,
  /が退出しました。$/,
  /がメンバーを追加しました。$/,
  /がメンバーを削除しました。$/,
];

/**
 * 日付を比較（時刻を無視して日付のみ）
 */
function compareDates(date1: Date, date2: Date): number {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return d1.getTime() - d2.getTime();
}

/**
 * 行レベルでの高速期間抽出
 * LINEトーク履歴が時系列順に保存されている特性を利用した最適化実装
 *
 * @param content ファイルの全内容
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns 抽出されたテキスト内容
 *
 * @throws {Error} ファイル形式が不正な場合
 *
 * @example
 * ```typescript
 * const content = await file.text();
 * const startDate = new Date('2025-01-01');
 * const endDate = new Date('2025-12-31');
 * const extracted = extractDateRange(content, startDate, endDate);
 * ```
 */
export function extractDateRange(content: string, startDate: Date, endDate: Date): string {
  const lines = content.split(/\r?\n/);
  const result: string[] = [];
  let currentDate: Date | null = null;
  let inTargetRange = false;
  let headerLines = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // ヘッダー部分（最初の3行程度）は常に保持
    if (i < 3) {
      result.push(line);
      headerLines++;
      continue;
    }

    // 空行は現在の範囲状態に応じて処理
    if (line.trim() === '') {
      if (inTargetRange || currentDate === null) {
        result.push(line);
      }
      continue;
    }

    // 日付行のチェック
    const dateMatch = line.match(DATE_PATTERN);
    if (dateMatch) {
      const year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10);
      const day = parseInt(dateMatch[3], 10);
      currentDate = new Date(year, month - 1, day);

      const compareStart = compareDates(currentDate, startDate);
      const compareEnd = compareDates(currentDate, endDate);

      if (compareStart < 0) {
        // 開始日より前: スキップ
        inTargetRange = false;
        continue;
      } else if (compareEnd > 0) {
        // 終了日より後: 処理終了
        break;
      } else {
        // 範囲内: 抽出対象
        inTargetRange = true;
        result.push(line);
        continue;
      }
    }

    // メッセージ行は範囲内の場合のみ追加
    if (inTargetRange) {
      result.push(line);
    }
  }

  return result.join('\n');
}

/**
 * LINEトーク履歴のパース処理（フォールバック/デバッグ用）
 *
 * @param content ファイルの全内容
 * @returns パースされたメッセージの配列
 *
 * @throws {Error} ファイル形式が不正な場合
 *
 * @example
 * ```typescript
 * const content = await file.text();
 * const messages = parseLineTalkHistory(content);
 * console.log(`Total messages: ${messages.length}`);
 * ```
 */
export function parseLineTalkHistory(content: string): Message[] {
  const lines = content.split(/\r?\n/);
  const messages: Message[] = [];
  let currentDate: Date | null = null;
  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;

    // 空行をスキップ
    if (line.trim() === '') {
      continue;
    }

    // ヘッダー行をスキップ（1行目）
    if (lineNumber === 1 && line.startsWith('[LINE]')) {
      continue;
    }

    // 保存日時行をスキップ（2行目）
    if (lineNumber === 2 && line.startsWith('保存日時：')) {
      continue;
    }

    // 日付行の解析
    const dateMatch = line.match(DATE_PATTERN);
    if (dateMatch) {
      const year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10);
      const day = parseInt(dateMatch[3], 10);
      currentDate = new Date(year, month - 1, day);
      continue;
    }

    // メッセージ行の解析
    if (currentDate !== null) {
      const messageMatch = line.match(MESSAGE_PATTERN);
      if (messageMatch) {
        const hour = parseInt(messageMatch[1], 10);
        const minute = parseInt(messageMatch[2], 10);
        const user = messageMatch[3];
        const content = messageMatch[4];

        // システムメッセージ（ユーザー名が空）を除外
        if (!user) {
          continue;
        }

        // メッセージが空の場合は除外
        if (!content) {
          continue;
        }

        // メタメッセージを除外
        if (META_PATTERNS.some((pattern) => pattern.test(content))) {
          continue;
        }

        // メッセージの日時を作成
        const messageDate = new Date(currentDate);
        messageDate.setHours(hour, minute, 0, 0);

        messages.push({
          date: messageDate,
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          user,
          content,
          rawLine: line,
        });
      }
    }
  }

  return messages;
}

/**
 * 期間フィルタリング（parseLineTalkHistory使用時）
 *
 * @param messages メッセージの配列
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns フィルタリングされたメッセージの配列
 *
 * @example
 * ```typescript
 * const messages = parseLineTalkHistory(content);
 * const startDate = new Date('2025-01-01');
 * const endDate = new Date('2025-12-31');
 * const filtered = filterMessagesByDateRange(messages, startDate, endDate);
 * ```
 */
export function filterMessagesByDateRange(
  messages: Message[],
  startDate: Date,
  endDate: Date
): Message[] {
  // 開始日の0:00:00、終了日の23:59:59で範囲を設定
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return messages.filter((message) => {
    const messageTime = message.date.getTime();
    return messageTime >= start.getTime() && messageTime <= end.getTime();
  });
}

/**
 * ファイルから期間を抽出し、統計情報も返す
 *
 * @param content ファイルの全内容
 * @param startDate 開始日
 * @param endDate 終了日
 * @returns 抽出結果と統計情報
 *
 * @example
 * ```typescript
 * const content = await file.text();
 * const startDate = new Date('2025-01-01');
 * const endDate = new Date('2025-12-31');
 * const result = extractWithStats(content, startDate, endDate);
 * console.log(`${result.originalMessageCount} → ${result.extractedMessageCount} messages`);
 * ```
 */
export function extractWithStats(
  content: string,
  startDate: Date,
  endDate: Date
): ExtractionResult {
  // 元のメッセージ数をカウント
  const originalMessages = parseLineTalkHistory(content);
  const originalMessageCount = originalMessages.length;

  // 期間抽出
  const extractedContent = extractDateRange(content, startDate, endDate);

  // 抽出後のメッセージ数をカウント
  const extractedMessages = parseLineTalkHistory(extractedContent);
  const extractedMessageCount = extractedMessages.length;

  return {
    content: extractedContent,
    originalMessageCount,
    extractedMessageCount,
  };
}

/**
 * 解析設定の型定義
 */
export interface AnalysisSettings {
  /** 解析開始日（yyyy-MM-dd形式） */
  startDate: string;
  /** 解析終了日（yyyy-MM-dd形式） */
  endDate: string;
  /** 単語の最小文字数 */
  minWordLength: number | '';
  /** 単語の最大文字数（未指定の場合はnull） */
  maxWordLength: number | null;
  /** メッセージの最小文字数 */
  minMessageLength: number | '';
  /** メッセージの最大文字数（未指定の場合はnull） */
  maxMessageLength: number | null;
  /** 単語の最小出現回数 */
  minWordCount: number | '';
  /** メッセージの最小出現回数 */
  minMessageCount: number | '';
}

/**
 * デフォルト設定
 */
export const DEFAULT_SETTINGS: AnalysisSettings = (() => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 0-indexed なので +1
  // 1月の場合は前年をデフォルトにする
  const defaultYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  return {
    startDate: `${defaultYear}-01-01`,
    endDate: `${defaultYear}-12-31`,
    minWordLength: 1,
    maxWordLength: null,
    minMessageLength: 2,
    maxMessageLength: null,
    minWordCount: 2,
    minMessageCount: 2,
  };
})();

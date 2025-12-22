/**
 * useAnalyze フック
 * トーク履歴の解析処理を管理する
 */

import { analyzeFile } from '@/lib/api';
import { extractWithStats } from '@/lib/fileUtils';
import { AnalysisResponse, AnalyzeRequestParams } from '@/types/api';
import { useState } from 'react';

interface UseAnalyzeResult {
  /** 解析中かどうか */
  isLoading: boolean;
  /** 処理ステータスメッセージ */
  statusMessage: string | null;
  /** エラーメッセージ */
  error: string | null;
  /** 解析結果データ */
  result: AnalysisResponse | null;
  /** 抽出統計情報 */
  extractionStats: {
    originalMessageCount: number;
    extractedMessageCount: number;
  } | null;
  /** 解析を実行する関数 */
  analyze: (params: AnalyzeRequestParams) => Promise<AnalysisResponse | null>;
  /** エラーをリセットする関数 */
  resetError: () => void;
}

/**
 * トーク履歴の解析処理を管理するフック
 *
 * @returns 解析処理の状態と操作関数
 *
 * @example
 * ```tsx
 * const { isLoading, statusMessage, error, result, analyze, resetError } = useAnalyze();
 *
 * const handleAnalyze = async () => {
 *   const result = await analyze({ file: selectedFile });
 *   if (result) {
 *     // 解析成功時の処理
 *   }
 * };
 * ```
 */
export function useAnalyze(): UseAnalyzeResult {
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [extractionStats, setExtractionStats] = useState<{
    originalMessageCount: number;
    extractedMessageCount: number;
  } | null>(null);

  /**
   * 解析を実行する
   *
   * @param params 解析リクエストパラメータ
   * @returns 解析結果（エラー時はnull）
   */
  const analyze = async (params: AnalyzeRequestParams): Promise<AnalysisResponse | null> => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setExtractionStats(null);
    setStatusMessage(null);

    try {
      let fileToSend = params.file;

      // 期間指定がある場合、ファイルの内容を抽出
      if (params.start_date && params.end_date) {
        setStatusMessage('ファイルを読み込んでいます...');

        // ファイルを読み込み
        const content = await params.file.text();

        // 日付文字列をDateオブジェクトに変換
        const startDate = new Date(params.start_date);
        const endDate = new Date(params.end_date);

        setStatusMessage('期間を抽出しています...');

        // 期間抽出と統計情報の取得
        const extraction = extractWithStats(content, startDate, endDate);

        setExtractionStats({
          originalMessageCount: extraction.originalMessageCount,
          extractedMessageCount: extraction.extractedMessageCount,
        });

        // 抽出されたメッセージがない場合は警告
        if (extraction.extractedMessageCount === 0) {
          throw new Error('指定された期間にメッセージが見つかりませんでした。');
        }

        // 抽出した内容で新しいFileオブジェクトを作成
        const blob = new Blob([extraction.content], { type: 'text/plain' });
        fileToSend = new File([blob], params.file.name, { type: 'text/plain' });
      }

      setStatusMessage('解析中...');

      // APIを呼び出し
      const response = await analyzeFile({
        ...params,
        file: fileToSend,
      });

      setResult(response);
      setStatusMessage(null);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '解析中にエラーが発生しました';
      setError(errorMessage);
      setStatusMessage(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * エラーをリセットする
   */
  const resetError = () => {
    setError(null);
  };

  return {
    isLoading,
    statusMessage,
    error,
    result,
    extractionStats,
    analyze,
    resetError,
  };
}

/**
 * useAnalyze フック
 * トーク履歴の解析処理を管理する
 */

import { analyzeFile } from '@/lib/api';
import { AnalysisResponse, AnalyzeRequestParams } from '@/types/api';
import { useState } from 'react';
import { useServerWarmup } from './useServerWarmup';

interface UseAnalyzeResult {
  /** 解析中かどうか */
  isLoading: boolean;
  /** エラーメッセージ */
  error: string | null;
  /** 解析結果データ */
  result: AnalysisResponse | null;
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
 * const { isLoading, error, result, analyze, resetError } = useAnalyze();
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
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const { waitForWarmup } = useServerWarmup();

  /**
   * 解析を実行する
   *
   * @param params 解析リクエストパラメータ
   * @returns 解析結果（エラー時はnull）
   */
  const analyze = async (params: AnalyzeRequestParams): Promise<AnalysisResponse | null> => {
    // ウォームアップの完了を待つ
    await waitForWarmup();

    const startTimestamp = new Date().toISOString();
    // eslint-disable-next-line no-console
    console.log(`[${startTimestamp}] [Analyze] 解析処理を開始`);

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const startTime = Date.now();
      const response = await analyzeFile(params);
      const duration = Date.now() - startTime;
      const endTimestamp = new Date().toISOString();
      // eslint-disable-next-line no-console
      console.log(`[${endTimestamp}] [Analyze] 解析処理が完了（所要時間: ${duration}ms）`);
      setResult(response);
      return response;
    } catch (err) {
      const errorTimestamp = new Date().toISOString();
      const errorMessage = err instanceof Error ? err.message : '解析中にエラーが発生しました';
      console.error(`[${errorTimestamp}] [Analyze] 解析処理でエラーが発生:`, err);
      setError(errorMessage);
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
    error,
    result,
    analyze,
    resetError,
  };
}

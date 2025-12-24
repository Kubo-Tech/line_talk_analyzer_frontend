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
  /** サーバーウォームアップ待機中かどうか */
  isWaitingForWarmup: boolean;
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
  const [isWaitingForWarmup, setIsWaitingForWarmup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const { waitForWarmup, getIsWarmingUp } = useServerWarmup();

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

    // ウォームアップの完了を待つ（実行中の場合のみフラグを立てる）
    const isWarming = getIsWarmingUp();
    if (isWarming) {
      setIsWaitingForWarmup(true);
    }
    await waitForWarmup();
    setIsWaitingForWarmup(false);

    try {
      const response = await analyzeFile(params);
      setResult(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '解析中にエラーが発生しました';
      console.error('[Analyze] 解析処理でエラーが発生:', err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
      setIsWaitingForWarmup(false);
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
    isWaitingForWarmup,
    error,
    result,
    analyze,
    resetError,
  };
}

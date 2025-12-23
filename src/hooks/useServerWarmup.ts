import { healthCheck } from '@/lib/api';
import { useCallback } from 'react';

// モジュールレベルでフラグを管理（全てのフックインスタンスで共有）
let hasWarmedUp = false;

/**
 * サーバーウォームアップフック
 *
 * Renderの無料プランはスリープするため、ユーザーのアクション時に
 * 事前にサーバーを起動しておくことで、解析処理時の待ち時間を短縮する。
 *
 * モジュールレベルでフラグを管理しているため、アプリ全体で1回だけ実行される。
 *
 * @example
 * const { warmup } = useServerWarmup();
 * // ファイルアップロード時やプライバシーポリシー表示時に呼び出す
 * warmup();
 */
export function useServerWarmup() {

  /**
   * サーバーをウォームアップする
   * - 既にウォームアップ済みの場合はスキップ
   * - エラーが発生しても例外をスローせず、silent failする
   * - 開発環境ではコンソールにログを出力
   */
  const warmup = useCallback(async () => {
    const timestamp = new Date().toISOString();
    
    // 既にウォームアップ済みならスキップ
    if (hasWarmedUp) {
      // eslint-disable-next-line no-console
      console.log(`[${timestamp}] [ServerWarmup] 既にウォームアップ済みのためスキップ`);
      return;
    }

    // eslint-disable-next-line no-console
    console.log(`[${timestamp}] [ServerWarmup] ウォームアップ開始`);

    try {
      hasWarmedUp = true;
      const startTime = Date.now();
      await healthCheck();
      const duration = Date.now() - startTime;
      const completeTimestamp = new Date().toISOString();
      // eslint-disable-next-line no-console
      console.log(`[${completeTimestamp}] [ServerWarmup] ウォームアップ完了（所要時間: ${duration}ms）`);
    } catch (error) {
      // エラーでもフラグは立てたままにする（リトライを防ぐ）
      const errorTimestamp = new Date().toISOString();
      console.warn(`[${errorTimestamp}] [ServerWarmup] ウォームアップ失敗（解析処理には影響しません）:`, error);
    }
  }, []);

  return { warmup };
}

/**
 * テスト用: ウォームアップフラグをリセットする
 * @internal
 */
export function resetWarmupFlag() {
  hasWarmedUp = false;
}

import { healthCheck } from '@/lib/api';
import { useCallback } from 'react';

// モジュールレベルでフラグとPromiseを管理（全てのフックインスタンスで共有）
let hasWarmedUp = false;
let isWarmingUp = false; // ウォームアップ実行中フラグ
let warmupPromise: Promise<void> | null = null; // ウォームアップのPromise

/**
 * サーバーウォームアップフック
 *
 * Renderの無料プランはスリープするため、ユーザーのアクション時に
 * 事前にサーバーを起動しておくことで、解析処理時の待ち時間を短縮する。
 *
 * モジュールレベルでフラグとPromiseを管理しているため、アプリ全体で1回だけ実行される。
 *
 * @example
 * const { warmup, waitForWarmup } = useServerWarmup();
 * // ファイルアップロード時やプライバシーポリシー表示時に呼び出す
 * warmup();
 * // 解析開始時にウォームアップの完了を待つ
 * await waitForWarmup();
 */
export function useServerWarmup() {

  /**
   * サーバーをウォームアップする
   * - 既にウォームアップ済みまたは実行中の場合はスキップ
   * - エラーが発生しても例外をスローせず、silent failする
   * - 開発環境ではコンソールにログを出力
   */
  const warmup = useCallback(() => {
    const timestamp = new Date().toISOString();
    
    // 既にウォームアップ済みならスキップ
    if (hasWarmedUp) {
      // eslint-disable-next-line no-console
      console.log(`[${timestamp}] [ServerWarmup] 既にウォームアップ済みのためスキップ`);
      return;
    }

    // 既にウォームアップ実行中ならスキップ
    if (isWarmingUp) {
      // eslint-disable-next-line no-console
      console.log(`[${timestamp}] [ServerWarmup] ウォームアップ実行中のためスキップ`);
      return;
    }

    // eslint-disable-next-line no-console
    console.log(`[${timestamp}] [ServerWarmup] ウォームアップ開始`);

    // Promiseを保存（解析開始時に待つため）
    warmupPromise = (async () => {
      try {
        isWarmingUp = true;
        const startTime = Date.now();
        await healthCheck();
        const duration = Date.now() - startTime;
        
        // 成功時のみ完了フラグを立てる
        hasWarmedUp = true;
        
        const completeTimestamp = new Date().toISOString();
        // eslint-disable-next-line no-console
        console.log(`[${completeTimestamp}] [ServerWarmup] ウォームアップ完了（所要時間: ${duration}ms）`);
      } catch (error) {
        // 失敗時はフラグをリセットして再試行を許可
        const errorTimestamp = new Date().toISOString();
        console.warn(`[${errorTimestamp}] [ServerWarmup] ウォームアップ失敗（解析処理には影響しません）:`, error);
      } finally {
        isWarmingUp = false;
        warmupPromise = null;
      }
    })();
  }, []);

  /**
   * ウォームアップの完了を待つ
   * - ウォームアップが実行中の場合は完了まで待つ
   * - ウォームアップが実行されていない、または既に完了している場合は即座に返る
   */
  const waitForWarmup = useCallback(async () => {
  warmupPromise = null;
    if (warmupPromise) {
      const timestamp = new Date().toISOString();
      // eslint-disable-next-line no-console
      console.log(`[${timestamp}] [ServerWarmup] ウォームアップ完了を待機中...`);
      await warmupPromise;
    }
  }, []);

  return { warmup, waitForWarmup };
}

/**
 * テスト用: ウォームアップフラグをリセットする
 * @internal
 */
export function resetWarmupFlag() {
  hasWarmedUp = false;
  isWarmingUp = false;
}

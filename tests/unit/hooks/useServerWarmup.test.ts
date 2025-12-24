import { healthCheck } from '@/lib/api';
import { renderHook } from '@testing-library/react';
import { useServerWarmup, resetWarmupFlag } from '@/hooks/useServerWarmup';

// healthCheck関数をモック
jest.mock('@/lib/api', () => ({
  healthCheck: jest.fn(),
}));

const mockHealthCheck = healthCheck as jest.MockedFunction<typeof healthCheck>;

describe('useServerWarmup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 各テストの前にウォームアップフラグをリセット
    resetWarmupFlag();
    // コンソール出力をモック（テスト出力をクリーンに保つ）
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('warmup', () => {
    it('初回呼び出しでヘルスチェックを実行する', async () => {
      mockHealthCheck.mockResolvedValueOnce({ status: 'ok' });

      const { result } = renderHook(() => useServerWarmup());

      result.current.warmup();

      // waitForWarmup()を使ってウォームアップの完了を待つ
      await result.current.waitForWarmup();

      expect(mockHealthCheck).toHaveBeenCalledTimes(1);
    });

    it('2回目以降の呼び出しではヘルスチェックをスキップする', async () => {
      mockHealthCheck.mockResolvedValue({ status: 'ok' });

      const { result } = renderHook(() => useServerWarmup());

      // 1回目
      result.current.warmup();
      await result.current.waitForWarmup();
      expect(mockHealthCheck).toHaveBeenCalledTimes(1);

      // 2回目
      result.current.warmup();
      await result.current.waitForWarmup();
      expect(mockHealthCheck).toHaveBeenCalledTimes(1); // 増えない

      // 3回目
      result.current.warmup();
      await result.current.waitForWarmup();
      expect(mockHealthCheck).toHaveBeenCalledTimes(1); // 増えない
    });

    it('エラー時も例外をスローせず、再試行を許可する', async () => {
      mockHealthCheck
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce({ status: 'ok' });

      const { result } = renderHook(() => useServerWarmup());

      // エラーが発生してもwarmup()は同期的に実行される（silent fail）
      result.current.warmup();
      await result.current.waitForWarmup();

      expect(mockHealthCheck).toHaveBeenCalledTimes(1);

      // 2回目の呼び出しで再試行される（エラー後はフラグがリセットされる）
      result.current.warmup();
      await result.current.waitForWarmup();
      expect(mockHealthCheck).toHaveBeenCalledTimes(2);
    });

    it('複数のコンポーネントで同じフックインスタンスを使用した場合、グローバルに1回だけ実行される', async () => {
      mockHealthCheck.mockResolvedValue({ status: 'ok' });

      const { result: result1 } = renderHook(() => useServerWarmup());
      const { result: result2 } = renderHook(() => useServerWarmup());

      // 1つ目のインスタンスで実行
      result1.current.warmup();
      await result1.current.waitForWarmup();
      expect(mockHealthCheck).toHaveBeenCalledTimes(1);

      // 2つ目のインスタンスでも実行しようとするが、スキップされる
      result2.current.warmup();
      await result2.current.waitForWarmup();
      expect(mockHealthCheck).toHaveBeenCalledTimes(1); // 増えない

      // 1つ目のインスタンスで再度実行してもスキップされる
      result1.current.warmup();
      await result1.current.waitForWarmup();
      expect(mockHealthCheck).toHaveBeenCalledTimes(1); // 増えない
    });
  });
});

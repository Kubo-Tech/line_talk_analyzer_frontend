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

      await result.current.warmup();

      expect(mockHealthCheck).toHaveBeenCalledTimes(1);
    });

    it('2回目以降の呼び出しではヘルスチェックをスキップする', async () => {
      mockHealthCheck.mockResolvedValue({ status: 'ok' });

      const { result } = renderHook(() => useServerWarmup());

      // 1回目
      await result.current.warmup();
      expect(mockHealthCheck).toHaveBeenCalledTimes(1);

      // 2回目
      await result.current.warmup();
      expect(mockHealthCheck).toHaveBeenCalledTimes(1); // 増えない

      // 3回目
      await result.current.warmup();
      expect(mockHealthCheck).toHaveBeenCalledTimes(1); // 増えない
    });

    it('エラー時も例外をスローせず、再試行を許可する', async () => {
      mockHealthCheck
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce({ status: 'ok' });

      const { result } = renderHook(() => useServerWarmup());

      // エラーが発生してもPromiseは正常に解決される（silent fail）
      await expect(result.current.warmup()).resolves.toBeUndefined();

      expect(mockHealthCheck).toHaveBeenCalledTimes(1);

      // 2回目の呼び出しで再試行される（エラー後はフラグがリセットされる）
      await result.current.warmup();
      expect(mockHealthCheck).toHaveBeenCalledTimes(2);
    });

    it('複数のコンポーネントで同じフックインスタンスを使用した場合、グローバルに1回だけ実行される', async () => {
      mockHealthCheck.mockResolvedValue({ status: 'ok' });

      const { result: result1 } = renderHook(() => useServerWarmup());
      const { result: result2 } = renderHook(() => useServerWarmup());

      // 1つ目のインスタンスで実行
      await result1.current.warmup();
      expect(mockHealthCheck).toHaveBeenCalledTimes(1);

      // 2つ目のインスタンスでも実行しようとするが、スキップされる
      await result2.current.warmup();
      expect(mockHealthCheck).toHaveBeenCalledTimes(1); // 増えない

      // 1つ目のインスタンスで再度実行してもスキップされる
      await result1.current.warmup();
      expect(mockHealthCheck).toHaveBeenCalledTimes(1); // 増えない
    });
  });

  describe('開発環境でのログ出力', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (process.env as any).NODE_ENV = originalEnv;
    });

    it('開発環境では成功時にログを出力する', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (process.env as any).NODE_ENV = 'development';
      mockHealthCheck.mockResolvedValueOnce({ status: 'ok' });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { result } = renderHook(() => useServerWarmup());
      await result.current.warmup();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ServerWarmup] ウォームアップ開始')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[ServerWarmup\] ウォームアップ完了.*ms/)
      );

      consoleSpy.mockRestore();
    });

    it('開発環境ではスキップ時にログを出力する', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (process.env as any).NODE_ENV = 'development';
      mockHealthCheck.mockResolvedValue({ status: 'ok' });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { result } = renderHook(() => useServerWarmup());

      // 1回目
      await result.current.warmup();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ServerWarmup] ウォームアップ開始')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[ServerWarmup\] ウォームアップ完了.*ms/)
      );

      consoleSpy.mockClear();

      // 2回目（スキップ）
      await result.current.warmup();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ServerWarmup] 既にウォームアップ済みのためスキップ')
      );

      consoleSpy.mockRestore();
    });

    it('開発環境ではエラー時に警告を出力する', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (process.env as any).NODE_ENV = 'development';
      const error = new Error('Network Error');
      mockHealthCheck.mockRejectedValueOnce(error);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useServerWarmup());
      await result.current.warmup();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ServerWarmup] ウォームアップ失敗（解析処理には影響しません）:'),
        error
      );

      consoleSpy.mockRestore();
    });

    it('本番環境でもデバッグのためログを出力する', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (process.env as any).NODE_ENV = 'production';
      mockHealthCheck.mockResolvedValueOnce({ status: 'ok' });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const { result } = renderHook(() => useServerWarmup());
      await result.current.warmup();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ServerWarmup] ウォームアップ開始')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[ServerWarmup\] ウォームアップ完了.*ms/)
      );

      consoleSpy.mockRestore();
    });
  });
});

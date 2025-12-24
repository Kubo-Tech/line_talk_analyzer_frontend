/**
 * 統合テスト: サーバーウォームアップ機能
 *
 * ファイルアップロードやプライバシーポリシー表示時に
 * サーバーがウォームアップされることを確認
 */

import { healthCheck } from '@/lib/api';
import { useFileUpload } from '@/hooks/useFileUpload';
import { resetWarmupFlag } from '@/hooks/useServerWarmup';
import { renderHook, act } from '@testing-library/react';

// healthCheck関数をモック
jest.mock('@/lib/api', () => ({
  healthCheck: jest.fn(),
}));

const mockHealthCheck = healthCheck as jest.MockedFunction<typeof healthCheck>;

describe('サーバーウォームアップ統合テスト', () => {
  beforeEach(() => {
    // 各テストの前にウォームアップフラグをリセット
    resetWarmupFlag();
    // モックをクリアしてから設定
    jest.clearAllMocks();
    // デフォルトで成功するようにモック設定（各テストで上書き可能）
    mockHealthCheck.mockResolvedValue({ status: 'ok' });
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('ファイルアップロード時のウォームアップ', () => {
    it('ファイル選択成功時にウォームアップが実行される', async () => {
      mockHealthCheck.mockResolvedValueOnce({ status: 'ok' });

      const { result } = renderHook(() => useFileUpload());

      // ファイルを選択
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      act(() => {
        result.current.validateAndSetFile(file);
      });

      // ウォームアップが実行されることを確認
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockHealthCheck).toHaveBeenCalledTimes(1);
      expect(result.current.file).toBe(file);
    });

    it('不正なファイル選択時はウォームアップが実行されない', async () => {
      mockHealthCheck.mockResolvedValueOnce({ status: 'ok' });

      const { result } = renderHook(() => useFileUpload());

      // 不正なファイルを選択（.pdf）
      const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

      act(() => {
        result.current.validateAndSetFile(file);
      });

      // ウォームアップは実行されない
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockHealthCheck).not.toHaveBeenCalled();
      expect(result.current.file).toBeNull();
      expect(result.current.error).toBeTruthy();
    });

    it('ウォームアップ失敗時もファイル選択処理は正常に完了する', async () => {
      mockHealthCheck.mockRejectedValueOnce(new Error('Network Error'));

      const { result } = renderHook(() => useFileUpload());

      // ファイルを選択
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      act(() => {
        result.current.validateAndSetFile(file);
      });

      // ウォームアップは実行される（失敗する）
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(mockHealthCheck).toHaveBeenCalledTimes(1);

      // ファイル選択処理は正常に完了
      expect(result.current.file).toBe(file);
      expect(result.current.error).toBeNull();
    });
  });
});

/**
 * useAnalyze フックのテスト
 */

import { useAnalyze } from '@/hooks/useAnalyze';
import * as api from '@/lib/api';
import { AnalysisResponse, AnalyzeRequestParams } from '@/types/api';
import { act, renderHook, waitFor } from '@testing-library/react';

// APIモジュールをモック
jest.mock('@/lib/api');

const mockAnalyzeFile = api.analyzeFile as jest.MockedFunction<typeof api.analyzeFile>;

describe('useAnalyze', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('初期状態', () => {
    it('初期状態が正しく設定されている', () => {
      const { result } = renderHook(() => useAnalyze());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.result).toBeNull();
      expect(typeof result.current.analyze).toBe('function');
      expect(typeof result.current.resetError).toBe('function');
    });
  });

  describe('analyze関数', () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
    const params: AnalyzeRequestParams = { file: mockFile };

    const mockResponse: AnalysisResponse = {
      status: 'success',
      data: {
        analysis_period: {
          start_date: '2024-01-01',
          end_date: '2024-12-31',
        },
        total_messages: 100,
        total_users: 2,
        morphological_analysis: {
          top_words: [
            {
              word: 'テスト',
              count: 10,
              part_of_speech: '名詞',
              appearances: [
                {
                  date: '2024-01-01T00:00:00',
                  user: 'ユーザー1',
                  message: 'テストメッセージ',
                },
              ],
            },
          ],
        },
        full_message_analysis: {
          top_messages: [
            {
              message: 'こんにちは',
              count: 5,
              appearances: [
                {
                  date: '2024-01-01T00:00:00',
                  user: 'ユーザー1',
                  message: 'こんにちは',
                },
              ],
            },
          ],
        },
        user_analysis: {
          word_analysis: [],
          message_analysis: [],
        },
      },
    };

    it('正常系: 解析が成功する', async () => {
      mockAnalyzeFile.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAnalyze());

      let response: AnalysisResponse | null = null;
      await act(async () => {
        response = await result.current.analyze(params);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockAnalyzeFile).toHaveBeenCalledWith(params);
      expect(result.current.result).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
      expect(response).toEqual(mockResponse);
    });

    it('ローディング状態が正しく変化する', async () => {
      mockAnalyzeFile.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockResponse), 100);
          })
      );

      const { result } = renderHook(() => useAnalyze());

      act(() => {
        result.current.analyze(params);
      });

      // 解析開始直後はローディング中
      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.result).toBeNull();

      // 解析完了後
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.result).toEqual(mockResponse);
      expect(result.current.error).toBeNull();
    });

    it('エラー時に適切にエラーメッセージを設定する', async () => {
      const errorMessage = 'ファイルが大きすぎます';
      mockAnalyzeFile.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAnalyze());

      let response: AnalysisResponse | null | undefined;
      await act(async () => {
        response = await result.current.analyze(params);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.result).toBeNull();
      expect(response).toBeNull();
    });

    it('エラーがError型でない場合、デフォルトメッセージを設定する', async () => {
      mockAnalyzeFile.mockRejectedValue('Unknown error');

      const { result } = renderHook(() => useAnalyze());

      let response: AnalysisResponse | null | undefined;
      await act(async () => {
        response = await result.current.analyze(params);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('解析中にエラーが発生しました');
      expect(result.current.result).toBeNull();
      expect(response).toBeNull();
    });

    it('複数回の解析で状態が正しくリセットされる', async () => {
      // 1回目: 成功
      mockAnalyzeFile.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAnalyze());

      await act(async () => {
        await result.current.analyze(params);
      });

      expect(result.current.result).toEqual(mockResponse);
      expect(result.current.error).toBeNull();

      // 2回目: エラー
      const errorMessage = 'ネットワークエラー';
      mockAnalyzeFile.mockRejectedValueOnce(new Error(errorMessage));

      await act(async () => {
        await result.current.analyze(params);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 2回目の解析でエラーになった場合、結果はクリアされる
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('resetError関数', () => {
    it('エラーをリセットする', async () => {
      const errorMessage = 'テストエラー';
      mockAnalyzeFile.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAnalyze());

      // エラーを発生させる
      await act(async () => {
        await result.current.analyze({ file: new File(['test'], 'test.txt') });
      });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
      });

      // エラーをリセット
      act(() => {
        result.current.resetError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});

/**
 * useAnalyze フックのテスト
 */

import { useAnalyze } from '@/hooks/useAnalyze';
import * as api from '@/lib/api';
import * as fileUtils from '@/lib/fileUtils';
import { AnalysisResponse, AnalyzeRequestParams } from '@/types/api';
import { act, renderHook, waitFor } from '@testing-library/react';

// APIモジュールをモック
jest.mock('@/lib/api');
jest.mock('@/lib/fileUtils');

const mockAnalyzeFile = api.analyzeFile as jest.MockedFunction<typeof api.analyzeFile>;
const mockExtractWithStats = fileUtils.extractWithStats as jest.MockedFunction<
  typeof fileUtils.extractWithStats
>;

describe('useAnalyze', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('初期状態', () => {
    it('初期状態が正しく設定されている', () => {
      const { result } = renderHook(() => useAnalyze());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.statusMessage).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.result).toBeNull();
      expect(result.current.extractionStats).toBeNull();
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

    it('期間指定がある場合、ファイル抽出処理を実行する', async () => {
      const mockFileContent = `[LINE] テストのトーク履歴
保存日時：2024/08/01 00:00

2024/08/01(木)
22:12	user1	メッセージ1`;

      const extractedContent = `[LINE] テストのトーク履歴
保存日時：2024/08/01 00:00

2024/08/01(木)
22:12	user1	メッセージ1`;

      // File.text()メソッドを持つモックオブジェクトを作成
      const mockFile = {
        text: jest.fn().mockResolvedValue(mockFileContent),
        name: 'test.txt',
        type: 'text/plain',
      } as unknown as File;

      const paramsWithDate: AnalyzeRequestParams = {
        file: mockFile,
        start_date: '2024-08-01 00:00:00',
        end_date: '2024-08-31 23:59:59',
      };

      mockExtractWithStats.mockReturnValue({
        content: extractedContent,
        originalMessageCount: 100,
        extractedMessageCount: 50,
      });

      mockAnalyzeFile.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAnalyze());

      await act(async () => {
        await result.current.analyze(paramsWithDate);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockExtractWithStats).toHaveBeenCalled();
      expect(result.current.extractionStats).toEqual({
        originalMessageCount: 100,
        extractedMessageCount: 50,
      });
      expect(result.current.result).toEqual(mockResponse);
    });

    it('抽出されたメッセージが0件の場合、エラーを返す', async () => {
      const mockFileContent = `[LINE] テストのトーク履歴
保存日時：2024/08/01 00:00

2024/07/01(月)
22:12	user1	メッセージ1`;

      // File.text()メソッドを持つモックオブジェクトを作成
      const mockFile = {
        text: jest.fn().mockResolvedValue(mockFileContent),
        name: 'test.txt',
        type: 'text/plain',
      } as unknown as File;

      const paramsWithDate: AnalyzeRequestParams = {
        file: mockFile,
        start_date: '2024-08-01 00:00:00',
        end_date: '2024-08-31 23:59:59',
      };

      mockExtractWithStats.mockReturnValue({
        content: '',
        originalMessageCount: 100,
        extractedMessageCount: 0,
      });

      const { result } = renderHook(() => useAnalyze());

      await act(async () => {
        await result.current.analyze(paramsWithDate);
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe('指定された期間にメッセージが見つかりませんでした。');
      expect(result.current.result).toBeNull();
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

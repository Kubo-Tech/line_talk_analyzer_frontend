/**
 * APIクライアントのテスト
 */

import { analyzeFile, ApiError, healthCheck } from '@/lib/api';
import { API_CONFIG, ERROR_MESSAGES } from '@/lib/constants';

// fetchのモック
global.fetch = jest.fn();

describe('APIクライアント', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('healthCheck', () => {
    it('正常系: ヘルスチェックが成功する', async () => {
      const mockResponse = { status: 'ok' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await healthCheck();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`,
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('異常系: HTTPエラーレスポンスの場合、ApiErrorをスローする', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      await expect(healthCheck()).rejects.toThrow(ApiError);
    });

    it('異常系: ネットワークエラーの場合、ApiErrorをスローする', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(healthCheck()).rejects.toThrow(ApiError);
      await expect(healthCheck()).rejects.toThrow(ERROR_MESSAGES.NETWORK_ERROR);
    });
  });

  describe('analyzeFile', () => {
    const mockFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

    it('正常系: ファイル解析リクエストが成功する', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          analysis_period: {
            start_date: '2024-01-01',
            end_date: '2024-12-31',
          },
          total_messages: 1000,
          total_users: 2,
          morphological_analysis: {
            top_words: [],
          },
          full_message_analysis: {
            top_messages: [],
          },
          user_analysis: {
            word_analysis: [],
            message_analysis: [],
          },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await analyzeFile({ file: mockFile });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE}`,
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('正常系: オプションパラメータが正しく送信される', async () => {
      const mockResponse = {
        status: 'success',
        data: {
          analysis_period: { start_date: '2024-01-01', end_date: '2024-12-31' },
          total_messages: 1000,
          total_users: 2,
          morphological_analysis: { top_words: [] },
          full_message_analysis: { top_messages: [] },
          user_analysis: { word_analysis: [], message_analysis: [] },
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await analyzeFile({
        file: mockFile,
        top_n: 50,
        min_word_length: 2,
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const formData = callArgs[1].body as FormData;

      expect(formData.get('file')).toBe(mockFile);
      expect(formData.get('top_n')).toBe('50');
      expect(formData.get('min_word_length')).toBe('2');
      expect(formData.get('start_date')).toBe('2024-01-01');
      expect(formData.get('end_date')).toBe('2024-12-31');
    });

    it('異常系: エラーレスポンスの場合、ApiErrorをスローする', async () => {
      const errorResponse = {
        status: 'error',
        error: {
          code: 'INVALID_FILE',
          message: 'Invalid file format',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      });

      await expect(analyzeFile({ file: mockFile })).rejects.toThrow(ApiError);
    });

    it('異常系: ネットワークエラーの場合、ApiErrorをスローする', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Network error'));

      await expect(analyzeFile({ file: mockFile })).rejects.toThrow(ApiError);
      await expect(analyzeFile({ file: mockFile })).rejects.toThrow(ERROR_MESSAGES.NETWORK_ERROR);
    });

    it('異常系: タイムアウト時にエラーをスローする', async () => {
      // AbortErrorをシミュレート（タイムアウト時にfetchがスローするエラー）
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';

      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

      const error = await analyzeFile({ file: mockFile }).catch((e) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe(ERROR_MESSAGES.TIMEOUT_ERROR);
      expect(error.code).toBe('TIMEOUT');
    });
  });
});

/**
 * APIクライアント
 * バックエンドAPIとの通信を行う関数群
 */

import {
  AnalysisResponse,
  AnalyzeRequestParams,
  ErrorResponse,
  HealthCheckResponse,
} from '@/types/api';
import { API_CONFIG, ERROR_MESSAGES } from './constants';

/**
 * カスタムエラークラス
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * タイムアウト付きfetchラッパー
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = API_CONFIG.TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(ERROR_MESSAGES.TIMEOUT_ERROR, 'TIMEOUT');
    }
    if (error instanceof TypeError) {
      throw new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 'NETWORK_ERROR');
    }
    throw error;
  }
}

/**
 * エラーレスポンスの処理
 */
function handleErrorResponse(response: Response, data: ErrorResponse): never {
  throw new ApiError(
    data.error.message || ERROR_MESSAGES.API_ERROR,
    data.error.code,
    response.status
  );
}

/**
 * ヘルスチェック
 */
export async function healthCheck(): Promise<HealthCheckResponse> {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`;
    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new ApiError(ERROR_MESSAGES.API_ERROR, 'HEALTH_CHECK_FAILED', response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 'NETWORK_ERROR');
    }
    throw new ApiError(ERROR_MESSAGES.UNKNOWN_ERROR, 'UNKNOWN_ERROR');
  }
}

/**
 * トーク履歴ファイルを解析
 */
export async function analyzeFile(params: AnalyzeRequestParams): Promise<AnalysisResponse> {
  try {
    const formData = new FormData();
    formData.append('file', params.file);

    // オプションパラメータの追加
    if (params.top_n !== undefined) {
      formData.append('top_n', params.top_n.toString());
    }
    if (params.min_word_length !== undefined) {
      formData.append('min_word_length', params.min_word_length.toString());
    }
    if (params.max_word_length !== undefined) {
      formData.append('max_word_length', params.max_word_length.toString());
    }
    if (params.min_message_length !== undefined) {
      formData.append('min_message_length', params.min_message_length.toString());
    }
    if (params.max_message_length !== undefined) {
      formData.append('max_message_length', params.max_message_length.toString());
    }
    if (params.start_date) {
      formData.append('start_date', params.start_date);
    }
    if (params.end_date) {
      formData.append('end_date', params.end_date);
    }

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE}`;
    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: formData,
    });

    const data: AnalysisResponse | ErrorResponse = await response.json();

    if (!response.ok || data.status === 'error') {
      handleErrorResponse(response, data as ErrorResponse);
    }

    return data as AnalysisResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 'NETWORK_ERROR');
    }
    throw new ApiError(ERROR_MESSAGES.UNKNOWN_ERROR, 'UNKNOWN_ERROR');
  }
}

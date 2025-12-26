/**
 * API型定義
 * バックエンドAPIのリクエスト・レスポンス型
 */

/**
 * 解析APIリクエストパラメータ
 */
export interface AnalyzeRequestParams {
  file: File;
  top_n?: number;
  min_word_length?: number;
  max_word_length?: number;
  min_message_length?: number;
  max_message_length?: number;
  min_word_count?: number;
  min_message_count?: number;
  start_date?: string;
  end_date?: string;
}

/**
 * 流行語（単語）
 */
export interface TopWord {
  word: string;
  count: number;
  part_of_speech: string;
}

/**
 * 流行メッセージ
 */
export interface TopMessage {
  message: string;
  count: number;
}

/**
 * ユーザー別単語解析結果
 */
export interface UserWordAnalysis {
  user: string;
  top_words: TopWord[];
}

/**
 * ユーザー別メッセージ解析結果
 */
export interface UserMessageAnalysis {
  user: string;
  top_messages: TopMessage[];
}

/**
 * 解析APIレスポンス（成功時）
 */
export interface AnalysisResponse {
  status: 'success';
  data: {
    analysis_period: {
      start_date: string;
      end_date: string;
    };
    total_messages: number;
    total_users: number;
    morphological_analysis: {
      top_words: TopWord[];
    };
    full_message_analysis: {
      top_messages: TopMessage[];
    };
    user_analysis: {
      word_analysis: UserWordAnalysis[];
      message_analysis: UserMessageAnalysis[];
    };
  };
}

/**
 * エラーレスポンス
 */
export interface ErrorResponse {
  status: 'error';
  error: {
    code: string;
    message: string;
  };
}

/**
 * ヘルスチェックレスポンス
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  message?: string;
}

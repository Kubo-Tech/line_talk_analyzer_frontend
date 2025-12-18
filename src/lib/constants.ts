/**
 * アプリケーション定数
 */

/**
 * API関連の定数
 */
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  ENDPOINTS: {
    HEALTH: '/api/v1/health',
    ANALYZE: '/api/v1/analyze',
  },
  TIMEOUT: 300000, // 5分（解析に時間がかかる可能性があるため）
} as const;

/**
 * ファイルアップロード関連の定数
 */
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_FILE_TYPES: ['.txt'] as const,
  ACCEPT_ATTRIBUTE: '.txt,text/plain',
} as const;

/**
 * 解析パラメータのデフォルト値
 */
export const ANALYSIS_DEFAULTS = {
  TOP_N: 100,
  MIN_WORD_LENGTH: 1,
  MIN_MESSAGE_LENGTH: 2,
} as const;

/**
 * ランキング表示関連の定数
 */
export const RANKING_DISPLAY = {
  INITIAL_DISPLAY_COUNT: 10,
  MAX_DISPLAY_COUNT: 100,
} as const;

/**
 * エラーメッセージ
 */
export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: 'ファイルサイズが大きすぎます。50MB以下のファイルを選択してください。',
  INVALID_FILE_TYPE: 'テキストファイル（.txt）のみアップロード可能です。',
  NETWORK_ERROR: 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
  API_ERROR: '解析中にエラーが発生しました。しばらく時間をおいて再度お試しください。',
  TIMEOUT_ERROR: '処理がタイムアウトしました。ファイルサイズを確認して再度お試しください。',
  UNKNOWN_ERROR: '予期しないエラーが発生しました。',
} as const;

/**
 * アプリケーション情報
 */
export const APP_INFO = {
  NAME: 'LINE流行語大賞',
  YEAR: 2024,
  VERSION: '1.0.0',
  GITHUB_REPO_FRONTEND: 'https://github.com/Kubo-Tech/line_talk_analyzer_frontend',
  GITHUB_REPO_BACKEND: 'https://github.com/Kubo-Tech/line_talk_analyzer_backend',
} as const;

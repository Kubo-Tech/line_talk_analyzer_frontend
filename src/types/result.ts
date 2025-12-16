/**
 * 結果データ型
 * フロントエンドで使用する整形済みデータの型定義
 */

import { TopMessage, TopWord } from './api';

/**
 * ランキングアイテム（共通）
 */
export interface RankingItem {
  rank: number;
  text: string;
  count: number;
}

/**
 * 単語ランキングアイテム
 */
export interface WordRankingItem extends RankingItem {
  partOfSpeech: string;
}

/**
 * メッセージランキングアイテム（基本のRankingItemと同じ）
 */
export type MessageRankingItem = RankingItem;

/**
 * 解析期間
 */
export interface AnalysisPeriod {
  startDate: string;
  endDate: string;
  formatted: string; // 表示用フォーマット済み文字列
}

/**
 * ユーザー別ランキングデータ
 */
export interface UserRankingData {
  user: string;
  words: WordRankingItem[];
  messages: MessageRankingItem[];
}

/**
 * 解析結果サマリー
 */
export interface ResultSummary {
  period: AnalysisPeriod;
  totalMessages: number;
  totalUsers: number;
}

/**
 * フロントエンド用の解析結果データ
 */
export interface AnalysisResult {
  summary: ResultSummary;
  overall: {
    words: WordRankingItem[];
    messages: MessageRankingItem[];
  };
  byUser: UserRankingData[];
}

/**
 * API ResponseからAnalysisResultへの変換ヘルパー型
 */
export interface ResultConverter {
  convertWords: (words: TopWord[]) => WordRankingItem[];
  convertMessages: (messages: TopMessage[]) => MessageRankingItem[];
}

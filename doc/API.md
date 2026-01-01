# API連携

## バックエンドAPI

| エンドポイント    | メソッド | 説明           |
| ----------------- | -------- | -------------- |
| `/api/v1/health`  | GET      | ヘルスチェック |
| `/api/v1/analyze` | POST     | トーク履歴解析 |

## 解析APIリクエスト

```typescript
// POST /api/v1/analyze
// Content-Type: multipart/form-data

interface AnalyzeRequestParams {
  file: File; // LINEトーク履歴ファイル（.txt形式、最大50MB）
  top_n?: number; // 取得する上位件数（デフォルト: 50）
  min_word_length?: number; // 最小単語長（デフォルト: 1）
  max_word_length?: number; // 最大単語長（デフォルト: 無制限）
  min_message_length?: number; // 最小メッセージ長（デフォルト: 2）
  max_message_length?: number; // 最大メッセージ長（デフォルト: 無制限）
  min_word_count?: number; // 最小単語出現回数（デフォルト: 2）
  min_message_count?: number; // 最小メッセージ出現回数（デフォルト: 2）
  start_date?: string; // 解析開始日時（YYYY-MM-DD または YYYY-MM-DD HH:MM:SS 形式、デフォルト: 今年の1月1日）
  end_date?: string; // 解析終了日時（YYYY-MM-DD または YYYY-MM-DD HH:MM:SS 形式、デフォルト: 今年の12月31日）
}
```

**パラメータ詳細**:

| パラメータ | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| `file` | File | ✅ | - | LINEトーク履歴ファイル（.txt形式、最大50MB） |
| `top_n` | number | ❌ | 50 | 各ランキングで取得する上位件数（1〜1000） |
| `min_word_length` | number | ❌ | 1 | 集計対象とする単語の最小文字数 |
| `max_word_length` | number | ❌ | 無制限 | 集計対象とする単語の最大文字数 |
| `min_message_length` | number | ❌ | 2 | 集計対象とするメッセージの最小文字数 |
| `max_message_length` | number | ❌ | 無制限 | 集計対象とするメッセージの最大文字数 |
| `min_word_count` | number | ❌ | 2 | ランキングに表示する単語の最小出現回数 |
| `min_message_count` | number | ❌ | 2 | ランキングに表示するメッセージの最小出現回数 |
| `start_date` | string | ❌ | 今年の1月1日 | 解析開始日時（YYYY-MM-DD または YYYY-MM-DD HH:MM:SS） |
| `end_date` | string | ❌ | 今年の12月31日 | 解析終了日時（YYYY-MM-DD または YYYY-MM-DD HH:MM:SS） |

## 解析APIレスポンス

```typescript
interface AnalysisResponse {
  status: 'success';
  data: {
    analysis_period: {
      start_date: string; // "YYYY-MM-DD"
      end_date: string; // "YYYY-MM-DD"
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

interface TopWord {
  word: string;
  count: number;
  part_of_speech: string;
}

interface TopMessage {
  message: string;
  count: number;
}

interface UserWordAnalysis {
  user: string;
  top_words: TopWord[];
}

interface UserMessageAnalysis {
  user: string;
  top_messages: TopMessage[];
}
```

## エラーレスポンス

```typescript
interface ErrorResponse {
  status: 'error';
  error: {
    code: string;
    message: string;
  };
}
```
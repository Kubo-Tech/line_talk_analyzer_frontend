# LINEトーク履歴解析フロントエンド 仕様書

## 1. 概要

本プロジェクトは、LINEのトーク履歴を解析し、1年間の流行語大賞を表示するスマホ用Webアプリケーションのフロントエンドです。

### 1.1 主な機能

- LINEトーク履歴ファイル（.txt形式）のアップロード
- バックエンドAPIとの連携による解析処理
- 流行語大賞・流行メッセージ大賞のランキング表示
- ユーザー別ランキングの表示
- Apple Music風のアニメーション演出による結果発表
- プライバシーポリシーの表示と同意機能
- トーク履歴生成方法のヘルプページ

### 1.2 技術スタック

- **言語**: TypeScript 5.x
- **フレームワーク**: Next.js 14+ (App Router)
- **UIライブラリ**: React 18+
- **スタイリング**: Tailwind CSS 3.x
- **アニメーション**: Framer Motion
- **HTTP クライアント**: fetch API (Next.js built-in)
- **テストフレームワーク**: Jest + React Testing Library
- **E2Eテスト**: Playwright
- **リンター/フォーマッター**: ESLint, Prettier
- **パッケージマネージャ**: npm

### 1.3 対応環境

- **ブラウザ**: Chrome, Safari, Edge（最新版）
- **デバイス**: スマートフォン（iOS/Android）を主対象、PCでも利用可能
- **画面幅**: 320px〜428px を主対象（レスポンシブ対応）

---

## 2. システムアーキテクチャ

```
[ユーザー] → [Next.js Frontend] → [FastAPI Backend]
                    ↓
            [結果表示・アニメーション]
```

### 2.1 ディレクトリ構成

```
line_talk_analyzer_frontend/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # ルートレイアウト
│   │   ├── page.tsx                # トップページ
│   │   ├── globals.css             # グローバルスタイル
│   │   ├── result/
│   │   │   └── page.tsx            # 結果表示ページ
│   │   ├── help/
│   │   │   └── page.tsx            # ヘルプページ
│   │   └── privacy/
│   │       └── page.tsx            # プライバシーポリシーページ
│   ├── components/                 # 共通コンポーネント
│   │   ├── common/                 # 汎用コンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── Modal.tsx
│   │   ├── upload/                 # アップロード関連
│   │   │   ├── FileUploader.tsx
│   │   │   ├── DropZone.tsx
│   │   │   └── PrivacyConsent.tsx
│   │   ├── result/                 # 結果表示関連
│   │   │   ├── RankingList.tsx
│   │   │   ├── RankingItem.tsx
│   │   │   ├── UserTabs.tsx
│   │   │   └── ResultSummary.tsx
│   │   └── animation/              # アニメーション関連
│   │       ├── StoryPresentation.tsx
│   │       ├── RankingReveal.tsx
│   │       ├── CountdownNumber.tsx
│   │       └── Confetti.tsx
│   ├── hooks/                      # カスタムフック
│   │   ├── useAnalyze.ts
│   │   ├── useFileUpload.ts
│   │   └── usePrivacyConsent.ts
│   ├── lib/                        # ユーティリティ
│   │   ├── api.ts                  # API クライアント
│   │   └── constants.ts            # 定数
│   ├── types/                      # 型定義
│   │   ├── api.ts                  # API レスポンス型
│   │   └── result.ts               # 結果データ型
│   └── stores/                     # 状態管理（必要に応じて）
│       └── resultStore.ts
├── public/
│   └── images/                     # 静的画像
├── tests/
│   ├── unit/                       # ユニットテスト
│   ├── integration/                # 統合テスト
│   └── e2e/                        # E2Eテスト
├── doc/
│   ├── SPEC.md                     # 本仕様書
│   └── PR/                         # PR仕様書
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
├── playwright.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── package.json
└── README.md
```

---

## 3. 画面設計

### 3.1 画面一覧

| 画面名               | パス       | 説明                     |
| -------------------- | ---------- | ------------------------ |
| トップページ         | `/`        | ファイルアップロード画面 |
| 結果表示ページ       | `/result`  | 解析結果の表示           |
| ヘルプページ         | `/help`    | トーク履歴の取得方法     |
| プライバシーポリシー | `/privacy` | プライバシーポリシー全文 |

### 3.2 トップページ（`/`）

#### 3.2.1 構成要素

```
┌─────────────────────────────┐
│         Header              │
│    LINE流行語大賞 2025      │
├─────────────────────────────┤
│                             │
│    📁 ファイルアップロード    │
│    ┌─────────────────────┐  │
│    │                     │  │
│    │  ここにファイルを    │  │
│    │  ドロップ または     │  │
│    │  タップして選択      │  │
│    │                     │  │
│    └─────────────────────┘  │
│                             │
│    [トーク履歴の取得方法]   │
│                             │
├─────────────────────────────┤
│    ☑ プライバシーポリシー   │
│      に同意する             │
│    [プライバシーポリシー]   │
├─────────────────────────────┤
│                             │
│    [  解析を開始する  ]     │
│                             │
├─────────────────────────────┤
│         Footer              │
└─────────────────────────────┘
```

#### 3.2.2 機能詳細

1. **ファイルアップロード**
   - ドラッグ&ドロップ対応
   - タップでファイル選択ダイアログを開く
   - `.txt`ファイルのみ受け付け
   - 最大50MBまで対応
   - アップロード後、ファイル名を表示

2. **ヘルプリンク**
   - 「トーク履歴の取得方法」をタップでヘルプページへ遷移

3. **プライバシー同意**
   - チェックボックスで同意を取得
   - 未同意の場合は「解析を開始する」ボタンを無効化
   - プライバシーポリシーへのリンク

4. **解析開始ボタン**
   - ファイル選択済み かつ プライバシー同意済みで有効化
   - タップで解析処理を開始
   - 処理中はローディング表示

### 3.3 結果表示ページ（`/result`）

#### 3.3.1 表示モード

**A. アニメーションモード（初回表示時）**

- Apple Music年間ランキング風のストーリー形式
- スワイプまたは自動再生で進行
- 10位から1位へカウントダウン形式で発表

**B. リストモード（アニメーション後 / スキップ時）**

- 従来のランキングリスト形式で表示
- タブで切り替え可能

#### 3.3.2 リストモード構成

```
┌─────────────────────────────┐
│         Header              │
│    解析結果                 │
├─────────────────────────────┤
│  [全体] [Aさん] [Bさん]...  │  ← ユーザータブ
├─────────────────────────────┤
│  ▼ 流行語大賞 TOP10        │
│  ┌─────────────────────┐   │
│  │ 1. おうち    42回   │   │
│  │ 2. 草      38回   │   │
│  │ 3. ...              │   │
│  └─────────────────────┘   │
│  [もっと見る（100位まで）]  │
├─────────────────────────────┤
│  ▼ 流行メッセージ TOP10    │
│  ┌─────────────────────┐   │
│  │ 1. おうち帰りたい 15回│   │
│  │ 2. 了解！     12回│   │
│  │ 3. ...              │   │
│  └─────────────────────┘   │
│  [もっと見る（100位まで）]  │
├─────────────────────────────┤
│  期間: 2024/01/01〜12/31   │
│  総メッセージ数: 15,000    │
├─────────────────────────────┤
│  [別のファイルを解析]       │
│  [結果をシェア]            │
├─────────────────────────────┤
│         Footer              │
└─────────────────────────────┘
```

#### 3.3.3 機能詳細

1. **ユーザータブ**
   - 「全体」と各発言者のタブを表示
   - タブ切り替えで表示内容を更新
   - 横スクロール対応（発言者が多い場合）

2. **ランキング表示**
   - 順位、ワード/メッセージ、出現回数を表示
   - 初期表示はTOP10
   - 「もっと見る」で100位まで展開

3. **解析情報**
   - 解析期間の表示
   - 総メッセージ数の表示

4. **アクション**
   - 「別のファイルを解析」でトップページへ
   - 「結果をシェア」でSNSシェア（オプション）

### 3.4 ヘルプページ（`/help`）

#### 3.4.1 構成

```
┌─────────────────────────────┐
│         Header              │
│    トーク履歴の取得方法     │
├─────────────────────────────┤
│                             │
│  📱 iPhoneの場合            │
│  1. LINEアプリを開く        │
│  2. トークルームを開く      │
│  3. 右上の「≡」をタップ    │
│  4. 「その他」をタップ      │
│  5. 「トーク履歴を送信」    │
│  6. 「テキストのみ」を選択  │
│  7. ファイルを保存          │
│                             │
│  📱 Androidの場合           │
│  ...                        │
│                             │
├─────────────────────────────┤
│  [トップに戻る]             │
├─────────────────────────────┤
│         Footer              │
└─────────────────────────────┘
```

### 3.5 プライバシーポリシーページ（`/privacy`）

プライバシーポリシーの全文を表示。

---

## 4. API連携

### 4.1 バックエンドAPI

| エンドポイント    | メソッド | 説明           |
| ----------------- | -------- | -------------- |
| `/api/v1/health`  | GET      | ヘルスチェック |
| `/api/v1/analyze` | POST     | トーク履歴解析 |

### 4.2 解析APIリクエスト

```typescript
// POST /api/v1/analyze
// Content-Type: multipart/form-data

interface AnalyzeRequestParams {
  file: File; // LINEトーク履歴ファイル
  top_n?: number; // 取得する上位件数（デフォルト: 100）
  min_word_length?: number; // 最小単語長（デフォルト: 1）
  max_word_length?: number; // 最大単語長（デフォルト: 無制限）
  min_message_length?: number; // 最小メッセージ長（デフォルト: 2）
  max_message_length?: number; // 最大メッセージ長（デフォルト: 無制限）
  start_date?: string; // 解析開始日時（デフォルト：現在時刻を取得し、今年の1月1日に設定）
  end_date?: string; // 解析終了日時（デフォルト：現在時刻を取得し、今年の12月31日に設定）
}
```

### 4.3 解析APIレスポンス

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
  appearances: Appearance[];
}

interface TopMessage {
  message: string;
  count: number;
  appearances: Appearance[];
}

interface Appearance {
  date: string;
  user: string;
  message: string;
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

### 4.4 エラーレスポンス

```typescript
interface ErrorResponse {
  status: 'error';
  error: {
    code: string;
    message: string;
  };
}
```

---

## 5. プライバシー対応・利用規約

### 5.0 重要事項（必須同意項目）

本サービスを利用する前に、以下の事項に同意する必要があります。

#### 5.0.1 サービスの性質

- **本サービスは個人が開発した非公式ツールであり、LINE株式会社およびLINEヤフー株式会社とは一切関係がありません。**
- LINEの公式サービスではなく、LINE社の承認・推奨を受けたものではありません。
- 「LINE」の名称は、LINEアプリのトーク履歴を解析対象とすることを説明する目的でのみ使用しています。

#### 5.0.2 免責事項

本サービスの利用に関して、以下の点をご了承ください：

- **本サービスは「現状有姿」で提供され、明示・黙示を問わず、いかなる保証も行いません。**
- 本サービスの利用により生じた直接的・間接的な損害について、開発者は一切の責任を負いません。
- データの紛失、漏洩、破損等が発生した場合でも、開発者は責任を負いません。
- サービスの中断、終了、変更について、事前の通知なく行う場合があります。
- 解析結果の正確性は保証されません。

#### 5.0.3 利用条件

- 上記の「サービスの性質」および「免責事項」に同意した場合のみ、本サービスを利用できます。
- **同意しない場合は、本サービスを利用することはできません。**
- 未成年の方は、保護者の同意を得た上でご利用ください。

### 5.1 データ処理の透明性

本サービスはオープンソースで開発されており、処理内容を誰でも確認できます。

| リポジトリ                                                                             | 説明           |
| -------------------------------------------------------------------------------------- | -------------- |
| [line_talk_analyzer_frontend](https://github.com/yourname/line_talk_analyzer_frontend) | フロントエンド |
| [line_talk_analyzer_backend](https://github.com/yourname/line_talk_analyzer_backend)   | バックエンド   |

### 5.2 データの取り扱い

#### 5.2.1 サーバー側での処理

| 項目                 | 内容                                                  |
| -------------------- | ----------------------------------------------------- |
| ファイルの保存       | ❌ しない（ディスクに書き込まない）                   |
| データベースへの保存 | ❌ しない（DBを使用しない）                           |
| メモリ上での処理     | ✅ 解析処理中のみ一時的に保持                         |
| 解析後のデータ       | ✅ 即座にメモリから破棄                               |
| アクセスログ         | ✅ IPアドレス・時刻のみ記録（トーク内容は記録しない） |
| 第三者への提供       | ❌ 一切行わない                                       |

#### 5.2.2 通信の保護

- **HTTPS（TLS 1.2以上）** による暗号化通信
- ファイル内容は暗号化された状態で送信
- 通信経路上での盗聴を防止

#### 5.2.3 フロントエンド側での処理

| 項目           | 内容                                          |
| -------------- | --------------------------------------------- |
| LocalStorage   | ❌ トーク内容を保存しない                     |
| Cookie         | ❌ トーク内容を保存しない                     |
| 解析結果の保持 | ✅ ブラウザのメモリ上のみ（ページ離脱で消去） |

### 5.3 同意フロー

1. 利用規約・プライバシーポリシーの全文を確認できるリンクを表示
2. 以下の項目を含む同意チェックボックスを表示：
   - 本サービスがLINE社とは無関係の個人開発であること
   - 免責事項（損害について責任を負わないこと）
   - プライバシーポリシー（データの取り扱い）
3. **「上記すべてに同意する」チェックボックスで明示的な同意を取得**
4. **同意なしでは「解析を開始する」ボタンを無効化（必須）**
5. 解析実行時に最終確認（オプション）

### 5.4 推奨事項（ユーザー向け）

より安心してご利用いただくために、以下を推奨します：

1. **プライベートブラウジング（シークレットモード）の使用**
   - ブラウザの履歴に残らない
   - セッション終了後、一時データが自動削除される
   - 共有端末での利用時に特に有効

2. **解析後の操作**
   - 結果確認後、ブラウザのタブを閉じることでメモリ上のデータも消去
   - 必要に応じてブラウザの履歴を削除

### 5.5 技術的な保証

以下の点は、ソースコードで確認可能です：

```python
# バックエンド: ファイルをメモリ上でのみ処理
content = await file.read()  # メモリに読み込み
result = analyzer.analyze(content)  # 解析処理
# 関数終了時にcontentは自動的にガベージコレクションで破棄
# ディスクへの書き込み処理は存在しない
```

### 5.6 将来的な改善案

- WebAssembly（kuromoji.js等）によるクライアントサイド形態素解析の実装
- ファイルを外部送信せずにブラウザ内で完結する処理
- E2E暗号化の導入検討

---

## 6. アニメーション演出

### 6.1 ストーリー形式の流れ

1. **オープニング**（2秒）
   - タイトル表示「あなたの2025年」
   - フェードイン演出

2. **統計情報**（3秒）
   - 「今年のメッセージ数: 15,000」
   - カウントアップアニメーション

3. **ランキング発表**（各3秒 × 10位）
   - 10位から順に発表
   - 順位がズームインしながら表示
   - ワードがスライドイン
   - 出現回数がカウントアップ

4. **1位発表**（5秒）
   - 特別演出（紙吹雪、光彩効果）
   - 大きく表示

5. **エンディング**
   - 「詳細を見る」ボタン表示
   - リストモードへ遷移

### 6.2 操作

- **スワイプ/タップ**: 次のスライドへ進む
- **長押し**: 一時停止
- **スキップボタン**: アニメーションをスキップしてリストモードへ

---

## 7. テスト計画

### 7.1 テストレベル

| レベル         | ツール     | 対象                                   |
| -------------- | ---------- | -------------------------------------- |
| ユニットテスト | Jest + RTL | コンポーネント、フック、ユーティリティ |
| 統合テスト     | Jest + RTL | ページ、API連携                        |
| E2Eテスト      | Playwright | ユーザーシナリオ                       |

### 7.2 ユニットテスト対象

- **コンポーネント**
  - Button: クリックイベント、disabled状態
  - FileUploader: ファイル選択、バリデーション
  - PrivacyConsent: チェック状態管理
  - RankingList: データ表示、展開/折りたたみ
  - RankingItem: 各項目の表示

- **フック**
  - useFileUpload: ファイル状態管理
  - useAnalyze: API呼び出し、ローディング状態
  - usePrivacyConsent: 同意状態管理

- **ユーティリティ**
  - APIクライアント: リクエスト/レスポンス処理
  - バリデーション関数

### 7.3 統合テスト対象

- トップページ: ファイルアップロード → 解析開始フロー
- 結果ページ: データ表示、タブ切り替え
- エラーハンドリング: API エラー時の表示

### 7.4 E2Eテスト対象

1. **正常系シナリオ**
   - ファイルアップロード → 同意 → 解析 → 結果表示
   - ユーザータブ切り替え
   - 「もっと見る」展開

2. **異常系シナリオ**
   - 不正なファイル形式のアップロード
   - 同意なしでの解析試行
   - API エラー時の動作

### 7.5 テストカバレッジ目標

- ユニットテスト: 80%以上
- 統合テスト: 主要フロー100%
- E2Eテスト: クリティカルパス100%

---

## 8. 実装計画

**重要**: 各PRの作業が完了したら、以下を必ず実施すること：

### PRマージ前のチェックリスト

1. **ローカルでCIと同じ処理を実行し、全て成功することを確認**

   ```bash
   # フォーマッタの適用
   npm run format

   # フォーマットチェック（CIと同じ）
   npm run format:check

   # Lint チェック
   npm run lint

   # 型チェック
   npx tsc --noEmit

   # テスト実行
   npm run test -- --passWithNoTests

   # ビルド確認
   npm run build
   ```

2. **ドキュメント更新**
   - `doc/PR/PRxx.md`ファイルを作成（xxはPR番号）
     - 実装内容、テスト結果、修正内容などを詳細に記載
   - 本仕様書（SPEC.md）の該当PRのタスクチェックボックスにチェック（`[ ]` → `[x]`）を入れる

### Phase 1: プロジェクト基盤構築（並列実行不可）

#### PR#1: プロジェクト初期設定

**目的**: Next.js プロジェクトの作成と開発環境の構築

**タスク**:

- [x] Next.js 14+ プロジェクトの作成（App Router）
- [x] TypeScript 設定（tsconfig.json）
- [x] Tailwind CSS 設定（tailwind.config.ts）
- [x] ESLint 設定（.eslintrc.js）
- [x] Prettier 設定（.prettierrc）
- [x] ディレクトリ構造の作成
  - src/app/
  - src/components/
  - src/hooks/
  - src/lib/
  - src/types/
  - tests/
- [x] Jest 設定（jest.config.js）
- [x] Playwright 設定（playwright.config.ts）
- [x] CI/CD 設定（.github/workflows/ci.yml）
- [x] .vscode/settings.json の作成
- [x] .vscode/extensions.json の作成
- [x] .gitignore の作成
- [x] README.md の初期化

**テスト計画**:

- [x] `npm run dev` でアプリが起動すること
- [x] `npm run build` でビルドが成功すること
- [x] `npm run lint` がエラーなく通ること
- [x] `npm run test` が実行できること

**依存**: なし

---

### Phase 2: 共通基盤の実装（並列実行可能）

#### PR#2: 共通コンポーネント・レイアウト

**目的**: アプリ全体で使用する共通UIコンポーネントの実装

**タスク**:

- [x] `src/components/common/Header.tsx` の実装
  - ロゴ、タイトル表示
  - レスポンシブ対応
- [x] `src/components/common/Footer.tsx` の実装
  - コピーライト、リンク
- [x] `src/components/common/Button.tsx` の実装
  - variant（primary, secondary, outline）
  - disabled 状態
  - ローディング状態
- [x] `src/components/common/Loading.tsx` の実装
  - スピナーアニメーション
  - オーバーレイ表示オプション
- [x] `src/components/common/Modal.tsx` の実装
  - オープン/クローズ制御
  - オーバーレイクリックで閉じる
- [x] `src/app/layout.tsx` の実装
  - Header/Footer の配置
  - メタデータ設定
- [x] `src/app/globals.css` の実装
  - Tailwind ベーススタイル
  - カスタムユーティリティ

**テスト計画**:

- 単体テスト: `tests/unit/components/`
  - [x] Button: クリックイベント発火
  - [x] Button: disabled 状態でクリック無効
  - [x] Button: ローディング表示
  - [x] Loading: スピナー表示
  - [x] Modal: オープン/クローズ動作
  - [x] Header/Footer: レンダリング確認

**依存**: PR#1

---

#### PR#3: 型定義・APIクライアント

**目的**: バックエンドAPIとの連携基盤の構築

**タスク**:

- [x] `src/types/api.ts` の実装
  - AnalysisResponse 型
  - TopWord 型
  - TopMessage 型
  - Appearance 型
  - UserWordAnalysis 型
  - UserMessageAnalysis 型
  - ErrorResponse 型
- [x] `src/types/result.ts` の実装
  - フロントエンド用の結果データ型
- [x] `src/lib/api.ts` の実装
  - analyzeFile() 関数
  - healthCheck() 関数
  - エラーハンドリング
  - タイムアウト設定
- [x] `src/lib/constants.ts` の実装
  - API_BASE_URL
  - MAX_FILE_SIZE
  - SUPPORTED_FILE_TYPES

**テスト計画**:

- 単体テスト: `tests/unit/lib/`
  - [x] APIクライアント: 正常系リクエスト（モック使用）
  - [x] APIクライアント: エラーレスポンスのハンドリング
  - [x] APIクライアント: ネットワークエラーのハンドリング
  - [x] APIクライアント: タイムアウト処理

**依存**: PR#1

---

#### PR#4: プライバシーポリシーページ

**目的**: プライバシーポリシーの表示ページ作成

**タスク**:

- [x] `src/app/privacy/page.tsx` の実装
  - プライバシーポリシー全文の表示
  - スクロール可能なレイアウト
  - 戻るボタン
- [x] プライバシーポリシー文言の作成
  - データ処理の透明性
  - サーバー側での処理内容
  - 通信の保護
  - 推奨事項

**テスト計画**:

- 単体テスト: `tests/unit/app/privacy/`
  - [x] ページのレンダリング確認
  - [x] 必要な文言が表示されていること
  - [x] 戻るリンクの動作

**依存**: PR#1

---

### Phase 3: メイン機能の実装（Phase 2 完了後）

#### PR#5: ファイルアップロード機能

**目的**: LINEトーク履歴ファイルのアップロード機能実装

**タスク**:

- [x] `src/components/upload/DropZone.tsx` の実装
  - ドラッグ&ドロップ対応
  - ドラッグ中のビジュアルフィードバック
  - クリックでファイル選択
- [x] `src/components/upload/FileUploader.tsx` の実装
  - DropZone の統合
  - ファイル名表示
  - ファイル削除機能
  - エラーメッセージ表示
- [x] `src/hooks/useFileUpload.ts` の実装
  - ファイル状態管理
  - バリデーション処理
  - エラー状態管理
- [x] ファイルバリデーション
  - .txt 拡張子チェック
  - ファイルサイズチェック（50MB以下）
- [x] `src/app/page.tsx` の基本実装
  - FileUploader の配置
  - ヘルプリンク

**テスト計画**:

- 単体テスト: `tests/unit/components/upload/`
  - [x] DropZone: ドラッグイベントの処理
  - [x] DropZone: ファイル選択イベント
  - [x] FileUploader: ファイル名表示
  - [x] FileUploader: 削除機能
  - [x] useFileUpload: 正常なファイルの受け入れ
  - [x] useFileUpload: 不正な拡張子の拒否
  - [x] useFileUpload: サイズ超過の拒否

**依存**: PR#2, PR#3

**完了**: ✅ 2025年（全31テスト成功、品質チェック完了）

---

#### PR#6: ヘルプページ

**目的**: トーク履歴取得方法の説明ページ作成

**タスク**:

- [x] `src/app/help/page.tsx` の実装
  - iPhone での手順説明
  - Android での手順説明
  - 注意事項
  - トップへ戻るボタン
- [x] 手順説明文言の作成
- [x] スクリーンショット画像の準備（オプション）

**テスト計画**:

- 単体テスト: `tests/unit/app/help/`
  - [x] ページのレンダリング確認
  - [x] iPhone/Android 両方の手順が表示されること
  - [x] 戻るリンクの動作

**依存**: PR#2

**完了**: ✅ 2025年12月20日（全14テスト成功、スクリーンショット付き手順実装完了）

**修正依頼**

iphone手順におけるスクリーンショットを用意したので、以下の内容で修正してください。

1. トークの右上の三本線メニューをタップ（画像：iphone01.png）
2. 「設定」をタップ（画像：iphone02.png）
3. 「トーク履歴を更新」をタップ（画像：iphone03.png）
4. 「ファイルに保存」をタップ（画像：iphone04.png）
5. このiphone内で「保存」を選択（画像：iphone05.png）

上記手順の文章（文体など）は適宜修正してくれて構いません。  
画像は今は'img/how_to_save_talk_history/iphone/'に保存していますが、webで公開するにあたり適切な場所に配置し直してください。  
androidの手順についてはスクリーンショットを用意できていないので、一旦説明文は削除し「現在準備中です」と表示してください。

---

#### PR#7: プライバシー同意機能

**目的**: 解析実行前の同意取得機能実装

**タスク**:

- [x] `src/components/upload/PrivacyConsent.tsx` の実装
  - チェックボックス（ポリシー確認後のみ有効化）
  - プライバシーポリシーモーダルを開くボタン
  - 同意状態の表示
- [x] `src/components/common/PrivacyPolicyModal.tsx` の実装
  - プライバシーポリシーの全文表示
  - モーダル形式での表示
  - スクロール可能なコンテンツ
- [x] `src/hooks/usePrivacyConsent.ts` の実装
  - 同意状態管理（isConsented）
  - 既読状態管理（hasReadPolicy）
  - セッション内での状態保持
- [x] トップページへの統合
  - PrivacyConsent の配置
  - PrivacyPolicyModal の統合
  - 解析ボタンの有効/無効制御
  - 「ファイル選択済み」かつ「同意済み」で有効化
- [x] プライバシーページの削除
  - `src/app/privacy/page.tsx` 削除（モーダル化のため）
  - Footer からプライバシーリンク削除
- [x] コンテンツの整理
  - 絵文字の削除
  - 見出しの統一（「必須同意項目」、黒色）

**テスト計画**:

- 単体テスト: `tests/unit/components/upload/`
  - [x] PrivacyConsent: チェック状態の切り替え
  - [x] PrivacyConsent: ポリシー未読時の無効化
  - [x] PrivacyConsent: ボタンクリックイベント
  - [x] PrivacyPolicyModal: 表示制御
  - [x] PrivacyPolicyModal: コンテンツ表示
  - [x] usePrivacyConsent: 状態管理（同意・既読）
- 統合テスト: `tests/integration/`
  - [x] 同意なし → ボタン無効
  - [x] ファイルなし → ボタン無効
  - [x] 両方あり → ボタン有効
  - [x] モーダル開閉とチェックボックス連動
- テスト削除/更新:
  - [x] 削除されたプライバシーページのテスト削除
  - [x] Footer テストの更新

**依存**: PR#4, PR#5

**完了**: ✅ 2025年12月20日（全135テスト成功、モーダル実装完了）

---

### Phase 4: 結果表示の実装（Phase 3 完了後）

#### PR#8: API連携・解析処理

**目的**: バックエンドAPIとの連携と解析処理の実装

**タスク**:

- [x] `src/hooks/useAnalyze.ts` の実装
  - 解析リクエスト送信
  - ローディング状態管理
  - エラー状態管理
  - 結果データの保持
- [x] トップページへの統合
  - 解析ボタンクリック時の処理
  - ローディング表示
  - エラーメッセージ表示
- [x] 結果ページへの遷移処理
  - 解析成功時に `/result` へ遷移
  - 結果データの受け渡し（sessionStorage）
- [x] 結果ページ (`src/app/result/page.tsx`) の実装
  - TOP10ランキング表示（流行語・流行メッセージ）
  - 解析情報の表示
  - トップページへ戻るボタン
- [x] 環境変数の統一（ポート8001）

**テスト計画**:

- 単体テスト: `tests/unit/hooks/`
  - [x] useAnalyze: 正常系の解析処理（モック使用）
  - [x] useAnalyze: ローディング状態の変化
  - [x] useAnalyze: エラー時の状態
- 統合テスト: `tests/integration/`
  - [x] アップロード → 解析 → 遷移のフロー
  - [x] エラー時の動作
  - [x] ローディング中のボタン無効化

**依存**: PR#3, PR#7

**完了**: ✅ 2025年12月20日（全148テスト成功、品質チェック完了、バックエンド連携確認済み）

---

#### PR#9: 結果表示ページ（リストモード）

**目的**: 解析結果のランキング表示機能実装

**タスク**:

- [ ] `src/components/result/RankingItem.tsx` の実装
  - 順位、ワード/メッセージ、出現回数の表示
  - スタイリング（1位は強調など）
- [ ] `src/components/result/RankingList.tsx` の実装
  - RankingItem のリスト表示
  - 初期表示10件
  - 「もっと見る」ボタン
  - 100件まで展開
- [ ] `src/components/result/UserTabs.tsx` の実装
  - 「全体」タブ
  - ユーザー別タブ
  - 横スクロール対応
  - タブ切り替えイベント
- [ ] `src/components/result/ResultSummary.tsx` の実装
  - 解析期間表示
  - 総メッセージ数表示
- [ ] `src/app/result/page.tsx` の実装
  - 各コンポーネントの統合
  - 流行語ランキング
  - 流行メッセージランキング
  - 「別のファイルを解析」ボタン

**テスト計画**:

- 単体テスト: `tests/unit/components/result/`
  - [ ] RankingItem: 各項目の表示
  - [ ] RankingList: 初期10件表示
  - [ ] RankingList: 展開機能
  - [ ] UserTabs: タブ切り替え
  - [ ] ResultSummary: 情報表示
- 統合テスト: `tests/integration/`
  - [ ] 結果ページ全体のレンダリング
  - [ ] タブ切り替えでデータ更新

**依存**: PR#8

---

### Phase 5: 演出・仕上げ（Phase 4 完了後、並列実行可能）

#### PR#10: アニメーション演出（オプション）

**目的**: Apple Music風のランキング発表アニメーション実装

**タスク**:

- [ ] Framer Motion のセットアップ
- [ ] `src/components/animation/StoryPresentation.tsx` の実装
  - スライド管理
  - 自動再生/手動操作
  - スキップ機能
- [ ] `src/components/animation/RankingReveal.tsx` の実装
  - 順位のズームイン
  - ワードのスライドイン
  - カウントアップ
- [ ] `src/components/animation/CountdownNumber.tsx` の実装
  - 数字のアニメーション
- [ ] `src/components/animation/Confetti.tsx` の実装
  - 1位発表時の紙吹雪
- [ ] 操作の実装
  - スワイプ/タップで進む
  - 長押しで一時停止
  - スキップボタン

**テスト計画**:

- 単体テスト: `tests/unit/components/animation/`
  - [ ] StoryPresentation: スライド遷移
  - [ ] StoryPresentation: スキップ機能
  - [ ] RankingReveal: アニメーション発火

**依存**: PR#9

---

#### PR#11: E2Eテスト・統合テスト

**目的**: アプリ全体の品質保証

**タスク**:

- [ ] E2Eテストシナリオの実装（Playwright）
  - 正常系: ファイルアップロード → 同意 → 解析 → 結果表示
  - 異常系: 不正ファイルのアップロード
  - 異常系: 同意なしでの解析試行
  - 異常系: APIエラー時の動作
- [ ] 統合テストの実装
  - トップページのフロー全体
  - 結果ページの表示
- [ ] テストカバレッジの確認・改善
  - 目標: 80%以上
- [ ] **CI設定の更新**
  - `.github/workflows/ci.yml` のE2Eテストジョブのコメントを解除して有効化
  - Playwrightブラウザキャッシュが正しく動作することを確認

**テスト計画**:

- E2Eテスト: `tests/e2e/`
  - [ ] 正常系シナリオ全通過
  - [ ] 異常系シナリオ全通過
  - [ ] モバイル表示での動作確認

**依存**: PR#9

---

#### PR#12: 最終調整・リリース準備

**目的**: 本番環境へのデプロイ準備

**タスク**:

- [ ] バグ修正（テストで発見された問題）
- [ ] パフォーマンス最適化
  - 画像最適化
  - バンドルサイズ確認
  - Lighthouse スコア確認
- [ ] SEO対応
  - meta タグ設定
  - title 設定
  - description 設定
- [ ] OGP設定
  - og:title
  - og:description
  - og:image
- [ ] README.md 更新
  - セットアップ手順
  - 使用方法
  - 開発ガイド
- [ ] 本番環境デプロイ設定
  - 環境変数設定
  - ビルド設定確認

**テスト計画**:

- [ ] 全テストの再実行・全通過
- [ ] 本番ビルドの動作確認
- [ ] Lighthouse スコア: Performance 90+, Accessibility 90+

**依存**: PR#10, PR#11

---

### 8.6 実装スケジュール概要

```
Week 1: PR#1 → PR#2, PR#3, PR#4 (並列)
Week 2: PR#5, PR#6 (並列) → PR#7
Week 3: PR#8 → PR#9
Week 4: PR#10, PR#11 (並列) → PR#12
```

### 8.7 依存関係図

```
PR#1 (プロジェクト初期設定)
  │
  ├──→ PR#2 (共通コンポーネント) ──→ PR#5 (アップロード) ──┐
  │                                │                      │
  ├──→ PR#3 (型定義・API) ─────────┴──────────────────────┼──→ PR#7 (同意機能)
  │                                                       │        │
  └──→ PR#4 (プライバシーポリシー) ───────────────────────┘        │
                                                                   ↓
                                                          PR#8 (API連携)
                                                                   │
       PR#6 (ヘルプ) ← PR#2                                        ↓
                                                          PR#9 (結果表示)
                                                                   │
                                                      ┌────────────┴────────────┐
                                                      ↓                         ↓
                                               PR#10 (アニメーション)     PR#11 (E2Eテスト)
                                                      │                         │
                                                      └────────────┬────────────┘
                                                                   ↓
                                                          PR#12 (最終調整)
```

---

## 9. 非機能要件

### 9.1 パフォーマンス

- 初期ロード時間: 3秒以内（3G回線）
- API レスポンス待機中の適切なローディング表示
- 大量データ（100件）の表示でもスムーズにスクロール

### 9.2 アクセシビリティ

- キーボード操作対応
- スクリーンリーダー対応（aria属性）
- 適切なコントラスト比

### 9.3 セキュリティ

- XSS対策（React標準のエスケープ）
- HTTPS必須
- CSRFトークン（必要に応じて）

---

## 10. 開発環境

### 10.1 ローカル開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# リント実行
npm run lint

# テスト実行
npm run test

# E2Eテスト実行
npm run test:e2e

# ビルド
npm run build
```

### 10.2 環境変数

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 10.3 バックエンド連携

開発時は `line_talk_analyzer_backend` を Docker で起動:

```bash
cd ../line_talk_analyzer_backend
docker-compose up
```

---

## 11. 将来の拡張案

1. **クライアントサイド解析**
   - WebAssembly (kuromoji.js等) によるブラウザ内形態素解析
   - ファイルを外部送信せずに処理

2. **SNSシェア機能**
   - 結果画像の生成
   - Twitter/Instagram シェア

3. **履歴機能**
   - LocalStorage による過去の解析結果保存
   - 複数ファイルの比較

4. **多言語対応**
   - 英語UI対応

---

## 更新履歴

| 日付       | バージョン | 内容                                                 |
| ---------- | ---------- | ---------------------------------------------------- |
| 2025-12-16 | 1.0.0      | 初版作成                                             |
| 2025-12-16 | 1.1.0      | プライバシーセクション強化、実装計画フォーマット改善 |

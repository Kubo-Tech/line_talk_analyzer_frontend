# 実装計画

このドキュメントでは、LINEトークアナライザー フロントエンドの実装計画を詳細に記述します。各フェーズごとにPR単位でタスクを分割し、並列実行可能なものは同時進行で進められるように設計しています。

## PRマージ前のチェックリスト

**重要**: 各PRの作業が完了したら、以下を必ず実施すること：

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
   - 本書（PLAN.md）の該当PRのタスクチェックボックスにチェック（`[ ]` → `[x]`）を入れる

## Phase 1: プロジェクト基盤構築（並列実行不可）

### PR#1: プロジェクト初期設定

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

## Phase 2: 共通基盤の実装（並列実行可能）

### PR#2: 共通コンポーネント・レイアウト

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

### PR#3: 型定義・APIクライアント

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

### PR#4: プライバシーポリシーページ

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

## Phase 3: メイン機能の実装（Phase 2 完了後）

### PR#5: ファイルアップロード機能

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

### PR#6: ヘルプページ

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

---

### PR#7: プライバシー同意機能

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

## Phase 4: 結果表示の実装（Phase 3 完了後）

### PR#8: API連携・解析処理

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

### PR#9: 結果表示ページ（リストモード）

**目的**: 解析結果のランキング表示機能実装

**タスク**:

- [x] `src/components/result/RankingItem.tsx` の実装
  - 順位、ワード/メッセージ、出現回数の表示
  - スタイリング（1位は強調など）
- [x] `src/components/result/RankingList.tsx` の実装
  - RankingItem のリスト表示
  - 初期表示10件
  - 「もっと見る」ボタン
  - 100件まで展開
- [x] `src/components/result/UserTabs.tsx` の実装
  - 「全体」タブ
  - ユーザー別タブ（発言者ごと）
  - 横スクロール対応
  - タブ切り替えイベント
  - タブ切り替え時のランキングデータ更新
- [x] `src/components/result/ResultSummary.tsx` の実装
  - 解析期間表示
  - 総メッセージ数表示
- [x] `src/app/result/page.tsx` の実装
  - 各コンポーネントの統合
  - 履歴全体の流行語ランキング TOP10（もっと見るで100位まで）
  - 履歴全体の流行メッセージランキング TOP10（もっと見るで100位まで）
  - 発言者ごとの流行語ランキング TOP10（もっと見るで100位まで）
  - 発言者ごとの流行メッセージランキング TOP10（もっと見るで100位まで）
  - タブ切り替えによる表示データの切り替え
  - 「別のファイルを解析」ボタン

**テスト計画**:

- 単体テスト: `tests/unit/components/result/`
  - [x] RankingItem: 各項目の表示
  - [x] RankingList: 初期10件表示
  - [x] RankingList: 展開機能
  - [x] UserTabs: タブ切り替え
  - [x] ResultSummary: 情報表示
- 統合テスト: `tests/integration/`
  - [x] 結果ページ全体のレンダリング
  - [x] タブ切り替えでデータ更新

**依存**: PR#8

---

## Phase 5: 演出・仕上げ（Phase 4 完了後、並列実行可能）

### PR#10: アニメーション演出（オプション）

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

### PR#11: E2Eテスト・統合テスト

**目的**: アプリ全体の品質保証

**タスク**:

- [x] E2Eテストシナリオの実装（Playwright）
  - 正常系: ファイルアップロード → 同意 → 解析 → 結果表示
  - 異常系: 不正ファイルのアップロード
  - 異常系: 同意なしでの解析試行
  - 異常系: APIエラー時の動作
- [x] 統合テストの実装
  - トップページのフロー全体
  - 結果ページの表示
- [x] テストカバレッジの確認・改善
  - 目標: 80%以上 → **達成: 91.78%**
- [x] **CI設定の更新**
  - `.github/workflows/ci.yml` のE2Eテストジョブのコメントを解除して有効化
  - Playwrightブラウザキャッシュが正しく動作することを確認

**テスト計画**:

- E2Eテスト: `tests/e2e/`
  - [x] 正常系シナリオ全通過
  - [x] 異常系シナリオ全通過
  - [x] モバイル表示での動作確認

**依存**: PR#9

**完了**: ✅ 2026年1月1日（全309テスト成功、カバレッジ91.78%、CI有効化、ビルド問題解決）

---

### PR#12: 最終調整・リリース準備

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

## 依存関係図

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

## 将来の拡張案

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
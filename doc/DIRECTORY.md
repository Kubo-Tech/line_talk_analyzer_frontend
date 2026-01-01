# ディレクトリ構成

```
line_talk_analyzer_frontend/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # ルートレイアウト
│   │   ├── page.tsx                # トップページ
│   │   ├── globals.css             # グローバルスタイル
│   │   ├── result/
│   │   │   └── page.tsx            # 結果表示ページ
│   │   └── help/
│   │       └── page.tsx            # ヘルプページ
│   ├── components/                 # 共通コンポーネント
│   │   ├── common/                 # 汎用コンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Loading.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── PrivacyPolicyModal.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── upload/                 # アップロード関連
│   │   │   ├── FileUploader.tsx
│   │   │   ├── DropZone.tsx
│   │   │   └── PrivacyConsent.tsx
│   │   ├── result/                 # 結果表示関連
│   │   │   ├── RankingList.tsx
│   │   │   ├── RankingItem.tsx
│   │   │   ├── RankingContainer.tsx
│   │   │   ├── UserTabs.tsx
│   │   │   └── ResultSummary.tsx
│   │   ├── settings/               # 設定関連
│   │   │   └── SettingsModal.tsx
│   │   └── animation/              # アニメーション関連
│   ├── contexts/                   # React コンテキスト
│   │   ├── ThemeContext.tsx        # テーマ管理
│   │   └── FileContext.tsx         # ファイル管理
│   ├── hooks/                      # カスタムフック
│   │   ├── useAnalyze.ts
│   │   ├── useFileUpload.ts
│   │   ├── usePrivacyConsent.ts
│   │   ├── useServerWarmup.ts
│   │   └── useSettings.ts
│   ├── lib/                        # ユーティリティ
│   │   ├── api.ts                  # API クライアント
│   │   └── constants.ts            # 定数
│   └── types/                      # 型定義
│       ├── api.ts                  # API レスポンス型
│       ├── result.ts               # 結果データ型
│       ├── settings.ts             # 設定型
│       └── css.d.ts                # CSS モジュール型定義
├── public/
│   └── images/                     # 静的画像
├── tests/
│   ├── unit/                       # ユニットテスト
│   ├── integration/                # 統合テスト
│   └── e2e/                        # E2Eテスト
├── doc/
│   ├── SPEC.md                     # 本仕様書
│   ├── ISSUE/                      # Issue対応履歴
│   └── PR/                         # 仕様書に準ずるPR対応履歴
├── eslint.config.mjs
├── jest.config.ts
├── jest.setup.ts
├── playwright.config.ts
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.test.json
├── next.config.ts
├── next-env.d.ts
├── package.json
├── .env.example
└── README.md
```
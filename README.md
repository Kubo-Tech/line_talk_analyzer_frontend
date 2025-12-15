# LINE流行語大賞 フロントエンド

LINEのトーク履歴を解析し、1年間の流行語大賞を表示するスマホ用Webアプリケーションのフロントエンドです。

## 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript 5
- **スタイリング**: Tailwind CSS 4
- **アニメーション**: Framer Motion
- **テスト**: Jest + React Testing Library / Playwright

## 開発環境のセットアップ

### 必要条件

- Node.js 20.x 以上
- npm 10.x 以上

### Node.js のインストール（初回のみ）

Node.js がインストールされていない場合：

**Windows:**
1. [Node.js公式サイト](https://nodejs.org/) から LTS版（20.x）をダウンロード
2. インストーラーを実行

**Mac (Homebrew):**
```bash
brew install node@20
```

**nvm を使用する場合（推奨）:**
```bash
# .nvmrc に指定されたバージョンをインストール・使用
nvm install
nvm use
```

バージョン確認：
```bash
node -v  # v20.x.x と表示されればOK
npm -v   # 10.x.x と表示されればOK
```

### インストール

```bash
# 依存関係のインストール
npm install

# Playwright のブラウザインストール（E2Eテスト用）
npx playwright install
```

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開いてください。

### バックエンドの起動

開発時は `line_talk_analyzer_backend` を Docker で起動してください：

```bash
cd ../line_talk_analyzer_backend
docker-compose up
```

## 利用可能なスクリプト

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番用ビルド |
| `npm run start` | 本番サーバーを起動 |
| `npm run lint` | ESLint でコードチェック |
| `npm run lint:fix` | ESLint で自動修正 |
| `npm run format` | Prettier でフォーマット |
| `npm run format:check` | フォーマットチェック |
| `npm run test` | ユニットテスト実行 |
| `npm run test:watch` | ウォッチモードでテスト |
| `npm run test:coverage` | カバレッジ付きテスト |
| `npm run test:e2e` | E2Eテスト実行 |
| `npm run test:e2e:ui` | E2Eテスト（UIモード） |

## ディレクトリ構成

```
src/
├── app/                 # Next.js App Router
│   ├── layout.tsx       # ルートレイアウト
│   ├── page.tsx         # トップページ
│   ├── globals.css      # グローバルスタイル
│   ├── result/          # 結果表示ページ
│   ├── help/            # ヘルプページ
│   └── privacy/         # プライバシーポリシーページ
├── components/          # 共通コンポーネント
│   ├── common/          # 汎用コンポーネント
│   ├── upload/          # アップロード関連
│   ├── result/          # 結果表示関連
│   └── animation/       # アニメーション関連
├── hooks/               # カスタムフック
├── lib/                 # ユーティリティ
└── types/               # 型定義

tests/
├── unit/                # ユニットテスト
├── integration/         # 統合テスト
└── e2e/                 # E2Eテスト
```

## 環境変数

`.env.local` ファイルを作成してください：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

## ドキュメント

- [仕様書](./doc/SPEC.md)

## ライセンス

MIT
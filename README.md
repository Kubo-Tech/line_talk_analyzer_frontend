# LINE流行語大賞 フロントエンド

LINEのトーク履歴を解析し、1年間の流行語大賞を表示するスマホ用Webアプリケーションのフロントエンドです。

## 概要

### 主な機能

- LINEトーク履歴ファイル（.txt形式）のアップロード
- バックエンドAPIとの連携による解析処理
- 流行語大賞・流行メッセージのランキング表示
- ユーザー別ランキングの表示
- プライバシーポリシーの表示と同意機能
- トーク履歴生成方法のヘルプページ
- ダークモード対応

### 各種リンク

- [LINE流行語大賞](https://line-talk-analyzer-frontend.vercel.app/)
- [【流行語大賞】LINEのトーク履歴を解析して自分たちだけの流行語大賞を発表するアプリを作った](https://qiita.com/KuboTech/items/2f337b7dc5b39d88e08b)
- [バックエンドリポジトリ](https://github.com/Kubo-Tech/line_talk_analyzer_backend)
- [vercelダッシュボード](https://vercel.com/kubo-techs-projects/line-talk-analyzer-frontend)

### 技術スタック

- **言語**: TypeScript 5.x
- **フレームワーク**: Next.js 16 (App Router)
- **UIライブラリ**: React 19
- **スタイリング**: Tailwind CSS 4
- **アニメーション**: Framer Motion 11
- **HTTP クライアント**: fetch API (Next.js built-in)
- **テストフレームワーク**: Jest + React Testing Library
- **E2Eテスト**: Playwright
- **リンター/フォーマッター**: ESLint, Prettier
- **パッケージマネージャ**: npm

## 環境構築

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

開発時は [line_talk_analyzer_backend](https://github.com/Kubo-Tech/line_talk_analyzer_backend) をcloneし、Docker で起動してください。

```bash
cd path/to/your/line_talk_analyzer_backend
docker-compose up
```

### 環境変数の設定

環境変数の設定は**オプション**です。設定しない場合、以下のデフォルト値が使用されます：

- `NEXT_PUBLIC_API_BASE_URL`: `http://localhost:8001`

デフォルト値を変更したい場合は、`.env.local` ファイルを作成してください（`.env.example`を参考）：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
```

### 利用可能なスクリプト

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

## ドキュメント

- [API連携](./doc/API.md)
- [ディレクトリ構成](./doc/DIRECTORY.md)
- [実装計画](./doc/PLAN.md)
- [プライバシーポリシー](./doc/PRIVACY.md)
- [テスト計画](./doc/TEST.md)
- [画面設計](./doc/UI.md)
- [メイン実装履歴](./doc/PR/)
- [issue対応履歴](./doc/ISSUE/)

## ライセンス

MIT
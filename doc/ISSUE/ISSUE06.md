# Issue#06: ヘルプページへのAndroid手順とナビゲーション目次の追加

## 実装日

2025年12月31日

## 目的

ヘルプページにAndroid向けの手順を追加し、ユーザーがiPhoneとAndroidの手順に素早くジャンプできるナビゲーション目次を実装する。これにより、どちらのデバイスユーザーにも適切なガイダンスを提供し、ページ内の移動をスムーズにする。

## 背景

### 現在の問題

- **不完全なヘルプコンテンツ**
  - Android向けの手順が「準備中」のメッセージのみで実用性がない
  - Androidユーザーがトーク履歴を取得する方法を知ることができない
  - iPhone手順のみが完成しており、Android対応が遅れている

- **ページ内ナビゲーションの欠如**
  - 長いページをスクロールしないと目的の情報にアクセスできない
  - iPhoneとAndroidのセクションに素早く移動する手段がない
  - ユーザーが自分のデバイス向けの情報を見つけにくい

### 問題のフロー

```
改善前の状態:
┌─────────────────────────┐
│ トーク履歴の取得方法      │
├─────────────────────────┤
│                          │
│ 📱 iPhoneの場合           │
│  ステップ1...             │
│  ステップ2...             │
│  ...                     │
│                          │
│ 🤖 Androidの場合          │
│  🔧 現在準備中です        │
│  ・説明文のみ             │
│  ・スクリーンショットなし  │
│                          │
└─────────────────────────┘
     ↓
Androidユーザーの問題:
❌ 具体的な手順が分からない
❌ 長いページをスクロールする必要
❌ 目的のセクションに直接移動できない
```

## 期待される改善

### 改善後の状態

```
改善後の状態:
┌─────────────────────────┐
│ トーク履歴の取得方法      │
├─────────────────────────┤
│ 目次                     │
│ [📱 iPhoneの場合]        │ ← クリックで該当セクションへ
│ [🤖 Androidの場合]       │ ← クリックで該当セクションへ
├─────────────────────────┤
│ 📱 iPhoneの場合           │ ← id="iphone"
│  ステップ1...             │
│  ステップ2...             │
│  ...                     │
│                          │
│ 🤖 Androidの場合          │ ← id="android"
│  ステップ1: 三本線メニュー │
│  ステップ2: 設定         │
│  ステップ3: トーク履歴送信│
│  ステップ4: ファイルアプリ│
│                          │
└─────────────────────────┘
     ↓
改善点:
✅ Androidユーザーも手順を理解できる
✅ 目次から目的のセクションに直接ジャンプ
✅ すべてのデバイスに対応
✅ スムーズなユーザー体験
```

## 実装内容

### 1. Android手順の追加

#### 手順1-3: iPhoneと同じ内容
- **ステップ1**: トークの右上の三本線メニューをタップ
- **ステップ2**: 「設定」をタップ
- **ステップ3**: 「トーク履歴を送信」をタップ

#### 手順4: Android独自の内容
- **ステップ4**: 任意のファイルアプリを選択して保存
  - 注意書き: 「※ファイルアプリは端末の機種によって異なります」

#### 実装コード

```tsx
{/* Android版の手順 */}
<div id="android" className="mb-12 rounded-lg bg-white p-6 shadow-sm">
  <div className="mb-6 flex items-center">
    <span className="mr-3 text-3xl">🤖</span>
    <h2 className="text-2xl font-bold text-gray-900">Androidの場合</h2>
  </div>
  <div className="space-y-6">
    {/* ステップ1-4 */}
    <div className="flex flex-col md:flex-row md:items-start">
      <span className="mr-4 mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 font-bold text-white md:mb-0">
        1
      </span>
      <div className="flex-1">
        <h3 className="mb-2 font-semibold text-gray-900">
          トークの右上の三本線メニューをタップ
        </h3>
        <p className="mb-3 text-gray-600">
          解析したいトークルームを開き、画面右上の「≡」（三本線）のメニューボタンをタップします。
        </p>
        <div className="w-fit rounded-lg border bg-gray-50 p-3">
          <Image
            src="/images/help/android/android01.png"
            alt="Android手順1: トークの右上の三本線メニューをタップ"
            width={300}
            height={600}
            className="h-auto w-full max-w-sm rounded-md shadow-sm"
          />
        </div>
      </div>
    </div>
    {/* ステップ2-4も同様の構造 */}
  </div>
</div>
```

### 2. 目次セクションの追加

#### デザイン仕様
- **配置**: ページタイトル直下
- **スタイル**: 
  - iPhone: 青系（border-blue-200, bg-blue-50, text-blue-700）
  - Android: 緑系（border-green-200, bg-green-50, text-green-700）
- **レスポンシブ**: モバイルは縦並び、デスクトップは横並び
- **インタラクション**: ホバー時に色が濃くなる（hover:border-*-400, hover:bg-*-100）

#### 実装コード

```tsx
{/* 目次 */}
<div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
  <h2 className="mb-4 text-xl font-bold text-gray-900">目次</h2>
  <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
    <a
      href="#iphone"
      className="flex items-center rounded-lg border-2 border-blue-200 bg-blue-50 px-6 py-4 transition-all hover:border-blue-400 hover:bg-blue-100"
    >
      <span className="mr-3 text-2xl">📱</span>
      <span className="font-semibold text-blue-700">iPhoneの場合</span>
    </a>
    <a
      href="#android"
      className="flex items-center rounded-lg border-2 border-green-200 bg-green-50 px-6 py-4 transition-all hover:border-green-400 hover:bg-green-100"
    >
      <span className="mr-3 text-2xl">🤖</span>
      <span className="font-semibold text-green-700">Androidの場合</span>
    </a>
  </div>
</div>
```

### 3. セクションへのIDアンカーの追加

```tsx
{/* iPhone版の手順 */}
<div id="iphone" className="mb-12 rounded-lg bg-white p-6 shadow-sm">
  {/* ... */}
</div>

{/* Android版の手順 */}
<div id="android" className="mb-12 rounded-lg bg-white p-6 shadow-sm">
  {/* ... */}
</div>
```

## テスト内容

### 新規テストケース

#### 目次セクションのテスト
```typescript
it('目次セクションが表示される', () => {
  render(<HelpPage />);
  expect(screen.getByRole('heading', { name: '目次' })).toBeInTheDocument();
});

it('目次にiPhoneとAndroidへのリンクが表示される', () => {
  render(<HelpPage />);

  const iphoneLink = screen.getByRole('link', { name: /iPhoneの場合/ });
  const androidLink = screen.getByRole('link', { name: /Androidの場合/ });

  expect(iphoneLink).toBeInTheDocument();
  expect(iphoneLink).toHaveAttribute('href', '#iphone');

  expect(androidLink).toBeInTheDocument();
  expect(androidLink).toHaveAttribute('href', '#android');
});
```

#### Android手順のテスト
```typescript
describe('Android手順', () => {
  it('すべての手順が正しい順序で表示される', () => {
    render(<HelpPage />);
    // 手順の検証
  });

  it('ファイルアプリについての注意書きが表示される', () => {
    render(<HelpPage />);
    expect(screen.getByText('※ファイルアプリは端末の機種によって異なります')).toBeInTheDocument();
  });

  it('画像が適切に表示される', () => {
    render(<HelpPage />);
    // 4つのAndroid画像を検証
  });
});
```

#### アクセシビリティテストの更新
```typescript
it('見出しが適切な階層構造になっている', () => {
  render(<HelpPage />);

  // h2: 目次 + OS別セクション = 3つ
  expect(screen.getByRole('heading', { level: 2, name: '目次' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: 'iPhoneの場合' })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 2, name: 'Androidの場合' })).toBeInTheDocument();

  // h3: iPhone手順（5つ）+ Android手順（4つ）= 9つ
  expect(screen.getAllByRole('heading', { level: 3 }).length).toBe(9);
});
```

### テスト結果

```
PASS  tests/unit/app/help/page.test.tsx
  HelpPage
    レンダリング
      ✓ ページタイトルが表示される (45 ms)
      ✓ 説明文が表示される (10 ms)
      ✓ iPhone手順セクションが表示される (16 ms)
      ✓ Android手順セクションが表示される (16 ms)
      ✓ 目次セクションが表示される (21 ms)
      ✓ 目次にiPhoneとAndroidへのリンクが表示される (17 ms)
      iPhone手順
        ✓ すべての手順が正しい順序で表示される (10 ms)
        ✓ 「≡」メニューボタンについて説明される (7 ms)
        ✓ 画像が適切に表示される (18 ms)
      Android手順
        ✓ すべての手順が正しい順序で表示される (17 ms)
        ✓ ファイルアプリについての注意書きが表示される (7 ms)
        ✓ 画像が適切に表示される (16 ms)
      ナビゲーション
        ✓ トップページへの戻るリンクが表示される (13 ms)
        ✓ 戻るリンクが適切なスタイルを持つ (10 ms)
      アクセシビリティ
        ✓ 見出しが適切な階層構造になっている (21 ms)
        ✓ 重要な情報が適切に表示される (7 ms)
        ✓ 絵文字でビジュアル的に情報が分類される (6 ms)

Test Suites: 26 passed, 26 total
Tests: 4 skipped, 241 passed, 245 total
```

## ユーザー影響

### ポジティブな影響

1. **Android使用者のサポート**
   - Androidユーザーもトーク履歴の取得方法を理解できる
   - すべてのユーザーがサービスを利用できるようになる

2. **ナビゲーションの改善**
   - 目次から目的のセクションに直接ジャンプ可能
   - ページ全体をスクロールする必要がなくなる

3. **ユーザビリティの向上**
   - 自分のデバイスに合った情報に素早くアクセス
   - 視覚的に分かりやすい目次デザイン

4. **保守性の向上**
   - 統一された構造（iPhone/Android）で将来の更新が容易
   - テストカバレッジの充実

### ネガティブな影響

なし

## 技術的詳細

### ファイル変更

#### 修正ファイル
- `src/app/help/page.tsx`
  - Android手順セクションの実装（4ステップ）
  - 目次セクションの追加
  - IDアンカーの追加（#iphone, #android）

- `tests/unit/app/help/page.test.tsx`
  - 目次セクションのテスト追加
  - Android手順の「準備中」テストを実際の手順テストに更新
  - アクセシビリティテストの見出し数を更新
  - 重複テキスト対応（getAllByTextの使用）

### 画像リソース

#### 必要な画像ファイル
- `/public/images/help/android/android01.png`
- `/public/images/help/android/android02.png`
- `/public/images/help/android/android03.png`
- `/public/images/help/android/android04.png`

## 今後の課題・展開

### 短期的な改善

1. **画像の最適化**
   - WebP形式への変換で読み込み速度向上
   - レスポンシブ画像の最適化

2. **多言語対応の準備**
   - 英語版ヘルプページの検討
   - 言語切り替え機能

### 長期的な展開

1. **動画ガイドの追加**
   - 画像だけでなく動画でも手順を説明
   - より分かりやすいガイダンス

2. **FAQセクションの追加**
   - よくある質問とその回答
   - トラブルシューティング情報

3. **検索機能の実装**
   - ヘルプコンテンツ内検索
   - キーワードでの絞り込み

## 関連Issue/PR

- 関連Issue: なし（新規機能追加）
- 関連PR: PR#XX（作成予定）

## 参考資料

- LINEアプリの公式ヘルプページ
- Android各種端末でのファイルアプリの違い
- アクセシビリティガイドライン（WCAG 2.1）

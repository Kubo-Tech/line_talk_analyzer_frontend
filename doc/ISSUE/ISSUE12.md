# Issue#12: デフォルト年の動的管理とタイトルの自動更新

## 目的

「LINE流行語大賞」のタイトルと解析期間のデフォルト値に使用する年を、現在の日付に基づいて自動的に更新する仕組みを実装する。

## 背景

### 問題点

初期実装では、以下の問題がありました：

1. **ハードコードされた年**
   - ページタイトルが「LINE流行語大賞 2025」と固定
   - 2026年になっても「2025」のまま表示される
   - 手動で更新する必要がある

2. **重複したロジック**
   - `getDefaultSettings()`内でデフォルト年の計算が行われていた
   - タイトル表示では別途ハードコードされた値を使用
   - ロジックが一元管理されていない

3. **メンテナンス性の低下**
   - 年が変わるたびに複数箇所を更新する必要がある
   - 更新漏れのリスクがある

### 要件

**1月の特別扱い**
- 1月中は前年の流行語を調べたい人がいる
- 例：2026年1月は「2025年の流行語」を表示
- 2月以降は現在の年を表示

**統一されたロジック**
- デフォルト年の計算ロジックを一箇所で管理
- ページタイトル、解析期間のデフォルト値で共通使用

## 実装内容

### 1. デフォルト年取得関数の実装

**ファイル**: [src/types/settings.ts](../../src/types/settings.ts)

```typescript
/**
 * デフォルト年を取得する関数
 * 1月の場合は前年、2月以降は現在の年を返す
 */
export function getDefaultYear(): number {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 0-indexed なので +1
  // 1月の場合は前年をデフォルトにする
  return currentMonth === 1 ? currentYear - 1 : currentYear;
}
```

**設計のポイント**:

1. **シンプルなロジック**
   - 現在の月を取得
   - 1月なら前年、それ以外は現在の年を返す
   - 条件分岐はこの1箇所のみ

2. **Date APIの活用**
   ```typescript
   const now = new Date();           // 現在の日時
   const year = now.getFullYear();   // 年（例：2026）
   const month = now.getMonth() + 1; // 月（0-indexed → 1-indexed）
   ```

3. **テスタビリティ**
   - `Date`コンストラクタを使用
   - `jest.useFakeTimers()`と`jest.setSystemTime()`でテスト可能

### 2. デフォルト設定での使用

**変更前**:
```typescript
export function getDefaultSettings(): AnalysisSettings {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const defaultYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  return {
    startDate: `${defaultYear}-01-01`,
    endDate: `${defaultYear}-12-31`,
    // ...
  };
}
```

**変更後**:
```typescript
export function getDefaultSettings(): AnalysisSettings {
  const defaultYear = getDefaultYear(); // 関数を使用

  return {
    startDate: `${defaultYear}-01-01`,
    endDate: `${defaultYear}-12-31`,
    minWordLength: 1,
    maxWordLength: null,
    minMessageLength: 2,
    maxMessageLength: null,
    minWordCount: 2,
    minMessageCount: 2,
  };
}
```

**改善点**:
- ✅ ロジックの重複を排除
- ✅ 関数名で意図が明確
- ✅ テストが容易

### 3. ページタイトルの動的生成

**ファイル**: [src/app/page.tsx](../../src/app/page.tsx)

**変更前**:
```tsx
<h1 className="mb-2 text-4xl font-bold dark:text-gray-100">
  LINE流行語大賞 2025
</h1>
```

**変更後**:
```tsx
import { getDefaultYear } from '@/types/settings';

export default function Home() {
  const defaultYear = getDefaultYear();

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold dark:text-gray-100">
          LINE流行語大賞 {defaultYear}
        </h1>
        {/* ... */}
      </div>
    </main>
  );
}
```

### 4. ヘッダーの動的生成

**ファイル**: [src/components/common/Header.tsx](../../src/components/common/Header.tsx)

**変更前**:
```tsx
<h1 className="text-xl font-bold">LINE流行語大賞 2025</h1>
```

**変更後**:
```tsx
import { getDefaultYear } from '@/types/settings';

export default function Header() {
  const defaultYear = getDefaultYear();

  return (
    <header className="bg-primary dark:bg-primary-dark text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" onClick={handleHomeClick}>
            <h1 className="text-xl font-bold">
              LINE流行語大賞 {defaultYear}
            </h1>
          </Link>
        </div>
      </div>
    </header>
  );
}
```

### 5. ヘルプページのメタデータ

**ファイル**: [src/app/help/page.tsx](../../src/app/help/page.tsx)

**変更前**:
```tsx
export const metadata: Metadata = {
  title: 'ヘルプ | LINE流行語大賞 2025',
  description: 'LINEトーク履歴の取得方法を詳しく説明します',
};
```

**変更後**:
```tsx
import { getDefaultYear } from '@/types/settings';

const defaultYear = getDefaultYear();

export const metadata: Metadata = {
  title: `ヘルプ | LINE流行語大賞 ${defaultYear}`,
  description: 'LINEトーク履歴の取得方法を詳しく説明します',
};
```

### 6. 定数ファイルの整理

**ファイル**: [src/lib/constants.ts](../../src/lib/constants.ts)

**変更内容**:
```typescript
/**
 * アプリケーション情報
 */
export const APP_INFO = {
  NAME: 'LINE流行語大賞',
  YEAR: 2025, // 製作年（固定値として保持）
  VERSION: '1.0.0',
  GITHUB_REPO_FRONTEND: 'https://github.com/Kubo-Tech/line_talk_analyzer_frontend',
  GITHUB_REPO_BACKEND: 'https://github.com/Kubo-Tech/line_talk_analyzer_backend',
} as const;
```

**設計判断**:
- `APP_INFO.YEAR`は製作年を表すため、固定値のまま
- `getDefaultYear()`は「今年の流行語」を表す動的な値
- 用途が異なるため、両方を保持

## テスト実装

### 1. ユニットテスト

**ファイル**: [tests/unit/types/settings.test.ts](../../tests/unit/types/settings.test.ts)

```typescript
describe('getDefaultYear', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('1月の場合は前年を返す', () => {
    jest.setSystemTime(new Date('2026-01-01'));
    expect(getDefaultYear()).toBe(2025);
  });

  it('2月の場合は現在の年を返す', () => {
    jest.setSystemTime(new Date('2026-02-01'));
    expect(getDefaultYear()).toBe(2026);
  });

  it('12月の場合は現在の年を返す', () => {
    jest.setSystemTime(new Date('2026-12-31'));
    expect(getDefaultYear()).toBe(2026);
  });
});
```

**テストカバレッジ**:
- ✅ 1月のエッジケース（1日、31日）
- ✅ 2月以降の各月
- ✅ 年をまたいだケース
- ✅ 複数回呼び出しの一貫性

### 2. コンポーネントテスト

**ファイル**: [tests/unit/components/common/Header.test.tsx](../../tests/unit/components/common/Header.test.tsx)

```typescript
describe('Header', () => {
  it('1月の場合はタイトルに前年が表示される', () => {
    jest.setSystemTime(new Date('2026-01-01'));
    renderWithTheme();

    expect(screen.getByText('LINE流行語大賞 2025')).toBeInTheDocument();
  });

  it('2月の場合はタイトルに現在の年が表示される', () => {
    jest.setSystemTime(new Date('2026-02-01'));
    renderWithTheme();

    expect(screen.getByText('LINE流行語大賞 2026')).toBeInTheDocument();
  });
});
```

**ファイル**: [tests/unit/app/page.test.tsx](../../tests/unit/app/page.test.tsx)

```typescript
describe('Home page', () => {
  describe('タイトル表示', () => {
    it('1月の場合はタイトルに前年が表示される', () => {
      jest.setSystemTime(new Date('2026-01-01'));
      renderWithProviders();

      expect(screen.getByRole('heading', { name: /LINE流行語大賞 2025/i }))
        .toBeInTheDocument();
    });

    it('2月の場合はタイトルに現在の年が表示される', () => {
      jest.setSystemTime(new Date('2026-02-01'));
      renderWithProviders();

      expect(screen.getByRole('heading', { name: /LINE流行語大賞 2026/i }))
        .toBeInTheDocument();
    });
  });
});
```

### 3. テスト実行結果

```bash
# 設定関連のテスト
PASS  tests/unit/types/settings.test.ts
  settings
    getDefaultYear
      ✓ 1月の場合は前年を返す
      ✓ 1月31日の場合も前年を返す
      ✓ 2月1日の場合は現在の年を返す
      ✓ 2月の場合は現在の年を返す
      ✓ 3月の場合は現在の年を返す
      ✓ 12月の場合は現在の年を返す
      ✓ 異なる年でも正しく動作する
    getDefaultSettings
      ✓ 1月の場合は前年の1月1日から12月31日がデフォルト期間になる
      ✓ 2月の場合は現在の年の1月1日から12月31日がデフォルト期間になる
      ✓ 12月の場合は現在の年の1月1日から12月31日がデフォルト期間になる
      ✓ デフォルト設定の値が正しい
      ✓ 複数回呼び出しても同じ結果を返す

Tests: 12 passed, 12 total

# ヘッダーコンポーネントのテスト
PASS  tests/unit/components/common/Header.test.tsx
  Header
    ✓ 正しくレンダリングされる
    ✓ 1月の場合はタイトルに前年が表示される
    ✓ 2月の場合はタイトルに現在の年が表示される
    ✓ ホームへのリンクが正しく設定されている
    ✓ アイコンが表示される
    ダークモード対応
      ✓ ヘッダーに背景クラスが適用される
      ✓ ThemeToggleボタンが表示される
    ファイルクリア機能
      ✓ トップページからヘッダーをクリックした場合、ファイルがクリアされる
      ✓ ヘルプページからヘッダーをクリックした場合、ファイルが保持される
      ✓ 結果ページからヘッダーをクリックした場合、ファイルがクリアされる

Tests: 10 passed, 10 total

# ホームページのテスト
PASS  tests/unit/app/page.test.tsx
  Home page
    タイトル表示
      ✓ 1月の場合はタイトルに前年が表示される
      ✓ 2月の場合はタイトルに現在の年が表示される
      ✓ 12月の場合はタイトルに現在の年が表示される
    基本レンダリング
      ✓ 説明文が表示される
      ✓ ヘルプリンクが表示される
      ✓ 解析開始ボタンが表示される
      ✓ 設定変更ボタンが表示される

Tests: 7 passed, 7 total
```

## 動作確認

### 現在の日時別の動作

| 日付 | タイトル表示 | デフォルト期間 |
|------|-------------|---------------|
| 2026年1月1日 | LINE流行語大賞 2025 | 2025-01-01 ～ 2025-12-31 |
| 2026年1月31日 | LINE流行語大賞 2025 | 2025-01-01 ～ 2025-12-31 |
| 2026年2月1日 | LINE流行語大賞 2026 | 2026-01-01 ～ 2026-12-31 |
| 2026年12月31日 | LINE流行語大賞 2026 | 2026-01-01 ～ 2026-12-31 |

### 確認項目

- [x] トップページのタイトルが動的に更新される
- [x] ヘッダーのタイトルが動的に更新される
- [x] ヘルプページのメタデータが動的に更新される
- [x] デフォルト期間が動的に更新される
- [x] 1月は前年、2月以降は現在の年が表示される
- [x] すべてのテストが成功する

## 影響範囲

### 変更されたファイル

1. **[src/types/settings.ts](../../src/types/settings.ts)**
   - `getDefaultYear()` 関数を追加
   - `getDefaultSettings()` を修正

2. **[src/app/page.tsx](../../src/app/page.tsx)**
   - タイトルを動的生成に変更

3. **[src/components/common/Header.tsx](../../src/components/common/Header.tsx)**
   - タイトルを動的生成に変更

4. **[src/app/help/page.tsx](../../src/app/help/page.tsx)**
   - メタデータを動的生成に変更

5. **[src/lib/constants.ts](../../src/lib/constants.ts)**
   - `APP_INFO.YEAR` は製作年として固定値を保持

### テストファイル

1. **[tests/unit/types/settings.test.ts](../../tests/unit/types/settings.test.ts)** - 新規作成
   - `getDefaultYear()` のユニットテスト
   - `getDefaultSettings()` の統合テスト

2. **[tests/unit/components/common/Header.test.tsx](../../tests/unit/components/common/Header.test.tsx)** - 修正
   - タイトル表示のテストを時間ベースに変更
   - 1月と2月以降のケースを追加

3. **[tests/unit/app/page.test.tsx](../../tests/unit/app/page.test.tsx)** - 新規作成
   - ホームページのタイトル表示テスト
   - 基本的なレンダリングテスト

## メリット

### 1. メンテナンス性の向上
- ✅ 年が変わっても自動的に更新される
- ✅ 手動更新が不要
- ✅ 更新漏れのリスクがゼロ

### 2. コードの一元管理
- ✅ デフォルト年のロジックが1箇所に集約
- ✅ 重複コードの排除
- ✅ 修正が必要な場合も1箇所の変更で対応可能

### 3. ユーザー体験の向上
- ✅ 1月は前年の流行語を調べやすい
- ✅ 2月以降は自動的に新しい年に切り替わる
- ✅ 常に適切な期間が提案される

### 4. テスタビリティ
- ✅ Jestのタイマー機能で時間をモック可能
- ✅ 各月のケースを網羅的にテスト
- ✅ 年をまたいだケースもテスト可能

## 今後の拡張性

この実装により、以下のような拡張が容易になりました：

1. **期間の変更**
   - 1月だけでなく、他の月も特別扱いが可能
   - 例：12月は来年の流行語を予測モードにする

2. **地域対応**
   - 年度（4月始まり）への対応
   - 学校年度や会計年度への対応

3. **カスタマイズ**
   - ユーザー設定で「1月の動作」を選択可能にする
   - 「常に前年」「常に今年」などのオプション追加

## まとめ

今回の実装により、「LINE流行語大賞」のタイトルと解析期間のデフォルト値が現在の日付に基づいて自動的に更新されるようになりました。

特に、1月は前年の流行語を調べたいというユーザーニーズに対応しつつ、2月以降は自動的に新しい年に切り替わることで、年間を通じて最適なユーザー体験を提供できます。

また、ロジックを一元管理することで、メンテナンス性が大幅に向上し、将来の拡張も容易になりました。

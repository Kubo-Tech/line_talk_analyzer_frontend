# Issue#11: プライバシーポリシー同意状態のセッション保持とHydrationエラー修正

## 目的

プライバシーポリシーの同意状態をセッション内で保持し、ページリロードや遷移時に再度同意する手間を省くとともに、Next.jsのHydrationエラーを解決する。

## 背景

### 問題点

**問題1: 同意状態の保持**
- プライバシーポリシーに同意した後、ページをリロードするとチェックが外れる
- 結果ページから戻った時も同意状態がリセットされる
- 毎回同じ内容に同意するのは面倒

**問題2: Hydrationエラー**
```
Recoverable Error

Hydration failed because the server rendered text didn't match the client.
```

初期実装では`useState`の初期化関数内で`sessionStorage`から値を読み込んでいたため、以下の問題が発生：
- サーバー側レンダリング（SSR）時: `sessionStorage`は存在せず、初期値は`false`
- クライアント側初期レンダリング時: `sessionStorage`から`true`を読み込む
- 結果: サーバーとクライアントで初期値が異なり、Hydrationエラーが発生

## 実装内容

### 1. sessionStorageを使用した同意状態の保持

**ファイル**: [src/hooks/usePrivacyConsent.ts](../../src/hooks/usePrivacyConsent.ts)

#### 変更点

**変更前（localStorage使用）**:
```tsx
const [isConsented, setIsConsented] = useState(false);
const [hasReadPolicy, setHasReadPolicy] = useState(false);
```

**変更後（sessionStorage使用 + Hydration対策）**:
```tsx
import { useEffect, useState } from 'react';

const CONSENT_STORAGE_KEY = 'privacyConsent';
const READ_POLICY_STORAGE_KEY = 'hasReadPolicy';

export function usePrivacyConsent() {
  // 初期値は常にfalseにしてSSRとクライアントで一致させる
  const [isConsented, setIsConsented] = useState(false);
  const [hasReadPolicy, setHasReadPolicy] = useState(false);

  // マウント時にsessionStorageから値を読み込む
  useEffect(() => {
    const storedConsent = sessionStorage.getItem(CONSENT_STORAGE_KEY);
    const storedReadPolicy = sessionStorage.getItem(READ_POLICY_STORAGE_KEY);

    if (storedConsent === 'true') {
      setIsConsented(true);
    }
    if (storedReadPolicy === 'true') {
      setHasReadPolicy(true);
    }
  }, []);

  // isConsentedが変更されたらsessionStorageに保存
  useEffect(() => {
    sessionStorage.setItem(CONSENT_STORAGE_KEY, String(isConsented));
  }, [isConsented]);

  // hasReadPolicyが変更されたらsessionStorageに保存
  useEffect(() => {
    sessionStorage.setItem(READ_POLICY_STORAGE_KEY, String(hasReadPolicy));
  }, [hasReadPolicy]);

  const toggleConsent = () => {
    setIsConsented((prev) => !prev);
  };

  const markAsRead = () => {
    setHasReadPolicy(true);
  };

  return {
    isConsented,
    hasReadPolicy,
    toggleConsent,
    markAsRead,
  };
}
```

#### 主要な設計判断

**1. Hydrationエラーの解決**

初期値を常に`false`にすることで、SSRとクライアントで一致：

```tsx
// ❌ 変更前: useState内でsessionStorageを読み込み（Hydrationエラーの原因）
const [isConsented, setIsConsented] = useState(() => {
  if (typeof window !== 'undefined') {
    const stored = sessionStorage.getItem(CONSENT_STORAGE_KEY);
    return stored === 'true';
  }
  return false;
});

// ✅ 変更後: 初期値は常にfalse
const [isConsented, setIsConsented] = useState(false);
```

**2. useEffectでのデータ読み込み**

マウント後にsessionStorageから値を読み込んで状態を更新：

```tsx
useEffect(() => {
  const storedConsent = sessionStorage.getItem(CONSENT_STORAGE_KEY);
  if (storedConsent === 'true') {
    setIsConsented(true);
  }
}, []);
```

**動作フロー**:
1. **SSR**: 初期値`false`でHTML生成
2. **クライアント初期レンダリング**: 初期値`false`でマウント（Hydration成功）
3. **useEffect実行**: sessionStorageから値を読み込んで状態更新
4. **再レンダリング**: 保存された同意状態が反映

**3. sessionStorageへの自動保存**

状態が変更されたら自動的にsessionStorageに保存：

```tsx
useEffect(() => {
  sessionStorage.setItem(CONSENT_STORAGE_KEY, String(isConsented));
}, [isConsented]);
```

### 2. テストの更新

**ファイル**: [tests/unit/hooks/usePrivacyConsent.test.ts](../../tests/unit/hooks/usePrivacyConsent.test.ts)

#### 新規追加テスト

**1. SSR対応とセッション管理**
```tsx
describe('SSR対応とセッション管理', () => {
  it('useEffectの実行後にsessionStorageから値が読み込まれる', async () => {
    sessionStorage.setItem('privacyConsent', 'true');
    sessionStorage.setItem('hasReadPolicy', 'true');

    const { result } = renderHook(() => usePrivacyConsent());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.isConsented).toBe(true);
    expect(result.current.hasReadPolicy).toBe(true);
  });

  it('同意状態がsessionStorageに保存され、再レンダリング後も保持される', async () => {
    const { result, unmount } = renderHook(() => usePrivacyConsent());

    act(() => {
      result.current.markAsRead();
      result.current.toggleConsent();
    });

    expect(result.current.isConsented).toBe(true);
    unmount();

    // 再マウント（ページリロードをシミュレート）
    const { result: result2 } = renderHook(() => usePrivacyConsent());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result2.current.isConsented).toBe(true);
  });

  it('sessionStorageをクリアすると初期状態に戻る', async () => {
    const { result } = renderHook(() => usePrivacyConsent());

    act(() => {
      result.current.toggleConsent();
    });

    sessionStorage.clear();

    const { result: result2 } = renderHook(() => usePrivacyConsent());

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result2.current.isConsented).toBe(false);
  });
});
```

#### テスト結果

```bash
Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
```

**成功したテスト**:
- 初期状態: 4テスト
- toggleConsent: 4テスト
- markAsRead: 3テスト
- SSR対応とセッション管理: 3テスト（新規）

### 3. 統合テストの更新

**ファイル**: 
- [tests/integration/Home.test.tsx](../../tests/integration/Home.test.tsx)
- [tests/integration/analyze-flow.test.tsx](../../tests/integration/analyze-flow.test.tsx)

#### 変更点

**sessionStorageのクリア**:
```tsx
beforeEach(() => {
  sessionStorage.clear(); // 各テスト前にクリア
});
```

**sessionStorageチェックの修正**:
```tsx
// ❌ 変更前: モックのsetItemをチェック
expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
  'analysisResult',
  JSON.stringify(mockResponse)
);

// ✅ 変更後: 実際のsessionStorageの値をチェック
const savedResult = sessionStorage.getItem('analysisResult');
expect(savedResult).toBe(JSON.stringify(mockResponse));
```

## 実装後の動作フロー

### ケース1: 初回訪問

```
┌──────────────────────────────────┐
│ ユーザーがページを開く            │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ SSR: 初期値false でHTML生成      │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ クライアント: 初期値false でマウント│ ← Hydration成功
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ useEffect: sessionStorageチェック │
│ → 値なし（初回訪問）              │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ チェックボックス: 無効            │
│ isConsented: false               │
│ hasReadPolicy: false             │
└──────────────────────────────────┘
```

### ケース2: プライバシーポリシーに同意

```
┌──────────────────────────────────┐
│ プライバシーポリシーモーダルを開く │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ モーダルを閉じる                  │
│ → markAsRead() 実行              │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ useEffect実行                    │
│ sessionStorage.setItem(          │
│   'hasReadPolicy', 'true'        │
│ )                                │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ チェックボックスをクリック        │
│ → toggleConsent() 実行           │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ useEffect実行                    │
│ sessionStorage.setItem(          │
│   'privacyConsent', 'true'       │
│ )                                │
└──────────────────────────────────┘
```

### ケース3: ページリロード（同意状態保持）

```
┌──────────────────────────────────┐
│ F5キーでリロード                 │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ SSR: 初期値false でHTML生成      │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ クライアント: 初期値false でマウント│ ← Hydration成功
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ useEffect: sessionStorageチェック │
│ privacyConsent: 'true' ✓         │
│ hasReadPolicy: 'true' ✓          │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ setIsConsented(true)             │
│ setHasReadPolicy(true)           │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ 再レンダリング                    │
│ チェックボックス: 有効＆チェック済み│
│ isConsented: true ✅             │
│ hasReadPolicy: true ✅           │
└──────────────────────────────────┘
```

### ケース4: タブを閉じる（同意状態リセット）

```
┌──────────────────────────────────┐
│ ブラウザのタブを閉じる            │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ sessionStorage自動削除            │
│ （sessionStorageの仕様）          │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ 新しいタブで再度アクセス          │
└──────────────────────────────────┘
         ↓
┌──────────────────────────────────┐
│ sessionStorageは空               │
│ → 初期状態からスタート            │
└──────────────────────────────────┘
```

## 技術的な詳細

### Hydrationとは

**Hydration（ハイドレーション）**:
- サーバー側で生成されたHTML（静的）にクライアント側でReactの動的機能を追加するプロセス
- Next.jsではSSRされたHTMLに対してクライアント側でReactがアタッチされる

**Hydrationエラーの原因**:
```tsx
// サーバー側（Node.js環境）
const html = renderToString(<Component />);
// → sessionStorageが存在しない
// → 初期値: false

// クライアント側（ブラウザ環境）
hydrate(<Component />, container);
// → sessionStorageから読み込み
// → 初期値: true（保存された値）

// 結果: サーバーとクライアントで初期HTMLが異なる → Hydrationエラー
```

### 解決策の設計パターン

**二段階レンダリングパターン**:

1. **第一段階**: SSRとクライアントで同じ初期値
   ```tsx
   const [state, setState] = useState(false);
   ```

2. **第二段階**: useEffectでストレージから読み込み
   ```tsx
   useEffect(() => {
     const stored = sessionStorage.getItem(KEY);
     if (stored === 'true') {
       setState(true);
     }
   }, []);
   ```

**利点**:
- ✅ Hydrationエラーなし
- ✅ ストレージの値が反映される
- ✅ SSRとCSRの両方で動作

**欠点**:
- ⚠️ わずかなフラッシュ（初期値→保存値への変化）が発生する可能性
  - ただし、useEffectは即座に実行されるため、ほぼ気づかれない

### sessionStorage vs localStorage

| 特性 | sessionStorage | localStorage |
|------|----------------|--------------|
| **有効期限** | タブ/ウィンドウを閉じると削除 | 明示的に削除するまで永続 |
| **スコープ** | タブ/ウィンドウごとに独立 | 同一オリジンで共有 |
| **リロード時** | 保持される | 保持される |
| **セキュリティ** | タブを閉じれば消える | 削除されない限り残る |

**sessionStorageを選択した理由**:
1. **プライバシー**: ブラウザを閉じればデータが消える
2. **セッション管理**: ユーザーの「1回の利用」を適切に追跡
3. **自動クリーンアップ**: タブを閉じると自動的にクリアされる
4. **セキュリティ**: 機密情報（同意状態）が永続化されない

## セキュリティとプライバシー

### データの保存期間

**sessionStorageの特性**:
```
タブを開いている間: データ保持
  ├─ ページリロード: 保持 ✓
  ├─ ページ遷移: 保持 ✓
  ├─ ブラウザの戻る/進む: 保持 ✓
  └─ タブを閉じる: 削除 ✓

新しいタブ: データなし
異なるウィンドウ: データなし
```

### プライバシー保護

**同意状態の適切な管理**:
- ✅ ユーザーが明示的にタブを閉じれば同意状態もリセット
- ✅ 同じタブでの操作中は再同意不要（UX向上）
- ✅ 異なるタブでは独立した同意管理
- ✅ ブラウザを閉じれば確実にクリア

## パフォーマンス

### レンダリングのタイミング

```
初回マウント:
  0ms: 初期レンダリング（false）
  0ms: useEffect実行開始
  0ms: sessionStorage読み込み（同期処理）
  0ms: 状態更新
  0ms: 再レンダリング（保存値反映）

合計: ほぼ即座（ユーザーには気づかれない）
```

### sessionStorageのパフォーマンス

- **読み込み**: 同期処理、ほぼ瞬時
- **書き込み**: 同期処理、ほぼ瞬時
- **容量制限**: ブラウザごとに異なる（通常5-10MB）
- **今回の使用量**: 数十バイト（影響なし）

## 影響範囲

### 変更されたファイル

1. **[src/hooks/usePrivacyConsent.ts](../../src/hooks/usePrivacyConsent.ts)**
   - useEffectの追加（マウント時の読み込み）
   - useEffectの追加（状態変更時の保存）
   - 初期値を常に`false`に変更

2. **[tests/unit/hooks/usePrivacyConsent.test.ts](../../tests/unit/hooks/usePrivacyConsent.test.ts)**
   - sessionStorageのクリア追加
   - SSR対応テストの追加（3テスト）
   - セッション管理テストの追加
   - 既存のテスト1件削除（動作が変わったため）

3. **[tests/integration/Home.test.tsx](../../tests/integration/Home.test.tsx)**
   - sessionStorageのクリア追加

4. **[tests/integration/analyze-flow.test.tsx](../../tests/integration/analyze-flow.test.tsx)**
   - sessionStorageのモック削除
   - sessionStorageチェックの修正

### 既存機能への影響

- ✅ プライバシーポリシー同意機能: 正常動作
- ✅ ページリロード: 同意状態保持 ← **改善**
- ✅ ページ遷移: 同意状態保持 ← **改善**
- ✅ タブを閉じる: 同意状態リセット ← **セキュリティ向上**
- ✅ Hydrationエラー: 解決 ← **バグ修正**
- ✅ 全テスト成功: 28 test suites, 285 tests

## ユーザー体験の改善

### Before（修正前）

**問題1: 毎回同意が必要**
```
👤 プライバシーポリシーに同意
   ↓
📊 解析実行
   ↓
🔄 ページリロード
   ↓
😰 「チェックが外れてる...また同意しなきゃ」
   ↓
📖 モーダルを開く
   ↓
✅ 再度チェック
```

**問題2: Hydrationエラー**
```
👤 同意してページリロード
   ↓
⚠️ コンソールにエラー表示
   ↓
😕 「エラーが出てる...大丈夫？」
   ↓
🐛 動作は正常だが不安感
```

### After（修正後）

**改善1: セッション内で状態保持**
```
👤 プライバシーポリシーに同意
   ↓
📊 解析実行
   ↓
🔄 ページリロード
   ↓
😊 「チェックが残ってる！」
   ↓
✨ そのまま操作継続
```

**改善2: エラーなし**
```
👤 同意してページリロード
   ↓
✅ エラーなし
   ↓
😊 「スムーズに動く！」
   ↓
✨ 安心して使用
```

**改善3: タブを閉じた時のリセット**
```
👤 タブを閉じる
   ↓
🗑️ sessionStorage自動削除
   ↓
👤 新しいタブで開く
   ↓
🆕 クリーンな初期状態
   ↓
🔒 プライバシー保護
```

## 今後の改善案

### 1. より洗練されたHydration対策

ライブラリを使用した実装:
```tsx
import { useIsClient } from 'usehooks-ts';

export function usePrivacyConsent() {
  const isClient = useIsClient();
  const [isConsented, setIsConsented] = useState(false);

  useEffect(() => {
    if (!isClient) return;
    // クライアント側でのみ実行
  }, [isClient]);
}
```

### 2. アニメーション付きの状態遷移

フラッシュを完全に隠す:
```tsx
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const stored = sessionStorage.getItem(KEY);
  setIsConsented(stored === 'true');
  setIsLoading(false);
}, []);

if (isLoading) {
  return <Skeleton />; // スケルトン表示
}
```

### 3. 同意履歴の記録

より詳細な同意管理:
```tsx
interface ConsentHistory {
  consentedAt: string;
  policyVersion: string;
  ipAddress?: string;
}

const saveConsent = () => {
  const history: ConsentHistory = {
    consentedAt: new Date().toISOString(),
    policyVersion: '1.0.0',
  };
  sessionStorage.setItem('consentHistory', JSON.stringify(history));
};
```

## まとめ

この修正により、プライバシーポリシーの同意管理が大幅に改善されました。

**主な改善点**:
- ✅ セッション内で同意状態を保持（ページリロード対応）
- ✅ Hydrationエラーの完全解決
- ✅ タブを閉じた時の自動リセット（セキュリティ向上）
- ✅ 適切なテストカバレッジ（14テスト）
- ✅ 全既存テストも成功（285テスト）

**技術的な特徴**:
- Next.jsのSSR/CSR両対応
- sessionStorageの特性を最大限に活用
- useEffectによる二段階レンダリング
- Hydration安全な実装パターン

**ユーザーへのメリット**:
- より快適な操作体験（再同意不要）
- エラーのない安定動作
- プライバシーとセキュリティの両立
- 予測可能な動作（セッション = タブの寿命）

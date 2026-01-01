# Issue#09: ページ遷移後のファイル選択状態の保持

## 目的

ファイルをアップロード後に別ページ（ヘルプページなど）に遷移し、トップページに戻った際も、選択したファイルの状態を保持し、「ファイル選択済み」の表示を維持する。

## 背景

### 現在の問題

- **ページ遷移でファイル状態が失われる**
  - ファイルをアップロード後、ヘルプページ（`/help`）などに遷移すると、トップページに戻った際にファイル選択状態がリセットされる
  - `FileContext`では`localStorage`を使ってファイル情報を保存しているが、`FileUploader`コンポーネントのローカル状態が同期されていなかった
  - 内部的にはファイルは保持されており解析は実行できるが、UIでは「ファイル選択済み」が表示されず、ユーザーが混乱する

- **ユーザー体験の低下**
  - ファイルを再度選択する必要があるように見える（実際は不要だが）
  - 「トーク履歴の取得方法」リンクをクリックしてヘルプを確認した後、戻ってくるとファイルが解除されたように見える
  - 直感的でない動作でユーザーの不安を招く

### 問題のフロー

```
改善前の状態:
┌──────────────────────┐
│ 1. ファイルアップロード │
│    ✅ ファイル選択済み  │
└──────────────────────┘
         ↓
┌──────────────────────┐
│ 2. ヘルプページへ遷移  │
│    /help              │
└──────────────────────┘
         ↓
┌──────────────────────┐
│ 3. トップページに戻る  │
│    ❌ ファイル選択済み │
│       の表示が消える   │
│    （内部には保持）    │
└──────────────────────┘
```

## 実装内容

### 1. FileContext の改善

**ファイル**: [src/contexts/FileContext.tsx](../../src/contexts/FileContext.tsx)

#### 変更点

**SSR対応とハイドレーション問題の解決**

```tsx
// 修正前
const [uploadedFile, setUploadedFileState] = useState<File | null>(null);
const [lastFileName, setLastFileName] = useState<string | null>(null);
const [isInitialized, setIsInitialized] = useState(false);

useEffect(() => {
  if (isInitialized) return;
  // ... ファイル復元処理
  setIsInitialized(true);
}, [isInitialized]);

// 修正後
const [uploadedFile, setUploadedFileState] = useState<File | null>(null);
const [lastFileName, setLastFileName] = useState<string | null>(null);

// クライアントサイドでマウント後にlocalStorageからファイルを復元
useEffect(() => {
  try {
    const fileInfo = localStorage.getItem(FILE_INFO_KEY);
    const fileContent = localStorage.getItem(FILE_CONTENT_KEY);

    if (fileInfo) {
      const { name } = JSON.parse(fileInfo);
      setLastFileName(name);

      if (fileContent) {
        const { type } = JSON.parse(fileInfo);
        const blob = new Blob([fileContent], { type });
        const file = new File([blob], name, { type });
        setUploadedFileState(file);
      }
    }
  } catch (error) {
    console.error('ファイル情報の読み込みに失敗しました:', error);
  }
}, []);
```

**変更理由**:
- **初期状態を常に`null`に統一**: サーバーサイドとクライアントサイドで同じ初期状態を保証し、ハイドレーションミスマッチを防止
- **`useEffect`でファイル復元**: クライアントサイドでマウント後にのみ`localStorage`から復元（`useEffect`はサーバーサイドでは実行されない）
- **`isInitialized`状態を削除**: 空配列の依存配列により、マウント時に1回のみ実行されることが保証される
- **SSR完全対応**: Next.jsのSSR/ハイドレーション処理と完全に互換性あり

### 2. FileUploader コンポーネントの同期処理追加

**ファイル**: [src/components/upload/FileUploader.tsx](../../src/components/upload/FileUploader.tsx)

#### 変更点

**FileContextとの同期**

```tsx
// 追加したimport
import { useFile } from '@/contexts/FileContext';

// コンポーネント内で追加
const { uploadedFile } = useFile();

// FileContextからファイルが復元された場合、ローカルステートを同期
useEffect(() => {
  if (uploadedFile && !file) {
    setFile(uploadedFile);
  }
}, [uploadedFile, file, setFile]);
```

**動作フロー**:
1. `FileContext`が`localStorage`からファイルを復元
2. `uploadedFile`状態が更新される
3. `FileUploader`の`useEffect`が`uploadedFile`の変化を検知
4. ローカルの`file`状態に同期
5. 「✅ ファイル選択済み」が表示される

### 3. テストの修正と追加

#### 既存テストの修正

**ファイル**: [tests/unit/components/upload/FileUploader.test.tsx](../../tests/unit/components/upload/FileUploader.test.tsx)

**変更点**:
- 全てのテストで`FileProvider`でラップするヘルパー関数を追加
- `localStorage`のクリーンアップを`beforeEach`に追加

```tsx
const renderWithProvider = (ui: React.ReactElement) => {
  return render(<FileProvider>{ui}</FileProvider>);
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear(); // 追加
});
```

#### 新規テストの追加

**ファイル**: [tests/unit/contexts/FileContext.test.tsx](../../tests/unit/contexts/FileContext.test.tsx)（新規作成）

**テストケース**:
1. 初期状態の確認
2. ファイルのアップロードと`localStorage`への保存
3. ファイル情報の復元（ページ遷移後のシミュレーション）
4. ファイルのクリア
5. エラーハンドリング

**ファイル**: [tests/unit/components/upload/FileUploader.test.tsx](../../tests/unit/components/upload/FileUploader.test.tsx)

**追加したテストケース**:
- `FileContext`から復元されたファイルが表示される
- ファイル情報のみの場合は表示されない

```tsx
describe('ページ遷移後のファイル復元', () => {
  it('FileContextから復元されたファイルが表示される', async () => {
    // localStorageにファイル情報を設定（ページ遷移前の状態をシミュレート）
    const fileInfo = {
      name: 'restored.txt',
      type: 'text/plain',
      size: 1234,
    };
    const fileContent = 'restored content';

    localStorage.setItem('uploaded_file_info', JSON.stringify(fileInfo));
    localStorage.setItem('uploaded_file_content', fileContent);

    // コンポーネントをレンダリング（ページ遷移後の再マウントをシミュレート）
    renderWithProvider(<FileUploader />);

    // ファイルが復元されて表示されるまで待つ
    await screen.findByText('ファイル選択済み');
    expect(screen.getByText('restored.txt')).toBeInTheDocument();
  });
});
```

## 改善後のフロー

```
改善後の状態:
┌──────────────────────────────┐
│ 1. ファイルアップロード         │
│    ✅ ファイル選択済み          │
│    💾 localStorage に保存      │
└──────────────────────────────┘
         ↓
┌──────────────────────────────┐
│ 2. ヘルプページへ遷移          │
│    /help                       │
│    💾 localStorage に保持継続  │
└──────────────────────────────┘
         ↓
┌──────────────────────────────┐
│ 3. トップページに戻る          │
│    📂 localStorage から復元    │
│    ✅ ファイル選択済みを表示   │
│    👤 ユーザーは再選択不要     │
└──────────────────────────────┘
```

## 技術的な詳細

### localStorage の使用

**保存されるデータ**:

1. `uploaded_file_info`: ファイルのメタデータ
   ```json
   {
     "name": "sample.txt",
     "type": "text/plain",
     "size": 1234
   }
   ```

2. `uploaded_file_content`: ファイルの内容（5MB以下のみ）
   - テキストコンテンツとして保存
   - 5MB以上の場合は保存せず、メタデータのみ保持

### 同期メカニズム

```tsx
// FileContext (親コンテキスト)
┌─────────────────────────────────────┐
│ // 初期状態はサーバーと一致          │
│ const [uploadedFile, setState] =    │
│   useState<File | null>(null);      │
│                                     │
│ // マウント後にクライアントで復元    │
│ useEffect(() => {                   │
│   const file = restoreFromStorage();│
│   setState(file);                   │
│ }, []);                             │
└─────────────────────────────────────┘
         ↓
         uploadedFile 更新
         ↓
// FileUploader (子コンポーネント)
┌─────────────────────────────────────┐
│ const { uploadedFile } = useFile(); │
│                                     │
│ useEffect(() => {                   │
│   if (uploadedFile && !file)        │
│     setFile(uploadedFile);          │
│ }, [uploadedFile, file]);           │
└─────────────────────────────────────┘
```

### SSR/ハイドレーションの動作フロー

```
サーバーサイドレンダリング:
┌─────────────────────────────┐
│ FileProvider初期化           │
│ uploadedFile = null         │
│ (useEffectは実行されない)    │
└─────────────────────────────┘
         ↓
クライアントハイドレーション:
┌─────────────────────────────┐
│ 初期状態: uploadedFile = null│
│ (サーバーと一致 ✓)           │
└─────────────────────────────┘
         ↓
useEffect実行（マウント後）:
┌─────────────────────────────┐
│ localStorageから復元         │
│ uploadedFile = File          │
│ UI更新: "ファイル選択済み"   │
└─────────────────────────────┘
```

### エラーハンドリング

- `localStorage`へのアクセス失敗時はコンソールにエラーログ出力
- ファイル復元失敗時も初期状態を維持し、アプリは正常動作
- 容量制限でファイル内容が保存できない場合、メタデータのみ保存

## テスト結果

### 実行したテスト

```bash
npm test -- --testPathPattern="FileUploader.test|FileContext.test"
```

### 結果

```
Test Suites: 2 passed, 2 total
Tests:       20 passed, 20 total
```

**テストカバレッジ**:
- FileContext: 9テスト（全て成功）
  - 初期状態、アップロード、復元、エラーケース
- FileUploader: 11テスト（全て成功）
  - 既存テスト + ページ遷移後の復元テスト2件

## 影響範囲

### 変更されたファイル

1. [src/contexts/FileContext.tsx](../../src/contexts/FileContext.tsx)
   - 初期状態を常に`null`に変更（SSR対応）
   - `useEffect`でクライアントサイドのみファイル復元
   - `isInitialized`状態を削除
   - ハイドレーションミスマッチを解消

2. [src/components/upload/FileUploader.tsx](../../src/components/upload/FileUploader.tsx)
   - `useFile`フックの追加
   - FileContextとの同期処理を追加

3. [tests/unit/components/upload/FileUploader.test.tsx](../../tests/unit/components/upload/FileUploader.test.tsx)
   - `FileProvider`でラップする処理を追加
   - ページ遷移後の復元テストを追加

4. [tests/unit/contexts/FileContext.test.tsx](../../tests/unit/contexts/FileContext.test.tsx)（新規）
   - FileContextの包括的なユニットテスト

### 既存機能への影響

- ✅ 既存のファイルアップロード機能は影響なし
- ✅ ファイル削除機能は正常動作
- ✅ ファイル形式・サイズのバリデーションは維持
- ✅ 全ての既存テストが成功

## ユーザー体験の改善

### Before（改善前）
```
👤 ファイルをアップロード
   ↓
📖 「トーク履歴の取得方法」をクリック
   ↓
🔙 トップページに戻る
   ↓
😕 「あれ？ファイルが消えた？」
   ↓
😰 もう一度ファイルを選択
```

### After（改善後）
```
👤 ファイルをアップロード
   ↓
📖 「トーク履歴の取得方法」をクリック
   ↓
🔙 トップページに戻る
   ↓
😊 「ファイル選択済み」が残っている
   ↓
✨ そのまま解析を実行できる
```

## セキュリティ考慮事項

- **localStorage の使用**:
  - ファイル内容をブラウザのlocalStorageに一時保存
  - 5MB以上のファイルは内容を保存せず、メタデータのみ
  - プライバシーポリシーで説明済み

- **データの削除**:
  - ファイルを明示的に削除すると`localStorage`からも削除
  - ページリロード時はデータを保持（意図的な設計）

## 今後の改善案

1. **sessionStorage への移行検討**
   - タブを閉じた時点でデータを自動削除
   - よりプライバシーに配慮した実装

2. **ファイルサイズ制限の調整**
   - 現在は5MBまで内容を保存
   - ストレージ容量に応じた動的な調整

3. **暗号化の検討**
   - 機密性の高いデータの場合、暗号化してから保存
   - ただし、本アプリは個人的な使用を想定

## まとめ

この修正により、ユーザーがページ間を移動しても、ファイル選択状態が保持されるようになりました。特に「トーク履歴の取得方法」を確認してからファイルをアップロードする、あるいはアップロード後にヘルプを見る、といった自然な操作フローがスムーズになります。

**主な改善点**:
- ✅ ページ遷移後もファイル選択状態を保持
- ✅ 「ファイル選択済み」の表示が正しく維持される
- ✅ ユーザーが再度ファイルを選択する必要がない
- ✅ 内部データとUI表示の一貫性を確保
- ✅ SSR/ハイドレーション完全対応（Next.js互換）
- ✅ サーバーとクライアントの初期状態を統一
- ✅ 包括的なテストカバレッジ

**技術的な特徴**:
- Next.jsのSSR環境で安全に動作
- ハイドレーションミスマッチを完全に回避
- クライアントサイドでのみ`localStorage`にアクセス
- パフォーマンスへの影響を最小限に抑制

**ユーザーへのメリット**:
- より直感的で自然な操作フロー
- ヘルプページへの遷移がストレスフリー
- ファイル再選択の手間が不要
- 安心して画面遷移できる
- ページリロード時もファイルが保持される

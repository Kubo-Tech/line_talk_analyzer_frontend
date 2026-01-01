# Issue#10: ファイル状態管理の改善 - リセットタイミングの最適化

## 目的

ISSUE#09で実装したファイル選択状態の保持機能を改善し、適切なタイミングでファイルをリセットするようにする。ユーザーエクスペリエンスを考慮した細やかな制御を実現する。

## 背景

### 前回（ISSUE#09）の問題点

ISSUE#09では、ページ遷移後もファイル選択状態を保持するため、`localStorage`から`sessionStorage`への変更とFileContextの実装を行いました。しかし、以下の問題が発生しました：

**問題1: 過度なファイル保持**
- ファイルが保持されすぎて、リセットしてほしい場面でもファイルが残る
- トップページでヘッダーをクリックしてもファイルがリセットされない
- 結果ページから「別のファイルを解析」をタップしてもファイルが残る

**問題2: ヘルプページでの不便さ**
- トーク履歴の取得方法を確認するためにヘルプページに遷移
- ヘッダーをクリックしてトップページに戻るとファイルがクリアされる
- 再度ファイルを選択し直す必要があり、手間がかかる

### 理想的な動作

```
望ましいファイルリセットのタイミング:
┌──────────────────────────────────┐
│ 1. タブ/ウィンドウを閉じた時      │ ← sessionStorageの特性
│ 2. ヘッダーからトップページへ遷移  │ ← 新規アップロードの意図
│    （ヘルプページからは除く）      │
│ 3. result画面で「別のファイル」    │ ← 明示的な新規アップロード
└──────────────────────────────────┘

ファイルを保持すべき場面:
┌──────────────────────────────────┐
│ 1. ヘルプページ ⇔ トップページ    │ ← 情報確認のための遷移
│ 2. トップページ ⇔ 結果ページ      │ ← 通常の解析フロー
└──────────────────────────────────┘
```

## 実装内容

### 1. ストレージの変更（ISSUE#09からの継続）

**ファイル**: [src/contexts/FileContext.tsx](../../src/contexts/FileContext.tsx)

**変更内容**:
- `localStorage` → `sessionStorage` への変更を維持
- これにより、タブ/ウィンドウを閉じた時に自動的にファイルがクリアされる
- 同一セッション内ではページ遷移やリロードでもファイルが保持される

```tsx
// sessionStorageを使用（タブ/ウィンドウを閉じた時にクリア）
const FILE_INFO_KEY = 'uploaded_file_info';
const FILE_CONTENT_KEY = 'uploaded_file_content';

// クライアントサイドでマウント後にsessionStorageからファイルを復元
useEffect(() => {
  try {
    const fileInfo = sessionStorage.getItem(FILE_INFO_KEY);
    const fileContent = sessionStorage.getItem(FILE_CONTENT_KEY);
    // ... 復元処理
  } catch (error) {
    console.error('ファイル情報の読み込みに失敗しました:', error);
  }
}, []);
```

### 2. ヘッダーコンポーネントの改善

**ファイル**: [src/components/common/Header.tsx](../../src/components/common/Header.tsx)

#### 変更点

**現在のページパスを取得してファイルクリアを制御**

```tsx
'use client';

import { useFile } from '@/contexts/FileContext';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { setUploadedFile } = useFile();
  const pathname = usePathname();

  const handleHomeClick = async () => {
    // ヘルプページからの遷移の場合はファイルを保持
    if (pathname === '/help') {
      return;
    }
    // その他のページからトップページに戻る際にファイルをクリア
    await setUploadedFile(null);
  };

  return (
    <header>
      <Link href="/" onClick={handleHomeClick}>
        {/* ヘッダーコンテンツ */}
      </Link>
    </header>
  );
}
```

**動作フロー**:
1. `usePathname`で現在のページパスを取得
2. `/help`からの遷移の場合は早期リターン（ファイルを保持）
3. その他のページ（`/`、`/result`など）からの遷移時はファイルをクリア

**なぜヘルプページだけ例外か？**
- ヘルプページは「トーク履歴の取得方法」などの情報を確認するためのページ
- ユーザーはファイル選択の前後にヘルプを見ることが多い
- ヘルプ確認後にファイルを再選択するのは手間
- ヘルプページでの滞在は短時間で、すぐにトップページに戻ることが予想される

### 3. 結果ページの「別のファイルを解析」ボタン

**ファイル**: [src/app/result/page.tsx](../../src/app/result/page.tsx)

#### 変更点

**リンククリック時にファイルをクリア**

```tsx
import { useFile } from '@/contexts/FileContext';

export default function ResultPage() {
  const { uploadedFile, setUploadedFile } = useFile();
  
  return (
    <>
      {/* ... 他のコンテンツ */}
      
      <section className="space-y-4">
        <Link 
          href="/" 
          className="block" 
          onClick={async () => await setUploadedFile(null)}
        >
          <Button variant="primary" className="w-full">
            別のファイルを解析
          </Button>
        </Link>
      </section>
    </>
  );
}
```

**理由**:
- 「別のファイルを解析」は明示的に新規アップロードを意図するアクション
- 前のファイルをクリアして、新しいファイルを選択する状態にする

### 4. FileUploaderの同期処理の改善（ISSUE#09からの継続）

**ファイル**: [src/components/upload/FileUploader.tsx](../../src/components/upload/FileUploader.tsx)

#### 変更点

**FileContextとローカル状態の双方向同期**

```tsx
// FileContextとローカルステートを同期
// uploadedFileの変更を監視して、ローカルステートを一方向に同期
useEffect(() => {
  if (uploadedFile) {
    // FileContextにファイルがある場合、ローカルにも設定
    if (file?.name !== uploadedFile.name) {
      setFile(uploadedFile);
    }
  } else {
    // FileContextがnullの場合、ローカルもクリア
    if (file !== null) {
      clearFile();
    }
  }
}, [uploadedFile]); // uploadedFileのみを監視
```

**改善点**:
- `uploadedFile`のみを監視することで無限ループを防止
- FileContextが`null`になった場合もローカル状態をクリア
- これにより、ヘッダークリック時の表示も正しく更新される

## テスト

### 1. 既存テストの修正

#### Header.test.tsx

**変更内容**:
- `FileProvider`でラップするように修正
- `usePathname`と`useRouter`のモックを追加
- `sessionStorage`のクリーンアップを追加

```tsx
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const renderWithTheme = () => {
  return render(
    <ThemeProvider>
      <FileProvider>
        <Header />
      </FileProvider>
    </ThemeProvider>
  );
};

beforeEach(() => {
  sessionStorage.clear();
  mockUseRouter.mockReturnValue({ /* ... */ });
  mockUsePathname.mockReturnValue('/');
});
```

### 2. 新規テストの追加

#### ファイルクリア機能のテスト

**ファイル**: [tests/unit/components/common/Header.test.tsx](../../tests/unit/components/common/Header.test.tsx)

**テストケース**:

1. **トップページからヘッダーをクリックした場合**
   ```tsx
   it('トップページからヘッダーをクリックした場合、ファイルがクリアされる', async () => {
     mockUsePathname.mockReturnValue('/');
     renderWithTheme();

     // ファイルをsessionStorageに設定
     sessionStorage.setItem('uploaded_file_info', JSON.stringify(fileInfo));
     sessionStorage.setItem('uploaded_file_content', 'test content');

     const link = screen.getByRole('link');
     link.click();

     await new Promise((resolve) => setTimeout(resolve, 50));
     
     expect(sessionStorage.getItem('uploaded_file_info')).toBeNull();
     expect(sessionStorage.getItem('uploaded_file_content')).toBeNull();
   });
   ```

2. **ヘルプページからヘッダーをクリックした場合**
   ```tsx
   it('ヘルプページからヘッダーをクリックした場合、ファイルが保持される', async () => {
     mockUsePathname.mockReturnValue('/help');
     renderWithTheme();

     sessionStorage.setItem('uploaded_file_info', JSON.stringify(fileInfo));
     sessionStorage.setItem('uploaded_file_content', 'test content');

     const link = screen.getByRole('link');
     link.click();

     await new Promise((resolve) => setTimeout(resolve, 50));
     
     expect(sessionStorage.getItem('uploaded_file_info')).toBe(JSON.stringify(fileInfo));
     expect(sessionStorage.getItem('uploaded_file_content')).toBe('test content');
   });
   ```

3. **結果ページからヘッダーをクリックした場合**
   ```tsx
   it('結果ページからヘッダーをクリックした場合、ファイルがクリアされる', async () => {
     mockUsePathname.mockReturnValue('/result');
     renderWithTheme();

     sessionStorage.setItem('uploaded_file_info', JSON.stringify(fileInfo));
     sessionStorage.setItem('uploaded_file_content', 'test content');

     const link = screen.getByRole('link');
     link.click();

     await new Promise((resolve) => setTimeout(resolve, 50));
     
     expect(sessionStorage.getItem('uploaded_file_info')).toBeNull();
     expect(sessionStorage.getItem('uploaded_file_content')).toBeNull();
   });
   ```

### テスト結果

```bash
Test Suites: 2 passed, 2 total
Tests:       15 passed, 15 total
```

**成功したテスト**:
- Header: 9テスト（既存6 + 新規3）
- analyze-flow: 6テスト（既存テスト、修正済み）

## 実装後の動作フロー

### ケース1: ヘルプページからの遷移（ファイル保持）

```
┌──────────────────────────────┐
│ トップページ                  │
│ ✅ ファイル: sample.txt      │
└──────────────────────────────┘
         ↓ 「トーク履歴の取得方法」クリック
┌──────────────────────────────┐
│ ヘルプページ                  │
│ 💾 sessionStorageに保持       │
└──────────────────────────────┘
         ↓ ヘッダーの「LINE流行語大賞 2025」クリック
┌──────────────────────────────┐
│ トップページ                  │
│ ✅ ファイル: sample.txt      │ ← 保持されている！
│    （再選択不要）             │
└──────────────────────────────┘
```

### ケース2: トップページでのリフレッシュ（ファイルクリア）

```
┌──────────────────────────────┐
│ トップページ                  │
│ ✅ ファイル: sample.txt      │
└──────────────────────────────┘
         ↓ ヘッダーの「LINE流行語大賞 2025」クリック
┌──────────────────────────────┐
│ トップページ                  │
│ ⭕ ファイル未選択            │ ← クリアされた
│    （新規アップロードの意図） │
└──────────────────────────────┘
```

### ケース3: タブ/ウィンドウを閉じた時（ファイルクリア）

```
┌──────────────────────────────┐
│ トップページ                  │
│ ✅ ファイル: sample.txt      │
└──────────────────────────────┘
         ↓ タブ/ウィンドウを閉じる
┌──────────────────────────────┐
│ 新しいタブ/ウィンドウで起動    │
│ ⭕ ファイル未選択            │ ← sessionStorageがクリア
│    （セキュリティとプライバシー）│
└──────────────────────────────┘

**補足**: F5キーでのリロードやブラウザの戻る/進むボタンでは、
同一タブ内のセッションが継続するため、ファイルは保持されます。
```

### ケース4: 結果ページから「別のファイルを解析」（ファイルクリア）

```
┌──────────────────────────────┐
│ 結果ページ                    │
│ 📊 解析結果表示               │
└──────────────────────────────┘
         ↓ 「別のファイルを解析」ボタンクリック
┌──────────────────────────────┐
│ トップページ                  │
│ ⭕ ファイル未選択            │ ← クリアされた
│    （新しいファイルの解析準備）│
└──────────────────────────────┘
```

## 技術的な詳細

### usePathnameフックの使用

```tsx
import { usePathname } from 'next/navigation';

const pathname = usePathname(); // 例: '/help', '/', '/result'
```

**Next.jsのClient Components API**:
- クライアントコンポーネントで現在のURLパス名を取得
- ページ遷移時に自動的に更新される
- ルーティング処理と連動

### 条件分岐によるファイルクリア制御

```tsx
if (pathname === '/help') {
  return; // 早期リターン: ファイルを保持
}
await setUploadedFile(null); // ファイルをクリア
```

**設計判断**:
- ホワイトリスト方式: ヘルプページのみ例外
- 新しいページが追加されても、デフォルトでファイルがクリアされる安全な設計
- 将来的に他の情報ページが追加された場合は、条件に追加するだけ

### sessionStorageの特性を活用

**localStorage vs sessionStorage**:

| 特性 | localStorage | sessionStorage |
|------|--------------|----------------|
| 有効期限 | 明示的に削除するまで永続 | タブ/ウィンドウを閉じると削除 |
| リロード時 | 保持 | 保持（同一タブ/ウィンドウのセッション中） |
| タブ間共有 | 共有される | 独立 |

**sessionStorageを選択した理由**:
1. **セキュリティ**: ファイル内容が永続的に保存されない（タブを閉じると消える）
2. **プライバシー**: ブラウザを閉じればデータが消える
3. **セッション管理**: タブ/ウィンドウごとに独立したデータ管理
4. **自動クリーンアップ**: タブ/ウィンドウを閉じた時に自動的にクリアされる

## 影響範囲

### 変更されたファイル

1. [src/components/common/Header.tsx](../../src/components/common/Header.tsx)
   - `usePathname`フックの追加
   - `handleHomeClick`関数でパスによる条件分岐を追加

2. [src/app/result/page.tsx](../../src/app/result/page.tsx)
   - `setUploadedFile`の追加
   - 「別のファイルを解析」リンクに`onClick`ハンドラを追加

3. [src/components/upload/FileUploader.tsx](../../src/components/upload/FileUploader.tsx)（ISSUE#09）
   - FileContextとの同期処理を改善

4. [tests/unit/components/common/Header.test.tsx](../../tests/unit/components/common/Header.test.tsx)
   - `FileProvider`の追加
   - `usePathname`と`useRouter`のモック追加
   - ファイルクリア機能の新規テスト3件追加

5. [tests/integration/analyze-flow.test.tsx](../../tests/integration/analyze-flow.test.tsx)
   - sessionStorageチェックの修正

### 既存機能への影響

- ✅ ファイルアップロード機能: 正常動作
- ✅ ファイル削除機能: 正常動作
- ✅ ページ遷移: 改善
- ✅ ヘルプページからの復帰: 改善（ファイル保持）
- ✅ 全てのテストが成功

## ユーザー体験の改善

### Before（ISSUE#09のみ）

**問題1: ファイルが残りすぎる**
```
👤 ファイルをアップロード
   ↓
🔄 トップページでヘッダークリック
   ↓
😕 「ファイルが残ってる...新しいのを選びたいのに」
   ↓
😰 削除してから再選択
```

**問題2: ヘルプを見るとファイルが消える**
```
👤 ファイルをアップロード
   ↓
📖 「トーク履歴の取得方法」をクリック
   ↓
🔙 ヘッダーからトップページに戻る
   ↓
😕 「ファイルが消えた！」
   ↓
😰 もう一度選択
```

### After（今回の改善）

**改善1: 適切なタイミングでクリア**
```
👤 ファイルをアップロード
   ↓
🔄 トップページでヘッダークリック
   ↓
😊 「ファイルがクリアされた！新しいのを選べる」
   ↓
✨ スムーズに新規アップロード
```

**改善2: ヘルプページからは保持**
```
👤 ファイルをアップロード
   ↓
📖 「トーク履歴の取得方法」をクリック
   ↓
🔙 ヘッダーからトップページに戻る
   ↓
😊 「ファイルが残ってる！」
   ↓
✨ そのまま解析を実行
```

## セキュリティとプライバシー

### データの管理

**sessionStorageの使用**:
- ブラウザを閉じるとデータが自動削除
- タブ間でデータが共有されない
- リロード時にクリアされる

**ファイル保存の制限**:
- 5MB以下のファイルのみ内容を保存
- 大きいファイルはメタデータのみ

**明示的な削除**:
- 「別のファイルを解析」ボタンで明示的に削除
- ヘッダークリック時に自動削除（ヘルプページを除く）

## 今後の改善案

### 1. より詳細な遷移元判定

現在はヘルプページのみ例外としていますが、将来的に以下も検討：

```tsx
const PRESERVE_FILE_PAGES = ['/help', '/about', '/privacy-policy'];

const handleHomeClick = async () => {
  if (PRESERVE_FILE_PAGES.includes(pathname)) {
    return;
  }
  await setUploadedFile(null);
};
```

### 2. ユーザー設定での制御

ユーザーが「ファイルを保持する/しない」を設定できるように：

```tsx
const { fileRetentionMode } = useSettings();

const handleHomeClick = async () => {
  if (fileRetentionMode === 'always-keep') {
    return;
  }
  if (pathname === '/help') {
    return;
  }
  await setUploadedFile(null);
};
```

### 3. 確認ダイアログの追加

ファイルをクリアする前に確認：

```tsx
const handleHomeClick = async () => {
  if (uploadedFile && pathname !== '/help') {
    const confirmed = confirm('選択中のファイルをクリアしますか？');
    if (!confirmed) return;
  }
  await setUploadedFile(null);
};
```

## まとめ

この修正により、ファイル状態管理が大幅に改善されました：

**主な改善点**:
- ✅ タブ/ウィンドウを閉じた時に自動的にファイルクリア（sessionStorage使用）
- ✅ ページリロードやブラウザの戻る/進むではファイルを保持
- ✅ ヘッダークリック時に適切にファイルクリア
- ✅ ヘルプページからの遷移時はファイル保持（UX配慮）
- ✅ 「別のファイルを解析」ボタンでファイルクリア
- ✅ FileUploaderの表示とFileContextの状態が常に同期

**技術的な特徴**:
- Next.jsの`usePathname`フックを活用
- sessionStorageの特性を最大限に活用
- 条件分岐によるきめ細やかな制御
- 包括的なテストカバレッジ

**ユーザーへのメリット**:
- より直感的な操作フロー
- ヘルプページへの遷移がストレスフリー
- 新規アップロードの意図が明確
- セキュリティとプライバシーの向上
- ファイル状態が予測可能

**ISSUE#09との関係**:
- ISSUE#09: ファイル保持の基盤を構築
- ISSUE#10: 適切なタイミングでのリセット機能を追加
- 両者の組み合わせで理想的なファイル状態管理を実現

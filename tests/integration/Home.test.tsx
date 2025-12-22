import Home from '@/app/page';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// next/linkのモック
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'Link';
  return MockLink;
});

// next/navigationのモック
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// API のモック
jest.mock('@/lib/api', () => ({
  analyzeFile: jest.fn(),
}));

// fileUtilsのモック
jest.mock('@/lib/fileUtils', () => ({
  extractWithStats: jest.fn().mockReturnValue({
    content: 'extracted content',
    originalMessageCount: 1000,
    extractedMessageCount: 500,
  }),
}));

describe('Home (トップページ)', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  describe('基本レンダリング', () => {
    it('ページタイトルが表示される', () => {
      render(<Home />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('LINE流行語大賞 2025');
    });

    it('説明文が表示される', () => {
      render(<Home />);

      expect(screen.getByText('LINEトーク履歴から今年の流行語を分析します')).toBeInTheDocument();
    });

    it('ヘルプリンクが表示される', () => {
      render(<Home />);

      const helpLink = screen.getByRole('link', { name: '📖 トーク履歴の取得方法' });
      expect(helpLink).toBeInTheDocument();
      expect(helpLink).toHaveAttribute('href', '/help');
    });
  });

  describe('プライバシー同意機能', () => {
    it('プライバシー同意チェックボックスが表示される', () => {
      render(<Home />);

      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });
      expect(checkbox).toBeInTheDocument();
    });

    it('プライバシーポリシーへのボタンが表示される', () => {
      render(<Home />);

      const button = screen.getByRole('button', { name: 'プライバシーポリシー' });
      expect(button).toBeInTheDocument();
    });

    it('初期状態ではチェックボックスがチェックされていない', () => {
      render(<Home />);

      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });
      expect(checkbox).not.toBeChecked();
    });

    it('初期状態ではチェックボックスが無効である', () => {
      render(<Home />);

      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });
      expect(checkbox).toBeDisabled();
    });

    it('プライバシーポリシーボタンをクリックするとモーダルが開く', async () => {
      const user = userEvent.setup();
      render(<Home />);

      const policyButton = screen.getByRole('button', { name: 'プライバシーポリシー' });
      await user.click(policyButton);

      expect(screen.getByRole('heading', { name: 'プライバシーポリシー' })).toBeInTheDocument();
      expect(screen.getByText('必須同意項目', { exact: false })).toBeInTheDocument();
    });

    it('モーダルを閉じるとチェックボックスが有効になる', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // モーダルを開く
      const policyButton = screen.getByRole('button', { name: 'プライバシーポリシー' });
      await user.click(policyButton);

      // モーダルを閉じる（フッターのボタンを使用）
      const closeButtons = screen.getAllByRole('button', { name: '閉じる' });
      await user.click(closeButtons[1]); // フッターの閉じるボタン

      // チェックボックスが有効になる
      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });
      expect(checkbox).not.toBeDisabled();
    });

    it('ポリシー確認後、チェックボックスをクリックするとチェック状態が切り替わる', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // モーダルを開いて閉じる
      const policyButton = screen.getByRole('button', { name: 'プライバシーポリシー' });
      await user.click(policyButton);
      const closeButtons = screen.getAllByRole('button', { name: '閉じる' });
      await user.click(closeButtons[1]); // フッターの閉じるボタン

      // チェックボックスをクリック
      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });

      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('解析ボタンの有効/無効制御', () => {
    it('初期状態では解析ボタンが無効である', () => {
      render(<Home />);

      const button = screen.getByRole('button', { name: '解析を開始する' });
      expect(button).toBeDisabled();
    });

    it('ファイル未選択かつ同意なしの場合、適切なメッセージが表示される', () => {
      render(<Home />);

      expect(
        screen.getByText('ファイルを選択し、プライバシーポリシーに同意してください')
      ).toBeInTheDocument();
    });

    it('同意のみの場合、ボタンは無効でファイル選択を促すメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // モーダルを開いて閉じる
      const policyButton = screen.getByRole('button', { name: 'プライバシーポリシー' });
      await user.click(policyButton);
      const closeButtons = screen.getAllByRole('button', { name: '閉じる' });
      await user.click(closeButtons[1]); // フッターの閉じるボタン

      // 同意
      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });
      await user.click(checkbox);

      const button = screen.getByRole('button', { name: '解析を開始する' });
      expect(button).toBeDisabled();
      expect(screen.getByText('ファイルを選択してください')).toBeInTheDocument();
    });

    it('ファイル選択のみの場合、ボタンは無効で同意を促すメッセージが表示される', async () => {
      render(<Home />);

      // ファイルアップロードエリアをクリックしてファイルを選択
      const dropZone = screen.getByRole('button', { name: 'ファイルをアップロード' });
      const fileInput = dropZone.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      // File.text()メソッドをモック
      Object.defineProperty(file, 'text', {
        value: jest.fn().mockResolvedValue('test file content'),
        writable: true,
      });

      // ファイル入力要素に直接ファイルを設定
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      // change イベントを発火
      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      // 抽出処理が完了するまで待つ
      await screen.findByText('ファイル: test.txt');

      const button = screen.getByRole('button', { name: '解析を開始する' });
      expect(button).toBeDisabled();
      expect(screen.getByText('プライバシーポリシーに同意してください')).toBeInTheDocument();
    });

    it('ファイル選択かつ同意済みの場合、ボタンが有効になる', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // ファイルアップロード
      const dropZone = screen.getByRole('button', { name: 'ファイルをアップロード' });
      const fileInput = dropZone.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      // File.text()メソッドをモック
      Object.defineProperty(file, 'text', {
        value: jest.fn().mockResolvedValue('test file content'),
        writable: true,
      });

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      // 抽出処理が完了するまで待つ
      await screen.findByText('ファイル: test.txt');

      // モーダルを開いて閉じる
      const policyButton = screen.getByRole('button', { name: 'プライバシーポリシー' });
      await user.click(policyButton);
      const closeButtons = screen.getAllByRole('button', { name: '閉じる' });
      await user.click(closeButtons[1]); // フッターの閉じるボタン

      // 同意
      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });
      await user.click(checkbox);

      // ボタンが有効化される
      const button = screen.getByRole('button', { name: '解析を開始する' });
      expect(button).toBeEnabled();

      // エラーメッセージが表示されない
      expect(
        screen.queryByText('ファイルを選択し、プライバシーポリシーに同意してください')
      ).not.toBeInTheDocument();
    });

    it('ボタンが有効な場合、適切なスタイルが適用される', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // ファイルアップロード
      const dropZone = screen.getByRole('button', { name: 'ファイルをアップロード' });
      const fileInput = dropZone.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      // File.text()メソッドをモック
      Object.defineProperty(file, 'text', {
        value: jest.fn().mockResolvedValue('test file content'),
        writable: true,
      });

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      // 抽出処理が完了するまで待つ
      await screen.findByText('ファイル: test.txt');

      // モーダルを開いて閉じる
      const policyButton = screen.getByRole('button', { name: 'プライバシーポリシー' });
      await user.click(policyButton);
      const closeButtons = screen.getAllByRole('button', { name: '閉じる' });
      await user.click(closeButtons[1]); // フッターの閉じるボタン

      // 同意
      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });
      await user.click(checkbox);

      const button = screen.getByRole('button', { name: '解析を開始する' });
      expect(button).toHaveClass('bg-blue-600');
      expect(button).not.toHaveClass('bg-gray-400');
    });

    it('ボタンが無効な場合、適切なスタイルが適用される', () => {
      render(<Home />);

      const button = screen.getByRole('button', { name: '解析を開始する' });
      expect(button).toHaveClass('bg-gray-400');
      expect(button).toHaveClass('cursor-not-allowed');
    });
  });

  describe('ファイル名表示', () => {
    it('ファイルアップロード後、ファイル名が表示される', async () => {
      render(<Home />);

      // ファイルアップロード
      const dropZone = screen.getByRole('button', { name: 'ファイルをアップロード' });
      const fileInput = dropZone.querySelector('input[type="file"]') as HTMLInputElement;

      const file = new File(['test content'], 'my_line_chat.txt', { type: 'text/plain' });

      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });

      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      expect(screen.getByText(/ファイル: my_line_chat\.txt/)).toBeInTheDocument();
    });
  });
});

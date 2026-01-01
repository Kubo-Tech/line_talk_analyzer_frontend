/**
 * トップページの統合テスト
 * ファイルアップロード → 同意 → 解析 → 遷移のフローをテスト
 */

import Home from '@/app/page';
import * as api from '@/lib/api';
import { AnalysisResponse } from '@/types/api';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { FileProvider } from '@/contexts/FileContext';

// カスタムrender関数
function render(ui: React.ReactElement) {
  return rtlRender(<FileProvider>{ui}</FileProvider>);
}

// Next.jsのルーターをモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// next/linkのモック
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'Link';
  return MockLink;
});

// APIモジュールをモック
jest.mock('@/lib/api');

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockAnalyzeFile = api.analyzeFile as jest.MockedFunction<typeof api.analyzeFile>;

/**
 * ファイル入力要素を取得してファイルを変更するヘルパー関数
 */
async function uploadFile(user: ReturnType<typeof userEvent.setup>, file: File) {
  const dropZone = screen.getByRole('button', { name: /ファイルをアップロード/ });
  const fileInput = dropZone.querySelector('input[type="file"]') as HTMLInputElement;
  await user.upload(fileInput, file);
}

/**
 * プライバシーポリシーを開いて既読にし、同意するヘルパー関数
 */
async function agreeToPolicy(user: ReturnType<typeof userEvent.setup>) {
  // プライバシーポリシーを開く
  const openPolicyButton = screen.getByRole('button', { name: /プライバシーポリシー/ });
  await user.click(openPolicyButton);

  // モーダルが表示されるまで待つ
  await waitFor(() => {
    expect(screen.getByText(/必須同意項目/)).toBeInTheDocument();
  });

  // モーダルを閉じる（フッターのボタンを使用）
  const closeButtons = screen.getAllByRole('button', { name: /閉じる/ });
  await user.click(closeButtons[1]); // フッターの閉じるボタン

  // モーダルが閉じるまで待つ
  await waitFor(() => {
    expect(screen.queryByText(/必須同意項目/)).not.toBeInTheDocument();
  });

  // チェックボックスが有効になるまで待つ
  const consentCheckbox = await waitFor(() => {
    const checkbox = screen.getByRole('checkbox', { name: /プライバシーポリシーに同意する/ });
    expect(checkbox).not.toBeDisabled();
    return checkbox;
  });

  // 同意チェックボックスをチェック
  await user.click(consentCheckbox);
}

describe('トップページ - 解析フロー統合テスト', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });

    // sessionStorage のモック
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  const mockResponse: AnalysisResponse = {
    status: 'success',
    data: {
      analysis_period: {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      },
      total_messages: 100,
      total_users: 2,
      morphological_analysis: {
        top_words: [
          {
            word: 'テスト',
            count: 10,
            part_of_speech: '名詞',
          },
        ],
      },
      full_message_analysis: {
        top_messages: [
          {
            message: 'こんにちは',
            count: 5,
          },
        ],
      },
      user_analysis: {
        word_analysis: [],
        message_analysis: [],
      },
    },
  };

  describe('正常系フロー', () => {
    it('ファイルアップロード → 同意 → 解析 → 結果ページへ遷移', async () => {
      const user = userEvent.setup();
      mockAnalyzeFile.mockResolvedValue(mockResponse);

      render(<Home />);

      // 初期状態: 解析ボタンは無効
      const analyzeButton = screen.getByRole('button', { name: /解析を開始する/ });
      expect(analyzeButton).toBeDisabled();

      // ファイルをアップロード
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      await uploadFile(user, file);

      // ファイル名が表示される
      await waitFor(() => {
        expect(screen.getByText('test.txt')).toBeInTheDocument();
      });

      // まだボタンは無効（同意していない）
      expect(analyzeButton).toBeDisabled();

      // プライバシーポリシーに同意
      await agreeToPolicy(user);

      // ボタンが有効化される
      await waitFor(() => {
        expect(analyzeButton).not.toBeDisabled();
      });

      // 解析ボタンをクリック
      await user.click(analyzeButton);

      // API呼び出しが行われる
      await waitFor(() => {
        expect(mockAnalyzeFile).toHaveBeenCalledWith({
          file,
          top_n: 100,
          start_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          end_date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          min_word_length: 1,
          max_word_length: undefined,
          min_message_length: 2,
          max_message_length: undefined,
          min_word_count: 2,
          min_message_count: 2,
        });
      });

      // sessionStorageに結果が保存される
      await waitFor(() => {
        expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
          'analysisResult',
          JSON.stringify(mockResponse)
        );
      });

      // 結果ページへ遷移
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/result');
      });
    });

    it('エラー時にエラーメッセージが表示され、遷移しない', async () => {
      const user = userEvent.setup();
      const errorMessage = 'ファイルの形式が無効です';
      mockAnalyzeFile.mockRejectedValue(new Error(errorMessage));

      render(<Home />);

      // ファイルをアップロード
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      await uploadFile(user, file);

      // プライバシーポリシーに同意
      await agreeToPolicy(user);

      // 解析ボタンをクリック
      const analyzeButton = screen.getByRole('button', { name: /解析を開始する/ });
      await user.click(analyzeButton);

      // エラーメッセージが表示される
      await waitFor(() => {
        expect(screen.getByText(/エラーが発生しました/)).toBeInTheDocument();
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      // 遷移しない
      expect(mockPush).not.toHaveBeenCalled();
      // 解析結果がsessionStorageに保存されていないことを確認
      expect(window.sessionStorage.getItem('analysisResult')).toBeFalsy();
    });
  });

  describe('バリデーション', () => {
    it('ファイルなし・同意なし: ボタン無効', () => {
      render(<Home />);

      const analyzeButton = screen.getByRole('button', { name: /解析を開始する/ });
      expect(analyzeButton).toBeDisabled();
      expect(
        screen.getByText(/ファイルを選択し、プライバシーポリシーに同意してください/)
      ).toBeInTheDocument();
    });

    it('ファイルあり・同意なし: ボタン無効', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // ファイルをアップロード
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      await uploadFile(user, file);

      const analyzeButton = screen.getByRole('button', { name: /解析を開始する/ });
      expect(analyzeButton).toBeDisabled();
      await waitFor(() => {
        expect(screen.getByText(/プライバシーポリシーに同意してください/)).toBeInTheDocument();
      });
    });

    it('ファイルなし・同意あり: ボタン無効', async () => {
      const user = userEvent.setup();
      render(<Home />);

      // プライバシーポリシーに同意
      await agreeToPolicy(user);

      const analyzeButton = screen.getByRole('button', { name: /解析を開始する/ });
      expect(analyzeButton).toBeDisabled();
      await waitFor(() => {
        expect(screen.getByText(/ファイルを選択してください/)).toBeInTheDocument();
      });
    });
  });

  describe('ローディング中の制御', () => {
    it('解析中はボタンが無効化される', async () => {
      const user = userEvent.setup();
      // 解析に十分な時間がかかるようにモック
      let resolveAnalyze: (value: AnalysisResponse) => void;
      const analyzePromise = new Promise<AnalysisResponse>((resolve) => {
        resolveAnalyze = resolve;
      });
      mockAnalyzeFile.mockImplementation(() => analyzePromise);

      render(<Home />);

      // ファイルをアップロード
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
      await uploadFile(user, file);

      // プライバシーポリシーに同意
      await agreeToPolicy(user);

      // 解析ボタンをクリック
      const analyzeButton = screen.getByRole('button', { name: /解析を開始する/ });
      await user.click(analyzeButton);

      // 少し待ってからボタンの状態を確認
      await waitFor(() => {
        expect(analyzeButton).toBeDisabled();
      });

      // テストのクリーンアップのために解析を完了させる
      resolveAnalyze!(mockResponse);
    });
  });
});

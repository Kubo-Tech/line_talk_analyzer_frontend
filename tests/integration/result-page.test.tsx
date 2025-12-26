import { render as rtlRender, screen, fireEvent, waitFor } from '@testing-library/react';
import ResultPage from '@/app/result/page';
import { useRouter } from 'next/navigation';
import { AnalysisResponse } from '@/types/api';
import { FileProvider } from '@/contexts/FileContext';

// カスタムrender関数
function render(ui: React.ReactElement) {
  return rtlRender(<FileProvider>{ui}</FileProvider>);
}

// Next.jsのuseRouterをモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

describe('ResultPage 統合テスト', () => {
  const mockResult: AnalysisResponse = {
    status: 'success',
    data: {
      analysis_period: {
        start_date: '2025-01-01',
        end_date: '2025-12-31',
      },
      total_messages: 1000,
      total_users: 3,
      morphological_analysis: {
        top_words: Array.from({ length: 50 }, (_, i) => ({
          word: `単語${i + 1}`,
          count: 50 - i,
          part_of_speech: '名詞',
          appearances: [],
        })),
      },
      full_message_analysis: {
        top_messages: Array.from({ length: 50 }, (_, i) => ({
          message: `メッセージ${i + 1}`,
          count: 50 - i,
          appearances: [],
        })),
      },
      user_analysis: {
        word_analysis: [
          {
            user: '太郎',
            top_words: Array.from({ length: 20 }, (_, i) => ({
              word: `太郎単語${i + 1}`,
              count: 20 - i,
              part_of_speech: '名詞',
              appearances: [],
            })),
          },
          {
            user: '花子',
            top_words: Array.from({ length: 20 }, (_, i) => ({
              word: `花子単語${i + 1}`,
              count: 20 - i,
              part_of_speech: '名詞',
              appearances: [],
            })),
          },
        ],
        message_analysis: [
          {
            user: '太郎',
            top_messages: Array.from({ length: 20 }, (_, i) => ({
              message: `太郎メッセージ${i + 1}`,
              count: 20 - i,
              appearances: [],
            })),
          },
          {
            user: '花子',
            top_messages: Array.from({ length: 20 }, (_, i) => ({
              message: `花子メッセージ${i + 1}`,
              count: 20 - i,
              appearances: [],
            })),
          },
        ],
      },
    },
  };

  beforeEach(() => {
    // sessionStorageをモック
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: jest.fn(() => JSON.stringify(mockResult)),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
    mockPush.mockClear();
  });

  describe('全体表示', () => {
    it('ページ全体が正しくレンダリングされる', async () => {
      render(<ResultPage />);

      await waitFor(() => {
        expect(screen.getByText('解析結果')).toBeInTheDocument();
      });

      // 解析情報
      expect(screen.getByText('解析情報')).toBeInTheDocument();
      expect(screen.getByText(/1,000件/)).toBeInTheDocument();

      // タブ
      expect(screen.getByText('全体')).toBeInTheDocument();
      expect(screen.getByText('太郎')).toBeInTheDocument();
      expect(screen.getByText('花子')).toBeInTheDocument();

      // ランキング
      expect(screen.getAllByText('🏆 流行語大賞 TOP10').length).toBeGreaterThan(0);
      expect(screen.getAllByText('💬 流行メッセージ TOP10').length).toBeGreaterThan(0);

      // アクションボタン
      expect(screen.getByText('別のファイルを解析')).toBeInTheDocument();
    });
  });

  describe('タブ切り替え', () => {
    it('初期状態では全体のランキングを表示する', async () => {
      render(<ResultPage />);

      await waitFor(() => {
        expect(screen.getAllByText('単語1').length).toBeGreaterThan(0);
        expect(screen.getAllByText('メッセージ1').length).toBeGreaterThan(0);
      });
    });

    it('ユーザータブをクリックすると該当ユーザーのランキングに切り替わる', async () => {
      render(<ResultPage />);

      await waitFor(() => {
        expect(screen.getAllByText('単語1').length).toBeGreaterThan(0);
      });

      // 太郎タブをクリック
      const taroTab = screen.getByText('太郎');
      fireEvent.click(taroTab);

      await waitFor(() => {
        expect(screen.getAllByText('太郎単語1').length).toBeGreaterThan(0);
        expect(screen.getAllByText('太郎メッセージ1').length).toBeGreaterThan(0);
        expect(screen.queryByText('単語1')).not.toBeInTheDocument();
      });

      // 花子タブをクリック
      const hanakoTab = screen.getByText('花子');
      fireEvent.click(hanakoTab);

      await waitFor(() => {
        expect(screen.getAllByText('花子単語1').length).toBeGreaterThan(0);
        expect(screen.getAllByText('花子メッセージ1').length).toBeGreaterThan(0);
        expect(screen.queryByText('太郎単語1')).not.toBeInTheDocument();
      });

      // 全体タブに戻る
      const allTab = screen.getByText('全体');
      fireEvent.click(allTab);

      await waitFor(() => {
        expect(screen.getAllByText('単語1').length).toBeGreaterThan(0);
        expect(screen.queryByText('花子単語1')).not.toBeInTheDocument();
      });
    });
  });

  describe('もっと見る機能', () => {
    it('もっと見るボタンをクリックすると追加のランキングが表示される', async () => {
      render(<ResultPage />);

      await waitFor(() => {
        expect(screen.getAllByText('単語10').length).toBeGreaterThan(0);
      });

      // 初期状態では11件目以降は非表示
      expect(screen.queryByText('単語11')).not.toBeInTheDocument();

      // もっと見るボタンをクリック
      const moreButtons = screen.getAllByText('もっと見る（100位まで）');
      fireEvent.click(moreButtons[0]); // 流行語のもっと見るボタン

      await waitFor(() => {
        expect(screen.getAllByText('単語11').length).toBeGreaterThan(0);
        expect(screen.getAllByText('単語50').length).toBeGreaterThan(0);
      });
    });
  });

  describe('データ未取得時の処理', () => {
    it('sessionStorageにデータがない場合はトップページにリダイレクトする', () => {
      (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);

      render(<ResultPage />);

      expect(mockPush).toHaveBeenCalledWith('/');
    });

    it('データが不正な場合はトップページにリダイレクトする', () => {
      (window.sessionStorage.getItem as jest.Mock).mockReturnValue('invalid json');

      render(<ResultPage />);

      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });
});

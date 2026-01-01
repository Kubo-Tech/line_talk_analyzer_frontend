import Home from '@/app/page';
import { FileProvider } from '@/contexts/FileContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';

// next/navigationのモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

const renderWithProviders = () => {
  return render(
    <ThemeProvider>
      <FileProvider>
        <Home />
      </FileProvider>
    </ThemeProvider>
  );
};

describe('Home page', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.useFakeTimers();
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  beforeAll(() => {
    // window.matchMediaのモック
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // fetchのモック
    global.fetch = jest.fn();
  });

  describe('タイトル表示', () => {
    it('1月の場合はタイトルに前年が表示される', () => {
      jest.setSystemTime(new Date('2026-01-01'));
      renderWithProviders();

      expect(screen.getByRole('heading', { name: /LINE流行語大賞 2025/i })).toBeInTheDocument();
    });

    it('2月の場合はタイトルに現在の年が表示される', () => {
      jest.setSystemTime(new Date('2026-02-01'));
      renderWithProviders();

      expect(screen.getByRole('heading', { name: /LINE流行語大賞 2026/i })).toBeInTheDocument();
    });

    it('12月の場合はタイトルに現在の年が表示される', () => {
      jest.setSystemTime(new Date('2026-12-31'));
      renderWithProviders();

      expect(screen.getByRole('heading', { name: /LINE流行語大賞 2026/i })).toBeInTheDocument();
    });
  });

  describe('基本レンダリング', () => {
    it('説明文が表示される', () => {
      renderWithProviders();

      expect(screen.getByText('LINEトーク履歴から今年の流行語を分析します')).toBeInTheDocument();
    });

    it('ヘルプリンクが表示される', () => {
      renderWithProviders();

      const helpLink = screen.getByRole('link', { name: /トーク履歴の取得方法/i });
      expect(helpLink).toBeInTheDocument();
      expect(helpLink).toHaveAttribute('href', '/help');
    });

    it('解析開始ボタンが表示される', () => {
      renderWithProviders();

      expect(screen.getByRole('button', { name: /解析を開始する/i })).toBeInTheDocument();
    });

    it('設定変更ボタンが表示される', () => {
      renderWithProviders();

      expect(screen.getByRole('button', { name: /設定変更/i })).toBeInTheDocument();
    });
  });
});

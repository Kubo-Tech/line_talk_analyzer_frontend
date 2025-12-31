import Header from '@/components/common/Header';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { render, screen } from '@testing-library/react';

const renderWithTheme = () => {
  return render(
    <ThemeProvider>
      <Header />
    </ThemeProvider>
  );
};

describe('Header', () => {
  beforeAll(() => {
    // window.matchMediaのモックを追加
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
  });

  it('正しくレンダリングされる', () => {
    renderWithTheme();

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('タイトルが表示される', () => {
    renderWithTheme();

    expect(screen.getByText('LINE流行語大賞 2025')).toBeInTheDocument();
  });

  it('ホームへのリンクが正しく設定されている', () => {
    renderWithTheme();

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('アイコンが表示される', () => {
    renderWithTheme();

    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  describe('ダークモード対応', () => {
    it('ヘッダーに背景クラスが適用される', () => {
      renderWithTheme();

      const header = screen.getByRole('banner');
      // bg-primaryクラスが適用されている
      expect(header.className).toContain('bg-primary');
    });

    it('ThemeToggleボタンが表示される', () => {
      renderWithTheme();

      const toggleButton = screen.getByRole('button', { name: /テーマを切り替える/i });
      expect(toggleButton).toBeInTheDocument();
    });
  });
});

import Header from '@/components/common/Header';
import { FileProvider } from '@/contexts/FileContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { render, screen } from '@testing-library/react';
import { usePathname, useRouter } from 'next/navigation';

// next/navigationのモック
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;
const mockUsePathname = usePathname as jest.Mock;

const renderWithTheme = () => {
  return render(
    <ThemeProvider>
      <FileProvider>
        <Header />
      </FileProvider>
    </ThemeProvider>
  );
};

describe('Header', () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    });
    mockUsePathname.mockReturnValue('/');
  });

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

  describe('ファイルクリア機能', () => {
    it('トップページからヘッダーをクリックした場合、ファイルがクリアされる', async () => {
      mockUsePathname.mockReturnValue('/');
      
      renderWithTheme();

      // ファイルをsessionStorageに設定
      const fileInfo = { name: 'test.txt', type: 'text/plain', size: 100 };
      sessionStorage.setItem('uploaded_file_info', JSON.stringify(fileInfo));
      sessionStorage.setItem('uploaded_file_content', 'test content');

      const link = screen.getByRole('link');
      link.click();

      // ファイル情報がクリアされることを確認（非同期処理なので少し待つ）
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      expect(sessionStorage.getItem('uploaded_file_info')).toBeNull();
      expect(sessionStorage.getItem('uploaded_file_content')).toBeNull();
    });

    it('ヘルプページからヘッダーをクリックした場合、ファイルが保持される', async () => {
      mockUsePathname.mockReturnValue('/help');
      
      renderWithTheme();

      // ファイルをsessionStorageに設定
      const fileInfo = { name: 'test.txt', type: 'text/plain', size: 100 };
      sessionStorage.setItem('uploaded_file_info', JSON.stringify(fileInfo));
      sessionStorage.setItem('uploaded_file_content', 'test content');

      const link = screen.getByRole('link');
      link.click();

      // ファイル情報が保持されることを確認（非同期処理なので少し待つ）
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      expect(sessionStorage.getItem('uploaded_file_info')).toBe(JSON.stringify(fileInfo));
      expect(sessionStorage.getItem('uploaded_file_content')).toBe('test content');
    });

    it('結果ページからヘッダーをクリックした場合、ファイルがクリアされる', async () => {
      mockUsePathname.mockReturnValue('/result');
      
      renderWithTheme();

      // ファイルをsessionStorageに設定
      const fileInfo = { name: 'test.txt', type: 'text/plain', size: 100 };
      sessionStorage.setItem('uploaded_file_info', JSON.stringify(fileInfo));
      sessionStorage.setItem('uploaded_file_content', 'test content');

      const link = screen.getByRole('link');
      link.click();

      // ファイル情報がクリアされることを確認（非同期処理なので少し待つ）
      await new Promise((resolve) => setTimeout(resolve, 50));
      
      expect(sessionStorage.getItem('uploaded_file_info')).toBeNull();
      expect(sessionStorage.getItem('uploaded_file_content')).toBeNull();
    });
  });
});

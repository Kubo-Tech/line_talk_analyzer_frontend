import ThemeToggle from '@/components/common/ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const renderWithTheme = () => {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
};

describe('ThemeToggle', () => {
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

  beforeEach(() => {
    // localStorageをクリア
    localStorage.clear();
    // ダークモードクラスをリセット
    document.documentElement.classList.remove('dark');
  });

  it('テーマ切り替えボタンが表示される', () => {
    renderWithTheme();

    const button = screen.getByRole('button', { name: /テーマを切り替える/i });
    expect(button).toBeInTheDocument();
  });

  it('初期状態（ライトモード）では太陽アイコンが表示される', () => {
    renderWithTheme();

    const button = screen.getByRole('button', { name: /テーマを切り替える/i });
    // SVGの太陽アイコンのpathが含まれていることを確認
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
    const path = svg?.querySelector('path');
    expect(path?.getAttribute('d')).toContain('M12 3v2.25m6.364');
  });

  it('ボタンをクリックするとテーマが切り替わる', async () => {
    const user = userEvent.setup();
    renderWithTheme();

    const button = screen.getByRole('button', { name: /テーマを切り替える/i });

    // 初期状態はライトモード
    expect(button).toHaveAttribute('title', 'ダークモードに切り替え');

    // クリックしてダークモードに切り替え
    await user.click(button);

    // ダークモードに切り替わったことを確認
    expect(button).toHaveAttribute('title', 'ライトモードに切り替え');
  });

  it('ダークモード時は月アイコンが表示される', async () => {
    const user = userEvent.setup();
    renderWithTheme();

    const button = screen.getByRole('button', { name: /テーマを切り替える/i });

    // ダークモードに切り替え
    await user.click(button);

    // SVGの月アイコンのpathが含まれていることを確認
    const svg = button.querySelector('svg');
    expect(svg).toBeInTheDocument();
    const path = svg?.querySelector('path');
    expect(path?.getAttribute('d')).toContain('M21.752 15.002');
  });

  it('テーマの変更がlocalStorageに保存される', async () => {
    const user = userEvent.setup();
    renderWithTheme();

    const button = screen.getByRole('button', { name: /テーマを切り替える/i });

    // ダークモードに切り替え
    await user.click(button);

    // localStorageに保存されていることを確認
    expect(localStorage.getItem('theme')).toBe('dark');

    // ライトモードに戻す
    await user.click(button);

    // localStorageが更新されていることを確認
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('複数回クリックしても正しく切り替わる', async () => {
    const user = userEvent.setup();
    renderWithTheme();

    const button = screen.getByRole('button', { name: /テーマを切り替える/i });

    // 初期状態：ライトモード
    expect(button).toHaveAttribute('title', 'ダークモードに切り替え');

    // 1回目：ダークモード
    await user.click(button);
    expect(button).toHaveAttribute('title', 'ライトモードに切り替え');

    // 2回目：ライトモード
    await user.click(button);
    expect(button).toHaveAttribute('title', 'ダークモードに切り替え');

    // 3回目：ダークモード
    await user.click(button);
    expect(button).toHaveAttribute('title', 'ライトモードに切り替え');
  });
});

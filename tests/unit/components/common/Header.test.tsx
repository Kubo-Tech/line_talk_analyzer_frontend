import Header from '@/components/common/Header';
import { render, screen } from '@testing-library/react';

describe('Header', () => {
  it('正しくレンダリングされる', () => {
    render(<Header />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('タイトルが表示される', () => {
    render(<Header />);

    expect(screen.getByText('LINE流行語大賞 2025')).toBeInTheDocument();
  });

  it('ホームへのリンクが正しく設定されている', () => {
    render(<Header />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/');
  });

  it('アイコンが表示される', () => {
    render(<Header />);

    expect(screen.getByText('📊')).toBeInTheDocument();
  });
});

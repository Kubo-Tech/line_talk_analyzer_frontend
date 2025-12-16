import Loading from '@/components/common/Loading';
import { render, screen } from '@testing-library/react';

describe('Loading', () => {
  it('スピナーが表示される', () => {
    render(<Loading />);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('カスタムメッセージが表示される', () => {
    render(<Loading message="処理中です..." />);

    expect(screen.getByText('処理中です...')).toBeInTheDocument();
  });

  it('overlayモードで表示される', () => {
    const { container } = render(<Loading overlay />);

    const overlayElement = container.querySelector('.fixed.inset-0');
    expect(overlayElement).toBeInTheDocument();
    expect(overlayElement).toHaveClass('bg-black', 'bg-opacity-50');
  });

  it('overlay無しで表示される', () => {
    const { container } = render(<Loading />);

    const overlayElement = container.querySelector('.fixed.inset-0');
    expect(overlayElement).not.toBeInTheDocument();
  });

  it('メッセージなしで表示される', () => {
    render(<Loading message="" />);

    expect(screen.queryByText('読み込み中...')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

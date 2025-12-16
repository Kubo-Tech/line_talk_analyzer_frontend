import Button from '@/components/common/Button';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Button', () => {
  it('クリックイベントが発火する', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>クリック</Button>);

    const button = screen.getByRole('button', { name: 'クリック' });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled状態でクリックが無効になる', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} disabled>
        クリック
      </Button>
    );

    const button = screen.getByRole('button', { name: 'クリック' });
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });

  it('ローディング状態が表示される', () => {
    render(<Button isLoading>送信</Button>);

    expect(screen.getByText('処理中...')).toBeInTheDocument();
    expect(screen.queryByText('送信')).not.toBeInTheDocument();
  });

  it('primary variantのスタイルが適用される', () => {
    render(<Button variant="primary">ボタン</Button>);

    const button = screen.getByRole('button', { name: 'ボタン' });
    expect(button).toHaveClass('bg-primary');
  });

  it('secondary variantのスタイルが適用される', () => {
    render(<Button variant="secondary">ボタン</Button>);

    const button = screen.getByRole('button', { name: 'ボタン' });
    expect(button).toHaveClass('bg-gray-200');
  });

  it('outline variantのスタイルが適用される', () => {
    render(<Button variant="outline">ボタン</Button>);

    const button = screen.getByRole('button', { name: 'ボタン' });
    expect(button).toHaveClass('border-2');
  });

  it('ローディング中はdisabledになる', () => {
    const handleClick = jest.fn();
    render(
      <Button onClick={handleClick} isLoading>
        送信
      </Button>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import UserTabs from '@/components/result/UserTabs';

describe('UserTabs', () => {
  const mockUsers = ['太郎', '花子', '次郎'];
  const mockOnUserChange = jest.fn();

  beforeEach(() => {
    mockOnUserChange.mockClear();
  });

  it('全体タブとユーザータブを表示する', () => {
    render(<UserTabs users={mockUsers} activeUser="全体" onUserChange={mockOnUserChange} />);

    expect(screen.getByText('全体')).toBeInTheDocument();
    expect(screen.getByText('太郎')).toBeInTheDocument();
    expect(screen.getByText('花子')).toBeInTheDocument();
    expect(screen.getByText('次郎')).toBeInTheDocument();
  });

  it('アクティブなタブに青いボーダーを適用する', () => {
    render(<UserTabs users={mockUsers} activeUser="全体" onUserChange={mockOnUserChange} />);

    const activeTab = screen.getByText('全体');
    expect(activeTab).toHaveClass('border-blue-600');
    expect(activeTab).toHaveClass('text-blue-600');
  });

  it('非アクティブなタブに透明なボーダーを適用する', () => {
    render(<UserTabs users={mockUsers} activeUser="全体" onUserChange={mockOnUserChange} />);

    const inactiveTab = screen.getByText('太郎');
    expect(inactiveTab).toHaveClass('border-transparent');
    expect(inactiveTab).toHaveClass('text-gray-500');
  });

  it('タブをクリックするとonUserChangeが呼ばれる', () => {
    render(<UserTabs users={mockUsers} activeUser="全体" onUserChange={mockOnUserChange} />);

    const taroTab = screen.getByText('太郎');
    fireEvent.click(taroTab);

    expect(mockOnUserChange).toHaveBeenCalledWith('太郎');
    expect(mockOnUserChange).toHaveBeenCalledTimes(1);
  });

  it('複数のタブを順番にクリックできる', () => {
    render(<UserTabs users={mockUsers} activeUser="全体" onUserChange={mockOnUserChange} />);

    fireEvent.click(screen.getByText('花子'));
    expect(mockOnUserChange).toHaveBeenCalledWith('花子');

    fireEvent.click(screen.getByText('次郎'));
    expect(mockOnUserChange).toHaveBeenCalledWith('次郎');

    fireEvent.click(screen.getByText('全体'));
    expect(mockOnUserChange).toHaveBeenCalledWith('全体');

    expect(mockOnUserChange).toHaveBeenCalledTimes(3);
  });

  it('ユーザーが0人の場合でも全体タブは表示される', () => {
    render(<UserTabs users={[]} activeUser="全体" onUserChange={mockOnUserChange} />);

    expect(screen.getByText('全体')).toBeInTheDocument();
  });
});

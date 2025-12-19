import { PrivacyPolicyModal } from '@/components/common/PrivacyPolicyModal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('PrivacyPolicyModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('表示/非表示', () => {
    it('isOpen=falseの場合、モーダルが表示されない', () => {
      render(<PrivacyPolicyModal isOpen={false} onClose={mockOnClose} />);

      expect(
        screen.queryByRole('heading', { name: 'プライバシーポリシー' })
      ).not.toBeInTheDocument();
    });

    it('isOpen=trueの場合、モーダルが表示される', () => {
      render(<PrivacyPolicyModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('heading', { name: 'プライバシーポリシー' })).toBeInTheDocument();
    });
  });

  describe('コンテンツ', () => {
    beforeEach(() => {
      render(<PrivacyPolicyModal isOpen={true} onClose={mockOnClose} />);
    });

    it('タイトルが表示される', () => {
      expect(screen.getByRole('heading', { name: 'プライバシーポリシー' })).toBeInTheDocument();
    });

    it('重要事項セクションが表示される', () => {
      expect(screen.getByText('必須同意項目', { exact: false })).toBeInTheDocument();
      expect(screen.getByText(/個人が開発した非公式ツール/)).toBeInTheDocument();
    });

    it('データの取り扱いセクションが表示される', () => {
      expect(screen.getByText('データの取り扱い', { exact: false })).toBeInTheDocument();
      expect(screen.getByText(/ファイルの保存/)).toBeInTheDocument();
      expect(screen.getByText(/ディスクに書き込まない/)).toBeInTheDocument();
    });

    it('推奨事項セクションが表示される', () => {
      expect(screen.getByText('推奨事項', { exact: false })).toBeInTheDocument();
      expect(screen.getByText(/プライベートブラウジング/)).toBeInTheDocument();
    });

    it('Cookie・ローカルストレージセクションが表示される', () => {
      const elements = screen.getAllByText(/Cookie.*ローカルストレージ/, { exact: false });
      expect(elements.length).toBeGreaterThan(0);
    });

    it('プライバシーポリシーの変更セクションが表示される', () => {
      expect(screen.getByText('プライバシーポリシーの変更', { exact: false })).toBeInTheDocument();
    });

    it('お問い合わせセクションが表示される', () => {
      const elements = screen.getAllByText('お問い合わせ', { exact: false });
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('閉じるボタン', () => {
    it('×ボタンが表示される', () => {
      render(<PrivacyPolicyModal isOpen={true} onClose={mockOnClose} />);

      const closeButtons = screen.getAllByRole('button', { name: '閉じる' });
      expect(closeButtons.length).toBe(2); // ヘッダーとフッターの2つ
    });

    it('×ボタンをクリックするとonCloseが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<PrivacyPolicyModal isOpen={true} onClose={mockOnClose} />);

      const closeButtons = screen.getAllByRole('button', { name: '閉じる' });
      await user.click(closeButtons[0]); // ヘッダーの×ボタン

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('フッターの閉じるボタンをクリックするとonCloseが呼ばれる', async () => {
      const user = userEvent.setup();
      render(<PrivacyPolicyModal isOpen={true} onClose={mockOnClose} />);

      const closeButtons = screen.getAllByRole('button', { name: '閉じる' });
      await user.click(closeButtons[1]); // フッターの閉じるボタン

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('スタイリング', () => {
    it('モーダルオーバーレイに適切なスタイルが適用される', () => {
      const { container } = render(<PrivacyPolicyModal isOpen={true} onClose={mockOnClose} />);

      const overlay = container.querySelector('.fixed.inset-0');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('bg-black', 'bg-opacity-50');
    });

    it('モーダルコンテンツに適切なスタイルが適用される', () => {
      const { container } = render(<PrivacyPolicyModal isOpen={true} onClose={mockOnClose} />);

      const modalContent = container.querySelector('.bg-white.rounded-lg');
      expect(modalContent).toBeInTheDocument();
      expect(modalContent).toHaveClass('shadow-xl');
    });
  });
});

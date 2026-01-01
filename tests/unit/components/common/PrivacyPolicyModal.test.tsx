import { PrivacyPolicyModal } from '@/components/common/PrivacyPolicyModal';
import { APP_INFO } from '@/lib/constants';
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

    it('GitHubリポジトリのリンクが表示される', () => {
      const frontendLink = screen.getByRole('link', { name: 'line_talk_analyzer_frontend' });
      expect(frontendLink).toHaveAttribute('href', APP_INFO.GITHUB_REPO_FRONTEND);
      expect(frontendLink).toHaveAttribute('target', '_blank');
      expect(frontendLink).toHaveAttribute('rel', 'noopener noreferrer');

      const backendLink = screen.getByRole('link', { name: 'line_talk_analyzer_backend' });
      expect(backendLink).toHaveAttribute('href', APP_INFO.GITHUB_REPO_BACKEND);
      expect(backendLink).toHaveAttribute('target', '_blank');
      expect(backendLink).toHaveAttribute('rel', 'noopener noreferrer');
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

  describe('ダークモード対応', () => {
    beforeEach(() => {
      render(<PrivacyPolicyModal isOpen={true} onClose={mockOnClose} />);
    });

    it('モーダル背景にダークモードクラスが適用されている', () => {
      const heading = screen.getByRole('heading', { name: 'プライバシーポリシー' });
      const modal = heading.closest('.bg-white');
      expect(modal?.className).toContain('dark:bg-gray-800');
    });

    it('タイトルにダークモードクラスが適用されている', () => {
      const heading = screen.getByRole('heading', { name: 'プライバシーポリシー' });
      expect(heading.className).toContain('dark:text-gray-100');
    });

    it('セクション見出しにダークモードクラスが適用されている', () => {
      const sectionHeading = screen.getByText('必須同意項目');
      expect(sectionHeading.className).toContain('dark:text-gray-100');
    });

    it('本文テキストにダークモードクラスが適用されている', () => {
      const textElement = screen.getByText(/本サービスを利用する前に/);
      expect(textElement.className).toContain('dark:text-gray-300');
    });

    it('リストアイテムにダークモードクラスが適用されている', () => {
      const listItem = screen.getByText(/現状有姿/);
      const list = listItem.closest('ul');
      expect(list?.className).toContain('dark:text-gray-300');
    });

    it('テーブルにダークモードクラスが適用されている', () => {
      const tableHeaders = screen.getAllByRole('columnheader');
      const firstHeader = tableHeaders[0];
      expect(firstHeader.className).toContain('dark:border-gray-600');
      expect(firstHeader.className).toContain('dark:text-gray-200');
    });

    it('テーブルのデータセルにダークモードクラスが適用されている', () => {
      const cells = screen.getAllByRole('cell');
      const firstCell = cells[0];
      expect(firstCell.className).toContain('dark:border-gray-600');
      expect(firstCell.className).toContain('dark:text-gray-300');
    });

    it('リンクにダークモードクラスが適用されている', () => {
      const links = screen.getAllByRole('link');
      const githubLink = links.find((link) => link.textContent?.includes('line_talk_analyzer'));
      expect(githubLink?.className).toContain('dark:text-blue-400');
    });

    it('閉じるボタンにダークモードクラスが適用されている', () => {
      const closeButtons = screen.getAllByRole('button', { name: '閉じる' });
      const headerCloseButton = closeButtons[0];
      expect(headerCloseButton.className).toContain('dark:text-gray-400');
      expect(headerCloseButton.className).toContain('dark:hover:bg-gray-700');
    });

    it('ボーダーにダークモードクラスが適用されている', () => {
      const heading = screen.getByRole('heading', { name: 'プライバシーポリシー' });
      const header = heading.closest('.border-b');
      expect(header?.className).toContain('dark:border-gray-700');
    });
  });
});

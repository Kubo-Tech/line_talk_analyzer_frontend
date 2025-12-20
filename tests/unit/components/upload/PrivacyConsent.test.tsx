import { PrivacyConsent } from '@/components/upload/PrivacyConsent';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('PrivacyConsent', () => {
  const defaultProps = {
    isConsented: false,
    hasReadPolicy: false,
    onConsentChange: jest.fn(),
    onOpenPolicy: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('レンダリング', () => {
    it('チェックボックスが表示される', () => {
      render(<PrivacyConsent {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });
      expect(checkbox).toBeInTheDocument();
    });

    it('プライバシーポリシーへのボタンが表示される', () => {
      render(<PrivacyConsent {...defaultProps} />);

      const button = screen.getByRole('button', { name: 'プライバシーポリシー' });
      expect(button).toBeInTheDocument();
    });
  });

  describe('チェックボックスの動作', () => {
    it('チェックボックスがfalseの場合、チェックされていない', () => {
      render(<PrivacyConsent {...defaultProps} hasReadPolicy={true} isConsented={false} />);

      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });
      expect(checkbox).not.toBeChecked();
    });

    it('チェックボックスがtrueの場合、チェックされている', () => {
      render(<PrivacyConsent {...defaultProps} hasReadPolicy={true} isConsented={true} />);

      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });
      expect(checkbox).toBeChecked();
    });

    it('ポリシー既読の場合、チェックボックスをクリックするとonConsentChangeが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnConsentChange = jest.fn();
      render(
        <PrivacyConsent
          {...defaultProps}
          hasReadPolicy={true}
          onConsentChange={mockOnConsentChange}
        />
      );

      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });
      await user.click(checkbox);

      expect(mockOnConsentChange).toHaveBeenCalledTimes(1);
    });

    it('ポリシー未読の場合、チェックボックスが無効である', () => {
      render(<PrivacyConsent {...defaultProps} hasReadPolicy={false} />);

      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });
      expect(checkbox).toBeDisabled();
    });

    it('ポリシー既読の場合、チェックボックスが有効である', () => {
      render(<PrivacyConsent {...defaultProps} hasReadPolicy={true} />);

      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });
      expect(checkbox).not.toBeDisabled();
    });
  });

  describe('プライバシーポリシーボタン', () => {
    it('ボタンをクリックするとonOpenPolicyが呼ばれる', async () => {
      const user = userEvent.setup();
      const mockOnOpenPolicy = jest.fn();
      render(<PrivacyConsent {...defaultProps} onOpenPolicy={mockOnOpenPolicy} />);

      const button = screen.getByRole('button', { name: 'プライバシーポリシー' });
      await user.click(button);

      expect(mockOnOpenPolicy).toHaveBeenCalledTimes(1);
    });
  });

  describe('スタイリング', () => {
    it('ポリシー未読の場合、チェックボックスに無効スタイルが適用される', () => {
      render(<PrivacyConsent {...defaultProps} hasReadPolicy={false} />);

      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });
      expect(checkbox).toHaveClass('cursor-not-allowed');
      expect(checkbox).toHaveClass('opacity-50');
    });

    it('ポリシー既読の場合、チェックボックスに有効スタイルが適用される', () => {
      render(<PrivacyConsent {...defaultProps} hasReadPolicy={true} />);

      const checkbox = screen.getByRole('checkbox', {
        name: 'プライバシーポリシーに同意する',
      });
      expect(checkbox).toHaveClass('cursor-pointer');
      expect(checkbox).not.toHaveClass('cursor-not-allowed');
    });
  });
});

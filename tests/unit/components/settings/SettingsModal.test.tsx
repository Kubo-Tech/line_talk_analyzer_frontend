import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { DEFAULT_SETTINGS } from '@/types/settings';

describe('SettingsModal', () => {
  const mockOnClose = jest.fn();
  const mockOnApply = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnApply.mockClear();
  });

  describe('基本レンダリング', () => {
    it('モーダルが開いているとき、すべての設定項目が表示される', () => {
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByText('解析設定')).toBeInTheDocument();
      expect(screen.getByText('期間')).toBeInTheDocument();
      expect(screen.getByText('最小文字数')).toBeInTheDocument();
      expect(screen.getByText('最大文字数')).toBeInTheDocument();
      expect(screen.getByText('最小出現回数')).toBeInTheDocument();
    });

    it('モーダルが閉じているとき、何も表示されない', () => {
      const { container } = render(
        <SettingsModal
          isOpen={false}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('初期値が正しく表示される', () => {
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      const minWordLengthInput = document.getElementById('minWordLength') as HTMLInputElement;
      expect(minWordLengthInput.value).toBe('1');

      const minMessageLengthInput = document.getElementById('minMessageLength') as HTMLInputElement;
      expect(minMessageLengthInput.value).toBe('2');
    });
  });

  describe('期間設定', () => {
    it('開始日を変更できる', async () => {
      const user = userEvent.setup();
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      const startDateInput = screen.getByLabelText('開始日') as HTMLInputElement;
      await user.clear(startDateInput);
      await user.type(startDateInput, '2023-01-01');

      expect(startDateInput.value).toBe('2023-01-01');
    });

    it('終了日を変更できる', async () => {
      const user = userEvent.setup();
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      const endDateInput = screen.getByLabelText('終了日') as HTMLInputElement;
      await user.clear(endDateInput);
      await user.type(endDateInput, '2023-12-31');

      expect(endDateInput.value).toBe('2023-12-31');
    });
  });

  describe('文字数設定', () => {
    it('単語の最小文字数を変更できる', async () => {
      const user = userEvent.setup();
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      const minWordLengthInput = document.getElementById('minWordLength') as HTMLInputElement;
      await user.clear(minWordLengthInput);
      await user.type(minWordLengthInput, '3');

      expect(minWordLengthInput.value).toBe('3');
    });

    it('空文字列を入力してもエラーにならない', async () => {
      const user = userEvent.setup();
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      const minWordLengthInput = document.getElementById('minWordLength') as HTMLInputElement;
      await user.clear(minWordLengthInput);

      expect(minWordLengthInput.value).toBe('');
    });

    it('フォーカスを外すと空文字列は1に戻る', async () => {
      const user = userEvent.setup();
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      const minWordLengthInput = document.getElementById('minWordLength') as HTMLInputElement;
      await user.clear(minWordLengthInput);
      await user.tab(); // フォーカスを外す

      await waitFor(() => {
        expect(minWordLengthInput.value).toBe('1');
      });
    });
  });

  describe('出現回数設定', () => {
    it('単語の最小出現回数を変更できる', async () => {
      const user = userEvent.setup();
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      // 最小出現回数のセクションから単語の入力フィールドを取得
      const minWordCountInput = document.getElementById('minWordCount') as HTMLInputElement;

      await user.clear(minWordCountInput);
      await user.type(minWordCountInput, '5');

      expect(minWordCountInput.value).toBe('5');
    });
  });

  describe('ボタン操作', () => {
    it('キャンセルボタンをクリックするとonCloseが呼ばれる', async () => {
      const user = userEvent.setup();
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      const cancelButton = screen.getByRole('button', { name: 'キャンセル' });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('設定反映ボタンをクリックするとonApplyが呼ばれる', async () => {
      const user = userEvent.setup();
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      const applyButton = screen.getByRole('button', { name: '設定反映' });
      await user.click(applyButton);

      expect(mockOnApply).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('デフォルトに戻すボタンをクリックすると確認ダイアログが表示される', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      const resetButton = screen.getByRole('button', { name: 'デフォルトに戻す' });
      await user.click(resetButton);

      expect(confirmSpy).toHaveBeenCalledWith('設定をデフォルトに戻しますか？');

      confirmSpy.mockRestore();
    });
  });

  describe('未保存の変更', () => {
    it('変更があるのに閉じようとすると確認ダイアログが表示される', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      // 設定を変更
      const minWordLengthInput = document.getElementById('minWordLength') as HTMLInputElement;
      await user.clear(minWordLengthInput);
      await user.type(minWordLengthInput, '5');

      // 閉じるボタンをクリック
      const closeButton = screen.getByRole('button', { name: '閉じる' });
      await user.click(closeButton);

      expect(confirmSpy).toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled(); // キャンセルされたので閉じない

      confirmSpy.mockRestore();
    });

    it('確認ダイアログでOKを選択すると閉じる', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      // 設定を変更
      const minWordLengthInput = document.getElementById('minWordLength') as HTMLInputElement;
      await user.clear(minWordLengthInput);
      await user.type(minWordLengthInput, '5');

      // 閉じるボタンをクリック
      const closeButton = screen.getByRole('button', { name: '閉じる' });
      await user.click(closeButton);

      expect(confirmSpy).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      confirmSpy.mockRestore();
    });

    it('変更がない場合は確認なしで閉じる', async () => {
      const user = userEvent.setup();
      const confirmSpy = jest.spyOn(window, 'confirm');

      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      // 閉じるボタンをクリック（変更なし）
      const closeButton = screen.getByRole('button', { name: '閉じる' });
      await user.click(closeButton);

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalledTimes(1);

      confirmSpy.mockRestore();
    });
  });

  describe('アクセシビリティ', () => {
    it('すべての入力フィールドにラベルが関連付けられている', () => {
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      expect(screen.getByLabelText('開始日')).toBeInTheDocument();
      expect(screen.getByLabelText('終了日')).toBeInTheDocument();
      expect(screen.getAllByLabelText('単語').length).toBeGreaterThan(0);
      expect(screen.getAllByLabelText('メッセージ').length).toBeGreaterThan(0);
    });

    it('閉じるボタンにaria-labelが設定されている', () => {
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      const closeButton = screen.getByLabelText('閉じる');
      expect(closeButton).toBeInTheDocument();
    });
  });
});

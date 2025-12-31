import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { getDefaultSettings } from '@/types/settings';

const DEFAULT_SETTINGS = getDefaultSettings();

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

  describe('バリデーション', () => {
    it('単語の最大文字数が最小文字数より小さい場合、アラートが表示され保存されない', async () => {
      const user = userEvent.setup();
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      // 最小文字数を5に設定
      const minWordLengthInput = document.getElementById('minWordLength') as HTMLInputElement;
      await user.clear(minWordLengthInput);
      await user.type(minWordLengthInput, '5');

      // 最大文字数を3に設定（最小より小さい）
      const maxWordLengthInput = document.getElementById('maxWordLength') as HTMLInputElement;
      await user.clear(maxWordLengthInput);
      await user.type(maxWordLengthInput, '3');

      // 設定反映ボタンをクリック
      const applyButton = screen.getByRole('button', { name: '設定反映' });
      await user.click(applyButton);

      // アラートが表示されることを確認
      expect(alertSpy).toHaveBeenCalledWith(
        '単語の最大文字数（3）は最小文字数（5）以上である必要があります。'
      );

      // onApplyが呼ばれないことを確認
      expect(mockOnApply).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('メッセージの最大文字数が最小文字数より小さい場合、アラートが表示され保存されない', async () => {
      const user = userEvent.setup();
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      // 最小文字数を10に設定
      const minMessageLengthInput = document.getElementById(
        'minMessageLength'
      ) as HTMLInputElement;
      await user.clear(minMessageLengthInput);
      await user.type(minMessageLengthInput, '10');

      // 最大文字数を5に設定（最小より小さい）
      const maxMessageLengthInput = document.getElementById(
        'maxMessageLength'
      ) as HTMLInputElement;
      await user.clear(maxMessageLengthInput);
      await user.type(maxMessageLengthInput, '5');

      // 設定反映ボタンをクリック
      const applyButton = screen.getByRole('button', { name: '設定反映' });
      await user.click(applyButton);

      // アラートが表示されることを確認
      expect(alertSpy).toHaveBeenCalledWith(
        'メッセージの最大文字数（5）は最小文字数（10）以上である必要があります。'
      );

      // onApplyが呼ばれないことを確認
      expect(mockOnApply).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('開始日が終了日より後の場合、アラートが表示され保存されない', async () => {
      const user = userEvent.setup();
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      // 開始日を2025-12-31に設定
      const startDateInput = screen.getByLabelText('開始日') as HTMLInputElement;
      await user.clear(startDateInput);
      await user.type(startDateInput, '2025-12-31');

      // 終了日を2025-01-01に設定（開始日より前）
      const endDateInput = screen.getByLabelText('終了日') as HTMLInputElement;
      await user.clear(endDateInput);
      await user.type(endDateInput, '2025-01-01');

      // 設定反映ボタンをクリック
      const applyButton = screen.getByRole('button', { name: '設定反映' });
      await user.click(applyButton);

      // アラートが表示されることを確認
      expect(alertSpy).toHaveBeenCalledWith(
        '開始日（2025-12-31）は終了日（2025-01-01）以前である必要があります。'
      );

      // onApplyが呼ばれないことを確認
      expect(mockOnApply).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it('開始日と終了日が同じ場合、正常に保存される', async () => {
      const user = userEvent.setup();

      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      // 開始日と終了日を同じ日に設定
      const startDateInput = screen.getByLabelText('開始日') as HTMLInputElement;
      await user.clear(startDateInput);
      await user.type(startDateInput, '2025-06-15');

      const endDateInput = screen.getByLabelText('終了日') as HTMLInputElement;
      await user.clear(endDateInput);
      await user.type(endDateInput, '2025-06-15');

      // 設定反映ボタンをクリック
      const applyButton = screen.getByRole('button', { name: '設定反映' });
      await user.click(applyButton);

      // 正常に保存されることを確認
      expect(mockOnApply).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('最大文字数が最小文字数以上の場合、正常に保存される', async () => {
      const user = userEvent.setup();

      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      // 単語: 最小3、最大10
      const minWordLengthInput = document.getElementById('minWordLength') as HTMLInputElement;
      await user.clear(minWordLengthInput);
      await user.type(minWordLengthInput, '3');

      const maxWordLengthInput = document.getElementById('maxWordLength') as HTMLInputElement;
      await user.clear(maxWordLengthInput);
      await user.type(maxWordLengthInput, '10');

      // メッセージ: 最小5、最大20
      const minMessageLengthInput = document.getElementById(
        'minMessageLength'
      ) as HTMLInputElement;
      await user.clear(minMessageLengthInput);
      await user.type(minMessageLengthInput, '5');

      const maxMessageLengthInput = document.getElementById(
        'maxMessageLength'
      ) as HTMLInputElement;
      await user.clear(maxMessageLengthInput);
      await user.type(maxMessageLengthInput, '20');

      // 設定反映ボタンをクリック
      const applyButton = screen.getByRole('button', { name: '設定反映' });
      await user.click(applyButton);

      // 正常に保存されることを確認
      expect(mockOnApply).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('最大文字数が未指定（null）の場合、バリデーションをスキップして保存される', async () => {
      const user = userEvent.setup();

      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      // 最小文字数を設定
      const minWordLengthInput = document.getElementById('minWordLength') as HTMLInputElement;
      await user.clear(minWordLengthInput);
      await user.type(minWordLengthInput, '5');

      // 最大文字数は空欄（未指定）のまま

      // 設定反映ボタンをクリック
      const applyButton = screen.getByRole('button', { name: '設定反映' });
      await user.click(applyButton);

      // 正常に保存されることを確認
      expect(mockOnApply).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('最大文字数と最小文字数が同じ値の場合、正常に保存される', async () => {
      const user = userEvent.setup();

      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      // 最小文字数と最大文字数を同じ値に設定
      const minWordLengthInput = document.getElementById('minWordLength') as HTMLInputElement;
      await user.clear(minWordLengthInput);
      await user.type(minWordLengthInput, '5');

      const maxWordLengthInput = document.getElementById('maxWordLength') as HTMLInputElement;
      await user.clear(maxWordLengthInput);
      await user.type(maxWordLengthInput, '5');

      // 設定反映ボタンをクリック
      const applyButton = screen.getByRole('button', { name: '設定反映' });
      await user.click(applyButton);

      // 正常に保存されることを確認
      expect(mockOnApply).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('ダークモード対応', () => {
    it('モーダル背景にダークモードクラスが適用されている', () => {
      const { container } = render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      const modal = container.querySelector('.dark\\:bg-gray-800');
      expect(modal).toBeInTheDocument();
    });

    it('入力フィールドにダークモードクラスが適用されている', () => {
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      const minWordLengthInput = document.getElementById('minWordLength') as HTMLInputElement;
      expect(minWordLengthInput.className).toContain('dark:bg-gray-700');
      expect(minWordLengthInput.className).toContain('dark:text-gray-200');
    });

    it('ラベルテキストにダークモードクラスが適用されている', () => {
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      const labels = screen.getAllByText('単語');
      const label = labels[0].closest('label');
      expect(label?.className).toContain('dark:text-gray-300');
    });

    it('単位表示テキストにダークモードクラスが適用されている', () => {
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      // 「文字」の単位表示を探す（invisibleでないもの）
      const textUnits = screen.getAllByText('文字');
      const unitSpan = textUnits.find(
        (element) =>
          element.tagName === 'SPAN' &&
          element.className.includes('whitespace-nowrap') &&
          !element.className.includes('invisible')
      );
      expect(unitSpan?.className).toContain('dark:text-gray-400');
    });

    it('セクション見出しにダークモードクラスが適用されている', () => {
      render(
        <SettingsModal
          isOpen={true}
          settings={DEFAULT_SETTINGS}
          onClose={mockOnClose}
          onApply={mockOnApply}
        />
      );

      const heading = screen.getByText('期間');
      expect(heading.className).toContain('dark:text-gray-200');
    });
  });
});

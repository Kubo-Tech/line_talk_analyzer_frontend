import FileUploader from '@/components/upload/FileUploader';
import { FileProvider } from '@/contexts/FileContext';
import { ERROR_MESSAGES } from '@/lib/constants';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

const renderWithProvider = (ui: React.ReactElement) => {
  return render(<FileProvider>{ui}</FileProvider>);
};

describe('FileUploader', () => {
  const mockOnFileChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('レンダリング', () => {
    it('正しくレンダリングされる', () => {
      renderWithProvider(<FileUploader />);

      expect(screen.getByRole('heading', { name: '📁 ファイルアップロード' })).toBeInTheDocument();
      expect(screen.getByText('ここにファイルをドロップ')).toBeInTheDocument();
    });

    it('ファイル選択後に情報が表示される', () => {
      const { container } = renderWithProvider(<FileUploader />);
      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByText('ファイル選択済み')).toBeInTheDocument();
      expect(screen.getByText('test.txt')).toBeInTheDocument();
    });
  });

  describe('ファイル選択', () => {
    it('有効なファイルが選択されるとコールバックが呼ばれる', () => {
      const { container } = renderWithProvider(<FileUploader onFileChange={mockOnFileChange} />);
      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockOnFileChange).toHaveBeenCalledWith(file);
    });

    it('無効なファイルが選択されるとnullでコールバックが呼ばれる', () => {
      const { container } = renderWithProvider(<FileUploader onFileChange={mockOnFileChange} />);
      const file = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockOnFileChange).toHaveBeenCalledWith(null);
    });
  });

  describe('エラー表示', () => {
    it('無効なファイル形式のエラーが表示される', () => {
      const { container } = renderWithProvider(<FileUploader />);
      const file = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('エラー')).toBeInTheDocument();
      expect(screen.getByText(ERROR_MESSAGES.INVALID_FILE_TYPE)).toBeInTheDocument();
    });

    it('エラーを閉じることができる', () => {
      const { container } = renderWithProvider(<FileUploader />);
      const file = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByRole('alert')).toBeInTheDocument();

      const closeButton = screen.getByText('閉じる');
      fireEvent.click(closeButton);

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('ファイル削除', () => {
    it('ファイルを削除できる', async () => {
      const { container } = renderWithProvider(<FileUploader onFileChange={mockOnFileChange} />);
      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByText('ファイル選択済み')).toBeInTheDocument();

      const deleteButton = screen.getByRole('button', { name: 'ファイルを削除' });
      await act(async () => {
        fireEvent.click(deleteButton);
      });

      expect(screen.queryByText('ファイル選択済み')).not.toBeInTheDocument();
      expect(mockOnFileChange).toHaveBeenCalledWith(null);
    });
  });

  describe('ドラッグ状態', () => {
    it('ドラッグ中にビジュアルフィードバックが変わる', () => {
      renderWithProvider(<FileUploader />);

      const dropZone = screen.getByRole('button');

      // ドラッグエンター
      fireEvent.dragEnter(dropZone);
      expect(screen.getByText('ファイルをドロップしてください')).toBeInTheDocument();

      // ドラッグリーブ
      fireEvent.dragLeave(dropZone);
      expect(screen.getByText('ここにファイルをドロップ')).toBeInTheDocument();
    });
  });

  describe('ファイル情報表示', () => {
    it('ファイルサイズがMB単位で表示される', () => {
      const { container } = renderWithProvider(<FileUploader />);
      const contentSize = 1024 * 1024 * 2.5; // 2.5MB
      const content = 'a'.repeat(contentSize);
      const file = new File([content], 'large.txt', { type: 'text/plain' });

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByText(/2\.50 MB/)).toBeInTheDocument();
    });
  });

  describe('ページ遷移後のファイル復元', () => {
    it('FileContextから復元されたファイルが表示される', async () => {
      // localStorageにファイル情報を設定
      const fileInfo = {
        name: 'restored.txt',
        type: 'text/plain',
        size: 1234,
      };
      const fileContent = 'restored content';

      localStorage.setItem('uploaded_file_info', JSON.stringify(fileInfo));
      localStorage.setItem('uploaded_file_content', fileContent);

      // コンポーネントをレンダリング
      renderWithProvider(<FileUploader />);

      // ファイルが復元されて表示されるまで待つ
      await screen.findByText('ファイル選択済み');
      expect(screen.getByText('restored.txt')).toBeInTheDocument();
    });

    it('ファイル情報のみの場合は表示されない', async () => {
      // localStorageにファイル情報のみ設定（内容なし）
      const fileInfo = {
        name: 'nameonly.txt',
        type: 'text/plain',
        size: 1234,
      };

      localStorage.setItem('uploaded_file_info', JSON.stringify(fileInfo));
      // ファイル内容は保存しない

      // コンポーネントをレンダリング
      renderWithProvider(<FileUploader />);

      // useEffectが実行され、ドロップゾーンが表示されることを確認
      await waitFor(() => {
        expect(screen.getByText('ここにファイルをドロップ')).toBeInTheDocument();
      });

      // ファイル選択済みが表示されないことを確認
      expect(screen.queryByText('ファイル選択済み')).not.toBeInTheDocument();
    });
  });
});

import FileUploader from '@/components/upload/FileUploader';
import { ERROR_MESSAGES } from '@/lib/constants';
import { fireEvent, render, screen } from '@testing-library/react';

describe('FileUploader', () => {
  const mockOnFileChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('レンダリング', () => {
    it('正しくレンダリングされる', () => {
      render(<FileUploader />);

      expect(screen.getByRole('heading', { name: '📁 ファイルアップロード' })).toBeInTheDocument();
      expect(screen.getByText('ここにファイルをドロップ')).toBeInTheDocument();
    });

    it('ファイル選択後に情報が表示される', () => {
      const { container } = render(<FileUploader />);
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
      const { container } = render(<FileUploader onFileChange={mockOnFileChange} />);
      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockOnFileChange).toHaveBeenCalledWith(file);
    });

    it('無効なファイルが選択されるとnullでコールバックが呼ばれる', () => {
      const { container } = render(<FileUploader onFileChange={mockOnFileChange} />);
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
      const { container } = render(<FileUploader />);
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
      const { container } = render(<FileUploader />);
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
    it('ファイルを削除できる', () => {
      const { container } = render(<FileUploader onFileChange={mockOnFileChange} />);
      const file = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByText('ファイル選択済み')).toBeInTheDocument();

      const deleteButton = screen.getByRole('button', { name: 'ファイルを削除' });
      fireEvent.click(deleteButton);

      expect(screen.queryByText('ファイル選択済み')).not.toBeInTheDocument();
      expect(mockOnFileChange).toHaveBeenCalledWith(null);
    });
  });

  describe('ドラッグ状態', () => {
    it('ドラッグ中にビジュアルフィードバックが変わる', () => {
      render(<FileUploader />);

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
      const { container } = render(<FileUploader />);
      const contentSize = 1024 * 1024 * 2.5; // 2.5MB
      const content = 'a'.repeat(contentSize);
      const file = new File([content], 'large.txt', { type: 'text/plain' });

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(screen.getByText(/2\.50 MB/)).toBeInTheDocument();
    });
  });
});

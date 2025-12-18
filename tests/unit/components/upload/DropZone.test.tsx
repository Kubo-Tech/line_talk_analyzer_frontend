import DropZone from '@/components/upload/DropZone';
import { fireEvent, render, screen } from '@testing-library/react';

describe('DropZone', () => {
  const mockOnFileSelect = jest.fn();
  const mockOnDragEnter = jest.fn();
  const mockOnDragLeave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('レンダリング', () => {
    it('正しくレンダリングされる', () => {
      render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={false}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
        />
      );

      expect(screen.getByText('ここにファイルをドロップ')).toBeInTheDocument();
      expect(screen.getByText('またはタップして選択')).toBeInTheDocument();
    });

    it('ドラッグ中の表示になる', () => {
      render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={true}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
        />
      );

      expect(screen.getByText('ファイルをドロップしてください')).toBeInTheDocument();
    });

    it('無効状態で表示される', () => {
      render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={false}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
          disabled={true}
        />
      );

      expect(screen.getByText('ファイル選択済み')).toBeInTheDocument();
    });
  });

  describe('クリックイベント', () => {
    it('クリックでファイル選択ダイアログが開く', () => {
      const { container } = render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={false}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
        />
      );

      const dropZone = screen.getByRole('button');
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      // inputのclickをモック
      const clickSpy = jest.spyOn(fileInput, 'click');

      fireEvent.click(dropZone);

      expect(clickSpy).toHaveBeenCalled();
    });

    it('無効状態ではクリックできない', () => {
      const { container } = render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={false}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
          disabled={true}
        />
      );

      const dropZone = screen.getByRole('button');
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

      const clickSpy = jest.spyOn(fileInput, 'click');

      fireEvent.click(dropZone);

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('キーボードイベント', () => {
    it('Enterキーでファイル選択ダイアログが開く', () => {
      const { container } = render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={false}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
        />
      );

      const dropZone = screen.getByRole('button');
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = jest.spyOn(fileInput, 'click');

      fireEvent.keyDown(dropZone, { key: 'Enter' });

      expect(clickSpy).toHaveBeenCalled();
    });

    it('Spaceキーでファイル選択ダイアログが開く', () => {
      const { container } = render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={false}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
        />
      );

      const dropZone = screen.getByRole('button');
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = jest.spyOn(fileInput, 'click');

      fireEvent.keyDown(dropZone, { key: ' ' });

      expect(clickSpy).toHaveBeenCalled();
    });

    it('無効状態ではキーボード操作できない', () => {
      const { container } = render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={false}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
          disabled={true}
        />
      );

      const dropZone = screen.getByRole('button');
      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = jest.spyOn(fileInput, 'click');

      fireEvent.keyDown(dropZone, { key: 'Enter' });
      fireEvent.keyDown(dropZone, { key: ' ' });

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('ファイル選択', () => {
    it('ファイルが選択されるとコールバックが呼ばれる', () => {
      const { container } = render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={false}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
        />
      );

      const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      fireEvent.change(fileInput, { target: { files: [file] } });

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
    });
  });

  describe('ドラッグ&ドロップ', () => {
    it('ドラッグエンターでコールバックが呼ばれる', () => {
      render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={false}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
        />
      );

      const dropZone = screen.getByRole('button');

      fireEvent.dragEnter(dropZone);

      expect(mockOnDragEnter).toHaveBeenCalled();
    });

    it('ドラッグリーブでコールバックが呼ばれる', () => {
      render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={false}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
        />
      );

      const dropZone = screen.getByRole('button');

      fireEvent.dragLeave(dropZone);

      expect(mockOnDragLeave).toHaveBeenCalled();
    });

    it('ファイルドロップでファイル選択コールバックが呼ばれる', () => {
      render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={false}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
        />
      );

      const dropZone = screen.getByRole('button');
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      fireEvent.drop(dropZone, {
        dataTransfer: { files: [file] },
      });

      expect(mockOnFileSelect).toHaveBeenCalledWith(file);
      expect(mockOnDragLeave).toHaveBeenCalled();
    });

    it('無効状態ではドラッグイベントが無視される', () => {
      render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={false}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
          disabled={true}
        />
      );

      const dropZone = screen.getByRole('button');

      fireEvent.dragEnter(dropZone);

      expect(mockOnDragEnter).not.toHaveBeenCalled();
    });

    it('無効状態ではドロップが無視される', () => {
      render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={false}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
          disabled={true}
        />
      );

      const dropZone = screen.getByRole('button');
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      fireEvent.drop(dropZone, {
        dataTransfer: { files: [file] },
      });

      expect(mockOnFileSelect).not.toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ', () => {
    it('適切なARIA属性を持つ', () => {
      render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={false}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
        />
      );

      const dropZone = screen.getByRole('button');

      expect(dropZone).toHaveAttribute('aria-label', 'ファイルをアップロード');
      expect(dropZone).toHaveAttribute('tabIndex', '0');
    });

    it('無効状態で適切なARIA属性を持つ', () => {
      render(
        <DropZone
          onFileSelect={mockOnFileSelect}
          isDragActive={false}
          onDragEnter={mockOnDragEnter}
          onDragLeave={mockOnDragLeave}
          disabled={true}
        />
      );

      const dropZone = screen.getByRole('button');

      expect(dropZone).toHaveAttribute('aria-disabled', 'true');
      expect(dropZone).toHaveAttribute('tabIndex', '-1');
    });
  });
});

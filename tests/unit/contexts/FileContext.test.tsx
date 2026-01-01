import { FileProvider, useFile } from '@/contexts/FileContext';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

describe('FileContext', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  describe('初期状態', () => {
    it('初期状態が正しい', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <FileProvider>{children}</FileProvider>
      );
      const { result } = renderHook(() => useFile(), { wrapper });

      expect(result.current.uploadedFile).toBeNull();
      expect(result.current.lastFileName).toBeNull();
    });
  });

  describe('ファイルのアップロード', () => {
    it('ファイルを設定できる', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <FileProvider>{children}</FileProvider>
      );
      const { result } = renderHook(() => useFile(), { wrapper });

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      await act(async () => {
        await result.current.setUploadedFile(file);
      });

      expect(result.current.uploadedFile).toBe(file);
      expect(result.current.lastFileName).toBe('test.txt');
    });

    it('ファイル情報がsessionStorageに保存される', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <FileProvider>{children}</FileProvider>
      );
      const { result } = renderHook(() => useFile(), { wrapper });

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      await act(async () => {
        await result.current.setUploadedFile(file);
      });

      const storedInfo = sessionStorage.getItem('uploaded_file_info');
      expect(storedInfo).toBeTruthy();

      const parsedInfo = JSON.parse(storedInfo!);
      expect(parsedInfo.name).toBe('test.txt');
      expect(parsedInfo.type).toBe('text/plain');
    });

    it('小さいファイルはsessionStorageに内容も保存される', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <FileProvider>{children}</FileProvider>
      );
      const { result } = renderHook(() => useFile(), { wrapper });

      // file.text()をモック
      const mockText = jest.fn().mockResolvedValue('small content');
      const file = new File(['small content'], 'small.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'text', { value: mockText });

      await act(async () => {
        await result.current.setUploadedFile(file);
      });

      // file.text()が呼ばれるまで少し待つ
      await waitFor(() => {
        expect(mockText).toHaveBeenCalled();
      });

      const storedContent = sessionStorage.getItem('uploaded_file_content');
      expect(storedContent).toBe('small content');
    });

    it('ファイルをクリアできる', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <FileProvider>{children}</FileProvider>
      );
      const { result } = renderHook(() => useFile(), { wrapper });

      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      await act(async () => {
        await result.current.setUploadedFile(file);
      });

      expect(result.current.uploadedFile).toBe(file);

      await act(async () => {
        await result.current.setUploadedFile(null);
      });

      expect(result.current.uploadedFile).toBeNull();
      expect(result.current.lastFileName).toBeNull();
      expect(sessionStorage.getItem('uploaded_file_info')).toBeNull();
      expect(sessionStorage.getItem('uploaded_file_content')).toBeNull();
    });
  });

  describe('ファイルの復元', () => {
    it('sessionStorageからファイル情報が復元される', async () => {
      const fileInfo = {
        name: 'restored.txt',
        type: 'text/plain',
        size: 1234,
      };
      const fileContent = 'restored content';

      sessionStorage.setItem('uploaded_file_info', JSON.stringify(fileInfo));
      sessionStorage.setItem('uploaded_file_content', fileContent);

      const wrapper = ({ children }: { children: ReactNode }) => (
        <FileProvider>{children}</FileProvider>
      );
      const { result } = renderHook(() => useFile(), { wrapper });

      // 復元が完了するまで待つ
      await waitFor(() => {
        expect(result.current.uploadedFile).not.toBeNull();
      });

      expect(result.current.uploadedFile?.name).toBe('restored.txt');
      expect(result.current.lastFileName).toBe('restored.txt');

      // ファイルサイズの確認
      expect(result.current.uploadedFile?.size).toBeGreaterThan(0);
    });

    it('sessionStorageにファイル情報のみの場合、ファイル名だけ復元される', async () => {
      const fileInfo = {
        name: 'nameonly.txt',
        type: 'text/plain',
        size: 1234,
      };

      sessionStorage.setItem('uploaded_file_info', JSON.stringify(fileInfo));
      // ファイル内容は保存しない

      const wrapper = ({ children }: { children: ReactNode }) => (
        <FileProvider>{children}</FileProvider>
      );
      const { result } = renderHook(() => useFile(), { wrapper });

      // 少し待つ
      await waitFor(() => {
        expect(result.current.lastFileName).toBe('nameonly.txt');
      });

      // ファイル内容がないのでファイルオブジェクトは復元されない
      expect(result.current.uploadedFile).toBeNull();
      expect(result.current.lastFileName).toBe('nameonly.txt');
    });

    it('sessionStorageが空の場合は初期状態のまま', async () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <FileProvider>{children}</FileProvider>
      );
      const { result } = renderHook(() => useFile(), { wrapper });

      // useEffectが実行され、状態が変わらないことを確認
      await waitFor(
        () => {
          expect(result.current.uploadedFile).toBeNull();
          expect(result.current.lastFileName).toBeNull();
        },
        { timeout: 100 }
      );
    });
  });

  describe('useFileフックの使用制限', () => {
    it('FileProvider外で使用するとエラーが発生する', () => {
      // エラーログの抑制
      const spy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        renderHook(() => useFile());
      }).toThrow('useFile must be used within a FileProvider');

      spy.mockRestore();
    });
  });
});

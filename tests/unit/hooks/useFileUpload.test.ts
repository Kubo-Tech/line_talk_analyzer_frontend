import { useFileUpload } from '@/hooks/useFileUpload';
import { ERROR_MESSAGES, FILE_UPLOAD } from '@/lib/constants';
import { act, renderHook } from '@testing-library/react';

describe('useFileUpload', () => {
  describe('初期状態', () => {
    it('初期状態が正しい', () => {
      const { result } = renderHook(() => useFileUpload());

      expect(result.current.file).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isValidating).toBe(false);
    });
  });

  describe('validateAndSetFile', () => {
    it('正常なファイルを受け入れる', () => {
      const { result } = renderHook(() => useFileUpload());
      const validFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });

      act(() => {
        const isValid = result.current.validateAndSetFile(validFile);
        expect(isValid).toBe(true);
      });

      expect(result.current.file).toBe(validFile);
      expect(result.current.error).toBeNull();
    });

    it('不正な拡張子のファイルを拒否する', () => {
      const { result } = renderHook(() => useFileUpload());
      const invalidFile = new File(['test content'], 'test.pdf', {
        type: 'application/pdf',
      });

      act(() => {
        const isValid = result.current.validateAndSetFile(invalidFile);
        expect(isValid).toBe(false);
      });

      expect(result.current.file).toBeNull();
      expect(result.current.error).toBe(ERROR_MESSAGES.INVALID_FILE_TYPE);
    });

    it('サイズ超過のファイルを拒否する', () => {
      const { result } = renderHook(() => useFileUpload());
      const largeContent = 'a'.repeat(FILE_UPLOAD.MAX_FILE_SIZE + 1);
      const largeFile = new File([largeContent], 'large.txt', {
        type: 'text/plain',
      });

      act(() => {
        const isValid = result.current.validateAndSetFile(largeFile);
        expect(isValid).toBe(false);
      });

      expect(result.current.file).toBeNull();
      expect(result.current.error).toBe(ERROR_MESSAGES.FILE_TOO_LARGE);
    });

    it('バリデーション中フラグが正しく動作する', () => {
      const { result } = renderHook(() => useFileUpload());
      const validFile = new File(['test content'], 'test.txt', {
        type: 'text/plain',
      });

      act(() => {
        result.current.validateAndSetFile(validFile);
      });

      // バリデーション後はfalseになる
      expect(result.current.isValidating).toBe(false);
    });
  });

  describe('setFile', () => {
    it('ファイルを設定できる', () => {
      const { result } = renderHook(() => useFileUpload());
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      act(() => {
        result.current.setFile(file);
      });

      expect(result.current.file).toBe(file);
    });

    it('nullを設定するとエラーもクリアされる', () => {
      const { result } = renderHook(() => useFileUpload());
      const invalidFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });

      act(() => {
        result.current.validateAndSetFile(invalidFile);
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.setFile(null);
      });

      expect(result.current.file).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('clearFile', () => {
    it('ファイルとエラーをクリアする', () => {
      const { result } = renderHook(() => useFileUpload());
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });

      act(() => {
        result.current.validateAndSetFile(file);
      });

      expect(result.current.file).not.toBeNull();

      act(() => {
        result.current.clearFile();
      });

      expect(result.current.file).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('エラーのみをクリアする', () => {
      const { result } = renderHook(() => useFileUpload());
      const invalidFile = new File(['test'], 'test.pdf', {
        type: 'application/pdf',
      });

      act(() => {
        result.current.validateAndSetFile(invalidFile);
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.file).toBeNull(); // ファイルはそのまま
    });
  });
});

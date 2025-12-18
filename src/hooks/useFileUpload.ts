import { ERROR_MESSAGES, FILE_UPLOAD } from '@/lib/constants';
import { useCallback, useState } from 'react';

interface UseFileUploadReturn {
  file: File | null;
  error: string | null;
  isValidating: boolean;
  setFile: (file: File | null) => void;
  validateAndSetFile: (file: File) => boolean;
  clearFile: () => void;
  clearError: () => void;
}

export function useFileUpload(): UseFileUploadReturn {
  const [file, setFileState] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateFile = useCallback((file: File): string | null => {
    // 拡張子チェック
    const fileName = file.name.toLowerCase();
    const hasValidExtension = FILE_UPLOAD.SUPPORTED_FILE_TYPES.some((type) =>
      fileName.endsWith(type)
    );

    if (!hasValidExtension) {
      return ERROR_MESSAGES.INVALID_FILE_TYPE;
    }

    // ファイルサイズチェック
    if (file.size > FILE_UPLOAD.MAX_FILE_SIZE) {
      return ERROR_MESSAGES.FILE_TOO_LARGE;
    }

    return null;
  }, []);

  const validateAndSetFile = useCallback(
    (file: File): boolean => {
      setIsValidating(true);
      const validationError = validateFile(file);
      setIsValidating(false);

      if (validationError) {
        setError(validationError);
        setFileState(null);
        return false;
      }

      setError(null);
      setFileState(file);
      return true;
    },
    [validateFile]
  );

  const setFile = useCallback((file: File | null) => {
    setFileState(file);
    if (file === null) {
      setError(null);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFileState(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    file,
    error,
    isValidating,
    setFile,
    validateAndSetFile,
    clearFile,
    clearError,
  };
}

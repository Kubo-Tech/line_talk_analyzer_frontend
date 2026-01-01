'use client';

import { useFile } from '@/contexts/FileContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useEffect, useState } from 'react';
import DropZone from './DropZone';

interface FileUploaderProps {
  onFileChange?: (file: File | null) => void;
}

export default function FileUploader({ onFileChange }: FileUploaderProps) {
  const { uploadedFile, setUploadedFile } = useFile();
  const { file, error, validateAndSetFile, clearFile, clearError, setFile } = useFileUpload();
  const [isDragActive, setIsDragActive] = useState(false);

  // FileContextからファイルが復元された場合、ローカルステートを同期
  useEffect(() => {
    if (uploadedFile && !file) {
      setFile(uploadedFile);
    }
  }, [uploadedFile, file, setFile]);

  const handleFileSelect = (selectedFile: File) => {
    const isValid = validateAndSetFile(selectedFile);
    if (isValid) {
      onFileChange?.(selectedFile);
    } else {
      onFileChange?.(null);
    }
  };

  const handleRemoveFile = async () => {
    clearFile();
    // FileContextもクリアして、再同期を防ぐ
    await setUploadedFile(null);
    onFileChange?.(null);
  };

  const handleDragEnter = () => {
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  return (
    <div className="w-full">
      <h2 className="mb-4 text-2xl font-bold dark:text-gray-100">📁 ファイルアップロード</h2>

      {!file ? (
        <>
          <DropZone
            onFileSelect={handleFileSelect}
            isDragActive={isDragActive}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
          />
          {error && (
            <div
              className="mt-4 rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-200"
              role="alert"
            >
              <p className="font-semibold">エラー</p>
              <p className="text-sm">{error}</p>
              <button onClick={clearError} className="mt-2 text-sm underline hover:no-underline">
                閉じる
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border-2 border-green-300 bg-green-50 p-6 dark:border-green-700 dark:bg-green-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">✅</span>
              <div>
                <p className="font-semibold text-green-800 dark:text-green-200">ファイル選択済み</p>
                <p className="text-sm text-green-700 dark:text-green-300">{file.name}</p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
              aria-label="ファイルを削除"
            >
              削除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

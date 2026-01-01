'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface FileContextType {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => Promise<void>;
  lastFileName: string | null;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

const FILE_INFO_KEY = 'uploaded_file_info';
const FILE_CONTENT_KEY = 'uploaded_file_content';

export function FileProvider({ children }: { children: ReactNode }) {
  // 初期化時にlocalStorageからファイルを復元
  const [uploadedFile, setUploadedFileState] = useState<File | null>(() => {
    try {
      const fileInfo = localStorage.getItem(FILE_INFO_KEY);
      const fileContent = localStorage.getItem(FILE_CONTENT_KEY);

      if (fileInfo && fileContent) {
        const { name, type } = JSON.parse(fileInfo);
        const blob = new Blob([fileContent], { type });
        return new File([blob], name, { type });
      }
    } catch (error) {
      console.error('ファイル情報の読み込みに失敗しました:', error);
    }
    return null;
  });

  const [lastFileName, setLastFileName] = useState<string | null>(() => {
    try {
      const fileInfo = localStorage.getItem(FILE_INFO_KEY);
      if (fileInfo) {
        const { name } = JSON.parse(fileInfo);
        return name;
      }
    } catch {
      // エラーは既に上でログ出力済み
    }
    return null;
  });

  const setUploadedFile = async (file: File | null) => {
    setUploadedFileState(file);

    if (file) {
      // ファイル情報を保存
      const fileInfo = {
        name: file.name,
        type: file.type,
        size: file.size,
      };
      localStorage.setItem(FILE_INFO_KEY, JSON.stringify(fileInfo));
      setLastFileName(file.name);

      // ファイル内容の保存を試みる（小さいファイルのみ）
      // 5MB以下のファイルのみlocalStorageに保存
      if (file.size < 5 * 1024 * 1024) {
        // テスト環境でfile.textが存在しない場合を考慮
        if (typeof file.text === 'function') {
          try {
            const content = await file.text();
            localStorage.setItem(FILE_CONTENT_KEY, content);
          } catch (error) {
            console.warn('ファイル内容の保存に失敗しました（容量制限）:', error);
            // ファイル内容は保存できないが、ファイル情報は保存済み
            localStorage.removeItem(FILE_CONTENT_KEY);
          }
        }
      } else {
        // 大きいファイルは内容を保存しない
        localStorage.removeItem(FILE_CONTENT_KEY);
      }
    } else {
      // ファイルがクリアされた場合
      localStorage.removeItem(FILE_INFO_KEY);
      localStorage.removeItem(FILE_CONTENT_KEY);
      setLastFileName(null);
    }
  };

  return (
    <FileContext.Provider value={{ uploadedFile, setUploadedFile, lastFileName }}>
      {children}
    </FileContext.Provider>
  );
}

export function useFile() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFile must be used within a FileProvider');
  }
  return context;
}

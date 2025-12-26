'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface FileContextType {
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  lastFileName: string | null;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

const FILE_INFO_KEY = 'uploaded_file_info';
const FILE_CONTENT_KEY = 'uploaded_file_content';

export function FileProvider({ children }: { children: ReactNode }) {
  const [uploadedFile, setUploadedFileState] = useState<File | null>(null);
  const [lastFileName, setLastFileName] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初回マウント時にlocalStorageからファイルを復元
  useEffect(() => {
    if (isInitialized) return;

    try {
      const fileInfo = localStorage.getItem(FILE_INFO_KEY);
      const fileContent = localStorage.getItem(FILE_CONTENT_KEY);

      if (fileInfo) {
        const { name, type } = JSON.parse(fileInfo);
        setLastFileName(name);

        // ファイル内容がある場合は復元
        if (fileContent) {
          const blob = new Blob([fileContent], { type });
          const file = new File([blob], name, { type });
          setUploadedFileState(file);
        }
      }
    } catch (error) {
      console.error('ファイル情報の読み込みに失敗しました:', error);
    } finally {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const setUploadedFile = (file: File | null) => {
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
        file.text().then((content) => {
          try {
            localStorage.setItem(FILE_CONTENT_KEY, content);
          } catch (error) {
            console.warn('ファイル内容の保存に失敗しました（容量制限）:', error);
            // ファイル内容は保存できないが、ファイル情報は保存済み
            localStorage.removeItem(FILE_CONTENT_KEY);
          }
        });
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

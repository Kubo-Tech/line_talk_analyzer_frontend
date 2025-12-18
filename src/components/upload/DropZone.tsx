'use client';

import { ChangeEvent, DragEvent, useRef } from 'react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isDragActive: boolean;
  onDragEnter: () => void;
  onDragLeave: () => void;
  disabled?: boolean;
}

export default function DropZone({
  onFileSelect,
  isDragActive,
  onDragEnter,
  onDragLeave,
  disabled = false,
}: DropZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onDragEnter();
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onDragLeave();
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onDragLeave();

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex min-h-50 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        disabled
          ? 'cursor-not-allowed border-gray-300 bg-gray-50 text-gray-400'
          : isDragActive
            ? 'border-blue-500 bg-blue-50 text-blue-600'
            : 'border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:bg-blue-50'
      } `}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="ファイルをアップロード"
      aria-disabled={disabled}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
        aria-hidden="true"
      />
      <div className="mb-4 text-5xl">📁</div>
      <p className="mb-2 text-lg font-semibold">
        {isDragActive && !disabled ? 'ファイルをドロップしてください' : 'ここにファイルをドロップ'}
      </p>
      <p className="text-sm">{disabled ? 'ファイル選択済み' : 'またはタップして選択'}</p>
      <p className="mt-4 text-xs text-gray-500">.txtファイル（最大50MB）</p>
    </div>
  );
}

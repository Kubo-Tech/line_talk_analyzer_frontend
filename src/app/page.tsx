'use client';

import FileUploader from '@/components/upload/FileUploader';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileChange = (file: File | null) => {
    setUploadedFile(file);
  };

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">LINE流行語大賞 2024</h1>
        <p className="text-gray-600">LINEトーク履歴から今年の流行語を分析します</p>
      </div>

      <div className="space-y-8">
        {/* ファイルアップロード */}
        <section>
          <FileUploader onFileChange={handleFileChange} />
        </section>

        {/* ヘルプリンク */}
        <section className="text-center">
          <Link href="/help" className="inline-block text-blue-600 hover:underline">
            📖 トーク履歴の取得方法
          </Link>
        </section>

        {/* プライバシー同意 - PR#7で実装予定 */}
        <section className="rounded-lg border-2 border-gray-300 bg-gray-50 p-6">
          <div className="mb-4">
            <label className="flex items-start space-x-3">
              <input type="checkbox" className="mt-1 h-5 w-5 rounded border-gray-300" disabled />
              <span className="text-sm text-gray-600">
                プライバシーポリシーに同意する（実装予定）
              </span>
            </label>
          </div>
          <Link href="/privacy" className="text-sm text-blue-600 hover:underline">
            プライバシーポリシーを確認
          </Link>
        </section>

        {/* 解析開始ボタン - PR#8で実装予定 */}
        <section>
          <button
            disabled
            className="w-full rounded-lg bg-gray-400 px-8 py-4 text-xl font-bold text-white"
          >
            解析を開始する（実装予定）
          </button>
          {uploadedFile && (
            <p className="mt-2 text-center text-sm text-gray-600">ファイル: {uploadedFile.name}</p>
          )}
        </section>
      </div>
    </main>
  );
}

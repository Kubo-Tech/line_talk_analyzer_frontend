'use client';

import Loading from '@/components/common/Loading';
import { PrivacyPolicyModal } from '@/components/common/PrivacyPolicyModal';
import FileUploader from '@/components/upload/FileUploader';
import { PrivacyConsent } from '@/components/upload/PrivacyConsent';
import { useAnalyze } from '@/hooks/useAnalyze';
import { usePrivacyConsent } from '@/hooks/usePrivacyConsent';
import { ANALYSIS_DEFAULTS } from '@/lib/constants';
import { extractWithStats } from '@/lib/fileUtils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedFile, setExtractedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStats, setExtractionStats] = useState<{
    originalMessageCount: number;
    extractedMessageCount: number;
  } | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConsented, hasReadPolicy, toggleConsent, markAsRead } = usePrivacyConsent();
  const { isLoading, statusMessage, error, analyze, resetError } = useAnalyze();
  const router = useRouter();

  const handleFileChange = async (file: File | null) => {
    setUploadedFile(file);
    setExtractedFile(null);
    setExtractionStats(null);
    setExtractionError(null);

    if (!file) return;

    // ファイル選択時に期間抽出を実行
    setIsExtracting(true);
    try {
      const content = await file.text();
      const currentYear = new Date().getFullYear();
      const startDate = new Date(`${currentYear}-01-01`);
      const endDate = new Date(`${currentYear}-12-31`);

      const extraction = extractWithStats(content, startDate, endDate);

      setExtractionStats({
        originalMessageCount: extraction.originalMessageCount,
        extractedMessageCount: extraction.extractedMessageCount,
      });

      if (extraction.extractedMessageCount === 0) {
        setExtractionError(`${currentYear}年のメッセージが見つかりませんでした。`);
        return;
      }

      // 抽出した内容で新しいFileオブジェクトを作成
      const blob = new Blob([extraction.content], { type: 'text/plain' });
      const extracted = new File([blob], file.name, { type: 'text/plain' });
      setExtractedFile(extracted);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'ファイルの処理中にエラーが発生しました';
      setExtractionError(errorMessage);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleOpenPolicy = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    markAsRead();
  };

  /**
   * 解析開始ボタンがクリックされたときの処理
   */
  const handleAnalyzeClick = async () => {
    if (!extractedFile) return;

    // エラーがある場合はリセット
    if (error) {
      resetError();
    }

    // 解析実行（抽出済みファイルを使用、期間指定は不要）
    const result = await analyze({
      file: extractedFile,
      top_n: ANALYSIS_DEFAULTS.TOP_N,
      min_word_length: ANALYSIS_DEFAULTS.MIN_WORD_LENGTH,
      min_message_length: ANALYSIS_DEFAULTS.MIN_MESSAGE_LENGTH,
    });

    // 解析成功時に結果ページへ遷移
    if (result) {
      // 結果データをsessionStorageに保存
      sessionStorage.setItem('analysisResult', JSON.stringify(result));
      router.push('/result');
    }
  };

  // 抽出済みファイルがあり、プライバシー同意済みでボタンを有効化
  const isAnalyzeButtonEnabled =
    extractedFile !== null && isConsented && !isLoading && !isExtracting;

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">LINE流行語大賞 2025</h1>
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

        {/* プライバシー同意 */}
        <section>
          <PrivacyConsent
            isConsented={isConsented}
            hasReadPolicy={hasReadPolicy}
            onConsentChange={toggleConsent}
            onOpenPolicy={handleOpenPolicy}
          />
        </section>

        {/* 解析開始ボタン */}
        <section>
          <button
            onClick={handleAnalyzeClick}
            disabled={!isAnalyzeButtonEnabled}
            className={`w-full rounded-lg px-8 py-4 text-xl font-bold text-white transition-colors ${
              isAnalyzeButtonEnabled
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'cursor-not-allowed bg-gray-400'
            }`}
          >
            {isLoading ? '解析中...' : isExtracting ? '準備中...' : '解析を開始する'}
          </button>
          {uploadedFile && !isLoading && !isExtracting && (
            <p className="mt-2 text-center text-sm text-gray-600">ファイル: {uploadedFile.name}</p>
          )}
          {!isAnalyzeButtonEnabled && !isLoading && !isExtracting && (
            <p className="mt-2 text-center text-sm text-gray-500">
              {!uploadedFile && !isConsented
                ? 'ファイルを選択し、プライバシーポリシーに同意してください'
                : !uploadedFile
                  ? 'ファイルを選択してください'
                  : extractionError
                    ? extractionError
                    : 'プライバシーポリシーに同意してください'}
            </p>
          )}
          {/* 抽出エラー表示 */}
          {extractionError && !isExtracting && (
            <div role="alert" className="mt-4 rounded-lg border border-yellow-300 bg-yellow-50 p-4">
              <p className="text-sm font-semibold text-yellow-800">注意</p>
              <p className="mt-1 text-sm text-yellow-700">{extractionError}</p>
            </div>
          )}
          {/* 解析エラー表示 */}
          {error && (
            <div role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">エラーが発生しました</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          )}
        </section>
      </div>
      {/* プライバシーポリシーモーダル */}
      <PrivacyPolicyModal isOpen={isModalOpen} onClose={handleCloseModal} />
      {/* ファイル抽出中のローディング */}
      {isExtracting && <Loading overlay message="期間を抽出しています..." />}
      {/* 解析中のローディングオーバーレイ */}
      {isLoading && <Loading overlay message={statusMessage || '解析中...'} />}
    </main>
  );
}

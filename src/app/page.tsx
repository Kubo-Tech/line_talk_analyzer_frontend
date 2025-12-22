'use client';

import Loading from '@/components/common/Loading';
import { PrivacyPolicyModal } from '@/components/common/PrivacyPolicyModal';
import FileUploader from '@/components/upload/FileUploader';
import { PrivacyConsent } from '@/components/upload/PrivacyConsent';
import { useAnalyze } from '@/hooks/useAnalyze';
import { usePrivacyConsent } from '@/hooks/usePrivacyConsent';
import { ANALYSIS_DEFAULTS } from '@/lib/constants';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConsented, hasReadPolicy, toggleConsent, markAsRead } = usePrivacyConsent();
  const { isLoading, error, analyze, resetError } = useAnalyze();
  const router = useRouter();

  const handleFileChange = (file: File | null) => {
    console.log('[DEBUG] handleFileChange:', { fileName: file?.name, size: file?.size });
    setUploadedFile(file);
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
    console.log('[DEBUG] handleAnalyzeClick: 開始');
    if (!uploadedFile) return;

    // エラーがある場合はリセット
    if (error) {
      resetError();
    }

    // 解析実行（今年全体を指定）
    const currentYear = new Date().getFullYear();
    console.log('[DEBUG] analyze呼び出し開始', { fileName: uploadedFile.name, size: uploadedFile.size });
    const result = await analyze({
      file: uploadedFile,
      top_n: ANALYSIS_DEFAULTS.TOP_N,
      min_word_length: ANALYSIS_DEFAULTS.MIN_WORD_LENGTH,
      min_message_length: ANALYSIS_DEFAULTS.MIN_MESSAGE_LENGTH,
      start_date: `${currentYear}-01-01 00:00:00`,
      end_date: `${currentYear}-12-31 23:59:59`,
    });

    console.log('[DEBUG] analyze呼び出し完了', { hasResult: !!result });
    // 解析成功時に結果ページへ遷移
    if (result) {
      try {
        // 結果データをsessionStorageに保存
        console.log('[DEBUG] sessionStorage保存開始');
        const resultJson = JSON.stringify(result);
        const sizeInMB = new Blob([resultJson]).size / (1024 * 1024);
        console.log('[DEBUG] 結果データサイズ', { sizeInMB: sizeInMB.toFixed(2) + 'MB' });
        
        sessionStorage.setItem('analysisResult', resultJson);
        console.log('[DEBUG] sessionStorage保存完了');
        console.log('[DEBUG] 結果ページへ遷移');
        router.push('/result');
      } catch (storageError) {
        console.error('[DEBUG] sessionStorage保存エラー', storageError);
        // sessionStorageに保存できない場合は、エラーメッセージを表示
        alert(
          'データが大きすぎて保存できませんでした。\n' +
            'より小さいファイルをお試しください。'
        );
      }
    }
  };

  // ファイル選択済み かつ プライバシー同意済みでボタンを有効化
  const isAnalyzeButtonEnabled = uploadedFile !== null && isConsented && !isLoading;

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
            {isLoading ? '解析中...' : '解析を開始する'}
          </button>
          {uploadedFile && !isLoading && (
            <p className="mt-2 text-center text-sm text-gray-600">ファイル: {uploadedFile.name}</p>
          )}
          {!isAnalyzeButtonEnabled && !isLoading && (
            <p className="mt-2 text-center text-sm text-gray-500">
              {!uploadedFile && !isConsented
                ? 'ファイルを選択し、プライバシーポリシーに同意してください'
                : !uploadedFile
                  ? 'ファイルを選択してください'
                  : 'プライバシーポリシーに同意してください'}
            </p>
          )}
          {/* エラー表示 */}
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
      {/* ローディングオーバーレイ */}
      {isLoading && <Loading overlay />}
    </main>
  );
}

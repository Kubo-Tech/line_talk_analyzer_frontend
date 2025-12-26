'use client';

import Loading from '@/components/common/Loading';
import { PrivacyPolicyModal } from '@/components/common/PrivacyPolicyModal';
import { SettingsModal } from '@/components/settings/SettingsModal';
import FileUploader from '@/components/upload/FileUploader';
import { PrivacyConsent } from '@/components/upload/PrivacyConsent';
import { useFile } from '@/contexts/FileContext';
import { useAnalyze } from '@/hooks/useAnalyze';
import { usePrivacyConsent } from '@/hooks/usePrivacyConsent';
import { useServerWarmup } from '@/hooks/useServerWarmup';
import { useSettings } from '@/hooks/useSettings';
import { ANALYSIS_DEFAULTS } from '@/lib/constants';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Home() {
  const { uploadedFile, setUploadedFile } = useFile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { isConsented, hasReadPolicy, toggleConsent, markAsRead } = usePrivacyConsent();
  const { isLoading, isWaitingForWarmup, error, analyze, resetError } = useAnalyze();
  const { warmup } = useServerWarmup();
  const { settings, isLoaded, updateSettings } = useSettings();
  const router = useRouter();

  const handleFileChange = (file: File | null) => {
    setUploadedFile(file);
  };

  const handleOpenPolicy = () => {
    setIsModalOpen(true);
    // プライバシーポリシーを読んでいる間にサーバーをウォームアップ
    warmup();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    markAsRead();
  };

  /**
   * 解析開始ボタンがクリックされたときの処理
   */
  const handleAnalyzeClick = async () => {
    if (!uploadedFile) return;

    // エラーがある場合はリセット
    if (error) {
      resetError();
    }

    // 解析実行
    const result = await analyze({
      file: uploadedFile,
      top_n: ANALYSIS_DEFAULTS.TOP_N,
      start_date: settings.startDate,
      end_date: settings.endDate,
      min_word_length: settings.minWordLength === '' ? 1 : settings.minWordLength,
      max_word_length: settings.maxWordLength ?? undefined,
      min_message_length: settings.minMessageLength === '' ? 1 : settings.minMessageLength,
      max_message_length: settings.maxMessageLength ?? undefined,
      min_word_count: settings.minWordCount === '' ? 1 : settings.minWordCount,
      min_message_count: settings.minMessageCount === '' ? 1 : settings.minMessageCount,
    });

    // 解析成功時に結果ページへ遷移
    if (result) {
      // 結果データをsessionStorageに保存
      sessionStorage.setItem('analysisResult', JSON.stringify(result));
      router.push('/result');
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

        {/* 設定変更ボタン */}
        <section className="text-center">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-2 text-blue-600 hover:underline"
            disabled={!isLoaded}
          >
            ⚙️ 設定変更
          </button>
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
      {/* 設定モーダル */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onApply={updateSettings}
      />
      {/* ローディングオーバーレイ */}
      {isLoading && (
        <Loading
          overlay
          message={
            isWaitingForWarmup ? 'サーバー起動中…\n（初回のみ時間がかかります）' : '解析中...'
          }
        />
      )}
    </main>
  );
}

'use client';

import Button from '@/components/common/Button';
import Loading from '@/components/common/Loading';
import RankingContainer from '@/components/result/RankingContainer';
import ResultSummary from '@/components/result/ResultSummary';
import UserTabs from '@/components/result/UserTabs';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { useFile } from '@/contexts/FileContext';
import { useAnalyze } from '@/hooks/useAnalyze';
import { useSettings } from '@/hooks/useSettings';
import { ANALYSIS_DEFAULTS } from '@/lib/constants';
import { AnalysisResponse, TopMessage, TopWord } from '@/types/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function ResultPage() {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [activeUser, setActiveUser] = useState('全体');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [hasSettingsChanged, setHasSettingsChanged] = useState(false);
  const router = useRouter();
  const { settings, isLoaded, updateSettings } = useSettings();
  const { uploadedFile } = useFile();
  const { isLoading, analyze } = useAnalyze();

  useEffect(() => {
    // sessionStorageから解析結果を取得
    const storedResult = sessionStorage.getItem('analysisResult');
    if (storedResult) {
      try {
        const parsedResult: AnalysisResponse = JSON.parse(storedResult);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setResult(parsedResult);
      } catch (error) {
        console.error('解析結果の読み込みに失敗しました:', error);
        router.push('/');
      }
    } else {
      // 結果がない場合はトップページにリダイレクト
      router.push('/');
    }
  }, [router]);

  // ユーザー名リストを取得
  const users = useMemo(() => {
    if (!result || !result.data.user_analysis?.word_analysis) return [];
    const wordUsers = result.data.user_analysis.word_analysis.map((ua) => ua.user);
    return Array.from(new Set(wordUsers));
  }, [result]);

  // 現在選択されているユーザーのランキングデータを取得
  const currentWordRanking: TopWord[] = useMemo(() => {
    if (!result) return [];
    if (activeUser === '全体') {
      return result.data.morphological_analysis?.top_words || [];
    }
    if (!result.data.user_analysis?.word_analysis) return [];
    const userWordData = result.data.user_analysis.word_analysis.find(
      (ua) => ua.user === activeUser
    );
    return userWordData?.top_words || [];
  }, [activeUser, result]);

  const currentMessageRanking: TopMessage[] = useMemo(() => {
    if (!result) return [];
    if (activeUser === '全体') {
      return result.data.full_message_analysis?.top_messages || [];
    }
    if (!result.data.user_analysis?.message_analysis) return [];
    const userMessageData = result.data.user_analysis.message_analysis.find(
      (ua) => ua.user === activeUser
    );
    return userMessageData?.top_messages || [];
  }, [activeUser, result]);

  // 設定を適用（保存のみ）
  const handleApplySettings = (newSettings: typeof settings) => {
    updateSettings(newSettings);
    setHasSettingsChanged(true);
  };

  // 再解析を実行
  const handleReanalyze = async () => {
    // ファイルがない場合はトップページへ
    if (!uploadedFile) {
      alert('ファイルが見つかりません。トップページから再度アップロードしてください。');
      router.push('/');
      return;
    }

    // 再解析実行
    const newResult = await analyze({
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

    // 解析成功時に結果を更新
    if (newResult) {
      setResult(newResult);
      sessionStorage.setItem('analysisResult', JSON.stringify(newResult));
      // 全体タブに戻す
      setActiveUser('全体');
      // 設定変更フラグをリセット
      setHasSettingsChanged(false);
    }
  };

  if (!result) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </main>
    );
  }

  const { data } = result;
  const { analysis_period, total_messages, total_users } = data;

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">解析結果</h1>
        <p className="text-gray-600">あなたのLINEトーク解析レポート</p>
      </div>

      {/* 解析期間と統計情報 */}
      <ResultSummary
        startDate={analysis_period.start_date}
        endDate={analysis_period.end_date}
        totalMessages={total_messages}
        totalUsers={total_users}
      />

      {/* 設定変更ボタン */}
      <section className="mb-6 flex items-center justify-center gap-4">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="inline-flex items-center gap-2 text-blue-600 hover:underline"
          disabled={!isLoaded || isLoading}
        >
          ⚙️ 設定変更
        </button>
        <button
          onClick={handleReanalyze}
          disabled={isLoading || !uploadedFile || !hasSettingsChanged}
          className={`rounded-lg px-6 py-2 font-semibold text-white transition-colors ${
            isLoading || !uploadedFile || !hasSettingsChanged
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          🔄 再解析
        </button>
      </section>

      {/* ユーザータブ */}
      <UserTabs users={users} activeUser={activeUser} onUserChange={setActiveUser} />

      {/* ランキング表示 */}
      <RankingContainer wordRanking={currentWordRanking} messageRanking={currentMessageRanking} />

      {/* アクション */}
      <section className="space-y-4">
        <Link href="/" className="block">
          <Button variant="primary" className="w-full">
            別のファイルを解析
          </Button>
        </Link>
      </section>

      {/* 設定モーダル */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onApply={handleApplySettings}
      />

      {/* ローディングオーバーレイ */}
      {isLoading && <Loading overlay message="再解析中..." />}
    </main>
  );
}

'use client';

import Button from '@/components/common/Button';
import RankingContainer from '@/components/result/RankingContainer';
import ResultSummary from '@/components/result/ResultSummary';
import UserTabs from '@/components/result/UserTabs';
import { AnalysisResponse, TopMessage, TopWord } from '@/types/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

export default function ResultPage() {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const [activeUser, setActiveUser] = useState('全体');
  const router = useRouter();

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
    </main>
  );
}

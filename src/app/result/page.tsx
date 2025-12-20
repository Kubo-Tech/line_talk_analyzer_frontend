'use client';

import Button from '@/components/common/Button';
import { AnalysisResponse } from '@/types/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ResultPage() {
  const [result, setResult] = useState<AnalysisResponse | null>(null);
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
  const {
    analysis_period,
    total_messages,
    total_users,
    morphological_analysis,
    full_message_analysis,
  } = data;

  return (
    <main className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">解析結果</h1>
        <p className="text-gray-600">あなたのLINEトーク解析レポート</p>
      </div>

      {/* 解析期間と統計情報 */}
      <section className="mb-8 rounded-lg bg-gray-50 p-6">
        <h2 className="mb-4 text-xl font-bold">解析情報</h2>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">期間:</span>{' '}
            {new Date(analysis_period.start_date).toLocaleDateString('ja-JP')} 〜{' '}
            {new Date(analysis_period.end_date).toLocaleDateString('ja-JP')}
          </p>
          <p>
            <span className="font-semibold">総メッセージ数:</span> {total_messages.toLocaleString()}
            件
          </p>
          <p>
            <span className="font-semibold">参加者数:</span> {total_users}人
          </p>
        </div>
      </section>

      {/* 流行語大賞 TOP10 */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">🏆 流行語大賞 TOP10</h2>
        <div className="space-y-2">
          {morphological_analysis.top_words.slice(0, 10).map((word, index) => (
            <div
              key={`${word.word}-${word.count}`}
              className={`flex items-center justify-between rounded-lg p-4 ${
                index === 0
                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 font-bold'
                  : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <span
                  className={`text-2xl font-bold ${
                    index === 0
                      ? 'text-yellow-600'
                      : index === 1
                        ? 'text-gray-500'
                        : index === 2
                          ? 'text-orange-600'
                          : 'text-gray-400'
                  }`}
                >
                  {index + 1}
                </span>
                <div>
                  <p className="text-lg font-semibold">{word.word}</p>
                  <p className="text-xs text-gray-500">{word.part_of_speech}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-600">{word.count}回</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 流行メッセージ TOP10 */}
      <section className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">💬 流行メッセージ TOP10</h2>
        <div className="space-y-2">
          {full_message_analysis.top_messages.slice(0, 10).map((message, index) => (
            <div
              key={`${message.message}-${message.count}`}
              className={`flex items-center justify-between rounded-lg p-4 ${
                index === 0 ? 'bg-gradient-to-r from-blue-100 to-blue-50 font-bold' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-4">
                <span
                  className={`text-2xl font-bold ${
                    index === 0
                      ? 'text-blue-600'
                      : index === 1
                        ? 'text-gray-500'
                        : index === 2
                          ? 'text-orange-600'
                          : 'text-gray-400'
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-base">{message.message}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-600">{message.count}回</p>
              </div>
            </div>
          ))}
        </div>
      </section>

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

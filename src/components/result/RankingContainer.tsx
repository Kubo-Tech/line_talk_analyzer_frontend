'use client';

import { TopMessage, TopWord } from '@/types/api';
import { useState } from 'react';
import RankingList from './RankingList';

interface RankingContainerProps {
  wordRanking: TopWord[];
  messageRanking: TopMessage[];
}

const RANKING_TITLES = ['🏆 流行語大賞 TOP10', '💬 流行メッセージ TOP10'] as const;
const RANKING_TITLES_MOBILE = ['🏆', '💬'] as const;

/**
 * ランキングを表示するコンテナコンポーネント
 * PC: 横並び表示
 * モバイル: スライド切り替え表示
 */
export default function RankingContainer({ wordRanking, messageRanking }: RankingContainerProps) {
  const [activeIndex, setActiveIndex] = useState(0); // 0: 流行語大賞, 1: 流行メッセージ

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev === 0 ? RANKING_TITLES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === RANKING_TITLES.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      {/* モバイル表示: スライド切り替え */}
      <div className="block lg:hidden">
        {/* スライドヘッダー */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600"
            aria-label="前へ"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h2 className="flex-1 text-center text-lg font-semibold dark:text-gray-100">
            {RANKING_TITLES_MOBILE[activeIndex]}
          </h2>
          <button
            onClick={handleNext}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600"
            aria-label="次へ"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* スライドインジケーター */}
        <div className="mb-4 flex justify-center gap-2">
          {RANKING_TITLES.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-2 w-2 rounded-full transition-all ${
                index === activeIndex ? 'w-8 bg-blue-600 dark:bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={`${index + 1}番目のランキングへ移動`}
              aria-pressed={index === activeIndex}
              aria-current={index === activeIndex ? 'true' : undefined}
            />
          ))}
        </div>

        {/* コンテンツ */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            <div className="w-full flex-shrink-0">
              <RankingList items={wordRanking} type="word" title="🏆 流行語大賞 TOP10" />
            </div>
            <div className="w-full flex-shrink-0">
              <RankingList items={messageRanking} type="message" title="💬 流行メッセージ TOP10" />
            </div>
          </div>
        </div>
      </div>

      {/* PC表示: 横並び */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-8">
        <RankingList items={wordRanking} type="word" title="🏆 流行語大賞 TOP10" />
        <RankingList items={messageRanking} type="message" title="💬 流行メッセージ TOP10" />
      </div>
    </>
  );
}

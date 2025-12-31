'use client';

import { RANKING_DISPLAY } from '@/lib/constants';
import { TopMessage, TopWord } from '@/types/api';
import { useState } from 'react';
import RankingItem from './RankingItem';

interface RankingListProps {
  items: (TopWord | TopMessage)[];
  type: 'word' | 'message';
  title: string;
}

/**
 * ランキングリストを表示するコンポーネント
 * 初期表示10件、「もっと見る」で100位まで展開
 */
export default function RankingList({ items, type, title }: RankingListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 表示するアイテム数を決定
  const displayCount = isExpanded
    ? RANKING_DISPLAY.MAX_DISPLAY_COUNT
    : RANKING_DISPLAY.INITIAL_DISPLAY_COUNT;
  const displayItems = items.slice(0, displayCount);

  // もっと見るボタンを表示するかどうか
  const showButton = items.length > RANKING_DISPLAY.INITIAL_DISPLAY_COUNT;

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-center text-2xl font-bold">{title}</h2>
      <div className="space-y-2">
        {displayItems.map((item, index) => {
          const itemKey = type === 'word' ? (item as TopWord).word : (item as TopMessage).message;
          return (
            <RankingItem key={`${index}-${itemKey}`} rank={index + 1} item={item} type={type} />
          );
        })}
      </div>
      {showButton && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          className="mt-4 w-full rounded-lg border-2 border-blue-600 bg-white px-6 py-3 text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-500 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
        >
          {isExpanded ? '閉じる' : `もっと見る（${RANKING_DISPLAY.MAX_DISPLAY_COUNT}位まで）`}
        </button>
      )}
      {isExpanded && items.length > RANKING_DISPLAY.MAX_DISPLAY_COUNT && (
        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          {RANKING_DISPLAY.MAX_DISPLAY_COUNT}位まで表示しています（全{items.length}件中）
        </p>
      )}
    </section>
  );
}

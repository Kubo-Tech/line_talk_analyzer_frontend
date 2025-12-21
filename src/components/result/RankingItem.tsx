import { TopMessage, TopWord } from '@/types/api';

interface RankingItemProps {
  rank: number;
  item: TopWord | TopMessage;
  type: 'word' | 'message';
}

/**
 * ランキングの各項目を表示するコンポーネント
 * 1位は特別なスタイリングで強調表示
 */
export default function RankingItem({ rank, item, type }: RankingItemProps) {
  const isFirstPlace = rank === 1;
  const isSecondPlace = rank === 2;
  const isThirdPlace = rank === 3;

  // 順位の色を取得
  const getRankColor = () => {
    if (isFirstPlace) return type === 'word' ? 'text-yellow-600' : 'text-blue-600';
    if (isSecondPlace) return 'text-gray-500';
    if (isThirdPlace) return 'text-orange-600';
    return 'text-gray-400';
  };

  // 背景色を取得
  const getBackgroundColor = () => {
    if (isFirstPlace) {
      return type === 'word'
        ? 'bg-gradient-to-r from-yellow-100 to-yellow-50'
        : 'bg-gradient-to-r from-blue-100 to-blue-50';
    }
    return 'bg-gray-50';
  };

  // アイテムのテキストを取得
  const itemText = 'word' in item ? item.word : item.message;

  return (
    <div
      className={`flex items-center justify-between rounded-lg p-4 ${getBackgroundColor()} ${
        isFirstPlace ? 'font-bold' : ''
      }`}
    >
      <div className="flex items-center space-x-4">
        <span className={`text-2xl font-bold ${getRankColor()}`}>{rank}</span>
        <div className={type === 'message' ? 'flex-1' : ''}>
          <p className={type === 'word' ? 'text-lg font-semibold' : 'text-base font-semibold'}>
            {itemText}
          </p>
          {type === 'word' && 'part_of_speech' in item && (
            <p className="text-xs text-gray-500">{item.part_of_speech}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-xl font-bold text-blue-600">{item.count}回</p>
      </div>
    </div>
  );
}

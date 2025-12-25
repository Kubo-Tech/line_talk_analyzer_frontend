import { TopMessage, TopWord } from '@/types/api';

interface RankingItemProps {
  rank: number;
  item: TopWord | TopMessage;
  type: 'word' | 'message';
}

/**
 * ランキングの各項目を表示するコンポーネント
 * 1〜3位は大きく目立つ表示、4位以降はコンパクトに表示（Issue#03）
 */
export default function RankingItem({ rank, item, type }: RankingItemProps) {
  const isFirstPlace = rank === 1;
  const isSecondPlace = rank === 2;
  const isThirdPlace = rank === 3;
  const isTopThree = rank <= 3;

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
    if (isSecondPlace) {
      return 'bg-gradient-to-r from-gray-200 to-gray-100';
    }
    if (isThirdPlace) {
      return 'bg-gradient-to-r from-orange-200 to-orange-100';
    }
    return 'bg-gray-50';
  };

  // アイテムのテキストを取得
  const itemText = 'word' in item ? item.word : item.message;

  // Issue#03: 1〜3位と4位以降でスタイルを変える
  const paddingClass = isTopThree ? 'py-6 px-4' : 'py-2 px-4';
  const borderClass = isTopThree ? 'border-b-2 border-gray-300' : 'border-b border-gray-200';
  const rankSizeClass = isTopThree ? 'text-3xl' : 'text-lg';
  const itemSizeClass = isTopThree
    ? type === 'word'
      ? 'text-2xl'
      : 'text-xl'
    : type === 'word'
      ? 'text-base'
      : 'text-sm';
  const countSizeClass = isTopThree ? 'text-xl' : 'text-sm';

  return (
    <div
      className={`flex items-center justify-between rounded-lg ${paddingClass} ${borderClass} ${getBackgroundColor()} ${
        isFirstPlace ? 'font-bold' : ''
      }`}
    >
      <div className="flex items-center space-x-4">
        <span className={`${rankSizeClass} font-bold ${getRankColor()}`}>{rank}</span>
        <div className={type === 'message' ? 'flex-1' : ''}>
          <p className={`${itemSizeClass} font-semibold`}>{itemText}</p>
          {type === 'word' && 'part_of_speech' in item && (
            <p className="text-xs text-gray-500">{item.part_of_speech}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className={`${countSizeClass} font-bold text-blue-600`}>{item.count}回</p>
      </div>
    </div>
  );
}

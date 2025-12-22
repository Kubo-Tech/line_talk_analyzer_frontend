import { render, screen } from '@testing-library/react';
import RankingItem from '@/components/result/RankingItem';
import { TopWord, TopMessage } from '@/types/api';

describe('RankingItem', () => {
  const mockWord: TopWord = {
    word: 'テスト',
    count: 42,
    part_of_speech: '名詞',
  };

  const mockMessage: TopMessage = {
    message: 'こんにちは',
    count: 10,
  };

  describe('word type', () => {
    it('順位、単語、品詞、回数を表示する', () => {
      render(<RankingItem rank={1} item={mockWord} type="word" />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('テスト')).toBeInTheDocument();
      expect(screen.getByText('名詞')).toBeInTheDocument();
      expect(screen.getByText('42回')).toBeInTheDocument();
    });

    it('1位の場合、黄色のグラデーション背景を適用する', () => {
      const { container } = render(<RankingItem rank={1} item={mockWord} type="word" />);
      const itemDiv = container.querySelector('.from-yellow-100');
      expect(itemDiv).toBeInTheDocument();
    });

    it('2位の場合、灰色の順位色を適用する', () => {
      render(<RankingItem rank={2} item={mockWord} type="word" />);
      const rankSpan = screen.getByText('2');
      expect(rankSpan).toHaveClass('text-gray-500');
    });

    it('3位の場合、オレンジの順位色を適用する', () => {
      render(<RankingItem rank={3} item={mockWord} type="word" />);
      const rankSpan = screen.getByText('3');
      expect(rankSpan).toHaveClass('text-orange-600');
    });

    it('4位以降の場合、通常の背景を適用する', () => {
      const { container } = render(<RankingItem rank={4} item={mockWord} type="word" />);
      const itemDiv = container.querySelector('.bg-gray-50');
      expect(itemDiv).toBeInTheDocument();
    });
  });

  describe('message type', () => {
    it('順位、メッセージ、回数を表示する', () => {
      render(<RankingItem rank={1} item={mockMessage} type="message" />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('こんにちは')).toBeInTheDocument();
      expect(screen.getByText('10回')).toBeInTheDocument();
    });

    it('1位の場合、青のグラデーション背景を適用する', () => {
      const { container } = render(<RankingItem rank={1} item={mockMessage} type="message" />);
      const itemDiv = container.querySelector('.from-blue-100');
      expect(itemDiv).toBeInTheDocument();
    });

    it('品詞は表示しない', () => {
      render(<RankingItem rank={1} item={mockMessage} type="message" />);
      expect(screen.queryByText('名詞')).not.toBeInTheDocument();
    });
  });
});

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
      expect(screen.getByText('(名詞)')).toBeInTheDocument();
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

    // Issue#03: 1〜3位と4位以降でスタイルが異なる
    it('1〜3位の場合、中くらいのpadding（py-4）を適用する', () => {
      const { container: container1 } = render(<RankingItem rank={1} item={mockWord} type="word" />);
      const { container: container2 } = render(<RankingItem rank={2} item={mockWord} type="word" />);
      const { container: container3 } = render(<RankingItem rank={3} item={mockWord} type="word" />);

      expect(container1.querySelector('.py-4')).toBeInTheDocument();
      expect(container2.querySelector('.py-4')).toBeInTheDocument();
      expect(container3.querySelector('.py-4')).toBeInTheDocument();
    });

    it('4位以降の場合、小さなpadding（py-2）を適用する', () => {
      const { container } = render(<RankingItem rank={4} item={mockWord} type="word" />);
      expect(container.querySelector('.py-2')).toBeInTheDocument();
    });

    it('1〜3位の場合、太いボーダー（border-b-2）を適用する', () => {
      const { container } = render(<RankingItem rank={1} item={mockWord} type="word" />);
      expect(container.querySelector('.border-b-2')).toBeInTheDocument();
    });

    it('4位以降の場合、細いボーダー（border-b）を適用する', () => {
      const { container } = render(<RankingItem rank={4} item={mockWord} type="word" />);
      const itemDiv = container.querySelector('.border-b');
      expect(itemDiv).toBeInTheDocument();
      expect(container.querySelector('.border-b-2')).not.toBeInTheDocument();
    });

    it('1〜3位の場合、大きな順位表示（text-3xl）を適用する', () => {
      render(<RankingItem rank={1} item={mockWord} type="word" />);
      const rankSpan = screen.getByText('1');
      expect(rankSpan).toHaveClass('text-3xl');
    });

    it('4位以降の場合、中サイズの順位表示（text-lg）を適用する', () => {
      render(<RankingItem rank={4} item={mockWord} type="word" />);
      const rankSpan = screen.getByText('4');
      expect(rankSpan).toHaveClass('text-lg');
    });
    it('2位の場合、銀色のグラデーション背景を適用する', () => {
      const { container } = render(<RankingItem rank={2} item={mockWord} type="word" />);
      const itemDiv = container.querySelector('.from-gray-200');
      expect(itemDiv).toBeInTheDocument();
    });

    it('3位の場合、銅色のグラデーション背景を適用する', () => {
      const { container } = render(<RankingItem rank={3} item={mockWord} type="word" />);
      const itemDiv = container.querySelector('.from-orange-200');
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

    it('1位の場合、黄色のグラデーション背景を適用する', () => {
      const { container } = render(<RankingItem rank={1} item={mockMessage} type="message" />);
      const itemDiv = container.querySelector('.from-yellow-100');
      expect(itemDiv).toBeInTheDocument();
    });

    it('1位の場合、順位番号が金色（text-yellow-600）で表示される', () => {
      render(<RankingItem rank={1} item={mockMessage} type="message" />);
      const rankSpan = screen.getByText('1');
      expect(rankSpan).toHaveClass('text-yellow-600');
    });

    it('品詞は表示しない', () => {
      render(<RankingItem rank={1} item={mockMessage} type="message" />);
      expect(screen.queryByText('名詞')).not.toBeInTheDocument();
    });
  });
});

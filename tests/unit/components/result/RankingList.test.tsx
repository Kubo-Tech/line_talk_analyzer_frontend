import { render, screen, fireEvent } from '@testing-library/react';
import RankingList from '@/components/result/RankingList';
import { TopWord } from '@/types/api';

describe('RankingList', () => {
  const createMockWords = (count: number): TopWord[] => {
    return Array.from({ length: count }, (_, i) => ({
      word: `単語${i + 1}`,
      count: 100 - i,
      part_of_speech: '名詞',
      appearances: [],
    }));
  };

  describe('初期表示', () => {
    it('タイトルを表示する', () => {
      const items = createMockWords(15);
      render(<RankingList items={items} type="word" title="🏆 流行語大賞 TOP10" />);

      expect(screen.getByText('🏆 流行語大賞 TOP10')).toBeInTheDocument();
    });

    it('初期状態では10件のみ表示する', () => {
      const items = createMockWords(50);
      render(<RankingList items={items} type="word" title="テストランキング" />);

      expect(screen.getByText('単語1')).toBeInTheDocument();
      expect(screen.getByText('単語10')).toBeInTheDocument();
      expect(screen.queryByText('単語11')).not.toBeInTheDocument();
    });

    it('10件以下の場合は全て表示する', () => {
      const items = createMockWords(5);
      render(<RankingList items={items} type="word" title="テストランキング" />);

      expect(screen.getByText('単語1')).toBeInTheDocument();
      expect(screen.getByText('単語5')).toBeInTheDocument();
    });
  });

  describe('もっと見るボタン', () => {
    it('10件を超える場合、もっと見るボタンを表示する', () => {
      const items = createMockWords(50);
      render(<RankingList items={items} type="word" title="テストランキング" />);

      expect(screen.getByText('もっと見る（100位まで）')).toBeInTheDocument();
    });

    it('10件以下の場合、もっと見るボタンを表示しない', () => {
      const items = createMockWords(5);
      render(<RankingList items={items} type="word" title="テストランキング" />);

      expect(screen.queryByText('もっと見る（100位まで）')).not.toBeInTheDocument();
    });

    it('もっと見るボタンをクリックすると100件まで展開する', () => {
      const items = createMockWords(150);
      render(<RankingList items={items} type="word" title="テストランキング" />);

      // 初期状態では11件目以降は非表示
      expect(screen.queryByText('単語11')).not.toBeInTheDocument();

      // もっと見るをクリック
      const moreButton = screen.getByText('もっと見る（100位まで）');
      fireEvent.click(moreButton);

      // 100件目まで表示される
      expect(screen.getByText('単語11')).toBeInTheDocument();
      expect(screen.getByText('単語100')).toBeInTheDocument();
      expect(screen.queryByText('単語101')).not.toBeInTheDocument();

      // ボタンは消えず、「閉じる」に文言が切り替わる
      expect(screen.getByText('閉じる')).toBeInTheDocument();
    });

    it('閉じるボタンをクリックすると10件表示に戻る', () => {
      const items = createMockWords(150);
      render(<RankingList items={items} type="word" title="テストランキング" />);

      // まず展開する
      const moreButton = screen.getByText('もっと見る（100位まで）');
      fireEvent.click(moreButton);

      // 展開されていることを確認
      expect(screen.getByText('単語11')).toBeInTheDocument();
      expect(screen.getByText('単語100')).toBeInTheDocument();

      // 「閉じる」をクリックすると10件表示に戻る
      const closeButton = screen.getByText('閉じる');
      fireEvent.click(closeButton);
      expect(screen.queryByText('単語11')).not.toBeInTheDocument();
      expect(screen.getByText('単語10')).toBeInTheDocument();

      // ボタンの文言が「もっと見る（100位まで）」に戻る
      expect(screen.getByText('もっと見る（100位まで）')).toBeInTheDocument();
    });

    it('100件を超える場合、展開後に件数表示を追加する', () => {
      const items = createMockWords(150);
      render(<RankingList items={items} type="word" title="テストランキング" />);

      // もっと見るをクリック
      const moreButton = screen.getByText('もっと見る（100位まで）');
      fireEvent.click(moreButton);

      expect(screen.getByText('100位まで表示しています（全150件中）')).toBeInTheDocument();
    });
  });
});

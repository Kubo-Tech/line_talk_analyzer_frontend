import { render, screen, fireEvent } from '@testing-library/react';
import RankingContainer from '@/components/result/RankingContainer';
import { TopWord, TopMessage } from '@/types/api';

// window.matchMedia をモック
const createMatchMedia = (matches: boolean) => {
  return (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  });
};

describe('RankingContainer', () => {
  const mockWordRanking: TopWord[] = Array.from({ length: 15 }, (_, i) => ({
    word: `単語${i + 1}`,
    count: 100 - i,
    part_of_speech: '名詞',
    appearances: [],
  }));

  const mockMessageRanking: TopMessage[] = Array.from({ length: 15 }, (_, i) => ({
    message: `メッセージ${i + 1}`,
    count: 100 - i,
    appearances: [],
  }));

  describe('モバイル表示（lg未満）', () => {
    beforeEach(() => {
      // モバイルサイズをシミュレート
      window.matchMedia = createMatchMedia(false) as any;
    });

    it('初期状態では流行語大賞を表示する', () => {
      render(<RankingContainer wordRanking={mockWordRanking} messageRanking={mockMessageRanking} />);

      // モバイル用のタイトルが表示される
      const mobileTitles = screen.getAllByText('🏆 流行語大賞 TOP10');
      expect(mobileTitles.length).toBeGreaterThan(0);

      // 流行語が表示される
      expect(screen.getAllByText('単語1').length).toBeGreaterThan(0);
    });

    it('左右の矢印ボタンが表示される', () => {
      render(<RankingContainer wordRanking={mockWordRanking} messageRanking={mockMessageRanking} />);

      const prevButton = screen.getByLabelText('前へ');
      const nextButton = screen.getByLabelText('次へ');

      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });

    it('スライドインジケーターが表示される', () => {
      render(<RankingContainer wordRanking={mockWordRanking} messageRanking={mockMessageRanking} />);

      const indicators = screen.getAllByLabelText(/番目のランキングへ移動/);
      expect(indicators).toHaveLength(2);
    });

    it('次へボタンをクリックすると流行メッセージに切り替わる', () => {
      render(<RankingContainer wordRanking={mockWordRanking} messageRanking={mockMessageRanking} />);

      // 初期状態
      expect(screen.getAllByText('🏆 流行語大賞 TOP10').length).toBeGreaterThan(0);

      // 次へボタンをクリック
      const nextButton = screen.getByLabelText('次へ');
      fireEvent.click(nextButton);

      // タイトルが流行メッセージに変わる（モバイル用のh2タイトル）
      const mobileTitle = screen.getAllByText('💬 流行メッセージ TOP10')[0];
      expect(mobileTitle).toHaveClass('text-xl');
    });

    it('前へボタンをクリックするとスライドを切り替える', () => {
      render(<RankingContainer wordRanking={mockWordRanking} messageRanking={mockMessageRanking} />);

      // 初期状態は流行語大賞
      expect(screen.getAllByText('🏆 流行語大賞 TOP10').length).toBeGreaterThan(0);

      // 前へボタンをクリック
      const prevButton = screen.getByLabelText('前へ');
      fireEvent.click(prevButton);

      // 流行メッセージに切り替わる
      const mobileTitle = screen.getAllByText('💬 流行メッセージ TOP10')[0];
      expect(mobileTitle).toHaveClass('text-xl');
    });

    it('インジケーターをクリックして直接スライドを切り替えられる', () => {
      render(<RankingContainer wordRanking={mockWordRanking} messageRanking={mockMessageRanking} />);

      // 2番目のインジケーターをクリック
      const secondIndicator = screen.getByLabelText('2番目のランキングへ移動');
      fireEvent.click(secondIndicator);

      // 流行メッセージに切り替わる
      const mobileTitle = screen.getAllByText('💬 流行メッセージ TOP10')[0];
      expect(mobileTitle).toHaveClass('text-xl');
    });

    it('スライド位置に応じてtransformスタイルが変化する', () => {
      const { container } = render(
        <RankingContainer wordRanking={mockWordRanking} messageRanking={mockMessageRanking} />
      );

      // スライドコンテナを取得
      const slideContainer = container.querySelector('.flex.transition-transform') as HTMLElement;
      expect(slideContainer).toBeInTheDocument();

      // 初期状態
      expect(slideContainer.style.transform).toBe('translateX(-0%)');

      // 次へボタンをクリック
      const nextButton = screen.getByLabelText('次へ');
      fireEvent.click(nextButton);

      // transformが変化する
      expect(slideContainer.style.transform).toBe('translateX(-100%)');
    });
  });

  describe('PC表示（lg以上）', () => {
    beforeEach(() => {
      // PC サイズをシミュレート
      window.matchMedia = createMatchMedia(true) as any;
    });

    it('流行語大賞と流行メッセージが横並びで表示される', () => {
      render(<RankingContainer wordRanking={mockWordRanking} messageRanking={mockMessageRanking} />);

      // 両方のタイトルが表示される
      expect(screen.getAllByText('🏆 流行語大賞 TOP10').length).toBeGreaterThan(0);
      expect(screen.getAllByText('💬 流行メッセージ TOP10').length).toBeGreaterThan(0);

      // 両方のコンテンツが表示される
      expect(screen.getAllByText('単語1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('メッセージ1').length).toBeGreaterThan(0);
    });

    it('矢印ボタンやインジケーターは表示されない（モバイル専用）', () => {
      render(<RankingContainer wordRanking={mockWordRanking} messageRanking={mockMessageRanking} />);

      // モバイル用の要素は存在するがhiddenクラスで非表示
      const prevButtons = screen.queryAllByLabelText('前へ');
      const nextButtons = screen.queryAllByLabelText('次へ');

      // ボタンは存在するが、親要素にhiddenクラスが付いている
      if (prevButtons.length > 0) {
        const mobileContainer = prevButtons[0].closest('.block.lg\\:hidden');
        expect(mobileContainer).toBeInTheDocument();
      }
    });
  });

  describe('空のランキング', () => {
    it('空のランキングでもエラーなく表示される', () => {
      render(<RankingContainer wordRanking={[]} messageRanking={[]} />);

      // タイトルは表示される
      expect(screen.getAllByText('🏆 流行語大賞 TOP10').length).toBeGreaterThan(0);
      expect(screen.getAllByText('💬 流行メッセージ TOP10').length).toBeGreaterThan(0);
    });
  });

  describe('アクセシビリティ', () => {
    it('矢印ボタンに適切なaria-labelが設定されている', () => {
      render(<RankingContainer wordRanking={mockWordRanking} messageRanking={mockMessageRanking} />);

      expect(screen.getByLabelText('前へ')).toBeInTheDocument();
      expect(screen.getByLabelText('次へ')).toBeInTheDocument();
    });

    it('インジケーターに適切なaria-labelが設定されている', () => {
      render(<RankingContainer wordRanking={mockWordRanking} messageRanking={mockMessageRanking} />);

      expect(screen.getByLabelText('1番目のランキングへ移動')).toBeInTheDocument();
      expect(screen.getByLabelText('2番目のランキングへ移動')).toBeInTheDocument();
    });
  });
});

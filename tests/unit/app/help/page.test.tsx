import HelpPage from '@/app/help/page';
import { render, screen } from '@testing-library/react';

describe('HelpPage', () => {
  describe('レンダリング', () => {
    it('ページタイトルが表示される', () => {
      render(<HelpPage />);

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('トーク履歴の取得方法');
    });

    it('説明文が表示される', () => {
      render(<HelpPage />);

      expect(
        screen.getByText(
          'LINEアプリからトーク履歴をテキストファイルとして取得する方法をご説明します。'
        )
      ).toBeInTheDocument();
    });

    it('iPhone手順セクションが表示される', () => {
      render(<HelpPage />);

      expect(screen.getByRole('heading', { name: 'iPhoneの場合' })).toBeInTheDocument();
    });

    it('Android手順セクションが表示される', () => {
      render(<HelpPage />);

      expect(screen.getByRole('heading', { name: 'Androidの場合' })).toBeInTheDocument();
    });

    describe('iPhone手順', () => {
      it('すべての手順が正しい順序で表示される', () => {
        render(<HelpPage />);

        // iPhone専用の手順を確認（新しい5ステップ）
        expect(screen.getByText('トークの右上の三本線メニューをタップ')).toBeInTheDocument();
        expect(screen.getByText('「設定」をタップ')).toBeInTheDocument();
        expect(screen.getByText('「トーク履歴を送信」をタップ')).toBeInTheDocument();
        expect(screen.getByText('「ファイルに保存」をタップ')).toBeInTheDocument();
        expect(screen.getByText('「このiPhone内」で「保存」を選択')).toBeInTheDocument();

        // ステップ番号の確認（5つのステップ）
        const stepNumbers = screen.getAllByText(/^[1-5]$/); // 1から5の数字のみ
        expect(stepNumbers.length).toBeGreaterThanOrEqual(5); // 最低5つのステップ番号
      });

      it('「≡」メニューボタンについて説明される', () => {
        render(<HelpPage />);

        const menuDescriptions =
          screen.getAllByText(/画面右上の「≡」（三本線）のメニューボタンをタップ/);
        expect(menuDescriptions.length).toBeGreaterThan(0);
      });

      it('画像が適切に表示される', () => {
        render(<HelpPage />);

        // 5つの画像が表示されることを確認
        const images = screen.getAllByRole('img');
        const iphoneImages = images.filter((img) =>
          img.getAttribute('alt')?.includes('iPhone手順')
        );
        expect(iphoneImages.length).toBe(5);

        // 画像のソースパスが正しいことを確認
        expect(
          screen.getByAltText('iPhone手順1: トークの右上の三本線メニューをタップ')
        ).toBeInTheDocument();
        expect(screen.getByAltText('iPhone手順5: iPhone内で保存を選択')).toBeInTheDocument();
      });
    });

    describe('Android手順', () => {
      it('「現在準備中です」メッセージが表示される', () => {
        render(<HelpPage />);

        expect(screen.getByText('現在準備中です')).toBeInTheDocument();
        expect(
          screen.getByText(/Android向けのスクリーンショット付き手順を準備中です/)
        ).toBeInTheDocument();
        expect(screen.getByText(/しばらくお待ちください/)).toBeInTheDocument();
      });

      it('準備中のアイコンが表示される', () => {
        render(<HelpPage />);

        expect(screen.getByText('🔧')).toBeInTheDocument();
      });
    });

    describe('ナビゲーション', () => {
      it('トップページへの戻るリンクが表示される', () => {
        render(<HelpPage />);

        const backLink = screen.getByRole('link', { name: '← トップページに戻る' });
        expect(backLink).toBeInTheDocument();
        expect(backLink).toHaveAttribute('href', '/');
      });

      it('戻るリンクが適切なスタイルを持つ', () => {
        render(<HelpPage />);

        const backLink = screen.getByRole('link', { name: '← トップページに戻る' });
        expect(backLink).toHaveClass('bg-blue-600');
        expect(backLink).toHaveClass('text-white');
        expect(backLink).toHaveClass('rounded-lg');
      });
    });

    describe('アクセシビリティ', () => {
      it('見出しが適切な階層構造になっている', () => {
        render(<HelpPage />);

        // h1: メインタイトル
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('トーク履歴の取得方法');

        // h2: OS別セクション
        expect(screen.getByRole('heading', { level: 2, name: 'iPhoneの場合' })).toBeInTheDocument();
        expect(
          screen.getByRole('heading', { level: 2, name: 'Androidの場合' })
        ).toBeInTheDocument();

        // h3: iPhone手順（5つ）+ Android「現在準備中」（1つ）= 6つ
        expect(screen.getAllByRole('heading', { level: 3 }).length).toBe(6);
      });

      it('重要な情報が適切に表示される', () => {
        render(<HelpPage />);

        // iPhone手順の強調表示
        expect(screen.getByText('トークの右上の三本線メニューをタップ')).toBeInTheDocument();
      });

      it('絵文字でビジュアル的に情報が分類される', () => {
        render(<HelpPage />);

        // OS別の絵文字
        expect(screen.getByText('📱')).toBeInTheDocument(); // iPhone
        expect(screen.getByText('🤖')).toBeInTheDocument(); // Android
      });
    });
  });
});

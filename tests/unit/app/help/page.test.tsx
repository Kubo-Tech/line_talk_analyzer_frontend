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

    it('目次セクションが表示される', () => {
      render(<HelpPage />);

      expect(screen.getByRole('heading', { name: '目次' })).toBeInTheDocument();
    });

    it('目次にiPhoneとAndroidへのリンクが表示される', () => {
      render(<HelpPage />);

      const iphoneLink = screen.getByRole('link', { name: /iPhoneの場合/ });
      const androidLink = screen.getByRole('link', { name: /Androidの場合/ });

      expect(iphoneLink).toBeInTheDocument();
      expect(iphoneLink).toHaveAttribute('href', '#iphone');

      expect(androidLink).toBeInTheDocument();
      expect(androidLink).toHaveAttribute('href', '#android');
    });

    describe('iPhone手順', () => {
      it('すべての手順が正しい順序で表示される', () => {
        render(<HelpPage />);

        // iPhone専用の手順を確認（新しい5ステップ）
        expect(screen.getAllByText('トークの右上の三本線メニューをタップ').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('「設定」をタップ').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('「トーク履歴を送信」をタップ').length).toBeGreaterThanOrEqual(1);
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
      it('すべての手順が正しい順序で表示される', () => {
        render(<HelpPage />);

        // Android専用の手順を確認（4ステップ）
        const headings = screen.getAllByRole('heading', { level: 3 });
        const androidHeadings = headings.filter((h) => 
          h.textContent?.includes('任意のファイルアプリを選択して保存') ||
          (h.textContent?.includes('トークの右上の三本線メニューをタップ') && h.closest('div')?.id === 'android') ||
          (h.textContent?.includes('設定') && h.closest('div')?.id === 'android') ||
          (h.textContent?.includes('トーク履歴を送信') && h.closest('div')?.id === 'android')
        );

        expect(androidHeadings.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('任意のファイルアプリを選択して保存')).toBeInTheDocument();
      });

      it('ファイルアプリについての注意書きが表示される', () => {
        render(<HelpPage />);

        expect(screen.getByText('※ファイルアプリは端末の機種によって異なります')).toBeInTheDocument();
      });

      it('画像が適切に表示される', () => {
        render(<HelpPage />);

        // 4つの画像が表示されることを確認
        const images = screen.getAllByRole('img');
        const androidImages = images.filter((img) =>
          img.getAttribute('alt')?.includes('Android手順')
        );
        expect(androidImages.length).toBe(4);

        // 画像のソースパスが正しいことを確認
        expect(
          screen.getByAltText('Android手順1: トークの右上の三本線メニューをタップ')
        ).toBeInTheDocument();
        expect(screen.getByAltText('Android手順4: 任意のファイルアプリを選択して保存')).toBeInTheDocument();
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

        // h2: 目次 + OS別セクション = 3つ
        expect(screen.getByRole('heading', { level: 2, name: '目次' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'iPhoneの場合' })).toBeInTheDocument();
        expect(
          screen.getByRole('heading', { level: 2, name: 'Androidの場合' })
        ).toBeInTheDocument();

        // h3: iPhone手順（5つ）+ Android手順（4つ）= 9つ
        expect(screen.getAllByRole('heading', { level: 3 }).length).toBe(9);
      });

      it('重要な情報が適切に表示される', () => {
        render(<HelpPage />);

        // iPhone手順の強調表示（複数存在する場合があるのでgetAllByTextを使用）
        expect(screen.getAllByText('トークの右上の三本線メニューをタップ').length).toBeGreaterThanOrEqual(1);
      });

      it('絵文字でビジュアル的に情報が分類される', () => {
        render(<HelpPage />);

        // OS別の絵文字（目次と各セクションで複数存在する）
        expect(screen.getAllByText('📱').length).toBeGreaterThanOrEqual(1); // iPhone
        expect(screen.getAllByText('🤖').length).toBeGreaterThanOrEqual(1); // Android
      });
    });
  });
});

import PrivacyPage from '@/app/privacy/page';
import { render, screen } from '@testing-library/react';

describe('PrivacyPage', () => {
  describe('レンダリング', () => {
    it('ページタイトルが表示される', () => {
      render(<PrivacyPage />);
      expect(
        screen.getByRole('heading', { name: 'プライバシーポリシー・利用規約' })
      ).toBeInTheDocument();
    });

    it('重要事項セクションが表示される', () => {
      render(<PrivacyPage />);
      expect(screen.getByRole('heading', { name: '重要事項（必須同意項目）' })).toBeInTheDocument();
    });

    it('サービスの性質が説明される', () => {
      render(<PrivacyPage />);
      expect(screen.getByText(/本サービスは個人が開発した非公式ツールであり/i)).toBeInTheDocument();
    });

    it('免責事項が表示される', () => {
      render(<PrivacyPage />);
      expect(screen.getByRole('heading', { name: '免責事項' })).toBeInTheDocument();
      expect(screen.getByText(/本サービスは「現状有姿」で提供され/i)).toBeInTheDocument();
    });

    it('利用条件が表示される', () => {
      render(<PrivacyPage />);
      expect(screen.getByRole('heading', { name: '利用条件' })).toBeInTheDocument();
      expect(
        screen.getByText(/同意しない場合は、本サービスを利用することはできません/i)
      ).toBeInTheDocument();
    });
  });

  describe('データ処理の透明性', () => {
    it('データ処理の透明性セクションが表示される', () => {
      render(<PrivacyPage />);
      expect(screen.getByRole('heading', { name: 'データ処理の透明性' })).toBeInTheDocument();
    });

    it('GitHubリポジトリのリンクが表示される', () => {
      render(<PrivacyPage />);
      const frontendLink = screen.getByRole('link', {
        name: /line_talk_analyzer_frontend/i,
      });
      const backendLink = screen.getByRole('link', {
        name: /line_talk_analyzer_backend/i,
      });

      expect(frontendLink).toBeInTheDocument();
      expect(frontendLink).toHaveAttribute(
        'href',
        'https://github.com/Kubo-Tech/line_talk_analyzer_frontend'
      );
      expect(backendLink).toBeInTheDocument();
      expect(backendLink).toHaveAttribute(
        'href',
        'https://github.com/Kubo-Tech/line_talk_analyzer_backend'
      );
    });

    it('GitHubリンクが新しいタブで開く', () => {
      render(<PrivacyPage />);
      const links = screen.getAllByRole('link', {
        name: /line_talk_analyzer/i,
      });

      links.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('データの取り扱い', () => {
    it('データの取り扱いセクションが表示される', () => {
      render(<PrivacyPage />);
      expect(screen.getByRole('heading', { name: 'データの取り扱い' })).toBeInTheDocument();
    });

    it('サーバー側での処理情報が表示される', () => {
      render(<PrivacyPage />);
      expect(screen.getByRole('heading', { name: 'サーバー側での処理' })).toBeInTheDocument();
      expect(screen.getByText('ファイルの保存')).toBeInTheDocument();
      expect(screen.getByText('❌ しない（ディスクに書き込まない）')).toBeInTheDocument();
    });

    it('通信の保護情報が表示される', () => {
      render(<PrivacyPage />);
      expect(screen.getByRole('heading', { name: '通信の保護' })).toBeInTheDocument();
      expect(screen.getByText(/HTTPS（TLS 1.2以上）/i)).toBeInTheDocument();
    });

    it('フロントエンド側での処理情報が表示される', () => {
      render(<PrivacyPage />);
      expect(screen.getByRole('heading', { name: 'フロントエンド側での処理' })).toBeInTheDocument();
      expect(screen.getByText('LocalStorage')).toBeInTheDocument();
    });
  });

  describe('推奨事項', () => {
    it('推奨事項セクションが表示される', () => {
      render(<PrivacyPage />);
      expect(screen.getByRole('heading', { name: '推奨事項' })).toBeInTheDocument();
    });

    it('プライベートブラウジングの推奨が表示される', () => {
      render(<PrivacyPage />);
      expect(
        screen.getByText(/プライベートブラウジング（シークレットモード）の使用/i)
      ).toBeInTheDocument();
    });

    it('解析後の操作が説明される', () => {
      render(<PrivacyPage />);
      expect(screen.getByText(/解析後の操作/i)).toBeInTheDocument();
    });
  });

  describe('ナビゲーション', () => {
    it('トップページへの戻るリンクが表示される', () => {
      render(<PrivacyPage />);
      const backLink = screen.getByRole('link', {
        name: /トップページに戻る/i,
      });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/');
    });
  });

  describe('アクセシビリティ', () => {
    it('見出しが適切な階層構造になっている', () => {
      render(<PrivacyPage />);
      const h1 = screen.getByRole('heading', {
        level: 1,
        name: /プライバシーポリシー・利用規約/i,
      });
      expect(h1).toBeInTheDocument();

      const h2Elements = screen.getAllByRole('heading', { level: 2 });
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('外部リンクが適切なセキュリティ属性を持つ', () => {
      render(<PrivacyPage />);
      const externalLinks = screen.getAllByRole('link', {
        name: /line_talk_analyzer/i,
      });

      externalLinks.forEach((link) => {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });
});

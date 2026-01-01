import Footer from '@/components/common/Footer';
import { APP_INFO } from '@/lib/constants';
import { render, screen } from '@testing-library/react';

describe('Footer', () => {
  it('正しくレンダリングされる', () => {
    render(<Footer />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('Qiitaへのリンクが表示される', () => {
    render(<Footer />);

    const qiitaLink = screen.getByRole('link', { name: 'Qiita' });
    expect(qiitaLink).toHaveAttribute('href', 'https://qiita.com/KuboTech/items/2f337b7dc5b39d88e08b');
    expect(qiitaLink).toHaveAttribute('target', '_blank');
    expect(qiitaLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('GitHubへのリンクが表示される', () => {
    render(<Footer />);

    const githubFrontendLink = screen.getByRole('link', { name: 'GitHub (Frontend)' });
    expect(githubFrontendLink).toHaveAttribute('href', APP_INFO.GITHUB_REPO_FRONTEND);
    expect(githubFrontendLink).toHaveAttribute('target', '_blank');
    expect(githubFrontendLink).toHaveAttribute('rel', 'noopener noreferrer');

    const githubBackendLink = screen.getByRole('link', { name: 'GitHub (Backend)' });
    expect(githubBackendLink).toHaveAttribute('href', APP_INFO.GITHUB_REPO_BACKEND);
    expect(githubBackendLink).toHaveAttribute('target', '_blank');
    expect(githubBackendLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('コピーライトが表示される', () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} LINE Talk Analyzer. All rights reserved.`)
    ).toBeInTheDocument();
  });

  it('免責事項が表示される', () => {
    render(<Footer />);

    expect(
      screen.getByText('本サービスはLINE株式会社およびLINEヤフー株式会社とは一切関係がありません。')
    ).toBeInTheDocument();
  });
});

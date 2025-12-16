import Footer from '@/components/common/Footer';
import { render, screen } from '@testing-library/react';

describe('Footer', () => {
  it('正しくレンダリングされる', () => {
    render(<Footer />);

    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('プライバシーポリシーへのリンクが表示される', () => {
    render(<Footer />);

    const privacyLink = screen.getByRole('link', { name: 'プライバシーポリシー' });
    expect(privacyLink).toHaveAttribute('href', '/privacy');
  });

  it('ヘルプへのリンクが表示される', () => {
    render(<Footer />);

    const helpLink = screen.getByRole('link', { name: 'ヘルプ' });
    expect(helpLink).toHaveAttribute('href', '/help');
  });

  it('GitHubへのリンクが表示される', () => {
    render(<Footer />);

    const githubLink = screen.getByRole('link', { name: 'GitHub' });
    expect(githubLink).toHaveAttribute(
      'href',
      'https://github.com/yourname/line_talk_analyzer_frontend'
    );
    expect(githubLink).toHaveAttribute('target', '_blank');
    expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
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

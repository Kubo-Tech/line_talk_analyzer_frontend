import Footer from '@/components/common/Footer';
import Header from '@/components/common/Header';
import { FileProvider } from '@/contexts/FileContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Analytics } from '@vercel/analytics/react';
import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LINE流行語大賞 | トーク履歴解析',
  description:
    'LINEのトーク履歴を解析して、あなたの1年間の流行語大賞を発表します。プライバシーを重視した安全な解析サービスです。',
  keywords: ['LINE', 'トーク履歴', '流行語', '解析', 'ランキング'],
  authors: [{ name: 'LINE Talk Analyzer' }],
  metadataBase: new URL('https://line-talk-analyzer-frontend.vercel.app'),
  openGraph: {
    title: 'LINE流行語大賞 | トーク履歴解析',
    description: 'LINEのトーク履歴を解析して、あなたの1年間の流行語大賞を発表します。',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://line-talk-analyzer-frontend.vercel.app',
    siteName: 'LINE流行語大賞',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LINE流行語大賞 | トーク履歴解析',
    description: 'LINEのトーク履歴を解析して、あなたの1年間の流行語大賞を発表します。',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="bg-background text-foreground flex min-h-screen flex-col antialiased">
        <ThemeProvider>
          <FileProvider>
            <Header />
            <main className="container mx-auto flex-1 px-4 py-8">{children}</main>
            <Footer />
          </FileProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              href="/privacy"
              className="hover:text-primary dark:hover:text-primary text-gray-600 transition-colors dark:text-gray-400"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/help"
              className="hover:text-primary dark:hover:text-primary text-gray-600 transition-colors dark:text-gray-400"
            >
              ヘルプ
            </Link>
            <a
              href="https://github.com/yourname/line_talk_analyzer_frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary dark:hover:text-primary text-gray-600 transition-colors dark:text-gray-400"
            >
              GitHub
            </a>
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-500">
            &copy; {currentYear} LINE Talk Analyzer. All rights reserved.
          </p>
          <p className="max-w-md text-center text-xs text-gray-500 dark:text-gray-500">
            本サービスはLINE株式会社およびLINEヤフー株式会社とは一切関係がありません。
          </p>
        </div>
      </div>
    </footer>
  );
}

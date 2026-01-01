'use client';

import ThemeToggle from '@/components/common/ThemeToggle';
import { useFile } from '@/contexts/FileContext';
import { getDefaultYear } from '@/types/settings';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { setUploadedFile } = useFile();
  const pathname = usePathname();
  const defaultYear = getDefaultYear();

  const handleHomeClick = async () => {
    // ヘルプページからの遷移の場合はファイルを保持
    if (pathname === '/help') {
      return;
    }
    // その他のページからトップページに戻る際にファイルをクリア
    await setUploadedFile(null);
  };

  return (
    <header className="bg-primary dark:bg-primary-dark text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            onClick={handleHomeClick}
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <span className="text-2xl font-bold">📊</span>
            <h1 className="text-xl font-bold">LINE流行語大賞 {defaultYear}</h1>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

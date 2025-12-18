import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <Link
            href="/"
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
          >
            <span className="text-2xl font-bold">📊</span>
            <h1 className="text-xl font-bold">LINE流行語大賞 2025</h1>
          </Link>
        </div>
      </div>
    </header>
  );
}

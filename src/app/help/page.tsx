import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ヘルプ | LINE流行語大賞 2025',
  description: 'LINEトーク履歴の取得方法を詳しく説明します',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">トーク履歴の取得方法</h1>
          <p className="text-lg text-gray-600">
            LINEアプリからトーク履歴をテキストファイルとして取得する方法をご説明します。
          </p>
        </div>

        {/* iPhone版の手順 */}
        <div className="mb-12 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center">
            <span className="mr-3 text-3xl">📱</span>
            <h2 className="text-2xl font-bold text-gray-900">iPhoneの場合</h2>
          </div>
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-start">
              <span className="mr-4 mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-bold text-white md:mb-0">
                1
              </span>
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-gray-900">
                  トークの右上の三本線メニューをタップ
                </h3>
                <p className="mb-3 text-gray-600">
                  解析したいトークルームを開き、画面右上の「≡」（三本線）のメニューボタンをタップします。
                </p>
                <div className="w-fit rounded-lg border bg-gray-50 p-3">
                  <Image
                    src="/images/help/iphone/iphone01.png"
                    alt="iPhone手順1: トークの右上の三本線メニューをタップ"
                    width={300}
                    height={600}
                    className="h-auto w-full max-w-sm rounded-md shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-start">
              <span className="mr-4 mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-bold text-white md:mb-0">
                2
              </span>
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-gray-900">「設定」をタップ</h3>
                <p className="mb-3 text-gray-600">表示されたメニューから「設定」をタップします。</p>
                <div className="w-fit rounded-lg border bg-gray-50 p-3">
                  <Image
                    src="/images/help/iphone/iphone02.png"
                    alt="iPhone手順2: 設定をタップ"
                    width={300}
                    height={600}
                    className="h-auto w-full max-w-sm rounded-md shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-start">
              <span className="mr-4 mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-bold text-white md:mb-0">
                3
              </span>
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-gray-900">「トーク履歴を送信」をタップ</h3>
                <p className="mb-3 text-gray-600">
                  設定画面から「トーク履歴を送信」をタップします。
                </p>
                <div className="w-fit rounded-lg border bg-gray-50 p-3">
                  <Image
                    src="/images/help/iphone/iphone03.png"
                    alt="iPhone手順3: トーク履歴を送信をタップ"
                    width={300}
                    height={600}
                    className="h-auto w-full max-w-sm rounded-md shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-start">
              <span className="mr-4 mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-bold text-white md:mb-0">
                4
              </span>
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-gray-900">「ファイルに保存」をタップ</h3>
                <p className="mb-3 text-gray-600">
                  共有オプション画面で「ファイルに保存」を選択します。
                </p>
                <div className="w-fit rounded-lg border bg-gray-50 p-3">
                  <Image
                    src="/images/help/iphone/iphone04.png"
                    alt="iPhone手順4: ファイルに保存をタップ"
                    width={300}
                    height={600}
                    className="h-auto w-full max-w-sm rounded-md shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-start">
              <span className="mr-4 mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-bold text-white md:mb-0">
                5
              </span>
              <div className="flex-1">
                <h3 className="mb-2 font-semibold text-gray-900">
                  「このiPhone内」で「保存」を選択
                </h3>
                <p className="mb-3 text-gray-600">
                  保存先選択画面で「このiPhone内」を選択し、保存します。
                </p>
                <div className="w-fit rounded-lg border bg-gray-50 p-3">
                  <Image
                    src="/images/help/iphone/iphone05.png"
                    alt="iPhone手順5: iPhone内で保存を選択"
                    width={300}
                    height={600}
                    className="h-auto w-full max-w-sm rounded-md shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Android版の手順 */}
        <div className="mb-12 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center">
            <span className="mr-3 text-3xl">🤖</span>
            <h2 className="text-2xl font-bold text-gray-900">Androidの場合</h2>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <div className="mb-3 text-4xl">🔧</div>
            <h3 className="mb-2 text-lg font-semibold text-gray-700">現在準備中です</h3>
            <p className="text-gray-600">
              Android向けのスクリーンショット付き手順を準備中です。
              <br />
              しばらくお待ちください。
            </p>
          </div>
        </div>

        {/* トップに戻るボタン */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <span className="mr-2">←</span>
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

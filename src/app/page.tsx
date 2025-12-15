export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <main className="w-full max-w-md space-y-8 text-center">
        <h1 className="text-primary text-3xl font-bold">LINE流行語大賞</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          LINEのトーク履歴を解析して
          <br />
          あなたの1年間の流行語を発表！
        </p>

        {/* TODO: PR#5でFileUploaderコンポーネントを実装 */}
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 dark:border-gray-700">
          <p className="text-gray-500">ファイルアップロード機能は後続PRで実装予定</p>
        </div>

        {/* TODO: PR#7でPrivacyConsentコンポーネントを実装 */}
        <div className="text-left">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" disabled className="h-4 w-4" />
            <span className="text-gray-500">プライバシーポリシーに同意する（後続PRで実装）</span>
          </label>
        </div>

        {/* TODO: PR#8で解析機能を実装 */}
        <button
          disabled
          className="w-full rounded-full bg-gray-300 px-6 py-3 font-semibold text-white"
        >
          解析を開始する
        </button>
      </main>
    </div>
  );
}

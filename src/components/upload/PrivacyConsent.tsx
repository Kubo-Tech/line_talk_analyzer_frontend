interface PrivacyConsentProps {
  isConsented: boolean;
  hasReadPolicy: boolean;
  onConsentChange: () => void;
  onOpenPolicy: () => void;
}

/**
 * プライバシーポリシー同意チェックボックスコンポーネント
 *
 * @param {PrivacyConsentProps} props - コンポーネントのプロパティ
 * @param {boolean} props.isConsented - 同意済みかどうか
 * @param {boolean} props.hasReadPolicy - ポリシーを読んだかどうか
 * @param {() => void} props.onConsentChange - 同意状態変更時のコールバック
 * @param {() => void} props.onOpenPolicy - ポリシーを開く時のコールバック
 */
export function PrivacyConsent({
  isConsented,
  hasReadPolicy,
  onConsentChange,
  onOpenPolicy,
}: PrivacyConsentProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={isConsented}
            onChange={onConsentChange}
            disabled={!hasReadPolicy}
            className={`mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 ${
              hasReadPolicy ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
            }`}
            aria-label="プライバシーポリシーに同意する"
          />
          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
            <button type="button" onClick={onOpenPolicy} className="text-blue-600 hover:underline dark:text-blue-400">
              プライバシーポリシー
            </button>
            に同意する
          </span>
        </label>
      </div>
    </div>
  );
}

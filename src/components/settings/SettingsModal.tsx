import { AnalysisSettings, getDefaultSettings } from '@/types/settings';
import { useEffect, useRef, useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AnalysisSettings;
  onClose: () => void;
  onApply: (settings: AnalysisSettings) => void;
}

/**
 * 解析設定モーダルコンポーネント
 */
export function SettingsModal({ isOpen, settings, onClose, onApply }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<AnalysisSettings>(settings);
  const prevIsOpenRef = useRef(isOpen);

  // モーダルが開かれたときに、propsのsettingsでlocalSettingsを初期化
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalSettings(settings);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, settings]);

  // 設定が変更されたかを計算（個別プロパティの比較）
  const hasChanges =
    localSettings.startDate !== settings.startDate ||
    localSettings.endDate !== settings.endDate ||
    localSettings.minWordLength !== settings.minWordLength ||
    localSettings.maxWordLength !== settings.maxWordLength ||
    localSettings.minMessageLength !== settings.minMessageLength ||
    localSettings.maxMessageLength !== settings.maxMessageLength ||
    localSettings.minWordCount !== settings.minWordCount ||
    localSettings.minMessageCount !== settings.minMessageCount;

  // 閉じるボタンがクリックされたときの処理
  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        '設定が反映されていません。\nこのまま閉じると変更は破棄されますが、よろしいですか？'
      );
      if (!confirmed) {
        return;
      }
    }
    onClose();
  };

  // 設定反映ボタンがクリックされたときの処理
  const handleApply = () => {
    // 空文字列の場合はデフォルト値(1)を設定し、確実に数値型にする
    const minWordLength =
      localSettings.minWordLength === '' ? 1 : Number(localSettings.minWordLength);
    const minMessageLength =
      localSettings.minMessageLength === '' ? 1 : Number(localSettings.minMessageLength);
    const minWordCount = localSettings.minWordCount === '' ? 1 : Number(localSettings.minWordCount);
    const minMessageCount =
      localSettings.minMessageCount === '' ? 1 : Number(localSettings.minMessageCount);

    const normalizedSettings: AnalysisSettings = {
      ...localSettings,
      minWordLength,
      minMessageLength,
      minWordCount,
      minMessageCount,
    };

    // バリデーション: 期間の妥当性を確認
    if (normalizedSettings.startDate && normalizedSettings.endDate) {
      const startDate = new Date(normalizedSettings.startDate);
      const endDate = new Date(normalizedSettings.endDate);

      if (startDate > endDate) {
        window.alert(
          `開始日（${normalizedSettings.startDate}）は終了日（${normalizedSettings.endDate}）以前である必要があります。`
        );
        return;
      }
    }

    // バリデーション: 最大文字数が最小文字数以上であることを確認
    if (
      normalizedSettings.maxWordLength !== null &&
      normalizedSettings.maxWordLength < minWordLength
    ) {
      window.alert(
        `単語の最大文字数（${normalizedSettings.maxWordLength}）は最小文字数（${minWordLength}）以上である必要があります。`
      );
      return;
    }

    if (
      normalizedSettings.maxMessageLength !== null &&
      normalizedSettings.maxMessageLength < minMessageLength
    ) {
      window.alert(
        `メッセージの最大文字数（${normalizedSettings.maxMessageLength}）は最小文字数（${minMessageLength}）以上である必要があります。`
      );
      return;
    }

    onApply(normalizedSettings);
    onClose();
  };

  // デフォルトに戻すボタンがクリックされたときの処理
  const handleReset = () => {
    const confirmed = window.confirm('設定をデフォルトに戻しますか？');
    if (confirmed) {
      setLocalSettings(getDefaultSettings());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold dark:text-gray-100">解析設定</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* 期間設定 */}
          <section>
            <h3 className="mb-3 text-lg font-semibold dark:text-gray-200">期間</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  開始日
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    id="startDate"
                    value={localSettings.startDate}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, startDate: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  />
                  <span className="invisible w-10 flex-shrink-0 text-sm whitespace-nowrap text-gray-600">
                    文字
                  </span>
                </div>
              </div>
              <div>
                <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  終了日
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    id="endDate"
                    value={localSettings.endDate}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, endDate: e.target.value })
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  />
                  <span className="invisible w-10 flex-shrink-0 text-sm whitespace-nowrap text-gray-600">
                    文字
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 最小文字数 */}
          <section>
            <h3 className="mb-3 text-lg font-semibold dark:text-gray-200">最小文字数</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="minWordLength"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  単語
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="minWordLength"
                    min="1"
                    value={localSettings.minWordLength}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        minWordLength: e.target.value === '' ? '' : parseInt(e.target.value),
                      })
                    }
                    onBlur={(e) => {
                      if (e.target.value === '' || parseInt(e.target.value) < 1) {
                        setLocalSettings({ ...localSettings, minWordLength: 1 });
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  />
                  <span className="w-10 flex-shrink-0 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                    文字
                  </span>
                </div>
              </div>
              <div>
                <label
                  htmlFor="minMessageLength"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  メッセージ
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="minMessageLength"
                    min="1"
                    value={localSettings.minMessageLength}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        minMessageLength: e.target.value === '' ? '' : parseInt(e.target.value),
                      })
                    }
                    onBlur={(e) => {
                      if (e.target.value === '' || parseInt(e.target.value) < 1) {
                        setLocalSettings({ ...localSettings, minMessageLength: 1 });
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  />
                  <span className="w-10 flex-shrink-0 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                    文字
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 最大文字数 */}
          <section>
            <h3 className="mb-3 text-lg font-semibold dark:text-gray-200">最大文字数</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="maxWordLength"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  単語（未指定の場合は空欄）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="maxWordLength"
                    min="1"
                    value={localSettings.maxWordLength ?? ''}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        maxWordLength: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="未指定"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  />
                  <span className="w-10 flex-shrink-0 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                    文字
                  </span>
                </div>
              </div>
              <div>
                <label
                  htmlFor="maxMessageLength"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  メッセージ（未指定の場合は空欄）
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="maxMessageLength"
                    min="1"
                    value={localSettings.maxMessageLength ?? ''}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        maxMessageLength: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="未指定"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  />
                  <span className="w-10 flex-shrink-0 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                    文字
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 最小出現回数 */}
          <section>
            <h3 className="mb-3 text-lg font-semibold dark:text-gray-200">最小出現回数</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="minWordCount"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  単語
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="minWordCount"
                    min="1"
                    value={localSettings.minWordCount}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        minWordCount: e.target.value === '' ? '' : parseInt(e.target.value),
                      })
                    }
                    onBlur={(e) => {
                      if (e.target.value === '' || parseInt(e.target.value) < 1) {
                        setLocalSettings({ ...localSettings, minWordCount: 1 });
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  />
                  <span className="w-10 flex-shrink-0 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                    回
                  </span>
                </div>
              </div>
              <div>
                <label
                  htmlFor="minMessageCount"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  メッセージ
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    id="minMessageCount"
                    min="1"
                    value={localSettings.minMessageCount}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        minMessageCount: e.target.value === '' ? '' : parseInt(e.target.value),
                      })
                    }
                    onBlur={(e) => {
                      if (e.target.value === '' || parseInt(e.target.value) < 1) {
                        setLocalSettings({ ...localSettings, minMessageCount: 1 });
                      }
                    }}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                  />
                  <span className="w-10 flex-shrink-0 text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                    回
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ボタン */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            onClick={handleReset}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
          >
            デフォルトに戻す
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleClose}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleApply}
              className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              設定反映
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

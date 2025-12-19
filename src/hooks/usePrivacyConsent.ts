import { useState } from 'react';

/**
 * プライバシーポリシー同意状態を管理するカスタムフック
 *
 * @returns {Object} 同意状態とトグル関数
 * @returns {boolean} isConsented - 同意済みかどうか
 * @returns {boolean} hasReadPolicy - ポリシーを読んだかどうか
 * @returns {() => void} toggleConsent - 同意状態を切り替える関数
 * @returns {() => void} markAsRead - ポリシーを読んだことを記録する関数
 */
export function usePrivacyConsent() {
  const [isConsented, setIsConsented] = useState(false);
  const [hasReadPolicy, setHasReadPolicy] = useState(false);

  /**
   * 同意状態を切り替える
   */
  const toggleConsent = () => {
    setIsConsented((prev) => !prev);
  };

  /**
   * ポリシーを読んだことを記録する
   */
  const markAsRead = () => {
    setHasReadPolicy(true);
  };

  return {
    isConsented,
    hasReadPolicy,
    toggleConsent,
    markAsRead,
  };
}

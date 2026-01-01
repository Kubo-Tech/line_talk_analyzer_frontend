import { useEffect, useState } from 'react';

const CONSENT_STORAGE_KEY = 'privacyConsent';
const READ_POLICY_STORAGE_KEY = 'hasReadPolicy';

/**
 * プライバシーポリシー同意状態を管理するカスタムフック
 * sessionStorageを使用してセッション内で状態を保持
 *
 * @returns {Object} 同意状態とトグル関数
 * @returns {boolean} isConsented - 同意済みかどうか
 * @returns {boolean} hasReadPolicy - ポリシーを読んだかどうか
 * @returns {() => void} toggleConsent - 同意状態を切り替える関数
 * @returns {() => void} markAsRead - ポリシーを読んだことを記録する関数
 */
export function usePrivacyConsent() {
  // 初期値は常にfalseにしてSSRとクライアントで一致させる
  const [isConsented, setIsConsented] = useState(false);
  const [hasReadPolicy, setHasReadPolicy] = useState(false);

  // マウント時にsessionStorageから値を読み込む
  useEffect(() => {
    const storedConsent = sessionStorage.getItem(CONSENT_STORAGE_KEY);
    const storedReadPolicy = sessionStorage.getItem(READ_POLICY_STORAGE_KEY);

    if (storedConsent === 'true') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorageとの同期のため必要
      setIsConsented(true);
    }
    if (storedReadPolicy === 'true') {
      setHasReadPolicy(true);
    }
  }, []);

  // isConsentedが変更されたらsessionStorageに保存
  useEffect(() => {
    const storedConsent = sessionStorage.getItem(CONSENT_STORAGE_KEY);
    const nextConsentValue = String(isConsented);

    if (storedConsent !== nextConsentValue) {
      sessionStorage.setItem(CONSENT_STORAGE_KEY, nextConsentValue);
    }
  }, [isConsented]);

  // hasReadPolicyが変更されたらsessionStorageに保存
  useEffect(() => {
    const storedReadPolicy = sessionStorage.getItem(READ_POLICY_STORAGE_KEY);
    const nextReadPolicyValue = String(hasReadPolicy);

    if (storedReadPolicy !== nextReadPolicyValue) {
      sessionStorage.setItem(READ_POLICY_STORAGE_KEY, nextReadPolicyValue);
    }
  }, [hasReadPolicy]);

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

import { AnalysisSettings, DEFAULT_SETTINGS } from '@/types/settings';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'analysis_settings';

/**
 * 解析設定を管理するカスタムフック
 */
export function useSettings() {
  const [settings, setSettings] = useState<AnalysisSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // 初回マウント時にlocalStorageから設定を読み込む
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
      }
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 設定を更新してlocalStorageに保存
  const updateSettings = useCallback((newSettings: AnalysisSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
    }
  }, []);

  // 設定をデフォルトに戻す
  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('設定のリセットに失敗しました:', error);
    }
  }, []);

  return {
    settings,
    isLoaded,
    updateSettings,
    resetSettings,
  };
}

import { renderHook, act, waitFor } from '@testing-library/react';
import { useSettings } from '@/hooks/useSettings';

// localStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useSettings', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('初期化', () => {
    it('デフォルト設定で初期化される', () => {
      const { result } = renderHook(() => useSettings());

      expect(result.current.isLoaded).toBe(true);
      expect(result.current.settings.minWordLength).toBe(1);
      expect(result.current.settings.minMessageLength).toBe(2);
      expect(result.current.settings.minWordCount).toBe(2);
      expect(result.current.settings.minMessageCount).toBe(2);
      expect(result.current.settings.maxWordLength).toBe(null);
      expect(result.current.settings.maxMessageLength).toBe(null);
    });

    it.skip('localStorageから設定を復元する', async () => {
      const savedSettings = {
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        minWordLength: 3,
        maxWordLength: 10,
        minMessageLength: 5,
        maxMessageLength: 50,
        minWordCount: 5,
        minMessageCount: 3,
      };

      localStorageMock.setItem('analysisSettings', JSON.stringify(savedSettings));

      const { result } = renderHook(() => useSettings());

      await waitFor(() => {
        expect(result.current.isLoaded).toBe(true);
        expect(result.current.settings.minWordLength).toBe(3);
        expect(result.current.settings.maxWordLength).toBe(10);
        expect(result.current.settings.minMessageLength).toBe(5);
        expect(result.current.settings.maxMessageLength).toBe(50);
        expect(result.current.settings.minWordCount).toBe(5);
        expect(result.current.settings.minMessageCount).toBe(3);
      });
    });

    it.skip('1月の場合は前年をデフォルトとする', () => {
      // 1月の日付でテスト
      const january = new Date('2025-01-15');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(global, 'Date').mockImplementation((() => january) as any);

      const { result } = renderHook(() => useSettings());

      // 2025年1月なので、前年の2024年がデフォルト
      expect(result.current.settings.startDate).toBe('2024-01-01');
      expect(result.current.settings.endDate).toBe('2024-12-31');

      jest.restoreAllMocks();
    });
  });

  describe('設定の更新', () => {
    it('updateSettingsで設定を更新できる', () => {
      const { result } = renderHook(() => useSettings());

      const newSettings = {
        ...result.current.settings,
        minWordLength: 5,
        minMessageLength: 10,
      };

      act(() => {
        result.current.updateSettings(newSettings);
      });

      expect(result.current.settings.minWordLength).toBe(5);
      expect(result.current.settings.minMessageLength).toBe(10);
    });

    it.skip('更新された設定がlocalStorageに保存される', async () => {
      const { result } = renderHook(() => useSettings());

      const newSettings = {
        ...result.current.settings,
        minWordLength: 5,
      };

      act(() => {
        result.current.updateSettings(newSettings);
      });

      await waitFor(() => {
        const saved = JSON.parse(localStorageMock.getItem('analysisSettings') || '{}');
        expect(saved.minWordLength).toBe(5);
      });
    });
  });

  describe('設定のリセット', () => {
    it('resetSettingsでデフォルト設定に戻る', () => {
      const { result } = renderHook(() => useSettings());

      // まず設定を変更
      act(() => {
        result.current.updateSettings({
          ...result.current.settings,
          minWordLength: 10,
        });
      });

      expect(result.current.settings.minWordLength).toBe(10);

      // リセット
      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings.minWordLength).toBe(1);
    });

    it.skip('リセット後もlocalStorageが更新される', async () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        result.current.updateSettings({
          ...result.current.settings,
          minWordLength: 10,
        });
      });

      act(() => {
        result.current.resetSettings();
      });

      await waitFor(() => {
        const saved = JSON.parse(localStorageMock.getItem('analysisSettings') || '{}');
        expect(saved.minWordLength).toBe(1);
      });
    });
  });

  describe('エラーハンドリング', () => {
    it('不正なlocalStorageデータの場合はデフォルト設定を使用', () => {
      localStorageMock.setItem('analysisSettings', 'invalid json');

      const { result } = renderHook(() => useSettings());

      expect(result.current.isLoaded).toBe(true);
      expect(result.current.settings.minWordLength).toBe(1);
    });
  });
});

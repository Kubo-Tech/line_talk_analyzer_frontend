import { usePrivacyConsent } from '@/hooks/usePrivacyConsent';
import { act, renderHook } from '@testing-library/react';

describe('usePrivacyConsent', () => {
  beforeEach(() => {
    // 各テスト前にsessionStorageをクリア
    sessionStorage.clear();
  });

  describe('初期状態', () => {
    it('isConsentedの初期値がfalseである', () => {
      const { result } = renderHook(() => usePrivacyConsent());

      expect(result.current.isConsented).toBe(false);
    });

    it('hasReadPolicyの初期値がfalseである', () => {
      const { result } = renderHook(() => usePrivacyConsent());

      expect(result.current.hasReadPolicy).toBe(false);
    });

    it('toggleConsent関数が提供される', () => {
      const { result } = renderHook(() => usePrivacyConsent());

      expect(typeof result.current.toggleConsent).toBe('function');
    });

    it('markAsRead関数が提供される', () => {
      const { result } = renderHook(() => usePrivacyConsent());

      expect(typeof result.current.markAsRead).toBe('function');
    });
  });

  describe('toggleConsent', () => {
    it('toggleConsentを呼ぶとisConsentedがtrueになる', () => {
      const { result } = renderHook(() => usePrivacyConsent());

      expect(result.current.isConsented).toBe(false);

      act(() => {
        result.current.toggleConsent();
      });

      expect(result.current.isConsented).toBe(true);
    });

    it('toggleConsentを2回呼ぶとisConsentedが元に戻る', () => {
      const { result } = renderHook(() => usePrivacyConsent());

      expect(result.current.isConsented).toBe(false);

      act(() => {
        result.current.toggleConsent();
      });

      expect(result.current.isConsented).toBe(true);

      act(() => {
        result.current.toggleConsent();
      });

      expect(result.current.isConsented).toBe(false);
    });

    it('toggleConsentを複数回呼んでも正しく切り替わる', () => {
      const { result } = renderHook(() => usePrivacyConsent());

      expect(result.current.isConsented).toBe(false);

      act(() => {
        result.current.toggleConsent();
        result.current.toggleConsent();
        result.current.toggleConsent();
      });

      expect(result.current.isConsented).toBe(true);
    });

    it('toggleConsentを呼ぶとsessionStorageに保存される', () => {
      const { result } = renderHook(() => usePrivacyConsent());

      act(() => {
        result.current.toggleConsent();
      });

      expect(sessionStorage.getItem('privacyConsent')).toBe('true');

      act(() => {
        result.current.toggleConsent();
      });

      expect(sessionStorage.getItem('privacyConsent')).toBe('false');
    });
  });

  describe('markAsRead', () => {
    it('markAsReadを呼ぶとhasReadPolicyがtrueになる', () => {
      const { result } = renderHook(() => usePrivacyConsent());

      expect(result.current.hasReadPolicy).toBe(false);

      act(() => {
        result.current.markAsRead();
      });

      expect(result.current.hasReadPolicy).toBe(true);
    });

    it('markAsReadを複数回呼んでもhasReadPolicyはtrueのままである', () => {
      const { result } = renderHook(() => usePrivacyConsent());

      act(() => {
        result.current.markAsRead();
        result.current.markAsRead();
      });

      expect(result.current.hasReadPolicy).toBe(true);
    });

    it('markAsReadを呼ぶとsessionStorageに保存される', () => {
      const { result } = renderHook(() => usePrivacyConsent());

      act(() => {
        result.current.markAsRead();
      });

      expect(sessionStorage.getItem('hasReadPolicy')).toBe('true');
    });
  });

  describe('SSR対応とセッション管理', () => {
    it('useEffectの実行後にsessionStorageから値が読み込まれる', async () => {
      // sessionStorageに値を設定
      sessionStorage.setItem('privacyConsent', 'true');
      sessionStorage.setItem('hasReadPolicy', 'true');

      const { result } = renderHook(() => usePrivacyConsent());

      // useEffectが実行されるまで待つ
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // useEffect実行後は値が反映される
      expect(result.current.isConsented).toBe(true);
      expect(result.current.hasReadPolicy).toBe(true);
    });

    it('同意状態がsessionStorageに保存され、再レンダリング後も保持される', async () => {
      const { result, unmount } = renderHook(() => usePrivacyConsent());

      // 同意する
      act(() => {
        result.current.markAsRead();
        result.current.toggleConsent();
      });

      expect(result.current.isConsented).toBe(true);
      expect(result.current.hasReadPolicy).toBe(true);

      // アンマウント
      unmount();

      // 再度マウント（ページリロードをシミュレート）
      const { result: result2 } = renderHook(() => usePrivacyConsent());

      // useEffectが実行されるまで待つ
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // sessionStorageから復元される
      expect(result2.current.isConsented).toBe(true);
      expect(result2.current.hasReadPolicy).toBe(true);
    });

    it('sessionStorageをクリアすると初期状態に戻る', async () => {
      const { result } = renderHook(() => usePrivacyConsent());

      // 同意する
      act(() => {
        result.current.markAsRead();
        result.current.toggleConsent();
      });

      expect(result.current.isConsented).toBe(true);

      // sessionStorageをクリア
      sessionStorage.clear();

      // 再マウント
      const { result: result2 } = renderHook(() => usePrivacyConsent());

      // useEffectが実行されるまで待つ
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 0));
      });

      // 初期状態に戻る
      expect(result2.current.isConsented).toBe(false);
      expect(result2.current.hasReadPolicy).toBe(false);
    });
  });
});

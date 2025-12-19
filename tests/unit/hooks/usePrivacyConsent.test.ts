import { usePrivacyConsent } from '@/hooks/usePrivacyConsent';
import { act, renderHook } from '@testing-library/react';

describe('usePrivacyConsent', () => {
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
  });
});

import { getDefaultYear, getDefaultSettings } from '@/types/settings';

describe('settings', () => {
  describe('getDefaultYear', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('1月の場合は前年を返す', () => {
      // 2026年1月1日にセット
      jest.setSystemTime(new Date('2026-01-01'));
      expect(getDefaultYear()).toBe(2025);
    });

    it('1月31日の場合も前年を返す', () => {
      // 2026年1月31日にセット
      jest.setSystemTime(new Date('2026-01-31'));
      expect(getDefaultYear()).toBe(2025);
    });

    it('2月1日の場合は現在の年を返す', () => {
      // 2026年2月1日にセット
      jest.setSystemTime(new Date('2026-02-01'));
      expect(getDefaultYear()).toBe(2026);
    });

    it('2月の場合は現在の年を返す', () => {
      // 2026年2月15日にセット
      jest.setSystemTime(new Date('2026-02-15'));
      expect(getDefaultYear()).toBe(2026);
    });

    it('3月の場合は現在の年を返す', () => {
      // 2026年3月1日にセット
      jest.setSystemTime(new Date('2026-03-01'));
      expect(getDefaultYear()).toBe(2026);
    });

    it('12月の場合は現在の年を返す', () => {
      // 2026年12月31日にセット
      jest.setSystemTime(new Date('2026-12-31'));
      expect(getDefaultYear()).toBe(2026);
    });

    it('異なる年でも正しく動作する', () => {
      // 2027年1月15日にセット
      jest.setSystemTime(new Date('2027-01-15'));
      expect(getDefaultYear()).toBe(2026);

      // 2027年2月1日にセット
      jest.setSystemTime(new Date('2027-02-01'));
      expect(getDefaultYear()).toBe(2027);
    });
  });

  describe('getDefaultSettings', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('1月の場合は前年の1月1日から12月31日がデフォルト期間になる', () => {
      jest.setSystemTime(new Date('2026-01-01'));
      const settings = getDefaultSettings();
      expect(settings.startDate).toBe('2025-01-01');
      expect(settings.endDate).toBe('2025-12-31');
    });

    it('2月の場合は現在の年の1月1日から12月31日がデフォルト期間になる', () => {
      jest.setSystemTime(new Date('2026-02-01'));
      const settings = getDefaultSettings();
      expect(settings.startDate).toBe('2026-01-01');
      expect(settings.endDate).toBe('2026-12-31');
    });

    it('12月の場合は現在の年の1月1日から12月31日がデフォルト期間になる', () => {
      jest.setSystemTime(new Date('2026-12-31'));
      const settings = getDefaultSettings();
      expect(settings.startDate).toBe('2026-01-01');
      expect(settings.endDate).toBe('2026-12-31');
    });

    it('デフォルト設定の値が正しい', () => {
      const settings = getDefaultSettings();
      expect(settings.minWordLength).toBe(1);
      expect(settings.maxWordLength).toBeNull();
      expect(settings.minMessageLength).toBe(2);
      expect(settings.maxMessageLength).toBeNull();
      expect(settings.minWordCount).toBe(2);
      expect(settings.minMessageCount).toBe(2);
    });

    it('複数回呼び出しても同じ結果を返す', () => {
      jest.setSystemTime(new Date('2026-01-15'));
      const settings1 = getDefaultSettings();
      const settings2 = getDefaultSettings();
      
      expect(settings1).toEqual(settings2);
    });
  });
});

/**
 * fileUtils.ts のテスト
 */

import {
  extractDateRange,
  extractWithStats,
  filterMessagesByDateRange,
  parseLineTalkHistory,
} from '@/lib/fileUtils';

describe('fileUtils', () => {
  describe('extractDateRange', () => {
    const sampleHeader = `[LINE] サンプルグループのトーク履歴
保存日時：2024/08/01 00:00

`;

    test('正常なフォーマットでの期間抽出', () => {
      const content = `${sampleHeader}2024/08/01(木)
22:12	hoge山fuga太郎	おはようございます
22:13	piyo田	こんにちは
2024/08/02(金)
09:00	foo子	よろしくお願いします
2024/08/03(土)
10:00	bar男	お疲れ様です`;

      const startDate = new Date('2024-08-02');
      const endDate = new Date('2024-08-02');
      const result = extractDateRange(content, startDate, endDate);

      expect(result).toContain('2024/08/02(金)');
      expect(result).toContain('よろしくお願いします');
      expect(result).not.toContain('2024/08/01(木)');
      expect(result).not.toContain('おはようございます');
      expect(result).not.toContain('2024/08/03(土)');
      expect(result).not.toContain('お疲れ様です');
    });

    test('ヘッダー部分の保持（タイトル、保存日時）', () => {
      const content = `${sampleHeader}2024/08/01(木)
22:12	user1	メッセージ`;

      const startDate = new Date('2024-08-01');
      const endDate = new Date('2024-08-01');
      const result = extractDateRange(content, startDate, endDate);

      expect(result).toContain('[LINE] サンプルグループのトーク履歴');
      expect(result).toContain('保存日時：2024/08/01 00:00');
    });

    test('開始日より前のデータがスキップされること', () => {
      const content = `${sampleHeader}2024/07/30(水)
10:00	user1	古いメッセージ
2024/08/01(木)
22:12	user2	新しいメッセージ`;

      const startDate = new Date('2024-08-01');
      const endDate = new Date('2024-08-31');
      const result = extractDateRange(content, startDate, endDate);

      expect(result).not.toContain('2024/07/30(水)');
      expect(result).not.toContain('古いメッセージ');
      expect(result).toContain('2024/08/01(木)');
      expect(result).toContain('新しいメッセージ');
    });

    test('終了日より後のデータが含まれないこと', () => {
      const content = `${sampleHeader}2024/08/01(木)
22:12	user1	範囲内メッセージ
2024/09/01(日)
10:00	user2	範囲外メッセージ`;

      const startDate = new Date('2024-08-01');
      const endDate = new Date('2024-08-31');
      const result = extractDateRange(content, startDate, endDate);

      expect(result).toContain('2024/08/01(木)');
      expect(result).toContain('範囲内メッセージ');
      expect(result).not.toContain('2024/09/01(日)');
      expect(result).not.toContain('範囲外メッセージ');
    });

    test('境界値の正確な処理（開始日当日、終了日当日を含む）', () => {
      const content = `${sampleHeader}2024/08/01(木)
00:00	user1	開始日の最初
2024/08/31(土)
23:59	user2	終了日の最後
2024/09/01(日)
00:00	user3	範囲外`;

      const startDate = new Date('2024-08-01');
      const endDate = new Date('2024-08-31');
      const result = extractDateRange(content, startDate, endDate);

      expect(result).toContain('開始日の最初');
      expect(result).toContain('終了日の最後');
      expect(result).not.toContain('範囲外');
    });

    test('複数の日付フォーマット対応（YYYY/MM/DD, YYYY/M/D）', () => {
      const content = `${sampleHeader}2024/8/1(木)
22:12	user1	8月1日
2024/08/02(金)
09:00	user2	8月2日
2024/8/3(土)
10:00	user3	8月3日`;

      const startDate = new Date('2024-08-01');
      const endDate = new Date('2024-08-03');
      const result = extractDateRange(content, startDate, endDate);

      expect(result).toContain('2024/8/1(木)');
      expect(result).toContain('2024/08/02(金)');
      expect(result).toContain('2024/8/3(土)');
      expect(result).toContain('8月1日');
      expect(result).toContain('8月2日');
      expect(result).toContain('8月3日');
    });

    test('該当期間にデータがない場合の処理（ヘッダーのみ返却）', () => {
      const content = `${sampleHeader}2024/08/01(木)
22:12	user1	メッセージ`;

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');
      const result = extractDateRange(content, startDate, endDate);

      expect(result).toContain('[LINE] サンプルグループのトーク履歴');
      expect(result).toContain('保存日時：2024/08/01 00:00');
      expect(result).not.toContain('メッセージ');
    });
  });

  describe('parseLineTalkHistory', () => {
    test('正常なフォーマットのパース', () => {
      const content = `[LINE] サンプルグループのトーク履歴
保存日時：2024/08/01 00:00

2024/08/01(木)
22:12	hoge山fuga太郎	おはようございます
22:14	piyo田	こんにちは
22:16	foo子	よろしくお願いします`;

      const messages = parseLineTalkHistory(content);

      expect(messages).toHaveLength(3);
      expect(messages[0]).toMatchObject({
        user: 'hoge山fuga太郎',
        content: 'おはようございます',
        time: '22:12',
      });
      expect(messages[1]).toMatchObject({
        user: 'piyo田',
        content: 'こんにちは',
        time: '22:14',
      });
      expect(messages[2]).toMatchObject({
        user: 'foo子',
        content: 'よろしくお願いします',
        time: '22:16',
      });
    });

    test('メタメッセージ（スタンプ、写真等）の除外', () => {
      const content = `[LINE] サンプルグループのトーク履歴
保存日時：2024/08/01 00:00

2024/08/01(木)
22:12	user1	通常メッセージ
22:13	user2	[スタンプ]
22:14	user3	[写真]
22:15	user4	[動画]
22:16	user5	もう一つの通常メッセージ`;

      const messages = parseLineTalkHistory(content);

      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('通常メッセージ');
      expect(messages[1].content).toBe('もう一つの通常メッセージ');
    });

    test('システムメッセージの除外', () => {
      const content = `[LINE] サンプルグループのトーク履歴
保存日時：2024/08/01 00:00

2024/08/01(木)
22:12	user1	メッセージ1
22:13		piyo田が参加しました。
22:14	user2	メッセージ2`;

      const messages = parseLineTalkHistory(content);

      expect(messages).toHaveLength(2);
      expect(messages[0].content).toBe('メッセージ1');
      expect(messages[1].content).toBe('メッセージ2');
    });

    test('空行とヘッダー行のスキップ', () => {
      const content = `[LINE] サンプルグループのトーク履歴
保存日時：2024/08/01 00:00

2024/08/01(木)

22:12	user1	メッセージ

`;

      const messages = parseLineTalkHistory(content);

      expect(messages).toHaveLength(1);
      expect(messages[0].content).toBe('メッセージ');
    });
  });

  describe('filterMessagesByDateRange', () => {
    test('期間内のメッセージのみ抽出', () => {
      const messages = [
        {
          date: new Date('2024-07-31 23:59:59'),
          time: '23:59',
          user: 'user1',
          content: '範囲外（前）',
          rawLine: '',
        },
        {
          date: new Date('2024-08-01 00:00:00'),
          time: '00:00',
          user: 'user2',
          content: '範囲内（開始）',
          rawLine: '',
        },
        {
          date: new Date('2024-08-15 12:00:00'),
          time: '12:00',
          user: 'user3',
          content: '範囲内（中間）',
          rawLine: '',
        },
        {
          date: new Date('2024-08-31 23:59:59'),
          time: '23:59',
          user: 'user4',
          content: '範囲内（終了）',
          rawLine: '',
        },
        {
          date: new Date('2024-09-01 00:00:00'),
          time: '00:00',
          user: 'user5',
          content: '範囲外（後）',
          rawLine: '',
        },
      ];

      const startDate = new Date('2024-08-01');
      const endDate = new Date('2024-08-31');
      const filtered = filterMessagesByDateRange(messages, startDate, endDate);

      expect(filtered).toHaveLength(3);
      expect(filtered[0].content).toBe('範囲内（開始）');
      expect(filtered[1].content).toBe('範囲内（中間）');
      expect(filtered[2].content).toBe('範囲内（終了）');
    });

    test('境界値の正確な処理', () => {
      const messages = [
        {
          date: new Date('2024-08-01 00:00:00'),
          time: '00:00',
          user: 'user1',
          content: '開始日の0時',
          rawLine: '',
        },
        {
          date: new Date('2024-08-31 23:59:59'),
          time: '23:59',
          user: 'user2',
          content: '終了日の23:59',
          rawLine: '',
        },
      ];

      const startDate = new Date('2024-08-01');
      const endDate = new Date('2024-08-31');
      const filtered = filterMessagesByDateRange(messages, startDate, endDate);

      expect(filtered).toHaveLength(2);
    });
  });

  describe('extractWithStats', () => {
    test('抽出前後のメッセージ数を正確に計算', () => {
      const content = `[LINE] サンプルグループのトーク履歴
保存日時：2024/08/01 00:00

2024/07/31(水)
22:00	user1	メッセージ1
2024/08/01(木)
22:12	user2	メッセージ2
22:14	user3	メッセージ3
2024/08/02(金)
09:00	user4	メッセージ4
2024/09/01(日)
10:00	user5	メッセージ5`;

      const startDate = new Date('2024-08-01');
      const endDate = new Date('2024-08-31');
      const result = extractWithStats(content, startDate, endDate);

      expect(result.originalMessageCount).toBe(5);
      expect(result.extractedMessageCount).toBe(3);
      expect(result.content).toContain('メッセージ2');
      expect(result.content).toContain('メッセージ3');
      expect(result.content).toContain('メッセージ4');
      expect(result.content).not.toContain('メッセージ1');
      expect(result.content).not.toContain('メッセージ5');
    });
  });
});

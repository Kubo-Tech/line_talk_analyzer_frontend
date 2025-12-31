interface ResultSummaryProps {
  startDate: string;
  endDate: string;
  totalMessages: number;
  totalUsers: number;
}

/**
 * 解析期間と統計情報を表示するコンポーネント
 */
export default function ResultSummary({
  startDate,
  endDate,
  totalMessages,
  totalUsers,
}: ResultSummaryProps) {
  return (
    <section className="mb-8 rounded-lg bg-gray-50 p-6 dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold dark:text-gray-100">解析情報</h2>
      <div className="space-y-2 text-sm dark:text-gray-300">
        <p>
          <span className="font-semibold">期間:</span>{' '}
          {new Date(startDate).toLocaleDateString('ja-JP')} 〜{' '}
          {new Date(endDate).toLocaleDateString('ja-JP')}
        </p>
        <p>
          <span className="font-semibold">総メッセージ数:</span> {totalMessages.toLocaleString()}件
        </p>
        <p>
          <span className="font-semibold">参加者数:</span> {totalUsers}人
        </p>
      </div>
    </section>
  );
}

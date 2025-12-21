import { render, screen } from '@testing-library/react';
import ResultSummary from '@/components/result/ResultSummary';

describe('ResultSummary', () => {
  const mockProps = {
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    totalMessages: 15000,
    totalUsers: 5,
  };

  it('タイトルを表示する', () => {
    render(<ResultSummary {...mockProps} />);
    expect(screen.getByText('解析情報')).toBeInTheDocument();
  });

  it('解析期間を正しいフォーマットで表示する', () => {
    render(<ResultSummary {...mockProps} />);
    expect(screen.getByText(/2025\/1\/1.*2025\/12\/31/)).toBeInTheDocument();
  });

  it('総メッセージ数を3桁区切りで表示する', () => {
    render(<ResultSummary {...mockProps} />);
    expect(screen.getByText(/15,000件/)).toBeInTheDocument();
  });

  it('参加者数を表示する', () => {
    render(<ResultSummary {...mockProps} />);
    expect(screen.getByText(/5人/)).toBeInTheDocument();
  });

  it('大きな数字も正しく3桁区切りで表示する', () => {
    render(<ResultSummary {...mockProps} totalMessages={1234567} />);
    expect(screen.getByText(/1,234,567件/)).toBeInTheDocument();
  });

  it('期間、メッセージ数、参加者数のラベルを表示する', () => {
    render(<ResultSummary {...mockProps} />);
    expect(screen.getByText('期間:')).toBeInTheDocument();
    expect(screen.getByText('総メッセージ数:')).toBeInTheDocument();
    expect(screen.getByText('参加者数:')).toBeInTheDocument();
  });
});

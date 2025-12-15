import '@testing-library/jest-dom';

// グローバルなモック設定
// 例: fetch のモック
global.fetch = jest.fn();

// ResizeObserver のモック（一部コンポーネントで必要）
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// IntersectionObserver のモック
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// テスト前のリセット
beforeEach(() => {
  jest.clearAllMocks();
});

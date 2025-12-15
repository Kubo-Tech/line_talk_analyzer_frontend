import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Next.js アプリのパスを指定
  dir: './',
});

const config: Config = {
  // テスト環境
  testEnvironment: 'jsdom',

  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // テストファイルのパターン
  testMatch: [
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/*.test.{ts,tsx}',
  ],

  // カバレッジ設定
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/app/layout.tsx',
  ],

  // モジュールパスエイリアス
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // カバレッジ閾値
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 80,
      statements: 80,
    },
  },

  // 詳細な出力
  verbose: true,
};

export default createJestConfig(config);

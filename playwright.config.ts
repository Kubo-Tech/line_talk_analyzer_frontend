import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E テスト設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // テストディレクトリ
  testDir: './tests/e2e',

  // テストファイルのパターン
  testMatch: '**/*.spec.ts',

  // 並列実行
  fullyParallel: true,

  // CI環境ではリトライしない
  retries: process.env.CI ? 2 : 0,

  // CI環境では並列数を制限
  workers: process.env.CI ? 1 : undefined,

  // レポーター設定
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  // 共通設定
  use: {
    // ベースURL
    baseURL: 'http://localhost:3000',

    // タイムアウト設定
    actionTimeout: 10000, // 10秒
    navigationTimeout: 15000, // 15秒

    // スクリーンショット設定
    screenshot: 'only-on-failure',

    // トレース設定
    trace: 'on-first-retry',

    // ビデオ設定
    video: 'on-first-retry',
  },

  // プロジェクト（ブラウザ）設定
  // Chromiumのみ使用（CIとローカルでの高速化のため）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile SafariとMobile Chromeは必要に応じてコメント解除
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 13'] },
    // },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // 開発サーバーの設定
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './test',
  testMatch: ['**/*.spec.ts'],
  timeout: 30_000,
  retries: 0,
  use: {
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'local',
      use: { baseURL: 'http://localhost:5173', browserName: 'chromium' },
    },
    {
      name: 'production',
      use: { baseURL: 'https://jcrose.dev', browserName: 'chromium' },
    },
  ],
})

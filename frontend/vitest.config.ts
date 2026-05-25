import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test/setup.ts'],
    exclude: ['**/node_modules/**', '**/test/security/**', '**/test/e2e/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
})

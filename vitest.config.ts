import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    setupFiles: ['./tests/ai/setup.ts'],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})

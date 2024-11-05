import path from 'node:path'

import { defineConfig, coverageConfigDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    silent: true,
    coverage: {
      exclude: ['src/index.ts', 'playground/*', ...coverageConfigDefaults.exclude],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

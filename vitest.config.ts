import path from 'node:path'

import { defineConfig, coverageConfigDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    reporters: 'verbose',
    coverage: {
      exclude: ['src/index.ts', ...coverageConfigDefaults.exclude],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

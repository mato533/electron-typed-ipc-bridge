import path from 'node:path'

import { defineConfig, coverageConfigDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    silent: true,
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      exclude: ['src/index.ts', ...coverageConfigDefaults.exclude],
      thresholds: {
        lines: 70,
        branches: 70,
        functions: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

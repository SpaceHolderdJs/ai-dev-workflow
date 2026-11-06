import process from 'node:process';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'],
    environment: 'node',
    reporters: process.env.CI ? ['default', 'github-actions'] : ['default'],
    coverage: {
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/index.ts'],
      // The boundary code is held to 100%; coverage is a floor, mutation
      // testing (stryker.config.json) is what shows the tests can fail.
      thresholds: {
        'src/tenancy/**': { lines: 100, branches: 100, functions: 100, statements: 100 },
      },
    },
  },
});
